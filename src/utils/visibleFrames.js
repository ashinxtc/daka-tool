// Decoration-only clock: pause hidden-page work without recreating canvases or particles.
// Do not use this clock for business deadlines, which must continue to use Date.now().
export function createVisibleFrames({ document: doc, window: win, performance: clock }) {
    let nextId = 0, pausedAt = null, pausedDuration = 0, pageHidden = false;
    const pending = new Map();
    const now = () => (pausedAt ?? clock.now()) - pausedDuration;
    const hidden = () => pageHidden || doc.visibilityState === 'hidden';
    const schedule = entry => {
        if (hidden() || entry.nativeId !== null) return;
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
        request(callback) {
            const entry = { id: ++nextId, callback, nativeId: null };
            pending.set(entry.id, entry); schedule(entry); return entry.id;
        },
        cancel(id) {
            const entry = pending.get(id);
            if (entry?.nativeId !== null && entry?.nativeId !== undefined) win.cancelAnimationFrame(entry.nativeId);
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
export const requestVisibleFrame = callback => frames().request(callback);
export const cancelVisibleFrame = id => frames().cancel(id);
export const visibleAnimationNow = () => frames().now();
if (import.meta.hot) import.meta.hot.dispose(() => { shared?.dispose(); shared = undefined; });
