import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Target } from '../icons';
import { dateObjToLocalKey, getLocalDateKey } from '../../utils/date';
import { HABIT_ICON_PRESETS } from '../habits';

export const TASK_FREQUENCIES = [
    ['count', '按总次数'],
    ['daily_must', '每日必做'],
    ['weekly_optional', '每周选做'],
    ['reading', '伴读打卡'],
    ['habit', '生活习惯'],
];

export function getTaskFrequency(task) {
    if (TASK_FREQUENCIES.some(([value]) => value === task.frequencyType)) return task.frequencyType;
    if (task.isHabit || task.habitConfig?.isHabit) return 'habit';
    return task.readingConfig?.isReading ? 'reading' : 'count';
}

const fieldClass = 'block min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-base text-slate-900 focus-visible:border-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-500';
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
const gridClass = 'grid gap-4 sm:grid-cols-2';

function Field({ label, children }) {
    return <label className="grid min-w-0 gap-1.5 text-sm font-semibold text-slate-700">{label}{children}</label>;
}

function NumberField({ label, value, onChange, min = 0, max }) {
    return <Field label={label}>
        <input className={fieldClass} type="number" inputMode="numeric" required min={min} max={max}
            value={value} onChange={event => onChange(event.target.value)} />
    </Field>;
}

function SelectField({ label, value, options, onChange }) {
    return <Field label={label}>
        <select className={fieldClass} value={value} onChange={event => onChange(event.target.value)}>
            {options.map(([id, text]) => <option key={id} value={id}>{text}</option>)}
        </select>
    </Field>;
}

function Checkbox({ checked, onChange, children }) {
    return <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
        <input type="checkbox" className={`size-4 shrink-0 accent-indigo-600 ${focusClass}`} checked={!!checked}
            onChange={event => onChange(event.target.checked)} />
        {children}
    </label>;
}

