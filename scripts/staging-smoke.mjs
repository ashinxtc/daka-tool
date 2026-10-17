// Explicit, synthetic staging-only acceptance. Credentials arrive on stdin and are never logged.
import assert from 'node:assert/strict';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const {token: owner, family} = JSON.parse(input);
assert.match(family, /^DAKA-STAGE-/);
assert.match(owner, /^[a-f0-9]{64}$/);
const base = 'https://daka-sync-staging.2378385593.workers.dev';
const exchange = 'https://daka-exchange-staging.2378385593.workers.dev';
const push = 'https://daka-push-staging.2378385593.workers.dev';
const checks = [];
const child = `测试孩子-${Date.now()}`;
const random = () => crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
async function call(path, token, body, headers = {}, origin = base) {
    const url = new URL(path, origin); url.searchParams.set('code', family);
    const response = await fetch(url, {method: body === undefined ? 'GET' : 'POST',
        headers: {'Content-Type': 'application/json', ...(token ? {Authorization: `Bearer ${token}`} : {}), ...headers},
        ...(body === undefined ? {} : {body: JSON.stringify(body)})});
    const text = await response.text();
    let data; try {data = JSON.parse(text);} catch {data = null;}
    return {status: response.status, data, revision: response.headers.get('X-Sync-Revision')};
}
function ok(result, status = 200) {
    assert.equal(result.status, status, `HTTP ${result.status}, expected ${status}: ${result.data?.code || result.data?.error || ''}`);
    return result.data;
}
async function pair(role) {
    const grant = ok(await call('/auth/invite', owner, {role, label: `云端测试-${role}`}));
    const token = random(), body = {invite: grant.invite, token};
    const device = ok(await call('/auth/redeem', null, body));
    assert.equal(ok(await call('/auth/redeem', null, body)).id, device.id);
    ok(await call('/auth/redeem', null, {invite: grant.invite, token: random()}), 403);
    return {...device, token};
}
const main = await pair('main'), parent = await pair('parent');
checks.push('pairing, lost-ACK replay and single-use invitation');
ok(await call('/', null), 401);
ok(await call('/auth/devices', main.token), 403);
checks.push('anonymous access and role boundaries');
const initial = await call('/', main.token);
assert.ok([200, 404].includes(initial.status));
const payload = initial.status === 200 ? {...initial.data} : {
    app_tasks_v2: '{}', app_checkins_v2: '{}',
    app_parent_actions_v1: '[]', app_global_messages_v2: '[]'};
payload.app_profiles_v1 = JSON.stringify([...JSON.parse(payload.app_profiles_v1 || '[]'), {id: child, name: child}]);
payload.app_wheel_history = JSON.stringify({...JSON.parse(payload.app_wheel_history || '{}'), [`${child}-BASE`]: 2000});
assert.match(initial.revision, /^\d+$/);
const writeHeaders = {'If-Match': `"${initial.revision}"`, 'Idempotency-Key': crypto.randomUUID()};
ok(await call('/', main.token, payload, writeHeaders));
ok(await call('/', main.token, payload, writeHeaders));
const saved = await call('/', main.token); ok(saved);
assert.equal(JSON.parse(saved.data.app_wheel_history)[`${child}-BASE`], 2000);
ok(await call('/', main.token, {...payload, app_tasks_v2: '{"测试孩子":[]}'},
    {'If-Match': '"0"', 'Idempotency-Key': crypto.randomUUID()}), 409);
checks.push('snapshot write, exact replay and stale revision conflict');
ok(await call('/exchange/limits', owner, {limits: {minGold: 500, maxSingle: 0, maxWeekly: 0, rateMicros: 10000}}));
const terms = {syncCode: family, operationId: `exs_${crypto.randomUUID()}`, childName: child, goldAmount: 500, rateMicros: 10000};
const orders = await Promise.all([call('/api/exchange/apply', main.token, terms, {}, exchange), call('/api/exchange/apply', main.token, terms, {}, exchange)]);
const [a, b] = orders.map(r => ok(r)); assert.equal(a.applyId, b.applyId);
const verify = {syncCode: family, applyId: a.applyId, verifyCode: a.verifyCode};
ok(await call('/api/exchange/verify', main.token, verify, {}, exchange), 403);
const settled = await Promise.all([call('/api/exchange/verify', parent.token, verify, {}, exchange), call('/api/exchange/verify', parent.token, verify, {}, exchange)]);
settled.forEach(r => ok(r));
const after = ok(await call('/', main.token)), ledger = JSON.parse(after.app_wheel_history);
assert.equal(Object.keys(ledger).filter(k => k.startsWith(`${child}-EXCHANGE-`)).length, 1);
assert.equal(Object.entries(ledger).filter(([k]) => k.startsWith(child + '-')).reduce((a, [,v]) => a + v, 0), 1500);
checks.push('real exchange service binding, concurrent apply and verify debit once');
const vapid = ok(await call('/api/vapid-key', null, undefined, {}, push));
assert.equal(typeof vapid.publicKey, 'string');
assert.ok(vapid.publicKey.length > 80);
checks.push('independent staging VAPID public key');
ok(await call('/auth/revoke', owner, {id: parent.id}));
ok(await call('/auth/check', parent.token), 401);
ok(await call('/api/exchange/verify', parent.token, verify, {}, exchange), 401);
checks.push('revocation enforced across sync and exchange');
console.log(JSON.stringify({family, checks, passed: checks.length}, null, 2));
