import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Plus, Target } from '../icons';
import { COLOR_PALETTES } from '../../data/themes';
import TaskEditor, { getTaskFrequency, TASK_FREQUENCIES } from './TaskEditor';

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
const frequencyLabels = Object.fromEntries(TASK_FREQUENCIES);

function isCompleted(task, records) {
    const freq = getTaskFrequency(task);
    if (freq === 'daily_must' || freq === 'weekly_optional' || freq === 'habit') return !!task.earlyCompleted;
    return Object.keys(records[task.id] || {}).length >= (task.targetCount || 0);
}

function taskDescription(task) {
    const freq = getTaskFrequency(task);
    if (freq === 'weekly_optional') return `每周选做 ${task.weeklyTargetCount ?? 3} 次`;
    if (freq === 'count') return `累计 ${task.targetCount ?? 0} 次`;
    return frequencyLabels[freq];
}

function CurriculumProgress({ child, subject, progress, onVerify }) {
    const config = window.AchievementSystem?.CURRICULUM_CONFIG?.[subject];
    if (!config) return null;
    const next = (progress ?? -1) + 1;
    if (next >= config.totalSemesters) return <p className="text-sm text-emerald-700">学业目标已全部达成</p>;
    const semester = config.getSemesterName(next);
    return <button type="button" className={`min-h-11 rounded-xl bg-indigo-50 px-3 text-sm font-semibold text-indigo-700 ${focusClass}`}
        onClick={() => {
            if (window.confirm(`确认 ${child} 已完成「${semester}」的全部学习内容？确认后将解锁对应成就。`)) {
                onVerify(child, subject, next);
            }
        }}>
        核销{semester}
    </button>;
}

export default function TaskSettings({ child, theme = COLOR_PALETTES.rose, tasks, records, addTask, updateTask, deleteTask, curriculumProgress, verifyCurriculum }) {
    const [editor, setEditor] = useState(null);
    const [saved, setSaved] = useState(null);
    const [search, setSearch] = useState('');
    const [frequency, setFrequency] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);
    const savedRowRef = useRef(null);
    const addButtonRef = useRef(null);
    const editedTask = editor?.taskId && tasks.find(task => task.id === editor.taskId);
    const editorOpen = !!(editor && (editor.create || editedTask));

    useEffect(() => {
        if (saved && !editorOpen) savedRowRef.current?.focus();
    }, [saved, editorOpen]);

    const matchesFilter = task => {
        const query = search.trim().toLowerCase();
        return (!query || [task.name, task.targetGoal].some(text => text?.toLowerCase().includes(query))) &&
            (!frequency || getTaskFrequency(task) === frequency);
    };

    function saveTask(fields) {
        const next = { ...editedTask, ...fields };
        const id = editedTask ? editedTask.id : addTask(fields);
        if (editedTask && Object.keys(fields).length) updateTask(id, fields);
        if (isCompleted({ ...next, id }, records)) setShowCompleted(true);
        if (!editedTask || !matchesFilter(next)) {
            setSearch('');
            setFrequency('');
        }
        setSaved({ id, message: editedTask ? '修改已保存' : '任务已创建' });
        setEditor(null);
    }

    if (editorOpen) {
        const subject = editedTask?.linkedSubject;
        return <TaskEditor task={editedTask} theme={theme} onSave={saveTask}
            onCancel={() => {
                setEditor(null);
                requestAnimationFrame(() => addButtonRef.current?.focus());
            }} onDelete={() => deleteTask(editedTask.id)}
            curriculum={subject && <CurriculumProgress child={child} subject={subject}
                progress={curriculumProgress?.[subject]} onVerify={verifyCurriculum} />} />;
    }

    const visible = tasks.filter(matchesFilter);
    const completed = visible.filter(task => isCompleted(task, records));
    const ongoing = visible.filter(task => !isCompleted(task, records));
    if (saved) ongoing.sort((a, b) => Number(b.id === saved.id) - Number(a.id === saved.id));

    const renderRow = task => {
        const highlighted = saved?.id === task.id;
        return <li key={task.id}>
            <button type="button" ref={highlighted ? savedRowRef : null}
                onClick={() => { setSaved(null); setEditor({ taskId: task.id }); }}
                className={`group flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${focusClass} ${highlighted ? `${theme.border} ${theme.lightBg}` : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'}`}>
                <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-semibold text-slate-900">{task.name}</span>
                    <span className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-600">
                        <span>{taskDescription(task)}</span>
                        {task.reward !== undefined && <span>{task.reward === 0 ? '无基础奖励' : `${task.reward} 金元宝/次`}</span>}
                    </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
            </button>
        </li>;
    };

    return <section aria-labelledby="task-settings-title" className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="min-w-0">
                <h3 id="task-settings-title" className="flex items-center gap-2 text-base font-bold text-slate-800"><Target aria-hidden="true" className={`size-5 ${theme.primary}`} />任务管理</h3>
                <p className="mt-1 break-words text-sm text-slate-600">{child} · {tasks.length} 项任务</p>
            </div>
            <button type="button" ref={addButtonRef} onClick={() => { setSaved(null); setEditor({ create: true }); }}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white shadow-xs ${theme.primaryBg} ${theme.primaryBgHover} ${focusClass}`}>
                <Plus className="size-4" aria-hidden="true" />新增任务
            </button>
        </header>

        {saved && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">{saved.message}</p>}

        {(tasks.length > 1 || search || frequency) && <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input type="search" aria-label="搜索任务" placeholder="搜索任务" value={search} onChange={event => setSearch(event.target.value)}
                className={`min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 ${focusClass}`} />
            <select aria-label="按打卡方式筛选" value={frequency} onChange={event => setFrequency(event.target.value)}
                className={`min-h-11 rounded-xl border border-slate-300 bg-white px-2 text-base text-slate-700 ${focusClass}`}>
                <option value="">全部打卡方式</option>
                {TASK_FREQUENCIES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
        </div>}

        {ongoing.length > 0 && <ul className="grid gap-2" aria-label="进行中的任务">{ongoing.map(renderRow)}</ul>}
        {visible.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-600">
            {tasks.length ? '没有符合条件的任务' : '还没有任务。点击「新增任务」开始。'}
        </p>}
        {completed.length > 0 && <details open={showCompleted} onToggle={event => setShowCompleted(event.currentTarget.open)}
            className="group/completed rounded-xl border border-slate-200 bg-white">
            <summary className={`flex min-h-11 cursor-pointer list-none items-center justify-between rounded-xl px-3 text-sm font-semibold text-slate-700 [&::-webkit-details-marker]:hidden ${focusClass}`}>
                已完成（{completed.length}）<ChevronRight className="size-4 text-slate-500 group-open/completed:rotate-90" aria-hidden="true" />
            </summary>
            <ul className="grid gap-2 border-t border-slate-200 p-3">{completed.map(renderRow)}</ul>
        </details>}
    </section>;
}
