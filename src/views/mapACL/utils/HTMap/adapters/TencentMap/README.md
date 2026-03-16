# 腾讯地图适配器 - 模块说明

入口为 `index.js`，所有能力均由此目录内模块提供，不再依赖外部 `TencentMap.js`。

## 目录结构

```
TencentMap/
├── index.js      # 主入口：组合 Core + 各 Manager
├── core/         # 核心：地图初始化、样式、视图模式、销毁
├── events/       # 事件：on / off / triggerEvent
├── control/      # 视图控制：setView、setCenter、setZoom、getBounds、fitBounds 等
├── popup/        # 弹窗：addPopup、removePopup
├── lines/        # 线：addLines
├── polygons/     # 多边形：addPolygons
├── cluster/      # 点聚合：addClusters
├── route/        # 路径规划：getRoute
├── markers/      # 点标记：addDomMarker、addMarkers、getMarkers、updateDOMMarkerPosition、getDOMMarkerPosition
├── utils/        # 校验与几何工具
└── README.md
```

## 使用方式

由 MapFactory 统一创建，对外接口不变：

```js
import TencentMap from '@/utils/HTMap/adapters/TencentMap/index.js'
// 或
import TencentMap from '@/utils/HTMap/adapters/TencentMap'
const map = new TencentMap(containerId, options)
```
