# 独立测试后端部署（尚未部署）

这三个配置仅用于新建测试 Worker，不能替换正式 Worker 的配置。KV ID 来自账户管理员提供的完整截图。它们不是密钥。

| Worker 名称 | 配置文件 | KV |
| --- | --- | --- |
| daka-sync-staging | sync-staging.wrangler.json | DAKA_SYNC_STAGING |
| daka-exchange-staging | exchange-staging.wrangler.json | DAKA_EXCHANGE_STAGING |
| daka-push-staging | push-staging.wrangler.json | DAKA_PUSH_STAGING |

同步 Worker 的 SQLite Durable Object 属于测试 Worker 自己，不绑定正式服务的对象。另两个 Worker 的 SYNC_SERVICE 只绑定 daka-sync-staging。无正式域名路由，无定时任务；这样不会因部署而自动向用户发通知。测试推送仍只能向专门测试订阅手动触发。

测试同步配置 active / enforced / preview 仅供空环境：匿名访问拒绝，家庭必须使用测试激活凭据建立。不要把这组开关复制到生产，也不要导入真实家庭数据。

## 部署前本地检查

```sh
node --test tests/deployment-boundaries.test.js
npx wrangler@4.151.1 deploy --dry-run --config sync-staging.wrangler.json
npx wrangler@4.151.1 deploy --dry-run --config exchange-staging.wrangler.json
npx wrangler@4.151.1 deploy --dry-run --config push-staging.wrangler.json
```

## Cloudflare Git 部署字段（配置分支推送后才能操作）

连接 ashinxtc/daka-tool，使用包含这些文件的测试分支，根目录为仓库根目录。Worker 名称必须与上表严格一致。每个 Worker 分别填写部署命令：

```sh
npx wrangler@4.151.1 deploy --config sync-staging.wrangler.json
npx wrangler@4.151.1 deploy --config exchange-staging.wrangler.json
npx wrangler@4.151.1 deploy --config push-staging.wrangler.json
```

先完成同步服务部署，再部署兑换与推送。不要在现有 daka-sync、daka-exchange、daka-push 项目里更改 Git 连接或部署命令。前端 npm run build 不是 Worker 的部署命令。

独立生成测试 secrets：同步需要 AUTH_BOOTSTRAP_SECRET；同步与推送需要相同的 PUSH_SERVICE_SECRET（至少 32 字符）；推送需要独立测试 VAPID_PUBLIC_KEY、VAPID_PRIVATE_KEY_HEX；兑换与推送的 OPERATIONS_TOKEN 各自独立。仅在 Cloudflare secret 输入或安全 CLI 中填写，不能发到聊天、写入源码或使用正式 VAPID 私钥。缺少 secret 时相关功能拒绝运行，不视为验收通过。

官方配置说明：https://developers.cloudflare.com/workers/ci-cd/builds/configuration/

## 阻塞项与验收范围

本批仅准备后端配置和修复推送代理路由。现有前端仍有正式同步地址、兑换核验地址、二维码链接、推送点击地址等硬编码，不能直接把普通 PR 预览当成隔离测试前端。必须统一这些入口、增加独立测试构建与网络隔离验证后，才能向用户提供测试入口。

测试 cron 暂时关闭；后续定时提醒验收必须在仅有测试订阅的环境中单独开启并记录结果。dry-run 仅证明打包及配置解析，不证明真实 KV 权限、DO 创建、服务绑定、设备授权或推送到达。

三项发布门槛仍按 docs/push-and-release.md 执行；准备这些文件不代表生产发布获准。
