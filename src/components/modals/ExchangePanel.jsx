import React from 'react';
import QRCode from 'qrcode';
import { EXCHANGE_WORKER_URL } from '../../constants/api.js';
import { getLocalDateKey } from '../../utils/date.js';
import { storage } from '../../utils/storage.js';
import { XIcon, Coins, TrendingUp, Sparkles, CheckCircle2 } from '../icons.jsx';

// 网络请求超时包装器（防止移动端弱网/断网时无限期挂起）
const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timer);
    }
};

// 生成兜底 7 天走势数据（确保手机端无网或首次冷启动时也能 100% 渲染平滑曲线）
const generateFallbackHistory = (todayUsd, baseCentsPerGold = 1) => {
    const res = [];
    const base = todayUsd || 0.14918;
    const now = new Date();
    // 过去 6 天的微小合理波动系数
    const waveFactors = [0.994, 0.991, 0.996, 1.002, 0.998, 1.004, 1.0];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${m}-${day}`;
        const factor = waveFactors[6 - i] || 1.0;
        res.push({
            date: `2026-${dateStr}`,
            usd: base * factor,
            label: i === 0 ? '今日' : dateStr
        });
    }
    return res;
};

// ===== 金元宝钱庄 · 零花钱兑换与财商科普面板 =====
export const ExchangePanel = ({ 
    show, 
    onClose, 
    totalGold = 0, 
    activeChild, 
    syncCode, 
    showToast = (typeof window !== "undefined" && window.showToast) || ((t, m) => alert(m)), 
    onExchangeComplete, 
    setWheelHistory, 
    tasks = {} 
}) => {
    const [rate, setRate] = React.useState(null);
    const [knowledge, setKnowledge] = React.useState(null);
    const [applying, setApplying] = React.useState(false);
    const [applyResult, setApplyResult] = React.useState(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState('');
    const [exchangeRecords, setExchangeRecords] = React.useState([]);
    const [priceItems, setPriceItems] = React.useState([]);
    const [walletExplainExpanded, setWalletExplainExpanded] = React.useState(false);
    const [exchangeTab, setExchangeTab] = React.useState('exchange'); // 默认进入兑换 Tab，符合操作直觉
    
    // 输入要兑换的人民币金额（字符串形式，方便输入编辑）
    const [cnyInput, setCnyInput] = React.useState('5');

    // 本地持久化与缓存汇率
    const [history, setHistory] = React.useState(() => {
        try {
            const cached = storage.getItem('app_exchange_rate_history');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });

    const [baseRate, setBaseRate] = React.useState(() => {
        try { const s = storage.getItem('app_exchange_base_rate'); return s ? JSON.parse(s) : null; } catch (e) { return null; }
    });
    
    const [volatility, setVolatility] = React.useState(() => {
        try { 
            const s = storage.getItem('app_exchange_volatility'); 
            return s ? JSON.parse(s) : { amplifier: 10, realRateToday: 0.149, realRateYesterday: 0.149, todayDate: '' }; 
        } catch (e) { 
            return { amplifier: 10, realRateToday: 0.149, realRateYesterday: 0.149, todayDate: '' }; 
        }
    });

    // 1. 初始化拉取数据
    React.useEffect(() => {
        if (!show) return;

        // 读取持久化基准
        try {
            const stored = storage.getItem('app_exchange_base_rate');
            if (stored) setBaseRate(JSON.parse(stored));
        } catch (e) {}

        // 获取今日汇率（带 6s 超时）
        fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/rate`, {}, 6000).then(r => r.json()).then(d => {
            if (d.ok && d.rate) {
                setRate(d.rate);
                if (!storage.getItem('app_exchange_base_rate')) {
                    storage.setItem('app_exchange_base_rate', JSON.stringify(d.rate));
                    setBaseRate(d.rate);
                }
                const todayStr = getLocalDateKey(0);
                const realRate = d.rate.rates?.USD || 0.149;
                setVolatility(prev => {
                    const updated = { ...prev };
                    if (prev.todayDate !== todayStr) {
                        updated.realRateYesterday = prev.realRateToday || realRate;
                        updated.realRateToday = realRate;
                        updated.todayDate = todayStr;
                    }
                    storage.setItem('app_exchange_volatility', JSON.stringify(updated));
                    return updated;
                });
            }
        }).catch(() => {});

        // 获取近7天历史汇率并持久缓存（带 6s 超时）
        fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/rate/history`, {}, 6000).then(r => r.json()).then(d => {
            if (d.ok && Array.isArray(d.history) && d.history.length > 0) {
                setHistory(d.history);
                storage.setItem('app_exchange_rate_history', JSON.stringify(d.history));
            }
        }).catch(() => {});

        // 获取财商知识卡片
        fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/knowledge`, {}, 5000).then(r => r.json()).then(d => {
            if (d.ok && d.card) setKnowledge(d.card);
        }).catch(() => {});

        // 获取物价数据
        fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/price/current`, {}, 5000).then(r => r.json()).then(d => {
            if (d.ok && d.items) setPriceItems(d.items);
        }).catch(() => {});
    }, [show, syncCode]);

    // 2. 轮询兑换记录（每 10 秒刷新 + 核销时自动扣金元宝）
    React.useEffect(() => {
        if (!show || (!syncCode && !activeChild)) return;
        const effectiveCode = syncCode || 'local_' + activeChild;

        const poll = () => {
            fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/exchange/status?code=${encodeURIComponent(effectiveCode)}`, {}, 6000)
                .then(r => r.json())
                .then(d => {
                    if (!d.records) return;
                    const childRecords = d.records.filter(r => r.childName === activeChild || !r.childName);
                    setExchangeRecords(childRecords);

                    // 自动恢复待核销申请，确保手机端随时可见二维码与核销码
                    const pendingOrder = childRecords.find(r => r.status === 'pending');
                    if (pendingOrder) {
                        setApplyResult(prev => {
                            if (!prev || prev.applyId !== pendingOrder.id) {
                                return {
                                    applyId: pendingOrder.id,
                                    verifyCode: pendingOrder.verifyCode,
                                    goldAmount: pendingOrder.goldAmount,
                                    cnyAmount: pendingOrder.cnyAmount,
                                    childName: pendingOrder.childName || activeChild
                                };
                            }
                            return prev;
                        });
                    }

                    // 检查已核销订单自动扣减
                    d.records.filter(r => r.childName === activeChild && r.status === 'verified').forEach(rec => {
                        const historyKey = `${activeChild}-EXCHANGE-${rec.id}`;
                        setWheelHistory(wh => {
                            if (wh[historyKey]) return wh;
                            const totalKey = `app_exchange_total_${activeChild}`;
                            try {
                                const prev = parseFloat(storage.getItem(totalKey) || '0');
                                storage.setItem(totalKey, String(prev + (rec.cnyAmount || 0)));
                            } catch (e) {}
                            showToast('success', `🎉 家长已核销 ¥${rec.cnyAmount} 元零花钱！金元宝已结清。`);
                            return { ...wh, [historyKey]: -(rec.goldAmount || 0) };
                        });

                        // 如果当前显示的弹窗正是刚核销的单，关闭展示
                        if (applyResult && applyResult.applyId === rec.id) {
                            setApplyResult(null);
                        }
                    });
                })
                .catch(() => {});
        };

        poll();
        const interval = setInterval(poll, 10000);
        return () => clearInterval(interval);
    }, [show, syncCode, activeChild, applyResult]);

    // 3. 汇率核心换算
    const currentRate = rate?.rates?.USD || 0.14918;
    const baseCnyUsd = baseRate?.rates?.USD || currentRate;
    const rawTodayRate = baseCnyUsd > 0 ? (currentRate / baseCnyUsd) : 1;
    const amplifier = volatility.amplifier || 10;
    const realYesterday = volatility.realRateYesterday || currentRate;
    const realToday = volatility.realRateToday || currentRate;
    const realChange = realYesterday > 0 ? (realToday / realYesterday) : 1;
    const amplifiedChange = 1 + (realChange - 1) * amplifier;
    const todayRate = rawTodayRate * (Number.isFinite(amplifiedChange) ? amplifiedChange : 1);

    const baseCentsPerGold = (() => { 
        try { return parseFloat(storage.getItem('app_exchange_base_cents') || '1'); } catch(e) { return 1; } 
    })();
    // 1 金元宝 = X 元人民币
    const cnyPerGold = Math.max(0.001, (todayRate * baseCentsPerGold) / 100);

    // 每日变动百分比
    const yesterdayRate = rawTodayRate * (1 + (realChange - 1) * amplifier * (realYesterday && realToday ? (realYesterday / realToday) : 1));
    const yesterdayCnyPerGold = (yesterdayRate * baseCentsPerGold) / 100;
    const dailyChange = cnyPerGold - yesterdayCnyPerGold;
    const dailyChangePercent = yesterdayCnyPerGold > 0 ? ((dailyChange / yesterdayCnyPerGold) * 100).toFixed(1) : '0.0';

    // 财富总额人民币等值
    const totalCny = (totalGold * cnyPerGold).toFixed(2);

    // 门槛配置
    const minGoldLimit = (() => { 
        try { return parseInt(storage.getItem('app_exchange_min_gold') || '500', 10); } catch(e) { return 500; } 
    })();
    // 最低人民币起兑值
    const minCny = (minGoldLimit * cnyPerGold).toFixed(2);
    // 账户最大可兑人民币
    const maxCny = (totalGold * cnyPerGold).toFixed(2);

    // 趋势建议
    const trendAdvice = todayRate > 1.02 ? '📈 当前汇率升值，金元宝更值钱，正是兑换好时机！' :
                       todayRate < 0.98 ? '📉 当前汇率微跌，建议暂时积攒，等升值后再兑换。' :
                       '➡️ 汇率平稳如常，可按需随时兑换。';

    // 4. 输入值与换算推导
    const targetCny = Math.max(0, parseFloat(cnyInput) || 0);
    // 向上取整所需金元宝
    const neededGold = targetCny > 0 ? Math.ceil(targetCny / cnyPerGold) : 0;
    const remainingGold = totalGold - neededGold;
    const isZero = targetCny <= 0;
    const isExceeding = neededGold > totalGold;
    const isBelowMin = neededGold < minGoldLimit;
    const canSubmit = !isZero && !isExceeding && !isBelowMin && !applying;

    // 5. 纯离线高性能生成核销二维码 Data URL（彻底告别外部失效第三方服务）
    React.useEffect(() => {
        if (!applyResult || !applyResult.applyId) {
            setQrCodeDataUrl('');
            return;
        }
        let active = true;
        const verifyUrl = `https://www.daka-tool.top/exchange-verify.html?id=${applyResult.applyId}&child=${encodeURIComponent(activeChild)}&gold=${applyResult.goldAmount || neededGold}&cny=${applyResult.cnyAmount || targetCny}&rate=${(cnyPerGold * 100).toFixed(2)}`;

        QRCode.toDataURL(verifyUrl, {
            width: 320,
            margin: 2,
            color: { dark: '#065f46', light: '#ffffff' },
            errorCorrectionLevel: 'M'
        }).then(url => {
            if (active) setQrCodeDataUrl(url);
        }).catch(err => {
            console.error('[Exchange] Local QRCode generation failed:', err);
        });

        return () => { active = false; };
    }, [applyResult, activeChild, neededGold, targetCny, cnyPerGold]);

    // 6. 7天走势图数据装配（确保手机端 100% 具备 7 个有效数据点）
    const displayHistory = React.useMemo(() => {
        if (Array.isArray(history) && history.length >= 2) {
            const last7 = history.slice(-7);
            return last7.map((h, i) => {
                const datePart = h.date ? h.date.slice(5) : '';
                return {
                    date: h.date,
                    usd: h.usd || currentRate,
                    label: i === last7.length - 1 ? '今日' : datePart
                };
            });
        }
        return generateFallbackHistory(currentRate, baseCentsPerGold);
    }, [history, currentRate, baseCentsPerGold]);

    const chartPoints = React.useMemo(() => {
        const baseUsd = baseCnyUsd || 0.14918;
        return displayHistory.map(h => {
            const raw = baseUsd > 0 ? (h.usd / baseUsd) : 1;
            // 折算成 分/元宝
            const cents = (raw * baseCentsPerGold);
            return {
                label: h.label,
                cents: parseFloat(cents.toFixed(2))
            };
        });
    }, [displayHistory, baseCnyUsd, baseCentsPerGold]);

    // 7. 提交兑换申请
    const handleApply = async () => {
        if (isZero) return showToast('warning', '请输入要兑换的现金金额');
        if (isBelowMin) return showToast('warning', `最低起兑门槛为 ${minGoldLimit} 金元宝（约合 ¥${minCny} 元）`);
        if (isExceeding) return showToast('warning', `金元宝储蓄不足！您当前最多可兑换 ¥${maxCny} 元`);

        const maxSingle = (() => { try { return parseInt(storage.getItem('app_exchange_max_single') || '0', 10); } catch(e) { return 0; } })();
        const maxWeekly = (() => { try { return parseInt(storage.getItem('app_exchange_max_weekly') || '0', 10); } catch(e) { return 0; } })();

        if (maxSingle > 0 && neededGold > maxSingle) {
            return showToast('warning', `超过家长设置的单次上限 ${maxSingle} 金元宝（约 ¥${(maxSingle * cnyPerGold).toFixed(2)} 元）`);
        }

        if (maxWeekly > 0) {
            const now = new Date();
            const dayOfWeek = now.getDay() || 7;
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - dayOfWeek + 1);
            weekStart.setHours(0, 0, 0, 0);
            const weeklyUsed = exchangeRecords
                .filter(r => r.status === 'verified' && new Date(r.verifiedAt || r.createdAt) >= weekStart)
                .reduce((sum, r) => sum + (r.goldAmount || 0), 0);
            if (weeklyUsed + neededGold > maxWeekly) {
                const remaining = Math.max(0, maxWeekly - weeklyUsed);
                return showToast('warning', `每周兑换上限 ${maxWeekly} 金元宝，本周已用 ${weeklyUsed}，还可兑约 ¥${(remaining * cnyPerGold).toFixed(2)} 元`);
            }
        }

        setApplying(true);
        const effectiveCode = syncCode || 'local_' + activeChild;

        try {
            // 带有 9 秒超时控制，彻底杜绝手机端无限期卡顿
            const resp = await fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/exchange/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    syncCode: effectiveCode,
                    childName: activeChild,
                    goldAmount: neededGold,
                    rate: cnyPerGold,
                    cnyAmount: targetCny
                })
            }, 9000);

            const data = await resp.json();

            if (data.ok) {
                setApplyResult({
                    ...data,
                    goldAmount: neededGold,
                    cnyAmount: targetCny
                });
                showToast('success', `🎉 申请已提交！请家长扫码核销 ¥${targetCny.toFixed(2)} 元零花钱`);
                // 刷新记录列表
                fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/exchange/status?code=${encodeURIComponent(effectiveCode)}`, {}, 6000)
                    .then(r => r.json())
                    .then(d => { if (d.records) setExchangeRecords(d.records); })
                    .catch(() => {});
            } else if (data.error && data.error.includes('未核销')) {
                // 如果发现之前已有未核销单，直接拉取并呈现该单的二维码与核销码，避免报错和重复卡死
                const statusResp = await fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/exchange/status?code=${encodeURIComponent(effectiveCode)}`, {}, 6000);
                const statusData = await statusResp.json();
                const pendingRecord = (statusData.records || []).find(r => r.status === 'pending' && (!r.childName || r.childName === activeChild));

                if (pendingRecord) {
                    setApplyResult({
                        applyId: pendingRecord.id,
                        verifyCode: pendingRecord.verifyCode,
                        goldAmount: pendingRecord.goldAmount,
                        cnyAmount: pendingRecord.cnyAmount,
                        childName: pendingRecord.childName || activeChild
                    });
                    showToast('info', '已为您展示待家长核销的二维码与核销码！若想更换金额可点击下方撤销重新申请。');
                } else {
                    showToast('error', data.error);
                }
            } else if (data.error && data.error.includes('限兑')) {
                showToast('warning', data.error);
            } else {
                showToast('error', data.error || '申请提交失败，请重试');
            }
        } catch (e) {
            if (e.name === 'AbortError') {
                showToast('error', '提交超时，手机网络连接较弱，请稍后重试！');
            } else {
                showToast('error', '网络异常：' + (e.message || '请检查网络后重试'));
            }
        } finally {
            // 无论如何保证解除按钮 loading，绝不卡死
            setApplying(false);
        }
    };

    // 撤销待核销申请
    const handleCancelPending = async (applyIdToCancel) => {
        const id = applyIdToCancel || applyResult?.applyId;
        if (!id) return;
        setApplying(true);
        const effectiveCode = syncCode || 'local_' + activeChild;
        try {
            const resp = await fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/exchange/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applyId: id, syncCode: effectiveCode })
            }, 6000);
            const data = await resp.json();
            if (data.ok) {
                setApplyResult(null);
                showToast('success', '已撤销该申请，您可以重新输入金额兑换！');
                fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/exchange/status?code=${encodeURIComponent(effectiveCode)}`, {}, 6000)
                    .then(r => r.json())
                    .then(d => { if (d.records) setExchangeRecords(d.records); })
                    .catch(() => {});
            } else {
                showToast('error', data.error || '撤销失败，请重试');
            }
        } catch (e) {
            showToast('error', '网络异常，撤销失败：' + (e.message || '请检查网络'));
        } finally {
            setApplying(false);
        }
    };

    if (!show) return null;

    // SVG 走势图尺寸与计算
    const chartW = 340;
    const chartH = 96;
    const padL = 24;
    const padR = 24;
    const padT = 16;
    const padB = 26;
    const plotW = chartW - padL - padR;
    const plotH = chartH - padT - padB;

    const centsArr = chartPoints.map(p => p.cents).filter(Number.isFinite);
    const minVal = centsArr.length > 0 ? Math.min(...centsArr) : 1.0;
    const maxVal = centsArr.length > 0 ? Math.max(...centsArr) : 1.0;
    const ySpan = Math.max(0.02, maxVal - minVal);
    const yMin = minVal - ySpan * 0.15;
    const yMax = maxVal + ySpan * 0.15;
    const yRange = yMax - yMin;

    const coords = chartPoints.map((p, idx) => {
        const x = padL + (idx / Math.max(1, chartPoints.length - 1)) * plotW;
        const normalizedY = (p.cents - yMin) / yRange;
        const y = padT + (1 - normalizedY) * plotH;
        return { x, y, cents: p.cents, label: p.label };
    });

    const polylinePoints = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const areaPoints = `${coords[0]?.x.toFixed(1)},${(padT + plotH).toFixed(1)} ` +
        polylinePoints +
        ` ${coords[coords.length - 1]?.x.toFixed(1)},${(padT + plotH).toFixed(1)}`;

    return (
        <div 
            className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-xl max-h-[90vh] shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
                
                {/* 1. 钱庄顶栏 */}
                <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex justify-between items-center shrink-0 shadow-md relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/30">
                            💱
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black tracking-wide drop-shadow-sm">
                                    金元宝钱庄 · 零花钱兑换
                                </h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                                    {activeChild || '学子'}
                                </span>
                            </div>
                            <p className="text-white/90 text-xs mt-0.5">
                                财商启蒙 · 真实世界汇率与物价联动实践
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-95"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. 分段 Tab 导航 */}
                <div className="px-5 pt-3 pb-2.5 bg-gray-50/90 border-b border-gray-200/80 shrink-0">
                    <div className="bg-gray-200/70 p-1 rounded-2xl flex relative">
                        <div 
                            className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-all duration-300"
                            style={{
                                width: 'calc(50% - 4px)',
                                left: exchangeTab === 'exchange' ? '4px' : 'calc(50%)',
                            }}
                        />
                        <button 
                            type="button"
                            onClick={() => setExchangeTab('exchange')}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl relative z-10 transition-colors flex items-center justify-center gap-1.5 ${
                                exchangeTab === 'exchange' ? 'text-amber-800' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <span>💰 零花钱兑换处</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setExchangeTab('learn')}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl relative z-10 transition-colors flex items-center justify-center gap-1.5 ${
                                exchangeTab === 'learn' ? 'text-amber-800' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <span>📈 汇率走势与科普</span>
                        </button>
                    </div>
                </div>

                {/* 3. 滚动主体区域 */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gradient-to-b from-gray-50/50 to-white space-y-4">
                    {exchangeTab === 'exchange' ? (
                        <>
                            {/* 资产简报卡片 */}
                            <div className="bg-gradient-to-r from-amber-50 via-yellow-50/70 to-orange-50 rounded-2xl p-4 border border-amber-200 shadow-xs flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-100/80 flex items-center justify-center text-xl shadow-xs">
                                        🪙
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-gray-500 font-medium">当前金元宝储蓄</div>
                                        <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
                                            {totalGold.toLocaleString()} <span className="text-xs font-bold text-gray-500">元宝</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] text-gray-500 font-medium">约合公允现金</div>
                                    <div className="text-base sm:text-lg font-black text-emerald-600 font-mono">
                                        ≈ ¥{maxCny} <span className="text-xs text-gray-500">元</span>
                                    </div>
                                </div>
                            </div>

                            {/* 核心区域：若已提交则置顶展示电子汇票二维码与核销码，否则展示人民币输入表单 */}
                            {applyResult ? (
                                <div className="bg-emerald-50/90 rounded-3xl p-5 border-2 border-emerald-300 text-center shadow-lg animate-in zoom-in-95 duration-200">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-2xl mb-2 shadow-inner">
                                        ✅
                                    </div>
                                    <div className="text-lg font-black text-emerald-800">
                                        兑换申请已提交 · 待家长核销
                                    </div>
                                    <div className="text-xs text-emerald-600 mt-0.5">
                                        请家长使用微信扫码或输入下方 4 位核销码完成线下结算
                                    </div>
                                    
                                    {/* 本地 0ms 纯离线生成的清晰二维码 */}
                                    <div className="flex justify-center my-4 p-3.5 bg-white rounded-2xl shadow-inner border border-emerald-100 inline-block">
                                        {qrCodeDataUrl ? (
                                            <img 
                                                src={qrCodeDataUrl} 
                                                alt="核销二维码" 
                                                className="w-44 h-44 rounded-xl" 
                                            />
                                        ) : (
                                            <div className="w-44 h-44 rounded-xl flex items-center justify-center bg-gray-50 text-emerald-600 text-xs font-bold animate-pulse">
                                                二维码生成中...
                                            </div>
                                        )}
                                    </div>

                                    {/* 4 位核销码大字展示 */}
                                    <div className="bg-white/90 rounded-2xl py-3 px-4 max-w-xs mx-auto border border-emerald-200/80 mb-2">
                                        <div className="text-[11px] text-gray-500 font-bold mb-1">家长核销码</div>
                                        <div className="text-3xl font-black text-emerald-700 tracking-widest font-mono">
                                            {applyResult.verifyCode}
                                        </div>
                                        <div className="text-[11px] text-emerald-600 font-bold mt-1">
                                            对应现金：¥{parseFloat(applyResult.cnyAmount || targetCny).toFixed(2)} 元
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-gray-400 mt-2">
                                        防伪核销码 48 小时内有效 · 家长确认转账核销后系统自动扣除金元宝
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-emerald-200/60 flex flex-col sm:flex-row gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleCancelPending(applyResult.applyId)}
                                            className="flex-1 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xs border border-rose-300 transition-colors flex items-center justify-center gap-1 shadow-xs"
                                        >
                                            <span>❌ 撤销申请 · 重新兑换</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const verifyUrl = `https://www.daka-tool.top/exchange-verify.html?id=${applyResult.applyId}&child=${encodeURIComponent(applyResult.childName || activeChild)}&gold=${applyResult.goldAmount || neededGold}&cny=${applyResult.cnyAmount || targetCny}&rate=${(cnyPerGold * 100).toFixed(2)}`;
                                                if (navigator.clipboard) {
                                                    navigator.clipboard.writeText(verifyUrl);
                                                    showToast('success', '已复制核销链接，可直接粘贴发给家长微信！');
                                                } else {
                                                    showToast('info', verifyUrl);
                                                }
                                            }}
                                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1"
                                        >
                                            <span>📋 复制核销链接</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* 核心兑换表单：输入人民币金额 + 实时联动换算 */
                                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200/90 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                                            <span>💰 想要兑换多少零花钱？</span>
                                        </h3>
                                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                            实时汇率: {(cnyPerGold * 100).toFixed(2)} 分/元宝
                                        </span>
                                    </div>

                                    {/* 人民币大字号输入框（标准微信/支付宝转账风格：大¥符号，无右侧多余文字错乱） */}
                                    <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/30 to-amber-50/70 p-4 rounded-2xl border-2 border-amber-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
                                        <div className="text-xs text-amber-900/80 font-bold mb-1.5 flex justify-between items-center">
                                            <span>兑现金额 (元人民币)</span>
                                            <span className="text-[11px] text-gray-500 font-normal">
                                                最多可兑 <b className="text-emerald-600 font-mono">¥{maxCny}</b> 元
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl sm:text-4xl font-black text-amber-600 font-mono select-none">
                                                ¥
                                            </span>
                                            <input 
                                                type="number"
                                                inputMode="decimal"
                                                min="0.1"
                                                step="any"
                                                value={cnyInput}
                                                onChange={e => setCnyInput(e.target.value)}
                                                placeholder="0.00"
                                                className="flex-1 bg-transparent text-3xl sm:text-4xl font-black text-gray-800 font-mono outline-none placeholder:text-gray-300 placeholder:text-2xl"
                                            />
                                        </div>
                                    </div>

                                    {/* 快捷筹码按钮（面额全覆盖起兑门槛，杜绝过小面额报错） */}
                                    <div className="space-y-1.5">
                                        <div className="text-[11px] font-bold text-gray-400">快捷面额选择：</div>
                                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                                            {[5, 10, 20, 50, 100].map(val => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setCnyInput(String(val))}
                                                    className={`py-2 rounded-xl text-xs font-black transition-all border ${
                                                        targetCny === val
                                                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-102'
                                                            : 'bg-amber-50/80 text-amber-800 hover:bg-amber-100 border-amber-200/80'
                                                    }`}
                                                >
                                                    ¥{val}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setCnyInput(String(Math.ceil(parseFloat(minCny) || 5)))}
                                                className="flex-1 py-1.5 rounded-xl text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200"
                                            >
                                                🎯 起兑档 (¥{Math.ceil(parseFloat(minCny) || 5)})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCnyInput(maxCny)}
                                                disabled={parseFloat(maxCny) <= 0}
                                                className="flex-1 py-1.5 rounded-xl text-[11px] font-bold bg-amber-100/80 hover:bg-amber-200/80 text-amber-800 transition-colors border border-amber-200 disabled:opacity-50"
                                            >
                                                ⚡ 全部换完 (¥{maxCny})
                                            </button>
                                        </div>
                                    </div>

                                    {/* 实时双向换算账单卡片 */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200/80 space-y-2.5 text-xs">
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span className="flex items-center gap-1.5">
                                                <span>🪙</span> 需扣减金元宝
                                            </span>
                                            <span className="font-black text-amber-600 font-mono text-sm">
                                                {neededGold.toLocaleString()} 金币
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span className="flex items-center gap-1.5">
                                                <span>👛</span> 现有金元宝余额
                                            </span>
                                            <span className="font-bold text-gray-700 font-mono">
                                                {totalGold.toLocaleString()} 金币
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600 border-t border-gray-200/60 pt-2">
                                            <span className="flex items-center gap-1.5">
                                                <span>💰</span> 兑换后预计剩余
                                            </span>
                                            <span className={`font-bold font-mono ${remainingGold < 0 ? 'text-rose-600 font-black' : 'text-gray-700'}`}>
                                                {remainingGold < 0 ? '储蓄不足' : `${remainingGold.toLocaleString()} 金币`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-200/60 pt-2 text-gray-800">
                                            <span className="font-bold flex items-center gap-1.5">
                                                <span>💵</span> 拟到账零花钱
                                            </span>
                                            <span className="font-black text-emerald-600 text-lg font-mono">
                                                ¥{targetCny.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 校验提示 */}
                                    {isExceeding && (
                                        <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-bold flex items-center gap-2 animate-in fade-in">
                                            <span>⚠️</span> 金元宝储蓄不足！您当前最多可兑换 ¥{maxCny} 元现金。
                                        </div>
                                    )}
                                    {!isExceeding && isBelowMin && targetCny > 0 && (
                                        <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 font-bold flex items-center justify-between animate-in fade-in">
                                            <div className="flex items-center gap-1.5">
                                                <span>💡</span>
                                                <span>最低需兑 {minGoldLimit} 金元宝（约合 ¥{minCny} 元）</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCnyInput(String(Math.ceil(parseFloat(minCny) || 5)))}
                                                className="text-[11px] underline text-amber-900 font-black hover:text-amber-700"
                                            >
                                                设为最低门槛
                                            </button>
                                        </div>
                                    )}

                                    {/* 提交按钮 */}
                                    <button 
                                        type="button"
                                        onClick={handleApply} 
                                        disabled={!canSubmit}
                                        className={`w-full py-4 rounded-2xl font-black text-base text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                                            canSubmit 
                                                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:shadow-lg active:scale-98' 
                                                : 'bg-gray-300 cursor-not-allowed opacity-70'
                                        }`}
                                    >
                                        {applying ? (
                                            <>
                                                <Sparkles className="w-5 h-5 animate-spin" />
                                                <span>正在提交兑换契约...</span>
                                            </>
                                        ) : canSubmit ? (
                                            <>
                                                <span>申请兑换 ¥{targetCny.toFixed(2)} 元零花钱 💰</span>
                                            </>
                                        ) : isZero ? (
                                            '请输入要兑换的现金金额'
                                        ) : isExceeding ? (
                                            '金元宝储蓄不足'
                                        ) : isBelowMin ? (
                                            `未达起兑门槛（需 ${minGoldLimit} 元宝，约 ¥${minCny} 元）`
                                        ) : (
                                            '无法兑换'
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* 历史兑换记录列表 */}
                            {exchangeRecords.length > 0 && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold text-gray-700">📜 历史兑换记录</h3>
                                        {(() => {
                                            try {
                                                const total = parseFloat(storage.getItem(`app_exchange_total_${activeChild}`) || '0');
                                                if (total > 0) return (
                                                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        累计已核销 ¥{total.toFixed(2)}
                                                    </span>
                                                );
                                            } catch (e) {}
                                            return null;
                                        })()}
                                    </div>

                                    <div className="space-y-2">
                                        {exchangeRecords.filter(r => r.status !== 'cancelled').slice(0, 5).map(r => (
                                            <div key={r.id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                                                <div>
                                                    <div className="font-bold text-gray-800">{r.goldAmount} 金元宝</div>
                                                    <div className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString('zh-CN')}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-emerald-600 font-mono text-sm">¥{r.cnyAmount}</span>
                                                    {r.status === 'pending' && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => setApplyResult({ applyId: r.id, verifyCode: r.verifyCode, cnyAmount: r.cnyAmount, goldAmount: r.goldAmount })}
                                                            className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold px-2 py-0.5 rounded-md border border-amber-200 transition-colors"
                                                        >
                                                            核销码
                                                        </button>
                                                    )}
                                                    {r.status === 'pending' && (
                                                        <button 
                                                            type="button"
                                                            onClick={async () => {
                                                                try {
                                                                    const effectiveCode = syncCode || 'local_' + activeChild;
                                                                    const resp = await fetchWithTimeout(`${EXCHANGE_WORKER_URL}/api/exchange/cancel`, {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ applyId: r.id, syncCode: effectiveCode })
                                                                    }, 6000);
                                                                    const data = await resp.json();
                                                                    if (data.ok) {
                                                                        setExchangeRecords(prev => prev.map(rec => rec.id === r.id ? { ...rec, status: 'cancelled' } : rec));
                                                                        if (applyResult && applyResult.applyId === r.id) setApplyResult(null);
                                                                        showToast('success', '兑换已撤销');
                                                                    } else {
                                                                        showToast('error', data.error || '取消失败');
                                                                    }
                                                                } catch (e) { showToast('error', '网络错误'); }
                                                            }} 
                                                            className="text-[10px] text-rose-500 bg-rose-50 hover:bg-rose-100 font-bold px-2 py-0.5 rounded-md border border-rose-200 transition-colors"
                                                        >
                                                            取消
                                                        </button>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        r.status === 'verified' 
                                                            ? 'bg-emerald-100 text-emerald-800' 
                                                            : r.status === 'cancelled' 
                                                                ? 'bg-gray-100 text-gray-500' 
                                                                : 'bg-amber-100 text-amber-800 animate-pulse'
                                                    }`}>
                                                        {r.status === 'verified' ? '✅ 已核销' : r.status === 'cancelled' ? '❌ 已取消' : '⏳ 待核销'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* 走势与财商科普 Tab */
                        <>
                            {/* 1. 近 7 天汇率走势图卡片（响应式、渐变填充、100% 手机端显示） */}
                            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-600">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-black text-gray-800">
                                                近 7 天金元宝汇率走势
                                            </h3>
                                            <p className="text-[10px] text-gray-400">真实汇率变动联动教学放大</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-mono">
                                        {(cnyPerGold * 100).toFixed(2)} 分 / 元宝
                                    </span>
                                </div>

                                {/* 走势图 SVG 画布 */}
                                <div className="py-2 px-1 bg-gradient-to-b from-amber-50/30 to-white rounded-2xl border border-gray-100">
                                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-24 overflow-visible">
                                        <defs>
                                            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* 参考虚线 */}
                                        <line x1={padL} y1={padT} x2={chartW - padR} y2={padT} stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="3,3" />
                                        <line x1={padL} y1={padT + plotH / 2} x2={chartW - padR} y2={padT + plotH / 2} stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="3,3" />
                                        <line x1={padL} y1={padT + plotH} x2={chartW - padR} y2={padT + plotH} stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="3,3" />

                                        {/* 渐变阴影填充面 */}
                                        <polygon points={areaPoints} fill="url(#chartAreaGradient)" />

                                        {/* 走势平滑折线 */}
                                        <polyline
                                            fill="none"
                                            stroke="#f59e0b"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={polylinePoints}
                                        />

                                        {/* 每日数据点圆圈 */}
                                        {coords.map((c, i) => {
                                            const isLast = i === coords.length - 1;
                                            return (
                                                <g key={i}>
                                                    <circle 
                                                        cx={c.x} 
                                                        cy={c.y} 
                                                        r={isLast ? 4.5 : 2.5} 
                                                        fill={isLast ? '#f59e0b' : '#fff'} 
                                                        stroke="#f59e0b" 
                                                        strokeWidth={isLast ? 2 : 1.5} 
                                                    />
                                                    {/* X 轴日期文本 */}
                                                    <text 
                                                        x={c.x} 
                                                        y={chartH - 8} 
                                                        textAnchor="middle" 
                                                        className={`text-[9px] font-mono ${isLast ? 'fill-amber-700 font-bold' : 'fill-gray-400'}`}
                                                    >
                                                        {c.label}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>

                                {/* 走势时机分析建议 */}
                                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-500">时机分析:</span>
                                        <span className="font-black text-amber-800">{trendAdvice}</span>
                                    </div>
                                    {Math.abs(dailyChange) > 0.0001 && (
                                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                                            dailyChange > 0 
                                                ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        }`}>
                                            {dailyChange > 0 ? '📈 升值' : '📉 走低'} {dailyChangePercent}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 2. 财商物价折算篮子 */}
                            {priceItems.length > 0 && (
                                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                            <span>🧋 你的财富能买什么？</span>
                                        </h3>
                                        <span className="text-[10px] text-gray-400 font-medium">按真实市价换算</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {priceItems.map(item => {
                                            const canBuy = parseFloat(totalCny) > 0 ? (parseFloat(totalCny) / item.currentPrice).toFixed(1) : '0';
                                            return (
                                                <div key={item.id} className="flex items-center justify-between bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-2xl shrink-0">{item.icon}</span>
                                                        <div>
                                                            <div className="text-xs font-bold text-gray-800">{item.brand} {item.name}</div>
                                                            <div className="text-[10px] text-gray-400 font-mono">市价约 {item.currentPrice} 元/份</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm sm:text-base font-black text-emerald-600 font-mono">{canBuy}</div>
                                                        <div className="text-[10px] text-gray-400">份</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 3. 今日财商知识卡片（启蒙科普） */}
                            {knowledge && (
                                <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-purple-50/60 rounded-3xl p-4 sm:p-5 border border-indigo-200/80 shadow-xs space-y-2">
                                    <div className="flex items-center gap-2 text-indigo-900 font-black text-xs sm:text-sm">
                                        <span className="text-lg">💡</span>
                                        <span>今日财商启蒙：{knowledge.title}</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed bg-white/70 p-3 rounded-2xl border border-indigo-100/70">
                                        {knowledge.content}
                                    </p>
                                    {knowledge.quiz && (
                                        <div className="mt-2 text-xs bg-indigo-100/60 p-3 rounded-2xl border border-indigo-200/60">
                                            <div className="font-bold text-indigo-950 mb-1">🤔 小思考：{knowledge.quiz}</div>
                                            <div className="text-indigo-800 font-medium">✨ 解答：{knowledge.answer}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 4. 汇率波动机制解读展开 */}
                            {totalGold > 0 && (
                                <div className="pt-1 text-center">
                                    <button 
                                        type="button"
                                        onClick={() => setWalletExplainExpanded(!walletExplainExpanded)}
                                        className="text-xs text-amber-700 hover:text-amber-900 font-bold inline-flex items-center gap-1 transition-colors bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200"
                                    >
                                        <span>🔍 为什么今天的汇率和价值会变动？</span>
                                        <span>{walletExplainExpanded ? '收起 ▲' : '查看原理解读 ▼'}</span>
                                    </button>
                                    
                                    {walletExplainExpanded && (() => {
                                        const realChangePercent = realYesterday && realToday
                                            ? ((realToday / realYesterday - 1) * 100).toFixed(2)
                                            : '0.00';
                                        const amp = volatility.amplifier || 10;
                                        const amplifiedPercent = (parseFloat(realChangePercent) * amp).toFixed(2);
                                        const isUp = parseFloat(realChangePercent) > 0;
                                        const yesterdayCny = (totalGold * yesterdayCnyPerGold).toFixed(2);
                                        const todayCny = (totalGold * cnyPerGold).toFixed(2);
                                        return (
                                            <div className="mt-3 text-left bg-white/95 rounded-2xl p-4 text-xs text-gray-600 space-y-3 border border-amber-200 shadow-sm animate-in fade-in duration-200">
                                                <div>
                                                    <div className="font-black text-gray-800 mb-1 flex items-center gap-1">
                                                        <span>🌍 真实世界发生了什么？</span>
                                                    </div>
                                                    <p className="leading-relaxed">
                                                        人民币对美元{isUp ? '升值' : '贬值'}了 <span className={`font-bold ${isUp ? 'text-rose-600' : 'text-emerald-600'}`}>{isUp ? '+' : ''}{realChangePercent}%</span>
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                                        昨日 1 元 ≈ ${realYesterday.toFixed(4)} USD，今日 1 元 ≈ ${realToday.toFixed(4)} USD
                                                    </p>
                                                </div>

                                                <div className="border-t border-gray-100 pt-2">
                                                    <div className="font-black text-gray-800 mb-1">🪙 钱庄教育放大机制:</div>
                                                    <p className="leading-relaxed">
                                                        为了让小朋友直观感受全球经济的脉动，钱庄将实际微小汇率波动放大了 <span className="font-bold text-amber-600 font-mono">{amp} 倍</span>。
                                                    </p>
                                                    <p className="font-semibold text-gray-700 mt-0.5">
                                                        感知变动幅度: <span className={`font-bold ${isUp ? 'text-rose-600' : 'text-emerald-600'}`}>{isUp ? '+' : ''}{amplifiedPercent}%</span>
                                                    </p>
                                                </div>

                                                <div className="border-t border-gray-100 pt-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                                                    <div className="font-bold text-amber-900 mb-1">💰 储蓄折现对比:</div>
                                                    <p>昨日等值: <b>{yesterdayCny} 元</b></p>
                                                    <p>今日等值: <b className="text-amber-700">{todayCny} 元</b>（较昨日 {isUp ? '增值' : '缩水'} {Math.abs(parseFloat(todayCny) - parseFloat(yesterdayCny)).toFixed(2)} 元）</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExchangePanel;
