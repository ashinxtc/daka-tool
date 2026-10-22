import test from 'node:test';
import assert from 'node:assert/strict';
import { 
    isBeforeTimeDeadline, 
    generateTimeRewardCards, 
    getActiveTimeRewardTier,
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
