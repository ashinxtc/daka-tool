// Shared by the UI and atomic exchange settlement. Dates are date keys, not instants.
const subtractDays=(key,n)=>{const d=new Date(`${key}T12:00:00Z`);if(!Number.isFinite(d.getTime()))return 'NaN-NaN-NaN';d.setUTCDate(d.getUTCDate()-n);return d.toISOString().slice(0,10);};
export const exchangeCny=(gold,rateMicros)=>Number.isSafeInteger(gold)&&gold>=0&&Number.isSafeInteger(rateMicros)&&rateMicros>0?Number((BigInt(gold)*BigInt(rateMicros)+BigInt(5000))/BigInt(10000))/100:NaN;
export const pinExchangeHistory=(local,remote)=>({
    ...Object.fromEntries(Object.entries(local).filter(([k])=>!k.includes('-EXCHANGE-'))),
    ...Object.fromEntries(Object.entries(remote).filter(([k])=>k.includes('-EXCHANGE-')))
});
export function calculateGold(checkins,history,child,buffs={},tasks={}){
    let total=0;const buff=buffs?.[child]||{};
    for(const task of tasks?.[child]||[]){
        const record=checkins?.[child]?.[task.id]||{};
        for(const [date,value]of Object.entries(record)){
            for(const entry of Array.isArray(value)?value:[null]){
                const t=entry?.t||0,key=t?`${child}-TASK-${task.id}-${date}_${t}`:`${child}-TASK-${task.id}-${date}`;
                if(history[key])continue;
                const start=buff.investStart||(buff.investExpire?subtractDays(buff.investExpire,30):'');
                const multiplier=buff.investMultiplier>1&&buff.investExpire&&date<=buff.investExpire&&date>=start?buff.investMultiplier:1;
                total+=task.reward*multiplier;
            }
        }
        const freq=task.frequencyType||'count';
        if(freq==='count'&&Object.keys(record).length>=(task.targetCount||0))total+=(task.completedReward||0);
        if((freq==='daily_must'||freq==='weekly_optional')&&task.earlyCompleted)total+=(task.completedReward||0);
    }
    for(const [key,value]of Object.entries(history))if(key.startsWith(`${child}-`))total+=value;
    return Math.max(0,total);
}
