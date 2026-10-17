export const STAGING_SERVICES = Object.freeze({
    sync:'https://daka-sync-staging.2378385593.workers.dev',
    exchange:'https://daka-exchange-staging.2378385593.workers.dev',
    push:'https://daka-push-staging.2378385593.workers.dev',
});
const under=(host,domain)=>host===domain||host.endsWith(`.${domain}`);
export function deploymentEndpoints(mode,hostname=''){
    if(mode==='staging'){
        if(under(hostname,'daka-tool.top')||under(hostname,'daka-tool.vip'))throw new Error('测试构建禁止在正式域名运行。');
        return {...STAGING_SERVICES,wecom:'https://disabled.invalid'};
    }
    const proxy=under(hostname,'daka-tool.top')||under(hostname,'vercel.app')||['localhost','127.0.0.1'].includes(hostname);
    return {sync:'https://sync.daka-tool.top',exchange:proxy?'':'https://daka-exchange.2378385593.workers.dev',
        push:proxy?'':'https://daka-push.2378385593.workers.dev',wecom:proxy?'':'https://daka-wecom.2378385593.workers.dev'};
}
