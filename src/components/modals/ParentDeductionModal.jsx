import React from 'react';
import { XIcon } from '../icons';

/**
 * 家长扣款通知单弹窗
 * 当家长从护航台发起扣款（如惩罚、共同承担支出等）并同步到主程序后，
 * 主程序自动为孩子弹出此通知，提示扣款金额、扣款事由、下达人及当前结余。
 */
export const ParentDeductionModal = ({
    show,
    onClose,
    notice,
    currentGold = 0
}) => {
    if (!show || !notice) return null;

    const operator = notice.operatorRole || notice.operator || '家长';
    const amount = parseInt(notice.amount, 10) || 0;
    const reason = notice.reason || '家庭支出分担或违约扣除';

    return (
        <div 
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div 
                className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl bg-slate-900 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-rose-500/40 text-white animate-in zoom-in-95 duration-200 modal-header-theme"
                style={{ backgroundColor: '#0f172a', backgroundImage: 'linear-gradient(to bottom, #0f172a, #0f172a, #020617)' }}
            >
                {/* 右上角关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="关闭"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* 顶部警示/责任微光背景 */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-rose-500/15 via-rose-500/5 to-transparent pointer-events-none" />

                <div className="p-6 pt-8 text-center flex flex-col items-center relative z-10">
                    {/* 发送人头像/身份徽章 */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/20 to-amber-500/20 border-2 border-rose-400/50 shadow-lg shadow-rose-950/60 flex items-center justify-center text-3xl mb-3">
                        📉
                    </div>

                    <h3 className="text-lg font-black tracking-wide text-rose-300 drop-shadow-xs">
                        【{operator}】下达扣款通知单
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                        来自家长督学护航台的家庭账目调整通知
                    </p>

                    {/* 扣款金额卡片 */}
                    <div className="my-5 w-full bg-slate-950/80 border border-rose-500/30 rounded-2xl p-4 text-center shadow-inner">
                        <div className="text-xs text-rose-300 font-bold mb-1">本次账目扣减</div>
                        <div className="text-3xl font-black text-rose-400 tracking-tight flex items-center justify-center gap-1.5 drop-shadow-sm font-mono">
                            <span>-{amount}</span>
                            <span className="text-xl">💰</span>
                            <span className="text-xs text-slate-400 font-normal">金元宝</span>
                        </div>

                        {/* 事由明细 */}
                        <div className="mt-3 pt-3 border-t border-slate-800/80 text-left">
                            <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                                <span>📋</span> 扣减事由说明：
                            </div>
                            <div className="text-xs text-amber-200 bg-rose-950/30 border border-rose-500/20 rounded-xl px-3 py-2 italic break-words">
                                “{reason}”
                            </div>
                        </div>

                        {/* 结余提示 */}
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                            <span>扣除后当前结余：</span>
                            <span className="font-bold text-amber-400">{currentGold} 💰</span>
                        </div>
                    </div>

                    {/* 教育引导小贴士 */}
                    <div className="text-[11px] text-slate-400 bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-2.5 text-left leading-relaxed w-full">
                        💡 <b className="text-indigo-300">成长箴言：</b>共同承担家庭支出、为失误承担责任是成长的重要历练。继续加油打卡把元宝赚回来吧！
                    </div>

                    {/* 确认知悉按钮 */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-5 w-full py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-900/30 cursor-pointer transition-all active:scale-98"
                    >
                        我知道了（确认知悉）
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParentDeductionModal;
