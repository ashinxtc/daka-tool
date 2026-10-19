import test from 'node:test';
import assert from 'node:assert/strict';
import {
    makeCheckinTombstoneKey,
    parseCheckinTombstoneKey,
    isHistoryKeyTombstoned,
    mergeCheckinsRecord,
    mergeCheckinTombstonesRecord
} from '../src/utils/checkinSync.js';

test('Tombstone Keys: formats and parses keys with and without session timestamps', () => {
    // 基础键：taskId::date
    const key1 = makeCheckinTombstoneKey('task-123', '2026-10-19');
    assert.equal(key1, 'task-123::2026-10-19');
    const parsed1 = parseCheckinTombstoneKey(key1);
    assert.equal(parsed1.taskId, 'task-123');
    assert.equal(parsed1.date, '2026-10-19');
    assert.equal(parsed1.sessionTs, null);

    // 多次打卡子会话键：taskId::date::sessionTs
    const key2 = makeCheckinTombstoneKey('task_reading_abc', '2026-10-19', 1729339200000);
    assert.equal(key2, 'task_reading_abc::2026-10-19::1729339200000');
    const parsed2 = parseCheckinTombstoneKey(key2);
    assert.equal(parsed2.taskId, 'task_reading_abc');
    assert.equal(parsed2.date, '2026-10-19');
    assert.equal(parsed2.sessionTs, '1729339200000');

    // 边界输入容错
    assert.equal(makeCheckinTombstoneKey('', '2026-10-19'), '');
    assert.equal(makeCheckinTombstoneKey('task-1', ''), '');
    assert.deepEqual(parseCheckinTombstoneKey(''), { taskId: '', date: '', sessionTs: null });
});

test('Reward History Tombstone Filtering: flags deleted check-in rewards and prevents resurrection', () => {
    const now = Date.now();
    const tombstones = {
        '小明': {
            'task-1::2026-10-19': now - 1000,
            'task-2::2026-10-19::1729330000000': now - 2000,
            'old-task::2026-09-01': now - 35 * 86400000 // 超过30天已过期
        }
    };

    // 1. 普通打卡奖励（TASK）
    assert.equal(isHistoryKeyTombstoned('小明-TASK-task-1-2026-10-19', tombstones, now), true);
    assert.equal(isHistoryKeyTombstoned('小明-TASK-task-1-2026-10-19_12345', tombstones, now), true);

    // 2. 星星奖励（STAR_CHECKIN）
    assert.equal(isHistoryKeyTombstoned('小明-STAR_CHECKIN-task-1-2026-10-19', tombstones, now), true);

    // 3. 连击奖励（COMBO_BONUS）
    assert.equal(isHistoryKeyTombstoned('小明-COMBO_BONUS-task-1-2026-10-19', tombstones, now), true);

    // 4. 多次打卡奖励（BONUS_MULTI）
    assert.equal(isHistoryKeyTombstoned('小明-BONUS_MULTI-task-1-2026-10-19', tombstones, now), true);

    // 5. 单个 sessionTs 精准匹配
    assert.equal(isHistoryKeyTombstoned('小明-TASK-task-2-2026-10-19_1729330000000', tombstones, now), true);
    assert.equal(isHistoryKeyTombstoned('小明-TASK-task-2-2026-10-19_1729339999999', tombstones, now), false);

    // 6. 其他未删除任务或未删除日期的流水不被影响
    assert.equal(isHistoryKeyTombstoned('小明-TASK-task-3-2026-10-19', tombstones, now), false);
    assert.equal(isHistoryKeyTombstoned('小明-TASK-task-1-2026-10-18', tombstones, now), false);
    assert.equal(isHistoryKeyTombstoned('小红-TASK-task-1-2026-10-19', tombstones, now), false);

    // 7. 超过30天墓碑已过期，不误判
    assert.equal(isHistoryKeyTombstoned('小明-TASK-old-task-2026-09-01', tombstones, now), false);
});

