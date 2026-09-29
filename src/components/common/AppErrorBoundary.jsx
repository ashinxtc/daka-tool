import React from 'react';

// 全局错误监听：捕获 React 之外的异常（事件回调、Promise、加载失败），记日志 + 轻提示，不打断使用
if (typeof window !== 'undefined') {
    const logGlobalError = (message, stack) => {
        try {
            const logs = JSON.parse(localStorage.getItem('_error_log') || '[]');
            logs.unshift({ time: new Date().toISOString(), message: String(message).slice(0, 300), stack: String(stack || '').slice(0, 800), source: 'global' });
            localStorage.setItem('_error_log', JSON.stringify(logs.slice(0, 5)));
        } catch (e) {}
    };
    window.addEventListener('error', (event) => {
        // 资源加载失败（脚本/图片）没有 error 对象，只记日志
        logGlobalError(event.message || (event.target && (event.target.src || event.target.href)) || 'unknown error', event.error?.stack);
    }, true);
    window.addEventListener('unhandledrejection', (event) => {
        logGlobalError('Unhandled Promise rejection: ' + String(event.reason?.message || event.reason), event.reason?.stack);
    });
}

// ===== 顶层错误边界：任何组件抛错时显示恢复页而非白屏 =====
// 注意：打卡数据都在 localStorage，刷新页面即可恢复，不会丢数据
export class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, info) {
        try {
            console.error('AppErrorBoundary caught:', error, info?.componentStack);
            // 保留最近 5 条错误日志到 localStorage，便于家长反馈问题
            const logs = JSON.parse(localStorage.getItem('_error_log') || '[]');
            logs.unshift({
                time: new Date().toISOString(),
                message: String(error?.message || error).slice(0, 300),
                stack: String(error?.stack || '').slice(0, 800),
                component: String(info?.componentStack || '').slice(0, 500),
            });
            localStorage.setItem('_error_log', JSON.stringify(logs.slice(0, 5)));
        } catch (e) {}
    }
    render() {
        if (this.state.error) {
            return (
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#fef3c7', fontFamily: 'sans-serif' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>😵</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#92400e', marginBottom: 8 }}>哎呀，页面出了点小问题</div>
                    <div style={{ fontSize: 13, color: '#a16207', marginBottom: 24, textAlign: 'center' }}>别担心，你的打卡数据都安全地保存着。<br />点击下面的按钮重新加载就好啦！</div>
                    <button onClick={() => window.location.reload()}
                        style={{ padding: '12px 32px', borderRadius: 14, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                        🔄 重新加载
                    </button>
                    <details style={{ marginTop: 24, maxWidth: 480, width: '100%' }}>
                        <summary style={{ fontSize: 11, color: '#a16207', cursor: 'pointer' }}>错误详情（供家长反馈用）</summary>
                        <pre style={{ fontSize: 10, color: '#78716c', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#fffbeb', padding: 8, borderRadius: 8, marginTop: 4 }}>{String(this.state.error?.message || this.state.error)}{'\n'}{String(this.state.error?.stack || '').slice(0, 600)}</pre>
                    </details>
                </div>
            );
        }
        return this.props.children;
    }
}
