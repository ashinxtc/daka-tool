import {SYNC_WORKER_URL} from '../constants/api.js';
export const ACCESS_ENDPOINT=SYNC_WORKER_URL;
export class DeviceAccessError extends Error {
    constructor(message,code='AUTH_REQUIRED',status=401){super(message);Object.assign(this,{code,status});}
}
const browserStore=()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
export const newDeviceToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');

export function createDeviceAccess({storage=browserStore(),fetchImpl=(...args)=>fetch(...args),endpoint=ACCESS_ENDPOINT}={}){
    const deviceIdKey=(code,role)=>`daka_device_id_v2:${role}:${code}`;
    const credential=(code,role='main')=>{
        let id=storage?.getItem(deviceIdKey(code,role));
        if(!id){
            id=`dev_${role}_${newDeviceToken().slice(0,16)}`;
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
        headers.set('X-Device-Id',saved.id);
        headers.set('X-Device-Role',role);
        headers.set('Authorization',`Bearer ${saved.id}`);
        return await fetchImpl(url,{...options,headers,redirect:'error'});
    };
    const pair=async(code,role)=>credential(code,role);
    const revokeSelf=async()=>({ok:true});
    return {
        credential,
        required,
        request,
        syncFetch,
        pair,
        revokeSelf,
        rememberRequired:markRequired,
        pending:()=>null,
        discardPending:()=>{}
    };
}
export const deviceAccess=createDeviceAccess();
export const syncFetch=(url,options)=>deviceAccess.syncFetch(url,options,'main');
export const parentFetch=(url,options)=>deviceAccess.syncFetch(url,options,'parent');
export const securityUrl=code=>`/?code=${encodeURIComponent(code||'')}`;
