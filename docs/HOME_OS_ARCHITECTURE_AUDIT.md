# Home OS / Hass Panel v1.4.0 架构审计

审计日期：2026-08-30  
审计对象：`ha-china/hass-panel` 的公开 `v1.4.0` 标签源码  
源码归档 SHA-256：`3644A62B9B3CFDB5F77507E901927E17D145D17FD448F8DD001AAFC88B23AAAE`

## 1. 审计范围与边界

本次按 Phase 0 要求检查了：README、GPL-3.0 License、前后端依赖清单、前端入口与路由、Home Assistant 连接和实体使用方式、卡片注册与配置 UI、配置持久化、FastAPI 后端、SQLite 模型、Nginx/Supervisor/go2rtc、Docker、HA Add-on 清单和 GitHub Actions 构建流程。

当前 Codex 工作区没有用户自己的 Hass Panel Git 仓库，只有交接文档。为避免凭空推断，本审计使用公开 `v1.4.0` 标签的隔离副本；没有连接家庭 HA、没有读取真实实体注册表、没有修改或覆盖 HA 中的稳定 Add-on。后续进入 Phase 1 前，应把本报告落入用户的 GitHub Fork / `home-os-dev` 分支，或由用户提供实际开发仓库路径。

## 2. 执行摘要

结论：**无需也不应重写 Hass Panel 的 HA 通讯、认证、实体实时订阅和服务调用。** 最小侵入方案是在认证成功后的 `HassConnect` 内增加独立的 Home OS 应用壳层，把现有卡片墙作为 Legacy Dashboard 保留，并逐步建立 Home OS 自己的页面、领域模型、Provider 和 Floorplan 模块。

推荐边界：

```text
Browser
  └─ HashRouter / Theme / Language
      └─ Hass Panel 登录与初始化
          └─ @hakit/core HassConnect
              ├─ Home OS App Shell（新增）
              │   ├─ Home
              │   ├─ Environment
              │   ├─ Family
              │   ├─ Energy
              │   └─ Homelab
              ├─ Home OS Domain Layer（新增）
              │   ├─ Entity Binding
              │   ├─ Attention Center
              │   ├─ Provider Adapters
              │   └─ Floorplan Engine（Phase 3）
              └─ Legacy Hass Panel（保留）
                  ├─ Card Registry
                  ├─ Card Config
                  └─ Grid Layout

FastAPI / Nginx
  ├─ Hass Panel JWT 用户认证
  ├─ config.json 与历史版本
  ├─ SQLite（用户、HA 连接配置、能源实体）
  ├─ HA REST 能源聚合
  └─ go2rtc / ONVIF
```

Phase 1 只应建立 Shell、五页面路由、主题与响应式布局，并验证 HA 实体仍实时更新。3D、Attention 规则、天气/农历 Provider、能源与 Homelab 真实功能不应提前塞入 Phase 1。

## 3. 当前技术栈

### 3.1 前端

- React 19 + Create React App / CRACO。
- React Router 7，当前使用 `HashRouter`，适合 HA Ingress 下的静态前端回退。
- `@hakit/core` 5.0.2 是主要 HA 前端抽象；依赖清单同时包含 `home-assistant-js-websocket` 9.4.0，但业务代码没有直接创建 WebSocket 连接。
- Ant Design 5、Ant Design Mobile 5。
- Zustand 5 已声明为依赖，但当前业务代码没有建立 Home OS 级状态 Store。
- `react-grid-layout` 负责旧卡片墙布局。
- ECharts 用于历史/能源类图表。
- 已包含 `lunar-javascript`，可在后续农历 Provider 中复用，但不应直接耦合到页面。
- PWA Service Worker 已注册。

### 3.2 后端

- FastAPI + Uvicorn。
- SQLAlchemy + SQLite。
- JWT 作为 Hass Panel 自身用户会话。
- `aiohttp` / `requests` 访问 HA REST API。
- APScheduler 定时刷新能源缓存。
- go2rtc + ONVIF 用于摄像头流和 PTZ。
- Nginx 5123 提供前端并反代 `/api` 到 FastAPI 5124、`/go2rtc` 到 5125。
- Supervisor 管理 Nginx、FastAPI 和 go2rtc。

## 4. 启动、认证与 HA 实时连接

前端入口是 `frontend/src/index.js`，负责根字体缩放、React 挂载和 Service Worker 注册。

`frontend/src/App.js` 的当前启动顺序：

