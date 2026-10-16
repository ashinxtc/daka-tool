import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDeductions, pendingNotices, mergeReceipts, freezeEscrow, mergeEscrows, escrowRecords,
    escrowSummary, settleEscrows, projectAccounting, reconcileDeductionStats } from '../src/utils/accounting.js';
const child = '孩子';
const balance = h => Math.max(0, 100 + Object.values(h).reduce((a,b) => a+b,0));
const action = (id, amount=10, extra={}) => ({ id, amount, targetChild: child, operatorRole: '爸爸',
    reason: `事由${id}`, timestamp: 1792100000000 + id, type: 'deduction', status: 'pending', ...extra });
const apply = (actions, state={}) => applyDeductions({ actions, child, balance, ...state });
const freeze = (escrows={}, id='penalty1', amount=20, extra={}) => freezeEscrow({ escrows, child, penaltyKey: id,
    amount, today:'2026-10-16', deadlineDate:'2026-10-17', timestamp:1000, returnRate:100, ...extra });
const settle = (escrows, extra={}) => settleEscrows({ escrows, child, today:'2026-10-17', star:1, enabled:true, now:2000, ...extra });

test('batch deductions render in time order with independent amounts/reasons/balances', () => {
    const result = apply([action(3,5), action(1,10), action(2,25)]);
    assert.deepEqual(pendingNotices(result.receipts,child).map(r=>[r.amount,r.reason,r.balanceAfter]),
        [[10,'事由1',90],[25,'事由2',65],[5,'事由3',60]]);
    assert.equal(result.stats[child].total_spent,40);
    assert.equal(pendingNotices(result.receipts,'另一个孩子').length,0);
});
test('duplicate IDs, serialized reload, reconnect, and changed timestamp replay execute once', () => {
    const first = apply([action(1),action(1)]);
    const replay = apply([action(1,10,{timestamp:999})],JSON.parse(JSON.stringify(first)));
    assert.deepEqual(replay.history,first.history);
    assert.deepEqual(replay.stats,first.stats);
    assert.equal(Object.keys(replay.receipts).length,1);
});
test('acknowledged notices never reappear after bidirectional merge', () => {
    const first = apply([action(1),action(2)]).receipts;
    const ack = JSON.parse(JSON.stringify(first));
    ack[Object.keys(ack)[0]].acknowledged=true;
    const merged = mergeReceipts(first,ack);
    assert.deepEqual(merged,mergeReceipts(ack,first));
    assert.equal(pendingNotices(merged,child).length,1);
    assert.deepEqual(mergeReceipts(merged,first),merged);
});
test('legacy ledger is reused without duplicate spending or fabricated historical balance', () => {
    const first = apply([action(1)]);
    const migrated = apply([action(1)],{history:first.history,stats:{[child]:{total_spent:10}}});
    assert.equal(migrated.stats[child].total_spent,10);
    assert.equal(pendingNotices(migrated.receipts,child)[0].balanceAfter,null);
});
test('invalid, unauthorized, missing ID and other-child commands cannot debit', () => {
    const actions=[action(1,10,{operatorDeviceId:'intruder'}), action(2,0,{operatorDeviceId:'ok'}),
        action(3,1.5,{operatorDeviceId:'ok'}),action(undefined),action(4,10,{targetChild:'另一人'})];
    const result=apply(actions,{devices:[{deviceId:'ok'}]});
    assert.deepEqual(result.history,{});
    assert.equal(result.actions[0].status,'rejected_unauthorized');
    assert.equal(result.actions[1].status,'rejected_invalid');
    assert.equal(result.actions[4].status,'pending');
});
test('red packet/extra wheel commands are left for existing handlers', () => {
    const actions=[action(1,10,{type:'red_packet'}),action(2,10,{type:'extra_wheel'})];
    assert.deepEqual(apply(actions).actions,actions);
});
test('missing timestamp uses stable ledger key across devices and balance is floored', () => {
    const a=apply([action(1,150,{timestamp:undefined,type:'parent_deduct'})]);
    const b=apply([action(1,150,{timestamp:undefined,type:'parent_deduct'})]);
    assert.deepEqual(a.history,b.history);
    assert.equal(pendingNotices(a.receipts,child)[0].balanceAfter,0);
});
test('sequential penalties preserve both contracts and refund both', () => {
    const escrows=freeze(freeze(),'penalty2',30);
    assert.equal(escrowSummary(escrows[child]).frozenGold,50);
    const result=settle(escrows);
    assert.equal(result.returned,50);
    const history=projectAccounting({}, {}, result.escrows);
    assert.equal(Object.keys(history).length,4);
    assert.equal(Object.values(history).reduce((a,b)=>a+b,0),0);
    assert.equal(escrowSummary(result.escrows[child]).returnedGold,50);
});
test('repeated freeze and redemption use stable transaction identities', () => {
    const first=freeze();
    assert.deepEqual(freeze(first),first);
    const result=settle(first);
    assert.equal(settle(result.escrows,{now:3000}).changed,false);
});
test('deadline is inclusive; expiry happens even when auto/redemption disabled or stars reached', () => {
    assert.equal(settle(freeze()).returned,20);
    for(const enabled of [true,false]) {
        const result=settle(freeze(),{today:'2026-10-18',enabled});
        assert.equal(result.returned,0);
        assert.equal(escrowSummary(result.escrows[child]).status,'forfeited');
    }
});
test('two offline devices redeem same contract into exactly one merged credit', () => {
    const frozen=freeze();
    const a=settle(frozen,{now:2000}).escrows,b=settle(frozen,{now:3000}).escrows;
    const merged=mergeEscrows(a,b);
    assert.deepEqual(merged,mergeEscrows(b,a));
    const history=projectAccounting({...projectAccounting({}, {}, a),...projectAccounting({}, {}, b)}, {}, merged);
    assert.equal(Object.keys(history).filter(k=>k.includes('ESCROW_REDEEM')).length,1);
    assert.equal(balance(history),100);
});
test('concurrent different draws converge in either merge order and repair ledger amounts', () => {
    const a=settle(freeze({},'same',20)).escrows,b=settle(freeze({},'same',50)).escrows;
    const ab=mergeEscrows(a,b),ba=mergeEscrows(b,a);
    assert.deepEqual(ab,ba);
    assert.deepEqual(mergeEscrows(ab,a),ab);
    assert.equal(Object.values(projectAccounting({}, {}, ab)).reduce((a,b)=>a+b,0),0);
});
test('valid redemption wins over stale pending/expiry, expired redemption is rejected', () => {
    const pending=freeze(),valid=settle(pending).escrows;
    const expired=settle(pending,{today:'2026-10-18'}).escrows;
    assert.equal(escrowSummary(mergeEscrows(valid,expired)[child]).status,'redeemed');
    const invalid=JSON.parse(JSON.stringify(valid));
    invalid[child].records.penalty1.redeemedDate='2026-10-18';
    const merged=mergeEscrows(invalid,expired);
    assert.notEqual(escrowSummary(merged[child]).status,'redeemed');
    assert.equal(Object.keys(projectAccounting(projectAccounting({}, {}, invalid), {}, merged)).filter(k=>k.includes('ESCROW_REDEEM')).length,0);
});
test('legacy pending contract refunds once without inserting another frozen debit', () => {
    const legacy={ [child]:{penaltyKey:'legacy',status:'pending',frozenGold:20,deadlineDate:'2026-10-17'} };
    const result=settle(legacy);
    const history=projectAccounting({'孩子-ESCROW_FROZEN-old':-20}, {},result.escrows);
    assert.equal(Object.keys(history).filter(k=>k.includes('FROZEN')).length,1);
    assert.equal(Object.values(history).reduce((a,b)=>a+b,0),0);
});
test('partial return rate is locked per contract and reflected in returned amount', () => {
    const result=settle(freeze({},'partial',30,{returnRate:50}),{returnRate:100});
    assert.equal(result.returned,15);
    assert.equal(escrowSummary(result.escrows[child]).returnedGold,15);
});
test('stats contribution can be reconciled repeatedly without double increments', () => {
    const receipts=mergeReceipts(apply([action(1)]).receipts,apply([action(2,20)]).receipts);
    const stats=reconcileDeductionStats({[child]:{total_spent:120,parent_deduction_spent:20}},receipts);
    assert.equal(stats[child].total_spent,130);
    assert.deepEqual(reconcileDeductionStats(stats,receipts),stats);
});
