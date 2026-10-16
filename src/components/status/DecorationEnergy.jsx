import { useEffect } from 'react';
import { pauseDecorationFrames } from '../../utils/visibleFrames.js';

// Only decorative effects use this controller. Deadlines and reward animations do not.
export default function DecorationEnergy({ idleEnabled, staticDecorations, mode }) {
    useEffect(() => {
        let timer = null, lastActivity = performance.now(), idle = false;
        let hidden = document.visibilityState === 'hidden';
        const pointers = new Set();
        const apply = () => {
            const paused = staticDecorations || hidden || idle;
            document.body.dataset.decorationPaused = String(paused);
            pauseDecorationFrames(paused);
        };
        const clear = () => { clearTimeout(timer); timer = null; };
        const check = () => {
            timer = null;
            const remaining = 20000 - (performance.now() - lastActivity);
            if (remaining > 0 || pointers.size) timer = setTimeout(check, Math.max(remaining, 1000));
            else { idle = true; apply(); }
        };
        const activity = () => {
            lastActivity = performance.now();
            if (idle) { idle = false; apply(); }
            if (idleEnabled && !staticDecorations && !hidden && timer === null) timer = setTimeout(check, 20000);
        };
        const down = e => { pointers.add(e.pointerId); activity(); };
        const up = e => { pointers.delete(e.pointerId); activity(); };
        const suspend = () => { hidden = true; pointers.clear(); clear(); apply(); };
        const resume = () => { hidden = document.visibilityState === 'hidden'; if (!hidden) activity(); apply(); };
        const visibility = () => document.visibilityState === 'hidden' ? suspend() : resume();
        const events = ['pointermove', 'touchmove', 'keydown', 'scroll', 'resize', 'orientationchange', 'decoration-change'];
        events.forEach(name => window.addEventListener(name, activity, { passive: true, capture: true }));
        window.addEventListener('pointerdown', down, { passive: true, capture: true });
        window.addEventListener('pointerup', up, { passive: true, capture: true });
        window.addEventListener('pointercancel', up, { passive: true, capture: true });
        window.addEventListener('pagehide', suspend);
        window.addEventListener('pageshow', resume);
        document.addEventListener('visibilitychange', visibility);
        activity(); apply();
        return () => {
            clear();
            events.forEach(name => window.removeEventListener(name, activity, true));
            window.removeEventListener('pointerdown', down, true);
            window.removeEventListener('pointerup', up, true);
            window.removeEventListener('pointercancel', up, true);
            window.removeEventListener('pagehide', suspend);
            window.removeEventListener('pageshow', resume);
            document.removeEventListener('visibilitychange', visibility);
            delete document.body.dataset.decorationPaused;
            pauseDecorationFrames(false);
        };
    }, [idleEnabled, staticDecorations, mode]);
    return null;
}
