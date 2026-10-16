import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyParentDeduction, mergeDeductionReceipts, nextDeductionNotice } from '../src/utils/parentDeductions.js';
const action = (id, amount = 10) => ({ id, amount, type: 'deduction', targetChild: '孩子', timestamp: 100 + id, reason: `事由${id}`, operatorRole: '爸爸' });
function execute(actions, receipts = {}, history = {}) {
    let spent = 0;
    for (const a of actions) {
        const result = applyParentDeduction({ action: a, child: '孩子', receipts, history,
            balance: Math.max(0, 100 + Object.values(history).reduce((a, b) => a + b, 0)) });
        if (!result) continue;
        ({ receipts, history } = result);
        if (result.newlyApplied) spent += result.receipt.amount;
    }
    return { receipts, history, spent };
}
test('same sync preserves each amount, reason and sequential balance', () => {
    const { receipts, history, spent } = execute([action(1, 10), action(2, 25), action(3, 5)]);
    assert.equal(spent, 40);
    assert.equal(Object.keys(history).length, 3);
    const seen = [];
    for (let notice; (notice = nextDeductionNotice(receipts, '孩子'));) {
        seen.push([notice.amount, notice.reason, notice.balanceAfter]);
        receipts[notice.id] = { ...notice, acknowledged: true };
    }
    assert.deepEqual(seen, [[10, '事由1', 90], [25, '事由2', 65], [5, '事由3', 60]]);
});
test('duplicate batch, refresh and stale pending replay do not spend again', () => {
    const first = execute([action(1), action(1), action(2)]);
    assert.equal(first.spent, 20);
    const restored = JSON.parse(JSON.stringify(first));
    const replay = execute([action(1), action(2)], restored.receipts, restored.history);
    assert.equal(replay.spent, 0);
    assert.deepEqual(replay.history, first.history);
    assert.equal(Object.keys(replay.receipts).length, 2);
});
test('reconnect merges unseen receipts and never resurrects acknowledged ones', () => {
    const first = execute([action(1)]).receipts;
    const offline = JSON.parse(JSON.stringify(first));
    first[Object.keys(first)[0]].acknowledged = true;
    const second = execute([action(2)], offline).receipts;
    for (const merged of [mergeDeductionReceipts(first, second), mergeDeductionReceipts(second, first)]) {
        assert.equal(nextDeductionNotice(merged, '孩子').amount, 10);
        assert.equal(nextDeductionNotice(merged, '孩子').reason, '事由2');
        assert.equal(nextDeductionNotice(merged, '其他孩子'), null);
    }
});
test('legacy ledger guard avoids repeating statistics and repairs missing ledger from receipt', () => {
    const first = execute([action(1)]);
    const legacy = execute([action(1)], {}, first.history);
    assert.equal(legacy.spent, 0);
    const repaired = execute([action(1)], first.receipts, {});
    assert.equal(repaired.spent, 0);
    assert.deepEqual(repaired.history, first.history);
});
test('unidentified commands do not execute; zero floor and alias are supported', () => {
    assert.equal(applyParentDeduction({ action: { amount: 20 }, child: '孩子', receipts: {}, history: {}, balance: 10 }), null);
    const result = execute([{ ...action(1, 150), type: 'parent_deduct' }]);
    assert.equal(nextDeductionNotice(result.receipts, '孩子').balanceAfter, 0);
});
