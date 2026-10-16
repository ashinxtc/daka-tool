// Durable receipts outlive the capped parent command queue. Acknowledgement is monotonic.
export function mergeDeductionReceipts(local = {}, cloud = {}) {
    const merged = { ...cloud };
    for (const [id, receipt] of Object.entries(local)) {
        merged[id] = { ...receipt, acknowledged: !!(receipt.acknowledged || cloud[id]?.acknowledged) };
    }
    return merged;
}

export function applyParentDeduction({ action, child, history, receipts, balance, now = Date.now() }) {
    const target = action.targetChild || child;
    if (!action.id || !target) return null; // Cannot safely replay an unidentified command.
    const id = JSON.stringify([target, action.id]);
    const operatorRole = action.operatorRole || '家长';
    const amount = Math.abs(parseInt(action.amount, 10)) || 0;
    const reason = action.reason || '家庭账目支出扣除';
    const timestamp = action.timestamp || now;
    // Preserve the pre-existing ledger format, including old installations' entries.
    const generatedKey = `${target}-PARENT_DEDUCT-${operatorRole}_${action.id}__${encodeURIComponent(reason)}-${timestamp}`;
    const legacyPrefix = `${target}-PARENT_DEDUCT-${operatorRole}_${action.id}__`;
    const historyKey = Object.keys(history).find(key => key.startsWith(legacyPrefix)) || generatedKey;
    const previous = receipts[id];
    const applied = !!previous || Object.hasOwn(history, historyKey);
    const receipt = previous || { id, targetChild: target, operatorRole, amount, reason, timestamp,
        historyKey, balanceAfter: applied ? balance : Math.max(0, balance - amount), acknowledged: false };
    return { receipt, receipts: { ...receipts, [id]: receipt },
        history: { ...history, [receipt.historyKey]: -receipt.amount }, newlyApplied: !applied && amount > 0 };
}

export function nextDeductionNotice(receipts, child) {
    return Object.values(receipts).filter(r => r.targetChild === child && !r.acknowledged)
        .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id))[0] || null;
}
