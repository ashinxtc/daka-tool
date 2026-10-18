// Monetary operations use stable identities. UI state and sync are projections of these records.
export const RECEIPTS_KEY = 'app_parent_deduction_receipts_v1';
export const ESCROWS_KEY = 'app_escrow_penalties_v1';
const canonical = (a, b) => JSON.stringify(a) <= JSON.stringify(b) ? a : b;
const ordered = obj => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
const identity = (child, id) => JSON.stringify([child, String(id)]);
export const semanticResult = (merged, local, cloud) => ({ merged,
    localChanged: JSON.stringify(merged) !== JSON.stringify(local),
    cloudChanged: JSON.stringify(merged) !== JSON.stringify(cloud) });

export function mergeReceipts(local = {}, cloud = {}) {
    const result = { ...cloud };
    for (const [id, a] of Object.entries(local)) {
        const b = cloud[id];
        const terms = r => { const { acknowledged, ...rest } = r; return rest; };
        result[id] = b ? { ...canonical(terms(a), terms(b)), acknowledged: !!(a.acknowledged || b.acknowledged) } : a;
    }
    return ordered(result);
}
export function pendingNotices(receipts, child) {
    return Object.values(receipts || {}).filter(r => r.targetChild === child && !r.acknowledged)
        .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
}

export function applyDeductions({ actions, child, devices = [], strictAuthorization = false, history = {}, receipts = {}, stats = {}, balance }) {
    let nextHistory = { ...history }, nextReceipts = { ...receipts }, nextStats = { ...stats };
    if (!Array.isArray(actions)) return { changed: false };
    const processed = new Map();
    const validDevices = new Set();
    devices.forEach(d => {
        if (!d) return;
        if (d.deviceId) validDevices.add(d.deviceId);
        if (Array.isArray(d.authorizedDeviceIds)) d.authorizedDeviceIds.forEach(id => id && validDevices.add(id));
        if (d.fingerprint) validDevices.add(d.fingerprint);
    });
    for (const action of [...actions].filter(Boolean).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))) {
        if (!['deduction', 'parent_deduct'].includes(action.type) || action.status !== 'pending' ||
            (action.targetChild && action.targetChild !== child) || !child) continue;
        if (action.id === undefined || action.id === null || action.id === '') continue;
        const id = identity(child, action.id);
        if (nextReceipts[id]) { processed.set(action.id, 'claimed'); continue; }
        if ((strictAuthorization || devices.length) && !validDevices.has(action.operatorDeviceId)) {
            processed.set(action.id, 'rejected_unauthorized'); continue;
        }
        const amount = Math.abs(Number(action.amount));
        if (!Number.isSafeInteger(amount) || amount <= 0) { processed.set(action.id, 'rejected_invalid'); continue; }
        const operatorRole = action.operatorRole || '家长';
        const reason = action.reason || '家庭账目支出扣除';
        // Missing timestamps must still yield the same key on every device.
        const timestamp = Number(action.timestamp) || 0;
        const prefix = `${child}-PARENT_DEDUCT-${operatorRole}_${action.id}__`;
        const existingKey = Object.keys(nextHistory).find(k => k.startsWith(prefix));
        const historyKey = existingKey || `${prefix}${encodeURIComponent(reason)}-${timestamp}`;
        const alreadyApplied = !!existingKey;
        const before = balance(nextHistory, child);
        if (!alreadyApplied) nextHistory[historyKey] = -amount;
        nextReceipts[id] = { id, actionId: action.id, targetChild: child, operatorRole, reason,
            amount: alreadyApplied ? Math.abs(nextHistory[historyKey]) : amount, timestamp, historyKey,
            balanceAfter: alreadyApplied ? null : balance(nextHistory, child),
            balanceBefore: alreadyApplied ? null : before, acknowledged: false, legacy: alreadyApplied };
        if (!alreadyApplied) {
            const previous = nextStats[child] || {};
            nextStats[child] = { ...previous, total_spent: (previous.total_spent || 0) + amount,
                parent_deduction_spent: (previous.parent_deduction_spent || 0) + amount };
        }
        processed.set(action.id, 'claimed');
    }
    return { history: nextHistory, receipts: nextReceipts, stats: nextStats,
        actions: actions.map(a => a && processed.has(a.id) ? { ...a, status: processed.get(a.id) } : a),
        changed: processed.size > 0 };
}

