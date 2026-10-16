import { useEffect } from 'react';
import { pauseDecorationFrames } from '../../utils/visibleFrames.js';
export const EXPERIMENTS = [
    ['baseline', '当前版本'], ['draw', '绘制优化'], ['composite', '绘制＋合成优化'], ['idle', '空闲节能']
];
// Session-only controller. No interval or React update on pointer/scroll movement.
export default function DecorationExperiment({ experiment, frozen }) {
    useEffect(() => {
        const idleEnabled = experiment === 'idle';
        let timer = null, lastActivity = performance.now(), idle = false;
        const apply = () => {
            const paused = frozen || idle;
            document.body.dataset.decorationPaused = String(paused);
            pauseDecorationFrames(paused);
        };
        const check = () => {
            const remaining = 20000 - (performance.now() - lastActivity);
            if (remaining > 0) timer = setTimeout(check, remaining);
            else { timer = null; idle = true; apply(); }
        };
        const activity = () => {
            lastActivity = performance.now();
            if (idle) { idle = false; apply(); }
            if (idleEnabled && timer === null) timer = setTimeout(check, 20000);
        };
        const events = ['pointerdown', 'pointermove', 'keydown', 'scroll'];
        document.body.dataset.energyComposite = String(experiment === 'composite' || idleEnabled);
        apply();
        if (idleEnabled) {
            timer = setTimeout(check, 20000);
            events.forEach(name => window.addEventListener(name, activity, { passive: true, capture: true }));
        }
        return () => {
            clearTimeout(timer);
            events.forEach(name => window.removeEventListener(name, activity, true));
            delete document.body.dataset.energyComposite;
            delete document.body.dataset.decorationPaused;
            pauseDecorationFrames(false);
        };
    }, [experiment, frozen]);
    return null;
}