1. 调用公开的 `/api/common/init_info` 判断是否初始化。
2. 未初始化时进入 `#/initialize`。
3. 已初始化后检查浏览器中的 `hass_panel_token`。
4. 使用 Hass Panel JWT 调用 `/api/user_config/hass_config`。
5. 后端返回 HA URL 和 HA Token。
6. 前端以这两项配置挂载 `@hakit/core` 的 `HassConnect`。
7. 连接就绪后，页面内的 `useEntity`、`useWeather`、`useCamera`、`useHistory`、`useLogs`、`useHass` 自动消费 HA 状态和服务。

现有组件普遍通过 `useEntity(entityId)` 获取实时实体对象，并通过 `entity.service.*` 或 `useHass().callService()` 控制设备。例如灯、窗帘、空调、插座、脚本、PVE 按钮均复用同一层。这条链路正是 Home OS 应保留的核心资产。

### 应复用

- `HassConnect` 的连接生命周期和实体订阅。
- `useEntity` / `useWeather` / `useHistory` 等 Hook。
- `entity.service` 与 `callService` 控制能力。
- 初始化、登录、Hass Panel JWT、HA 连接配置加载流程。

### 不应在 Phase 1 改动

- 不直接改写 `home-assistant-js-websocket` 连接层。
- 不在 Home OS 页面重复创建第二条 HA WebSocket。
- 不把实体状态复制成另一个无法保持一致的全量 Store。
- 不改变现有 HA 实体、自动化、HomeKit 或通知服务。

## 5. 路由与导航现状

当前路由非常薄：

- `#/`：旧卡片墙 Home。
- `#/config`：卡片与全局配置。
- `#/login`：登录。
- `#/initialize`：首次初始化。

移动端 `Bottom` 只有“首页/配置”，桌面 `Sidebar` 代码存在但在 `App.js` 中被注释。现有 Home 组件自身还包含主题、语言、全屏、编辑、列数和配置入口，页面壳与页面业务高度耦合。

### Phase 1 路由建议

```text
/#/                   Home OS Home
/#/environment        Environment
/#/family             Family
/#/energy             Energy
/#/homelab            Homelab
/#/legacy             原 Hass Panel 卡片墙
/#/config             原配置管理（保留）
/#/login               原登录（保留）
/#/initialize          原初始化（保留）
```

根路径应切换到 Home OS；旧首页组件移动到语义清晰的 `LegacyDashboardPage`，而不是删除。

## 6. 卡片注册机制

当前不存在单一注册表。卡片类型至少在两处手工维护：

1. `frontend/src/pages/home/index.js`：静态 import、`CardComponents` 映射、默认高度和部分类型特例。
2. `frontend/src/pages/config/index.js`：`getCardTypes()` 内定义名称、图标、字段和默认值。

因此增加/改名卡片容易漏改其中一处。`frontend/src/components/index.js` 不是完整的注册中心，不能作为可靠入口。

### 建议

Phase 1 不重构全部卡片；只抽出兼容的 `legacy/cardRegistry.js`，让渲染映射和配置元数据逐步汇合。旧配置中的 `card.type` 必须保持不变，避免破坏已有 `config.json`。

## 7. 配置持久化

当前存在三种持久化位置：

### 7.1 服务端 JSON

`/api/user_config/config` 读写 `/config/hass-panel/user_configs/config.json`。保存前会备份旧配置，只保留最近 5 个版本。卡片、分组和全局背景配置均在此处。

保存配置还会解析 CameraCard，把流地址写入 `/config/hass-panel/go2rtc.yaml`，并重启 go2rtc。这意味着普通 UI 配置保存与摄像头基础设施存在副作用耦合。

### 7.2 浏览器 Local Storage

旧卡片布局、活动分组、主题、语言、Hass Panel JWT，以及“记住密码”数据保存在浏览器。布局键存在新旧两套命名，例如 `mobile-${groupId}-layouts` 与 `mobile-dashboard-layouts`，导入/导出逻辑也仍使用部分旧键。

### 7.3 SQLite

SQLite 存储：

- Hass Panel 用户。
- HA URL 与 HA Token。
- 能源统计使用的实体记录。

### Home OS 配置建议

不要把房间、实体映射、Attention 规则、Provider 配置继续塞入各 React 组件。新增版本化配置命名空间：

```json
{
  "schemaVersion": 1,
  "homeOs": {
    "rooms": [],
    "entityBindings": {},
    "attentionRules": [],
    "providers": {},
    "navigation": {}
  },
  "cards": []
}
```

