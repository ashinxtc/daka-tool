import {deviceAccess} from './deviceAccess.js';
import {PUSH_WORKER_URL} from '../constants/api.js';
export async function pushRequest(operation,body,{access=deviceAccess,fetchImpl=fetch,endpoint=PUSH_WORKER_URL}={}){
    if(!['subscribe','unsubscribe','test-push','notify-sync','push-status'].includes(operation))throw new Error('未知推送操作。');
    const headers={'Content-Type':'application/json'},saved=access.credential(body.syncCode,'main');
    if(saved)headers.Authorization=`Bearer ${saved.token}`;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{
        const response=await fetchImpl(`${endpoint}/api/${operation}`,{method:'POST',headers,redirect:'error',signal:controller.signal,body:JSON.stringify(body)});
        const protectedResponse=response.headers.get('X-Family-Auth')==='required';
        if(protectedResponse)access.rememberRequired(body.syncCode);
        if(access.required(body.syncCode)&&!protectedResponse)throw new Error('推送权限未确认，请重新配对或稍后重试。');
        const data=await response.json();
        if(!response.ok||data.ok!==true)throw new Error(data.error||'推送服务尚未确认成功，请重试。');
        return data;
    }finally{clearTimeout(timer);}
}
