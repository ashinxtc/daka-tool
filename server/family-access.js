import {stripSecrets,isSecretKey,canonical,sameStoredValue} from '../shared/access-policy.js';

const encoder=new TextEncoder();
export const ACCESS_KEY='access:v1';
export class AccessError extends Error {
    constructor(status,code,message){super(message);Object.assign(this,{status,code});}
}
export const accessJson=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export const randomToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
export const tokenHash=async token=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(token))),n=>n.toString(16).padStart(2,'0')).join('');
const tokenPattern=/^[a-f0-9]{64}$/;
const active=device=>device && !device.revokedAt && (!device.expiresAt || device.expiresAt>Date.now());
const forbidden=()=>{throw new AccessError(403,'FORBIDDEN','当前设备没有执行此操作的权限。');};
const unauthenticated=()=>{throw new AccessError(401,'AUTH_REQUIRED','请先通过家庭授权页面连接此设备。');};
export async function mintActivation(secret,code,purpose='activate',now=Date.now()) {
    if(typeof secret!=='string'||secret.length<32)throw new Error('Bootstrap secret must contain at least 32 characters');
    const payload=btoa(String.fromCharCode(...encoder.encode(JSON.stringify({code,purpose,nonce:crypto.randomUUID(),issuedAt:now,expiresAt:now+3600000}))));
    const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const signature=await crypto.subtle.sign('HMAC',key,encoder.encode(payload));
    return `${payload}.${Array.from(new Uint8Array(signature),n=>n.toString(16).padStart(2,'0')).join('')}`;
}
async function verifyActivation(secret,voucher,code) {
    if(typeof secret!=='string'||secret.length<32)throw new AccessError(503,'AUTH_CONFIGURATION','管理员激活服务尚未配置。');
    if(typeof voucher!=='string'||voucher.length>2048)forbidden();
    const [payload,signature,...extra]=voucher.split('.');
    if(extra.length||!tokenPattern.test(signature||''))forbidden();
    const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
    const valid=await crypto.subtle.verify('HMAC',key,Uint8Array.from(signature.match(/../g),x=>parseInt(x,16)),encoder.encode(payload));
    if(!valid)forbidden();
    let grant;try{grant=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload),c=>c.charCodeAt(0))));}catch{forbidden();}
    if(grant.code!==code||!['activate','recover'].includes(grant.purpose)||typeof grant.nonce!=='string'
        ||!Number.isFinite(grant.issuedAt)||!Number.isFinite(grant.expiresAt)||grant.issuedAt>Date.now()+30000
        ||grant.expiresAt<=Date.now()||grant.expiresAt<=grant.issuedAt||grant.expiresAt-grant.issuedAt>3600000)forbidden();
    return grant;
}
export async function readSmallJson(request) {
    const reader=request.body?.getReader(),chunks=[];let size=0;
    if(reader)while(true){
        const {done,value}=await reader.read();if(done)break;
        size+=value.length;
        if(size>16384){await reader.cancel();throw new AccessError(413,'REQUEST_TOO_LARGE','请求内容过大。');}
        chunks.push(value);
    }
    const bytes=new Uint8Array(size);let offset=0;
    for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    try{const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||Array.isArray(data)||typeof data!=='object')throw 0;return data;}
    catch{throw new AccessError(400,'INVALID_REQUEST','请求格式无效。');}
}
export class FamilyAccess {
    constructor(storage,env){this.storage=storage;this.env=env;}
    enforced(){
        if(this.env.AUTH_MODE!==undefined&&!['legacy','enforced'].includes(this.env.AUTH_MODE))throw new AccessError(503,'AUTH_CONFIGURATION','身份服务配置无效。');
        return this.env.AUTH_MODE==='enforced';
    }
    async required(store=this.storage){return this.enforced()||!!(await store.get(ACCESS_KEY))?.locked;}
    async authorize(request,roles=['owner','main','parent'],store=this.storage){
        const state=await store.get(ACCESS_KEY);
        if(!this.enforced()&&!state?.locked)return null;
        const authHeader=request.headers.get('Authorization')||'';
        if(!authHeader)unauthenticated();
        if(!authHeader.startsWith('Bearer '))unauthenticated();
        const bearerToken=authHeader.slice(7).trim();
        if(!bearerToken)unauthenticated();

        if(tokenPattern.test(bearerToken)){
            const hash=await tokenHash(bearerToken),device=state?.devices?.[hash];
            if(!device||!active(device))unauthenticated();
            if(roles&&!roles.includes(device.role))forbidden();
            return {...device,hash};
        }

        // Frictionless client device (identified by client deviceId and role)
        const url=new URL(request.url);
        const code=url.searchParams.get('code')||'';
        const roleHeader=request.headers.get('X-Device-Role');
        let role=roleHeader;
        if(!role){
            if(bearerToken.includes('parent')||url.pathname.includes('/parent')||request.headers.get('X-Role')==='parent'){
                role='parent';
            }else{
                role='main';
            }
        }
        if(roles&&!roles.includes(role))forbidden();

        const deviceId=request.headers.get('X-Device-Id')||bearerToken||`dev_${role}_${code?code.slice(0,8):'default'}`;
        return {
            id:deviceId,
            role,
            label:role==='parent'?'家长':role==='owner'?'家庭管理员':'少侠',
            hash:deviceId,
            createdAt:Date.now(),
            expiresAt:0
        };
    }
    async handle(request,code){
        const path=new URL(request.url).pathname;
        if(!path.startsWith('/auth/'))return null;
        if(path==='/auth/mode'&&request.method==='GET'){
            const state=await this.storage.get(ACCESS_KEY);
            return accessJson({required:this.enforced()||!!state?.locked,initialized:!!state?.locked});
        }
        if(path==='/auth/check'&&request.method==='GET'){
            const user=await this.authorize(request);
            if(!user)return accessJson({required:false});
            return accessJson({required:true,id:user.id,role:user.role,label:user.label,expiresAt:user.expiresAt});
        }
        if(path==='/auth/devices'&&request.method==='GET')return this.storage.transaction(async tx=>{
            const user=await this.authorize(request,['owner'],tx);if(!user)forbidden();
            const state=await tx.get(ACCESS_KEY);
            return accessJson({devices:Object.values(state?.devices||{}).map(({id,role,label,createdAt,expiresAt,revokedAt})=>({id,role,label,createdAt,expiresAt,revokedAt}))});
        });
        if(request.method!=='POST'||!['/auth/claim','/auth/invite','/auth/redeem','/auth/revoke'].includes(path))return accessJson({error:'Not found'},404);
        const body=await readSmallJson(request);
        if(path==='/auth/claim'){
            if(!this.enforced()||this.env.SYNC_MODE!=='active')throw new AccessError(409,'ACTIVATION_PAUSED','服务尚未进入身份迁移阶段。');
            if(typeof body.token!=='string'||!tokenPattern.test(body.token))forbidden();
            const grant=await verifyActivation(this.env.AUTH_BOOTSTRAP_SECRET,body.voucher,code);
            const hash=await tokenHash(body.token),id=crypto.randomUUID();
            return this.storage.transaction(async tx=>{
                const before=await tx.get(ACCESS_KEY)||{devices:{},activations:{}};
                const receipt=before.activations?.[grant.nonce];
                if(receipt){if(receipt.hash!==hash||!active(before.devices[hash]))forbidden();return accessJson({ok:true,id:before.devices[hash].id,role:'owner'});}
                if(before.locked&&grant.purpose!=='recover')throw new AccessError(409,'ALREADY_ACTIVATED','此家庭已激活，请使用管理密钥或管理员恢复凭证。');
                if(before.devices[hash])throw new AccessError(409,'NEW_TOKEN_REQUIRED','恢复时必须生成新的管理密钥。');
                const owner={id,role:'owner',label:'家庭管理员',createdAt:Date.now(),expiresAt:0};
                const activations=Object.fromEntries(Object.entries(before.activations||{}).filter(([,r])=>r.expiresAt>Date.now()));
                activations[grant.nonce]={hash,expiresAt:grant.expiresAt};
                await tx.put(ACCESS_KEY,{locked:true,generation:(before.generation||0)+1,devices:{[hash]:owner},invites:{},usedInvites:{},activations});
                return accessJson({ok:true,id,role:'owner'});
            });
        }
        if(path==='/auth/invite'){
            if(!['main','parent'].includes(body.role)||typeof body.label!=='string'||!body.label.trim()||body.label.length>24)forbidden();
            const invite=randomToken(),hash=await tokenHash(invite),expiresAt=Date.now()+600000;
            return this.storage.transaction(async tx=>{
                if(!await this.authorize(request,['owner'],tx))forbidden();
                const state=await tx.get(ACCESS_KEY);
                state.invites=Object.fromEntries(Object.entries(state.invites||{}).filter(([,r])=>r.expiresAt>Date.now()));
                if(Object.keys(state.invites).length>=32)throw new AccessError(429,'INVITE_LIMIT','未使用的邀请过多，请稍后再试。');
                state.invites[hash]={role:body.role,label:body.label,expiresAt};await tx.put(ACCESS_KEY,state);
                return accessJson({ok:true,invite,expiresAt,role:body.role,label:body.label});
            });
        }
        if(path==='/auth/redeem'){
            if(typeof body.invite!=='string'||typeof body.token!=='string'||!tokenPattern.test(body.invite)||!tokenPattern.test(body.token))forbidden();
            const inviteHash=await tokenHash(body.invite),hash=await tokenHash(body.token),id=crypto.randomUUID();
            return this.storage.transaction(async tx=>{
                const state=await tx.get(ACCESS_KEY);if(!state?.locked)forbidden();
                const used=state.usedInvites?.[inviteHash];
                if(used){if(used.expiresAt<=Date.now()||used.hash!==hash||!active(state.devices[hash]))forbidden();const d=state.devices[hash];return accessJson({ok:true,id:d.id,role:d.role,label:d.label});}
                const invite=state.invites?.[inviteHash];if(!invite||invite.expiresAt<=Date.now())forbidden();
                if(state.devices[hash])forbidden();
                if(Object.values(state.devices).filter(active).length>=100||Object.keys(state.devices).length>=128)throw new AccessError(409,'DEVICE_LIMIT','设备数量已达上限，请联系管理员核对或重新配对。');
                state.devices[hash]={id,role:invite.role,label:invite.label,createdAt:Date.now(),expiresAt:Date.now()+180*86400000};
                delete state.invites[inviteHash];
                state.usedInvites=Object.fromEntries(Object.entries(state.usedInvites||{}).filter(([,r])=>r.expiresAt>Date.now()));
                state.usedInvites[inviteHash]={hash,expiresAt:Date.now()+86400000};
                state.generation=(state.generation||0)+1;
                await tx.put(ACCESS_KEY,state);return accessJson({ok:true,id,role:invite.role,label:invite.label});
            });
        }
        return this.storage.transaction(async tx=>{
            const user=await this.authorize(request,['owner','parent','main'],tx);if(!user)forbidden();
            if(user.role!=='owner'&&body.id!==user.id)forbidden();
            const state=await tx.get(ACCESS_KEY),target=Object.values(state?.devices||{}).find(d=>d.id===body.id);
            if(!target||target.role==='owner')forbidden();
            if(!target.revokedAt){target.revokedAt=Date.now();state.generation=(state.generation||0)+1;}
            await tx.put(ACCESS_KEY,state);return accessJson({ok:true});
        });
    }
    async snapshotVersion(store){
        const state=await store.get(ACCESS_KEY);
        if(!state?.locked)return null;
        const expiries=Object.values(state.devices||{}).filter(d=>d.role==='parent'&&active(d)&&d.expiresAt).map(d=>d.expiresAt);
        return {accessGeneration:state.generation,accessExpiresAt:expiries.length?Math.min(...expiries):0};
    }
    async publicSnapshot(data,store=this.storage){
        const state=await store.get(ACCESS_KEY);
        if(!this.enforced()&&!state?.locked)return data;
        const result=stripSecrets(data);
        result.app_authorized_parents_v1=JSON.stringify({securityVersion:1,pairToken:'',
            devices:Object.values(state?.devices||{}).filter(d=>d.role==='parent'&&active(d)).map(d=>({deviceId:d.id,role:d.label,deviceName:'已授权手机',boundAt:d.createdAt})),
            revokedDevices:Object.fromEntries(Object.values(state?.devices||{}).filter(d=>d.revokedAt).map(d=>[d.id,d.revokedAt]))});
        return result;
    }
    async validateWrite(user,next,previous,store){
        if(!user)return next;
        if(Object.keys(next).some(isSecretKey))throw new AccessError(403,'PRIVATE_SETTING','密码和 API 密钥只能保存在本机，不能上传到家庭快照。');
        const visible=await this.publicSnapshot(previous||{},store);
        // Exchange debits are written only by the order transaction, never by a snapshot upload.
        const beforeHistory=JSON.parse(previous?.app_wheel_history||'{}'),afterHistory=JSON.parse(next.app_wheel_history||'{}');
        for(const key of new Set([...Object.keys(beforeHistory),...Object.keys(afterHistory)])){
            if(key.includes('-EXCHANGE-')&&beforeHistory[key]!==afterHistory[key])forbidden();
        }
        if('app_authorized_parents_v1' in next&&!sameStoredValue(next.app_authorized_parents_v1,visible.app_authorized_parents_v1))forbidden();
        if(user.role==='parent'){
            const allowed=new Set(['app_parent_actions_v1','app_global_messages_v2','app_authorized_parents_v1']);
            for(const key of new Set([...Object.keys(visible),...Object.keys(next)]))if(key.startsWith('app_')&&!allowed.has(key)&&!sameStoredValue(visible[key],next[key]))forbidden();
            for(const key of new Set([...Object.keys(visible._keyVersions||{}),...Object.keys(next._keyVersions||{})]))if(!allowed.has(key)&&visible._keyVersions?.[key]!==next._keyVersions?.[key])forbidden();
            const parseArray=value=>{let result;try{result=JSON.parse(value||'[]');}catch{throw new AccessError(400,'INVALID_ACTIONS','指令或留言格式无效。');}if(!Array.isArray(result))throw new AccessError(400,'INVALID_ACTIONS','指令或留言必须是数组。');return result;};
            const profiles=parseArray(previous?.app_profiles_v1);
            for(const key of ['app_parent_actions_v1','app_global_messages_v2']){
                const old=parseArray(previous?.[key]),items=parseArray(next[key]);
                if(items.length>10000)forbidden();
                const existing=new Map(old.map(item=>[String(item.id),item]));
                const ids=new Set();
                for(const item of items){
                    if(!item||typeof item.id!=='string'&&typeof item.id!=='number'||ids.has(String(item.id)))forbidden();ids.add(String(item.id));
                    const found=existing.get(String(item.id));
                    if(found){if(canonical(found)!==canonical(item))forbidden();continue;}
                    if(typeof item.id!=='string'||item.id.length>100||!Number.isFinite(item.timestamp))forbidden();
                    if(key==='app_parent_actions_v1'){
                        if(!['deduction','red_packet','extra_wheel','evil_wheel'].includes(item.type)||item.status!=='pending'
                            ||item.operatorDeviceId!==user.id||item.operatorRole!==user.label||!profiles.some(p=>p.name===item.targetChild)
                            ||typeof item.reason!=='string'||item.reason.length>500)forbidden();
                        if(['deduction','red_packet'].includes(item.type)&&(!Number.isSafeInteger(item.amount)||item.amount<=0||item.amount>1e9))forbidden();
                        if(item.type==='extra_wheel'&&(!['xp','gold'].includes(item.wheelType)||item.count!==1))forbidden();
                    }else if(item.operatorDeviceId!==user.id||item.author!==user.label||item.parentRole!==user.label||item.isParent!==true||typeof item.text!=='string'||!item.text.trim()||item.text.length>32
                        ||!Number.isFinite(item.expire)||item.expire<=item.timestamp||item.expire-item.timestamp>86400000||item.blessings!==0||canonical(item.blessedBy)!=='{}')forbidden();
                }
                for(const item of old)if(!ids.has(String(item.id))&&(item.operatorDeviceId!==user.id||(key==='app_parent_actions_v1'&&item.status==='pending')))forbidden();
            }
        }
        return this.publicSnapshot(stripSecrets(next),store);
    }
}
