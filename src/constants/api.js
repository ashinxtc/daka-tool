import {deploymentEndpoints} from '../../shared/deployment.js';
export const IS_STAGING=import.meta.env?.MODE==='staging';
const endpoints=deploymentEndpoints(IS_STAGING?'staging':'production',typeof window==='undefined'?'':window.location.hostname);
export const SYNC_WORKER_URL=endpoints.sync;
export const EXCHANGE_WORKER_URL=endpoints.exchange;
export const WECOM_API_URL=endpoints.wecom;
export const PUSH_WORKER_URL=endpoints.push;
// Same-origin /api/* belongs to exchange; push owns /api/push/*.
export const pushApiUrl=(operation,endpoint=PUSH_WORKER_URL)=>endpoint?`${endpoint}/api/${operation}`:`/api/push/${operation}`;
export const verificationPageUrl=page=>`${IS_STAGING?window.location.origin:'https://www.daka-tool.top'}/${page}`;