Phase 1 只读取缺省 `homeOs`，不强制迁移、不覆盖旧字段；保存时必须保留未知字段。后续再决定将布局从 Local Storage 迁移到服务端。

## 8. 后端与 HA REST

大多数实时展示和控制直接在浏览器内通过 `@hakit/core` 完成。FastAPI 的 HA 代理目前主要承担能源历史聚合：

- `/api/hass/energy/statistics/{entity_id}`
- `/api/hass/energy/today/{entity_id}`
- `/api/hass/energy/daily/{entity_id}`

`HomeAssistantAPI` 从 SQLite 读取 HA URL/Token，调用 `/api/history/period` 等 HA REST API，并将能源结果缓存到文件。后台 Scheduler 约每 3500 秒刷新一次已登记能源实体。

Phase 1 不需要新增后端路由。天气、农历、黄历和 Homelab Provider 只有在 HA 实体不能满足需求、且密钥必须留在服务端时，才应新增后端 Adapter。

## 9. Add-on、Docker 与发布方式

### 容器流程

1. CI 使用 Node 22，在 `frontend/` 执行 `npm install --legacy-peer-deps` 和 `npm run build`。
2. Dockerfile 以 `ghcr.io/hassio-addons/base:17.1.0` 为基础。
3. 前端 `frontend/build` 复制到 `/app`。
4. 后端复制到 `/backend`。
5. Entry point 创建 `/config/hass-panel` 下的持久目录并启动 Supervisor。
6. Nginx 5123 支持 HA Ingress base path，并反代 FastAPI/go2rtc。

### HA Add-on

`hass-panel/config.json` 的 v1.4.0 配置启用 Ingress、host network、Home Assistant API，并支持 `aarch64`、`amd64`、`armv7`。正式版与 Beta 版清单独立。

### 开发要求

- 稳定 Add-on 保持原样。
- Fork 后使用 `home-os-dev` 分支。
- 独立开发实例使用不同容器名、端口和配置卷。
- 不使用原项目 `latest` 覆盖稳定版。
- Phase 1 CI 至少加入前端构建和基础路由测试，再构建开发镜像。

## 10. 现有代码复用、重构与禁区

### 10.1 直接复用

- `App.js` 中认证成功后挂载 `HassConnect` 的方式。
- ThemeContext 的 light/dark/system 三态能力。
- LanguageContext 的中英文框架。
- 现有 HA Hooks 和服务调用。
- 配置 API、备份机制和旧卡片配置格式。
- Nginx Ingress 处理、容器端口、Supervisor 与 Add-on 清单。
- Camera/go2rtc/ONVIF、能源 REST 聚合等已有后端能力。
- `LightOverviewCard/FloorPlan.js` 的实体控制思路可作需求参考，但它是 2D 图片叠层，不是未来 3D 引擎底座。

### 10.2 应渐进重构

- 1100 行的旧 Home 页面：拆为 Legacy 页面、布局 Hook、工具栏和卡片注册表。
- 1300 行的 Config 页面：后续将 card definitions 和 UI 拆开。
- 卡片注册的双重维护。
- 多套 Local Storage 布局键。
- 页面内直接处理设备领域规则的方式。
- 配置保存与 go2rtc 重启的强耦合。
- 根字体按屏幕宽度线性缩放：Home OS Shell 应改用 CSS tokens、`clamp()` 和断点，避免超宽/小屏字体失真。

### 10.3 绝对不要动或删除

- v1.4.0 旧 `card.type` 和现有用户配置兼容性。
- HA 实时连接与服务调用层。
- 登录/初始化的可用路径。
- `/config/hass-panel` 持久卷结构。
- HA Ingress 的 HashRouter/base-path/Nginx 回退机制。
- go2rtc/ONVIF 现有能力。
- 稳定 Add-on 镜像与用户当前实例。

## 11. 3D Floorplan 最佳落点

3D 不应放进旧 `LightOverviewCard`，也不应直接写在 Home 页面。建议结构：

```text
frontend/src/home-os/floorplan/
  components/
    FloorplanViewport.jsx
    FloorplanFallback.jsx
    RoomOverlay.jsx
    DeviceHotspot.jsx
  engine/
    rendererAdapter.js
    sceneLifecycle.js
    performanceProfile.js
  bindings/
    floorplanBindingStore.js
    resolveRoomState.js
    resolveDeviceAction.js
  model/
    floorplanSchema.js
  index.js
```

