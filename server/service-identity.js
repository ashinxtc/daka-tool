import {AccessError} from './family-access.js';
const encoder=new TextEncoder();
const key=secret=>{
    if(typeof secret!=='string'||secret.length<32)throw new AccessError(503,'SERVICE_CONFIG','推送服务身份尚未配置。');
    return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
};
const message=(url,time)=>`${time}\nGET\n${new URL(url).pathname}${new URL(url).search}`;
export async function signService(url,secret,now=Date.now()){
    const time=String(now),signature=await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(message(url,time)));
    return {'X-Push-Time':time,'X-Push-Signature':Array.from(new Uint8Array(signature),b=>b.toString(16).padStart(2,'0')).join('')};
}
export async function verifyService(request,secret){
    const time=request.headers.get('X-Push-Time'),signature=request.headers.get('X-Push-Signature')||'';
    if(request.method!=='GET'||!/^\d{13}$/.test(time||'')||Math.abs(Date.now()-Number(time))>60000||!/^[a-f0-9]{64}$/.test(signature))throw new AccessError(401,'SERVICE_AUTH','服务身份无效。');
    if(!await crypto.subtle.verify('HMAC',await key(secret),Uint8Array.from(signature.match(/../g),s=>parseInt(s,16)),encoder.encode(message(request.url,time))))throw new AccessError(401,'SERVICE_AUTH','服务身份无效。');
}
