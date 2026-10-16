# iPad 能耗检查（只读，2026-10-16）

基线：`80e283a`。未修改动态背景、画质检测、同步轮询、宠物计时器或 3D 渲染策略。这里是代码与浏览器行为证据，未连接用户的实体 iPad，因此不能把候选因素说成已测定的发热占比或电池改善百分比。

## 优先排查项

| 优先级 | 证据 | 影响与建议（尚未实施） |
| --- | --- | --- |
| 高，启用动态背景时 | `src/components/backgrounds/AtmosphereLayer.jsx` 中多个 Canvas/WebGL 循环持续 requestAnimationFrame；部分 shader 普通模式 DPR 上限 2、antialias 开启，低性能模式仍继续绘制 | 前台静置仍持续用 CPU/GPU。提供真正静态背景/节能模式，闲置时暂停或降至 15–30fps，降低 DPR、粒子与抗锯齿；不变画面不要逐帧重绘 |
| 高，普遍存在 | `src/main.jsx` 的 silenceNow 定时器无条件每 2000ms setState；即使没有禁言条目也继续执行 | 大型 App 树反复调和。把倒计时移入小组件，只在有有效禁言且页面可见时计时，到期一次清理 |
| 中高 | `index.html` 自动检测仅以 CPU 核数、可用内存 API、GPU 名称、2 秒帧率判断；帧率低于 28 才增加信号 | “流畅”不能代表“低功耗”。iPad 未触发降级不等于无需减负；单独提供省电偏好，避免只凭一次跑分选择持续高画质 |
| 中，前台已配对设备 | `src/main.jsx` 活跃期每 3.5 秒查云时间戳，闲置每 8 秒；10 分钟完整拉取 | 网络与合并会唤醒 CPU。可进一步退避、合并请求，或评估服务端推送；须保持家长指令延迟目标。已有 visibilityState 保护，不是隐藏后持续全量下载 |
| 中，相关页面打开时 | `src/components/wonders/three/Wonder3DViewer.jsx` 持续 RAF，renderer/composer DPR 上限 2，含后处理 | 3D 展示打开时额外负担。静止按需渲染、降低后处理、统一节能档。组件在展厅关闭时卸载并取消 RAF，不认定为关闭后持续泄漏 |
| 次要/条件性 | `src/components/pet/PetFloatingButton.jsx` 活跃或已完成待领探险每秒更新；大量 CSS pulse/blur/shadow、天气/装饰动画 | 已完成探险无需秒级计时；暂停离屏动画，限制大面积模糊。CSS 动画也不能概括为“零开销” |

背景按 `type` 条件挂载，并非所有背景同时运行。选中背景传 `isActive=true`，没有应用层统一的闲置/遮挡暂停。WebKit 本身会在后台暂停 RAF/动画、节流计时器，不能据此断言锁屏后仍全速渲染。

`src/utils/platform.js` 的 iOS 检测只匹配 iPad/iPhone/iPod UA，桌面式 iPad UA 可能漏判。这是兼容性观察，不是本次认定的发热主因；低性能自动检测有独立路径。

## 动态观察

在基线生产构建、Chromium、强制低性能、未配动态背景/同步账号的测试页面中，以 React DevTools hook 和定时器包装记录前台静置：7 秒窗口内 2000ms 定时器触发 3 次，记录到 12 次 React root commit。三次计时器触发附近均出现 commit。其余 commit 来自其他组件，不能把全部归因于禁言，也不能换算成 iPad 功耗。没有修改基线业务代码。

## 现在可尝试的设置

在设置的性能配置中选择 **“始终开启”**，取消动态背景装备，避免将 3D 展厅长时间留在前台。该配置降低开销但不是彻底静态模式。添加到主屏幕不会自动消除网页里的持续渲染工作。

## 实机确认方法

保持相同亮度、网络、页面、温度和充电状态，分别测量当前设置、始终开启低性能、取消动态背景三个场景，各前台静置 10–15 分钟，再比较掉电和温升；另测打开 3D、探险倒计时、后台切回。通过 Safari Web Inspector 的 CPU/JavaScript、Layout/Rendering、Network 时间线定位持续工作，再决定哪一项优化最值得实施。CPU 时间线是能耗线索，不是电池功率计。

参考：
- [WebKit：How Web Content Can Affect Power Usage](https://webkit.org/blog/8970/how-web-content-can-affect-power-usage/)
- [WebKit：CPU Timeline in Web Inspector](https://webkit.org/blog/8993/cpu-timeline-in-web-inspector/)
