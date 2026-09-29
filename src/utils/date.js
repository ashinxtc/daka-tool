// --- 获取本地时间 YYYY-MM-DD 的工具函数 ---
// 解决凌晨0-8点日期判定错误的问题
export const getLocalDateKey = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 从 YYYY-MM-DD 减去天数，用于旧存档缺失 investStart 时推算有效开始日
export const dateKeySubtractDays = (dateStr, days) => {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() - days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Date 对象转换为本地 YYYY-MM-DD
export const dateObjToLocalKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 时间戳转换为本地 YYYY-MM-DD
export const tsToLocalDateKey = (ts) => dateObjToLocalKey(new Date(typeof ts === 'string' ? parseInt(ts, 10) : ts));

// 获取日期范围内的所有 YYYY-MM-DD 数组
export const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    const parseSafe = (str) => {
        if (typeof str !== 'string') return new Date(str);
        return new Date(str.includes('T') ? str : `${str}T12:00:00`);
    };
    let currentDate = parseSafe(startDate);
    const stopDate = parseSafe(endDate);
    let count = 0;
    while (currentDate <= stopDate && count < 100) {
        dates.push(dateObjToLocalKey(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        count++;
    }
    return dates;
};

// 获取某年某月的所有 YYYY-MM-DD 数组
export const getMonthDates = (year, month) => {
    const dates = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
        dates.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return dates;
};

