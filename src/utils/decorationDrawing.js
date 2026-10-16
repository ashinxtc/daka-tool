// Visual simulation only. Never use this timeline for rewards, timers or sync.
export function createFixedStepper(hz = 60) {
    let remainder = 0;
    return elapsed => {
        remainder += Math.min(100, Math.max(0, elapsed));
        const steps = Math.floor((remainder + 0.001) / (1000 / hz));
        remainder -= steps * (1000 / hz);
        return steps;
    };
}
export function matrixPhase(elapsed, pause = 1000, move = 1500) {
    const cycle = Math.floor(elapsed / (pause + move));
    const local = elapsed % (pause + move);
    return { cycle, moving: local >= pause, progress: Math.max(0, (local - pause) / move),
        wait: local < pause ? pause - local : 0 };
}
// Bounded per-effect cache; CSS pixels match the original Canvas raster resolution.
export function createGlyphCache(doc, limit = 512) {
    const cache = new Map();
    return {
        draw(context, char, font, color, x, y) {
            const key = `${char}|${font}|${color}`;
            let glyph = cache.get(key);
            if (!glyph) {
                // Large desktops may exceed the budget. Draw overflow directly instead
                // of evicting every glyph and allocating canvases on every frame.
                if (cache.size >= limit) {
                    context.font = font; context.fillStyle = color;
                    context.textAlign = 'center'; context.textBaseline = 'middle';
                    context.fillText(char, x, y);
                    return;
                }
                glyph = doc.createElement('canvas'); glyph.width = glyph.height = 72;
                const pen = glyph.getContext('2d');
                pen.font = font; pen.fillStyle = color; pen.textAlign = 'center'; pen.textBaseline = 'middle';
                pen.fillText(char, 36, 36);
                cache.set(key, glyph);
            }
            context.drawImage(glyph, x - 36, y - 36);
        },
        clear() { cache.clear(); },
        get size() { return cache.size; }
    };
}
