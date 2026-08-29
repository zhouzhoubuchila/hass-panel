# Home OS Phase 0–8 实施与验收状态

更新日期：2026-08-30  
目标分支：`home-os-dev`

本文记录 `HOME_OS_CODEX_HANDOFF.md` 的实现证据、可重复验证命令和仍需外部信息的边界。它不代表已经覆盖稳定版 Add-on，也不把未连接的家庭数据描述为已联调。

## 总体状态

| 阶段 | 状态 | 当前证据 |
|---|---|---|
| Phase 0 | 已完成 | `docs/HOME_OS_ARCHITECTURE_AUDIT.md` 已审计 HA 通讯、路由、卡片、配置、后端和 Add-on 构建边界 |
| Phase 1 | 已实现 | 独立 Home OS Shell、五主页面、Legacy/Config 兼容路由、主题、桌面/平板/移动导航，继续复用 `HassConnect` |
| Phase 2 | 已实现 | 首页时间日期、真实天气/环境摘要、家庭状态、动态 Attention Center、家庭模式和 3D 户型主视图 |
| Phase 3 | 已实现，待真实实体联调 | 根据用户 99.91 m² D 户型图建立程序化 3D/2D 户型、房间与设备绑定、灯光及设备服务调用、映射 UI 和低性能降级 |
| Phase 4 | 已实现，Provider 可替换 | HA 天气优先、AQI/UV/降雨/日出日落、月相、农历/节气/黄历、出行建议和可配置舒适度 |
| Phase 5 | 已实现，待真实摄像头联调 | 人员、门窗、Presence、摄像头状态、近 24 小时摄像头/门铃事件、家电、电池、耗材、日程和待办 |
| Phase 6 | 已实现，待真实网络实体联调 | 优先识别指定 PVE 温度和主机 Ping 实体，并自动发现 PVE、HA、TP-Link、ImmortalWrt 和网络质量 |
| Phase 7 | 已实现，待完整能源实体联调 | 自动识别功率、电量和费用实体；无数据时明确显示“尚未配置能源数据”，没有生产 Mock 数据 |
| Phase 8 | 已实现 | 路由懒加载、Loading Skeleton、错误边界、Offline 提示、PWA、Kiosk、响应式、减少动态效果、2D/3D 降级和按需加载 3D/农历依赖 |

## 关键实现边界

- Home OS 位于 `frontend/src/home-os/`，没有重写 HA WebSocket/REST 层。
- 旧 Hass Panel 卡片墙和配置页保留在兼容路由中。
- 实体映射保存到版本兼容的 `homeOs` 配置命名空间，合并时保留未知字段。
- 3D Renderer 只消费 `floorplanBinding` 解析后的领域状态，未来替换 GLB 不需要重写 HA 逻辑。
- Energy、Homelab、Camera Event 等页面只显示 HA 当前提供的数据或明确空状态。
- Command Palette 排除锁、警报等高风险领域；允许的设备控制仍需要二次确认。

## 安全整改

- 删除仓库内固定 JWT `SECRET_KEY`。
- 优先读取 `HASS_PANEL_SECRET_KEY`；未配置时在持久化配置目录生成权限受限的 `.jwt_secret`。
- 数据库密码改为带随机盐的 bcrypt；旧 v1.4.0 密码在首次成功登录后自动升级。
- “记住密码”改为只保存用户名，并自动清理旧版浏览器存储中的明文密码。
- 上传、注册和全部 ONVIF 路由要求有效登录。
- 删除 ONVIF 的示例 IP 和 `admin/admin` 回退，不再将含凭据的流地址写入日志。
- CORS 默认同源；仅通过 `HASS_PANEL_CORS_ORIGINS` 显式允许开发来源。
- `.env`、`.env.local`、各环境本地覆盖文件和运行时数据目录均在 `.gitignore` 中；仓库只提交空值 `.env.example`。

首次启用新 JWT 密钥会让旧 Hass Panel 会话失效一次，需要重新登录；后续密钥保存在 `/config/hass-panel/.jwt_secret`，重启不会再次变化。

## 已执行验证

### 前端

```text
13 test suites passed
23 tests passed
production build compiled successfully
main bundle gzip: 341.92 kB
```

覆盖范围包括：环境模型、家庭模型与安防事件、能源、Homelab、Attention Center、家庭模式、Command Palette、户型绑定、户型配置和程序化 D 户型。

### 后端

```text
JWT secret tests: 3 passed
Python py_compile: passed
hard-coded secret/default camera credential scan: clean
```

本地捆绑 Python 没有安装完整 FastAPI/Passlib/TOML 依赖，因此完整后端启动测试必须在项目 Docker 镜像或后端虚拟环境中执行。Dockerfile 已声明这些运行依赖。

## 尚需外部信息或明确授权

以下项目不能通过猜测完成：

1. 真实摄像头实体与事件实体，用于 Camera/ONVIF 端到端联调。
2. 完整能源实体，用于功率、电量和费用口径确认。
3. 最终天气 Provider 与黄历 Provider；当前实现保持 HA 优先和 Adapter 可替换边界。
4. 正式 GLB/GLTF 模型；当前使用用户户型图生成的程序化 3D，并保留模型 URL 接口。
5. 每个房间最终 HA Entity 映射；当前支持安全自动发现和 UI 手动映射。
6. 墙面中控的精确分辨率，用于最终像素级验收。
7. PVE 独立开发实例或 HA 测试 Add-on 的访问方式，用于真实 HA 状态、服务调用、Ingress、PWA 和 Kiosk 联调。
8. 覆盖或新增生产 Add-on 的明确授权；开发流程不会主动替换当前稳定实例。

## 部署前最终门禁

- 在 `home-os-dev` 远端逐文件核对本地修改。
- 在独立开发实例构建镜像，不使用稳定版容器名、端口或配置卷。
- 使用低风险测试灯验证 `HA Entity → State Store → Binding → Visual → Service Call → State Update` 完整链路。
- 使用真实移动端、平板/墙面中控和桌面检查五主问题是否能在 3 秒内回答。
- 验证回滚路径后，才讨论新增或替换正式 Add-on。
