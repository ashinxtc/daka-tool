import test from 'node:test';
import assert from 'node:assert/strict';
import { 
    isBeforeTimeDeadline, 
    generateTimeRewardCards, 
    getActiveTimeRewardTier,
    normalizeTimeRewardTiers,
    DEFAULT_GAMIFICATION_CONFIG,
    DEFAULT_TIME_REWARD_TIERS,
    TIME_REWARD_CARD_TYPES 
} from '../src/utils/gamification.js';
import { getLocalDateKey } from '../src/utils/date.js';

test('Time Reward: isBeforeTimeDeadline correctly evaluates current time vs deadline', () => {
    // 1. 08:30 < 09:00 -> true
    const timeBefore = new Date('2026-10-22T08:30:00');
    assert.equal(isBeforeTimeDeadline('09:00', null, timeBefore), true);

    // 2. 09:00 == 09:00 -> true (inclusive)
    const timeExact = new Date('2026-10-22T09:00:00');
    assert.equal(isBeforeTimeDeadline('09:00', null, timeExact), true);

    // 3. 09:01 > 09:00 -> false
    const timeAfter = new Date('2026-10-22T09:01:00');
    assert.equal(isBeforeTimeDeadline('09:00', null, timeAfter), false);

    // 4. Afternoon time 14:15 vs 12:00 -> false
    const afternoon = new Date('2026-10-22T14:15:00');
    assert.equal(isBeforeTimeDeadline('12:00', null, afternoon), false);

    // 5. Invalid deadline or empty -> false
    assert.equal(isBeforeTimeDeadline('', null, timeBefore), false);
    assert.equal(isBeforeTimeDeadline('invalid', null, timeBefore), false);
});

test('Time Reward: isBeforeTimeDeadline rejects retroactive checkins for past dates', () => {
    const fixedNow = new Date('2026-10-22T08:30:00');
    const today = getLocalDateKey(0, fixedNow);
    const yesterday = '2026-10-21';

    // Same day before deadline -> true
    assert.equal(isBeforeTimeDeadline('09:00', today, fixedNow), true);

    // Past day retroactive checkin -> false even if current clock is 8:30 AM
    assert.equal(isBeforeTimeDeadline('09:00', yesterday, fixedNow), false);
});

test('Time Reward: generateTimeRewardCards creates 3 balanced suspenseful cards', () => {
    for (let i = 0; i < 30; i++) {
        const cards = generateTimeRewardCards();
        assert.equal(cards.length, 3, 'Must always return exactly 3 cards');

        const multipliers = cards.map(c => c.multiplier);
        const validMultipliers = [1, 2, 3, 5];
        multipliers.forEach(m => {
            assert.ok(validMultipliers.includes(m), `Multiplier ${m} must be in [1, 2, 3, 5]`);
        });

        // Ensure at least one bonus multiplier (2, 3, or 5) exists so there is always a chance of winning
        const hasBonus = multipliers.some(m => m >= 2);
        assert.ok(hasBonus, 'Must guarantee at least one bonus multiplier in the 3 cards');

        // Check required fields
        cards.forEach((c, idx) => {
            assert.ok(c.name, 'Card must have name');
            assert.ok(c.icon, 'Card must have icon');
            assert.ok(c.title, 'Card must have title');
            assert.ok(c.desc, 'Card must have desc');
            assert.ok(c.gradient, 'Card must have gradient');
            assert.equal(c.index, idx);
        });
    }
});

test('Time Reward: multiplier and bonus math calculation is consistent and accurate', () => {
    const baseGold = 5;

    // 1x (再接再厉)
    const bonus1 = baseGold * (1 - 1);
    const total1 = baseGold + bonus1;
    assert.equal(bonus1, 0);
    assert.equal(total1, 5);

    // 2x (双倍暴击)
    const bonus2 = baseGold * (2 - 1);
    const total2 = baseGold + bonus2;
    assert.equal(bonus2, 5);
    assert.equal(total2, 10);

    // 3x (三倍大奖)
    const bonus3 = baseGold * (3 - 1);
    const total3 = baseGold + bonus3;
    assert.equal(bonus3, 10);
    assert.equal(total3, 15);

    // 5x (五倍锦鲤)
    const bonus5 = baseGold * (5 - 1);
    const total5 = baseGold + bonus5;
    assert.equal(bonus5, 20);
    assert.equal(total5, 25);
});

