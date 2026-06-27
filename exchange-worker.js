// exchange-worker.js — 金元宝兑换零花钱 · 汇率系统
//
// 功能：
// 1. /api/rate         — 获取今日汇率
// 2. /api/rate/history — 获取近 7 天汇率历史
// 3. /api/exchange/apply  — 孩子申请兑换
// 4. /api/exchange/verify — 家长核销
// 5. /api/exchange/status — 查询兑换状态
// 6. Cron Trigger — 每天凌晨 2 点更新汇率

const FRANKFURTER_API = 'https://api.frankfurter.dev/v1/latest';
const FRANKFURTER_HISTORY = 'https://api.frankfurter.dev/v1/';
const FLOATRATES_API = 'https://floatrates.com/daily/cny.json';

// 汇率知识卡片（10 条轮换）
const KNOWLEDGE_CARDS = [
    { title: '什么是汇率', content: '汇率就是两种货币之间的交换比例。比如 1 元人民币可以换 0.14 美元，这个比例就叫"人民币对美元汇率"。', quiz: '如果 1 元能换 0.14 美元，那 10 元能换多少美元？', answer: '1.4 美元' },
    { title: '为什么汇率每天变', content: '汇率跟菜市场的菜价一样，买的人多就涨，卖的人多就跌。一个国家经济好、出口多，大家想用它的钱，汇率就涨。', quiz: '如果中国出口了很多商品到美国，人民币汇率会涨还是跌？', answer: '会涨（升值），因为外国人需要买人民币来买中国商品' },
    { title: '人民币升值', content: '人民币升值 = 1 元人民币能换更多外币。对你的金元宝来说，升值意味着同样数量的金元宝能换更多零花钱！', quiz: '人民币从 1:0.137 升到 1:0.140，你的金元宝更值钱了还是更不值钱了？', answer: '更值钱了！因为 1 元能换更多美元' },
    { title: '人民币贬值', content: '贬值就是反过来——1 元能换的外币变少了。比如出国旅游时，同样的钱能买到的东西变少了。', quiz: '如果你要去日本旅游，人民币贬值了，你带同样的钱能买更多还是更少东西？', answer: '更少了，因为日元相对更贵了' },
    { title: '美元为什么重要', content: '美元是世界上用得最多的货币，很多国家之间的买卖都用美元结算。就像班里大家都认的"通用货币"一样。', quiz: '为什么中国和日本做生意时经常用美元而不是人民币或日元？', answer: '因为美元是大家都接受的"通用货币"，用它结算最方便' },
    { title: '日元为什么数字大', content: '1 元人民币 ≈ 21 日元，但不代表日元不值钱。只是日本的货币单位不同，就像 1 米 = 100 厘米一样。日本一个饭团 100 日元 ≈ 5 元人民币。', quiz: '如果一个日本饭团 200 日元，大约等于多少人民币？', answer: '大约 10 元（200÷21≈9.5）' },
    { title: '欧元是怎么来的', content: '欧洲有 20 多个国家共用一种货币叫"欧元"，就像大家一起用同一种钱。这样在欧洲各国之间买东西就不用换钱了。', quiz: '法国人去德国旅游需要换钱吗？', answer: '不需要，因为两国都用欧元' },
    { title: '英镑为什么贵', content: '1 英镑 ≈ 9.2 元人民币。英镑是世界上历史最久的货币之一，英国是最早工业化的国家，经济基础好，所以英镑一直很"值钱"。', quiz: '100 元人民币大约能换多少英镑？', answer: '大约 11 英镑（100÷9.2≈10.9）' },
    { title: '什么是外汇储备', content: '每个国家都会存一些其他国家的钱，就像家里存的"应急钱"。中国的外汇储备是全世界最多的，有 3 万多亿美元！', quiz: '如果中国有很多美元储备，对人民币汇率有什么影响？', answer: '会让人民币更稳定，因为国家可以用储备来调节汇率' },
    { title: '为什么要换外币', content: '出国旅游、买外国商品、留学都要用当地的钱。就像你去不同城市可能需要不同的交通卡一样。', quiz: '如果你要去英国留学，需要把人民币换成什么货币？', answer: '英镑（GBP）' },
];

// ============================================================
// 汇率获取
// ============================================================

