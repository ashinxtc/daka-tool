import React from 'react';
import { XIcon, Sparkles } from '../icons.jsx';
import { getLocalDateKey } from '../../utils/date.js';
import { storage } from '../../utils/storage.js';

// 数据备份/恢复 Modal（时空档案司 · 数据方舟）
export const BackupPanel = ({ show, onClose, theme, showToast: propShowToast }) => {
    if (!show) return null;
    const showToast = propShowToast || (typeof window !== 'undefined' && window.showToast) || ((type, msg) => alert(msg));

    const handleExport = () => {
        const data = {
            version: '2.0',
            exportDate: new Date().toISOString(),
            tasks: storage.getItem('app_tasks_v2'),
            checkins: storage.getItem('app_checkins_v2'),
            wheelHistory: storage.getItem('app_wheel_history'),
            xpHistory: storage.getItem('app_xp_history'),
            profiles: storage.getItem('app_profiles_v1'),
            achievements: storage.getItem('app_achievements_v1'),
            stats: storage.getItem('app_stats_v1'),
            inventory: storage.getItem('app_inventory_v1'),
            activeBuffs: storage.getItem('app_active_buffs_v1'),
            redeemedCoupons: storage.getItem('app_coupons_v1'),
            equippedGear: storage.getItem('app_equipped_gear_v1'),
            milestones: storage.getItem('app_milestones_v1'),
            globalMessages: storage.getItem('app_global_messages_v2'),
            globalDates: storage.getItem('app_global_dates'),
            wheelConfig: storage.getItem('app_wheel_config'),
            wheelSettings: storage.getItem('app_wheel_settings'),
            evilWheelConfig: storage.getItem('app_evil_wheel_config'),
            randomEventHistory: storage.getItem('app_random_event_history'),
            dailyRandomCounts: storage.getItem('app_daily_random_counts'),
            historicalEventProgress: storage.getItem('app_historical_event_progress_v1'),
            dailyEventTypeCounts: storage.getItem('app_daily_event_type_counts_v1'),
            userCity: storage.getItem('app_user_city_v1'),
            curriculumProgress: storage.getItem('app_curriculum_progress_v1'),
            xpWheelConfig: storage.getItem('app_xp_wheel_config'),
            settingsPassword: storage.getItem('app_settings_password'),
            testMode: storage.getItem('app_test_mode'),
            weekendSettings: storage.getItem('app_weekend_settings'),
            notifiedLevels: storage.getItem('app_notified_levels'),
            exemptedDays: storage.getItem('app_exempted_days_v1'),
            silenceMutes: storage.getItem('app_silence_mutes_v1'),
            homeworkExamConfig: storage.getItem('app_homework_exam_config_v1'),
            homeworkRecords: storage.getItem('app_homework_records_v1'),
            examRecords: storage.getItem('app_exam_records_v1'),
            repairedCheckins: storage.getItem('app_repaired_checkins_v1'),
            weeklyPayroll: storage.getItem('app_weekly_payroll_v1'),
            reportConfig: storage.getItem('app_report_config_v1'),
            stars: storage.getItem('app_stars_v1'),
            starHistory: storage.getItem('app_star_history_v1'),
            petData: storage.getItem('app_pet_data_v1'),
            ownedPets: storage.getItem('app_owned_pets_v1'),
            activePet: storage.getItem('app_active_pet_v1'),
            petCooldowns: storage.getItem('app_pet_cooldowns_v1'),
            petStats: storage.getItem('app_pet_stats_v1'),
            petSkillCooldowns: storage.getItem('app_pet_skill_cd_v1'),
            petBuffs: storage.getItem('app_pet_buffs_v1'),
            petAdventures: storage.getItem('app_pet_adventures_v1'),
            petAdventureLog: storage.getItem('app_pet_adventure_log_v1'),
            petAdventureStats: storage.getItem('app_pet_adventure_stats_v1'),
            petSlots: storage.getItem('app_pet_slots_v1'),
            petMusic: storage.getItem('app_pet_music_v1'),
            petNotif: storage.getItem('app_pet_notif_v1'),
            evilPenaltyLog: storage.getItem('app_evil_penalty_log_v1'),
            evilAutoTrigger: storage.getItem('app_evil_auto_trigger'),
            evilTriggerConfig: storage.getItem('app_evil_trigger_config_v1'),
            pendingEvilPenalty: storage.getItem('app_pending_evil_penalty_v1'),
            aiEnabled: storage.getItem('app_ai_enabled'),
            deepseekApiKey: storage.getItem('app_deepseek_api_key'),
            aiPetEnabled: storage.getItem('app_ai_pet_enabled'),
            aiChatEnabled: storage.getItem('app_ai_chat_enabled'),
            aiDailyLimit: storage.getItem('app_ai_daily_limit'),
            aiDailyUsage: storage.getItem('app_ai_daily_usage'),
            aiChatHistory: storage.getItem('app_ai_chat_history'),
            aiReminderLog: storage.getItem('app_ai_reminder_log_v1'),
            syncCode: storage.getItem('app_sync_code'),
            syncLastTime: storage.getItem('app_sync_last_time'),
            authorizedParents: storage.getItem('app_authorized_parents_v1'),
            parentActions: storage.getItem('app_parent_actions_v1'),
            // 现实基准折算汇率与外汇物价设置
            exchangeBaseCents: storage.getItem('app_exchange_base_cents'),
            exchangeVolatility: storage.getItem('app_exchange_volatility'),
            exchangeMinGold: storage.getItem('app_exchange_min_gold'),
            exchangeMaxSingle: storage.getItem('app_exchange_max_single'),
            exchangeMaxWeekly: storage.getItem('app_exchange_max_weekly'),
            // 天工书阁与任务删除墓碑
            readingShelved: storage.getItem('app_reading_shelved_v1'),
            readingHistory: storage.getItem('app_reading_history_v1'),
            deletedTasks: storage.getItem('app_deleted_tasks_v1'),
            deletedProfiles: storage.getItem('app_deleted_profiles_v1'),
            parentQrLanHost: storage.getItem('app_parent_qr_lan_host'),
            // 全量快照兜底（包含各孩子累计兑换 app_exchange_total_* 及所有动态项）
            _allSyncData: storage.getAllSyncData()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `时空市集备份_${getLocalDateKey(0)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        storage.setItem('app_last_backup_date', new Date().toISOString());
        showToast('success', '备份成功！全量数据已下载至本地文件，请妥善保存。');
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    if (!data.version) {
                        showToast('warning', '无效的备份文件：缺少数据版本声明！');
                        return;
                    }

                    const confirmed = confirm('⚠️ 警告：从备份恢复将覆盖当前浏览器中的所有修行数据！\n\n确认继续载入吗？');
                    if (!confirmed) return;

                    Object.keys(data).forEach(key => {
                        if (key !== 'version' && key !== 'exportDate' && data[key]) {
                            const storageKey =
                                key === 'tasks' ? 'app_tasks_v2' :
                                key === 'checkins' ? 'app_checkins_v2' :
                                key === 'profiles' ? 'app_profiles_v1' :
                                key === 'achievements' ? 'app_achievements_v1' :
                                key === 'stats' ? 'app_stats_v1' :
                                key === 'inventory' ? 'app_inventory_v1' :
                                key === 'activeBuffs' ? 'app_active_buffs_v1' :
                                key === 'redeemedCoupons' ? 'app_coupons_v1' :
                                key === 'equippedGear' ? 'app_equipped_gear_v1' :
                                key === 'milestones' ? 'app_milestones_v1' :
                                key === 'globalMessages' ? 'app_global_messages_v2' :
                                key === 'globalDates' ? 'app_global_dates' :
                                key === 'wheelConfig' ? 'app_wheel_config' :
                                key === 'wheelSettings' ? 'app_wheel_settings' :
                                key === 'wheelHistory' ? 'app_wheel_history' :
                                key === 'xpHistory' ? 'app_xp_history' :
                                key === 'evilWheelConfig' ? 'app_evil_wheel_config' :
                                key === 'randomEventHistory' ? 'app_random_event_history' :
                                key === 'dailyRandomCounts' ? 'app_daily_random_counts' :
                                key === 'historicalEventProgress' ? 'app_historical_event_progress_v1' :
                                key === 'dailyEventTypeCounts' ? 'app_daily_event_type_counts_v1' :
                                key === 'userCity' ? 'app_user_city_v1' :
                                key === 'curriculumProgress' ? 'app_curriculum_progress_v1' :
                                key === 'xpWheelConfig' ? 'app_xp_wheel_config' :
                                key === 'settingsPassword' ? 'app_settings_password' :
                                key === 'testMode' ? 'app_test_mode' :
                                key === 'weekendSettings' ? 'app_weekend_settings' :
                                key === 'notifiedLevels' ? 'app_notified_levels' :
                                key === 'exemptedDays' ? 'app_exempted_days_v1' :
                                key === 'silenceMutes' ? 'app_silence_mutes_v1' :
                                key === 'homeworkExamConfig' ? 'app_homework_exam_config_v1' :
                                key === 'homeworkRecords' ? 'app_homework_records_v1' :
                                key === 'examRecords' ? 'app_exam_records_v1' :
                                key === 'repairedCheckins' ? 'app_repaired_checkins_v1' :
                                key === 'weeklyPayroll' ? 'app_weekly_payroll_v1' :
                                key === 'reportConfig' ? 'app_report_config_v1' :
                                key === 'stars' ? 'app_stars_v1' :
                                key === 'starHistory' ? 'app_star_history_v1' :
                                key === 'petData' ? 'app_pet_data_v1' :
                                key === 'ownedPets' ? 'app_owned_pets_v1' :
                                key === 'activePet' ? 'app_active_pet_v1' :
                                key === 'petCooldowns' ? 'app_pet_cooldowns_v1' :
                                key === 'petStats' ? 'app_pet_stats_v1' :
                                key === 'petSkillCooldowns' ? 'app_pet_skill_cd_v1' :
                                key === 'petBuffs' ? 'app_pet_buffs_v1' :
                                key === 'petAdventures' ? 'app_pet_adventures_v1' :
                                key === 'petAdventureLog' ? 'app_pet_adventure_log_v1' :
                                key === 'petAdventureStats' ? 'app_pet_adventure_stats_v1' :
                                key === 'petSlots' ? 'app_pet_slots_v1' :
                                key === 'petMusic' ? 'app_pet_music_v1' :
                                key === 'petNotif' ? 'app_pet_notif_v1' :
                                key === 'evilPenaltyLog' ? 'app_evil_penalty_log_v1' :
                                key === 'evilAutoTrigger' ? 'app_evil_auto_trigger' :
                                key === 'evilTriggerConfig' ? 'app_evil_trigger_config_v1' :
                                key === 'pendingEvilPenalty' ? 'app_pending_evil_penalty_v1' :
                                key === 'aiEnabled' ? 'app_ai_enabled' :
                                key === 'deepseekApiKey' ? 'app_deepseek_api_key' :
                                key === 'aiPetEnabled' ? 'app_ai_pet_enabled' :
                                key === 'aiChatEnabled' ? 'app_ai_chat_enabled' :
                                key === 'aiDailyLimit' ? 'app_ai_daily_limit' :
                                key === 'aiDailyUsage' ? 'app_ai_daily_usage' :
                                key === 'aiChatHistory' ? 'app_ai_chat_history' :
                                key === 'aiReminderLog' ? 'app_ai_reminder_log_v1' :
                                key === 'syncCode' ? 'app_sync_code' :
                                key === 'syncLastTime' ? 'app_sync_last_time' :
                                key === 'authorizedParents' ? 'app_authorized_parents_v1' :
                                key === 'parentActions' ? 'app_parent_actions_v1' :
                                key === 'exchangeBaseCents' ? 'app_exchange_base_cents' :
                                key === 'exchangeVolatility' ? 'app_exchange_volatility' :
                                key === 'exchangeMinGold' ? 'app_exchange_min_gold' :
                                key === 'exchangeMaxSingle' ? 'app_exchange_max_single' :
                                key === 'exchangeMaxWeekly' ? 'app_exchange_max_weekly' :
                                key === 'readingShelved' ? 'app_reading_shelved_v1' :
                                key === 'readingHistory' ? 'app_reading_history_v1' :
                                key === 'deletedTasks' ? 'app_deleted_tasks_v1' :
                                key === 'deletedProfiles' ? 'app_deleted_profiles_v1' :
                                key === 'parentQrLanHost' ? 'app_parent_qr_lan_host' : null;

                            if (storageKey) {
                                storage.setItem(storageKey, data[key]);
                                storage.markKeyVersion(storageKey);
                            }
                        }
                    });

                    // 恢复全量快照兜底（如各孩子累计兑换 app_exchange_total_* 及所有动态键）
                    if (data._allSyncData && typeof data._allSyncData === 'object') {
                        Object.entries(data._allSyncData).forEach(([k, v]) => {
                            if (k && k.startsWith('app_') && v !== undefined && v !== null) {
                                storage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
                                storage.markKeyVersion(k);
                            }
                        });
                    }

                    // 恢复直接以 app_ 存储的原始键
                    Object.keys(data).forEach(k => {
                        if (k.startsWith('app_') && data[k] !== undefined && data[k] !== null) {
                            storage.setItem(k, typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k]));
                            storage.markKeyVersion(k);
                        }
                    });

                    showToast('success', '数据恢复成功！正在重新载入时空...');
                    setTimeout(() => window.location.reload(), 1200);
                } catch (err) {
                    showToast('error', '文件解析失败！' + err.message, { duration: 5000 });
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

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
                <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 px-6 py-4.5 border-b border-indigo-500/30 flex justify-between items-center text-white shrink-0">
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
