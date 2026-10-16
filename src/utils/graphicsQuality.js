export const GRAPHICS_KEY = 'device_graphics_quality_v1';
export const IDLE_KEY = 'device_idle_energy_v1';
export const GRAPHICS_MODES = ['economy', 'balanced', 'full', 'compatibility'];
export const MODE_LABELS = { economy: '舒适省电', balanced: '推荐均衡', full: '完整视觉', compatibility: '旧设备兼容' };
export function normalizeGraphicsMode(mode) {
    return ({ auto: 'balanced', disabled: 'full', enabled: 'compatibility' })[mode] || (GRAPHICS_MODES.includes(mode) ? mode : null);
}
export function readGraphicsMode(storage) {
    try {
        const saved = normalizeGraphicsMode(storage.getItem(GRAPHICS_KEY));
        if (saved) return saved;
        const legacy = storage.getItem('low_perf_manual');
        return legacy === 'true' ? 'compatibility' : legacy === 'false' ? 'full' : 'balanced';
    } catch { return 'balanced'; }
}
export function readIdleEnergy(storage) {
    try { return storage.getItem(IDLE_KEY) !== 'false'; } catch { return true; }
}
// Defaults are deliberately identical on desktop/tablet/mobile. Hardware detection
// must never silently override a saved choice or downgrade after a single slow frame.
export function resolveGraphicsMode(mode) {
    const value = normalizeGraphicsMode(mode);
    return value === 'compatibility' ? 'lightweight' : value === 'full' ? 'original' : 'balanced';
}
export function backgroundDpr(deviceDpr, low, balanced, lowDpr) {
    return low ? lowDpr : Math.min(deviceDpr || 1, balanced ? 1 : 2);
}
// Admit frames on a stable cadence without changing the animation's time source.
export function createFrameGate(fps) {
    let next = null;
    const interval = fps ? 1000 / fps : 0;
    return now => {
        if (!interval) return true;
        if (next === null) { next = now + interval; return true; }
        if (now + 0.5 < next) return false;
        next += (Math.floor(Math.max(0, now - next) / interval) + 1) * interval;
        return true;
    };
}