async function fetchLatestRates() {
    try {
        // 主 API: Frankfurter
        const resp = await fetch(`${FRANKFURTER_API}?base=CNY&symbols=USD,JPY,EUR,GBP,KRW`);
        if (resp.ok) {
            const data = await resp.json();
            return {
                base: 'CNY',
                date: data.date,
                rates: data.rates,
                source: 'frankfurter'
            };
        }
    } catch (e) {
        console.warn('Frankfurter API failed:', e.message);
    }

    // 备用 API: FloatRates
    try {
        const resp = await fetch(FLOATRATES_API);
        if (resp.ok) {
            const data = await resp.json();
            return {
                base: 'CNY',
                date: new Date().toISOString().slice(0, 10),
                rates: {
                    USD: data.usd?.rate ? (1 / data.usd.rate) : null,
                    JPY: data.jpy?.rate ? (1 / data.jpy.rate * 100) : null, // JPY per CNY
                    EUR: data.eur?.rate ? (1 / data.eur.rate) : null,
                    GBP: data.gbp?.rate ? (1 / data.gbp.rate) : null,
                    KRW: data.krw?.rate ? (1 / data.krw.rate * 100) : null,
                },
                source: 'floatrates'
            };
        }
    } catch (e) {
        console.warn('FloatRates API failed:', e.message);
    }

    return null;
}

// 更新汇率 KV
async function updateExchangeRate(env) {
    const rate = await fetchLatestRates();
    if (!rate) return false;

    // 保存今日汇率
    await env.EXCHANGE_KV.put('rate:latest', JSON.stringify(rate), { expirationTtl: 86400 * 2 });

    // 更新历史记录（保留最近 30 天）
    let history = [];
    try {
        const histData = await env.EXCHANGE_KV.get('rate:history');
        if (histData) history = JSON.parse(histData);
    } catch (e) {}

    // 添加今日记录（去重）
    const existing = history.findIndex(h => h.date === rate.date);
    if (existing >= 0) {
        history[existing] = { date: rate.date, usd: rate.rates.USD, jpy: rate.rates.JPY, eur: rate.rates.EUR, gbp: rate.rates.GBP };
    } else {
        history.push({ date: rate.date, usd: rate.rates.USD, jpy: rate.rates.JPY, eur: rate.rates.EUR, gbp: rate.rates.GBP });
    }
    // 保留最近 30 天
    if (history.length > 30) history = history.slice(-30);
    await env.EXCHANGE_KV.put('rate:history', JSON.stringify(history), { expirationTtl: 86400 * 60 });

    return true;
}

// ============================================================
// 兑换申请
// ============================================================

