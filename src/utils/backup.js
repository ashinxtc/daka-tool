import { storage, flushPendingState, restoreEntries, isJunkKey } from './storage.js';

export const BACKUP_KEYS = {
    "tasks": "app_tasks_v2",
    "checkins": "app_checkins_v2",
    "profiles": "app_profiles_v1",
    "achievements": "app_achievements_v1",
    "stats": "app_stats_v1",
    "inventory": "app_inventory_v1",
    "activeBuffs": "app_active_buffs_v1",
    "redeemedCoupons": "app_coupons_v1",
    "equippedGear": "app_equipped_gear_v1",
    "milestones": "app_milestones_v1",
    "globalMessages": "app_global_messages_v2",
    "globalDates": "app_global_dates",
    "wheelConfig": "app_wheel_config",
    "wheelSettings": "app_wheel_settings",
    "wheelHistory": "app_wheel_history",
    "xpHistory": "app_xp_history",
    "evilWheelConfig": "app_evil_wheel_config",
    "randomEventHistory": "app_random_event_history",
    "dailyRandomCounts": "app_daily_random_counts",
    "historicalEventProgress": "app_historical_event_progress_v1",
    "dailyEventTypeCounts": "app_daily_event_type_counts_v1",
    "userCity": "app_user_city_v1",
    "curriculumProgress": "app_curriculum_progress_v1",
    "xpWheelConfig": "app_xp_wheel_config",
    "settingsPassword": "app_settings_password",
    "testMode": "app_test_mode",
    "weekendSettings": "app_weekend_settings",
    "notifiedLevels": "app_notified_levels",
    "exemptedDays": "app_exempted_days_v1",
    "silenceMutes": "app_silence_mutes_v1",
    "homeworkExamConfig": "app_homework_exam_config_v1",
    "homeworkRecords": "app_homework_records_v1",
    "examRecords": "app_exam_records_v1",
    "repairedCheckins": "app_repaired_checkins_v1",
    "weeklyPayroll": "app_weekly_payroll_v1",
    "reportConfig": "app_report_config_v1",
    "stars": "app_stars_v1",
    "starHistory": "app_star_history_v1",
    "petData": "app_pet_data_v1",
    "ownedPets": "app_owned_pets_v1",
    "activePet": "app_active_pet_v1",
    "petCooldowns": "app_pet_cooldowns_v1",
    "petStats": "app_pet_stats_v1",
    "petSkillCooldowns": "app_pet_skill_cd_v1",
    "petBuffs": "app_pet_buffs_v1",
    "petAdventures": "app_pet_adventures_v1",
    "petAdventureLog": "app_pet_adventure_log_v1",
    "petAdventureStats": "app_pet_adventure_stats_v1",
    "petSlots": "app_pet_slots_v1",
    "petMusic": "app_pet_music_v1",
    "petNotif": "app_pet_notif_v1",
    "evilPenaltyLog": "app_evil_penalty_log_v1",
    "evilAutoTrigger": "app_evil_auto_trigger",
    "evilTriggerConfig": "app_evil_trigger_config_v1",
    "gamificationConfig": "app_gamification_config_v1",
    "escrowPenalties": "app_escrow_penalties_v1",
    "firstBloodRecords": "app_first_blood_records_v1",
    "pendingEvilPenalty": "app_pending_evil_penalty_v1",
    "aiEnabled": "app_ai_enabled",
    "deepseekApiKey": "app_deepseek_api_key",
    "aiPetEnabled": "app_ai_pet_enabled",
    "aiChatEnabled": "app_ai_chat_enabled",
    "aiDailyLimit": "app_ai_daily_limit",
    "aiDailyUsage": "app_ai_daily_usage",
    "aiChatHistory": "app_ai_chat_history",
    "aiReminderLog": "app_ai_reminder_log_v1",
    "syncCode": "app_sync_code",
    "syncLastTime": "app_sync_last_time",
    "authorizedParents": "app_authorized_parents_v1",
    "parentActions": "app_parent_actions_v1",
    "deductionReceipts": "app_parent_deduction_receipts_v1",
    "exchangeBaseCents": "app_exchange_base_cents",
    "exchangeVolatility": "app_exchange_volatility",
    "exchangeMinGold": "app_exchange_min_gold",
    "exchangeMaxSingle": "app_exchange_max_single",
    "exchangeMaxWeekly": "app_exchange_max_weekly",
    "readingShelved": "app_reading_shelved_v1",
    "readingHistory": "app_reading_history_v1",
    "deletedTasks": "app_deleted_tasks_v1",
    "deletedProfiles": "app_deleted_profiles_v1",
    "deletedCheckins": "app_deleted_checkins_v1",
    "parentQrLanHost": "app_parent_qr_lan_host",
    "pendingEvilPenalties": "app_pending_evil_penalties_v2"
};

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const rawStrings = new Set(['app_active_child', 'app_device_id', 'app_last_report_date', 'app_last_backup_date', 'app_parent_qr_lan_host']);
const stringSettings = new Set(['app_settings_password', 'app_sync_code', 'app_theme', 'app_deepseek_api_key']);
const objectKeys = new Set(['app_tasks_v2', 'app_checkins_v2', 'app_wheel_history', 'app_xp_history', 'app_stats_v1',
    'app_parent_deduction_receipts_v1', 'app_escrow_penalties_v1', 'app_authorized_parents_v1', 'app_deleted_profiles_v1',
    'app_deleted_tasks_v1', 'app_deleted_checkins_v1', 'app_inventory_v1', 'app_equipped_gear_v1', 'app_stars_v1', 'app_star_history_v1']);

