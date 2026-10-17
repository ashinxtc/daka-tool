import {AccessError,readSmallJson} from './family-access.js';
import {calculateGold,exchangeCny} from '../shared/gold-balance.js';
const fail=(status,code,message)=>{throw new AccessError(status,code,message);};
const parse=(data,key,fallback)=>JSON.parse(data[key]||JSON.stringify(fallback));
const day=t=>new Date(t+8*3600000).toISOString().slice(0,10);
const week=t=>{const d=new Date(t+8*3600000);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()||7)-1));return d.toISOString().slice(0,10);};
const defaults={minGold:500,maxSingle:0,maxWeekly:0,rateMicros:10000};
export class FamilyExchange{
    constructor(family){this.family=family;}
    async handle(request,code){
        const f=this.family,url=new URL(request.url),op=url.pathname.slice('/exchange/'.length);
        if(!['apply','verify','cancel','status','order','limits'].includes(op))fail(404,'NOT_FOUND','兑换接口不存在。');
        if(!['GET','POST'].includes(request.method)||(['apply','verify','cancel'].includes(op)&&request.method!=='POST')||(['order','status'].includes(op)&&request.method!=='GET'))fail(405,'METHOD','请求方法无效。');
        if(f.env.EXCHANGE_MODE!=='preview'||f.env.SYNC_MODE!=='active')fail(503,'EXCHANGE_PAUSED','安全兑换尚未启用，请保留当前订单。');
        if(!await f.access.required())fail(409,'PAIR_REQUIRED','请先完成家庭安全迁移。');
        const roles=op==='limits'&&request.method==='POST'?['owner']:op==='verify'?['parent']:op==='apply'?['main']:['main','parent','owner'];
        await f.access.authorize(request,roles);
        const body=request.method==='POST'?await readSmallJson(request):{};
        if(body.syncCode!==undefined&&body.syncCode!==code)fail(400,'FAMILY_MISMATCH','家庭信息不一致。');
        await f.initialize(code);
        return f.ctx.storage.transaction(async tx=>{
            const user=await f.access.authorize(request,roles,tx);
            const now=Date.now(),storedLimits=await tx.get('exchange:limits'),limits={...defaults,...storedLimits};
            if(op==='limits'){
                if(request.method==='GET')return {ok:true,limits,protected:true,configured:!!storedLimits};
                const next=body.limits;
                for(const [key,min,max]of [['minGold',1,1000000],['maxSingle',0,10000000],['maxWeekly',0,10000000],['rateMicros',1,1000000000]]){
                    if(!Number.isSafeInteger(next?.[key])||next[key]<min||next[key]>max)fail(400,'INVALID_LIMITS','限额或汇率无效。');
                }
                const clean=Object.fromEntries(Object.keys(defaults).map(k=>[k,next[k]]));await tx.put('exchange:limits',clean);return {ok:true,limits:clean};
            }
            const bulk=['apply','status'].includes(op),ids=bulk?await tx.get('exchange:index')||[]:[];
            const orders=bulk?(ids.length?[...(await tx.get(ids.map(id=>`exchange:order:${id}`))).values()]:[]):[await tx.get(`exchange:order:${op==='order'?url.searchParams.get('id'):body.applyId}`)].filter(Boolean);
            const records=orders.map(r=>r.status==='pending'&&Date.parse(r.expiresAt)<=now?{...r,status:'expired'}:r);
            if(op==='status')return {ok:true,records:records.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))};
            if(op==='order'){
                const record=records.find(r=>r.id===url.searchParams.get('id'));if(!record)fail(404,'NOT_FOUND','找不到此家庭的订单。');return {ok:true,record};
            }
            await f.refreshAccessSnapshot(tx);
            const snapshot=await f.exchangeSnapshot(tx),history=parse(snapshot,'app_wheel_history',{});
            if(op==='apply'){
                if(!storedLimits)fail(409,'EXCHANGE_SETUP_REQUIRED','请家庭管理员先确认兑换汇率与限额。');
                const id=body.operationId;
                if(typeof id!=='string'||!/^exs_[a-f0-9-]{36}$/.test(id))fail(400,'OPERATION_REQUIRED','缺少稳定的申请标识。');
                const terms={childName:body.childName,goldAmount:body.goldAmount,rateMicros:body.rateMicros};
                const old=records.find(r=>r.id===id);
                if(old){if(old.deviceId!==user.id||Object.keys(terms).some(k=>terms[k]!==old[k]))fail(409,'IDEMPOTENCY_MISMATCH','申请标识已用于其他操作。');return {ok:true,applyId:id,verifyCode:old.verifyCode,cnyAmount:old.cnyAmount,record:old,replayed:true};}
                if(ids.length>=1000)fail(409,'ARCHIVE_REQUIRED','订单记录已达安全容量，请联系管理员归档。');
                if(!parse(snapshot,'app_profiles_v1',[]).some(p=>p.name===body.childName))fail(400,'CHILD_REQUIRED','孩子不存在，请先完成同步。');
                const gold=body.goldAmount;
                if(!Number.isSafeInteger(gold)||gold<limits.minGold||gold>10000000||limits.maxSingle&&gold>limits.maxSingle)fail(400,'LIMIT','兑换数量不符合家庭限额。');
                if(body.rateMicros!==limits.rateMicros)fail(409,'QUOTE_CHANGED','汇率已调整，请刷新后重新确认。');
                const live=records.filter(r=>r.childName===body.childName&&!['cancelled','expired'].includes(r.status));
                if(live.some(r=>r.status==='pending'))fail(409,'PENDING_ORDER','已有未核销申请，请先处理。');
                if(live.some(r=>day(Date.parse(r.createdAt))===day(now)))fail(409,'DAILY_LIMIT','每日限兑一次。');
                if(limits.maxWeekly&&live.filter(r=>day(Date.parse(r.createdAt))>=week(now)).reduce((n,r)=>n+r.goldAmount,0)+gold>limits.maxWeekly)fail(409,'WEEKLY_LIMIT','超过本周额度。');
                this.checkBalance(snapshot,history,body.childName,gold);
                const record={id,syncCode:code,deviceId:user.id,...terms,rate:limits.rateMicros/1e6,cnyAmount:exchangeCny(gold,limits.rateMicros),
                    verifyCode:String(1000+crypto.getRandomValues(new Uint32Array(1))[0]%9000),status:'pending',createdAt:new Date(now).toISOString(),expiresAt:new Date(now+48*3600000).toISOString()};
                await tx.put(`exchange:order:${id}`,record);await tx.put('exchange:index',[...ids,id]);return {ok:true,applyId:id,verifyCode:record.verifyCode,cnyAmount:record.cnyAmount,record};
            }
            const record=records.find(r=>r.id===body.applyId);if(!record)fail(404,'NOT_FOUND','找不到此家庭的订单。');
            const target=op==='verify'?'verified':'cancelled';
            if(op==='verify'&&String(body.verifyCode)!==record.verifyCode)fail(403,'VERIFY_CODE','核销码不正确。');
            if(record.status===target)return {ok:true,record,replayed:true};
            if(record.status!=='pending')fail(409,'ORDER_FINAL','订单已处理或过期，请刷新状态。');
            if(target==='verified'){
                if(!parse(snapshot,'app_profiles_v1',[]).some(p=>p.name===record.childName))fail(409,'CHILD_REQUIRED','孩子资料已改变，不能核销。');
                this.checkBalance(snapshot,history,record.childName,record.goldAmount);
                const key=`${record.childName}-EXCHANGE-${record.id}`;
                if(key in history)fail(409,'LEDGER_CONFLICT','账目冲突，请联系管理员。');
                history[key]=-record.goldAmount;
                await f.commitExchangeSnapshot(tx,{...snapshot,app_wheel_history:JSON.stringify(history)});
            }
            const updated={...record,status:target,[target==='verified'?'verifiedAt':'cancelledAt']:new Date(now).toISOString(),processedBy:user.id};
            await tx.put(`exchange:order:${record.id}`,updated);return {ok:true,record:updated};
        });
    }
    checkBalance(snapshot,history,child,gold){
        const balance=calculateGold(parse(snapshot,'app_checkins_v2',{}),history,child,parse(snapshot,'app_active_buffs_v1',{}),parse(snapshot,'app_tasks_v2',{}));
        if(!Number.isFinite(balance)||balance<gold)fail(409,'INSUFFICIENT_BALANCE','云端余额不足，请先同步；尚未扣款。');
    }
}
