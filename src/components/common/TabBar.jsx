import React from 'react';

// ===== 可复用 TabBar 组件 =====
// 用法：<TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} theme={theme} />
export const TabBar = ({ tabs, active, onChange, theme, variant = 'default' }) => {
    if (variant === 'pill') {
        // 胶囊容器样式（宠物页面风格）
        return (
            <div className="flex bg-white/60 rounded-2xl p-1 gap-1">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => onChange(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${active === tab.id ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {tab.count != null && <span className="text-[10px] opacity-60">({tab.count})</span>}
                    </button>
                ))}
            </div>
        );
    }
    if (variant === 'accent') {
        // 左侧竖线指示器（设置页面风格）
        return (
            <div className="flex p-2.5 bg-gray-50 border-b border-gray-100 gap-2 overflow-x-auto shrink-0 min-h-[52px]">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => onChange(tab.id)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors transition-transform duration-200 flex items-center gap-1.5 border-l-4 ${active === tab.id ? 'bg-white text-gray-800 shadow-md ring-1 ring-gray-200 border-l-indigo-500' : 'border-l-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70'}`}>
                        {tab.icon} {tab.label}
                        {tab.count != null && <span className="text-[10px] opacity-60 ml-1">({tab.count})</span>}
                    </button>
                ))}
            </div>
        );
    }
    // default: 底部融入式（商店风格）
    return (
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => onChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${active === tab.id ? `bg-white shadow-sm ring-1 ring-gray-200 text-gray-800` : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab.icon && <span>{tab.icon}</span>}
                    <span>{tab.label}</span>
                    {tab.count != null && <span className="text-[10px] opacity-60">({tab.count})</span>}
                </button>
            ))}
        </div>
    );
};
