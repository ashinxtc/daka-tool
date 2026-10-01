import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, XIcon, Trophy, Plus, CheckCircle2 } from '../icons';

/**
 * ReadingTransitionModal: 伴读书阁 · 读完通关换书与待续无缝接力小窗
 * 读完 100% 或插书签暂存后，在此快速指定下一本必读书目，保障任务槽位持久无缝运转
 */
export const ReadingTransitionModal = ({
  show,
  onClose,
  data,
  onConfirmNextBook,
  theme
}) => {
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverEmoji, setCoverEmoji] = useState('📖');
  const [period, setPeriod] = useState('weekly'); // 'weekly' | 'monthly' | 'custom'
  const [mode, setMode] = useState('pages'); // 'pages' | 'chapters' | 'duration'
  const [totalPages, setTotalPages] = useState('180');
  const [grandReward, setGrandReward] = useState('30');
  const [overdueGrandReward, setOverdueGrandReward] = useState('20');

  useEffect(() => {
    if (show) {
      setBookTitle('');
      setAuthor('');
      setCoverEmoji('📖');
      setPeriod(data?.period || 'weekly');
      setMode('pages');
      setTotalPages('180');
      setGrandReward('30');
      setOverdueGrandReward('20');
    }
  }, [show, data]);

  if (!show || !data) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = bookTitle.trim();
    if (!title) return;

    onConfirmNextBook({
      taskId: data.taskId,
      bookTitle: title,
      author: author.trim(),
      coverEmoji,
      period,
      mode,
      totalPages: parseInt(totalPages, 10) || 180,
      totalChapters: parseInt(totalPages, 10) || 12,
      grandReward: parseInt(grandReward, 10) || 30,
      overdueGrandReward: parseInt(overdueGrandReward, 10) || 20
    });
    onClose();
  };

  const emojis = ['📖', '📚', '🏰', '🚀', '🦁', '🧙‍♂️', '🔬', '🌱', '⛵', '🐱'];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-amber-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl filter drop-shadow-xs">📚</span>
              <div>
                <h3 className="font-black text-lg leading-tight">
                  {data.finishedTitle ? '全本通关 · 开启下一本' : '伴读书阁 · 选定新书'}
                </h3>
                <p className="text-[11px] text-amber-100/90 mt-0.5">读完一卷 · 再展一卷 · 课外阅读无缝流转</p>
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

        {/* 主体表单 */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
          {/* 通关庆祝横幅 */}
          {data.finishedTitle && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-3 shadow-2xs animate-in slide-in-from-top-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                🏆
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-black text-amber-900 text-sm">
                  <span>恭喜读完全本《{data.finishedTitle}》！</span>
                </div>
                <p className="text-xs text-amber-700/90 mt-0.5">
                  通关大奖 <span className="font-bold text-amber-600">+{data.grandReward} 金元宝</span> 已发放，该书已正式结卷收录进【天工藏书阁】！
                </p>
              </div>
            </div>
          )}

          {data.isShelvedSwitch && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-center gap-2">
              <span>🔖</span>
              <span>已为上一本书插上书签暂存！现在为孩子选定一本新书开始研读吧：</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                下一本书名 *
              </label>
              <input 
                type="text" 
                required 
                autoFocus 
                value={bookTitle} 
                onChange={(e) => setBookTitle(e.target.value)} 
                placeholder="例如: 《西游记》 或 《小王子》" 
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  作者 (选填)
                </label>
                <input 
                  type="text" 
                  value={author} 
                  onChange={(e) => setAuthor(e.target.value)} 
                  placeholder="例如: 吴承恩" 
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  封面徽章 / Emoji
                </label>
                <div className="flex gap-1 overflow-x-auto py-0.5">
                  {emojis.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setCoverEmoji(e)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        coverEmoji === e 
                          ? 'bg-amber-400 text-white ring-2 ring-amber-500 scale-105 shadow-2xs' 
                          : 'bg-slate-100 hover:bg-amber-50 border border-slate-200'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 周期安排 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  目标周期
                </label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'weekly', label: '📅 周必读' },
                    { id: 'monthly', label: '🌙 月必读' },
                    { id: 'custom', label: '🌿 长期自选' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPeriod(p.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        period === p.id 
                          ? 'bg-white text-amber-600 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  度量方式
                </label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'pages', label: '按页码' },
                    { id: 'chapters', label: '按章节' },
                    { id: 'duration', label: '按时长' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        mode === m.id 
                          ? 'bg-white text-amber-600 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 总页数与通关大奖 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {mode === 'chapters' ? '全书总章节' : mode === 'duration' ? '目标总分钟' : '全书总页数'}
                </label>
                <input 
                  type="number" 
                  min="1" 
                  value={totalPages} 
                  onChange={(e) => setTotalPages(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-800 block mb-1">
                  按期通关大奖 💰
                </label>
                <input 
                  type="number" 
                  min="0" 
                  value={grandReward} 
                  onChange={(e) => setGrandReward(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-amber-600 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  续读通关大奖 💰
                </label>
                <input 
                  type="number" 
                  min="0" 
                  value={overdueGrandReward} 
                  onChange={(e) => setOverdueGrandReward(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 设定后当前课外阅读任务槽位将无缝载入新书，进度归零从头开始；若未在当期读完将自动顺延续读，读完整本即可斩获通关大奖！
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                稍后再选
              </button>
              <button
                type="submit"
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>开启新书伴读之旅</span>
                <span>🚀</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReadingTransitionModal;
