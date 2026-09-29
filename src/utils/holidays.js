// --- [2026-2028版] 智能节日与全栏配色逻辑 ---
export const getHolidayInfo = (dateObj) => {
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const dateStr = `${month}-${day}`;
    const fullDateStr = `${year}-${month}-${day}`;

    // A. 农历/特殊节日表 (2026-2028)
    const lunarHolidays = {
        // 2026
        '2026-2-16': '除夕', '2026-2-17': '春节', '2026-3-3': '元宵节',
        '2026-4-5': '清明节', '2026-6-19': '端午节', '2026-9-25': '中秋节',
        // 2027
        '2027-2-5': '除夕', '2027-2-6': '春节', '2027-2-20': '元宵节',
        '2027-4-5': '清明节', '2027-6-9': '端午节', '2027-9-15': '中秋节',
        // 2028
        '2028-1-25': '除夕', '2028-1-26': '春节', '2028-2-9': '元宵节',
        '2028-4-4': '清明节', '2028-5-28': '端午节', '2028-10-3': '中秋节',
    };

    // B. 固定公历节日
    const solarHolidays = {
        '1-1': '元旦', '3-8': '妇女节', '3-12': '植树节', '5-1': '劳动节',
        '5-4': '青年节', '6-1': '儿童节', '7-1': '建党节', '8-1': '建军节',
        '9-10': '教师节', '10-1': '国庆节', '12-25': '圣诞节'
    };

    if (lunarHolidays[fullDateStr]) return { name: lunarHolidays[fullDateStr], isMajor: true };
    if (solarHolidays[dateStr]) {
        const name = solarHolidays[dateStr];
        const majorOnes = ['元旦', '劳动节', '国庆节', '儿童节', '建军节', '建党节'];
        return { name: name, isMajor: majorOnes.includes(name) };
    }
    return null;
};

// 获取整个Header的主题色
export const getHeaderTheme = (dateObj, holiday) => {
    // 1. 节日限定 (全屏渐变)
    if (holiday) {
        if (['春节', '除夕', '元旦', '元宵节', '国庆节', '建党节'].includes(holiday.name)) {
            return { gradient: 'from-red-700 via-red-600 to-amber-600', text: 'text-amber-50', icon: '🧧' };
        }
        if (holiday.name === '端午节') return { gradient: 'from-emerald-700 via-teal-600 to-cyan-600', text: 'text-emerald-50', icon: '🛶' };
        if (holiday.name === '中秋节') return { gradient: 'from-slate-900 via-indigo-900 to-blue-900', text: 'text-amber-50', icon: '🌕' }; // 深邃夜空
        if (holiday.name === '儿童节') return { gradient: 'from-pink-500 via-purple-500 to-indigo-500', text: 'text-white', icon: '🎈' };
        if (holiday.name === '劳动节') return { gradient: 'from-orange-600 via-amber-600 to-yellow-500', text: 'text-white', icon: '🛠️' };
        if (holiday.name === '妇女节') return { gradient: 'from-rose-500 via-pink-500 to-fuchsia-500', text: 'text-white', icon: '🌹' };
    }
    
    // 2. 日常星期配色 (全屏渐变)
    const weekThemes = [
        { gradient: 'from-orange-500 via-amber-500 to-yellow-400', icon: '☀️' }, // 周日：阳光
        { gradient: 'from-blue-700 via-blue-600 to-indigo-500', icon: '🚀' },     // 周一：商务蓝
        { gradient: 'from-cyan-600 via-sky-500 to-blue-500', icon: '💻' },       // 周二：专注
        { gradient: 'from-emerald-600 via-green-500 to-teal-500', icon: '🌱' },  // 周三：清新
        { gradient: 'from-amber-600 via-orange-500 to-red-500', icon: '🔥' },    // 周四：能量
        { gradient: 'from-violet-600 via-purple-600 to-fuchsia-500', icon: '🎉' }, // 周五：狂欢
        { gradient: 'from-rose-600 via-pink-500 to-red-400', icon: '🎡' },       // 周六：愉悦
    ];
    
    const theme = weekThemes[dateObj.getDay()];
    return { ...theme, text: 'text-white' };
};