function validateEntry(key, raw) {
    if (!key.startsWith('app_') || isJunkKey(key)) throw new Error(`无效的数据项目：${key}`);
    if (raw === null || raw === undefined) return null; // Historical exports included absent fields.
    const encoded = typeof raw === 'string' ? raw : JSON.stringify(raw);
    let value;
    try { value = typeof raw === 'string' ? JSON.parse(raw) : raw; }
    catch {
        if (rawStrings.has(key)) return encoded;
        if (stringSettings.has(key)) return JSON.stringify(raw);
        throw new Error(`备份数据格式损坏：${key}`);
    }
    if (objectKeys.has(key) && !isObject(value)) throw new Error(`备份数据应为对象：${key}`);
    if (key === 'app_profiles_v1') {
        if (!Array.isArray(value) || value.some(p => !isObject(p) || typeof p.name !== 'string' || !p.name.trim()) ||
            new Set(value.map(p => p.name)).size !== value.length) throw new Error('备份中的家庭成员信息无效或重名。');
    }
    if (key === 'app_tasks_v2' && Object.values(value).some(tasks => !Array.isArray(tasks) || tasks.some(t => !isObject(t)))) {
        throw new Error('备份中的任务列表无效。');
    }
    if (key === 'app_parent_actions_v1' && (!Array.isArray(value) || value.some(action => !isObject(action)))) throw new Error('备份中的家长指令无效。');
    if (['app_wheel_history', 'app_xp_history'].includes(key) && Object.values(value).some(amount => typeof amount !== 'number' || !Number.isFinite(amount))) {
        throw new Error('备份中的账本金额无效。');
    }
    if (key === 'app_parent_deduction_receipts_v1' && Object.values(value).some(receipt => !isObject(receipt))) throw new Error('备份中的扣款回执无效。');
    return encoded;
}

export function parseBackup(input) {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    if (!isObject(data) || !['1', '1.0', '2', '2.0'].includes(String(data.version))) throw new Error('备份版本缺失或暂不支持。');
    if (data._allSyncData !== undefined && !isObject(data._allSyncData)) throw new Error('全量备份结构无效。');
    const entries = {};
    const add = (key, value) => {
        const encoded = validateEntry(key, value);
        if (encoded !== null) entries[key] = encoded;
    };
    for (const [alias, key] of Object.entries(BACKUP_KEYS)) if (Object.prototype.hasOwnProperty.call(data, alias)) add(key, data[alias]);
    for (const [key, value] of Object.entries(data._allSyncData || {})) add(key, value);
    for (const [key, value] of Object.entries(data)) if (key.startsWith('app_')) add(key, value);
    if (!Object.keys(entries).length) throw new Error('备份中没有可恢复的数据。');
    return entries;
}

export function createBackup() {
    flushPendingState();
    const snapshot = storage.getAllSyncData();
    // Keep the existing 2.0 format and aliases for compatibility with previous releases.
    const data = { version: '2.0', exportDate: new Date().toISOString() };
    for (const [alias, key] of Object.entries(BACKUP_KEYS)) data[alias] = snapshot[key] ?? null;
    return { ...data, _allSyncData: snapshot };
}

export async function restoreBackup(data) {
    const entries = parseBackup(data); // Validate every entry before the first write.
    await restoreEntries(entries);
}

export function downloadBackup(data, filename) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function selectAndRestoreBackup(showToast) {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = typeof file.text === 'function' ? await file.text() : await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('备份文件无法读取，请重新选择。'));
                reader.readAsText(file);
            });
            const entries = parseBackup(text);
            if (!window.confirm('导入将覆盖备份中包含的数据项目，未包含的项目会保留。系统会保留一份恢复前快照。确认继续？')) return;
            await restoreEntries(entries);
            window.location.reload();
        } catch (error) { showToast('error', `恢复未完成：${error.message}`, { duration: 6000 }); }
    };
    input.click();
}