依赖方向必须是：页面 → Floorplan 公共接口 → Binding → HA Adapter。Renderer 不能直接到处调用 `useEntity`；由 Binding 层把已解析的房间状态传给渲染器。这样 GLB、2D fallback 和未来引擎替换不会影响业务规则。

Phase 1 仅放置无真实户型含义的 `FloorplanPlaceholder`；Phase 3 拿到户型/GLB 后再选择 Three.js 或 React Three Fiber，并单独做 bundle、WebGL 能力和低性能降级评估。

## 12. Phase 1 具体文件级修改计划

以下计划以 v1.4.0 为基线，控制在可运行、可回滚的最小范围。

### 12.1 新增目录与文件

```text
frontend/src/home-os/
  app/
    HomeOsAppShell.jsx
    HomeOsRoutes.jsx
    navigation.js
  components/
    AppHeader.jsx
    DesktopNavigation.jsx
    MobileNavigation.jsx
    PageState.jsx
  pages/
    HomePage.jsx
    EnvironmentPage.jsx
    FamilyPage.jsx
    EnergyPage.jsx
    HomelabPage.jsx
    LegacyDashboardPage.jsx
  floorplan/
    FloorplanPlaceholder.jsx
  styles/
    tokens.css
    shell.css
    responsive.css
  config/
    defaults.js
    schema.js
```

职责：

- `HomeOsAppShell.jsx`：只负责顶层布局、桌面/移动导航和 Outlet。
- `HomeOsRoutes.jsx`：声明五页面、Legacy、Config；不负责认证。
- `navigation.js`：单一导航定义，桌面和移动端复用。
- 五个页面文件：仅骨架、空状态和必要占位，不造生产假数据。
- `FloorplanPlaceholder.jsx`：明确标注“等待户型配置”，不绘制虚构户型。
- `tokens.css`：Home OS 颜色、间距、字号、层级变量，同时映射现有主题变量。
- `responsive.css`：Desktop、Tablet/Wall Panel、Mobile 三类布局。
- `config/schema.js`：为未来 `homeOs` 配置建立版本与缺省解析，不引入强制迁移。

### 12.2 修改现有文件

#### `frontend/src/App.js`

- 保留初始化、登录、`HassConnect` 和 Theme/Language Provider。
- 将连接成功后的内部 Routes 替换为 `HomeOsAppShell`/`HomeOsRoutes`。
- 不改 HA URL/Token 获取行为（安全整改另开变更）。
- 删除 `App.js` 对旧 Home 和 Bottom 的直接布局责任。

#### `frontend/src/routes.js`

- 迁移为兼容导出或由 `HomeOsRoutes.jsx` 替代。
- 保留 `/config`、`/login` 的路径兼容。
- 不一次性改成 BrowserRouter，避免破坏 Ingress。

#### `frontend/src/pages/home/index.js`

- 第一阶段只改名/包装为 Legacy Dashboard，不重写内部卡片逻辑。
- 保持所有卡片映射、布局键和配置读取行为。

#### `frontend/src/components/Bottom/index.js`

- 不再作为应用唯一移动导航；由 Home OS MobileNavigation 接管五主页面。
- Legacy/Config 作为“更多/设置”入口保留。

#### `frontend/src/components/Sidebar/index.js`

- 不直接复活旧 Sidebar；其路由激活逻辑可以参考，UI 由新 DesktopNavigation 实现。

#### `frontend/src/theme/variables.css` 与 `ThemeContext.js`

- 仅增加 Home OS token 映射和主题元数据。
- 保持 `light/dark/system` 的 Local Storage 兼容。

#### `frontend/src/i18n/zh.js`、`frontend/src/i18n/en.js`

- 增加五页面、Legacy、空状态和导航文案。
- 现有 key 不删除、不改名。

#### `frontend/src/index.js`、`frontend/src/index.css`

- 保留 PWA 注册。
- Phase 1 将 Home OS 新页面的字号从线性根字体缩放中解耦；旧卡片仍保持兼容。

#### `frontend/src/App.test.js`

- 删除 CRA 默认的 `learn react` 失效测试。
- 新增认证路由、五页面导航和 Legacy 入口测试。
- Mock `HassConnect`，验证 Shell 不需要真实 HA 即可测试；另加一个 Hook 假实体验证状态变化能传到页面。

### 12.3 Phase 1 不修改

- `backend/` 业务路由。
- Docker 端口和稳定 Add-on slug。
- go2rtc/ONVIF。
- 现有卡片配置 schema。
- 任何真实实体 ID。
- Three.js / React Three Fiber 依赖。