function Options({ title, children }) {
    return <details className="group/options rounded-xl border border-slate-200 bg-white">
        <summary className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 [&::-webkit-details-marker]:hidden ${focusClass}`}>
            {title}<ChevronDown className="size-4 shrink-0 text-slate-500 group-open/options:rotate-180" aria-hidden="true" />
        </summary>
        <div className="grid gap-4 border-t border-slate-100 p-3 sm:p-4">{children}</div>
    </details>;
}

function createDraft() {
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 3);
    return {
        name: '', frequencyType: 'count', reward: 1, targetCount: 10,
        startDate: getLocalDateKey(0), deadline: dateObjToLocalKey(deadline), isNew: false,
    };
}

function habitDefaults(name = '') {
    const water = name.includes('水');
    const rope = /绳|跳|跑/.test(name);
    const teeth = name.includes('牙');
    const eyes = name.includes('眼');
    const sleep = name.includes('睡');
    return {
        icon: water ? '💧' : eyes ? '👀' : rope ? '🏃' : teeth ? '🪥' : sleep ? '🛏️' : '🌱',
        mode: water || rope || teeth || eyes ? 'count' : 'check',
        hasTarget: !eyes && (water || rope || teeth),
        targetCount: water ? 8 : rope ? 500 : teeth ? 2 : eyes ? 0 : 1,
        unit: water ? '杯' : rope ? '下' : '次',
        color: water ? 'sky' : rope ? 'amber' : sleep ? 'purple' : 'emerald',
    };
}

const readingDefaults = {
    coverEmoji: '📖', period: 'weekly', mode: 'pages', totalPages: 180, totalChapters: 12,
    dailyTargetMinutes: 20, targetCount: 3, grandReward: 30, overdueGrandReward: 20,
};

const readingTrackOptions = [ ['pages', '页数'], ['chapters', '章节'], ['duration', '时长'], ['count', '本数'] ];

function changeFrequency(draft, frequencyType) {
    const next = { ...draft, frequencyType, isHabit: frequencyType === 'habit' };
    if (next.isHabit) {
        next.habitConfig = { ...habitDefaults(draft.name), ...draft.habitConfig, isHabit: true };
        if (next.habitConfig.mode === 'count' && !next.habitConfig.hasTarget) next.targetCount = 0;
    } else if (draft.habitConfig) {
        next.habitConfig = { ...draft.habitConfig, isHabit: false };
    }
    if (frequencyType === 'reading') {
        next.readingConfig = { bookTitle: draft.name, coverEmoji: '📖', ...draft.readingConfig, isReading: true };
    } else if (draft.readingConfig) {
        next.readingConfig = { ...draft.readingConfig, isReading: false };
    }
    if (frequencyType === 'count' && !(next.targetCount > 0)) next.targetCount = 10;
    return next;
}

const readingModes = {
    pages: ['totalPages', '全书总页数', '页'],
    chapters: ['totalChapters', '全书总章节数', '章'],
    duration: ['dailyTargetMinutes', '每日目标分钟数', '分钟'],
    count: ['targetCount', '目标总本数', '本'],
};

function readingMode(config) {
    return Object.prototype.hasOwnProperty.call(readingModes, config.mode) ? config.mode : 'pages';
}

function habitMode(config) {
    if (config.mode !== 'count') return 'check';
    return config.hasTarget !== false && (config.targetCount > 0 || config.targetCount === '') ? 'target' : 'unlimited';
}

function describeRule(task) {
    switch (getTaskFrequency(task)) {
        case 'daily_must': return task.holidayExempt ? '每日打卡，节假日免打卡' : '每日打卡';
        case 'weekly_optional': return `每周打卡 ${task.weeklyTargetCount ?? 3} 次`;
        case 'reading': {
            const config = task.readingConfig || {};
            const mode = readingMode(config);
            const [key, , unit] = readingModes[mode];
            return `伴读目标${mode === 'duration' ? '每天' : '共'} ${config[key] ?? readingDefaults[key]} ${unit}`;
        }
        case 'habit': {
            const config = task.habitConfig || {};
            const mode = habitMode(config);
            if (mode === 'check') return '每天记一次完成';
            if (mode === 'unlimited') return '每天可记录多次';
            return `每天记录 ${config.targetCount} ${config.unit || '次'}`;
        }
        default: return `累计打卡 ${task.targetCount ?? 0} 次`;
    }
}

function changedFields(before, after) {
    return Object.fromEntries(Object.entries(after).filter(([key, value]) => !Object.is(before[key], value)));
}

export default function TaskEditor({ task, theme, onSave, onCancel, onDelete, curriculum }) {
    const [initial] = useState(() => task || createDraft());
    const [draft, setDraft] = useState(initial);
    const [error, setError] = useState('');
    const titleRef = useRef(null);
    const nameRef = useRef(null);
    const freq = getTaskFrequency(draft);
    const habit = draft.habitConfig || {};
    const reading = draft.readingConfig || {};
    const reward = draft.reward ?? (freq === 'reading' ? 3 : 1);
    const [readingTarget, readingLabel] = readingModes[readingMode(reading)];
    const set = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));
    const setConfig = (key, fields) => setDraft(prev => ({ ...prev, [key]: { ...prev[key], ...fields } }));
    const setNumber = key => value => set(key, value === '' ? '' : Number(value));
    const setReading = (key, value) => setConfig('readingConfig', { [key]: value });
    const setHabit = (key, value) => setConfig('habitConfig', { [key]: value });

    useEffect(() => { titleRef.current?.focus(); }, []);

    function handleInvalid(event) {
        // A field can be invalid even when its optional section is collapsed.
        for (let el = event.target.parentElement; el && el !== event.currentTarget; el = el.parentElement) {
            if (el.tagName === 'DETAILS') el.open = true;
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        const name = (draft.name ?? '').trim();
        if (!name) {
            setError('请输入任务名称。');
            nameRef.current?.focus();
            return;
        }
        const datesChanged = !task || draft.startDate !== initial.startDate || draft.deadline !== initial.deadline;
        if (datesChanged && draft.startDate && draft.deadline && draft.deadline < draft.startDate) {
            setError('截止日期要等于或晚于开始日期。');
            return;
        }

        const next = { ...draft, name };
        if (!task) {
            if (freq === 'reading') {
                next.readingConfig = {
                    ...readingDefaults, currentProgress: 0, notes: [], ...reading, bookTitle: reading.bookTitle?.trim() || name,
                };
            }
            onSave(next);
            return;
        }

        // Keep live fields such as reading progress that may have arrived while the form was open.
        const patch = changedFields(initial, next);
        for (const key of ['readingConfig', 'habitConfig']) {
            if (!patch[key]) continue;
            const changes = changedFields(initial[key] || {}, patch[key]);
            patch[key] = { ...task[key], ...changes };
        }
        onSave(patch);
    }

    return <form onSubmit={handleSubmit} onInvalid={handleInvalid} onInput={() => setError('')} translate="no" aria-labelledby="task-editor-title"
        className="notranslate rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="grid gap-4 p-4 sm:p-5">
            <header className="border-b border-slate-100 pb-3">
                <h3 id="task-editor-title" ref={titleRef} tabIndex={-1} className="flex items-center gap-2 text-base font-bold text-slate-800 outline-none">
                    <Target aria-hidden="true" className={`size-5 ${theme.primary}`} />
                    {task ? '编辑任务' : '新增任务'}
                </h3>
            </header>

            <Field label="任务名称">
                <input className={fieldClass} required ref={nameRef} type="text" autoComplete="off" value={draft.name ?? ''}
                    placeholder="例如 数学口算" onChange={event => set('name', event.target.value)} />
            </Field>
            <SelectField label="打卡方式" value={freq} options={TASK_FREQUENCIES}
                onChange={value => setDraft(prev => changeFrequency(prev, value))} />

            <div className="grid gap-3 min-[370px]:grid-cols-2">
                {freq === 'count' && <NumberField label="目标总次数" min={task && (initial.targetCount ?? 0) === 0 ? 0 : 1}
                    value={draft.targetCount ?? (task ? 0 : 10)} onChange={setNumber('targetCount')} />}
                {freq === 'weekly_optional' && <NumberField label="每周目标次数" min={1} max={7} value={draft.weeklyTargetCount ?? 3} onChange={setNumber('weeklyTargetCount')} />}
                {freq === 'reading' && <>
                    <SelectField label="阅读进度按" value={readingMode(reading)} onChange={value => setReading('mode', value)}
                        options={readingTrackOptions} />
                    <NumberField label={readingLabel} min={1} value={reading[readingTarget] ?? readingDefaults[readingTarget]}
                        onChange={value => setReading(readingTarget, value === '' ? '' : Number(value))} />
                </>}
                {freq === 'habit' && <>
                    <SelectField label="记录方式" value={habitMode(habit)}
                        options={[[ 'check', '每天记一次完成'], ['target', '多次记录，有每日目标'], ['unlimited', '多次记录，无每日目标']]}
                        onChange={mode => setDraft(prev => ({
                            ...prev,
                            targetCount: mode === 'unlimited' ? 0 : prev.targetCount,
                            habitConfig: {
                                ...prev.habitConfig, isHabit: true, mode: mode === 'check' ? 'check' : 'count',
                                hasTarget: mode === 'target', targetCount: mode === 'target' ? Math.max(1, habit.targetCount || 8) : mode === 'check' ? 1 : 0,
                            },
                        }))} />
                    {habit.mode === 'count' && <>
                        {habitMode(habit) === 'target' &&
                            <NumberField label="每日目标数量" min={1} value={habit.targetCount}
                                onChange={value => setDraft(prev => ({ ...prev, targetCount: value === '' ? '' : Number(value), habitConfig: { ...prev.habitConfig, targetCount: value === '' ? '' : Number(value) } }))} />}
                        <Field label="计量单位"><input className={fieldClass} value={habit.unit ?? '次'} onChange={event => setHabit('unit', event.target.value)} /></Field>
                    </>}
                </>}
                <NumberField label="每次奖励（金元宝）" min={Math.min(0, initial.reward ?? 0)}
                    value={reward} onChange={setNumber('reward')} />
            </div>
            {freq === 'daily_must' && <Checkbox checked={draft.holidayExempt} onChange={value => set('holidayExempt', value)}>节假日免打卡</Checkbox>}

            <div className={`rounded-xl border px-4 py-3 text-sm text-slate-800 ${theme.lightBg} ${theme.lightBorder}`} aria-label="规则预览">
                <p className="font-semibold">规则预览</p>
                <p className="mt-1 break-words">{describeRule(draft)} · {reward === 0 ? '无基础奖励' : `每次 ${reward} 金元宝`}</p>
                <p className="mt-1 text-xs text-slate-600">
                    {draft.startDate || '立即开始'} {draft.deadline ? `至 ${draft.deadline}` : ' · 不限截止日期'}
                </p>
            </div>

            <Options title="日期与目标说明">
                <Field label="目标说明（选填）"><input className={fieldClass} value={draft.targetGoal ?? ''} onChange={event => set('targetGoal', event.target.value)} /></Field>
                <div className={gridClass}>
                    <Field label="开始日期"><input className={fieldClass} type="date" value={draft.startDate ?? ''} onChange={event => set('startDate', event.target.value)} /></Field>
                    <Field label="截止日期"><input className={fieldClass} type="date" value={draft.deadline ?? ''} onChange={event => set('deadline', event.target.value)} /></Field>
                </div>
            </Options>
            <Options title="奖励与其他设置">
                {freq === 'daily_must' && <NumberField label="每周达标比例（%）" max={100} value={draft.dailyCompletionThresholdPercent ?? 80} onChange={setNumber('dailyCompletionThresholdPercent')} />}
                {freq === 'weekly_optional' && <NumberField label="超额每次加奖比例（%）" max={100} value={draft.weeklyExtraPercentPerExtra ?? 10} onChange={setNumber('weeklyExtraPercentPerExtra')} />}

                {freq !== 'habit' && <NumberField label="完赛奖励（金元宝）" min={Math.min(0, initial.completedReward ?? 0)} value={draft.completedReward ?? (task ? 0 : 20)} onChange={setNumber('completedReward')} />}
                <SelectField label="打卡即时奖励" value={draft.onCheckinReward || ''} onChange={value => set('onCheckinReward', value)}
                    options={[[ '', '无'], ['wheel_gold', '金币转盘'], ['wheel_xp', '经验转盘']]} />
                <SelectField label="准时打卡抽卡" value={draft.timeRewardOption || 'default'} onChange={value => setDraft(prev => ({ ...prev, timeRewardOption: value, ...(value === 'custom' && !prev.timeRewardDeadline ? { timeRewardDeadline: '09:00' } : {}) }))}
                    options={[[ 'default', '跟随全局规则'], ['custom', '自订截止时间'], ['disabled', '不抽卡']]} />
                {draft.timeRewardOption === 'custom' && <Field label="准时抽卡截止时间"><input className={fieldClass} required type="time" value={draft.timeRewardDeadline ?? '09:00'} onChange={event => set('timeRewardDeadline', event.target.value)} /></Field>}

                {freq === 'daily_must' && <Options title="每日多次打卡">
                    <Checkbox checked={draft.multiCheckin} onChange={value => set('multiCheckin', value)}>允许一天打卡多次</Checkbox>
                    {draft.multiCheckin && <>
                        <SelectField label="每次记录的计量单位" value={draft.multiUnitLabel || ''} onChange={value => setDraft(prev => ({ ...prev, multiUnitLabel: value, bonusThresholdType: value ? prev.bonusThresholdType : 'count' }))}
                            options={[['', '不附加单位'], ...[...new Set(['课时', '单元', '知识点', '道题', '页', draft.multiUnitLabel].filter(Boolean))].map(unit => [unit, unit])]} />
                        <NumberField label="额外奖励触发门槛（0 为关闭）" value={draft.bonusThreshold ?? 0} onChange={setNumber('bonusThreshold')} />
                        {Number(draft.bonusThreshold) > 0 && <>
                            <SelectField label="门槛按" value={draft.bonusThresholdType ?? 'count'} onChange={value => set('bonusThresholdType', value)}
                                options={draft.multiUnitLabel ? [['count', '打卡次数'], ['units', `累计${draft.multiUnitLabel}`]] : [['count', '打卡次数']]} />
                            <SelectField label="达标奖励" value={draft.bonusType ?? 'wheel'} onChange={value => set('bonusType', value)}
                                options={[[ 'wheel', '幸运大转盘'], ['multiply', '本次金元宝翻倍']]} />
                            {draft.bonusType === 'multiply' && <NumberField label="金元宝倍数" min={2} max={10} value={draft.bonusMultiplier ?? 2} onChange={setNumber('bonusMultiplier')} />}
                        </>}
                    </>}
                </Options>}

                {freq === 'reading' && <Options title="书籍资料与完读奖励">
                    <Field label="书名"><input className={fieldClass} value={reading.bookTitle || ''} placeholder={draft.name || '默认使用任务名称'} onChange={event => setReading('bookTitle', event.target.value)} /></Field>
                    <Field label="作者（选填）"><input className={fieldClass} value={reading.author || ''} onChange={event => setReading('author', event.target.value)} /></Field>
                    <SelectField label="书本徽章" value={reading.coverEmoji || '📖'} onChange={value => setReading('coverEmoji', value)}
                        options={[...new Set(['📖', '📚', '🏰', '🚀', '🦁', '🧙‍♂️', '🔬', '🌱', '⛵', '🐱', reading.coverEmoji].filter(Boolean))].map(icon => [icon, icon])} />
                    <SelectField label="周期安排" value={reading.period || 'weekly'} onChange={value => setReading('period', value)}
                        options={[[ 'weekly', '周必读'], ['monthly', '月必读'], ['custom', '长期自选']]} />
                    <div className={gridClass}>
                        <NumberField label="按期完读奖励" min={Math.min(0, initial.readingConfig?.grandReward ?? 0)} value={reading.grandReward ?? 30}
                            onChange={value => setReading('grandReward', value === '' ? '' : Number(value))} />
                        <NumberField label="逾期完读奖励" min={Math.min(0, initial.readingConfig?.overdueGrandReward ?? 0)} value={reading.overdueGrandReward ?? 20}
                            onChange={value => setReading('overdueGrandReward', value === '' ? '' : Number(value))} />
                    </div>
                </Options>}

                {freq === 'habit' && <Options title="习惯图标">
                    <div className="flex flex-wrap gap-2">
                        {HABIT_ICON_PRESETS.map(({ icon, label }) => <button key={icon} type="button" aria-label={label}
                            aria-pressed={habit.icon === icon} onClick={() => setHabit('icon', icon)}
                            className={`size-11 rounded-lg border ${focusClass} ${habit.icon === icon ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>{icon}</button>)}
                    </div>
                    <Field label="自定义图标"><input className={fieldClass} value={habit.icon || ''} onChange={event => setHabit('icon', event.target.value)} /></Field>
                </Options>}

                <Options title="学业目标">
                    <SelectField label="关联学业目标天梯" value={draft.linkedSubject || ''} onChange={value => set('linkedSubject', value)}
                        options={[[ '', '无关联'], ['math_olympiad', '奥数思维天梯'], ['school_math', '校内数学天梯'], ['school_chinese', '校内语文天梯'], ['school_science', '校内科学天梯'], ['school_english', '校内英语天梯']]} />
                    {draft.linkedSubject === task?.linkedSubject && curriculum}
                </Options>
                {task && <button type="button" onClick={onDelete} className={`min-h-11 justify-self-start rounded-lg px-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 ${focusClass}`}>删除任务</button>}
            </Options>
        </div>

        <footer className="sticky bottom-0 z-10 grid gap-2 rounded-b-2xl border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            {error && <p className="text-sm font-medium text-rose-700" role="alert">{error}</p>}
            <div className="flex gap-3">
                <button type="button" onClick={onCancel} className={`min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${focusClass}`}>取消</button>
                <button type="submit" className={`min-h-11 flex-1 rounded-full px-4 text-sm font-semibold text-white shadow-xs ${theme.primaryBg} ${theme.primaryBgHover} ${focusClass}`}>
                    {task ? '保存修改' : '保存任务'}
                </button>
            </div>
        </footer>
    </form>;
}
