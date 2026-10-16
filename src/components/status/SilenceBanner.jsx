import React, { useEffect, useMemo } from 'react';
import { useVisibleClock } from '../../hooks/useVisibleClock.js';

export const SilenceBanner = React.memo(function SilenceBanner({ mutes, setMutes }) {
    const deadlines = useMemo(() => Object.values(mutes || {}), [mutes]);
    const silenceNow = useVisibleClock(deadlines, 2000);
    useEffect(() => {
        if (!Object.values(mutes || {}).some(end => end <= silenceNow)) return;
        setMutes(previous => {
            const entries = Object.entries(previous || {});
            const active = entries.filter(([, end]) => end > Date.now());
            return active.length === entries.length ? previous : Object.fromEntries(active);
        });
    }, [mutes, silenceNow, setMutes]);
    const entries = Object.entries(mutes || {}).filter(([, end]) => end > silenceNow);
    if (!entries.length) return null;
    const remain = Math.max(0, Math.ceil((Math.max(...entries.map(([, end]) => end)) - silenceNow) / 1000));
    const min = Math.floor(remain / 60), sec = remain % 60;
    const names = entries.map(([name]) => name).join('、');
    return (
                          <div className="fixed left-0 right-0 top-[11rem] z-[75] pointer-events-none px-4 flex justify-center" aria-live="polite">
                              <div className="w-full max-w-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden bg-gradient-to-r from-slate-800 via-violet-900/95 to-slate-800 backdrop-blur-md">
                                  <div className="px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
                                      <span className="text-white/90 text-sm font-medium uppercase tracking-widest">禁言中🤫</span>
                                      <span className="text-white font-bold text-lg">{names}</span>
                                      <span className="text-white/70 text-sm">剩余</span>
                                      <span className="text-white font-mono font-black text-2xl tabular-nums tracking-tight">
                                          {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
                                      </span>
                                  </div>
                              </div>
                          </div>
    );
});
