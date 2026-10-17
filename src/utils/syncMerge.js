import {isSecretKey} from '../../shared/access-policy.js';
// Baselines belong to the snapshot actually read; wall clocks never pick a winner.
export const protectedSnapshot = snapshot => {
    try{return JSON.parse(snapshot?.app_authorized_parents_v1||'null')?.securityVersion===1;}catch{return false;}
};
const missing = Symbol('missing');
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export const stableStringify = v => JSON.stringify(v, (_, x) => object(x)
    ? Object.fromEntries(Object.keys(x).sort().map(k => [k, x[k]])) : x);
const equal = (a, b) => a === missing || b === missing ? a === b : stableStringify(a) === stableStringify(b);
const own = (v, k) => Object.prototype.hasOwnProperty.call(v, k) ? v[k] : missing;
const decode = v => { if (v === missing) return v; try { return JSON.parse(v); } catch { return v; } };
const identity = item => {
    if (!object(item)) return null;
    for (const k of ['id', 'deviceId', 't']) if (typeof item[k] === 'string' || typeof item[k] === 'number') return `${k}:${item[k]}`;
    return null;
};
const localKeys = new Set(['app_sync_code','app_sync_last_time','app_test_mode']);
export const syncValues = (snapshot = {}) => Object.fromEntries(Object.entries(snapshot).filter(([k]) => k.startsWith('app_') && !localKeys.has(k)));

export function mergeSyncSnapshots(base, local, remote, { resolve = {}, mergeKey } = {}) {
    const protectedRemote=protectedSnapshot(remote);
    const conflicts = [];
    const merge = (b, l, r, path) => {
        if (equal(l, b)) return r;
        if (equal(r, b) || equal(l, r)) return l;
        if (object(l) && object(r) && (object(b) || b === missing)) {
            const result = {};
            for (const k of new Set([...Object.keys(b === missing ? {} : b), ...Object.keys(l), ...Object.keys(r)])) {
                const v = merge(b === missing ? missing : own(b, k), own(l, k), own(r, k), [...path, k]);
                if (v !== missing) Object.defineProperty(result, k, { value: v, enumerable: true, writable: true, configurable: true });
            }
            return result;
        }
        if (Array.isArray(l) && Array.isArray(r) && (Array.isArray(b) || b === missing)) {
            const lists = [b === missing ? [] : b, l, r];
            const maps = lists.map(items => new Map(items.map(item => [identity(item), item])));
            // Positional arrays and repeated inventory entries are not sets.
            if (maps.every((map, i) => !map.has(null) && map.size === lists[i].length)) {
                const result = [];
                for (const id of new Set([...maps[2].keys(), ...maps[1].keys(), ...maps[0].keys()])) {
                    const v = merge(...maps.map(map => map.has(id) ? map.get(id) : missing), [...path, id]);
                    if (v !== missing) result.push(v);
                }
                return result;
            }
        }
        const key = path[0];
        if (resolve[key] === 'local') return l;
        if (resolve[key] === 'remote') return r;
        conflicts.push({ key, path: path.join('.'), base: b === missing ? null : b,
            local: l === missing ? null : l, remote: r === missing ? null : r });
        return l; // Preview only; callers must not write a conflicted result.
    };
    const data = {};
    for (const key of new Set([...Object.keys(base || {}), ...Object.keys(local || {}), ...Object.keys(remote || {})])) {
        if (!key.startsWith('app_') || localKeys.has(key)) continue;
        if(protectedRemote&&isSecretKey(key))continue;
        if(protectedRemote&&key==='app_authorized_parents_v1'){data[key]=remote[key];continue;}
        const b = own(base || {}, key), l = own(local || {}, key), r = own(remote || {}, key);
        let v;
        if (mergeKey && !equal(l, b) && !equal(r, b) && l !== missing && r !== missing) v = mergeKey(key, l, r);
        if (v !== undefined) { data[key] = v; continue; }
        const merged = merge(decode(b), decode(l), decode(r), [key]);
        if (merged !== missing) data[key] = equal(merged, decode(l)) ? l : equal(merged, decode(r)) ? r : JSON.stringify(merged);
    }
    return { data, conflicts };
}
