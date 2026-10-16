import React, { useState } from 'react';
export const PREVIEW_BACKGROUNDS = [
    ['current', '当前装备'], ['none', '无特效背景'], ['bg_galaxy', '银河星空'],
    ['bg_meteor', '流星雨'], ['bg_aurora', '极光'], ['bg_lantern', '孔明灯'],
    ['bg_firefly', '萤火虫'], ['bg_ginkgo', '银杏雨'], ['bg_matrix', '万象字阵'],
    ['bg_oraclesands', '甲骨流沙'], ['bg_firework', '烟花'], ['bg_prismatic', '棱镜流光'],
    ['bg_timewarp', '时空网格'], ['bg_hyperspeed', '极速跃迁']
];
export const QUALITY_LABELS = { original: '原画质', balanced: '均衡', lightweight: '轻量' };
export default function EnergyPreviewPanel({ mode, onMode, quality, mobile, background, onBackground }) {
    const [open, setOpen] = useState(true);
    return <aside aria-label="能效预览对比" className="energy-preview-panel">
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? '收起对比面板' : '打开对比面板'} · {QUALITY_LABELS[quality]}
        </button>
        {open && <div className="energy-preview-content">
            <strong>PR B · 同设备画质对比</strong>
            <p>{mobile ? '移动设备' : '桌面设备'} · 当前生效：<span data-testid="graphics-effective">{QUALITY_LABELS[quality]}</span></p>
            <div className="energy-preview-options">
                {[['disabled', '原画质 A'], ['balanced', '均衡 B'], ['auto', '自动'], ['enabled', '轻量']].map(([id, label]) =>
                    <button type="button" key={id} aria-pressed={mode === id} onClick={() => onMode(id)}>{label}</button>)}
            </div>
            <label>对比背景 <select aria-label="对比背景" value={background} onChange={e => onBackground(e.target.value)}>
                {PREVIEW_BACKGROUNDS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select></label>
            <p>均衡档减少背景粒子，WebGL 背景约 30 帧、像素倍率上限 1。文字和操作界面保持原清晰度。</p>
            <p>本面板的选择仅在本次预览有效，不改装备或已保存的画质设置。比较时请收起面板，保持亮度、背景和操作时长一致。</p>
            <p>切换画质会重新生成背景，观察数秒后再比较；这里不估算耗电百分比。</p>
        </div>}
    </aside>;
}
