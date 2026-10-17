// Older versions wrote some string preferences without JSON encoding.
export function readStoredString(raw, fallback = '') {
    if (raw === null || raw === undefined) return fallback;
    try {
        const value = JSON.parse(raw);
        if (typeof value === 'string') return value;
        if (value === null) return fallback;
    } catch { /* legacy plain string */ }
    return String(raw);
}

export function readStoredValue(raw, fallback) {
    if (raw === null || raw === undefined) return fallback;
    if (typeof fallback === 'string') return readStoredString(raw, fallback);
    return JSON.parse(raw);
}
