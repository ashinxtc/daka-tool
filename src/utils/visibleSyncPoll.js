const LONG_IDLE_MS = 180000;
const IDLE_INTERVAL_MS = 30000;
const activityEvents = ['pointerdown', 'touchstart', 'scroll', 'keydown'];
const activityOptions = { capture: true, passive: true };

// Serialize automatic checks and adapt their cadence to visibility and activity.
export function startVisibleSyncPoll({ run, interval, initialDelay }, { doc = document, win = window, now = Date.now } = {}) {
    let timer = null;
    let timeout = null;
    let controller = null;
    let pageHidden = false;
    let stopped = false;
    let failures = 0;
    let refreshOnFinish = false;
    let lastActivity = now();
    const isVisible = () => !stopped && !pageHidden && doc.visibilityState !== 'hidden';
    let wasVisible = isVisible();

    const clear = () => {
        if (timer !== null) win.clearTimeout(timer);
        timer = null;
    };
    const abort = () => {
        if (timeout !== null) win.clearTimeout(timeout);
        timeout = null;
        controller?.abort();
    };
    const schedule = delay => {
        if (isVisible() && timer === null && !controller) timer = win.setTimeout(tick, delay);
    };
    const tick = async () => {
        timer = null;
        if (!isVisible()) return;
        const request = new AbortController();
        controller = request;
        timeout = win.setTimeout(() => request.abort(), 12000);
        try {
            await run(request.signal);
            if (!request.signal.aborted) failures = 0;
        } catch {
            if (isVisible() && !refreshOnFinish) failures = Math.min(failures + 1, 3);
        } finally {
            win.clearTimeout(timeout);
            timeout = null;
            controller = null;
            const idleFor = now() - lastActivity;
            const normalDelay = idleFor >= LONG_IDLE_MS ? IDLE_INTERVAL_MS : interval(idleFor);
            const delay = refreshOnFinish ? 0 : Math.min(normalDelay * 2 ** failures, 30000);
            refreshOnFinish = false;
            schedule(delay);
        }
    };
    const update = () => {
        const visible = isVisible();
        if (visible === wasVisible) return;
        wasVisible = visible;
        if (!visible) {
            clear();
            abort();
            return;
        }
        lastActivity = now();
        failures = 0;
        if (controller) refreshOnFinish = true;
        else schedule(0);
    };
    const markActivity = () => {
        if (!isVisible()) return;
        const current = now();
        const wasIdle = current - lastActivity >= LONG_IDLE_MS;
        lastActivity = current;
        // A tap or scroll can wake an idle page without defeating a retry backoff.
        if (wasIdle && !failures && !controller) {
            clear();
            schedule(0);
        }
    };
    const hide = () => { pageHidden = true; update(); };
    const show = () => { pageHidden = false; update(); };
    doc.addEventListener('visibilitychange', update);
    win.addEventListener('pagehide', hide);
    win.addEventListener('pageshow', show);
    for (const event of activityEvents) win.addEventListener(event, markActivity, activityOptions);
    schedule(initialDelay);
    return () => {
        stopped = true;
        clear();
        abort();
        doc.removeEventListener('visibilitychange', update);
        win.removeEventListener('pagehide', hide);
        win.removeEventListener('pageshow', show);
        for (const event of activityEvents) win.removeEventListener(event, markActivity, activityOptions);
    };
}
