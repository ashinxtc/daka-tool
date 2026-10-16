import React, {useState} from 'react';
const labels={app_tasks_v2:'任务设置',app_checkins_v2:'打卡记录',app_profiles_v1:'家庭成员',app_theme:'主题',
    app_parent_actions_v1:'家长指令',app_wheel_history:'金元宝账单',app_inventory:'背包',app_authorized_parents_v1:'家长设备',
    app_settings_password:'家长设置密码',app_deepseek_api_key:'AI 设置',app_global_messages_v2:'家长寄语',app_user_city_v1:'所在城市'};
const sensitive=k=>/password|api_key|token|secret|webhook|aes_key|authorized_parents/i.test(k);
function download(context){
    const blob=new Blob([JSON.stringify({version:'sync-conflict-1',exportDate:new Date().toISOString(),
        local:{version:'2.0',_allSyncData:context.local},cloud:{version:'2.0',_allSyncData:context.remote.data}},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='daka-sync-conflict-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function SyncConflictDialog({context,onResolve}) {
    const [open,setOpen]=useState(true),[busy,setBusy]=useState(false);
    if(!context)return null;
    const choose=async side=>{setBusy(true);try{await onResolve(side);}finally{setBusy(false);}};
    if(!open)return <div className="fixed bottom-20 left-4 right-4 z-[150] rounded-xl bg-amber-100 text-amber-950 p-3 shadow-lg text-sm" role="status">
        同步待处理，本机修改已保留。<button className="ml-3 underline font-bold" onClick={()=>setOpen(true)}>查看冲突</button></div>;
    return <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="处理同步冲突">
        <div className="bg-white text-slate-900 rounded-2xl p-5 w-full max-w-xl max-h-[85vh] overflow-auto space-y-4">
            <h2 className="font-bold text-xl">两台设备修改了相同内容</h2>
            <p className="text-sm">双方数据都已保留，自动上传暂时暂停。请选择冲突部分采用哪一端的内容，其他修改会自动合并。</p>
            {context.conflicts.map((c,i)=><div key={i} className="border rounded-lg p-3 text-sm">
                <div className="font-bold">{labels[c.key]||'应用数据'}{context.conflicts.length>1?` · ${i+1}`:''}</div>
                {sensitive(`${c.key}.${c.path}`)?<p>此项包含敏感设置，内容已隐藏。</p>:<>
                    <p className="break-all">本机：{JSON.stringify(c.local)?.slice(0,240)??'已删除'}</p>
                    <p className="break-all">云端：{JSON.stringify(c.remote)?.slice(0,240)??'已删除'}</p></>}
            </div>)}
            <button onClick={()=>download(context)} className="underline text-sm">下载双方数据备份</button>
            <div className="flex flex-wrap gap-2">
                <button disabled={busy} onClick={()=>choose('local')} className="rounded-lg bg-blue-700 text-white px-4 py-2">冲突部分保留本机</button>
                <button disabled={busy} onClick={()=>choose('remote')} className="rounded-lg bg-slate-700 text-white px-4 py-2">冲突部分采用云端</button>
                <button disabled={busy} onClick={()=>setOpen(false)} className="rounded-lg border px-4 py-2">稍后处理</button>
            </div>
        </div>
    </div>;
}
