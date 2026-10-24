import {SYNC_WORKER_URL} from '../constants/api.js';
import {getDeviceFingerprint} from './deviceFingerprint.js';
export const ACCESS_ENDPOINT=SYNC_WORKER_URL;
const tokenPattern=/^[a-f0-9]{64}$/;
const roles=new Set(['main','parent']);
export class DeviceAccessError extends Error {
    constructor(message,code='AUTH_REQUIRED',status=401){super(message);Object.assign(this,{code,status});}
}
const browserStore=()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
export const newDeviceToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');

export function createDeviceAccess({storage=browserStore(),fetchImpl=(...args)=>fetch(...args),endpoint=ACCESS_ENDPOINT}={}){
    const deviceIdKey=(code,role)=>`daka_device_id_v2:${role}:${code}`;
    const accessKey=(code,role)=>`daka_device_access_v1:${role}:${code}`;
    const pendingKey=(code,role)=>`daka_pair_pending_v1:${role}:${code}`;
    const parse=raw=>{try{return JSON.parse(raw||'null');}catch{return null;}};

    const credential=(code,role='main')=>{
        const access=parse(storage?.getItem(accessKey(code,role)));
        if(access&&access.token&&access.id){
            return {
                id:access.id,
                role:access.role||role,
                token:access.token,
                label:access.label||(role==='parent'?'家长手机':'主程序')
            };
        }

        let id=storage?.getItem(deviceIdKey(code,role));
        if(!id){
            if(role==='parent'){
                id=storage?.getItem('parent_device_id')||`dev_${role}_${newDeviceToken().slice(0,16)}`;
            }else{
                id=`dev_${role}_${newDeviceToken().slice(0,16)}`;
            }
            try{storage?.setItem(deviceIdKey(code,role),id);}catch{}
        }
        return {id,role,token:id,label:role==='parent'?'家长手机':'主程序'};
    };
    const required=()=>false;
    const markRequired=()=>{};
    const request=async(code,path,{token,body}={})=>{
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
        try{
            const response=await fetchImpl(`${endpoint}${path}?code=${encodeURIComponent(code)}`,{
                method:body===undefined?'GET':'POST',
                cache:'no-store',
                redirect:'error',
                signal:controller.signal,
                headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
                ...(body===undefined?{}:{body:JSON.stringify(body)})
            });
            let data;try{data=await response.json();}catch{throw new DeviceAccessError('服务响应无效，请稍后重试。','INVALID_RESPONSE',502);}
            if(!response.ok)throw new DeviceAccessError(data.error||'操作失败，请重试。',data.code||'REQUEST_FAILED',response.status);
            return data;
        }finally{clearTimeout(timer);}
    };
    const syncFetch=async(url,options={},role='main')=>{
        const target=new URL(url,endpoint),origin=new URL(endpoint).origin;
        if(target.origin!==origin)throw new DeviceAccessError('拒绝向其他服务发送家庭凭据。','WRONG_ORIGIN',400);
        const code=target.searchParams.get('code')||'',saved=credential(code,role);
        const headers=new Headers(options.headers);
        const isBrowser = typeof window !== 'undefined';
        const hasPairedToken = Boolean(saved.token && saved.token !== saved.id);
        const method = (options.method || 'GET').toUpperCase();
        const isSafeMethod = method === 'GET' || method === 'HEAD';

        let injectedAuth = false;
        if (!isBrowser || hasPairedToken) {
            headers.set('X-Device-Id',saved.id);
            headers.set('X-Device-Role',role);
            headers.set('Authorization',`Bearer ${saved.token||saved.id}`);
            injectedAuth = true;
            try {
                const fp = getDeviceFingerprint();
                if (fp) headers.set('X-Device-Fingerprint', fp);
            } catch(e) {}
        }
        try {
            return await fetchImpl(url,{...options,headers,redirect:isBrowser?'follow':'error'});
        } catch(err) {
            if (isBrowser && isSafeMethod && injectedAuth &&
                (!options.headers || !new Headers(options.headers).has('Authorization')) &&
                err instanceof TypeError) {
                const plainHeaders = new Headers(options.headers);
                return await fetchImpl(url,{...options,headers:plainHeaders,redirect:'follow'});
            }
            throw err;
        }
    };
    const pair=async(code,role,invite)=>{
        if(!invite){
            return credential(code,role);
        }
        if(!roles.has(role)||!tokenPattern.test(invite))throw new DeviceAccessError('邀请链接无效。','INVALID_INVITE',400);
        if(!storage)throw new DeviceAccessError('请允许浏览器存储后再配对。','STORAGE_REQUIRED');
        const pKey=pendingKey(code,role);
        let pending=parse(storage.getItem(pKey));
        if(pending&&pending.invite!==invite)throw new DeviceAccessError('已有待确认配对，请先重试或明确放弃。','PAIR_PENDING',409);
        if(!pending){
            pending={invite,token:newDeviceToken()};
            storage.setItem(pKey,JSON.stringify(pending));
        }
        const result=await request(code,'/auth/redeem',{body:pending});
        if(result.ok!==true||result.role!==role||typeof result.id!=='string')throw new DeviceAccessError('邀请角色与页面不一致，未保存设备身份。','INVALID_RECEIPT',502);
        const saved={token:pending.token,id:result.id,role:result.role,label:result.label};
        storage.setItem(accessKey(code,role),JSON.stringify(saved));
        storage.setItem(deviceIdKey(code,role),result.id);
        if(role==='parent'){
            try{
                storage.setItem('parent_device_id',result.id);
                storage.setItem('parent_role',result.label);
                storage.setItem('parent_is_bound','true');
            }catch(e){}
        }
        storage.removeItem(pKey);
        return saved;
    };
    const revokeSelf=async(code,role)=>{
        const saved=parse(storage?.getItem(accessKey(code,role)));
        if(saved?.token&&saved?.id){
            try{
                await request(code,'/auth/revoke',{token:saved.token,body:{id:saved.id}});
            }catch(e){}
            storage?.removeItem(accessKey(code,role));
        }
        storage?.removeItem(deviceIdKey(code,role));
        if(role==='parent'){
            try{
                storage?.removeItem('parent_device_id');
                storage?.removeItem('parent_role');
                storage?.removeItem('parent_is_bound');
            }catch(e){}
        }
        return {ok:true};
    };
    return {
        credential,
        required,
        request,
        syncFetch,
        pair,
        revokeSelf,
        rememberRequired:markRequired,
        pending:(code,role)=>parse(storage?.getItem(pendingKey(code,role))),
        discardPending:(code,role)=>storage?.removeItem(pendingKey(code,role))
    };
}
export const deviceAccess=createDeviceAccess();
export const syncFetch=(url,options)=>deviceAccess.syncFetch(url,options,'main');
export const parentFetch=(url,options)=>deviceAccess.syncFetch(url,options,'parent');
export const securityUrl=code=>`/?code=${encodeURIComponent(code||'')}`;
