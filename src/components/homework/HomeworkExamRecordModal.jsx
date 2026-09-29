import React, { useState, useEffect, useMemo } from 'react';
import {
  XIcon, Coins, Trash2, BookOpen, FileText, Clipboard, Calendar
} from '../icons.jsx';
import { getLocalDateKey } from '../../utils/date.js';

// 作业与考试成绩记录系统
        // SimpleLineChart, getTaskSubjectForStats, SUBJECT_LABELS 已迁移至 src/components/stats/StatsModal.jsx
export const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

export const HomeworkRecordForm = ({ subjects, itemsBySubject, gradingMode, onSave, gradeOptions }) => {
            const [subjectId, setSubjectId] = React.useState(subjects[0]?.id || '');
            const [homeworkId, setHomeworkId] = React.useState('');
            const [date, setDate] = React.useState(getLocalDateKey(0));
            const [scoreOrGrade, setScoreOrGrade] = React.useState('');
            const items = (itemsBySubject && itemsBySubject[subjectId]) || [];
            React.useEffect(() => { setHomeworkId((itemsBySubject && itemsBySubject[subjectId] && itemsBySubject[subjectId][0]?.id) || ''); }, [subjectId, itemsBySubject]);
            const handleSubmit = (e) => {
                e.preventDefault();
                if (!scoreOrGrade.trim()) return;
                const sub = subjects.find(s => s.id === subjectId);
                const hw = items.find(i => i.id === homeworkId);
                onSave({ subjectId, homeworkId, subjectName: sub?.name, homeworkName: hw?.name, date, scoreOrGrade: scoreOrGrade.trim() });
                setScoreOrGrade('');
            };
            return (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">科目</label><select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800 font-medium">{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">作业名称</label><select value={homeworkId} onChange={e => setHomeworkId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800 font-medium">{items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">批改日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">{gradingMode === 'score' ? '分数' : '等级'}</label>{gradingMode === 'score' ? <input type="number" min="0" max="100" placeholder="0-100" value={scoreOrGrade} onChange={e => setScoreOrGrade(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800" /> : <select value={scoreOrGrade} onChange={e => setScoreOrGrade(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800 font-medium"><option value="">选择等级</option>{gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}</select>}</div>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm shadow">登记</button>
                </form>
            );
        };

        // --- 增强版作业/考试记录展示组件 ---
export const EnhancedRecordDisplay = ({ records = [], type, onDelete, activeChild, setWheelHistory }) => {
            const [filterMode, setFilterMode] = useState('all'); // all, subject, date, homework
            const [selectedFilter, setSelectedFilter] = useState('全部');
            const [sortBy, setSortBy] = useState('date'); // date, score, gold
            
            // 防御性处理：确保 records 是数组
            const safeRecords = useMemo(() => Array.isArray(records) ? records : [], [records]);
            
            // 当 records 或 type 变化时重置筛选状态
            useEffect(() => {
                setFilterMode('all');
                setSelectedFilter('全部');
            }, [type]);
            
            // 获取所有筛选项
            const getFilterOptions = () => {
                if (type === 'homework') {
                    const subjects = [...new Set(safeRecords.map(r => r.subjectName).filter(Boolean))];
                    const homeworks = [...new Set(safeRecords.map(r => r.homeworkName).filter(Boolean))];
                    const dates = [...new Set(safeRecords.map(r => r.date).filter(Boolean))].sort().reverse();
                    return { subjects, homeworks, dates };
                } else {
                    const subjects = [...new Set(safeRecords.map(r => r.subjectName).filter(Boolean))];
                    const examTypes = [...new Set(safeRecords.map(r => r.examTypeName).filter(Boolean))];
                    const dates = [...new Set(safeRecords.map(r => r.date).filter(Boolean))].sort().reverse();
                    return { subjects, examTypes, dates };
                }
            };
            
            const filterOptions = getFilterOptions();
            
            // 筛选记录
            const filteredRecords = useMemo(() => {
                let result = [...safeRecords];
                
                // 按筛选模式过滤
                if (filterMode === 'subject') {
                    if (selectedFilter !== '全部') {
                        result = result.filter(r => r.subjectName === selectedFilter);
                    }
                } else if (filterMode === 'homework' && type === 'homework') {
                    if (selectedFilter !== '全部') {
                        result = result.filter(r => r.homeworkName === selectedFilter);
                    }
                } else if (filterMode === 'examType' && type === 'exam') {
                    if (selectedFilter !== '全部') {
                        result = result.filter(r => r.examTypeName === selectedFilter);
                    }
                } else if (filterMode === 'date') {
                    if (selectedFilter !== '全部') {
                        result = result.filter(r => r.date === selectedFilter);
                    }
                }
                
                // 排序
                if (sortBy === 'date') {
                    result.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
                } else if (sortBy === 'score') {
                    result.sort((a, b) => {
                        const scoreA = parseInt(a.scoreOrGrade, 10) || 0;
                        const scoreB = parseInt(b.scoreOrGrade, 10) || 0;
                        return scoreB - scoreA;
                    });
                } else if (sortBy === 'gold') {
                    result.sort((a, b) => (b.earnedGold || 0) - (a.earnedGold || 0));
                }
                
                return result;
            }, [safeRecords, filterMode, selectedFilter, sortBy, type]);
            
            // 统计信息
            const stats = useMemo(() => {
                const total = safeRecords.length;
                const totalGold = safeRecords.reduce((sum, r) => sum + (r.earnedGold || 0), 0);
                const scores = safeRecords.map(r => parseInt(r.scoreOrGrade, 10)).filter(s => !isNaN(s));
                const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
                const subjectCount = new Set(safeRecords.map(r => r.subjectName).filter(Boolean)).size;
                
                // 按科目分组统计
                const bySubject = {};
                safeRecords.forEach(r => {
                    const subj = r.subjectName || '未知';
                    if (!bySubject[subj]) bySubject[subj] = { count: 0, totalGold: 0, scores: [] };
                    bySubject[subj].count++;
                    bySubject[subj].totalGold += r.earnedGold || 0;
                    const s = parseInt(r.scoreOrGrade, 10);
                    if (!isNaN(s)) bySubject[subj].scores.push(s);
                });
                
                // 按日期分组统计
                const byDate = {};
                safeRecords.forEach(r => {
                    const date = r.date || '未知';
                    if (!byDate[date]) byDate[date] = { count: 0, totalGold: 0 };
                    byDate[date].count++;
                    byDate[date].totalGold += r.earnedGold || 0;
                });
                
                return { total, totalGold, avgScore, maxScore, subjectCount, bySubject, byDate };
            }, [safeRecords]);
            
            // 分数颜色映射
            const getScoreColor = (score) => {
                const num = parseInt(score, 10);
                if (isNaN(num)) {
                    const gradeIndex = GRADE_OPTIONS.indexOf(score);
                    if (gradeIndex >= 0 && gradeIndex <= 2) return 'text-green-600 bg-green-50';
                    if (gradeIndex >= 3 && gradeIndex <= 5) return 'text-blue-600 bg-blue-50';
                    if (gradeIndex >= 6 && gradeIndex <= 8) return 'text-yellow-600 bg-yellow-50';
                    return 'text-red-600 bg-red-50';
                }
                if (num >= 90) return 'text-green-600 bg-green-50';
                if (num >= 80) return 'text-blue-600 bg-blue-50';
                if (num >= 70) return 'text-yellow-600 bg-yellow-50';
                if (num >= 60) return 'text-orange-600 bg-orange-50';
                return 'text-red-600 bg-red-50';
            };
            
            const currentFilters = filterMode === 'all' ? [] : 
                filterMode === 'subject' ? filterOptions.subjects :
                filterMode === 'homework' && type === 'homework' ? filterOptions.homeworks :
                filterMode === 'examType' && type === 'exam' ? filterOptions.examTypes :
                filterOptions.dates;
            
            return (
                <div className="space-y-4">
                    {/* 统计概览 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                            <div className="text-xs text-indigo-600 font-semibold">{type === 'homework' ? '作业总数' : '考试总数'}</div>
                            <div className="text-2xl font-bold text-indigo-700">{stats.total}</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                            <div className="text-xs text-amber-600 font-semibold">获得金元宝</div>
                            <div className="text-2xl font-bold text-amber-700 flex items-center gap-1">
                                {stats.totalGold}<Coins className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="text-xs text-blue-600 font-semibold">平均分数</div>
                            <div className="text-2xl font-bold text-blue-700">{stats.avgScore || '-'}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="text-xs text-green-600 font-semibold">涉及科目</div>
                            <div className="text-2xl font-bold text-green-700">{stats.subjectCount}</div>
                        </div>
                    </div>
                    
                    {/* 筛选和排序控制 */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="text-xs font-bold text-gray-500">筛选维度：</span>
                            <div className="flex gap-1">
                                <button onClick={() => { setFilterMode('all'); setSelectedFilter('全部'); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors transition-transform ${filterMode === 'all' ? 'bg-indigo-500 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>全部</button>
                                <button onClick={() => { setFilterMode('subject'); setSelectedFilter('全部'); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors transition-transform ${filterMode === 'subject' ? 'bg-indigo-500 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>按科目</button>
                                {type === 'homework' ? (
                                    <button onClick={() => { setFilterMode('homework'); setSelectedFilter('全部'); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors transition-transform ${filterMode === 'homework' ? 'bg-indigo-500 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>按作业</button>
                                ) : (
                                    <button onClick={() => { setFilterMode('examType'); setSelectedFilter('全部'); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors transition-transform ${filterMode === 'examType' ? 'bg-indigo-500 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>按类型</button>
                                )}
                                <button onClick={() => { setFilterMode('date'); setSelectedFilter('全部'); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors transition-transform ${filterMode === 'date' ? 'bg-indigo-500 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>按日期</button>
                            </div>
                        </div>
                        
                        {filterMode !== 'all' && currentFilters.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                <button onClick={() => setSelectedFilter('全部')} className={`px-2 py-1 rounded-md text-xs font-medium transition-colors transition-transform ${selectedFilter === '全部' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}>全部</button>
                                {currentFilters.slice(0, 10).map(f => (
                                    <button key={f} onClick={() => setSelectedFilter(f)} className={`px-2 py-1 rounded-md text-xs font-medium transition-colors transition-transform ${selectedFilter === f ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}>{f}</button>
                                ))}
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">排序：</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white">
                                <option value="date">按日期</option>
                                <option value="score">按分数</option>
                                <option value="gold">按金元宝</option>
                            </select>
                            <span className="text-xs text-gray-400 ml-auto">共 {filteredRecords.length} 条记录</span>
                        </div>
                    </div>
                    
                    {/* 记录卡片列表 */}
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">暂无记录</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredRecords.slice(0, 30).map(r => (
                                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group relative">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getScoreColor(r.scoreOrGrade)}`}>
                                                {r.scoreOrGrade}
                                            </span>
                                            {r.earnedGold > 0 && (
                                                <span className="flex items-center gap-0.5 text-amber-600 text-sm font-bold">
                                                    +{r.earnedGold}<Coins className="w-3.5 h-3.5 text-amber-500" />
                                                </span>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => { const toReclaim = r.earnedGold || 0; onDelete(r.id); if (setWheelHistory && toReclaim > 0) setWheelHistory(prev => { const next = { ...prev }; if (r.wheelHistoryKey) delete next[r.wheelHistoryKey]; else next[`${activeChild}-${type === 'homework' ? 'HOMEWORK' : 'EXAM'}-REVOKE-${Date.now()}`] = -toReclaim; return next; }); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors transition-transform" title="删除并收回元宝">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="font-medium text-gray-700">{r.subjectName}</span>
                                        </div>
                                        {type === 'homework' && r.homeworkName && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <FileText className="w-3 h-3" />
                                                <span>{r.homeworkName}</span>
                                            </div>
                                        )}
                                        {type === 'exam' && r.examTypeName && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clipboard className="w-3 h-3" />
                                                <span>{r.examTypeName}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>{r.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {filteredRecords.length > 30 && (
                        <div className="text-center text-sm text-gray-400">还有 {filteredRecords.length - 30} 条记录未显示</div>
                    )}
                </div>
            );
        };
export const ExamRecordForm = ({ subjects, examTypes, onSave }) => {
            const [subjectId, setSubjectId] = React.useState(subjects[0]?.id || '');
            const [examTypeId, setExamTypeId] = React.useState(examTypes[0]?.id || '');
            const [date, setDate] = React.useState(getLocalDateKey(0));
            const [scoreOrGrade, setScoreOrGrade] = React.useState('');
            const handleSubmit = (e) => {
                e.preventDefault();
                if (!scoreOrGrade.trim()) return;
                const sub = subjects.find(s => s.id === subjectId);
                const ex = examTypes.find(t => t.id === examTypeId);
                onSave({ subjectId, examTypeId, subjectName: sub?.name, examTypeName: ex?.name, date, scoreOrGrade: scoreOrGrade.trim() });
                setScoreOrGrade('');
            };
            return (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">科目</label><select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800 font-medium">{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">考试类型</label><select value={examTypeId} onChange={e => setExamTypeId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800 font-medium">{examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">考试日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">分数</label><input type="number" min="0" max="100" placeholder="0-100" value={scoreOrGrade} onChange={e => setScoreOrGrade(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800" /></div>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow">登记</button>
                </form>
            );
        };

        // --- 独立弹窗：作业与考试成绩登记（仅登记，不含数据中心）---
export const HomeworkExamRecordModal = ({ show, onClose, theme, activeChild, homeworkExamConfig, homeworkRecords, examRecords, setHomeworkRecords, setExamRecords, setWheelHistory, pushWecomGrade, updateStats: propUpdateStats, triggerSyncUpload: propTriggerSyncUpload }) => {
            const [tab, setTab] = useState('homework');
            if (!show) return null;
            const updateStats = propUpdateStats || (typeof window !== 'undefined' && window.updateStats) || (() => {});
            const triggerSyncUpload = propTriggerSyncUpload || (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function' ? window.triggerSyncUpload : (() => {}));

            const config = homeworkExamConfig || {};
            const hwSubjects = config.homeworkSubjects || [];
            const hwItemsBySub = config.homeworkItems || {};
            const hwGradingMode = config.homeworkGradingMode || 'score';
            const hwRewards = config.homeworkRewards || [];
            const examTypes = config.examTypes || [];
            const examRewards = config.examRewards || [];
            const hwRecords = (homeworkRecords && homeworkRecords[activeChild]) || [];
            const exRecords = (examRecords && examRecords[activeChild]) || [];
            const computeHomeworkGold = (record) => {
                const scoreOrGrade = typeof record === 'object' && record !== null ? record.scoreOrGrade : record;
                const recSubjectId = typeof record === 'object' && record !== null ? record.subjectId : undefined;
                const recHomeworkId = typeof record === 'object' && record !== null ? record.homeworkId : undefined;
                const recSubjectName = typeof record === 'object' && record !== null ? (record.subjectName || '').trim() : '';
                const recHomeworkName = typeof record === 'object' && record !== null ? (record.homeworkName || '').trim() : '';
                const norm = (s) => (String(s || '').trim());
                let relevant = (hwRewards || []).filter(r => {
                    const matchById = (!r.subjectId || r.subjectId === recSubjectId) && (!r.homeworkId || r.homeworkId === recHomeworkId);
                    if (matchById) return true;
                    if (!recSubjectName || !recHomeworkName) return false;
                    const ruleSubName = norm(r.subjectName) || (hwSubjects.find(s => s.id === r.subjectId) || {}).name || '';
                    const ruleItems = (hwItemsBySub && hwItemsBySub[r.subjectId]) || [];
                    const ruleHwName = norm(r.homeworkName) || (ruleItems.find(i => i.id === r.homeworkId) || {}).name || '';
                    return (norm(ruleSubName) === recSubjectName && norm(ruleHwName) === recHomeworkName);
                });
                if (relevant.length === 0 && recSubjectName && recHomeworkName) {
                    relevant = (hwRewards || []).filter(r => norm(r.subjectName) === recSubjectName && norm(r.homeworkName) === recHomeworkName);
                }
                if (relevant.length === 0 && recSubjectName && recHomeworkName) {
                    const subByName = (hwSubjects || []).find(s => norm(s.name) === recSubjectName);
                    const itemsOfSub = subByName ? (hwItemsBySub && hwItemsBySub[subByName.id]) || [] : [];
                    const hwByName = itemsOfSub.find(i => norm(i.name) === recHomeworkName);
                    if (subByName && hwByName) relevant = (hwRewards || []).filter(r => r.subjectId === subByName.id && r.homeworkId === hwByName.id);
                }
                if (hwGradingMode === 'score') {
                    const num = parseInt(scoreOrGrade, 10);
                    if (isNaN(num)) return 0;
                    const sortedScore = [...relevant].filter(r => r.type === 'score').sort((a, b) => (b.minScore || 0) - (a.minScore || 0));
                    for (const r of sortedScore) { if (num >= (r.minScore || 0)) return r.gold || 0; }
                    return 0;
                }
                const sortedGrade = [...relevant].filter(r => r.type === 'grade').sort((a, b) => GRADE_OPTIONS.indexOf(a.grade) - GRADE_OPTIONS.indexOf(b.grade));
                for (const r of sortedGrade) { if (r.grade === scoreOrGrade) return r.gold || 0; }
                return 0;
            };
            const computeExamGold = (scoreOrGrade) => {
                const sorted = [...examRewards].filter(r => r.type === 'score').sort((a, b) => (b.minScore || 0) - (a.minScore || 0));
                const num = parseInt(scoreOrGrade, 10);
                if (!isNaN(num)) { for (const r of sorted) { if (num >= (r.minScore || 0)) return r.gold || 0; } }
                return 0;
            };
            return (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden border-2 border-indigo-400/40 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        {/* 顶栏标头 */}
                        <div className="p-5 border-b bg-gradient-to-r from-amber-600 via-indigo-700 to-indigo-950 text-white shrink-0 flex justify-between items-center shadow-md relative">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl backdrop-blur-md border border-white/20 shadow-inner">
                                    📜
                                </div>
                                <div>
                                    <h2 className="text-xl font-black flex items-center gap-2 tracking-wide">
                                        文华殿 · 课业功课与考绩金榜登记
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-yellow-200 border border-white/25 font-bold">登科造化</span>
                                    </h2>
                                    <p className="text-white/80 text-xs font-medium mt-0.5">
                                        记载 {activeChild} 学业精进历程 · 达标核验与天工宝赏激励
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/15 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                                title="关闭"
                            >
                                <XIcon className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* 分栏导航 */}
                        <div className="flex gap-2 p-2.5 border-b border-slate-200/80 bg-slate-100/80 backdrop-blur-xs">
                            <button
                                onClick={() => setTab('homework')}
                                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                                    tab === 'homework'
                                        ? 'bg-white shadow-md text-indigo-900 border-2 border-indigo-300/80 scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                            >
                                <span>📚</span> 课业功课登记与总览
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                                    {hwRecords.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setTab('exam')}
                                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                                    tab === 'exam'
                                        ? 'bg-white shadow-md text-emerald-900 border-2 border-emerald-300/80 scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                            >
                                <span>🏅</span> 考卷金榜登记与总览
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                    {exRecords.length}
                                </span>
                            </button>
                        </div>

                        {/* 主内容滚动区 */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 space-y-6">
                            {tab === 'homework' ? (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl border-2 border-slate-200/80 shadow-sm p-5 sm:p-6">
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                            <h3 className="font-black text-slate-800 flex items-center gap-2 text-base">
                                                <span>✍️</span> 登记新功课成绩
                                            </h3>
                                            <span className="text-xs text-slate-400 font-medium">登记完成即刻结算金元宝与学情数据</span>
                                        </div>
                                        {hwSubjects.length === 0 ? (
                                            <p className="text-slate-400 text-sm py-4 text-center">请在设置 → 作业与考试 中先添加科目和作业名称。</p>
                                        ) : (
                                            <HomeworkRecordForm
                                                subjects={hwSubjects}
                                                itemsBySubject={hwItemsBySub}
                                                gradingMode={hwGradingMode}
                                                gradeOptions={GRADE_OPTIONS}
                                                onSave={(record) => {
                                                    const gold = computeHomeworkGold(record);
                                                    const ts = Date.now();
                                                    const historyKey = `${activeChild}-HOMEWORK-${ts}__${(record.subjectName || '')}__${(record.homeworkName || '')}`;
                                                    setHomeworkRecords(prev => ({
                                                        ...prev,
                                                        [activeChild]: [
                                                            ...((prev[activeChild]) || []),
                                                            { ...record, id: 'hw_' + ts, earnedGold: gold, wheelHistoryKey: historyKey, createdAt: new Date().toISOString() }
                                                        ]
                                                    }));
                                                    if (gold > 0 && setWheelHistory) {
                                                        setWheelHistory(prev => ({ ...prev, [historyKey]: gold }));
                                                        updateStats(activeChild, 'gold_earn', gold, { source: 'homework', dateKey: getLocalDateKey(0) });
                                                    }
                                                    if (pushWecomGrade) pushWecomGrade(activeChild, 'homework', record.subjectName || record.homeworkName || '作业', record.scoreOrGrade, record.date);
                                                    if (typeof triggerSyncUpload === 'function') triggerSyncUpload();
                                                    else if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') window.triggerSyncUpload();
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="bg-white rounded-2xl border-2 border-slate-200/80 shadow-sm p-5 sm:p-6">
                                        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-base">
                                            <span>📊</span> 功课历史存卷与分析
                                        </h3>
                                        <EnhancedRecordDisplay 
                                            records={hwRecords} 
                                            type="homework" 
                                            activeChild={activeChild}
                                            setWheelHistory={setWheelHistory}
                                            onDelete={(id) => {
                                                setHomeworkRecords(prev => ({ ...prev, [activeChild]: (prev[activeChild] || []).filter(x => x.id !== id) }));
                                                if (typeof triggerSyncUpload === 'function') triggerSyncUpload();
                                                else if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') window.triggerSyncUpload();
                                            }} 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl border-2 border-slate-200/80 shadow-sm p-5 sm:p-6">
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                            <h3 className="font-black text-slate-800 flex items-center gap-2 text-base">
                                                <span>🎯</span> 登记新考试测验成绩
                                            </h3>
                                            <span className="text-xs text-slate-400 font-medium">达标将核算大额金元宝奖赏</span>
                                        </div>
                                        {hwSubjects.length === 0 || examTypes.length === 0 ? (
                                            <p className="text-slate-400 text-sm py-4 text-center">请在设置 → 作业与考试 中配置科目和考试类型。</p>
                                        ) : (
                                            <ExamRecordForm
                                                subjects={hwSubjects}
                                                examTypes={examTypes}
                                                onSave={(record) => {
                                                    const gold = computeExamGold(record.scoreOrGrade);
                                                    const ts = Date.now();
                                                    const historyKey = `${activeChild}-EXAM-${ts}__${(record.subjectName || '')}__${(record.examTypeName || '')}`;
                                                    setExamRecords(prev => ({
                                                        ...prev,
                                                        [activeChild]: [
                                                            ...((prev[activeChild]) || []),
                                                            { ...record, id: 'ex_' + ts, earnedGold: gold, wheelHistoryKey: historyKey, createdAt: new Date().toISOString() }
                                                        ]
                                                    }));
                                                    if (gold > 0 && setWheelHistory) {
                                                        setWheelHistory(prev => ({ ...prev, [historyKey]: gold }));
                                                        updateStats(activeChild, 'gold_earn', gold, { source: 'exam', dateKey: getLocalDateKey(0) });
                                                    }
                                                    if (pushWecomGrade) pushWecomGrade(activeChild, 'exam', record.subjectName || '考试', record.scoreOrGrade, record.date);
                                                    if (typeof triggerSyncUpload === 'function') triggerSyncUpload();
                                                    else if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') window.triggerSyncUpload();
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="bg-white rounded-2xl border-2 border-slate-200/80 shadow-sm p-5 sm:p-6">
                                        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-base">
                                            <span>🏆</span> 考绩金榜长卷与分析
                                        </h3>
                                        <EnhancedRecordDisplay 
                                            records={exRecords} 
                                            type="exam" 
                                            activeChild={activeChild}
                                            setWheelHistory={setWheelHistory}
                                            onDelete={(id) => {
                                                setExamRecords(prev => ({ ...prev, [activeChild]: (prev[activeChild] || []).filter(x => x.id !== id) }));
                                                if (typeof triggerSyncUpload === 'function') triggerSyncUpload();
                                                else if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') window.triggerSyncUpload();
                                            }} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

export default HomeworkExamRecordModal;
