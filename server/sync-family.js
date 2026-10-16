const MAX_BYTES = 8 * 1024 * 1024, PART_SIZE = 64 * 1024;
const encoder = new TextEncoder(), decoder = new TextDecoder();
export class SyncError extends Error {
    constructor(status, code, message) { super(message); Object.assign(this, { status, code }); }
}
export function json(data, status = 200, revision = null) {
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Sync-Protocol': '2' };
    if (revision !== null) { headers['X-Sync-Revision'] = String(revision); headers.ETag = `"${revision}"`; }
    return new Response(JSON.stringify(data), { status, headers });
}
function validate(value) {
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new SyncError(400, 'INVALID_SNAPSHOT', '同步数据必须是对象。');
    const data = {};
    for (const [key, v] of Object.entries(value)) {
        if (['_syncTs','app_sync_code','app_sync_last_time','app_test_mode'].includes(key)) continue;
        if (key === '_keyVersions') {
            if (!v || Array.isArray(v) || typeof v !== 'object' || Object.values(v).some(n => !Number.isFinite(n) || n < 0)) throw new SyncError(400, 'INVALID_SNAPSHOT', '版本表无效。');
            data[key] = v; continue;
        }
        if (!key.startsWith('app_') || key.length > 512 || /[\x00-\x1f]/.test(key) || typeof v !== 'string') throw new SyncError(400, 'INVALID_SNAPSHOT', '同步键或值格式无效。');
        data[key] = v;
    }
    if ('app_profiles_v1' in data) {
        let profiles; try { profiles = JSON.parse(data.app_profiles_v1); } catch {}
        if (!Array.isArray(profiles) || profiles.some(p => !p || typeof p.name !== 'string')) throw new SyncError(400, 'INVALID_SNAPSHOT', '家庭成员数据无效。');
    }
    if (encoder.encode(JSON.stringify(data)).length > MAX_BYTES) throw new SyncError(413, 'SNAPSHOT_TOO_LARGE', '同步数据超过 8 MB，请先导出备份。');
    return data;
}
function guardProfiles(previous, next) {
    const before = JSON.parse(previous?.app_profiles_v1 || '[]'), after = JSON.parse(next.app_profiles_v1 || '[]');
    if (before.length && !after.length) throw new SyncError(409, 'PROFILE_SAFETY', '上传的成员列表为空，已保护现有家庭数据。');
    if (before.some(p => p.name !== '测试员') && after.length === 1 && after[0].name === '测试员') throw new SyncError(409, 'PROFILE_SAFETY', '请先拉取家庭数据，默认测试员不能覆盖现有家庭。');
}
async function readSnapshot(store, revision) {
    const count = await store.get(`parts:${revision}`);
    if (count === undefined) return null;
    const keys = Array.from({ length: count }, (_, i) => `snapshot:${revision}:${i}`);
    const parts = new Map();
    for (let i = 0; i < keys.length; i += 128) {
        for (const [key, value] of await store.get(keys.slice(i, i + 128))) parts.set(key, value);
    }
    const bytes = keys.map(k => new Uint8Array(parts.get(k)));
    if (bytes.some(b => !b.length)) throw new Error('Snapshot chunk missing');
    const all = new Uint8Array(bytes.reduce((n, b) => n + b.length, 0));
    let offset = 0; for (const part of bytes) { all.set(part, offset); offset += part.length; }
    return JSON.parse(decoder.decode(all));
}
async function writeSnapshot(store, revision, data) {
    const bytes = encoder.encode(JSON.stringify(data)), count = Math.ceil(bytes.length / PART_SIZE);
    for (let start = 0; start < count; start += 32) {
        const entries = {};
        for (let i = start; i < Math.min(count, start + 32); i++) entries[`snapshot:${revision}:${i}`] = bytes.slice(i * PART_SIZE, (i + 1) * PART_SIZE);
        await store.put(entries);
    }
    await store.put(`parts:${revision}`, count);
}
async function deleteSnapshot(store, revision) {
    const count = await store.get(`parts:${revision}`);
    if (count === undefined) return;
    const keys = Array.from({ length: count }, (_, i) => `snapshot:${revision}:${i}`); keys.push(`parts:${revision}`);
    for (let i = 0; i < keys.length; i += 128) await store.delete(keys.slice(i, i + 128));
}
async function readBody(request) {
    if (Number(request.headers.get('Content-Length')) > MAX_BYTES) throw new SyncError(413, 'SNAPSHOT_TOO_LARGE', '同步数据超过 8 MB。');
    const reader = request.body?.getReader();
    if (!reader) throw new SyncError(400, 'INVALID_JSON', '缺少同步数据。');
    const chunks = []; let size = 0;
    while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.length;
        if (size > MAX_BYTES) { await reader.cancel(); throw new SyncError(413, 'SNAPSHOT_TOO_LARGE', '同步数据超过 8 MB。'); }
        chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const part of chunks) { bytes.set(part, offset); offset += part.length; }
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
    let parsed; try { parsed = JSON.parse(decoder.decode(bytes)); } catch { throw new SyncError(400, 'INVALID_JSON', '请求体不是合法 JSON。'); }
    return { data: validate(parsed), digest };
}
// A persisted transaction, not an in-memory mutex or KV timestamp, is the authority.
export class SyncFamily {
    constructor(ctx, env) { this.ctx = ctx; this.env = env; this.initialized = false; }
    async initialize(code) {
        if (this.initialized) return;
        await this.ctx.blockConcurrencyWhile(async () => {
            if (await this.ctx.storage.get('head')) { this.initialized = true; return; }
            const raw = await this.env.DAKA_SYNC.get(`sync:${code}`);
            let data = null;
            if (raw !== null) {
                try { data = validate(JSON.parse(raw)); } catch { throw new SyncError(503, 'MIGRATION_INVALID', '旧云端数据校验失败，请保留备份并检查后重试。'); }
            }
            const ts = data ? Date.now() : 0;
            let backup = null;
            if (data) {
                const oldBackup = await this.env.DAKA_SYNC.get(`sync:${code}:bak`);
                try { if (oldBackup) backup = validate(JSON.parse(oldBackup)); } catch { /* Preserve invalid legacy backup in KV for manual recovery. */ }
            }
            await this.ctx.storage.transaction(async tx => {
                if (data) await writeSnapshot(tx, 1, { ...data, _syncTs: ts });
                if (backup) await writeSnapshot(tx, 0, backup);
                await tx.put('head', { revision: data ? 1 : 0, ts, exists: !!data, receipts: [], ...(backup?{backupRevision:0}:{}) });
            });
            this.initialized = true;
        });
    }
    async fetch(request) {
        try {
            const url = new URL(request.url);
            await this.initialize(url.searchParams.get('code'));
            if (request.method === 'GET') return await this.ctx.storage.transaction(async tx => {
                const head = await tx.get('head');
                if (url.pathname === '/ts') return json({ ts: head.ts, revision: head.revision, protocol: 2 }, 200, head.revision);
                if (url.pathname === '/bak') {
                    const backup = head.backupRevision === undefined ? null : await readSnapshot(tx, head.backupRevision);
                    return backup ? json(backup, 200, head.backupRevision) : json({ error: '未找到快照备份数据' }, 404, head.revision);
                }
                if (!head.exists) return json({ error: '未找到数据，请先在其他设备上传' }, 404, head.revision);
                return json(await readSnapshot(tx, head.revision), 200, head.revision);
            });
            const match = /^"(0|[1-9]\d*)"$/.exec(request.headers.get('If-Match') || '');
            const revision = match ? Number(match[1]) : NaN, id = request.headers.get('Idempotency-Key') || '';
            if (!Number.isSafeInteger(revision) || !/^[\w-]{16,100}$/.test(id)) throw new SyncError(428, 'UPGRADE_REQUIRED', '请刷新并升级客户端后同步；旧版上传已被保护性阻止。');
            const { data, digest } = await readBody(request);
            return await this.ctx.storage.transaction(async tx => {
                const head = await tx.get('head'), receipt = await tx.get(`request:${id}`);
                if (receipt) {
                    if (receipt.digest !== digest || receipt.base !== revision) throw new SyncError(409, 'IDEMPOTENCY_MISMATCH', '重复请求的内容不一致。');
                    return json({ ok: true, ts: receipt.ts, revision: receipt.revision, replayed: true }, 200, receipt.revision);
                }
                if (revision !== head.revision) return json({ error: '云端已有新版本，请先合并后重试。', code: 'REVISION_CONFLICT', revision: head.revision }, 409, head.revision);
                const previous = head.exists ? await readSnapshot(tx, head.revision) : null;
                guardProfiles(previous, data);
                const nextRevision = head.revision + 1, ts = Math.max(Date.now(), head.ts + 1);
                await writeSnapshot(tx, nextRevision, { ...data, _syncTs: ts });
                if (head.backupRevision !== undefined) await deleteSnapshot(tx, head.backupRevision);
                const receipts = [...head.receipts, id];
                while (receipts.length > 128) await tx.delete(`request:${receipts.shift()}`);
                await tx.put(`request:${id}`, { digest, base: revision, revision: nextRevision, ts });
                await tx.put('head', { revision: nextRevision, ts, exists: true,
                    ...(head.exists ? { backupRevision: head.revision } : {}), receipts });
                return json({ ok: true, ts, revision: nextRevision }, 200, nextRevision);
            });
        } catch (e) {
            return json({ error: e instanceof SyncError ? e.message : '云端保存暂时不可用，请稍后重试。', code: e.code || 'STORAGE_UNAVAILABLE' }, e.status || 503);
        }
    }
}
