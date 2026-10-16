import { useEffect, useState } from 'react';

// Wall-clock deadlines remain authoritative; hidden pages do not tick UI clocks.
export function useVisibleClock(deadlines, interval = 1000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        let timer;
        const refresh = () => {
            clearInterval(timer);
            timer = undefined;
            if (document.visibilityState === 'hidden') return;
            const tick = () => {
                const time = Date.now();
                setNow(time);
                if (!deadlines.some(end => end > time)) {
                    clearInterval(timer);
                    timer = undefined;
                }
            };
            tick();
            if (deadlines.some(end => end > Date.now())) timer = setInterval(tick, interval);
        };
        refresh();
        document.addEventListener('visibilitychange', refresh);
        return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
    }, [deadlines, interval]);
    return now;
}