test('Check-in Sync: prevents deleted check-ins from resurrecting from cloud and triggers cloud purge', () => {
    const now = Date.now();
    // 场景：PC 本地删除了 task-1 在 2026-10-19 的打卡，生成了墓碑
    const deletedTombstones = {
        '小明': {
            'task-1::2026-10-19': now - 500
        }
    };

    // PC 本地打卡记录中已无 task-1（2026-10-19）
    const localCheckins = {
        '小明': {
            'task-2': { '2026-10-19': 1 }
        }
    };

    // 云端/iPad 仍有 task-1 历史打卡
    const cloudCheckins = {
        '小明': {
            'task-1': { '2026-10-19': 1 },
            'task-2': { '2026-10-19': 1 }
        }
    };

    const { merged, localChanged, cloudChanged } = mergeCheckinsRecord(
        localCheckins,
        cloudCheckins,
        deletedTombstones,
        {},
        now
    );

    // 结果：已删除的 task-1 绝不复活
    assert.equal(merged['小明']['task-1'], undefined);
    assert.equal(merged['小明']['task-2']['2026-10-19'], 1);

    // 标记云端需要清理（cloudChanged = true），从而驱动云端删除该残留打卡
    assert.equal(cloudChanged, true);
    // 本地已经是最新删除状态，无需变更
    assert.equal(localChanged, false);
});

test('Multi-Checkin Session Tombstone: accurately deletes only the tombstoned session', () => {
    const now = Date.now();
    const session1 = 1729331000000;
    const session2 = 1729332000000;

    const deletedTombstones = {
        '小明': {
            [`multi_task::2026-10-19::${session1}`]: now - 100
        }
    };

    const localCheckins = {
        '小明': {
            'multi_task': {
                '2026-10-19': [{ t: session2, m: 20 }]
            }
        }
    };

    const cloudCheckins = {
        '小明': {
            'multi_task': {
                '2026-10-19': [{ t: session1, m: 15 }, { t: session2, m: 20 }]
            }
        }
    };

    const { merged, cloudChanged } = mergeCheckinsRecord(
        localCheckins,
        cloudCheckins,
        deletedTombstones,
        {},
        now
    );

    // session1 被墓碑过滤，session2 正常保留
    const sessions = merged['小明']['multi_task']['2026-10-19'];
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].t, session2);
    assert.equal(cloudChanged, true);
});

test('Tombstone Semantic Merger: syncs tombstones across devices and auto-prunes upon re-checkin', () => {
    const now = Date.now();
    const localTombstones = {
        '小明': {
            'task-1::2026-10-19': now - 2000
        }
    };
    const cloudTombstones = {
        '小明': {
            'task-2::2026-10-19': now - 1000,
            'task-expired::2026-08-01': now - 35 * 86400000
        }
    };

    // 场景 A：无活跃打卡，两台设备的墓碑正常并集合并，过期墓碑被清理
    const resultA = mergeCheckinTombstonesRecord(
        localTombstones,
        cloudTombstones,
        {},
        {},
        {},
        now
    );

    assert.equal(resultA.merged['小明']['task-1::2026-10-19'], now - 2000);
    assert.equal(resultA.merged['小明']['task-2::2026-10-19'], now - 1000);
    assert.equal(resultA.merged['小明']['task-expired::2026-08-01'], undefined, '过期墓碑应被清理');

    // 场景 B：用户重新在当天对 task-1 打了卡（active check-in），墓碑必须被自动清除
    const activeCheckins = {
        '小明': {
            'task-1': { '2026-10-19': 1 }
        }
    };

    const resultB = mergeCheckinTombstonesRecord(
        localTombstones,
        cloudTombstones,
        activeCheckins,
        {},
        {},
        now
    );

    assert.equal(resultB.merged['小明']['task-1::2026-10-19'], undefined, '重新打卡后墓碑必须被自动消除');
    assert.equal(resultB.merged['小明']['task-2::2026-10-19'], now - 1000);
});
