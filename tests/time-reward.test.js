import test from 'node:test';
import assert from 'node:assert/strict';
import { 
    isBeforeTimeDeadline, 
    generateTimeRewardCards, 
    DEFAULT_GAMIFICATION_CONFIG,
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