## 13. Phase 1 验收矩阵

| 验收项 | 验证方式 |
|---|---|
| 项目可构建 | Node 22，`npm install --legacy-peer-deps`，`npm run build` |
| 五页面可导航 | Desktop 与 Mobile 路由测试 + 手工检查 |
| HA 仍实时更新 | 开发 HA 实例中改变一个测试实体，页面同步更新 |
| HA 服务仍可调用 | 仅用低风险测试灯/Helper 验证一次服务调用 |
| 旧能力未破坏 | `/legacy` 打开原卡片墙；`/config` 可读原配置 |
| 空数据诚实显示 | Energy/Homelab 无映射时显示“尚未配置”，不出现 Mock 指标 |
| 主题 | light/dark/system 三态切换并刷新后保持 |
| 响应式 | 375px、768px、1024px 横屏、1440px；无横向溢出和导航遮挡 |
| Ingress | HA Ingress 下 Hash 路由刷新不 404 |
| 回滚 | 删除 Home OS 路由接线即可恢复旧 `/` 页面 |

## 14. Phase 1 前必须登记的风险

以下是 v1.4.0 上游代码现状，不代表已在本轮修改：

### P0：凭据与认证

- `backend/config/prod.toml` 和 `dev.toml` 含固定 JWT `SECRET_KEY`。不同安装共享密钥，必须改为环境变量/首次启动生成的持久 secret。
- HA Long-Lived Token 以明文存入 SQLite，并由 `/user_config/hass_config` 返回给浏览器以建立 WebSocket。短期兼容需保留，长期应评估 HA Ingress/Supervisor 授权或受控代理，至少限制暴露面并保护数据库备份。
- 登录“记住密码”会把原始密码写入 Local Storage；应改为只保存用户名/会话，不保存密码。
- 后端密码实际只比较前端 MD5 值，没有 bcrypt；任何拿到该值的人都可直接重放登录。
- `/api/auth/register` 是公开注册接口，未受初始化状态或管理员权限限制。

### P0：未鉴权与敏感配置

- `/api/common/upload` 未声明认证依赖。
- Camera 配置可能把 ONVIF 用户名/密码嵌入 `stream_url`，随后写入 config/go2rtc；保存时还会把完整 go2rtc 配置写日志。必须避免敏感 URL 进入日志、导出文件和前端不必要响应。

### P1：稳定性与可维护性

- 保存任何用户配置都会尝试重启 go2rtc；非摄像头配置失败也可能被这一副作用阻断。
- `HomeAssistantAPI` 初始化时同步请求 HA，Token 检查失败会把数据库中的 Token 清空；瞬时网络故障可能被误判为 Token 无效。
- Energy Scheduler 在未配置实体时持续记录错误；应把“未配置”作为正常状态。
- 前端和后端现有测试基本是失效模板/遗留代码，不能形成回归保护。
- Nginx 同时允许任意 Origin，并启用 credentials；需要按实际 Ingress/独立部署来源收紧。

安全整改建议拆成独立的小提交，并在每次变更后验证登录、Ingress、HA 实时连接和摄像头，不要与 Home OS 视觉重构混成一个大提交。

## 15. 推荐实施顺序

1. 将 v1.4.0 Fork 到用户仓库，建立 `home-os-dev`。
2. 把本审计文档提交到仓库 `docs/HOME_OS_ARCHITECTURE_AUDIT.md`。
3. 建立可重复的基线构建与最小 smoke test。
4. 先处理会直接影响开发环境安全的 P0 项，保持行为兼容。
5. 按第 12 节完成 Phase 1 Shell。
6. 在 PVE 独立容器/端口部署，不覆盖现有 Add-on。
7. 完成验收矩阵后再进入 Phase 2。

## 16. 最终判断

Hass Panel v1.4.0 足以作为 Home OS 的底层：它已经解决了 HA 实时连接、实体 Hook、服务调用、用户初始化、卡片配置、摄像头和 Add-on 打包。最合适的方案不是重写，而是**在 `HassConnect` 内新增清晰的 Home OS 应用层，并把旧卡片墙降级为兼容工具页**。

Phase 1 的成功标准不是页面“看起来完成”，而是：五页面骨架可用、三端导航正确、主题稳定、真实 HA 状态持续更新、旧卡片与配置仍可访问、没有任何虚构生产数据，并且可以用一个小回滚撤销 Home OS 路由接线。
