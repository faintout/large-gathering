## 项目简介

`large-gathering` 是一个基于 Vue 3 + Vite 的前端示例项目，主要用来沉淀日常业务里常用的一些能力和组件，比如：

- 地图引擎防腐层封装（支持多地图切换）
- WebSocket 工具封装与在线调试页面
- 视频播放插件（支持 h264 / h265 / WebRTC）
- 日常工作中常用的一些可复用组件示例

项目更偏向「个人/团队内部组件实验场」，方便在这里先把方案和 Demo 跑通，再按需抽离到正式项目中。

## 技术栈

- **框架**：Vue 3
- **构建工具**：Vite
- **路由**：Vue Router 4（约定式路由，自动扫描 `src/views/**/index.vue`）
- **UI 组件库**：Element Plus
- **图表**：
  - Highcharts / Highstock
  - ECharts（通过 `vue-echarts` 封装为全局组件 `v-echarts`）
- **样式**：SCSS

## 本地开发

开发前确认本机已安装 Node.js（建议 18+）。

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 打包生产环境
npm run build

# 预览打包结果
npm run preview
```

默认使用 Vite 的开发服务器，启动后按终端提示的地址在浏览器中访问即可。

## 路由与页面结构

项目采用简单的约定式路由：

- 所有 `src/views/**/index.vue` 都会被自动注册为一个页面
- 路由路径为一级目录名，例如：
  - `src/views/workComponents/index.vue` → `/workComponents`
  - `src/views/mapACL/index.vue` → `/mapACL`
  - `src/views/webSocket/index.vue` → `/webSocket`
- 根路径 `/` 会自动重定向到扫描到的第一个页面

外层布局（`App.vue`）提供一个统一的壳：

- 左侧是根据路由自动生成的菜单
- 顶部显示当前页面标题和描述
- 右侧内容区域通过 `<router-view>` 渲染具体功能页面

## 主要功能模块简介

### 1. 工作常用组件（`/workComponents`）

- 一个组件示例集合页，上方是组件切换按钮，下方通过 `<component :is="...">` 动态渲染具体 Demo。
- 用于收集日常工作中经常会复用的 UI / 交互组件（如图表组件、卡片、列表等）。

### 2. 地图防腐层 Demo（`/mapACL`）

- 使用自封装的 `HTMap` 作为统一地图接口层。
- 支持在界面上切换不同地图引擎（腾讯地图 / MineMap / Mapbox）。
- 页面只关心通用配置（中心点、缩放、俯仰角等），引擎差异被隐藏在 `HTMap` 内部。

### 3. WebSocket 工具页（`/webSocket`）

- 基于封装好的 `socketUtil` 类，实现：
  - WebSocket 链接管理
  - 10 秒心跳 & 断线重连
  - 统一的 `onopen / onmessage / onerror / onclose` 回调
- 页面提供一个小工具：
  - 输入 WebSocket 地址，一键连接/断开
  - 输入 JSON 文本，点击发送
  - 下方实时显示发送/接收/错误/系统日志，便于调试接口

### 4. 视频播放插件页（`/videoPlayer`）

- 支持三种播放方式：
  - WebRTC
  - h264
  - h265
- 播放地址和类型通过 URL 参数传入，例如：

  - `?urlType=rtc&url=xxx`
  - `?urlType=h264&url=xxx`

- 页面内部会校验参数并根据类型选择对应的播放组件，同时对错误信息做了比较友好的提示。

### 5. 其他实验页面

- `threeJs3DRoom` 等页面用于三维场景和可视化效果的尝试，主要是实验性质，方便以后在实际业务中复用。

## 适用场景

- 团队内部讨论方案时，用来快速搭 Demo 验证可行性；
- 平时写到比较通用的工具类或组件，可以先丢到这里沉淀起来；
- 新同学可以通过这个项目，大致了解团队在地图、视频、WebSocket 等方向的常用封装方式。

## 注意事项

- 项目目前主要面向开发和 Demo 场景，并未按「正式业务系统」的标准去做完整的权限、国际化、异常监控等治理。
- 如需接入真实业务，建议将成熟的能力按模块抽出去，接入到具体项目中使用。

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
