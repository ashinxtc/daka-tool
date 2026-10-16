import React from 'react';
import { XIcon, Sparkles } from '../icons.jsx';
import { getLocalDateKey } from '../../utils/date.js';
import { storage, getPreRestoreBackup } from '../../utils/storage.js';
import { createBackup, downloadBackup, selectAndRestoreBackup } from '../../utils/backup.js';

// 数据备份/恢复 Modal（时空档案司 · 数据方舟）
export const BackupPanel = ({ show, onClose, theme, showToast: propShowToast }) => {
    if (!show) return null;
    const showToast = propShowToast || (typeof window !== 'undefined' && window.showToast) || ((type, msg) => alert(msg));

    const handleExport = () => {
        try {
            downloadBackup(createBackup(), `时空市集备份_${getLocalDateKey(0)}.json`);
            storage.setItem('app_last_backup_date', new Date().toISOString());
            showToast('success', '备份文件已生成，请妥善保存。');
        } catch (error) { showToast('error', `备份未完成：${error.message}`); }
    };
    const handleImport = () => selectAndRestoreBackup(showToast);
    const previousBackup = getPreRestoreBackup();

    const totalRecords = Object.keys(storage.getAllSyncData()).length;
    const lastBackup = storage.getItem('app_last_backup_date');
    const daysSinceBackup = lastBackup
        ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div
            className="fixed inset-0 bg-slate-950/85 z-[90] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-indigo-950/40 rounded-3xl w-full max-w-xl shadow-[0_25px_60px_-15px_rgba(59,130,246,0.3)] border-2 border-indigo-400/40 overflow-hidden text-slate-100 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* 标头 */}
                <div 
                    className="bg-blue-900 bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 px-6 py-4.5 border-b border-indigo-500/30 flex justify-between items-center text-white shrink-0 modal-header-theme"
                    style={{ backgroundColor: '#1e3a8a', backgroundImage: 'linear-gradient(to right, #1e3a8a, #312e81, #581c87)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-2xl shadow-inner shadow-indigo-500/50">
                            💾
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                                时空档案司 · 数据方舟
                            </h2>
                            <p className="text-xs text-indigo-200/80 mt-0.5 font-medium">
                                全量时空数据备份与时光沙盒恢复
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer border border-slate-700/50"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* 数据统计看板 */}
                    <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/90 p-4 rounded-2xl border border-indigo-500/30 shadow-inner">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 存储健康度与状态统计
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                50+ 核心数据轨
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                                <div>
                                    <div className="text-slate-400 text-xs font-medium">本地存储项数</div>
                                    <div className="text-2xl font-black text-amber-300 mt-0.5">{totalRecords}</div>
                                </div>
                                <div className="text-2xl opacity-80">🗄️</div>
                            </div>
                            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                                <div>
                                    <div className="text-slate-400 text-xs font-medium">上次全量备份</div>
                                    <div className="text-base font-bold text-emerald-400 mt-1">
                                        {lastBackup ? `${daysSinceBackup} 天前` : '尚未备份'}
                                    </div>
                                </div>
                                <div className="text-2xl opacity-80">⏱️</div>
                            </div>
                        </div>

                        {(!lastBackup || daysSinceBackup > 7 || totalRecords > 100) && (
                            <div className="mt-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                                <span className="text-base shrink-0">⚠️</span>
                                <span>建议定期导出备份文件，以防浏览器清理缓存导致修行沉淀遗失！</span>
                            </div>
                        )}
                    </div>

                    {/* 操作按钮区 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 导出备份 */}
                        <button
                            onClick={handleExport}
                            className="group relative p-5 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-emerald-900/30 to-teal-950/40 border-2 border-emerald-500/50 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all transform active:scale-95 flex flex-col text-left cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl text-emerald-300 shadow-sm group-hover:scale-110 transition-transform">
                                    📦
                                </div>
                                <div>
                                    <div className="font-black text-emerald-300 text-base">导出全量时空备份</div>
                                    <div className="text-[11px] text-emerald-200/70">生成本地 JSON 存档凭证</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mt-1">
                                将打卡记录、财富账本、契约卡、行囊神力及成就等所有数据完整保存至电脑。
                            </p>
                            <span className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/40 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors text-center">
                                立即下载备份凭据 ➔
                            </span>
                        </button>

                        {/* 恢复备份 */}
                        <button
                            onClick={handleImport}
                            className="group relative p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-indigo-900/30 to-blue-950/40 border-2 border-indigo-400/50 hover:border-indigo-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all transform active:scale-95 flex flex-col text-left cursor-pointer"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl text-indigo-300 shadow-sm group-hover:scale-110 transition-transform">
                                    📥
                                </div>
                                <div>
                                    <div className="font-black text-indigo-300 text-base">从备份文件恢复</div>
                                    <div className="text-[11px] text-indigo-200/70">时光回溯 · 导入还原</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mt-1">
                                选取先前导出的 JSON 备份文件，一键还原至对应时空节点（操作前请确认备份）。
                            </p>
                            <span className="mt-4 w-full py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/40 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors text-center">
                                选取本地文件恢复 ➔
                            </span>
                        </button>
                    </div>

                    {previousBackup && <button className="w-full rounded-xl border border-amber-400/50 p-3 text-amber-200 text-sm" onClick={() => downloadBackup(previousBackup, `恢复前快照_${getLocalDateKey(0)}.json`)}>
                        下载上次恢复前的数据快照
                    </button>}

                    {/* 使用说明与守则 */}
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
                        <div className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                            <span>💡</span> 时空数据档案守护指引：
                        </div>
                        <ul className="list-disc list-inside space-y-1 ml-1 leading-relaxed">
                            <li>
                                <strong className="text-slate-300">本地离线优先：</strong> 所有打卡与资产沉淀均默认保存在本地浏览器中，不依赖任何第三方不可控服务器。
                            </li>
                            <li>
                                <strong className="text-slate-300">防清理建议：</strong> 建议每周或每逢重大里程碑达成时，点击“导出全量时空备份”并转存至网盘或个人微信文件助手。
                            </li>
                            <li>
                                <strong className="text-slate-300">多设备迁移：</strong> 新设备打开本打卡工具后，直接导入该备份文件即可无缝延续全部修为与纪元进展。
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupPanel;
