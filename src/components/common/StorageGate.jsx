import React, { useEffect, useState } from 'react';
import { getStorageState, initStorage, persistBeforeSuspend } from '../../utils/storage.js';

export default function StorageGate({ children }) {
    const [state, setState] = useState(getStorageState);
    const [slow, setSlow] = useState(false);
    useEffect(() => {
        const change = () => setState(getStorageState());
        window.addEventListener('_storageStateChanged', change);
        initStorage();
        const timer = setTimeout(() => setSlow(true), 8000);
        return () => { clearTimeout(timer); window.removeEventListener('_storageStateChanged', change); };
    }, []);
    if (state.phase === 'loading' || state.phase === 'error') return (
        <div role="status" className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
            <div className="max-w-sm text-center space-y-4">
                <h1 className="text-xl font-bold">{state.phase === 'error' ? '本地数据暂时无法读取' : '正在读取你的打卡数据'}</h1>
                <p>{state.error || (slow ? '读取时间较长，请稍候。你也可以重新尝试。' : '请稍候，完成后将自动进入。')}</p>
                {(slow || state.phase === 'error') && <button className="rounded-xl bg-blue-600 px-5 py-3" onClick={() => window.location.reload()}>重新尝试</button>}
            </div>
        </div>
    );
    return <>
        {children}
        {state.phase === 'restoring' && <div role="status" className="fixed inset-0 z-[99999] bg-slate-950/90 text-white flex items-center justify-center p-6">正在恢复备份，请稍候…</div>}
        {state.saveError && <div role="alert" className="fixed bottom-4 left-4 right-4 z-[99999] rounded-xl bg-amber-100 text-amber-950 p-4 shadow-lg">
            {state.saveError}<button className="ml-3 underline font-bold" onClick={() => persistBeforeSuspend()}>重试保存</button>
        </div>}
    </>;
}