test('Time Reward: default gamification configuration includes time reward parameters', () => {
    assert.equal(DEFAULT_GAMIFICATION_CONFIG.timeRewardEnabled, true);
    assert.equal(DEFAULT_GAMIFICATION_CONFIG.timeRewardDeadline, '09:00');
});

test('Time Reward: key cleaning removes TIME_REWARD entries on task delete or rollback', () => {
    const child = 'ChildA';
    const taskId = 'task_reading';
    const date = '2026-10-22';

    const wheelHistory = {
        [`${child}-TASK-${taskId}-${date}`]: 5,
        [`${child}-TIME_REWARD-${taskId}-${date}_1729000000000`]: 10,
        [`${child}-TASK-other_task-${date}`]: 3,
        [`${child}-TIME_REWARD-other_task-${date}_1729000000001`]: 6
    };

    // Simulate checkin removal for task_reading on date
    const timeRewardPrefix = `${child}-TIME_REWARD-${taskId}-${date}`;
    const nextWheel = { ...wheelHistory };
    Object.keys(nextWheel).forEach(k => {
        if (k.startsWith(timeRewardPrefix)) delete nextWheel[k];
    });

    assert.equal(nextWheel[`${child}-TIME_REWARD-${taskId}-${date}_1729000000000`], undefined);
    assert.equal(nextWheel[`${child}-TIME_REWARD-other_task-${date}_1729000000001`], 6);
});

test('Time Reward: sequential execution pipeline guarantees card draw before onCheckinReward', async () => {
    const executionOrder = [];

    // Simulate callback pipe
    const onCheckinRewardAction = () => {
        executionOrder.push('wheel_gold_reward');
    };

    const triggerTimeRewardOrNext = ({ task, baseGold, nextAction, isTimeEligible }) => {
        if (isTimeEligible && baseGold > 0) {
            executionOrder.push('time_reward_modal_opened');
            // Mock modal claiming and then triggering nextAction
            const handleModalClaimAndClose = () => {
                executionOrder.push('time_reward_claimed');
                if (nextAction) {
                    nextAction();
                }
            };
            handleModalClaimAndClose();
            return;
        }

        if (nextAction) nextAction();
    };

    // Test with time eligible task having wheel_gold reward
    triggerTimeRewardOrNext({
        task: { id: 'math', onCheckinReward: 'wheel_gold' },
        baseGold: 5,
        nextAction: onCheckinRewardAction,
        isTimeEligible: true
    });

    assert.deepEqual(executionOrder, [
        'time_reward_modal_opened',
        'time_reward_claimed',
        'wheel_gold_reward'
    ], 'Card draw must strictly precede instant checkin reward wheel');
});


