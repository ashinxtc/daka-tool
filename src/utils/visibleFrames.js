// Decoration-only clock: pause hidden-page work without recreating canvases or particles.
// Do not use this clock for business deadlines, which must continue to use Date.now().
export function createVisibleFrames({ document: doc, window: win, performance: clock }) {
    let nextId = 0, pausedAt = null, pausedDuration = 0, pageHidden = false, manuallyPaused = false;
    const pending = new Map();
    const now = () => (pausedAt ?? clock.now()) - pausedDuration;
    const hidden = () => manuallyPaused || pageHidden || doc.visibilityState === 'hidden';
    const schedule = entry => {
        if (hidden() || entry.nativeId !== null || entry.timerId !== null) return;
        const wait = entry.due - now();
        if (wait > 0) {
            entry.timerId = win.setTimeout(() => { entry.timerId = null; schedule(entry); }, wait);
            return;
        }
        entry.nativeId = win.requestAnimationFrame(() => {
            entry.nativeId = null;
            if (hidden()) return;
            pending.delete(entry.id);
            entry.callback(now());
        });
    };
    const update = () => {
        if (hidden()) {
            if (pausedAt === null) pausedAt = clock.now();
            for (const entry of pending.values()) {
                if (entry.nativeId !== null) win.cancelAnimationFrame(entry.nativeId);
                entry.nativeId = null;
                if (entry.timerId !== null) win.clearTimeout(entry.timerId);
                entry.timerId = null;
            }
        } else {
            if (pausedAt !== null) { pausedDuration += clock.now() - pausedAt; pausedAt = null; }
            for (const entry of pending.values()) schedule(entry);
        }
    };
    const pagehide = () => { pageHidden = true; update(); };
    const pageshow = () => { pageHidden = false; update(); };
    doc.addEventListener('visibilitychange', update);
    win.addEventListener('pagehide', pagehide);
    win.addEventListener('pageshow', pageshow);
    update();
    return {
        now,
        setPaused(value) { manuallyPaused = !!value; update(); },
        request(callback, delay = 0) {
            const entry = { id: ++nextId, callback, nativeId: null, timerId: null, due: now() + Math.max(0, delay) };
            pending.set(entry.id, entry); schedule(entry); return entry.id;
        },
        cancel(id) {
            const entry = pending.get(id);
            if (entry?.nativeId !== null && entry?.nativeId !== undefined) win.cancelAnimationFrame(entry.nativeId);
            if (entry?.timerId !== null && entry?.timerId !== undefined) win.clearTimeout(entry.timerId);
            pending.delete(id);
        },
        dispose() {
            for (const id of pending.keys()) this.cancel(id);
            doc.removeEventListener('visibilitychange', update);
            win.removeEventListener('pagehide', pagehide);
            win.removeEventListener('pageshow', pageshow);
        }
    };
}
let shared;
const frames = () => shared ??= createVisibleFrames({ document, window, performance });
export const requestVisibleFrame = (callback, delay = 0) => frames().request(callback, delay);
export const pauseDecorationFrames = paused => frames().setPaused(paused);
export const cancelVisibleFrame = id => frames().cancel(id);
export const visibleAnimationNow = () => frames().now();
if (import.meta.hot) import.meta.hot.dispose(() => { shared?.dispose(); shared = undefined; });
