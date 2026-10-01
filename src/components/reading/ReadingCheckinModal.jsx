import React, { useState, useMemo } from 'react';
import { BookOpen, Sparkles, XIcon, CheckCircle2, Trophy, Clock } from '../icons';

/**
 * ReadingCheckinModal: 极速伴读登记小窗（未读快速记）
 * 支持 4 种弹性度量：页码 / 章节 / 时长 / 本数
 * 录入进度并支持选填精彩金句，读完时支持通关大奖结算
 */
export const ReadingCheckinModal = ({
  show,
  onClose,
  task,
  onSaveProgress,
  onOpenPavilion,
  onShelveBook,
  theme
}) => {
  const cfg = task?.readingConfig || {};
  const mode = cfg.mode || 'pages'; // 'pages' | 'chapters' | 'duration' | 'count'
  const total = cfg.totalPages || cfg.totalChapters || cfg.dailyTargetMinutes || cfg.targetCount || 100;
  const currentBefore = cfg.currentProgress || 0;

  // 根据当前度量类型初始化今日输入值
  const [inputVal, setInputVal] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当弹窗打开或 task 切换时，同步默认值
  React.useEffect(() => {
    if (show && task) {
      if (mode === 'pages' || mode === 'chapters') {
        setInputVal(currentBefore ? String(currentBefore) : '');
      } else if (mode === 'duration') {
        setInputVal(String(cfg.dailyTargetMinutes || 20));
      } else {
        setInputVal('1');
      }
      setNote('');
      setIsSubmitting(false);
    }
  }, [show, task?.id, currentBefore, mode, cfg.dailyTargetMinutes]);

  // 解析新进度
  const numVal = parseInt(inputVal, 10) || 0;
  const newProgress = useMemo(() => {
    if (mode === 'pages' || mode === 'chapters') {
      return Math.max(0, numVal);
    }
    if (mode === 'duration' || mode === 'count') {
      return currentBefore + numVal;
    }
    return currentBefore;
  }, [mode, numVal, currentBefore]);

  if (!show || !task) return null;

  const progressPct = Math.min(100, Math.max(0, Math.round((newProgress / total) * 100)));
  const isFinished = progressPct >= 100;
  const increment = (mode === 'pages' || mode === 'chapters') ? Math.max(0, numVal - currentBefore) : numVal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const checkinData = {
      taskId: task.id,
      newProgress,
      increment,
      mode,
      note: note.trim(),
      isFinished,
      grandReward: cfg.grandReward || 30
    };

    onSaveProgress(checkinData);
    setIsSubmitting(false);
    onClose();
  };

  const periodLabel = cfg.period === 'monthly' ? '月必读' : cfg.period === 'custom' ? '自选专栏' : '周必读';

  if (!show || !task) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-amber-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl filter drop-shadow-xs">{cfg.coverEmoji || '📖'}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg leading-tight truncate max-w-[200px]">
                    {cfg.bookTitle || task.name}
                  </h3>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30 shrink-0">
                    {periodLabel}
                  </span>
                </div>
                {cfg.author && <p className="text-xs text-amber-100 mt-0.5 font-medium">{cfg.author} 著</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 进度预览卡 */}
          <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/50 rounded-2xl p-4 border border-amber-200/80">
            <div className="flex justify-between items-center text-xs text-slate-600 mb-2 font-bold">
              <span className="flex items-center gap-1 text-amber-900">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>当前进度: {currentBefore} / {total} {mode === 'chapters' ? '章' : mode === 'duration' ? '分钟' : mode === 'count' ? '本' : '页'}</span>
              </span>
              <span className="text-amber-700 font-black text-sm">{progressPct}%</span>
            </div>

            {/* 双色动态进度条 */}
            <div className="w-full h-3 bg-amber-100/80 rounded-full overflow-hidden p-0.5 relative">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* 增量反馈小贴士 */}
            <div className="flex justify-between text-[11px] text-slate-500 mt-2">
              <span>{increment > 0 ? `本次推进 +${increment} ${mode === 'chapters' ? '章' : mode === 'duration' ? '分钟' : mode === 'count' ? '本' : '页'}` : '请输入今日阅读进度'}</span>
              <span>剩余 {Math.max(0, total - newProgress)} {mode === 'chapters' ? '章' : mode === 'duration' ? '分钟' : '页'}</span>
            </div>
          </div>

          {/* 核心录入区域 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>
                {mode === 'pages' && '📖 今天读到第几页？'}
                {mode === 'chapters' && '📑 今天读完第几章？'}
                {mode === 'duration' && '⏱️ 今天阅读了多少分钟？'}
                {mode === 'count' && '📚 今天阅读了多少本/篇？'}
              </span>
              {mode === 'pages' && currentBefore > 0 && (
                <span className="text-[11px] text-amber-600 font-normal">上次记录到 P.{currentBefore}</span>
              )}
            </label>

            <div className="relative flex items-center">
              <input
                type="number"
                min="0"
                max={mode === 'pages' || mode === 'chapters' ? total + 50 : 9999}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={mode === 'pages' ? `例如: ${currentBefore + 10}` : '输入数值'}
                className="w-full text-center text-2xl font-black text-slate-800 py-3 px-4 rounded-2xl border-2 border-amber-300 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-amber-200/50 bg-amber-50/20 transition-all"
                autoFocus
                required
              />
              <span className="absolute right-4 text-xs font-bold text-slate-400 pointer-events-none">
                {mode === 'chapters' ? '章' : mode === 'duration' ? '分钟' : mode === 'count' ? '本' : '页'}
              </span>
            </div>

            {/* 时长模式快捷选择按钮 */}
            {mode === 'duration' && (
              <div className="flex gap-2 pt-1">
                {[15, 20, 30, 45].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setInputVal(mins)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      parseInt(inputVal, 10) === mins
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    {mins}分
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 选填：今日金句与心得 */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>✍️ 摘录金句 / 今日小心得</span>
              <span className="text-[10px] text-slate-400 font-normal">(选填，将珍藏至天工书阁)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="书里哪句话最打动你？写下来吧..."
              className="w-full text-xs text-slate-800 py-2.5 px-3.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:outline-none bg-slate-50/50 placeholder:text-slate-400"
              maxLength={80}
            />
          </div>

          {/* 100% 通关高光提示 */}
          {isFinished && (
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 p-3 rounded-2xl shadow-md border border-amber-300 flex items-center gap-2.5 animate-bounce">
              <Trophy className="w-6 h-6 text-white shrink-0 drop-shadow-xs" />
              <div className="text-xs">
                <span className="font-black block text-sm">🎉 达成 100% 满贯读完！</span>
                <span>本次打卡将额外派发全书通关大奖 <b>+{cfg.grandReward || 30} 金元宝</b>！</span>
              </div>
            </div>
          )}

          {/* 底部按钮栏 */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>完成今日阅读打卡 (+{task.reward || 3} 金元宝)</span>
            </button>

            <div className="flex items-center justify-between pt-1">
              {onShelveBook && !isFinished && (
                <button
                  type="button"
                  onClick={() => {
                    const title = cfg.bookTitle || task.name;
                    const progressToSave = newProgress > 0 ? newProgress : currentBefore;
                    if (window.confirm(`确定要为《${title}》插上书签暂存吗？\n当前进度（已读 ${progressToSave} 页）将被安全保存，不发通关奖，您可以换一本新书开始读。`)) {
                      onClose();
                      onShelveBook(task.id, progressToSave);
                    }
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-amber-700 flex items-center gap-1 py-1 cursor-pointer transition-colors"
                  title="暂存当前书目进度，腾出任务槽位换一本新书"
                >
                  <span>🔖 插上书签暂存换书</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenPavilion) onOpenPavilion();
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 py-1 ml-auto cursor-pointer"
              >
                <span>📚 翻看「天工书阁」藏书楼与完整书架 ➔</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingCheckinModal;