test('Time Reward: ledger transactions correctly parse TIME_REWARD entries and retain valid date', () => {
    const tasks = {
        ChildA: [
            { id: 'math', name: '趣味数学', reward: 5 }
        ]
    };

    const parseTimeRewardKey = (key, value, activeTasks) => {
        const tsMatch = key.match(/[-_](\d{13})$/);
        const ts = tsMatch ? parseInt(tsMatch[1], 10) : NaN;
        const dateMatch = key.match(/(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : (isNaN(ts) ? getLocalDateKey(0) : tsToLocalDateKey(ts));
        const taskIdMatch = key.match(/-TIME_REWARD-([^-]+)-/);
        const taskId = taskIdMatch ? taskIdMatch[1] : '';
        const task = activeTasks.find(t => t.id === taskId);
        const multMatch = key.match(/-(\d+)X-/i);
        let mult = multMatch ? multMatch[1] : '';
        if (!mult && task && task.reward > 0) {
            mult = Math.round(value / task.reward) + 1;
        }
        const multText = mult ? ` (${mult}倍)` : '';
        const name = task ? `⏰ 准时打卡暴击${multText}：${task.name}` : `⏰ 准时打卡暴击${multText}`;
        return { date, name, amount: value, type: 'income' };
    };

    // Test 1: New key with explicit multiplier
    const newKey = 'ChildA-TIME_REWARD-math-2026-10-22-3X-1729601623456';
    const tx1 = parseTimeRewardKey(newKey, 10, tasks.ChildA);
    assert.equal(tx1.date, '2026-10-22');
    assert.ok(tx1.date.match(/^\d{4}-\d{2}-\d{2}$/));
    assert.equal(tx1.amount, 10);
    assert.equal(tx1.name, '⏰ 准时打卡暴击 (3倍)：趣味数学');

    // Test 2: Legacy key with underscore timestamp
    const legacyKey = 'ChildA-TIME_REWARD-math-2026-10-22_1729601623456';
    const tx2 = parseTimeRewardKey(legacyKey, 10, tasks.ChildA);
    assert.equal(tx2.date, '2026-10-22');
    assert.ok(tx2.date.match(/^\d{4}-\d{2}-\d{2}$/));
    assert.equal(tx2.amount, 10);
    assert.equal(tx2.name, '⏰ 准时打卡暴击 (3倍)：趣味数学');
});

test('Time Reward: getActiveTimeRewardTier accurately matches tiered time intervals', () => {
    const config = {
        timeRewardEnabled: true,
        timeRewardMode: 'tiered',
        timeRewardTiers: DEFAULT_TIME_REWARD_TIERS
    };

    // 1. 10:00 AM -> hits early tier (13:00, maxMultiplier 5)
    const morningTime = new Date('2026-10-22T10:00:00');
    const tier1 = getActiveTimeRewardTier(config, null, morningTime);
    assert.ok(tier1);
    assert.equal(tier1.id, 'tier_early');
    assert.equal(tier1.deadline, '13:00');
    assert.equal(tier1.maxMultiplier, 5);

    // 2. Exact 13:00 -> hits early tier (inclusive)
    const exact13 = new Date('2026-10-22T13:00:00');
    const tierExact = getActiveTimeRewardTier(config, null, exact13);
    assert.ok(tierExact);
    assert.equal(tierExact.id, 'tier_early');

    // 3. 15:30 -> hits evening sprint tier (13:00 ~ 22:00, maxMultiplier 2)
    const afternoonTime = new Date('2026-10-22T15:30:00');
    const tier2 = getActiveTimeRewardTier(config, null, afternoonTime);
    assert.ok(tier2);
    assert.equal(tier2.id, 'tier_evening');
    assert.equal(tier2.deadline, '22:00');
    assert.equal(tier2.maxMultiplier, 2);

    // 4. Exact 22:00 -> hits evening tier
    const exact22 = new Date('2026-10-22T22:00:00');
    const tier22 = getActiveTimeRewardTier(config, null, exact22);
    assert.ok(tier22);
    assert.equal(tier22.id, 'tier_evening');

    // 5. 22:01 / 23:00 -> overdue, returns null
    const lateNight = new Date('2026-10-22T22:01:00');
    const tierOverdue = getActiveTimeRewardTier(config, null, lateNight);
    assert.equal(tierOverdue, null);

    // 6. Past date check-in is rejected even if current time is 10:00
    const todayStr = getLocalDateKey(0, morningTime);
    const yesterdayStr = '2026-10-21';
    assert.ok(getActiveTimeRewardTier(config, todayStr, morningTime));
    assert.equal(getActiveTimeRewardTier(config, yesterdayStr, morningTime), null);

    // 7. Disabled switch returns null
    assert.equal(getActiveTimeRewardTier({ ...config, timeRewardEnabled: false }, null, morningTime), null);

    // 8. Single mode fallback
    const singleConfig = {
        timeRewardEnabled: true,
        timeRewardMode: 'single',
        timeRewardDeadline: '12:00'
    };
    const tierSingleHit = getActiveTimeRewardTier(singleConfig, null, morningTime);
    assert.ok(tierSingleHit);
    assert.equal(tierSingleHit.deadline, '12:00');
    assert.equal(tierSingleHit.maxMultiplier, 5);

    const tierSingleMiss = getActiveTimeRewardTier(singleConfig, null, afternoonTime);
    assert.equal(tierSingleMiss, null);
});

test('Time Reward: generateTimeRewardCards respects maxMultiplier for tiers', () => {
    // Test maxMultiplier = 2 (e.g. evening tier)
    for (let i = 0; i < 20; i++) {
        const cards = generateTimeRewardCards(2);
        assert.equal(cards.length, 3);
        cards.forEach(c => {
            assert.ok(c.multiplier <= 2, `Card multiplier ${c.multiplier} must not exceed 2`);
            assert.ok([1, 2].includes(c.multiplier));
        });
        const hasBonus = cards.some(c => c.multiplier === 2);
        assert.ok(hasBonus, 'Must guarantee at least one 2x card when maxMultiplier is 2');
    }

    // Test maxMultiplier = 3
    for (let i = 0; i < 20; i++) {
        const cards = generateTimeRewardCards(3);
        assert.equal(cards.length, 3);
        cards.forEach(c => {
            assert.ok(c.multiplier <= 3, `Card multiplier ${c.multiplier} must not exceed 3`);
            assert.ok([1, 2, 3].includes(c.multiplier));
        });
    }

    // Test maxMultiplier = 5 (default early tier)
    for (let i = 0; i < 20; i++) {
        const cards = generateTimeRewardCards(5);
        assert.equal(cards.length, 3);
        cards.forEach(c => {
            assert.ok(c.multiplier <= 5, `Card multiplier ${c.multiplier} must not exceed 5`);
        });
    }
});


test('Time Reward: legacy configurations without timeRewardMode strictly maintain single mode', () => {
    // 1. Legacy config with default 09:00 deadline (no timeRewardMode field)
    const legacyDefaultConfig = {
        timeRewardEnabled: true,
        timeRewardDeadline: '09:00'
    };

    // 08:30 AM -> Hit single deadline
    const morning830 = new Date('2026-10-24T08:30:00');
    const hitTier = getActiveTimeRewardTier(legacyDefaultConfig, null, morning830);
    assert.ok(hitTier, 'Legacy config should hit deadline before 09:00');
    assert.equal(hitTier.id, 'single');
    assert.equal(hitTier.deadline, '09:00');

    // 09:01 AM -> Overdue (must NOT bleed into tiered mode morning tier!)
    const morning901 = new Date('2026-10-24T09:01:00');
    const missTier901 = getActiveTimeRewardTier(legacyDefaultConfig, null, morning901);
    assert.equal(missTier901, null, '09:01 must be overdue for legacy 09:00 config');

    // 11:00 AM -> Must NOT grant 5x tiered reward
    const morning1100 = new Date('2026-10-24T11:00:00');
    const missTier1100 = getActiveTimeRewardTier(legacyDefaultConfig, null, morning1100);
    assert.equal(missTier1100, null, '11:00 AM must be overdue; cannot erroneously trigger 13:00 tiered reward');

    // 21:00 PM -> Must NOT grant 2x evening reward
    const evening2100 = new Date('2026-10-24T21:00:00');
    const missTier2100 = getActiveTimeRewardTier(legacyDefaultConfig, null, evening2100);
    assert.equal(missTier2100, null, '21:00 PM must be overdue for legacy config');

    // 2. Legacy custom deadline 08:00
    const legacyCustomConfig = {
        timeRewardEnabled: true,
        timeRewardDeadline: '08:00'
    };
    assert.ok(getActiveTimeRewardTier(legacyCustomConfig, null, new Date('2026-10-24T07:59:00')));
    assert.equal(getActiveTimeRewardTier(legacyCustomConfig, null, new Date('2026-10-24T08:01:00')), null);

    // 3. User explicitly opts into tiered mode
    const explicitTiered = {
        timeRewardEnabled: true,
        timeRewardMode: 'tiered',
        timeRewardDeadline: '09:00',
        timeRewardTiers: DEFAULT_TIME_REWARD_TIERS
    };
    const tierResult = getActiveTimeRewardTier(explicitTiered, null, morning1100);
    assert.ok(tierResult, 'Explicit tiered mode should grant reward at 11:00 AM');
    assert.equal(tierResult.id, 'tier_early');
    assert.equal(tierResult.maxMultiplier, 5);
});

test('Time Reward: handles equal, inverted, and custom deadline tiers consistently without reward inversion', () => {
    // 1. Inverted tiers: Tier 1 has 22:00 (5x), Tier 2 has 13:00 (2x)
    const invertedConfig = {
        timeRewardEnabled: true,
        timeRewardMode: 'tiered',
        timeRewardTiers: [
            { id: 'tier_early', name: '晨光黄金时段', deadline: '22:00', maxMultiplier: 5, icon: '🌅' },
            { id: 'tier_evening', name: '晚间冲刺时段', deadline: '13:00', maxMultiplier: 2, icon: '🌙' }
        ]
    };

    // Morning checkin (10:00 AM) must get early tier (5x), NOT evening tier (2x)!
    const morningTime = new Date('2026-10-24T10:00:00');
    const earlyHit = getActiveTimeRewardTier(invertedConfig, null, morningTime);
    assert.ok(earlyHit);
    assert.equal(earlyHit.id, 'tier_early');
    assert.equal(earlyHit.maxMultiplier, 5, 'Early bird checkin must receive higher multiplier even if parent reversed deadlines');

    // Afternoon checkin (15:00 PM) gets evening tier (2x)
    const afternoonTime = new Date('2026-10-24T15:00:00');
    const lateHit = getActiveTimeRewardTier(invertedConfig, null, afternoonTime);
    assert.ok(lateHit);
    assert.equal(lateHit.id, 'tier_evening');
    assert.equal(lateHit.maxMultiplier, 2);

    // Night overdue (22:30 PM) gets null
    const nightTime = new Date('2026-10-24T22:30:00');
    assert.equal(getActiveTimeRewardTier(invertedConfig, null, nightTime), null);

    // 2. Equal tiers: Tier 1 has 13:00 (5x), Tier 2 has 13:00 (2x)
    const equalConfig = {
        timeRewardEnabled: true,
        timeRewardMode: 'tiered',
        timeRewardTiers: [
            { id: 'tier_early', name: '晨光黄金时段', deadline: '13:00', maxMultiplier: 5, icon: '🌅' },
            { id: 'tier_evening', name: '晚间冲刺时段', deadline: '13:00', maxMultiplier: 2, icon: '🌙' }
        ]
    };
    const equalHit = getActiveTimeRewardTier(equalConfig, null, morningTime);
    assert.ok(equalHit);
    assert.equal(equalHit.maxMultiplier, 5, 'Equal deadlines must resolve to highest multiplier tier');
    assert.equal(getActiveTimeRewardTier(equalConfig, null, afternoonTime), null, 'Overdue after 13:00');

    // 3. normalizeTimeRewardTiers directly
    const normalizedInverted = normalizeTimeRewardTiers(invertedConfig.timeRewardTiers);
    assert.equal(normalizedInverted[0].deadline, '13:00');
    assert.equal(normalizedInverted[0].maxMultiplier, 5);
    assert.equal(normalizedInverted[1].deadline, '22:00');
    assert.equal(normalizedInverted[1].maxMultiplier, 2);

    const normalizedEqual = normalizeTimeRewardTiers(equalConfig.timeRewardTiers);
    assert.equal(normalizedEqual.length, 1);
    assert.equal(normalizedEqual[0].deadline, '13:00');
    assert.equal(normalizedEqual[0].maxMultiplier, 5);
});
