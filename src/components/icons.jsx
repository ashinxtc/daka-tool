import React from 'react';

export const IconBase = ({ children, className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
);
export const SettingsIcon = (props) => <IconBase {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></IconBase>;
export const CheckCircle2 = (props) => <IconBase {...props}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></IconBase>;
export const Trophy = (props) => <IconBase {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M2 17h20"/><path d="M6 17v-3a6 3 0 0 1 12 0v3"/></IconBase>;
export const CalendarIcon = (props) => <IconBase {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></IconBase>;
export const Coins = (props) => <IconBase {...props}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m7.1 10.27 1.11 1.11"/></IconBase>;
export const XIcon = (props) => <IconBase {...props}><path d="M18 6 6 18"/><path d="m6 6 18 18"/></IconBase>;
export const Clock = (props) => <IconBase {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconBase>;
export const Trash2 = (props) => <IconBase {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconBase>;
export const Save = (props) => <IconBase {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></IconBase>;
export const Plus = (props) => <IconBase {...props}><path d="M5 12h14"/><path d="M12 5v14"/></IconBase>;
export const Target = (props) => <IconBase {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></IconBase>;
export const Flag = (props) => <IconBase {...props}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></IconBase>;
export const Gift = (props) => <IconBase {...props}><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" x2="12" y1="22" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></IconBase>;
export const Play = (props) => <IconBase {...props}><polygon points="5 3 19 12 5 21 5 3" /></IconBase>;
export const Puzzle = (props) => <IconBase {...props}><path d="M19.439 15.424c-.58.586-1.545.586-2.126 0l-4.524-4.525c-.58-.586-.58-1.545 0-2.126.586-.58 1.546-.58 2.127 0l4.523 4.525c.581.58.581 1.54 0 2.126z" /><path d="M4.561 8.576c.58-.586 1.545-.586 2.126 0l4.524 4.525c.58.586.58 1.545 0 2.126-.586.58-1.546.58-2.127 0L4.561 10.702c-.581-.58-.581-1.54 0-2.126z" /><circle cx="12" cy="12" r="3" /></IconBase>;
export const ArrowUp = (props) => <IconBase {...props}><line x1="12" x2="12" y1="19" y2="5"/><polyline points="5 12 12 5 19 12"/></IconBase>;
export const Users = (props) => <IconBase {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></IconBase>;
export const Upload = (props) => <IconBase {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></IconBase>;
export const SortDesc = (props) => <IconBase {...props}><path d="M11 5h10"/><path d="M11 9h7"/><path d="M11 13h4"/><path d="M3 17l3 3 3-3"/><path d="M6 18V4"/></IconBase>;
export const Locate = (props) => <IconBase {...props}><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></IconBase>;
export const Medal = (props) => <IconBase {...props}><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/></IconBase>;
export const Lock = (props) => <IconBase {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>;
export const Palette = (props) => <IconBase {...props}><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></IconBase>;
export const Skull = (props) => <IconBase {...props}><path d="M14 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2M10 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"/><path d="M12 2a10 10 0 0 1 10 10c0 1.5-.24 2.9-.62 4.24l-1.92 6.56a2 2 0 0 1-1.92 1.44H8.46a2 2 0 0 1-1.92-1.44l-1.92-6.56A10 10 0 0 1 2 12A10 10 0 0 1 12 2Z"/></IconBase>;
export const FileText = (props) => <IconBase {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></IconBase>;
export const Beaker = (props) => <IconBase {...props}><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></IconBase>;
export const TrendingUp = (props) => <IconBase {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></IconBase>;
export const Sparkles = (props) => <IconBase {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M19 19v4"/><path d="M23 21h-4"/></IconBase>;
export const BookOpen = (props) => <IconBase {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></IconBase>;
export const Calendar = (props) => <IconBase {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></IconBase>;
export const Clipboard = (props) => <IconBase {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></IconBase>;
export const ShoppingBag = (props) => <IconBase {...props}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></IconBase>;
export const Zap = (props) => <IconBase {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></IconBase>;
export const MessageCircle = (props) => <IconBase {...props}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></IconBase>;
export const Shield = (props) => <IconBase {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconBase>;
export const Key = (props) => <IconBase {...props}><path d="m21 2-2 2m-7.6 7.6a6.5 6.5 0 1 1-9.19-9.19 6.5 6.5 0 0 1 9.19 9.19Z"/><path d="m21 2-2 2 2 2-2 2-2 2 2 2-2 2"/></IconBase>;
export const ChevronDown = (props) => <IconBase {...props}><polyline points="6 9 12 15 18 9"/></IconBase>;
export const ChevronUp = (props) => <IconBase {...props}><polyline points="18 15 12 9 6 15"/></IconBase>;
export const ChevronLeft = (props) => <IconBase {...props}><polyline points="15 18 9 12 15 6"/></IconBase>;
export const ChevronRight = (props) => <IconBase {...props}><polyline points="9 18 15 12 9 6"/></IconBase>;
export const Flame = (props) => <IconBase {...props}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></IconBase>;

export const RepairedFlameBadge = ({ size = 'sm', className = '' }) => {
  const isSm = size === 'sm';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-slate-950 border border-amber-400/95 animate-flame-glow pointer-events-none shrink-0 transition-transform ${
        isSm ? 'w-5 h-5' : 'w-7 h-7'
      } ${className}`}
      title="普罗米修斯之火补签"
    >
      <svg
        viewBox="0 0 24 24"
        className={`${isSm ? 'w-3.5 h-3.5' : 'w-5 h-5'} animate-flame-flicker`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
          fill="#f97316"
          stroke="#fde047"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
          fill="#fef08a"
          transform="matrix(0.48 0 0 0.48 6.24 7.28)"
        />
      </svg>
    </span>
  );
};

// --- Phase 1: 原生 Emoji 兼容导出（方案 A 回退与兜底） ---
export const BackpackIcon = ({ className = "text-xl", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="背包" {...props}>🎒</span>;
export const PayrollEnvelopeIcon = ({ className = "text-xl", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="工资条" {...props}>📩</span>;
export const MonthlyReportIcon = ({ className = "text-xl", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="月度总结" {...props}>📑</span>;
export const AITeacherIcon = ({ className = "text-xl", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="小星老师" {...props}>🎓</span>;
export const WizardIcon = ({ className = "text-xl", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="时空商人" {...props}>🧙‍♂️</span>;
export const PetPawIcon = ({ className = "text-xl", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="我的宠物" {...props}>🐾</span>;
export const FamilyMessageIcon = ({ className = "text-xl", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="家庭留言板" {...props}>💌</span>;

export const EvolutionIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="进化之路" {...props}>📈</span>;
export const TrophyIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="成就墙" {...props}>🏆</span>;
export const TargetWallIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="目标达成墙" {...props}>🎯</span>;
export const StatsBarIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="学习数据统计" {...props}>📊</span>;
export const MilestonesScrollIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="大事纪" {...props}>📜</span>;
export const ExamClipboardIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="作业与考试" {...props}>📝</span>;
export const ThemePaletteIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="切换主题" {...props}>🎨</span>;
export const GearSettingsIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="系统设置" {...props}>⚙️</span>;
export const MarketShopIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="时空集市" {...props}>🏪</span>;
export const PuzzleRuneIcon = ({ className = "text-xs", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="拼图" {...props}>🧩</span>;
export const ExchangeCoinIcon = ({ className = "text-sm", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="零花钱兑换" {...props}>💱</span>;
export const StarAssetIcon = ({ className = "text-xs", ...props }) => <span className={`select-none inline-flex items-center justify-center ${className}`} role="img" aria-label="星星" {...props}>⭐</span>;
