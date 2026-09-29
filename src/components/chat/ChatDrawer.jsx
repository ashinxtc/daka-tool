import React from 'react';
import { XIcon } from '../icons.jsx';

// 企业微信家长消息面板
// 企业微信家长消息面板 - 升级为亲情传讯司·飞鸽家书
export const FamilyMessagePanel = ({ show, onClose, messages, activeChild, onSendReply, aiReply, isLoadingAi }) => {
    const [input, setInput] = React.useState('');
    if (!show) return null;
    const unread = messages.filter(m => !m.read && m.direction === 'parent_to_child');
    return (
        <div className="fixed inset-0 bg-black/75 z-[85] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden border-2 border-emerald-400/40 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                {/* 顶栏 */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white flex justify-between items-center shadow-md relative border-b border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner">
                            💌
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-lg tracking-wide">亲情传讯司 · 飞鸽家书</h3>
                                {unread.length > 0 && (
                                    <span className="bg-red-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full border border-white/40 shadow-xs animate-pulse">
                                        {unread.length} 封未读
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-xs font-medium mt-0.5">
                                家校互通 · 亲情叮咛与即时回传
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                        title="关闭"
                    >
                        <XIcon className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* 消息滚动区 */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 text-sm py-12">
                            <span className="text-4xl block mb-2">📭</span>
                            暂无飞鸽家书，稍后常来看看~
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div
                            key={msg.id || i}
                            className={`p-3.5 rounded-2xl border-2 transition-all ${
                                msg.direction === 'parent_to_child'
                                    ? 'bg-emerald-50/80 border-emerald-200/80 mr-6 shadow-sm'
                                    : 'bg-indigo-50/80 border-indigo-200/80 ml-6 shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1.5">
                                <span className={`text-xs font-black ${
                                    msg.direction === 'parent_to_child' ? 'text-emerald-800' : 'text-indigo-800'
                                }`}>
                                    {msg.direction === 'parent_to_child' ? '👨‍👩‍👧 家长寄语' : `🧒 ${activeChild} 的回音`}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(msg.timestamp).toLocaleString('zh-CN')}
                                </span>
                            </div>
                            <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                {msg.content}
                            </p>
                        </div>
                    ))}
                    {aiReply && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-200/80 shadow-sm">
                            <div className="text-xs font-black text-amber-800 mb-1 flex items-center gap-1.5">
                                <span>⭐</span> 小星导师导学寄语
                            </div>
                            <p className="text-sm text-amber-900 font-medium leading-relaxed">{aiReply}</p>
                        </div>
                    )}
                    {isLoadingAi && (
                        <div className="text-center text-xs text-slate-400 font-medium py-2 flex items-center justify-center gap-1.5">
                            <span className="animate-spin">⏳</span> 小星导师正在研思回复……
                        </div>
                    )}
                </div>

                {/* 回复发送区 */}
                <div className="p-3.5 border-t border-slate-200 bg-white flex gap-2.5">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && input.trim()) {
                                onSendReply(input.trim());
                                setInput('');
                            }
                        }}
                        placeholder="向家长回复心声与学情体会……"
                        className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-2xl text-sm font-medium outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 transition-all placeholder:text-slate-400"
                    />
                    <button
                        onClick={() => {
                            if (input.trim()) {
                                onSendReply(input.trim());
                                setInput('');
                            }
                        }}
                        disabled={!input.trim()}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-sm font-black shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <span>🕊️</span>
                        <span>传书回信</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// AI 学习助手聊天抽屉
export const ChatDrawer = ({ show, onClose, theme, activeChild, aiChatHistory, setAiChatHistory, callDeepSeekAPI, buildAssistantSystemPrompt, aiEnabled, deepseekApiKey, aiChatEnabled }) => {
            const [input, setInput] = React.useState('');
            const [isLoading, setIsLoading] = React.useState(false);
            const [isRecording, setIsRecording] = React.useState(false);
            const [speechSupported, setSpeechSupported] = React.useState(false);
            const messagesEndRef = React.useRef(null);
            const inputRef = React.useRef(null);
            const recognitionRef = React.useRef(null);

            // 检测浏览器语音识别支持
            React.useEffect(() => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    setSpeechSupported(true);
                    const recognition = new SpeechRecognition();
                    recognition.lang = 'zh-CN';
                    recognition.continuous = false;
                    recognition.interimResults = true;
                    recognition.maxAlternatives = 1;
                    recognition.onresult = (event) => {
                        const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
                        setInput(transcript);
                        if (event.results[event.results.length - 1].isFinal) {
                            setIsRecording(false);
                            sendMessageRef.current(transcript);
                        }
                    };
                    recognition.onerror = () => setIsRecording(false);
                    recognition.onend = () => setIsRecording(false);
                    recognitionRef.current = recognition;
                }
            }, []);

            const toggleRecording = () => {
                if (!recognitionRef.current) return;
                if (isRecording) {
                    recognitionRef.current.stop();
                    setIsRecording(false);
                } else {
                    setInput('');
                    recognitionRef.current.start();
                    setIsRecording(true);
                }
            };

            const history = aiChatHistory[activeChild] || [];

            const scrollToBottom = () => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            };

            React.useEffect(() => { scrollToBottom(); }, [history.length, show]);

            const sendMessageRef = React.useRef(null);

            const sendMessage = async (text) => {
                if (!text.trim() || isLoading) return;
                const userMsg = { id: `msg_${Date.now()}`, role: 'user', text: text.trim(), timestamp: Date.now(), childName: activeChild };

                let latestHistory;
                setAiChatHistory(prev => {
                    const updated = [...(prev[activeChild] || []).slice(-49), userMsg];
                    latestHistory = updated;
                    return { ...prev, [activeChild]: updated };
                });
                setInput('');
                setIsLoading(true);

                try {
                    const systemPrompt = buildAssistantSystemPrompt(activeChild);
                    const reply = await callDeepSeekAPI(systemPrompt, text, latestHistory || history);

                    const aiMsg = {
                        id: `msg_${Date.now() + 1}`,
                        role: 'assistant',
                        text: reply || '抱歉，我现在有点忙，等会儿再聊吧~ 😊',
                        timestamp: Date.now(),
                        childName: activeChild
                    };

                    setAiChatHistory(prev => ({
                        ...prev,
                        [activeChild]: [...(prev[activeChild] || []).slice(-49), aiMsg]
                    }));
                } finally {
                    setIsLoading(false);
                    if (typeof window !== 'undefined' && typeof window.triggerSyncUpload === 'function') window.triggerSyncUpload();
                }
            };

            // 保持 ref 指向最新 sendMessage（修复语音识别闭包问题）
            sendMessageRef.current = sendMessage;

            const quickQuestions = [
                { icon: '📊', text: '帮我看看最近的学习情况吧' },
                { icon: '💡', text: '今天应该先做什么？' },
                { icon: '🏆', text: '我最近有什么进步吗？' },
                { icon: '📖', text: '周末怎么安排学习比较好？' },
                { icon: '⭐', text: '我想多赚点星星！' }
            ];

            if (!show) return null;

            return (
                <div className="fixed inset-0 z-[120] flex justify-end" onClick={onClose}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slide-in-right border-l-2 border-indigo-400/40"
                         onClick={e => e.stopPropagation()}>
                        {/* 头部 */}
                        <div className={`p-4 sm:p-5 bg-gradient-to-r ${theme.gradient || 'from-indigo-600 via-purple-600 to-indigo-800'} text-white flex items-center gap-3 shrink-0 shadow-md border-b border-white/20`}>
                            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl border border-white/30 shadow-inner">🎓</div>
                            <div className="flex-1">
                                <div className="font-black text-lg tracking-wide flex items-center gap-2">
                                    <span>智慧天枢 · 小星导师</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 border border-white/30 font-bold">伴读</span>
                                </div>
                                <div className="text-xs text-white/80 mt-0.5 font-medium">{aiEnabled && deepseekApiKey ? '✨ AI 智能伴读学伴' : '静态指引助手'}</div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm" title="关闭">
                                <XIcon className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* 消息列表 */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {history.length === 0 && (
                                <div className="text-center text-gray-400 py-8">
                                    <div className="text-4xl mb-3">👋</div>
                                    <div className="font-bold mb-1">你好呀！我是小星老师</div>
                                    <div className="text-xs">点击下方快捷按钮开始聊天吧~</div>
                                </div>
                            )}
                            {history.map(msg => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? `bg-gradient-to-r ${theme.gradient} text-white rounded-br-md`
                                            : 'bg-white text-gray-700 border border-gray-200 rounded-bl-md shadow-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-2 text-sm">
                                        <span className="animate-pulse">思考中...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 快捷问题 */}
                        {history.length === 0 && (
                            <div className="px-3 py-2 border-t bg-white shrink-0">
                                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                    {quickQuestions.map((q, i) => (
                                        <button key={i} onClick={() => sendMessage(q.text)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 whitespace-nowrap transition-colors shrink-0">
                                            <span>{q.icon}</span><span>{q.text.replace(/^[^ ]+ /, '')}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 输入框 */}
                        <div className="p-3 border-t bg-white shrink-0">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                                    placeholder={aiChatEnabled ? "和小星老师聊天..." : "助手功能已关闭"}
                                    disabled={!aiChatEnabled || isLoading}
                                    className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-cyan-400 disabled:opacity-50"
                                />
                                {/* 语音输入按钮 */}
                                {speechSupported && (
                                    <button onClick={toggleRecording} disabled={!aiChatEnabled || isLoading}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                            isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-300' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                        }`}>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                                    </button>
                                )}
                                <button onClick={() => sendMessage(input)} disabled={!input.trim() || !aiChatEnabled || isLoading}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
                                        input.trim() && aiChatEnabled && !isLoading ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-300 cursor-not-allowed'
                                    }`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

export default ChatDrawer;
