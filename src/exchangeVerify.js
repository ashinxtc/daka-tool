import {exchangeRequest} from './utils/exchangeTransport.js';
import {securityUrl} from './utils/deviceAccess.js';
const params=new URLSearchParams(location.search),family=params.get('family'),id=params.get('id');
if(family||params.get('secure')==='1'||id?.startsWith('exs_')){
    const button=document.getElementById('confirmBtn');button.disabled=true;
    const message=document.createElement('p');message.setAttribute('role','status');button.before(message);
    const link=document.createElement('a');link.href=securityUrl(family)+'#role=parent';link.textContent='家长设备配对 / 重新授权（完成后重新扫码）';link.style.color='#a5b4fc';button.after(link);
    const render=record=>{
        document.getElementById('childName').textContent=record.childName;
        document.getElementById('goldAmount').textContent=`${record.goldAmount} 金元宝`;
        document.getElementById('cnyAmount').textContent=`${record.cnyAmount} 元`;
        document.getElementById('rate').textContent=`${record.rate} 元/元宝`;
        button.disabled=record.status!=='pending';button.textContent=record.status==='pending'?'确认已转账并核销':`订单状态：${{verified:'已核销',cancelled:'已取消',expired:'已过期'}[record.status]||'不可核销'}`;
        message.textContent=record.status==='verified'?'核销成功，云端已扣款；孩子端同步后显示结余。':record.status==='pending'?'请确认金额和转账，再输入孩子设备上的核销码。':'订单已结束，不能再次核销。';
    };
    const load=async()=>{if(!family||!id)throw new Error('缺少家庭或订单信息，请重新扫码。');const data=await exchangeRequest(family,'order',{role:'parent',id});render(data.record);};
    load().catch(e=>{message.textContent=e.message;});
    button.addEventListener('click',async()=>{
        const verifyCode=prompt('请输入孩子设备上显示的核销码：');if(!verifyCode)return;
        button.disabled=true;
        try{const data=await exchangeRequest(family,'verify',{role:'parent',body:{applyId:id,verifyCode:verifyCode.trim()}});render(data.record);}
        catch(e){message.textContent=`${e.message} 未确认成功，请刷新查询或重试。`;button.disabled=false;}
    });
}