export function escrowRecords(entry) {
    if (!entry) return {};
    if (entry.records) return entry.records;
    // Old single-contract saves are retained; do not invent a second debit on migration.
    const id = entry.penaltyKey || `legacy-${entry.timestamp || entry.createdDate || 'unknown'}`;
    return { [id]: { ...entry, id, legacy: true } };
}
export function escrowSummary(entry) {
    const all = Object.values(escrowRecords(entry));
    if (!all.length) return null;
    const pending = all.filter(r => r.status === 'pending');
    if (!pending.length) {
        const latest = [...all].sort((a, b) => (b.redeemedAt || b.forfeitedAt || b.timestamp || 0) - (a.redeemedAt || a.forfeitedAt || a.timestamp || 0))[0];
        const batch = latest.status === 'redeemed' ? all.filter(r => r.redeemedAt === latest.redeemedAt && r.status === 'redeemed') : [latest];
        return { ...latest, frozenGold: batch.reduce((n, r) => n + r.frozenGold, 0),
            returnedGold: batch.reduce((n, r) => n + Math.round(r.frozenGold * (r.returnRate ?? 100) / 100), 0) };
    }
    return { ...pending[0], count: pending.length, status: 'pending',
        frozenGold: pending.reduce((n, r) => n + r.frozenGold, 0),
        deadlineDate: pending.map(r => r.deadlineDate).filter(Boolean).sort()[0] };
}
export function mergeEscrows(local = {}, cloud = {}) {
    const result = {};
    for (const child of new Set([...Object.keys(local), ...Object.keys(cloud)])) {
        const left = escrowRecords(local[child]), right = escrowRecords(cloud[child]), records = { ...right };
        for (const [id, a] of Object.entries(left)) {
            const b = right[id];
            if (!b) { records[id] = a; continue; }
            // Every device chooses the same immutable terms even if two offline wheel draws differ.
            const terms = r => { const { status, redeemedAt, redeemedDate, redeemedDates, forfeitedAt, ...rest } = r; return rest; };
            const base = canonical(terms(a), terms(b));
            const redeemed = [a, b].filter(r => r.status === 'redeemed' &&
                (!base.deadlineDate || (r.redeemedDate && r.redeemedDate <= base.deadlineDate)))
                .sort((x, y) => (x.redeemedAt || 0) - (y.redeemedAt || 0));
            records[id] = redeemed.length ? { ...base, status: 'redeemed', redeemedAt: redeemed[0].redeemedAt,
                redeemedDate: redeemed[0].redeemedDate } : { ...base,
                status: a.status === 'forfeited' || b.status === 'forfeited' ? 'forfeited' : 'pending' };
            // Existing legacy redeemed saves may predate redeemedDate.
            if (base.legacy && (a.status === 'redeemed' || b.status === 'redeemed')) records[id].status = 'redeemed';
            // Safety history is cumulative state, not an immutable contract term.
            // Keep both devices' accepted protection dates without adding refunds.
            if (records[id].status === 'redeemed') {
                const accepted = base.legacy ? [a, b].filter(r => r.status === 'redeemed') : redeemed;
                const dates = accepted.flatMap(r => Array.isArray(r.redeemedDates) ? r.redeemedDates : []);
                if (dates.length) records[id].redeemedDates = [...new Set(dates.filter(d =>
                    typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort();
            }
        }
        result[child] = { records: ordered(records) };
    }
    return ordered(result);
}
export function freezeEscrow({ escrows, child, penaltyKey, amount, today, deadlineDate, reason, timestamp, returnRate = 100 }) {
    const records = escrowRecords(escrows[child]);
    if (records[penaltyKey]) return escrows;
    const token = encodeURIComponent(penaltyKey);
    const record = { id: penaltyKey, penaltyKey, frozenGold: amount, createdDate: today, deadlineDate, reason,
        timestamp, returnRate, status: 'pending',
        freezeKey: `${child}-ESCROW_FROZEN-${token}-0000000000000`,
        redeemKey: `${child}-ESCROW_REDEEM-${token}-0000000000000` };
    return { ...escrows, [child]: { records: { ...records, [penaltyKey]: record } } };
}
export function settleEscrows({ escrows, child, today, star, enabled, now, returnRate = 100 }) {
    let changed = false, returned = 0;
    const records = { ...escrowRecords(escrows[child]) };
    for (const [id, r] of Object.entries(records)) {
        if (r.status !== 'pending') continue;
        if (r.deadlineDate && today > r.deadlineDate) {
            records[id] = { ...r, status: 'forfeited', forfeitedAt: now }; changed = true;
        } else if (enabled && star >= 1) {
            const rate = r.returnRate ?? returnRate;
            const token = encodeURIComponent(id);
            const existingRedeemedDates = Array.isArray(r.redeemedDates) ? r.redeemedDates : [];
            const newRedeemedDates = Array.from(new Set([...existingRedeemedDates, today, r.createdDate].filter(Boolean)));
            records[id] = { ...r, returnRate: rate, status: 'redeemed', redeemedAt: now, redeemedDate: today, redeemedDates: newRedeemedDates,
                redeemKey: r.redeemKey || `${child}-ESCROW_REDEEM-${token}-0000000000000` };
            returned += Math.round(r.frozenGold * rate / 100); changed = true;
        }
    }
    return { escrows: changed ? { ...escrows, [child]: { records } } : escrows, changed, returned };
}
export function projectAccounting(history, receipts, escrows) {
    const next = { ...history };
    for (const receipt of Object.values(receipts || {})) if (receipt.historyKey) next[receipt.historyKey] = -receipt.amount;
    for (const entry of Object.values(escrows || {})) for (const r of Object.values(escrowRecords(entry))) {
        if (r.freezeKey) next[r.freezeKey] = -r.frozenGold;
        if (r.redeemKey) {
            if (r.status === 'redeemed') next[r.redeemKey] = Math.round(r.frozenGold * (r.returnRate ?? 100) / 100);
            else delete next[r.redeemKey]; // A rejected late redemption must not leave a credit in the merged ledger.
        }
    }
    return next;
}
// Preserve the non-parent counter while reconciling the contribution of distinct receipts.
export function reconcileDeductionStats(stats, receipts) {
    const totals = {};
    for (const r of Object.values(receipts || {})) if (!r.legacy) totals[r.targetChild] = (totals[r.targetChild] || 0) + r.amount;
    const result = { ...stats };
    for (const [child, total] of Object.entries(totals)) {
        const previous = stats[child] || {};
        result[child] = { ...previous, total_spent: Math.max(0, (previous.total_spent || 0) - (previous.parent_deduction_spent || 0)) + total,
            parent_deduction_spent: total };
    }
    return result;
}
