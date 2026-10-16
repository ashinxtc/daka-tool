export const GRAPHICS_KEY = 'device_graphics_quality_v1';
export const GRAPHICS_MODES = ['auto', 'disabled', 'balanced', 'enabled'];
export function isMobileGraphicsDevice(nav = {}, match = () => ({ matches: false })) {
    return /iPhone|iPad|iPod|Android/i.test(nav.userAgent || '') ||
        (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1) ||
        (nav.maxTouchPoints > 0 && match('(pointer: coarse)').matches && !match('(hover: hover)').matches);
}
export function readGraphicsMode(storage) {
    try {
        const saved = storage.getItem(GRAPHICS_KEY);
        if (GRAPHICS_MODES.includes(saved)) return saved;
        const legacy = storage.getItem('low_perf_manual');
        return legacy === 'true' ? 'enabled' : legacy === 'false' ? 'disabled' : 'auto';
    } catch { return 'auto'; }
}
export function resolveGraphicsMode(mode, mobile, lowHardware) {
    if (mode === 'enabled' || (mode === 'auto' && lowHardware)) return 'lightweight';
    if (mode === 'balanced' || (mode === 'auto' && mobile)) return 'balanced';
    return 'original';
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
