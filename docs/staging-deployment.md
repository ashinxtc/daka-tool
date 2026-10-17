# 独立测试环境部署

## 2026-10-17 部署进度

三个 staging Worker 已从 `fix/staging-environment` 部署成功，KV 与服务绑定已通过 Cloudflare API 核对。测试密钥已独立生成并写入 Workers secrets；没有复用正式密钥。独立前端 `https://daka-tool-staging.pages.dev` 已完成首次 Git 构建，使用 `npm run build:staging`，输出目录 `dist-staging`，只跟踪测试分支。

初次同步部署失败原因：旧构建仍读取 `main`，该分支没有 staging 配置。修正方式是为正确分支发起新构建，而非重试旧构建。

已将正式分支 `4079a3f` 的逆风翻盘安全日改动纳入待发布版本，并补充跨设备安全日期合并、旧契约兼容、刷新后不重复退款及次日惩罚回归用例。正式服务尚未升级；真实数据迁移核对、物理设备推送到达及最终回归仍是发布门槛。

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

连接 ashinxtc/daka-tool，分支选择 fix/staging-environment，根目录为仓库根目录。Worker 名称必须与上表严格一致。每个 Worker 分别填写部署命令：

```sh
npx wrangler@4.151.1 deploy --config sync-staging.wrangler.json
npx wrangler@4.151.1 deploy --config exchange-staging.wrangler.json
npx wrangler@4.151.1 deploy --config push-staging.wrangler.json
```

先完成同步服务部署，再部署兑换与推送。不要在现有 daka-sync、daka-exchange、daka-push 项目里更改 Git 连接或部署命令。前端 npm run build 不是 Worker 的部署命令。

独立生成测试 secrets：同步需要 AUTH_BOOTSTRAP_SECRET；同步与推送需要相同的 PUSH_SERVICE_SECRET（至少 32 字符）；推送需要独立测试 VAPID_PUBLIC_KEY、VAPID_PRIVATE_KEY_HEX；兑换与推送的 OPERATIONS_TOKEN 各自独立。仅在 Cloudflare secret 输入或安全 CLI 中填写，不能发到聊天、写入源码或使用正式 VAPID 私钥。缺少 secret 时相关功能拒绝运行，不视为验收通过。

官方配置说明：https://developers.cloudflare.com/workers/ci-cd/builds/configuration/

## 阻塞项与验收范围

前端已提供独立 staging 构建：同步、配对、兑换、推送使用 shared/deployment.js 中固定的三个测试 Worker 地址。核验二维码留在当前测试站；通知点击只允许订阅所属站点。测试版拒绝在正式 daka-tool.top / daka-tool.vip 域名下启动，防止误用正式站的本地数据。

普通 npm run build / 普通 PR 预览仍是正式服务配置，不能充当独立测试入口。必须单独新建前端项目和域名，不可沿用正式项目设置。不要在测试站导入真实备份或输入正式家庭配对凭据。

## 独立测试前端（在测试 Worker 部署后）

可在 Cloudflare Pages 创建独立 Git 项目。此处的 Production branch 是新测试项目的发布分支，不是现有正式网站的 main：

| 字段 | 值 |
| --- | --- |
| 项目名 | daka-tool-staging（如已占用，选择新的测试名称） |
| 仓库 | ashinxtc/daka-tool |
| 分支 | fix/staging-environment |
| 构建命令 | npm run build:staging |
| 输出目录 | dist-staging |
| 根目录 | 仓库根目录 |
| Node 版本 | 22 |
| 域名 | 新项目自己的 pages.dev 地址；不绑定正式域名 |

Vercel 替代方案：独立新项目使用 vercel.staging.json，例如 CLI --local-config vercel.staging.json；不得覆盖正式 vercel.json 或把独立项目绑定到正式域名。测试构建不继承正式服务的重写规则。

每个测试页面底部都有红色测试标识；CSP connect-src 只允许本站和三个测试后端，阻止向正式同步服务、企业微信、AI、天气等外部服务发请求。外部集成暂不在该环境验收，相关失败提示属预期；后续如需验证，应先建立各自独立测试集成。测试版目前直接请求 workers.dev；如果设备网络不可达，需要配置独立测试代理或测试 API 域名，不能回退到正式地址。

验证命令：npm run test:staging（先构建，再用 Chromium 和 WebKit 检查主程序、家长页、配对页和旧兑换核验页的请求地址，以及 CSP 阻断正式写入）。该测试拦截网络，绝不向真实服务写入。正式构建仍需通过 npm run test:all。

Pages 官方说明：https://developers.cloudflare.com/pages/configuration/build-configuration/

测试 cron 暂时关闭；后续定时提醒验收必须在仅有测试订阅的环境中单独开启并记录结果。dry-run 仅证明打包及配置解析，不证明真实 KV 权限、DO 创建、服务绑定、设备授权或推送到达。

三项发布门槛仍按 docs/push-and-release.md 执行；准备这些文件不代表生产发布获准。

## 扣款通知 CI 失败诊断

PR #12 的 GitHub Actions 38997337041 失败轨迹显示：进入主程序后约 4.8 秒首次同步 GET 才返回；原通知断言从点击起只有 5 秒，失败快照已包含第一条通知、事由“授权扣款甲”、扣款 10 和结余 90。测试现在显式等待该家庭首次同步成功，再使用原 5 秒断言检查通知。未增加通知断言 timeout，未跳过第二条、刷新恢复、35 元宝总扣款、65 结余和撤销身份检查。此改动解决的是测试前置条件的时序，不能据此宣称物理 iPad 或线上云端已经验收。
