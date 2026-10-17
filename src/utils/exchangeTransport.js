import {deviceAccess,ACCESS_ENDPOINT} from './deviceAccess.js';
export async function exchangeRequest(code,operation,{role='main',body,id,signal}={}){
    const controller=signal?null:new AbortController(),timer=controller?setTimeout(()=>controller.abort(),15000):null;
    try{
    const url=new URL(`${ACCESS_ENDPOINT}/exchange/${operation}`);url.searchParams.set('code',code);if(id)url.searchParams.set('id',id);
    const response=await deviceAccess.syncFetch(url.href,{method:body?'POST':'GET',cache:'no-store',signal:signal||controller.signal,
        headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})},role);
    const data=await response.json();if(!response.ok)throw Object.assign(new Error(data.error||'兑换尚未确认，请重试。'),{code:data.code});return data;
    }finally{if(timer)clearTimeout(timer);}
}
export function pendingExchange(code,child,terms,store=localStorage){
    const key=`daka_exchange_intent_v1:${code}:${child}`,raw=store.getItem(key);
    if(raw)return JSON.parse(raw);
    const intent={...terms,operationId:`exs_${crypto.randomUUID()}`};store.setItem(key,JSON.stringify(intent));return intent;
}
export function clearExchangeIntent(code,child,store=localStorage){store.removeItem(`daka_exchange_intent_v1:${code}:${child}`);}
export function confirmExchangeIntent(code,child,records,store=localStorage){
    const raw=store.getItem(`daka_exchange_intent_v1:${code}:${child}`);if(!raw)return;
    const pending=JSON.parse(raw);if(records.some(r=>r.id===pending.operationId))clearExchangeIntent(code,child,store);
}
