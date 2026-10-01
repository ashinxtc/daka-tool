import React, { useState } from 'react';
import { BookOpen, Trophy, Sparkles, XIcon, Plus, Calendar, Clock, CheckCircle2 } from '../icons';

/**
 * ReadingPavilionModal: 天工书阁 · 万卷藏书与伴读殿堂
 * - 在读书目卡片流 (支持多书并发：周必读 + 月必读)
 * - 黄金虚拟书架 (陈列已通关的书籍与读书纪念册)
 * - 阅读修养统计面板
 */
export const ReadingPavilionModal = ({
  show,
  onClose,
  readingTasks = [],
  readingHistory = [],
  shelvedBooks = {},
  onResumeShelvedBook,
  activeChild,
  checkins = {},
  todayStr,
  onOpenQuickCheckin,
  onOpenSettingsToAddTask,
  theme
}) => {
  const [tab, setTab] = useState('current'); // 'current' | 'shelf' | 'shelved' | 'stats'
  const [selectedMemorialBook, setSelectedMemorialBook] = useState(null);

  if (!show) return null;

  // 历史已读完藏书
  const childHistory = Array.isArray(readingHistory[activeChild]) ? readingHistory[activeChild] : [];
  // 待续书架 (插书签暂存的书)
  const childShelved = Array.isArray(shelvedBooks[activeChild]) ? shelvedBooks[activeChild] : [];
  
  // 累计阅读统计
  const totalBooksCompleted = childHistory.length;
  const totalPagesRead = childHistory.reduce((sum, b) => sum + (b.totalPages || b.pages || 0), 0);
  const totalNotesCollected = childHistory.reduce((sum, b) => sum + (Array.isArray(b.quotes) ? b.quotes.length : (b.note ? 1 : 0)), 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-amber-200 flex flex-col overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题区 */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-6 py-4 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl shadow-inner">
                📚
              </div>
              <div>
                <h2 className="font-black text-xl leading-tight flex items-center gap-2">
                  <span>天工书阁 · 伴读与藏书殿堂</span>
                  <span className="text-[11px] bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                    {activeChild}的私享书斋
                  </span>
                </h2>
                <p className="text-xs text-amber-100/90 mt-0.5">读万卷书 · 行万里路 · 积跬步以致千里</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* 切换 Tab */}
          <div className="flex gap-2 mt-4 pt-1 border-t border-white/20 flex-wrap">
            <button
              type="button"
              onClick={() => setTab('current')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                tab === 'current'
                  ? 'bg-white text-amber-900 shadow-md scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <span>📖 在读书目 ({readingTasks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('shelf')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                tab === 'shelf'
                  ? 'bg-white text-amber-900 shadow-md scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <span>📚 藏书书架 ({totalBooksCompleted})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('shelved')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                tab === 'shelved'
                  ? 'bg-white text-amber-900 shadow-md scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <span>🔖 待续书架 ({childShelved.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('stats')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                tab === 'stats'
                  ? 'bg-white text-amber-900 shadow-md scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <span>📊 阅读修养</span>
            </button>
          </div>
        </div>

        {/* 主体视口区域 */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-amber-50/20 space-y-6">
          
          {/* TAB 1: 在读书目 */}
          {tab === 'current' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  当前正在研读的书目
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenSettingsToAddTask) onOpenSettingsToAddTask();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>指派新书目</span>
                </button>
              </div>

              {readingTasks.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl bg-white border border-dashed border-amber-200 shadow-xs">
                  <div className="text-4xl mb-3">📖</div>
                  <h4 className="font-bold text-slate-700 text-base mb-1">暂无正在研读的书目</h4>
                  <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                    您可以在任务设置中将任务设定为【阅读任务】，指定本周或本月必读书本，完成后收获丰厚金币！
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenSettingsToAddTask) onOpenSettingsToAddTask();
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition"
                  >
                    🚀 立即去设定本周必读书
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {readingTasks.map(t => {
                    const cfg = t.readingConfig || {};
                    const cur = cfg.currentProgress || 0;
                    const total = cfg.totalPages || cfg.totalChapters || cfg.dailyTargetMinutes || cfg.targetCount || 100;
                    const pct = Math.min(100, Math.max(0, Math.round((cur / total) * 100)));
                    const isChecked = !!checkins[activeChild]?.[t.id]?.[todayStr] || t.earlyCompleted;
                    const mode = cfg.mode || 'pages';
                    const unitName = mode === 'chapters' ? '章' : mode === 'duration' ? '分钟' : mode === 'count' ? '本' : '页';
                    const periodTag = cfg.period === 'monthly' ? '月必读' : cfg.period === 'custom' ? '自选专栏' : '周必读';

                    return (
                      <div 
                        key={t.id}
                        className="bg-white rounded-2xl p-5 border border-amber-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* 顶部标签 */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300 flex items-center justify-center text-2xl shadow-xs shrink-0">
                              {cfg.coverEmoji || '📖'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-black text-slate-800 text-base truncate max-w-[150px]">
                                  {cfg.bookTitle || t.name}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  cfg.period === 'monthly'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {periodTag}
                                </span>
                              </div>
                              {cfg.author && <p className="text-xs text-slate-400 mt-0.5">{cfg.author} 著</p>}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-lg font-black text-amber-600">+{t.reward || 3}</span>
                            <span className="text-[10px] text-slate-400 block">日打卡金币</span>
                          </div>
                        </div>

                        {/* 进度条与数字 */}
                        <div className="space-y-1.5 mb-4">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                            <span>进度: {cur} / {total} {unitName}</span>
                            <span className="text-amber-600 font-black">{pct}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-amber-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>通关大奖: +{cfg.grandReward || 30} 金元宝</span>
                            <span>{pct >= 100 ? '已读完全书！' : `还差 ${Math.max(0, total - cur)} ${unitName}`}</span>
                          </div>
                        </div>

                        {/* 底部操作 */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                            <span className="text-xs font-bold text-slate-600">
                              {isChecked ? '今日已登记 ✅' : '今日待打卡 📖'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              if (onOpenQuickCheckin) onOpenQuickCheckin(t);
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-xs active:scale-95 transition"
                          >
                            {isChecked ? '更新/补记进度' : '打卡记进度'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 黄金虚拟书架 (已读藏书殿堂) */}
          {tab === 'shelf' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">📚 已读完经典殿堂</h3>
                  <p className="text-xs text-slate-400">每本读完的书本都会在此永久陈列，点击可翻阅读书纪念册</p>
                </div>
                <div className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                  累计珍藏 {totalBooksCompleted} 部经典
                </div>
              </div>

              {childHistory.length === 0 ? (
                <div className="text-center py-16 px-4 bg-amber-900/5 rounded-3xl border border-amber-900/10">
                  <div className="text-5xl mb-3">🪵</div>
                  <h4 className="font-bold text-amber-900 text-base mb-1">书架空空如也，等待第一本藏书入驻</h4>
                  <p className="text-xs text-amber-800/70 max-w-sm mx-auto">
                    当您或孩子将任意一本必读书目的进度推满 100% 后，就会在这里生成一本精美的烫金藏书纪念册！
                  </p>
                </div>
              ) : (
                /* 木质书架展示层 */
                <div className="space-y-8">
                  <div className="bg-gradient-to-b from-amber-900/15 via-amber-800/10 to-amber-900/25 p-6 rounded-3xl border-2 border-amber-900/20 shadow-inner">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {childHistory.map((book, idx) => (
                        <div
                          key={book.id || idx}
                          onClick={() => setSelectedMemorialBook(book)}
                          className="reading-shelf-book group cursor-pointer flex flex-col items-center"
                          data-book-title={book.bookTitle || book.title}
                        >
                          {/* 3D 拟物书籍立面 */}
                          <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-r-xl rounded-l-xs bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 p-2 text-white shadow-xl group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300 relative border-l-4 border-amber-900/60 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <span className="text-xl">{book.coverEmoji || '📖'}</span>
                              <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1 rounded shadow-2xs">
                                完结
                              </span>
                            </div>
                            <div className="text-center py-1">
                              <span className="font-black text-xs leading-tight line-clamp-2 drop-shadow-xs">
                                {book.bookTitle || book.title}
                              </span>
                              {book.author && <span className="text-[9px] text-amber-200 block truncate mt-0.5">{book.author}</span>}
                            </div>
                            <div className="text-[8px] text-amber-100/80 text-center font-mono">
                              {book.completedDate ? book.completedDate.slice(5) : '已通关'}
                            </div>
                          </div>
                          {/* 书本下方的实木托板 */}
                          <div className="w-full h-3 bg-gradient-to-b from-amber-800 to-amber-950 rounded-sm shadow-md mt-1 border-t border-amber-700/50" />
                          <span className="text-[11px] font-bold text-slate-700 truncate max-w-[100px] mt-1.5 group-hover:text-amber-700 transition-colors">
                            {book.bookTitle || book.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 待续书架 (插书签暂存的书) */}
          {tab === 'shelved' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <div>
                  <h3 className="font-black text-amber-900 text-sm flex items-center gap-1.5">
                    <span>🔖 待续书架</span>
                    <span className="text-xs text-amber-700/80 font-normal">（插上书签暂存的书目，可随时取回继续研读）</span>
                  </h3>
                </div>
              </div>

              {childShelved.length === 0 ? (
                <div className="text-center py-16 px-4 bg-amber-900/5 rounded-3xl border border-amber-900/10">
                  <div className="text-5xl mb-3">🔖</div>
                  <h4 className="font-bold text-amber-900 text-base mb-1">待续书架空空如也</h4>
                  <p className="text-xs text-amber-800/70 max-w-sm mx-auto">
                    当您或孩子在阅读过程中需要暂存当前书目换新书时，可在伴读打卡界面点击「插上书签暂存换书」，未读完的书目将安全收纳于此，随时可取回接力续读！
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {childShelved.map((b) => {
                    const total = b.totalPages || b.totalChapters || 180;
                    const cur = b.currentProgress || 0;
                    const pct = Math.min(100, Math.round((cur / total) * 100));
                    const unit = b.mode === 'chapters' ? '章' : b.mode === 'duration' ? '分' : '页';
                    return (
                      <div
                        key={b.id}
                        className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{b.coverEmoji || '📖'}</span>
                              <div>
                                <h4 className="font-black text-slate-800 text-sm leading-tight">{b.bookTitle}</h4>
                                {b.author && <p className="text-[10px] text-slate-400">{b.author} 著</p>}
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                              插书签
                            </span>
                          </div>

                          <div className="space-y-1 mb-3">
                            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                              <span>已读进度: {cur} / {total} {unit}</span>
                              <span className="font-bold text-amber-600">{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 pt-0.5">
                              暂存于 {b.shelvedDate || '近期'} · 通关大奖: +{b.grandReward || 30}💰
                            </p>
                          </div>
                        </div>

                        {onResumeShelvedBook && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`确定要取回《${b.bookTitle}》继续伴读吗？\n当前任务槽位将载入此书（已读 ${cur} 页），继续向全本通关冲刺！`)) {
                                onResumeShelvedBook(b);
                              }
                            }}
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>📖 取回继续读</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 阅读修养统计 */}
          {tab === 'stats' && (
            <div className="space-y-6">
              {/* 数据核心看板 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs text-center">
                  <div className="text-2xl mb-1">📚</div>
                  <div className="text-2xl font-black text-amber-600">{totalBooksCompleted}</div>
                  <div className="text-xs text-slate-400 font-bold">读完书目总数</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-2xl font-black text-blue-600">{totalPagesRead}</div>
                  <div className="text-xs text-slate-400 font-bold">累计精读页数</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs text-center">
                  <div className="text-2xl mb-1">✍️</div>
                  <div className="text-2xl font-black text-emerald-600">{totalNotesCollected}</div>
                  <div className="text-xs text-slate-400 font-bold">珍藏金句心得</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-xs text-center">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-2xl font-black text-purple-600">{childHistory.reduce((s, b) => s + (b.grandReward || 0), 0)}</div>
                  <div className="text-xs text-slate-400 font-bold">通关收获金币</div>
                </div>
              </div>

              {/* 读书励志长联 */}
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-2xl p-5 border border-amber-200/80 text-center">
                <p className="text-base font-black text-amber-900 tracking-wider">
                  “ 发愤识遍天下字，立志读尽人间书 ”
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  坚持每天打卡阅读，点滴积累终将汇聚成汪洋大海！
                </p>
              </div>
            </div>
          )}

        </div>

        {/* 底部关闭栏 */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs"
          >
            保存并返回
          </button>
        </div>
      </div>

      {/* 藏书纪念册详情小弹窗 */}
      {selectedMemorialBook && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-300 relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{selectedMemorialBook.coverEmoji || '📖'}</span>
                <div>
                  <h4 className="font-black text-base text-slate-800">{selectedMemorialBook.bookTitle || selectedMemorialBook.title}</h4>
                  {selectedMemorialBook.author && <p className="text-xs text-slate-400">{selectedMemorialBook.author} 著</p>}
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedMemorialBook(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">通关时间:</span>
                <span className="font-bold text-slate-800">{selectedMemorialBook.completedDate || '2026年'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">研读规格:</span>
                <span className="font-bold text-slate-800">{selectedMemorialBook.totalPages || 0} 页</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">通关奖励:</span>
                <span className="font-bold text-amber-600">+{selectedMemorialBook.grandReward || 30} 金元宝</span>
              </div>
            </div>

            {((Array.isArray(selectedMemorialBook.quotes) && selectedMemorialBook.quotes.length > 0) || selectedMemorialBook.note) && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500">✍️ 珍藏读书感悟与金句:</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {Array.isArray(selectedMemorialBook.quotes) && selectedMemorialBook.quotes.length > 0 ? (
                    selectedMemorialBook.quotes.map((q, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs italic text-slate-700 leading-relaxed flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold shrink-0">“</span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{q.text || q}</p>
                          {q.date && <span className="text-[10px] text-slate-400 not-italic block mt-0.5">{q.date} · 研读至第 {q.progress} 页</span>}
                        </div>
                        <span className="text-amber-500 font-bold shrink-0">”</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs italic text-slate-700 leading-relaxed">
                      “{selectedMemorialBook.note}”
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedMemorialBook(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition"
            >
              关闭纪念册
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingPavilionModal;
