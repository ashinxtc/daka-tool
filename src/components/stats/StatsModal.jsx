import React, { useState, useEffect, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';
import { XIcon, Clock } from '../icons.jsx';
import { getLocalDateKey, dateObjToLocalKey } from '../../utils/date.js';
import { getCheckinMinutes } from '../../utils/checkin.js';

// --- 时长格式化辅助函数 ---
export const formatDurationMinutes = (minutes) => {
    if (!minutes || minutes <= 0) return '0分钟';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}小时${m}分钟`;
    if (h > 0) return `${h}小时`;
    return `${m}分钟`;
};

// --- 高级图表组件 (深度对齐 Vocab Tool 现代化 Chart.js 技术架构与视觉美学) ---
export const SimpleLineChart = ({
    data,
    color = '#6366f1',
    height = 250,
    unit = '分钟',
    showAvgLine = true,
    avgValue = null,
    emptyText = '暂无趋势数据'
}) => {
    const canvasRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // 销毁上一个实例，防止内存泄漏和重影
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        if (!data || data.length === 0) return;

        // 安全转换 Hex / RGB 为带透明度的 RGBA
        const hexToRgba = (c, alpha) => {
            if (!c) return `rgba(99, 102, 241, ${alpha})`;
            if (c.startsWith('#')) {
                let hex = c.slice(1);
                if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
                const r = parseInt(hex.substring(0, 2), 16) || 0;
                const g = parseInt(hex.substring(2, 4), 16) || 0;
                const b = parseInt(hex.substring(4, 6), 16) || 0;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            if (c.startsWith('rgb')) {
                return c.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
            }
            return `rgba(99, 102, 241, ${alpha})`;
        };

        // 垂直渐变填充 (对齐 Vocab Tool 的高质感水波折线美学)
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, hexToRgba(color, 0.32));
        gradient.addColorStop(0.7, hexToRgba(color, 0.06));
        gradient.addColorStop(1, hexToRgba(color, 0.00));

        const labels = data.map(d => d.label);
        const values = data.map(d => (Number.isFinite(d.value) ? d.value : 0));
        const total = values.reduce((a, b) => a + b, 0);
        const calculatedAvg = avgValue != null ? avgValue : Math.round(total / (values.length || 1));
        const isTime = unit === '分钟';

        const datasets = [
            {
                label: isTime ? '投入时长' : '得分',
                data: values,
                borderColor: color,
                borderWidth: 2.8,
                backgroundColor: gradient,
                fill: true,
                tension: 0.36, // Vocab Tool 标准贝塞尔曲线平滑度
                pointBackgroundColor: color,
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointRadius: data.length > 30 ? 2 : 4.5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#FFFFFF',
                pointHoverBorderWidth: 3,
                pointHitRadius: 15,
            }
        ];

        // 均值基准辅助虚线 (直观展示波峰波谷)
        if (showAvgLine && calculatedAvg > 0 && data.length >= 3) {
            datasets.push({
                label: `周期均值 (${isTime ? formatDurationMinutes(calculatedAvg) : calculatedAvg + unit})`,
                data: new Array(data.length).fill(calculatedAvg),
                borderColor: hexToRgba(color, 0.42),
                borderWidth: 1.5,
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
                tension: 0,
            });
        }

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 500,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: showAvgLine && calculatedAvg > 0 && data.length >= 3,
                        position: 'top',
                        align: 'end',
                        labels: {
                            boxWidth: 14,
                            boxHeight: 4,
                            usePointStyle: false,
                            font: { size: 11, family: 'system-ui, -apple-system, sans-serif' },
                            color: '#64748b',
                            filter: (legendItem) => legendItem.datasetIndex === 1,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.94)',
                        titleColor: '#f8fafc',
                        bodyColor: '#e2e8f0',
                        titleFont: { size: 13, weight: 'bold', family: 'system-ui, sans-serif' },
                        bodyFont: { size: 12, family: 'system-ui, sans-serif' },
                        padding: { top: 10, bottom: 10, left: 14, right: 14 },
                        cornerRadius: 10,
                        borderColor: hexToRgba(color, 0.35),
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            title: (tooltipItems) => {
                                const idx = tooltipItems[0]?.dataIndex;
                                const item = data[idx];
                                if (!item) return '';
                                if (item.date && item.weekday) {
                                    return `📅 ${item.date} (${item.weekday})`;
                                }
                                return item.label || '';
                            },
                            label: (context) => {
                                if (context.datasetIndex === 1) {
                                    return `📏 周期均值: ${isTime ? formatDurationMinutes(context.parsed.y) : context.parsed.y + ' ' + unit}`;
                                }
                                const idx = context.dataIndex;
                                const item = data[idx];
                                const val = context.parsed.y;
                                const lines = [];

                                if (isTime) {
                                    lines.push(`⏱️ 投入时长: ${formatDurationMinutes(val)}${val > 0 ? ` (${val}分钟)` : ''}`);
                                    if (item?.taskDetails && item.taskDetails.length > 0) {
                                        const names = item.taskDetails.map(t => `${t.name} (${t.minutes}分)`);
                                        const preview = names.length > 3 
                                            ? `${names.slice(0, 3).join('、')} 等${names.length}项` 
                                            : names.join('、');
                                        lines.push(`📋 打卡项目: ${preview}`);
                                    } else if (val === 0) {
                                        lines.push(`💤 当日暂无打卡记录`);
                                    }
                                    if (calculatedAvg > 0 && val > 0) {
                                        const diff = Math.round(((val - calculatedAvg) / calculatedAvg) * 100);
                                        if (diff > 0) {
                                            lines.push(`🚀 相比均值: 高出 +${diff}%`);
                                        } else if (diff < 0) {
                                            lines.push(`📉 相比均值: 低于 ${diff}%`);
                                        } else {
                                            lines.push(`⚖️ 相比均值: 与均值持平`);
                                        }
                                    }
                                } else {
                                    lines.push(`📊 得分: ${val} ${unit}`);
                                }

                                return lines;
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 6,
                        bottom: 8,
                        left: 4,
                        right: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(226, 232, 240, 0.7)',
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11, family: 'system-ui, sans-serif' },
                            callback: (v) => {
                                if (isTime) {
                                    if (v === 0) return '0';
                                    if (v >= 60 && v % 60 === 0) return `${v / 60}h`;
                                    if (v >= 60) return `${(v / 60).toFixed(1)}h`;
                                    return `${v}m`;
                                }
                                return `${v}${unit}`;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11, family: 'system-ui, sans-serif' },
                            padding: 6,
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: data.length > 14 ? 10 : data.length,
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [data, color, height, unit, showAvgLine, avgValue]);

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-300 gap-2 py-10" style={{ height: `${height}px` }}>
                <span className="text-3xl">📊</span>
                <span className="text-xs font-medium">{emptyText}</span>
            </div>
        );
    }

    return (
        <div className="w-full relative pb-1" style={{ height: `${height}px` }}>
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
};

// --- 学科归类（与成就系统一致）---
export const getTaskSubjectForStats = (taskName) => {
            if (!taskName) return 'other';
            const name = (taskName || '').toLowerCase();
            if (/数|算|逻辑|奥|培优|思维/.test(name)) return 'math';
            if (/英|单词|词|译|听力|口语|raz|en|english/.test(name)) return 'english';
            if (/科|实验|物理|化|生|地|程|机器|百科|stem/.test(name)) return 'science';
            if (/语|文|读|背|写字|古诗|练字/.test(name)) return 'chinese';
            if (/琵琶|琴|画|音|棋|书|舞|美/.test(name)) return 'art';
            return 'other';
        };
        const SUBJECT_LABELS = { math: '数学', chinese: '语文', english: '英语', science: '科学', art: '艺术', other: '其他' };

// --- 统计图表弹窗 ---
export const StatsModal = ({ show, onClose, checkins, tasks, activeChild, theme, initialStatsTab = 'overview', initialMonthKey = null, wheelHistory, homeworkExamConfig, homeworkRecords, examRecords, aiEnabled, deepseekApiKey, callDeepSeekAPI }) => {
            const [mainTab, setMainTab] = useState('checkin'); // 'checkin' | 'homework'
            const [statsTab, setStatsTab] = useState(initialStatsTab); // 'overview' | 'monthly'
            const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey); // 'YYYY-MM'
            const [timeRange, setTimeRange] = useState('week'); // week, month, total
            const [selectedTask, setSelectedTask] = useState('all'); // all, or taskId
            const [aiAnalysis, setAiAnalysis] = React.useState('');
            const [aiAnalysisLoading, setAiAnalysisLoading] = React.useState(false);

            // 有打卡记录的月份列表（用于月度总结选择）；若从「上月总结」入口进入则保证上月出现在列表中
            const monthsWithData = useMemo(() => {
                const childCheckins = checkins[activeChild] || {};
                const set = new Set();
                Object.values(childCheckins).forEach(dates => {
                    Object.keys(dates).forEach(d => set.add(d.slice(0, 7)));
                });
                const list = [...set].sort().reverse();
                if (initialMonthKey && !set.has(initialMonthKey))
                    return [initialMonthKey, ...list];
                return list;
            }, [checkins, activeChild, initialMonthKey]);

            React.useEffect(() => {
                if (show) {
                    setStatsTab(initialStatsTab);
                    setSelectedMonthKey(initialMonthKey);
                    setAiAnalysis('');
                    setAiAnalysisLoading(false);
                }
            }, [show, initialStatsTab, initialMonthKey]);

            React.useEffect(() => {
                if (statsTab === 'monthly' && monthsWithData.length > 0 && !selectedMonthKey)
                    setSelectedMonthKey(monthsWithData[0]);
            }, [statsTab, monthsWithData, selectedMonthKey]);

            // 指定月份的月度总结数据
            const monthlySummaryData = useMemo(() => {
                if (!selectedMonthKey) return null;
                const [y, m] = selectedMonthKey.split('-').map(Number);
                const start = `${y}-${String(m).padStart(2, '0')}-01`;
                const lastDay = new Date(y, m, 0).getDate();
                const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                const childCheckins = checkins[activeChild] || {};
                const childTasks = tasks[activeChild] || [];
                let totalMinutes = 0;
                let totalDays = 0;
                const daySet = new Set();
                const bySubject = { math: { count: 0, minutes: 0, tasks: [] }, chinese: { count: 0, minutes: 0, tasks: [] }, english: { count: 0, minutes: 0, tasks: [] }, science: { count: 0, minutes: 0, tasks: [] }, art: { count: 0, minutes: 0, tasks: [] }, other: { count: 0, minutes: 0, tasks: [] } };
                const byTask = [];
                childTasks.forEach(task => {
                    const record = childCheckins[task.id] || {};
                    let taskMinutes = 0;
                    let taskDays = 0;
                    Object.entries(record).forEach(([date, val]) => {
                        if (date >= start && date <= end) {
                            // 多次打卡记录是数组，用 getCheckinMinutes 安全取分钟数（避免 parseInt 数组得 NaN）
                            const mins = Array.isArray(val) ? getCheckinMinutes(record, date) : (typeof val === 'number' ? val : (val === '免' ? 0 : parseInt(String(val), 10) || 0));
                            taskMinutes += mins;
                            taskDays++;
                            totalMinutes += mins;
                            daySet.add(date);
                        }
                    });
                    if (taskDays > 0) {
                        const subj = getTaskSubjectForStats(task.name);
                        bySubject[subj].count += taskDays;
                        bySubject[subj].minutes += taskMinutes;
                        if (!bySubject[subj].tasks.some(t => t.id === task.id)) bySubject[subj].tasks.push({ ...task, days: taskDays, minutes: taskMinutes });
                        byTask.push({ task, days: taskDays, minutes: taskMinutes });
                    }
                });
                totalDays = daySet.size;
                const daysInMonth = lastDay;
                const avgPerDay = totalDays ? Math.round(totalMinutes / totalDays) : 0;
                let maxDayMinutes = 0;
                let maxDayDate = '';
                for (let d = 1; d <= lastDay; d++) {
                    const date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    let dayM = 0;
                    Object.values(childCheckins).forEach(dates => { dayM += getCheckinMinutes(dates, date); });
                    if (dayM > maxDayMinutes) { maxDayMinutes = dayM; maxDayDate = date; }
                }
                let longestStreak = 0;
                const sortedDays = [...daySet].sort();
                for (let i = 0, cur = 0; i < sortedDays.length; i++) {
                    if (i === 0 || sortedDays[i] === getNextDay(sortedDays[i - 1])) cur++; else cur = 1;
                    longestStreak = Math.max(longestStreak, cur);
                }
                function getNextDay(d) {
                    const next = new Date(d + 'T12:00:00');
                    next.setDate(next.getDate() + 1);
                    return dateObjToLocalKey(next);
                }
                return { totalMinutes, totalDays, daysInMonth, avgPerDay, bySubject, byTask, maxDayMinutes, maxDayDate, longestStreak, start, end };
            }, [selectedMonthKey, checkins, activeChild, tasks]);

            // 数据处理逻辑 (增强对齐 Vocab Tool 趋势研判与多维数据洞察)
            const statsData = useMemo(() => {
                const childCheckins = checkins[activeChild] || {};
                const childTasksList = tasks[activeChild] || [];
                const today = getLocalDateKey(0); // 使用本地时间
                
                // 1. 计算今日用时
                let todayTotal = 0;
                if (selectedTask === 'all') {
                    Object.values(childCheckins).forEach(taskRecord => {
                        todayTotal += getCheckinMinutes(taskRecord, today);
                    });
                } else {
                    todayTotal = getCheckinMinutes(childCheckins[selectedTask], today);
                }

                // 2. 准备日期范围 (新增 biweek 14天选项，无缝对齐 Vocab Tool 的 14 天趋势)
                const dates = [];
                const daysCount = timeRange === 'week' ? 7 : timeRange === 'biweek' ? 14 : timeRange === 'month' ? 30 : 90; 
                
                for (let i = daysCount - 1; i >= 0; i--) {
                    dates.push(getLocalDateKey(-i));
                }

                const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

                // 3. 生成折线图数据
                const lineData = dates.map(date => {
                    let val = 0;
                    const taskDetails = [];
                    if (selectedTask === 'all') {
                        childTasksList.forEach(task => {
                            const taskRecord = childCheckins[task.id];
                            const m = getCheckinMinutes(taskRecord, date);
                            if (m > 0) {
                                val += m;
                                taskDetails.push({ name: task.name, minutes: m });
                            }
                        });
                    } else {
                        val = getCheckinMinutes(childCheckins[selectedTask], date);
                        if (val > 0) {
                            const t = childTasksList.find(item => item.id === selectedTask);
                            taskDetails.push({ name: t?.name || '当前项目', minutes: val });
                        }
                    }
                    const dateObj = new Date(date + 'T12:00:00');
                    const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                    const weekday = weekdays[dateObj.getDay()];
                    return { 
                        label, 
                        value: Number.isFinite(val) ? val : 0,
                        date,
                        weekday,
                        taskDetails
                    };
                });

                // 4. 计算指标与出勤率
                const rangeTotal = lineData.reduce((acc, cur) => acc + cur.value, 0);
                const dailyAvg = Math.round(rangeTotal / daysCount);
                const activeDays = lineData.filter(d => d.value > 0).length;
                const activeRate = Math.round((activeDays / daysCount) * 100);

                // 5. 趋势变化计算 (借鉴 Vocab Tool 趋势算法: 后半段均值 vs 前半段均值)
                let trendDiff = 0;
                let trendPct = 0;
                const sampleSize = Math.min(Math.max(3, Math.floor(lineData.length / 4)), Math.floor(lineData.length / 2));
                if (lineData.length >= sampleSize * 2 && sampleSize > 0) {
                    const recentSlice = lineData.slice(-sampleSize);
                    const prevSlice = lineData.slice(-sampleSize * 2, -sampleSize);
                    const recentAvg = recentSlice.reduce((a, b) => a + b.value, 0) / sampleSize;
                    const prevAvg = prevSlice.reduce((a, b) => a + b.value, 0) / sampleSize;
                    if (prevAvg > 0) {
                        trendDiff = (recentAvg - prevAvg) / prevAvg;
                        trendPct = Math.round(trendDiff * 100);
                    } else if (recentAvg > 0) {
                        trendDiff = 1;
                        trendPct = 100;
                    }
                }

                // 6. 找出最高单日 (Peak Day)
                let peakDay = null;
                let maxMinutes = 0;
                lineData.forEach(d => {
                    if (d.value > maxMinutes) {
                        maxMinutes = d.value;
                        peakDay = d;
                    }
                });

                return { 
                    todayTotal, 
                    dailyAvg, 
                    rangeTotal, 
                    activeDays, 
                    activeRate, 
                    trendDiff, 
                    trendPct, 
                    peakDay, 
                    maxMinutes, 
                    daysCount, 
                    lineData 
                };
            }, [checkins, activeChild, timeRange, selectedTask, tasks]);

            if (!show) return null;

            const childTasks = tasks[activeChild] || [];
            
            // 简单的颜色提取
            let chartColor = '#6366f1'; // 默认 indigo
            if (theme.primary.includes('rose')) chartColor = '#e11d48';
            else if (theme.primary.includes('sky')) chartColor = '#0284c7';
            else if (theme.primary.includes('amber')) chartColor = '#d97706';
            else if (theme.primary.includes('emerald')) chartColor = '#059669';
            else if (theme.primary.includes('violet')) chartColor = '#7c3aed';
            else if (theme.id === 'theme_cyber') chartColor = '#22d3ee';
            else if (theme.id === 'dunhuang') chartColor = '#f59e0b';

            return (
                <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-[0_25px_60px_-15px_rgba(99,102,241,0.3)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border-2 border-indigo-400/40 relative" onClick={e => e.stopPropagation()}>
                        {/* 头部 */}
                        <div className={`p-5 sm:p-6 border-b bg-gradient-to-r ${theme.gradient} text-white shrink-0 shadow-md relative`}>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow-inner shadow-white/30">
                                        📊
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 drop-shadow-sm">
                                            宏观学情大典 · 学习数据智库
                                        </h2>
                                        <p className="text-white/85 text-xs mt-0.5 font-medium">
                                            记录与洞察 {activeChild} 的自律成长轨迹与各科修为沉淀
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-black/15 hover:bg-black/25 rounded-full transition-colors cursor-pointer text-white/90 hover:text-white"
                                    title="关闭"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="flex gap-1 p-1 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <button
                                        onClick={() => setMainTab('checkin')}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                            mainTab === 'checkin'
                                                ? 'bg-white text-slate-800 shadow-md ring-1 ring-black/5'
                                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        📅 自律打卡学情
                                    </button>
                                    <button
                                        onClick={() => setMainTab('homework')}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                            mainTab === 'homework'
                                                ? 'bg-white text-slate-800 shadow-md ring-1 ring-black/5'
                                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        📝 课业与考试测验
                                    </button>
                                </div>
                                {mainTab === 'checkin' && (
                                    <div className="flex gap-1 p-1 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20">
                                        <button
                                            onClick={() => setStatsTab('overview')}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                                statsTab === 'overview'
                                                    ? 'bg-white text-slate-800 shadow-md ring-1 ring-black/5'
                                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            📈 周期趋势概览
                                        </button>
                                        <button
                                            onClick={() => setStatsTab('monthly')}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                                statsTab === 'monthly'
                                                    ? 'bg-white text-slate-800 shadow-md ring-1 ring-black/5'
                                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            📜 岁月长卷总结
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/70">
                            {mainTab === 'homework' ? (
                                /* ========== 作业与考试 · 数据分析（仅展示，登记在独立弹窗）========== */
                                (() => {
                                    const config = homeworkExamConfig || {};
                                    const hwSubjects = config.homeworkSubjects || [];
                                    const hwGradingMode = config.homeworkGradingMode || 'score';
                                    const hwRecords = (homeworkRecords && homeworkRecords[activeChild]) || [];
                                    const exRecords = (examRecords && examRecords[activeChild]) || [];
                                    const hwBySubject = hwSubjects.map(sub => {
                                        const list = hwRecords.filter(r => r.subjectId === sub.id);
                                        const numericScores = list.map(r => parseInt(r.scoreOrGrade, 10)).filter(n => !isNaN(n));
                                        const avg = numericScores.length ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1) : null;
                                        return { name: sub.name, count: list.length, avg, list };
                                    }).filter(s => s.count > 0);
                                    const hwTrendData = hwRecords.filter(r => !isNaN(parseInt(r.scoreOrGrade, 10))).sort((a, b) => (a.date || '').localeCompare(b.date || '')).slice(-14).map(r => ({ label: r.date ? r.date.slice(5) : '', value: parseInt(r.scoreOrGrade, 10) }));
                                    const exBySubject = {};
                                    exRecords.forEach(r => {
                                        const key = r.subjectName + ' · ' + (r.examTypeName || '');
                                        if (!exBySubject[key]) exBySubject[key] = { name: key, count: 0, scores: [] };
                                        exBySubject[key].count++;
                                        const n = parseInt(r.scoreOrGrade, 10); if (!isNaN(n)) exBySubject[key].scores.push(n);
                                    });
                                    const exBySubjectList = Object.values(exBySubject).map(v => ({ ...v, avg: v.scores.length ? (v.scores.reduce((a, b) => a + b, 0) / v.scores.length).toFixed(1) : null }));
                                    const exTrendData = exRecords.filter(r => !isNaN(parseInt(r.scoreOrGrade, 10))).sort((a, b) => (a.date || '').localeCompare(b.date || '')).slice(-10).map(r => ({ label: r.date ? r.date.slice(5) : '', value: parseInt(r.scoreOrGrade, 10) }));
                                    const totalHwGold = hwRecords.reduce((s, r) => s + (r.earnedGold || 0), 0);
                                    const totalExGold = exRecords.reduce((s, r) => s + (r.earnedGold || 0), 0);
                                    const maxBar = Math.max(1, ...hwBySubject.map(s => s.count), ...exBySubjectList.map(s => s.count));
                                    return (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            {hwRecords.length === 0 && exRecords.length === 0 ? (
                                                <div className="text-center py-16 text-amber-600/80">
                                                    <div className="text-5xl mb-4">📝</div>
                                                    <p className="font-bold text-gray-600">暂无作业与考试记录</p>
                                                    <p className="text-sm mt-2">点击顶栏「📝」打开登记弹窗，登记后数据将在此展示与分析</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="rounded-2xl border border-amber-200/60 overflow-hidden shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                                                        <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">📝 作业成绩概览</h3>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                                            <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-700">{hwRecords.length}</div><div className="text-xs text-amber-700/80 mt-0.5">登记次数</div></div>
                                                            <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-700">{hwBySubject.length}</div><div className="text-xs text-amber-700/80 mt-0.5">涉及学科</div></div>
                                                            <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-600">+{totalHwGold}</div><div className="text-xs text-amber-700/80 mt-0.5">累计获得元宝</div></div>
                                                            {hwGradingMode === 'score' && hwRecords.some(r => !isNaN(parseInt(r.scoreOrGrade, 10))) && (
                                                                <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-700">{(hwRecords.map(r => parseInt(r.scoreOrGrade, 10)).filter(n => !isNaN(n)).reduce((a, b) => a + b, 0) / hwRecords.filter(r => !isNaN(parseInt(r.scoreOrGrade, 10))).length).toFixed(1)}</div><div className="text-xs text-amber-700/80 mt-0.5">总平均分</div></div>
                                                            )}
                                                        </div>
                                                        {hwBySubject.length > 0 && (
                                                            <>
                                                                <h4 className="text-sm font-bold text-amber-800 mb-2">各科统计</h4>
                                                                <div className="space-y-2 mb-4">
                                                                    {hwBySubject.map((s, i) => (
                                                                        <div key={i} className="flex items-center gap-3">
                                                                            <span className="w-16 text-sm font-bold text-gray-700 shrink-0">{s.name}</span>
                                                                            <div className="flex-1 h-6 bg-amber-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${(s.count / maxBar) * 100}%` }} /></div>
                                                                            <span className="text-sm font-black text-amber-800 w-20 text-right">{s.count} 次{s.avg != null ? ` · 均 ${s.avg}` : ''}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {hwTrendData.length >= 2 && hwGradingMode === 'score' && (
                                                                    <div className="mt-4"><h4 className="text-sm font-bold text-amber-800 mb-2">成绩趋势</h4><SimpleLineChart data={hwTrendData} color="#d97706" height={160} unit="分" /></div>
                                                                )}
                                                                <p className="text-xs text-amber-800/70 mt-3 border-t border-amber-200/50 pt-3">{hwBySubject.length} 个学科共 {hwRecords.length} 次作业记录{hwGradingMode === 'score' && hwBySubject.some(s => s.avg) ? '；保持认真订正、高质量完成作业，成绩会稳步提升。' : '；继续坚持登记，养成好习惯。'}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="rounded-2xl border border-emerald-200/60 overflow-hidden shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                                                        <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">📐 考试成绩概览</h3>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                                            <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-emerald-700">{exRecords.length}</div><div className="text-xs text-emerald-700/80 mt-0.5">考试次数</div></div>
                                                            <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-emerald-700">{exBySubjectList.length}</div><div className="text-xs text-emerald-700/80 mt-0.5">科目·类型</div></div>
                                                            <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-emerald-600">+{totalExGold}</div><div className="text-xs text-emerald-700/80 mt-0.5">累计获得元宝</div></div>
                                                            {exRecords.some(r => !isNaN(parseInt(r.scoreOrGrade, 10))) && (
                                                                <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-emerald-700">{(exRecords.map(r => parseInt(r.scoreOrGrade, 10)).filter(n => !isNaN(n)).reduce((a, b) => a + b, 0) / exRecords.filter(r => !isNaN(parseInt(r.scoreOrGrade, 10))).length).toFixed(1)}</div><div className="text-xs text-emerald-700/80 mt-0.5">总平均分</div></div>
                                                            )}
                                                        </div>
                                                        {exBySubjectList.length > 0 && (
                                                            <>
                                                                <h4 className="text-sm font-bold text-emerald-800 mb-2">各科·考试类型</h4>
                                                                <div className="space-y-2 mb-4">
                                                                    {exBySubjectList.map((s, i) => (
                                                                        <div key={i} className="flex items-center gap-3">
                                                                            <span className="flex-1 min-w-0 truncate text-sm font-bold text-gray-700">{s.name}</span>
                                                                            <div className="w-24 h-6 bg-emerald-100 rounded-full overflow-hidden shrink-0"><div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${(s.count / maxBar) * 100}%` }} /></div>
                                                                            <span className="text-sm font-black text-emerald-800 w-16 text-right shrink-0">{s.count} 次{s.avg ? ` · ${s.avg}分` : ''}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {exTrendData.length >= 2 && (
                                                                    <div className="mt-4"><h4 className="text-sm font-bold text-emerald-800 mb-2">成绩趋势</h4><SimpleLineChart data={exTrendData} color="#059669" height={160} unit="分" /></div>
                                                                )}
                                                                <p className="text-xs text-emerald-800/70 mt-3 border-t border-emerald-200/50 pt-3">共 {exRecords.length} 次考试记录；平时扎实练习、考前认真复习，大考小考都能稳中有进。</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })()
                            ) : statsTab === 'monthly' ? (
                                /* ========== 月度总结视图 ========== */
                                <div className="space-y-6">
                                    {monthsWithData.length === 0 ? (
                                        <div className="text-center py-16 text-gray-400">
                                            <div className="text-5xl mb-4">📅</div>
                                            <p className="font-bold text-gray-500">暂无打卡记录</p>
                                            <p className="text-sm mt-2">完成打卡后即可生成月度总结</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                                <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-2"><span className={`w-1.5 h-4 rounded-full ${theme.primaryBg}`}></span>选择月份</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {monthsWithData.map(key => {
                                                        const [y, m] = key.split('-');
                                                        const label = `${y}年${parseInt(m)}月`;
                                                        return (
                                                            <button key={key} onClick={() => { setSelectedMonthKey(key); setAiAnalysis(''); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors transition-transform ${selectedMonthKey === key ? `${theme.primaryBg} text-white shadow-lg` : 'bg-slate-100 text-gray-600 hover:bg-slate-200'}`}>{label}</button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {selectedMonthKey && monthlySummaryData && (
                                                <div className="space-y-6 animate-in fade-in duration-300">
                                                    {/* 本月总览 */}
                                                    <div className={`rounded-2xl border overflow-hidden shadow-lg bg-gradient-to-br ${theme.gradient} text-white p-6`}>
                                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📋 {selectedMonthKey.split('-')[0]}年{parseInt(selectedMonthKey.split('-')[1])}月 学习总结</h3>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                                                                <div className="text-2xl font-bold">{monthlySummaryData.totalDays}</div>
                                                                <div className="text-xs text-white/90 mt-1">打卡天数</div>
                                                            </div>
                                                            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                                                                <div className="text-2xl font-bold">{monthlySummaryData.totalMinutes}</div>
                                                                <div className="text-xs text-white/90 mt-1">总投入(分钟)</div>
                                                            </div>
                                                            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                                                                <div className="text-2xl font-bold">{monthlySummaryData.avgPerDay}</div>
                                                                <div className="text-xs text-white/90 mt-1">日均(分钟)</div>
                                                            </div>
                                                            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                                                                <div className="text-2xl font-bold">{monthlySummaryData.longestStreak}</div>
                                                                <div className="text-xs text-white/90 mt-1">最长连续(天)</div>
                                                            </div>
                                                        </div>
                                                        {monthlySummaryData.maxDayMinutes > 0 && (
                                                            <div className="mt-4 text-sm text-white/90 flex items-center gap-2">
                                                                <span>🔥 最专注的一天：</span>
                                                                <span className="font-bold">{monthlySummaryData.maxDayDate}</span>
                                                                <span> 投入 {monthlySummaryData.maxDayMinutes} 分钟</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* 作业与考试本月汇总 */}
                                                    {(() => {
                                                        const hwInMonth = (homeworkRecords && homeworkRecords[activeChild] || []).filter(r => r.date && selectedMonthKey && r.date.startsWith(selectedMonthKey));
                                                        const exInMonth = (examRecords && examRecords[activeChild] || []).filter(r => r.date && selectedMonthKey && r.date.startsWith(selectedMonthKey));
                                                        const hwGold = hwInMonth.reduce((s, r) => s + (r.earnedGold || 0), 0);
                                                        const exGold = exInMonth.reduce((s, r) => s + (r.earnedGold || 0), 0);
                                                        if (hwInMonth.length === 0 && exInMonth.length === 0) return null;
                                                        return (
                                                            <div className="rounded-2xl border border-amber-200 overflow-hidden shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                                                                <h3 className="text-base font-black text-amber-900 mb-3 flex items-center gap-2">📝 作业与考试成绩</h3>
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                                    <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-700">{hwInMonth.length}</div><div className="text-xs text-amber-700/80 mt-0.5">作业达标(次)</div></div>
                                                                    <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-700">{exInMonth.length}</div><div className="text-xs text-amber-700/80 mt-0.5">考试记录(次)</div></div>
                                                                    <div className="bg-white/80 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-600">+{hwGold + exGold}</div><div className="text-xs text-amber-700/80 mt-0.5">获得元宝</div></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                    {/* 分科统计 */}
                                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                                        <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${theme.primaryBg}`}></span>分科统计</h3>
                                                        <div className="space-y-4">
                                                            {(['math', 'chinese', 'english', 'science', 'art', 'other']).map(subj => {
                                                                const data = monthlySummaryData.bySubject[subj];
                                                                if (!data || (data.count === 0 && data.minutes === 0)) return null;
                                                                const totalM = monthlySummaryData.totalMinutes || 1;
                                                                const pct = Math.round((data.minutes / totalM) * 100);
                                                                return (
                                                                    <div key={subj} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-gray-700 text-sm">{SUBJECT_LABELS[subj]}</div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex justify-between text-sm mb-1">
                                                                                <span className="font-bold text-gray-700">{data.count} 次打卡 · {data.minutes} 分钟</span>
                                                                                <span className="text-gray-500 font-medium">{pct}%</span>
                                                                            </div>
                                                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                                <div className={`h-full rounded-full ${theme.primaryBg} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    {/* 任务维度排行 */}
                                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                                        <h3 className="text-base font-black text-gray-800 mb-4 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${theme.primaryBg}`}></span>任务投入 TOP</h3>
                                                        <div className="space-y-2">
                                                            {[...(monthlySummaryData.byTask || [])].sort((a, b) => b.minutes - a.minutes).slice(0, 8).map(({ task, days, minutes }, i) => (
                                                                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                                    <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-gray-600">{i + 1}</span>
                                                                    <span className="flex-1 font-medium text-gray-800 truncate">{task.name}</span>
                                                                    <span className="text-sm text-gray-500">{days}天</span>
                                                                    <span className={`font-bold ${theme.primary}`}>{minutes} 分钟</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* 月度标签 */}
                                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
                                                        <h3 className="text-sm font-bold text-amber-800 mb-2">📌 本月标签</h3>
                                                        <p className="text-sm text-amber-800/90 leading-relaxed">
                                                            {monthlySummaryData.totalDays === 0 ? '暂无打卡数据' : [
                                                                monthlySummaryData.totalDays >= monthlySummaryData.daysInMonth - 2 && '🏅 全勤/准全勤月！',
                                                                monthlySummaryData.longestStreak >= 7 && '🔥 连续学习达人',
                                                                monthlySummaryData.avgPerDay >= 60 && '⏱️ 日均超1小时',
                                                                monthlySummaryData.totalMinutes >= 1000 && '📚 千分钟俱乐部',
                                                                monthlySummaryData.totalDays > 0 && monthlySummaryData.totalDays < 5 && '🌱 起步月，继续加油！',
                                                                monthlySummaryData.totalDays >= 5 && monthlySummaryData.avgPerDay < 60 && monthlySummaryData.totalDays < monthlySummaryData.daysInMonth - 5 && '📈 稳步积累中'
                                                            ].filter(Boolean).join(' ') || '✨ 持续进步中'}
                                                        </p>
                                                    </div>

                                                    {/* AI 学习分析 */}
                                                    {aiEnabled && deepseekApiKey && (
                                                        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200 p-5">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h3 className="text-sm font-bold text-cyan-800 flex items-center gap-2">🤖 AI 学习分析</h3>
                                                                <button
                                                                    disabled={aiAnalysisLoading || monthlySummaryData.totalDays === 0}
                                                                    onClick={async () => {
                                                                        setAiAnalysisLoading(true);
                                                                        const prompt = `你是「小星老师」，一个专业的学习分析师。请根据以下学习数据，为${activeChild}生成一份月度学习分析报告。

学习数据：
- 月份：${selectedMonthKey}
- 打卡天数：${monthlySummaryData.totalDays}/${monthlySummaryData.daysInMonth}天
- 总学习时长：${monthlySummaryData.totalMinutes}分钟
- 日均时长：${monthlySummaryData.avgPerDay}分钟
- 最长连续：${monthlySummaryData.longestStreak}天
- 最专注的一天：${monthlySummaryData.maxDayDate}（${monthlySummaryData.maxDayMinutes}分钟）
- 各科目分布：${JSON.stringify(monthlySummaryData.bySubject)}
- 任务排名：${monthlySummaryData.byTask.slice(0, 5).map(t => `${t.task}(${t.days}天/${t.minutes}分钟)`).join('、')}

请用以下格式输出（使用emoji和简洁的中文）：
🌟 亮点总结：（2-3个做得好的地方）
💡 改进建议：（1-2个具体的优化建议）
🎯 下月目标：（1-2个可执行的目标）
📣 鼓励寄语：（一段温暖的鼓励，30字以内）

要求：积极正面、具体可执行、语言亲切、适合孩子阅读。`;
                                                                        const reply = await callDeepSeekAPI(prompt, '分析我的学习情况', []);
                                                                        setAiAnalysis(reply || '暂时无法生成分析，请稍后再试~');
                                                                        setAiAnalysisLoading(false);
                                                                    }}
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${aiAnalysisLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95'}`}
                                                                >
                                                                    {aiAnalysisLoading ? '分析中...' : aiAnalysis ? '重新分析' : '生成分析'}
                                                                </button>
                                                            </div>
                                                            {aiAnalysis ? (
                                                                <div className="text-sm text-cyan-900/80 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</div>
                                                            ) : (
                                                                <p className="text-xs text-cyan-600/60">点击按钮，AI 将根据本月数据为你生成专属学习分析报告 ✨</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                            {/* 顶部概览四维数据卡片 */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className={`absolute inset-0 opacity-5 ${theme.bgGradient}`}></div>
                                    <div className="text-gray-500 text-xs font-bold mb-1 z-10 flex items-center gap-1">
                                        {selectedTask === 'all' ? '今日总投入' : `今日 ${childTasks.find(t=>t.id===selectedTask)?.name || '单项'}`}
                                    </div>
                                    <div className={`text-2xl sm:text-3xl font-black z-10 ${theme.primary} drop-shadow-sm`}>
                                        {statsData.todayTotal}<span className="text-xs sm:text-sm ml-1 font-bold text-gray-400">分钟</span>
                                    </div>
                                    {statsData.todayTotal > 0 ? (
                                        <div className="text-[10px] text-green-600 font-bold mt-1.5 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                            🔥 保持专注
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-slate-400 font-medium mt-1.5">
                                            今日待打卡
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                                    <div className="text-gray-500 text-xs font-bold mb-1">
                                        日均投入 ({statsData.daysCount}天)
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-700">
                                        {statsData.dailyAvg}<span className="text-xs sm:text-sm ml-1 font-bold text-gray-400">分钟</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium mt-1.5">
                                        {statsData.dailyAvg > 0 ? `${formatDurationMinutes(statsData.dailyAvg)} / 天` : '暂无数据'}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                                    <div className="text-gray-500 text-xs font-bold mb-1">
                                        周期累计投入
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black text-indigo-600">
                                        {Math.floor(statsData.rangeTotal / 60)}<span className="text-xs sm:text-sm ml-0.5 font-bold text-gray-400">h</span>{statsData.rangeTotal % 60}<span className="text-xs sm:text-sm ml-0.5 font-bold text-gray-400">m</span>
                                    </div>
                                    <div className="text-[10px] text-indigo-500 font-medium mt-1.5">
                                        共 {statsData.rangeTotal} 分钟
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                                    <div className="text-gray-500 text-xs font-bold mb-1">
                                        自律出勤率
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                                        {statsData.activeRate}<span className="text-xs sm:text-sm ml-0.5 font-bold text-gray-400">%</span>
                                    </div>
                                    <div className="text-[10px] text-emerald-600 font-medium mt-1.5">
                                        {statsData.activeDays} / {statsData.daysCount} 天已记录
                                    </div>
                                </div>
                            </div>

                            {/* --- 控制栏：分层标签与时间跨度选择器 --- */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col gap-5">
                                
                                {/* 1. 项目选择区 */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-xs text-gray-400 font-bold flex items-center gap-2">
                                            <span className={`w-1.5 h-4 rounded-full ${theme.primaryBg}`}></span>
                                            统计维度
                                        </div>
                                        <div className="text-[10px] text-gray-300 font-medium">
                                            共 {childTasks.length + 1} 个维度
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        <button 
                                            onClick={() => setSelectedTask('all')}
                                            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border cursor-pointer 
                                                ${selectedTask === 'all' 
                                                    ? `${theme.primaryBg} border-transparent text-white shadow-lg shadow-indigo-200 transform scale-105 z-10` 
                                                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            全览视图
                                            {selectedTask === 'all' && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>}
                                        </button>
                                        
                                        {childTasks.map(t => (
                                            <button 
                                                key={t.id} 
                                                onClick={() => setSelectedTask(t.id)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border cursor-pointer 
                                                    ${selectedTask === t.id 
                                                        ? `${theme.primaryBg} border-transparent text-white shadow-lg shadow-indigo-200 transform scale-105 z-10` 
                                                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200'
                                                    }`}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 分隔线 */}
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>

                                {/* 2. 时间范围选择 (包含对齐 Vocab Tool 的 14 天选项) */}
                                <div>
                                    <div className="text-xs text-gray-400 font-bold mb-3 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        时间跨度
                                    </div>
                                    <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit gap-1">
                                        {[
                                            { id: 'week', label: '近7天' },
                                            { id: 'biweek', label: '近14天' },
                                            { id: 'month', label: '近30天' },
                                            { id: 'total', label: '近90天' }
                                        ].map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => setTimeRange(r.id)}
                                                className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer 
                                                    ${timeRange === r.id 
                                                        ? 'bg-white text-gray-800 shadow-sm scale-[1.02]' 
                                                        : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 图表区域 (Vocab Tool 风格现代化趋势卡片) */}
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${theme.primaryBg}`}></span>
                                        <h3 className="text-sm sm:text-base font-bold text-gray-800">
                                            {selectedTask === 'all' ? '总投入时间趋势' : `${childTasks.find(t=>t.id===selectedTask)?.name || '单项'} 投入趋势`}
                                        </h3>
                                        <span className="text-xs text-gray-400 font-medium">
                                            ({timeRange === 'week' ? '近7天' : timeRange === 'biweek' ? '近14天' : timeRange === 'month' ? '近30天' : '近90天'})
                                        </span>
                                    </div>

                                    {/* 趋势研判徽章 (对齐 Vocab Tool 的 trendDiff 分析体系) */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {statsData.peakDay && statsData.maxMinutes > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                👑 单日峰值: {statsData.peakDay.label} ({statsData.maxMinutes}分)
                                            </span>
                                        )}
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                            statsData.trendDiff > 0.05
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : statsData.trendDiff < -0.05
                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {statsData.trendDiff > 0.05
                                                ? `📈 稳步上升 (+${statsData.trendPct}%)`
                                                : statsData.trendDiff < -0.05
                                                    ? `📉 有所回落 (${statsData.trendPct}%)`
                                                    : '➡️ 节奏平稳'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <SimpleLineChart 
                                        data={statsData.lineData} 
                                        color={chartColor} 
                                        height={260}
                                        unit="分钟"
                                        showAvgLine={true}
                                        avgValue={statsData.dailyAvg}
                                    />
                                </div>
                            </div>

                            {/* 智能学情寄语 */}
                            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-5 rounded-2xl border border-indigo-100 flex items-start gap-3.5 shadow-sm">
                                <div className="text-3xl select-none">💡</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                                            数据洞察 · 智库寄语
                                        </h4>
                                        <span className="text-[11px] text-indigo-500 font-semibold bg-indigo-100/60 px-2 py-0.5 rounded-full">
                                            {selectedTask === 'all' ? '宏观学情' : '单项深潜'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-indigo-800 mt-1.5 leading-relaxed">
                                        {statsData.rangeTotal === 0 ? (
                                            `当前选定的${timeRange === 'week' ? '近7天' : timeRange === 'biweek' ? '近14天' : timeRange === 'month' ? '近30天' : '近90天'}内暂无投入记录，开始今天的第一次打卡，点亮专属成长曲线吧！`
                                        ) : selectedTask === 'all' ? (
                                            statsData.trendDiff > 0.1
                                                ? `太棒了！近期总投入时间增长了 +${statsData.trendPct}%，自律势头非常强劲，保持这个黄金节奏！`
                                                : statsData.activeRate >= 80
                                                    ? `出勤率高达 ${statsData.activeRate}%，日拱一卒，功不唐捐！在选定周期内累计投入了 ${formatDurationMinutes(statsData.rangeTotal)}。`
                                                    : `在选定周期内累计投入了 ${formatDurationMinutes(statsData.rangeTotal)}，日均 ${statsData.dailyAvg} 分钟。保持稳定的每日习惯，比临时突击更显成效哦！`
                                        ) : (
                                            `在「${childTasks.find(t=>t.id===selectedTask)?.name || '当前任务'}」上，已累计投入 ${formatDurationMinutes(statsData.rangeTotal)}，日均 ${statsData.dailyAvg} 分钟，每一步付出都在沉淀深厚修为！`
                                        )}
                                    </p>
                                </div>
                            </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

export default StatsModal;
