import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getComebackSafeDates } from '../src/utils/gamification.js';
import { freezeEscrow, settleEscrows, mergeEscrows, projectAccounting } from '../src/utils/accounting.js';

const child = '测试孩子';
const pending = () => freezeEscrow({ escrows: {}, child, penaltyKey: 'safe-day', amount: 20,
    today: '2026-10-16', deadlineDate: '2026-10-17', timestamp: 1000, reason: '测试契约' });
const redeem = escrows => settleEscrows({ escrows, child, today: '2026-10-17', star: 1,
    enabled: true, now: new Date(2026, 9, 17, 12).getTime() }).escrows;

test('comeback protection survives stale sync, JSON reload and repeat settlement without extra refund', () => {
    const before = pending(), after = redeem(before);
    const merged = JSON.parse(JSON.stringify(mergeEscrows(before, after)));
    assert.deepEqual(merged, mergeEscrows(after, before));
    assert.deepEqual(getComebackSafeDates(merged[child]).sort(), ['2026-10-16', '2026-10-17']);
    assert.deepEqual(redeem(merged), merged);
    const ledger = projectAccounting({}, {}, merged);
    assert.equal(Object.keys(ledger).length, 2);
    assert.equal(Object.values(ledger).reduce((a, b) => a + b, 0), 0);
});

test('legacy redeemed contract and migrated record expose the same safe dates', () => {
    const legacy = { status: 'redeemed', createdDate: '2026-10-16', redeemedDate: '2026-10-17', frozenGold: 20 };
    assert.deepEqual(getComebackSafeDates(legacy).sort(), ['2026-10-16', '2026-10-17']);
    const migrated = mergeEscrows({ [child]: legacy }, {});
    assert.deepEqual(getComebackSafeDates(migrated[child]), getComebackSafeDates(legacy));
    assert.deepEqual(getComebackSafeDates(pending()[child]), []);
});

test('safe-date history from both devices is retained by bidirectional escrow merge', () => {
    const a = redeem(pending()), b = JSON.parse(JSON.stringify(a));
    a[child].records['safe-day'].redeemedDates.push('2026-10-14');
    b[child].records['safe-day'].redeemedDates.push('2026-10-15');
    const merged = mergeEscrows(a, b);
    assert.deepEqual(getComebackSafeDates(merged[child]).sort(),
        ['2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17']);
    assert.deepEqual(merged, mergeEscrows(b, a));
    assert.deepEqual(mergeEscrows(merged, a), merged);
});
