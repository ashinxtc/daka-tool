import {AccessError,readSmallJson} from './family-access.js';
import {signService} from './service-identity.js';
const fail=(status,message)=>{throw new AccessError(status,'PUSH_ACCESS',message);};
export async function authorizePush(request,env){
    const body=await readSmallJson(request);
    if(!/^[\w一-鿿-]{4,32}$/.test(body.syncCode||''))fail(400,'家庭同步码无效。');
    if(!env.SYNC_SERVICE)fail(503,'推送权限服务尚未配置。');
    const response=await env.SYNC_SERVICE.fetch(new Request(`https://sync.internal/auth/check?code=${encodeURIComponent(body.syncCode)}`,{headers:{Authorization:request.headers.get('Authorization')||''}}));
    if(!response.ok)fail(response.status===401||response.status===403?response.status:503,'推送身份未确认，请重新配对或稍后重试。');
    const user=await response.json();
    if(typeof user.required!=='boolean')fail(503,'推送权限服务响应无效。');
    if(user.required&&(!['main','parent'].includes(user.role)||!user.id))fail(403,'需要主程序或家长设备身份。');
    return {body,user};
}
export async function readPushProjection(env,code,child,device=''){
    if(!env.SYNC_SERVICE)fail(503,'推送权限服务尚未配置。');
    const url=`https://sync.internal/services/push?code=${encodeURIComponent(code)}&child=${encodeURIComponent(child)}&device=${encodeURIComponent(device)}`;
    const response=await env.SYNC_SERVICE.fetch(new Request(url,{headers:await signService(url,env.PUSH_SERVICE_SECRET)}));
    if(response.status===404)return null;
    if(!response.ok)fail(response.status,'推送资料读取失败。');
    return response.text();
}
export function validateSubscription(value){
    let url;try{url=new URL(value?.endpoint);}catch{fail(400,'推送订阅地址无效。');}
    const host=url.hostname;
    if(url.protocol!=='https:'||url.port||url.username||url.password||url.hash||!(host==='web.push.apple.com'||host==='fcm.googleapis.com'||host==='updates.push.services.mozilla.com'||host.endsWith('.notify.windows.com')))fail(400,'不支持的推送服务地址。');
    if(!/^[\w-]{87}=?$/.test(value.keys?.p256dh||'')||!/^[\w-]{22}(==)?$/.test(value.keys?.auth||''))fail(400,'推送订阅密钥无效。');
    return value;
}
export async function* subscriptions(kv,prefix){
    let cursor;
    do{const page=await kv.list({prefix,cursor});for(const item of page.keys)yield item;cursor=page.list_complete?undefined:page.cursor;}while(cursor);
}
