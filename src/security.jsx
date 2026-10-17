import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import QRCode from 'qrcode';
import {deviceAccess,newDeviceToken} from './utils/deviceAccess';
import './security.css';

const incoming=new URLSearchParams(location.hash.slice(1));
const initialInvite=incoming.get('invite')||'',initialRole=incoming.get('role')||'main';
// Never keep an invitation in history, request URLs, or outgoing referrers.
if(location.hash)history.replaceState(null,'',location.pathname+location.search);
function SecurityApp(){
    const [code,setCode]=useState(new URLSearchParams(location.search).get('code')||'');
    const [role,setRole]=useState(['main','parent'].includes(initialRole)?initialRole:'main');
    const [invite,setInvite]=useState(initialInvite),[owner,setOwner]=useState(''),[candidate,setCandidate]=useState('');
    const [voucher,setVoucher]=useState(''),[saved,setSaved]=useState(false),[label,setLabel]=useState('爸爸');
    const [devices,setDevices]=useState([]),[link,setLink]=useState(''),[qr,setQr]=useState('');
    const [limits,setLimits]=useState(null);
    const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[paired,setPaired]=useState(null);
    const managementEpoch=useRef(0);
    const request=async(...args)=>{const epoch=managementEpoch.current;const result=await deviceAccess.request(...args);if(epoch!==managementEpoch.current)throw new Error('管理页面已锁定，请重新解锁。');return result;};
    const validCode=()=>{if(!/^[\w一-鿿-]{4,32}$/.test(code))throw new Error('家庭同步码需为 4–32 位字母、数字、中文、连字符或下划线。');};
    const run=async fn=>{if(busy)return;setBusy(true);setMessage('');try{validCode();await fn();}catch(error){setMessage(error.message);}finally{setBusy(false);}};
    const lock=()=>{managementEpoch.current++;setOwner('');setCandidate('');setVoucher('');setSaved(false);setDevices([]);setLink('');setLimits(null);};
    useEffect(()=>{const restore=e=>{if(e.persisted)lock();};window.addEventListener('pagehide',lock);window.addEventListener('pageshow',restore);return()=>{window.removeEventListener('pagehide',lock);window.removeEventListener('pageshow',restore);};},[]);
    useEffect(()=>{let active=true;setQr('');if(link)QRCode.toDataURL(link,{width:240,margin:1}).then(value=>{if(active)setQr(value);}).catch(()=>{});return()=>{active=false;};},[link]);
    const list=async token=>{const data=await request(code,'/auth/devices',{token});setDevices(data.devices);};
    const join=()=>run(async()=>{
        const pending=deviceAccess.pending(code,role),token=invite||pending?.invite;
        const result=await deviceAccess.pair(code,role,token||'');
        setInvite('');setPaired(result);setMessage('配对成功。凭据仅保存在这个浏览器，不会同步或导出。');
    });
    const enter=()=>{
        try{
        if(paired.role==='parent'){
            localStorage.setItem('parent_sync_code',code);localStorage.setItem('parent_device_id',paired.id);
            localStorage.setItem('parent_role',paired.label);localStorage.setItem('parent_is_bound','true');
            localStorage.removeItem('parent_pair_token');location.assign('/parent.html');
        }else{
            const raw=localStorage.getItem('app_sync_code');let previous=raw;try{previous=JSON.parse(raw);}catch{}
            if(previous&&previous!==code)throw new Error('主程序已有其他家庭的数据。请先导出备份，并在主程序中确认家庭切换；配对凭据已保存，没有覆盖本机数据。');
            location.assign(`/?code=${encodeURIComponent(code)}`);
        }
        }catch(error){setMessage(error.message);}
    };
    return <main className="security-page"><h1>家庭设备配对</h1>
        <p>主程序与家长手机分别授权。Safari、微信及桌面独立 App 的存储可能相互独立，请在实际使用的环境打开邀请。</p>
        <p className="caution">家庭已启用设备授权。请通过家庭管理员签发的限时邀请连接设备；管理员密钥请单独安全保存。</p>
        <label>家庭同步码<input value={code} disabled={busy||!!owner||!!paired} onChange={e=>{setCode(e.target.value.trim());setDevices([]);setLink('');}} autoComplete="off"/></label>
        <section><h2>连接这台设备</h2>
            <label>设备用途<select value={role} disabled={busy||!!paired} onChange={e=>setRole(e.target.value)}><option value="main">主程序（孩子的平板/家庭电脑）</option><option value="parent">家长手机</option></select></label>
            <label>限时邀请<input type="password" value={invite} onChange={e=>setInvite(e.target.value.trim())} autoComplete="off" placeholder="打开邀请链接时自动填入"/></label>
            <button disabled={busy||!!paired} onClick={join}>配对 / 重试待确认配对</button>
            <button disabled={busy} onClick={()=>{if(confirm('只放弃本机待确认配对，不会撤销服务端已签发的设备。确定继续？')){deviceAccess.discardPending(code,role);setInvite('');setMessage('已放弃本机待确认配对。已签发的设备请由管理员撤销。');}}}>放弃待确认配对</button>
            {paired&&<button onClick={enter}>进入{paired.role==='parent'?'家长看板':'主程序'}</button>}
        </section>
        <section><h2>家庭管理员</h2><p>管理密钥不会保存在浏览器或业务备份中。请在自己的手机上管理，离开前锁定页面。</p>
            {!owner?<><label>管理密钥<input type="password" value={candidate} onChange={e=>{setCandidate(e.target.value.trim());setSaved(false);}} autoComplete="off"/></label>
                <button disabled={busy} onClick={()=>run(async()=>{const checked=await request(code,'/auth/check',{token:candidate});if(checked.role!=='owner')throw new Error('此凭据不是家庭管理员。');await list(candidate);setOwner(candidate);setCandidate('');})}>解锁管理</button>
                <details><summary>首次激活 / 管理员恢复</summary>
                    <p>需要运营管理员签发的限时激活凭证；旧设置密码不能代替。恢复凭证会撤销全部旧设备，业务数据不删除。</p>
                    <label>激活或恢复凭证<textarea value={voucher} onChange={e=>setVoucher(e.target.value.trim())} autoComplete="off"/></label>
                    <button disabled={busy} onClick={()=>{setCandidate(newDeviceToken());setSaved(false);}}>生成新的管理密钥</button>
                    {candidate&&<label>请先复制并安全保存<textarea aria-label="待保存管理密钥" readOnly value={candidate}/></label>}
                    <label><input type="checkbox" checked={saved} onChange={e=>setSaved(e.target.checked)}/>我已将管理密钥保存到安全位置</label>
                    <button disabled={busy||!saved||!candidate||!voucher} onClick={()=>run(async()=>{const result=await request(code,'/auth/claim',{body:{token:candidate,voucher}});if(result.ok!==true)throw new Error('尚未确认激活。');setOwner(candidate);setCandidate('');setVoucher('');await list(candidate);setMessage('已激活管理身份，请分别邀请主设备和家长设备。');})}>确认激活或恢复</button>
                </details></>:<><button onClick={lock}>锁定管理页面</button>
                <label>设备称谓<input value={label} maxLength={24} onChange={e=>setLabel(e.target.value)}/></label>
                <p>上方“设备用途”决定邀请主程序还是家长手机。</p>
                <button disabled={busy} onClick={()=>run(async()=>{const grant=await request(code,'/auth/invite',{token:owner,body:{role,label}});setLink(`${location.origin}/security.html?code=${encodeURIComponent(code)}#invite=${grant.invite}&role=${grant.role}`);setMessage('邀请十分钟内有效，只能连接一台设备。不要公开转发。');})}>生成限时邀请</button>
                {link&&<div>{qr&&<img alt="限时设备配对二维码" src={qr}/>}<label>邀请链接<textarea readOnly value={link}/></label></div>}
                <details><summary>兑换汇率与限额</summary>
                    <p>保留浮动汇率玩法：服务器根据行情、基准汇率和放大系数报价。每笔订单锁定申请时的金额，设置变更不改变已提交订单。</p>
                    <button disabled={busy} onClick={()=>run(async()=>{const data=await request(code,'/exchange/limits',{token:owner});setLimits({...data.limits,pricingMode:'floating',baseCentsPerGold:data.limits.baseCentsPerGold||1,baseUsd:data.limits.baseUsd||'',amplifier:data.limits.amplifier||10});})}>读取兑换设置</button>
                    {limits&&<>{[['minGold','最低兑换元宝'],['maxSingle','单笔上限（0 不限）'],['maxWeekly','每周上限（0 不限）'],['baseCentsPerGold','每元宝基础分值（分）'],['baseUsd','基准 USD 汇率'],['amplifier','波动放大系数']].map(([key,title])=><label key={key}>{title}<input type="number" min="0" step={['baseUsd','baseCentsPerGold','amplifier'].includes(key)?'any':'1'} value={limits[key]} onChange={e=>setLimits({...limits,[key]:Number(e.target.value)})}/></label>)}
                    <button disabled={busy} onClick={()=>run(async()=>{const data=await request(code,'/exchange/limits',{token:owner,body:{limits}});setLimits(data.limits);setMessage('兑换设置已由服务端确认。');})}>保存兑换设置</button></>}
                </details>
                <button disabled={busy} onClick={()=>run(()=>list(owner))}>刷新设备列表</button>
                <ul>{devices.map(d=><li key={d.id}>{d.label} · {d.role} · {d.revokedAt?'已撤销':d.expiresAt&&d.expiresAt<=Date.now()?'已到期':'有效'}
                    {d.role!=='owner'&&!d.revokedAt&&<button disabled={busy} onClick={()=>{if(confirm(`撤销 ${d.label} 的设备授权？`))run(async()=>{await request(code,'/auth/revoke',{token:owner,body:{id:d.id}});await list(owner);setMessage('设备已撤销，不能再同步。');});}}>撤销设备</button>}</li>)}</ul>
            </>}
        </section><p role="status">{busy?'正在确认，请勿重复操作…':message}</p><a href="/">返回主程序</a></main>;
}
createRoot(document.getElementById('root')).render(<SecurityApp/>);
