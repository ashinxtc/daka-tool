// --- 颜色配置方案 ---
export const COLOR_PALETTES = {
    // === 经典四季 · 雅韵清音（随心畅选） ===
    rose: { 
        id: 'rose', 
        name: '初春暖樱', 
        tagline: '春樱绽蕊 · 柔美温煦 · 桃李芳菲',
        primary: 'text-rose-600', 
        primaryBg: 'bg-gradient-to-r from-rose-500 to-pink-500', 
        primaryBgHover: 'hover:from-rose-600 hover:to-pink-600', 
        lightBg: 'bg-rose-50/80', 
        lightBorder: 'border-rose-100', 
        border: 'border-rose-200', 
        ring: 'ring-rose-300', 
        accent: 'text-rose-500', 
        gradient: 'from-rose-500 via-pink-500 to-rose-400', 
        softBg: 'bg-gradient-to-br from-rose-50/70 via-pink-50/30 to-stone-50',
        chartColor: '#e11d48',
        solidBg: 'bg-rose-600',
        headerGradientStyle: {
            backgroundColor: '#e11d48',
            backgroundImage: 'linear-gradient(to right, #f43f5e, #ec4899, #fb7185)'
        },
        iconGradient: 'bg-gradient-to-tr from-rose-500 to-pink-400 shadow-rose-200/50'
    },
    sky: { 
        id: 'sky', 
        name: '晴空扶摇', 
        tagline: '鹏程万里 · 澄澈如镜 · 乘风破浪',
        primary: 'text-sky-600', 
        primaryBg: 'bg-gradient-to-r from-sky-500 to-blue-500', 
        primaryBgHover: 'hover:from-sky-600 hover:to-blue-600', 
        lightBg: 'bg-sky-50/80', 
        lightBorder: 'border-sky-100', 
        border: 'border-sky-200', 
        ring: 'ring-sky-300', 
        accent: 'text-sky-500', 
        gradient: 'from-sky-500 via-blue-500 to-cyan-400', 
        softBg: 'bg-gradient-to-br from-sky-50/60 via-blue-50/30 to-slate-50',
        chartColor: '#0284c7',
        solidBg: 'bg-sky-600',
        headerGradientStyle: {
            backgroundColor: '#0284c7',
            backgroundImage: 'linear-gradient(to right, #0ea5e9, #3b82f6, #22d3ee)'
        },
        iconGradient: 'bg-gradient-to-tr from-sky-500 to-blue-400 shadow-sky-200/50'
    },
    amber: { 
        id: 'amber', 
        name: '金杏澄光', 
        tagline: '秋收万颗 · 金杏迎风 · 硕果累累',
        primary: 'text-amber-600', 
        primaryBg: 'bg-gradient-to-r from-amber-500 to-orange-500', 
        primaryBgHover: 'hover:from-amber-600 hover:to-orange-600', 
        lightBg: 'bg-amber-50/80', 
        lightBorder: 'border-amber-100', 
        border: 'border-amber-200', 
        ring: 'ring-amber-300', 
        accent: 'text-amber-500', 
        gradient: 'from-amber-500 via-orange-500 to-yellow-400', 
        softBg: 'bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-yellow-50/40',
        chartColor: '#d97706',
        solidBg: 'bg-amber-600',
        headerGradientStyle: {
            backgroundColor: '#d97706',
            backgroundImage: 'linear-gradient(to right, #f59e0b, #f97316, #facc15)'
        },
        iconGradient: 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-amber-200/50'
    },
    emerald: { 
        id: 'emerald', 
        name: '松柏苍翠', 
        tagline: '岁寒松柏 · 欣欣向荣 · 蓬勃生机',
        primary: 'text-emerald-600', 
        primaryBg: 'bg-gradient-to-r from-emerald-600 to-teal-500', 
        primaryBgHover: 'hover:from-emerald-700 hover:to-teal-600', 
        lightBg: 'bg-emerald-50/80', 
        lightBorder: 'border-emerald-100', 
        border: 'border-emerald-200', 
        ring: 'ring-emerald-300', 
        accent: 'text-emerald-500', 
        gradient: 'from-emerald-600 via-teal-600 to-green-400', 
        softBg: 'bg-gradient-to-br from-emerald-50/60 via-teal-50/30 to-stone-50',
        chartColor: '#059669',
        solidBg: 'bg-emerald-600',
        headerGradientStyle: {
            backgroundColor: '#059669',
            backgroundImage: 'linear-gradient(to right, #059669, #0d9488, #4ade80)'
        },
        iconGradient: 'bg-gradient-to-tr from-emerald-500 to-green-400 shadow-emerald-200/50'
    },
    violet: { 
        id: 'violet', 
        name: '紫藤拂晓', 
        tagline: '紫藤流瀑 · 典雅宁谧 · 兰心蕙质',
        primary: 'text-violet-600', 
        primaryBg: 'bg-gradient-to-r from-violet-600 to-purple-500', 
        primaryBgHover: 'hover:from-violet-700 hover:to-purple-600', 
        lightBg: 'bg-violet-50/80', 
        lightBorder: 'border-violet-100', 
        border: 'border-violet-200', 
        ring: 'ring-violet-300', 
        accent: 'text-violet-500', 
        gradient: 'from-violet-600 via-purple-600 to-indigo-400', 
        softBg: 'bg-gradient-to-br from-violet-50/60 via-purple-50/30 to-slate-50',
        chartColor: '#7c3aed',
        solidBg: 'bg-violet-600',
        headerGradientStyle: {
            backgroundColor: '#7c3aed',
            backgroundImage: 'linear-gradient(to right, #7c3aed, #9333ea, #818cf8)'
        },
        iconGradient: 'bg-gradient-to-tr from-violet-500 to-purple-400 shadow-violet-200/50'
    },
    sunset: {
        id: 'sunset',
        name: '晚霞暖阳',
        tagline: '落霞满天 · 融融暖意 · 暮色生辉',
        primary: 'text-orange-600',
        primaryBg: 'bg-gradient-to-r from-orange-500 to-rose-500',
        primaryBgHover: 'hover:from-orange-600 hover:to-rose-600',
        lightBg: 'bg-orange-50/80',
        lightBorder: 'border-orange-100',
        border: 'border-orange-200',
        ring: 'ring-orange-300',
        accent: 'text-rose-500',
        gradient: 'from-rose-500 via-orange-500 to-amber-400',
        softBg: 'bg-gradient-to-br from-orange-50/50 via-rose-50/30 to-amber-50/40',
        chartColor: '#ea580c',
        solidBg: 'bg-orange-600',
        headerGradientStyle: {
            backgroundColor: '#ea580c',
            backgroundImage: 'linear-gradient(to right, #f43f5e, #f97316, #fbbf24)'
        },
        iconGradient: 'bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-400 shadow-orange-200/50'
    },
    celadon: {
        id: 'celadon',
        name: '雨过天青',
        tagline: '汝窑温润 · 烟雨初霁 · 澄净空灵',
        primary: 'text-cyan-800',
        primaryBg: 'bg-gradient-to-r from-cyan-700 to-teal-600',
        primaryBgHover: 'hover:from-cyan-800 hover:to-teal-700',
        lightBg: 'bg-cyan-50/70',
        lightBorder: 'border-cyan-100',
        border: 'border-cyan-200',
        ring: 'ring-cyan-300',
        accent: 'text-teal-600',
        gradient: 'from-cyan-700 via-sky-600 to-teal-700',
        softBg: 'bg-gradient-to-br from-cyan-50/40 via-slate-50 to-sky-50/30',
        chartColor: '#0e7490',
        solidBg: 'bg-cyan-700',
        headerGradientStyle: {
            backgroundColor: '#0e7490',
            backgroundImage: 'linear-gradient(to right, #0e7490, #0284c7, #0f766e)'
        },
        iconGradient: 'bg-gradient-to-tr from-cyan-700 via-sky-500 to-teal-400 shadow-cyan-200/50'
    },

    // === 时空市集 · 殿堂典藏（高级重塑与专属解锁） ===
    dunhuang: { 
        id: 'dunhuang', 
        name: '莫高流金', 
        tagline: '大漠流金 · 沥粉贴金 · 飞天流光',
        subtitle: '西域敦煌',
        primary: 'text-amber-800', 
        primaryBg: 'bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600', 
        primaryBgHover: 'hover:from-amber-700 hover:to-yellow-700', 
        lightBg: 'bg-amber-50/90', 
        lightBorder: 'border-amber-200', 
        border: 'border-amber-300', 
        ring: 'ring-amber-400/50', 
        accent: 'text-amber-600', 
        gradient: 'from-amber-700 via-amber-600 to-yellow-500', 
        softBg: 'bg-gradient-to-br from-amber-50/80 via-stone-100/60 to-orange-50/50',
        chartColor: '#b45309',
        solidBg: 'bg-amber-700',
        headerGradientStyle: {
            backgroundColor: '#b45309',
            backgroundImage: 'linear-gradient(to right, #b45309, #d97706, #eab308)'
        },
        iconGradient: 'bg-gradient-to-br from-amber-600 via-yellow-600 to-indigo-900 shadow-amber-500/40'
    },
    theme_cyber: { 
        id: 'theme_cyber', 
        name: '盛唐幻夜', 
        tagline: '上元千灯 · 全息琉璃 · 星际长安',
        subtitle: '赛博唐朝',
        primary: 'text-cyan-700', 
        primaryBg: 'bg-gradient-to-r from-indigo-700 via-purple-700 to-cyan-600', 
        primaryBgHover: 'hover:from-indigo-800 hover:to-cyan-700', 
        lightBg: 'bg-indigo-50/80', 
        lightBorder: 'border-indigo-100', 
        border: 'border-indigo-200', 
        ring: 'ring-cyan-400/40', 
        accent: 'text-purple-600', 
        gradient: 'from-slate-950 via-indigo-950 to-slate-900', 
        softBg: 'bg-gradient-to-br from-slate-100 via-indigo-50/40 to-cyan-50/30',
        chartColor: '#06b6d4',
        solidBg: 'bg-slate-900',
        headerGradientStyle: {
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(to right, #020617, #1e1b4b, #0f172a)'
        },
        iconGradient: 'bg-gradient-to-br from-slate-900 via-indigo-700 to-cyan-400 shadow-indigo-500/40'
    },
    jiangshan: {
        id: 'jiangshan',
        name: '只此青绿',
        tagline: '峰峦叠嶂 · 矿物石青 · 锦绣千里',
        subtitle: '千里江山',
        primary: 'text-teal-700',
        primaryBg: 'bg-gradient-to-r from-teal-700 to-emerald-600',
        primaryBgHover: 'hover:from-teal-800 hover:to-emerald-700',
        lightBg: 'bg-teal-50/80',
        lightBorder: 'border-teal-100',
        border: 'border-teal-200',
        ring: 'ring-teal-400/50',
        accent: 'text-emerald-600',
        gradient: 'from-teal-700 via-emerald-700 to-cyan-700',
        softBg: 'bg-gradient-to-br from-teal-50/50 via-emerald-50/30 to-stone-50',
        chartColor: '#0f766e',
        solidBg: 'bg-teal-700',
        headerGradientStyle: {
            backgroundColor: '#0f766e',
            backgroundImage: 'linear-gradient(to right, #0f766e, #047857, #0e7490)'
        },
        iconGradient: 'bg-gradient-to-br from-teal-700 via-emerald-500 to-cyan-400 shadow-teal-500/40'
    },
    cosmic: {
        id: 'cosmic',
        name: '星汉灿烂',
        tagline: '日月之行 · 若出其中 · 星海无垠',
        subtitle: '深空星图',
        primary: 'text-indigo-700',
        primaryBg: 'bg-gradient-to-r from-indigo-700 to-blue-600',
        primaryBgHover: 'hover:from-indigo-800 hover:to-blue-700',
        lightBg: 'bg-indigo-50/80',
        lightBorder: 'border-indigo-100',
        border: 'border-indigo-200',
        ring: 'ring-indigo-400/50',
        accent: 'text-blue-500',
        gradient: 'from-slate-900 via-indigo-900 to-blue-800',
        softBg: 'bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/40',
        chartColor: '#4338ca',
        solidBg: 'bg-indigo-900',
        headerGradientStyle: {
            backgroundColor: '#1e1b4b',
            backgroundImage: 'linear-gradient(to right, #020617, #1e1b4b, #1e40af)'
        },
        iconGradient: 'bg-gradient-to-br from-slate-900 via-indigo-600 to-blue-400 shadow-indigo-500/40'
    }
};

export const BASE_THEME_IDS = ['rose', 'sky', 'amber', 'emerald', 'violet', 'sunset', 'celadon'];

/**
 * 获取弹窗顶栏的安全主题样式（提供 100% 浏览器兼容的实体底色与 sRGB 渐变，老旧设备/低性能模式下绝无白屏）
 */
export const getThemeHeaderStyle = (theme) => {
    if (!theme) return { backgroundColor: '#4f46e5' };
    return theme.headerGradientStyle || { backgroundColor: theme.chartColor || '#4f46e5' };
};
