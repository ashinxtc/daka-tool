export const ACCESS_ENDPOINT='https://sync.daka-tool.top';
const tokenPattern=/^[a-f0-9]{64}$/;
const roles=new Set(['main','parent']);
export const newDeviceToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
export class DeviceAccessError extends Error {
    constructor(message,code='AUTH_REQUIRED',status=401){super(message);Object.assign(this,{code,status});}
}
const browserStore=()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
export function createDeviceAccess({storage=browserStore(),fetchImpl=(...args)=>fetch(...args),endpoint=ACCESS_ENDPOINT}={}){
    const key=(code,role)=>`daka_device_access_v1:${role}:${code}`;
    const pendingKey=(code,role)=>`daka_pair_pending_v1:${role}:${code}`;
    const requiredKey=code=>`daka_access_required_v1:${code}`;
    const parse=raw=>{try{return JSON.parse(raw||'null');}catch{throw new DeviceAccessError('本机授权记录损坏，请重新配对。','INVALID_CREDENTIAL');}};
    const credential=(code,role='main')=>{
        if(!roles.has(role))throw new DeviceAccessError('无效的设备角色。');
        const value=parse(storage?.getItem(key(code,role)));
        if(value&&(!tokenPattern.test(value.token)||value.role!==role||typeof value.id!=='string'))throw new DeviceAccessError('本机授权记录无效，请重新配对。','INVALID_CREDENTIAL');
        return value;
    };
    const required=code=>{try{return !!(storage?.getItem(requiredKey(code))||storage?.getItem(key(code,'main'))||storage?.getItem(key(code,'parent')));}catch{return true;}};
    const markRequired=code=>{if(!storage)throw new DeviceAccessError('无法保存本机授权，请允许浏览器存储。','STORAGE_REQUIRED');if(storage.getItem(requiredKey(code))!=='1')storage.setItem(requiredKey(code),'1');};
    const request=async(code,path,{token,body}={})=>{
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
        try{
        const response=await fetchImpl(`${endpoint}${path}?code=${encodeURIComponent(code)}`,{method:body===undefined?'GET':'POST',cache:'no-store',redirect:'error',signal:controller.signal,
            headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
        let data;try{data=await response.json();}catch{throw new DeviceAccessError('授权服务响应无效，尚未确认成功。','INVALID_RESPONSE',502);}
        if(!response.ok)throw new DeviceAccessError(data.error||'授权失败，请重试。',data.code||'AUTH_FAILED',response.status);
        return data;
        }finally{clearTimeout(timer);}
    };
    const syncFetch=async(url,options={},role='main')=>{
        const target=new URL(url),origin=new URL(endpoint).origin;
        if(target.origin!==origin)throw new DeviceAccessError('拒绝向其他服务发送家庭凭据。','WRONG_ORIGIN',400);
        const code=target.searchParams.get('code'),saved=credential(code,role),headers=new Headers(options.headers);
        headers.delete('Authorization');if(saved)headers.set('Authorization',`Bearer ${saved.token}`);
        const response=await fetchImpl(url,{...options,headers,redirect:'error'});
        const protectedResponse=response.headers.get('X-Family-Auth')==='required';
        if(protectedResponse)markRequired(code);
        if(response.status===401){
            const data=await response.clone().json().catch(()=>({}));
            if(data.code==='AUTH_REQUIRED'){markRequired(code);throw new DeviceAccessError('此设备需要重新授权。请打开「设备配对」，本机数据已保留。');}
        }
        if(required(code)&&!protectedResponse)throw new DeviceAccessError('服务权限版本发生变化，已暂停同步并保留本机数据。','AUTH_DOWNGRADE',409);
        return response;
    };
    const pair=async(code,role,invite)=>{
        if(!roles.has(role)||!tokenPattern.test(invite))throw new DeviceAccessError('邀请链接无效。','INVALID_INVITE',400);
        if(!storage)throw new DeviceAccessError('请允许浏览器存储后再配对。','STORAGE_REQUIRED');
        let pending=parse(storage.getItem(pendingKey(code,role)));
        if(pending&&pending.invite!==invite)throw new DeviceAccessError('已有待确认配对，请先重试或明确放弃。','PAIR_PENDING',409);
        if(!pending){pending={invite,token:newDeviceToken()};storage.setItem(pendingKey(code,role),JSON.stringify(pending));}
        const result=await request(code,'/auth/redeem',{body:pending});
        if(result.ok!==true||result.role!==role||typeof result.id!=='string')throw new DeviceAccessError('邀请角色与页面不一致，未保存设备身份。','INVALID_RECEIPT',502);
        markRequired(code);
        const saved={token:pending.token,id:result.id,role:result.role,label:result.label};
        storage.setItem(key(code,role),JSON.stringify(saved));
        storage.removeItem(pendingKey(code,role));
        return saved;
    };
    const revokeSelf=async(code,role)=>{
        const saved=credential(code,role);if(!saved)throw new DeviceAccessError('本机没有对应授权。');
        const result=await request(code,'/auth/revoke',{token:saved.token,body:{id:saved.id}});
        if(result.ok!==true)throw new DeviceAccessError('服务端尚未确认解绑。','INVALID_RECEIPT',502);
        storage.removeItem(key(code,role));return result;
    };
    return {credential,required,request,syncFetch,pair,revokeSelf,rememberRequired:markRequired,
        pending:(code,role)=>parse(storage?.getItem(pendingKey(code,role))),
        discardPending:(code,role)=>storage?.removeItem(pendingKey(code,role))};
}
export const deviceAccess=createDeviceAccess();
export const syncFetch=(url,options)=>deviceAccess.syncFetch(url,options,'main');
export const parentFetch=(url,options)=>deviceAccess.syncFetch(url,options,'parent');
export const securityUrl=code=>`/security.html?code=${encodeURIComponent(code||'')}`;
