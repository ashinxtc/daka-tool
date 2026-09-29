import React from 'react';
import { EXCHANGE_WORKER_URL } from '../../constants/api.js';
import { getLocalDateKey } from '../../utils/date.js';
import { XIcon, Coins, TrendingUp, Sparkles, CheckCircle2 } from '../icons.jsx';

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
    const [history, setHistory] = React.useState([]);
    const [knowledge, setKnowledge] = React.useState(null);
    const [exchangeAmount, setExchangeAmount] = React.useState(500);
    const [applying, setApplying] = React.useState(false);
    const [applyResult, setApplyResult] = React.useState(null);
    const [exchangeRecords, setExchangeRecords] = React.useState([]);
    const [quizOpen, setQuizOpen] = React.useState(false);
    const [priceItems, setPriceItems] = React.useState([]);
    const [rateExpanded, setRateExpanded] = React.useState(false);
    const [walletExplainExpanded, setWalletExplainExpanded] = React.useState(false);
    const [exchangeTab, setExchangeTab] = React.useState('learn'); // 'learn' | 'exchange'
    
    const [baseRate, setBaseRate] = React.useState(() => {
        try { const s = localStorage.getItem('app_exchange_base_rate'); return s ? JSON.parse(s) : null; } catch (e) { return null; }
    });
    const [volatility, setVolatility] = React.useState(() => {
        try { const s = localStorage.getItem('app_exchange_volatility'); return s ? JSON.parse(s) : { amplifier: 10, realRateToday: 0, realRateYesterday: 0, todayDate: '' }; } catch (e) { return { amplifier: 10, realRateToday: 0, realRateYesterday: 0, todayDate: '' }; }
    });

    React.useEffect(() => {
        if (!show) return;
        // 读取持久化的基准汇率
        try {
            const stored = localStorage.getItem('app_exchange_base_rate');
            if (stored) setBaseRate(JSON.parse(stored));
        } catch (e) {}
        // 获取今日汇率
        fetch(`${EXCHANGE_WORKER_URL}/api/rate`).then(r => r.json()).then(async d => {
            if (d.ok && d.rate) {
                setRate(d.rate);
                // 首次使用时保存基准汇率
                if (!localStorage.getItem('app_exchange_base_rate')) {
                    localStorage.setItem('app_exchange_base_rate', JSON.stringify(d.rate));
                    setBaseRate(d.rate);
                }
                // 更新真实汇率记录
                const todayStr = getLocalDateKey(0);
                const realRate = d.rate.rates?.USD || 0.14;
                setVolatility(prev => {
                    const updated = { ...prev };
                    if (prev.todayDate !== todayStr) {
                        updated.realRateYesterday = prev.realRateToday || realRate;
                        updated.realRateToday = realRate;
                        updated.todayDate = todayStr;
                    }
                    localStorage.setItem('app_exchange_volatility', JSON.stringify(updated));
                    return updated;
                });
            }
        }).catch(() => {});
        // 获取历史汇率
        fetch(`${EXCHANGE_WORKER_URL}/api/rate/history`).then(r => r.json()).then(d => {
            if (d.ok && d.history) setHistory(d.history);
        }).catch(() => {});
        // 获取知识卡片
        fetch(`${EXCHANGE_WORKER_URL}/api/knowledge`).then(r => r.json()).then(d => {
            if (d.ok && d.card) setKnowledge(d.card);
        }).catch(() => {});
        // 获取物价数据
        fetch(`${EXCHANGE_WORKER_URL}/api/price/current`).then(r => r.json()).then(d => {
            if (d.ok && d.items) setPriceItems(d.items);
        }).catch(() => {});
    }, [show, syncCode]);

    // 一次性数据修正：修复之前因 activeChild 错误导致的跨孩子扣款
    const exchangeFixDoneRef = React.useRef(false);
    React.useEffect(() => {
        if (!show || exchangeFixDoneRef.current || (!syncCode && !activeChild)) return;
        exchangeFixDoneRef.current = true;
        const effectiveCode = syncCode || 'local_' + activeChild;
        fetch(`${EXCHANGE_WORKER_URL}/api/exchange/status?code=${encodeURIComponent(effectiveCode)}`).then(r => r.json()).then(d => {
            if (!d.records) return;
            d.records.forEach(rec => {
                if (rec.status !== 'verified' || !rec.childName) return;
                const correctKey = `${rec.childName}-EXCHANGE-${rec.id}`;
                const allChildren = Object.keys(tasks || {});
                allChildren.forEach(child => {
                    if (child === rec.childName) return;
                    const wrongKey = `${child}-EXCHANGE-${rec.id}`;
                    setWheelHistory(wh => {
                        if (!wh[wrongKey]) return wh;
                        const next = { ...wh };
                        delete next[wrongKey];
                        if (!next[correctKey]) {
                            next[correctKey] = -(rec.goldAmount || 0);
                        }
                        return next;
                    });
                });
            });
        }).catch(() => {});
    }, [show, syncCode]);

    // 轮询兑换记录（每 10 秒刷新 + 核销时自动扣金元宝）
    React.useEffect(() => {
        if (!show || (!syncCode && !activeChild)) return;
        const effectiveCode = syncCode || 'local_' + activeChild;
        const poll = () => {
            fetch(`${EXCHANGE_WORKER_URL}/api/exchange/status?code=${encodeURIComponent(effectiveCode)}`).then(r => r.json()).then(d => {
                if (!d.records) return;
                const childRecords = d.records.filter(r => r.childName === activeChild || !r.childName);
                setExchangeRecords(childRecords);
                d.records.filter(r => r.childName === activeChild && r.status === 'verified').forEach(rec => {
                    const historyKey = `${activeChild}-EXCHANGE-${rec.id}`;
                    setWheelHistory(wh => {
                        if (wh[historyKey]) return wh;
                        const totalKey = `app_exchange_total_${activeChild}`;
                        try {
                            const prev = parseFloat(localStorage.getItem(totalKey) || '0');
                            localStorage.setItem(totalKey, String(prev + (rec.cnyAmount || 0)));
                        } catch (e) {}
                        return { ...wh, [historyKey]: -(rec.goldAmount || 0) };
                    });
                });
                const pending = d.records.find(r => r.status === 'pending');
                if (!pending) setApplyResult(null);
            }).catch(() => {});
        };
        poll();
        const interval = setInterval(poll, 10000);
        return () => clearInterval(interval);
    }, [show, syncCode, activeChild]);

    if (!show) return null;

    // 汇率计算（含教育性放大）
    const currentRate = rate?.rates?.USD || 0.14;
    const baseCnyUsd = baseRate?.rates?.USD || currentRate;
    const rawTodayRate = currentRate / baseCnyUsd;
    const amplifier = volatility.amplifier || 10;
    const realChange = (volatility.realRateToday && volatility.realRateYesterday)
        ? volatility.realRateToday / volatility.realRateYesterday
        : 1;
    const amplifiedChange = 1 + (realChange - 1) * amplifier;
    const todayRate = rawTodayRate * amplifiedChange;
    const baseCentsPerGold = (() => { try { return parseFloat(localStorage.getItem('app_exchange_base_cents') || '1'); } catch(e) { return 1; } })();
    const cnyPerGold = todayRate * baseCentsPerGold / 100; // 1 金元宝 = X 元
    
    // 每日对比
    const yesterdayRate = rawTodayRate * (1 + (realChange - 1) * amplifier * (volatility.realRateYesterday ? (volatility.realRateYesterday / volatility.realRateToday) : 1));
    const yesterdayCnyPerGold = yesterdayRate * baseCentsPerGold / 100;
    const dailyChange = cnyPerGold - yesterdayCnyPerGold;
    const dailyChangePercent = yesterdayCnyPerGold > 0 ? ((dailyChange / yesterdayCnyPerGold) * 100).toFixed(1) : '0.0';

    const minGoldLimit = (() => { try { return parseInt(localStorage.getItem('app_exchange_min_gold') || '500'); } catch(e) { return 500; } })();
    const canExchange = totalGold >= minGoldLimit;
    const exchangeAmountClamped = Math.min(exchangeAmount, totalGold);
    const expectedCny = (exchangeAmountClamped * cnyPerGold).toFixed(2);
    const totalCny = (totalGold * cnyPerGold).toFixed(2);

    // 趋势建议
    const trendAdvice = todayRate > 1.03 ? '📈 当前汇率走高，是个兑换的好时机！' :
                       todayRate < 0.97 ? '📉 当前汇率偏低，可以蓄力再等等。' :
                       '➡️ 汇率平稳如常，可按需随时兑换。';

    // 迷你趋势图数据
    const histRates = history.slice(-6).map(h => h.usd / baseCnyUsd);
    const chartData = [...histRates, todayRate];
    const chartMin = Math.min(...chartData, 0.95);
    const chartMax = Math.max(...chartData, 1.05);
    const chartH = 64;
    const chartW = 280;

    const handleApply = async () => {
        const minGold = minGoldLimit;
        const maxSingle = (() => { try { return parseInt(localStorage.getItem('app_exchange_max_single') || '0'); } catch(e) { return 0; } })();
        const maxWeekly = (() => { try { return parseInt(localStorage.getItem('app_exchange_max_weekly') || '0'); } catch(e) { return 0; } })();

        if (exchangeAmountClamped < minGold) return showToast('warning', `最低兑换 ${minGold} 金元宝`);
        if (maxSingle > 0 && exchangeAmountClamped > maxSingle) return showToast('warning', `单次兑换上限 ${maxSingle} 金元宝`);

        if (maxWeekly > 0) {
            const now = new Date();
            const dayOfWeek = now.getDay() || 7;
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - dayOfWeek + 1);
            weekStart.setHours(0, 0, 0, 0);
            const weeklyUsed = exchangeRecords
                .filter(r => r.status === 'verified' && new Date(r.verifiedAt || r.createdAt) >= weekStart)
                .reduce((sum, r) => sum + (r.goldAmount || 0), 0);
            if (weeklyUsed + exchangeAmountClamped > maxWeekly) {
                const remaining = Math.max(0, maxWeekly - weeklyUsed);
                return showToast('warning', `每周上限 ${maxWeekly} 金元宝，本周已用 ${weeklyUsed}，还可兑换 ${remaining}`);
            }
        }

        setApplying(true);
        try {
            const resp = await fetch(`${EXCHANGE_WORKER_URL}/api/exchange/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    syncCode: syncCode || 'local_' + activeChild,
                    childName: activeChild,
                    goldAmount: exchangeAmountClamped,
                    rate: cnyPerGold,
                    cnyAmount: parseFloat(expectedCny)
                })
            });
            const data = await resp.json();
            if (data.ok) {
                setApplyResult(data);
                showToast('success', `兑换申请已提交！请家长扫码核销 ${expectedCny} 元`);
                const effectiveCode = syncCode || 'local_' + activeChild;
                fetch(`${EXCHANGE_WORKER_URL}/api/exchange/status?code=${encodeURIComponent(effectiveCode)}`).then(r => r.json()).then(d => {
                    if (d.records) setExchangeRecords(d.records);
                }).catch(() => {});
            } else if (data.error && data.error.includes('未核销')) {
                const effectiveCode = syncCode || 'local_' + activeChild;
                const statusResp = await fetch(`${EXCHANGE_WORKER_URL}/api/exchange/status?code=${encodeURIComponent(effectiveCode)}`);
                const statusData = await statusResp.json();
                const pendingRecord = (statusData.records || []).find(r => r.status === 'pending');
                if (pendingRecord) {
                    await fetch(`${EXCHANGE_WORKER_URL}/api/exchange/cancel`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ applyId: pendingRecord.id, syncCode: effectiveCode })
                    });
                    const retryResp = await fetch(`${EXCHANGE_WORKER_URL}/api/exchange/apply`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            syncCode: effectiveCode,
                            childName: activeChild,
                            goldAmount: exchangeAmountClamped,
                            rate: cnyPerGold,
                            cnyAmount: parseFloat(expectedCny)
                        })
                    });
                    const retryData = await retryResp.json();
                    if (retryData.ok) {
                        setApplyResult(retryData);
                        showToast('success', '已撤销旧单，新兑换申请已提交！');
                        const statusResp2 = await fetch(`${EXCHANGE_WORKER_URL}/api/exchange/status?code=${encodeURIComponent(effectiveCode)}`);
                        const statusData2 = await statusResp2.json();
                        if (statusData2.records) setExchangeRecords(statusData2.records);
                    } else {
                        showToast('error', retryData.error || '重试失败');
                    }
                } else {
                    showToast('error', data.error);
                }
            } else {
                showToast('error', data.error || '申请失败');
            }
        } catch (e) {
            showToast('error', '网络连接出现波动，请重试');
        }
        setApplying(false);
    };

    return (
        <div 
            className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white/95 rounded-3xl w-full max-w-xl max-h-[88vh] shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
                {/* 钱庄顶栏 */}
                <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex justify-between items-center shrink-0 shadow-md relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/30">
                            💱
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black tracking-wide drop-shadow-sm">
                                    金元宝钱庄 · 时空金库
                                </h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
                                    {activeChild || '学子'} 账户
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

                {/* 分段 Tab 导航 */}
                <div className="px-5 pt-3 pb-2.5 bg-gray-50/90 border-b border-gray-200/80 shrink-0">
                    <div className="bg-gray-200/70 p-1 rounded-2xl flex relative">
                        <div 
                            className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-all duration-300"
                            style={{
                                width: 'calc(50% - 4px)',
                                left: exchangeTab === 'learn' ? '4px' : 'calc(50%)',
                            }}
                        />
                        <button 
                            type="button"
                            onClick={() => setExchangeTab('learn')}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl relative z-10 transition-colors flex items-center justify-center gap-1.5 ${
                                exchangeTab === 'learn' ? 'text-amber-800' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <span>📖 财商科普与走势</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => setExchangeTab('exchange')}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl relative z-10 transition-colors flex items-center justify-center gap-1.5 ${
                                exchangeTab === 'exchange' ? 'text-amber-800' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <span>💰 零花钱兑换处</span>
                        </button>
                    </div>
                </div>

                {/* 滚动内容区 */}
                <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-gray-50/50 to-white space-y-4">
                    {exchangeTab === 'learn' ? (
                        <>
                            {/* 1. 金尊存折钱包 */}
                            <div className="bg-gradient-to-br from-amber-50 via-yellow-50/80 to-orange-50 rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-xs relative overflow-hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>👛 我的财富金库</span>
                                    </h3>
                                    {Math.abs(dailyChange) > 0.001 && (
                                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                                            dailyChange > 0 
                                                ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        }`}>
                                            {dailyChange > 0 ? '📈' : '📉'} 较昨日{dailyChange > 0 ? '升值' : '走低'} {dailyChangePercent}%
                                        </span>
                                    )}
                                </div>

                                <div className="text-center my-3">
                                    <div className="text-4xl sm:text-5xl font-black text-amber-500 tracking-tight font-mono drop-shadow-xs">
                                        {totalGold.toLocaleString()}
                                    </div>
                                    <div className="text-xs font-bold text-amber-800/70 mt-1">金元宝储蓄余额</div>
                                </div>

                                <div className="text-center pb-2 border-b border-amber-200/60 flex items-center justify-center gap-1.5">
                                    <span className="text-xs text-gray-500 font-medium">约合市场公允价值:</span>
                                    <span className="text-xl font-black text-emerald-600 font-mono">¥{totalCny}</span>
                                    <span className="text-xs text-gray-500">元人民币</span>
                                </div>

                                {priceItems.length > 0 && parseFloat(totalCny) > 0 && (
                                    <div className="mt-3 bg-white/70 backdrop-blur-sm rounded-xl px-3.5 py-2 text-xs text-amber-800 flex items-center justify-between border border-amber-200/50">
                                        <span className="text-gray-500">等值购买力:</span>
                                        <span className="font-bold">
                                            可兑现 <b>{(parseFloat(totalCny) / priceItems[0].currentPrice).toFixed(1)}</b> 份 {priceItems[0].brand}{priceItems[0].name} {priceItems[0].icon}
                                        </span>
                                    </div>
                                )}

                                {totalGold > 0 && (
                                    <div className="mt-3 pt-2 text-center">
                                        <button 
                                            type="button"
                                            onClick={() => setWalletExplainExpanded(!walletExplainExpanded)}
                                            className="text-xs text-amber-700 hover:text-amber-900 font-bold inline-flex items-center gap-1 transition-colors"
                                        >
                                            <span>💡 为什么今天的价值会变动？</span>
                                            <span>{walletExplainExpanded ? '收起 ▲' : '展开解读 ▼'}</span>
                                        </button>
                                        
                                        {walletExplainExpanded && (() => {
                                            const realChangePercent = volatility.realRateToday && volatility.realRateYesterday
                                                ? ((volatility.realRateToday / volatility.realRateYesterday - 1) * 100).toFixed(2)
                                                : '0.00';
                                            const amp = volatility.amplifier || 10;
                                            const amplifiedPercent = (parseFloat(realChangePercent) * amp).toFixed(2);
                                            const isUp = parseFloat(realChangePercent) > 0;
                                            const yesterdayCny = (totalGold * yesterdayCnyPerGold).toFixed(2);
                                            const todayCny = (totalGold * cnyPerGold).toFixed(2);
                                            return (
                                                <div className="mt-3 text-left bg-white/90 rounded-2xl p-4 text-xs text-gray-600 space-y-3 border border-amber-200/80 animate-in fade-in duration-200">
                                                    <div>
                                                        <div className="font-black text-gray-800 mb-1 flex items-center gap-1">
                                                            <span>🌍 真实世界发生了什么？</span>
                                                        </div>
                                                        <p className="leading-relaxed">
                                                            人民币对美元{isUp ? '升值' : '贬值'}了 <span className={`font-bold ${isUp ? 'text-rose-600' : 'text-emerald-600'}`}>{isUp ? '+' : ''}{realChangePercent}%</span>
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                                            昨日 1 元 ≈ ${volatility.realRateYesterday?.toFixed(4) || '—'} USD，今日 1 元 ≈ ${volatility.realRateToday?.toFixed(4) || '—'} USD
                                                        </p>
                                                    </div>

                                                    <div className="border-t border-gray-100 pt-2">
                                                        <div className="font-black text-gray-800 mb-1">🪙 钱庄教育放大倍率:</div>
                                                        <p className="leading-relaxed">
                                                            为了让小朋友真切感知全球经济律动，波动幅度经由教学放大镜放大了 <span className="font-bold text-amber-600 font-mono">{amp} 倍</span>！
                                                        </p>
                                                        <p className="font-semibold text-gray-700 mt-0.5">
                                                            实际感知变动: <span className={`font-bold ${isUp ? 'text-rose-600' : 'text-emerald-600'}`}>{isUp ? '+' : ''}{amplifiedPercent}%</span>
                                                        </p>
                                                    </div>

                                                    <div className="border-t border-gray-100 pt-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                                                        <div className="font-bold text-amber-900 mb-1">💰 财富折算对比:</div>
                                                        <p>昨日资产等值: <b>{yesterdayCny} 元</b></p>
                                                        <p>今日资产等值: <b className="text-amber-700">{todayCny} 元</b>（{isUp ? '多出' : '减少'} {Math.abs(parseFloat(todayCny) - parseFloat(yesterdayCny)).toFixed(2)} 元）</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* 2. 能买什么物价篮子 */}
                            {priceItems.length > 0 && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                            <span>🧋 当前余额可兑物价篮子</span>
                                        </h3>
                                        <span className="text-[10px] text-gray-400 font-medium">按实时市价换算</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {priceItems.map(item => {
                                            const canBuy = parseFloat(totalCny) > 0 ? (parseFloat(totalCny) / item.currentPrice).toFixed(1) : '0';
                                            return (
                                                <div key={item.id} className="flex items-center justify-between bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl shrink-0">{item.icon}</span>
                                                        <div>
                                                            <div className="text-xs font-bold text-gray-800">{item.brand} {item.name}</div>
                                                            <div className="text-[10px] text-gray-400">{item.currentPrice} 元/份</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-black text-emerald-600 font-mono">{canBuy}</div>
                                                        <div className="text-[10px] text-gray-400">份</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 3. 走势图与趋势建议 */}
                            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <TrendingUp className="w-4 h-4 text-amber-500" />
                                        <span>近 7 天金元宝汇率走势</span>
                                    </span>
                                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                        {(cnyPerGold * 100).toFixed(2)} 分 / 元宝
                                    </span>
                                </div>

                                {chartData.length >= 2 && (
                                    <div className="py-2">
                                        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-20 overflow-visible">
                                            <line x1="0" y1={chartH / 3} x2={chartW} y2={chartH / 3} stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="3,3" />
                                            <line x1="0" y1={chartH * 2 / 3} x2={chartW} y2={chartH * 2 / 3} stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="3,3" />
                                            <polyline
                                                fill="none"
                                                stroke={todayRate >= 1 ? '#f59e0b' : '#10b981'}
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                points={chartData.map((v, i) => {
                                                    const x = (i / (chartData.length - 1)) * chartW;
                                                    const y = chartH - ((v - chartMin) / (chartMax - chartMin || 1)) * (chartH - 12) - 6;
                                                    return `${x},${y}`;
                                                }).join(' ')}
                                            />
                                            {(() => {
                                                const lastIdx = chartData.length - 1;
                                                const x = chartW;
                                                const y = chartH - ((chartData[lastIdx] - chartMin) / (chartMax - chartMin || 1)) * (chartH - 12) - 6;
                                                return <circle cx={x} cy={y} r="4.5" fill={todayRate >= 1 ? '#f59e0b' : '#10b981'} stroke="#fff" strokeWidth="2" />;
                                            })()}
                                        </svg>
                                        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                                            <span>7天前</span>
                                            <span>今日实时</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-2 pt-2.5 border-t border-gray-100 flex items-center gap-2 text-xs">
                                    <span className="font-bold text-gray-500">兑换时机建议:</span>
                                    <span className="font-bold text-amber-700">{trendAdvice}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* 兑换 Tab：快速资产简报 */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🪙</span>
                                    <div>
                                        <div className="text-xs text-gray-500">可兑换金元宝储蓄</div>
                                        <div className="text-xl font-black text-amber-600 font-mono">
                                            {totalGold.toLocaleString()} <span className="text-xs font-bold text-gray-500">金币</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">今日结算汇率</div>
                                    <div className="text-sm font-black text-emerald-600 font-mono">
                                        {(cnyPerGold * 100).toFixed(2)} 分/元宝
                                    </div>
                                </div>
                            </div>

                            {/* 兑换表单卡片 */}
                            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-sm space-y-4">
                                <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                                    <span>💰 选择兑换数额</span>
                                </h3>

                                {/* 快捷筹码 */}
                                <div className="flex gap-2">
                                    {(() => {
                                        const minG = minGoldLimit;
                                        const presets = [minG, Math.max(minG, 1000), Math.max(minG, 2000), Math.max(minG, 5000)].filter((v, i, a) => a.indexOf(v) === i && v <= totalGold);
                                        return presets.map(v => (
                                            <button 
                                                key={v} 
                                                type="button"
                                                onClick={() => setExchangeAmount(v)}
                                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                                    exchangeAmountClamped === v 
                                                        ? 'bg-amber-500 text-white shadow-sm scale-105' 
                                                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                                }`}
                                            >
                                                {v >= 1000 ? `${v/1000}千` : v}
                                            </button>
                                        ));
                                    })()}
                                    <button 
                                        type="button"
                                        onClick={() => setExchangeAmount(totalGold)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                            exchangeAmountClamped === totalGold 
                                                ? 'bg-amber-500 text-white shadow-sm scale-105' 
                                                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                        }`}
                                    >
                                        全部
                                    </button>
                                </div>

                                {/* 滑块控制 */}
                                <div>
                                    <input 
                                        type="range" 
                                        min={minGoldLimit} 
                                        max={Math.max(minGoldLimit, totalGold)} 
                                        step="100"
                                        value={exchangeAmountClamped}
                                        onChange={e => setExchangeAmount(parseInt(e.target.value) || minGoldLimit)}
                                        className="w-full accent-amber-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
                                        disabled={!canExchange}
                                    />
                                    <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-mono">
                                        <span>最低 {minGoldLimit}</span>
                                        <span>当前全部 {totalGold.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* 结算小票 */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>拟兑出金元宝</span>
                                        <span className="font-bold text-gray-800 font-mono">{exchangeAmountClamped.toLocaleString()} 💰</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-gray-200/60 pt-2 text-gray-800">
                                        <span className="font-bold">预计到账零花钱</span>
                                        <span className="font-black text-emerald-600 text-base font-mono">¥{expectedCny} 元</span>
                                    </div>
                                </div>

                                {!canExchange && totalGold > 0 && (
                                    <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-center font-bold">
                                        还需努力积累 {minGoldLimit - totalGold} 个金元宝即可开启兑换！💪
                                    </div>
                                )}

                                <button 
                                    type="button"
                                    onClick={handleApply} 
                                    disabled={!canExchange || applying}
                                    className={`w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-md ${
                                        canExchange && !applying 
                                            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:shadow-lg active:scale-95' 
                                            : 'bg-gray-300 cursor-not-allowed opacity-70'
                                    }`}
                                >
                                    {applying ? '正在提交契约...' : canExchange ? '申请兑换零花钱 💰' : `金元宝不足（最低门槛 ${minGoldLimit}）`}
                                </button>
                            </div>

                            {/* 兑换结果 · 电子汇票二维码 */}
                            {applyResult && (() => {
                                const verifyUrl = `https://www.daka-tool.top/exchange-verify.html?id=${applyResult.applyId}&child=${encodeURIComponent(activeChild)}&gold=${exchangeAmountClamped}&cny=${expectedCny}&rate=${(cnyPerGold * 100).toFixed(2)}`;
                                return (
                                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-center shadow-xs animate-in zoom-in-95 duration-200">
                                        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-xl mb-2">
                                            ✅
                                        </div>
                                        <div className="text-base font-black text-emerald-800">兑换申请已提交</div>
                                        <div className="text-xs text-emerald-600 mt-0.5">请家长扫码或输入核销码完成线下结算</div>
                                        
                                        <div className="flex justify-center my-3 p-3 bg-white rounded-2xl shadow-inner border border-emerald-100 inline-block">
                                            <img 
                                                src={'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(verifyUrl)} 
                                                alt="核销二维码" 
                                                className="w-40 h-40 rounded-xl" 
                                            />
                                        </div>

                                        <div className="text-3xl font-black text-emerald-700 tracking-widest font-mono">
                                            {applyResult.verifyCode}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            防伪核销码（48小时内有效）· 金额 ¥{expectedCny} 元
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* 兑换流水记录 */}
                            {exchangeRecords.length > 0 && (
                                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold text-gray-700">📜 历史兑换记录</h3>
                                        {(() => {
                                            try {
                                                const total = parseFloat(localStorage.getItem(`app_exchange_total_${activeChild}`) || '0');
                                                if (total > 0) return (
                                                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        累计兑换 ¥{total.toFixed(2)}
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
                                                            onClick={() => setApplyResult({ applyId: r.id, verifyCode: r.verifyCode, cnyAmount: r.cnyAmount })}
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
                                                                    const resp = await fetch(`${EXCHANGE_WORKER_URL}/api/exchange/cancel`, {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ applyId: r.id, syncCode: syncCode || 'local_' + activeChild })
                                                                    });
                                                                    const data = await resp.json();
                                                                    if (data.ok) {
                                                                        setExchangeRecords(prev => prev.map(rec => rec.id === r.id ? { ...rec, status: 'cancelled' } : rec));
                                                                        showToast('success', '兑换已取消');
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExchangePanel;