async function handleApply(request, env) {
    const body = await request.json();
    const { syncCode, childName, goldAmount, rate } = body;

    if (!syncCode || !childName || !goldAmount || goldAmount < 500) {
        return json({ error: '参数不完整或兑换数量不足（最低 500 金元宝）' }, 400);
    }

    // 防重复：检查当日是否有未核销的申请
    const indexKey = `exchange_index:${syncCode}`;
    let index = [];
    try {
        const idxData = await env.EXCHANGE_KV.get(indexKey);
        if (idxData) index = JSON.parse(idxData);
    } catch (e) {}

    const today = new Date().toISOString().slice(0, 10);
    for (const id of index) {
        const existing = await env.EXCHANGE_KV.get(`exchange:${id}`);
        if (existing) {
            const rec = JSON.parse(existing);
            if (rec.status === 'pending' && rec.createdAt?.startsWith(today)) {
                return json({ error: '今天已有未核销的兑换申请，请先取消或等待核销后再申请。' }, 400);
            }
        }
    }

    // 生成 4 位核销码
    const verifyCode = String(Math.floor(1000 + Math.random() * 9000));
    const applyId = `ex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const record = {
        id: applyId,
        syncCode,
        childName,
        goldAmount,
        rate,
        cnyAmount: Math.round(goldAmount * rate * 100) / 100, // 元（保留2位小数）
        verifyCode,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
    };

    // 存储兑换申请（48 小时过期）
    await env.EXCHANGE_KV.put(`exchange:${applyId}`, JSON.stringify(record), { expirationTtl: 48 * 3600 });

    // 更新索引（7 天 TTL）
    index.push(applyId);
    if (index.length > 50) index = index.slice(-50);
    await env.EXCHANGE_KV.put(indexKey, JSON.stringify(index), { expirationTtl: 7 * 86400 });

    return json({ ok: true, applyId, verifyCode, cnyAmount: record.cnyAmount });
}

// ============================================================
// 家长核销
// ============================================================

async function handleVerify(request, env) {
    const body = await request.json();
    const { applyId, verifyCode } = body;

    if (!applyId || !verifyCode) {
        return json({ error: '缺少参数' }, 400);
    }

    const recordData = await env.EXCHANGE_KV.get(`exchange:${applyId}`);
    if (!recordData) return json({ error: '兑换记录不存在或已过期' }, 404);

    const record = JSON.parse(recordData);
    if (record.status !== 'pending') return json({ error: '该兑换已处理' }, 400);
    if (record.verifyCode !== verifyCode) return json({ error: '核销码不正确' }, 400);

    record.status = 'verified';
    record.verifiedAt = new Date().toISOString();
    await env.EXCHANGE_KV.put(`exchange:${applyId}`, JSON.stringify(record), { expirationTtl: 30 * 86400 });

    return json({ ok: true, record });
}

// ============================================================
// 查询兑换状态
// ============================================================

async function handleStatus(request, env) {
    const url = new URL(request.url);
    const syncCode = url.searchParams.get('code');
    if (!syncCode) return json({ error: '缺少同步码' }, 400);

    const indexKey = `exchange_index:${syncCode}`;
    let index = [];
    try {
        const idxData = await env.EXCHANGE_KV.get(indexKey);
        if (idxData) index = JSON.parse(idxData);
    } catch (e) {}

    const records = [];
    const validIds = [];
    for (const id of index) {
        const data = await env.EXCHANGE_KV.get(`exchange:${id}`);
        if (data) {
            records.push(JSON.parse(data));
            validIds.push(id);
        }
    }

    // 清理索引中已过期的条目
    if (validIds.length !== index.length) {
        await env.EXCHANGE_KV.put(indexKey, JSON.stringify(validIds), { expirationTtl: 7 * 86400 });
    }

    return json({ records: records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}

// ============================================================
// 取消兑换申请
// ============================================================

async function handleCancel(request, env) {
    const body = await request.json();
    const { applyId, syncCode } = body;

    if (!applyId) return json({ error: '缺少申请ID' }, 400);

    const recordData = await env.EXCHANGE_KV.get(`exchange:${applyId}`);
    if (!recordData) return json({ error: '兑换记录不存在或已过期' }, 404);

    const record = JSON.parse(recordData);
    if (record.status !== 'pending') return json({ error: '该兑换已处理，无法取消' }, 400);

    record.status = 'cancelled';
    record.cancelledAt = new Date().toISOString();
    await env.EXCHANGE_KV.put(`exchange:${applyId}`, JSON.stringify(record), { expirationTtl: 86400 });

    return json({ ok: true });
}

// ============================================================
// 主入口
// ============================================================

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // 获取今日汇率
            if (path === '/api/rate' && request.method === 'GET') {
                const data = await env.EXCHANGE_KV.get('rate:latest');
                if (!data) {
                    // KV 无缓存，实时获取
                    const rate = await fetchLatestRates();
                    if (rate) return json({ ok: true, rate });
                    return json({ error: '汇率获取失败' }, 500);
                }
                return json({ ok: true, rate: JSON.parse(data) });
            }

            // 获取历史汇率
            if (path === '/api/rate/history' && request.method === 'GET') {
                const data = await env.EXCHANGE_KV.get('rate:history');
                return json({ ok: true, history: data ? JSON.parse(data) : [] });
            }

            // 获取汇率知识卡片
            if (path === '/api/knowledge' && request.method === 'GET') {
                const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
                const index = dayOfYear % KNOWLEDGE_CARDS.length;
                return json({ ok: true, card: KNOWLEDGE_CARDS[index], index });
            }

            // 申请兑换
            if (path === '/api/exchange/apply' && request.method === 'POST') {
                return await handleApply(request, env);
            }

            // 核销兑换
            if (path === '/api/exchange/verify' && request.method === 'POST') {
                return await handleVerify(request, env);
            }

            // 查询兑换状态
            if (path === '/api/exchange/status' && request.method === 'GET') {
                return await handleStatus(request, env);
            }

            // 取消兑换申请
            if (path === '/api/exchange/cancel' && request.method === 'POST') {
                return await handleCancel(request, env);
            }

            // 初始化物价（首次查询）
            if (path === '/api/price/init' && request.method === 'POST') {
                return await handlePriceInit(request, env);
            }

            // 获取当前物价
            if (path === '/api/price/current' && request.method === 'GET') {
                return await handlePriceCurrent(env);
            }

            // 人工校准物价
            if (path === '/api/price/update' && request.method === 'POST') {
                return await handlePriceUpdate(request, env);
            }

            // 手动触发汇率更新（调试用）
            if (path === '/api/update-rate' && request.method === 'GET') {
                const ok = await updateExchangeRate(env);
                return json({ ok, message: ok ? '汇率更新成功' : '汇率更新失败' });
            }

            // 手动触发 Big Mac 更新（调试用）
            if (path === '/api/update-bigmac' && request.method === 'GET') {
                const ok = await updateBigMacIndex(env);
                return json({ ok, message: ok ? 'Big Mac 指数更新成功' : 'Big Mac 指数更新失败' });
            }

            return json({ error: 'Not found' }, 404);
        } catch (e) {
            return json({ error: e.message }, 500);
        }
    },

    async scheduled(event, env, ctx) {
        ctx.waitUntil(updateExchangeRate(env));
        ctx.waitUntil(updateBigMacIndex(env));
    }
};

// ============================================================
// 物价指数系统
// ============================================================

// 默认商品列表
const DEFAULT_ITEMS = [
    { id: 'mxbc_lnm', name: '柠檬水（中杯）', brand: '蜜雪冰城', icon: '🧃', defaultPrice: 4 },
    { id: 'bwcj_bcjx', name: '伯牙绝弦（中杯）', brand: '霸王茶姬', icon: '🍵', defaultPrice: 16 },
    { id: 'sbc_latte', name: '大杯拿铁', brand: '星巴克', icon: '☕', defaultPrice: 30 },
    { id: 'mcd_bm', name: '巨无霸套餐', brand: '麦当劳', icon: '🍔', defaultPrice: 26 },
    { id: 'coca_can', name: '罐装可乐330ml', brand: '可口可乐', icon: '🥤', defaultPrice: 3.5 },
];

// Big Mac 指数：从 GitHub 获取最新数据
async function updateBigMacIndex(env) {
    try {
        const resp = await fetch('https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/big-mac-full-index.csv');
        if (!resp.ok) return false;
        const csv = await resp.text();
        const lines = csv.split('\n');
        const header = lines[0].split(',');

        // 找到最新一期中国的数据
        const isoIdx = header.indexOf('iso_a3');
        const dateIdx = header.indexOf('date');
        const localPriceIdx = header.indexOf('local_price');

        let latestChina = null;
        let latestUS = null;

        for (let i = lines.length - 1; i >= 1; i--) {
            const cols = lines[i].split(',');
            if (cols[isoIdx] === 'CHN' && !latestChina) {
                latestChina = { date: cols[dateIdx], price: parseFloat(cols[localPriceIdx]) };
            }
            if (cols[isoIdx] === 'USA' && !latestUS) {
                latestUS = { date: cols[dateIdx], price: parseFloat(cols[localPriceIdx]) };
            }
            if (latestChina && latestUS) break;
        }

        if (latestChina) {
            await env.EXCHANGE_KV.put('price:bigmac', JSON.stringify({
                chinaPrice: latestChina.price,
                usPrice: latestUS?.price || 5.69,
                date: latestChina.date,
                updatedAt: new Date().toISOString()
            }), { expirationTtl: 90 * 86400 });

            // 更新历史
            let history = [];
            try {
                const h = await env.EXCHANGE_KV.get('price:bigmac_history');
                if (h) history = JSON.parse(h);
            } catch (e) {}
            const existing = history.findIndex(h => h.date === latestChina.date);
            const entry = { date: latestChina.date, china: latestChina.price, us: latestUS?.price };
            if (existing >= 0) history[existing] = entry;
            else history.push(entry);
            if (history.length > 20) history = history.slice(-20);
            await env.EXCHANGE_KV.put('price:bigmac_history', JSON.stringify(history), { expirationTtl: 365 * 86400 });
        }
        return true;
    } catch (e) {
        console.warn('Big Mac update failed:', e.message);
        return false;
    }
}

// DeepSeek 联网查询商品价格
async function queryPricesFromDeepSeek(env) {
    const apiKey = env.DEEPSEEK_API_KEY;
    if (!apiKey) return null;

    const itemList = DEFAULT_ITEMS.map((item, i) => `${i + 1}. ${item.brand} ${item.name}`).join('\n');
    const prompt = `你是价格查询助手。查询以下商品在2025年中国大陆的标准原价（不要促销价、折扣价）。
每个商品只回答一个数字（人民币元），每行一个，按顺序对应。
如果不确定，回答你认为最接近的价格。

${itemList}`;

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 200,
                search_mode: 'web_search'
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const prices = content.split('\n').map(line => {
            const match = line.match(/[\d.]+/);
            return match ? parseFloat(match[0]) : null;
        }).filter(p => p !== null && p > 0);

        if (prices.length < 3) return null; // 至少查到 3 个

        const results = DEFAULT_ITEMS.map((item, i) => ({
            ...item,
            price: prices[i] || item.defaultPrice,
            source: prices[i] ? 'deepseek' : 'default'
        }));

        return results;
    } catch (e) {
        console.warn('DeepSeek price query failed:', e.message);
        return null;
    }
}

// 初始化物价（首次使用）
async function handlePriceInit(request, env) {
    // 检查是否已初始化
    const existing = await env.EXCHANGE_KV.get('price:items');
    if (existing) {
        return json({ ok: true, items: JSON.parse(existing), message: '物价数据已存在' });
    }

    // 尝试 DeepSeek 查询
    let items = await queryPricesFromDeepSeek(env);
    if (!items) {
        // DeepSeek 失败，使用默认价格
        items = DEFAULT_ITEMS.map(item => ({ ...item, price: item.defaultPrice, source: 'default' }));
    }

    // 存储基准价格
    const baseBigMac = await env.EXCHANGE_KV.get('price:bigmac');
    const bigMacPrice = baseBigMac ? JSON.parse(baseBigMac).chinaPrice : 24.40;

    const priceData = {
        items,
        bigMacBase: bigMacPrice,
        initDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };

    await env.EXCHANGE_KV.put('price:items', JSON.stringify(priceData), { expirationTtl: 365 * 86400 });

    return json({ ok: true, items });
}

// 获取当前物价
async function handlePriceCurrent(env) {
    let priceData = await env.EXCHANGE_KV.get('price:items');
    if (!priceData) {
        // 自动初始化
        const initResult = await handlePriceInit(null, env);
        const initData = await initResult.json();
        if (!initData.ok) return json({ error: '物价数据初始化失败' }, 500);
        priceData = await env.EXCHANGE_KV.get('price:items');
    }

    const data = JSON.parse(priceData);

    // 获取 Big Mac 当前价格
    const bigMacData = await env.EXCHANGE_KV.get('price:bigmac');
    let adjustmentFactor = 1;
    if (bigMacData) {
        const bm = JSON.parse(bigMacData);
        adjustmentFactor = bm.chinaPrice / (data.bigMacBase || bm.chinaPrice);
    }

    // 计算调整后的价格
    const items = data.items.map(item => ({
        ...item,
        currentPrice: Math.round(item.price * adjustmentFactor * 100) / 100,
        adjustmentFactor: Math.round(adjustmentFactor * 1000) / 1000
    }));

    return json({
        ok: true,
        items,
        adjustmentFactor: Math.round(adjustmentFactor * 1000) / 1000,
        lastUpdated: data.lastUpdated,
        bigMacBase: data.bigMacBase,
        bigMacCurrent: bigMacData ? JSON.parse(bigMacData).chinaPrice : null
    });
}

// 人工校准物价
async function handlePriceUpdate(request, env) {
    const body = await request.json();
    const { itemId, newPrice } = body;

    if (!itemId || !newPrice || newPrice <= 0) {
        return json({ error: '参数不完整' }, 400);
    }

    let priceData = await env.EXCHANGE_KV.get('price:items');
    if (!priceData) return json({ error: '物价数据未初始化' }, 404);

    const data = JSON.parse(priceData);
    const itemIndex = data.items.findIndex(i => i.id === itemId);
    if (itemIndex < 0) return json({ error: '商品不存在' }, 404);

    // 重新计算基准价格（去掉调整系数的影响）
    const bigMacData = await env.EXCHANGE_KV.get('price:bigmac');
    let adjustmentFactor = 1;
    if (bigMacData) {
        const bm = JSON.parse(bigMacData);
        adjustmentFactor = bm.chinaPrice / (data.bigMacBase || bm.chinaPrice);
    }

    data.items[itemIndex].price = Math.round(newPrice / adjustmentFactor * 100) / 100;
    data.items[itemIndex].source = 'manual';
    data.lastUpdated = new Date().toISOString();

    await env.EXCHANGE_KV.put('price:items', JSON.stringify(data), { expirationTtl: 365 * 86400 });

    return json({ ok: true, item: data.items[itemIndex] });
}
