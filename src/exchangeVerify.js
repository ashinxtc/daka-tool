import {exchangeRequest} from './utils/exchangeTransport.js';
import {SYNC_WORKER_URL, EXCHANGE_WORKER_URL} from './constants/api.js';
import {getDeviceFingerprint} from './utils/deviceFingerprint.js';

const params=new URLSearchParams(location.search),family=params.get('family'),id=params.get('id');
if(family||params.get('secure')==='1'||id?.startsWith('exs_')){
    const button=document.getElementById('confirmBtn');button.disabled=true;
    const message=document.createElement('p');message.setAttribute('role','status');button.before(message);
    const render=record=>{
        document.getElementById('childName').textContent=record.childName;
        document.getElementById('goldAmount').textContent=`${record.goldAmount} 金元宝`;
        document.getElementById('cnyAmount').textContent=`${record.cnyAmount} 元`;
        document.getElementById('rate').textContent=`${record.rate} 元/元宝`;
        button.disabled=record.status!=='pending';button.textContent=record.status==='pending'?'确认已转账并核销':`订单状态：${{verified:'已核销',cancelled:'已取消',expired:'已过期'}[record.status]||'不可核销'}`;
        message.textContent=record.status==='verified'?'核销成功，云端已扣款；孩子端同步后显示结余。':record.status==='pending'?'请确认金额和转账，再输入孩子设备上的核销码。':'订单已结束，不能再次核销。';
    };
    const checkParentDevice=async()=>{
        if(!family)return;
        try{
            const res=await fetch(`${SYNC_WORKER_URL}?code=${encodeURIComponent(family)}`,{cache:'no-store'});
            if(res.ok){
                const data=await res.json();
                let authConfig={devices:[],revokedDevices:{}};
                try{if(data.app_authorized_parents_v1)authConfig=JSON.parse(data.app_authorized_parents_v1);}catch(e){}
                const devices=authConfig.devices||[];
                if(devices.length>0){
                    const localDevId=localStorage.getItem('parent_device_id')||'';
                    const localFp=getDeviceFingerprint();
                    const matched=devices.find(d=>{
                        if(!d)return false;
                        if(localDevId&&(d.deviceId===localDevId||(Array.isArray(d.authorizedDeviceIds)&&d.authorizedDeviceIds.includes(localDevId))))return true;
                        if(localFp&&d.fingerprint===localFp)return true;
                        return false;
                    });
                    const revoked=authConfig.revokedDevices||{};
                    if(!matched||(localDevId&&revoked[localDevId])||(localFp&&revoked[localFp])){
                        button.disabled=true;
                        button.style.display='none';
                        message.style.color='#ef4444';
                        message.textContent='🔒 未受信任的家长设备：扫码核销仅限已绑定的家长手机。当前设备尚未完成家长绑定，无权执行核销。请使用电脑主程序【设置】→【家长专属手机看板】扫描绑定本手机后重试。';
                        return false;
                    }
                }
            }
        }catch(e){}
        return true;
    };
    const load=async()=>{
        if(!family||!id)throw new Error('缺少家庭或订单信息，请重新扫码。');
        let record;
        if(id.startsWith('exs_')){
            const data=await exchangeRequest(family,'order',{role:'parent',id});
            record=data.record;
        }else{
            try{
                const res=await fetch(`${EXCHANGE_WORKER_URL}/api/exchange/order?id=${encodeURIComponent(id)}`,{cache:'no-store'});
                if(res.ok){
                    const data=await res.json();
                    record=data.record;
                }
            }catch(e){}
            if(!record){
                record={
                    childName: decodeURIComponent(params.get('child') || '孩子'),
                    goldAmount: params.get('gold') || '—',
                    cnyAmount: params.get('cny') || '—',
                    rate: params.get('rate') || '—',
                    status: 'pending'
                };
            }
        }
        render(record);
        await checkParentDevice();
    };
    load().catch(e=>{message.textContent=e.message;});
    button.addEventListener('click',async()=>{
        const verifyCode=prompt('请输入孩子设备上显示的核销码：');if(!verifyCode)return;
        button.disabled=true;
        try{
            let record;
            if(id.startsWith('exs_')){
                const data=await exchangeRequest(family,'verify',{role:'parent',body:{applyId:id,verifyCode:verifyCode.trim()}});
                record=data.record;
            }else{
                const res=await fetch(`${EXCHANGE_WORKER_URL}/api/exchange/verify`,{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({applyId:id,verifyCode:verifyCode.trim()})
                });
                const data=await res.json();
                if(!res.ok||!data.ok)throw new Error(data.error||'核销失败，请检查核销码。');
                record=data.record;
            }
            render(record);
        }catch(e){message.textContent=`${e.message} 未确认成功，请刷新查询或重试。`;button.disabled=false;}
    });
}
