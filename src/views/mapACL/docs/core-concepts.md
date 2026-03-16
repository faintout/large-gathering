# 核心概念

本文档将帮助您理解 HTMap 的核心设计理念和架构原则。

## 什么是防腐层？

防腐层（Anti-Corruption Layer, ACL）是一种软件设计模式，用于隔离不同系统或模块之间的差异。HTMap 作为地图防腐层，在您的业务代码和底层地图引擎之间建立了一个隔离层。

### 为什么需要防腐层？

```
❌ 没有防腐层的问题：
业务代码 ←→ 腾讯地图 API（强耦合）
  ↓
当需要切换到四维图新时，需要大量修改业务代码

✅ 使用防腐层的优势：
业务代码 ←→ HTMap ←→ 腾讯地图 / 四维图新 / MapboxGL
  ↓
业务代码无需修改，只需修改配置即可切换引擎
```

### 核心优势

1. **隔离变化** - 底层地图 API 的变化不影响业务代码
2. **统一接口** - 不同地图引擎使用相同的 API 调用
3. **灵活切换** - 轻松在不同地图引擎之间切换
4. **降低成本** - 减少因地图引擎切换带来的开发成本

## 架构设计

HTMap 采用分层架构设计，每一层都有明确的职责。

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application Layer)                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Vue 组件       │  │  React 组件     │  │  其他应用... │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  HTMap 防腐层 (HTMap Layer)                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    HTMap 主入口                         │ │
│  │  • 统一接口封装                                        │ │
│  │  • 方法路由分发                                        │ │
│  │  • 生命周期管理                                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               功能类 (Classes)                          │ │
│  │  Markers | Lines | Clusters | Polygons | Popup         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                适配器层 (Adapter Layer)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  BaseAdapter 基类                       │ │
│  │  • 参数验证和格式转换                                   │ │
│  │  • 通用功能实现                                         │ │
│  │  • 抽象方法定义                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ TencentMap  │  │  MineMap    │  │  MapboxGL   │        │
│  │    适配器    │  │   适配器     │  │   适配器     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                地图引擎层 (Engine Layer)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 腾讯地图SDK  │  │ 四维图新SDK  │  │ MapboxGL SDK│        │
│  │   (TMap)    │  │  (MineMap)  │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 各层职责

#### 1. 应用层 (Application Layer)
- **职责：** 业务逻辑实现
- **特点：** 只依赖 HTMap 接口，不关心底层引擎
- **示例：** Vue/React 组件中的地图功能

#### 2. HTMap 防腐层 (HTMap Layer)
- **职责：** 提供统一的地图操作接口
- **特点：** 
  - 统一的方法调用
  - 统一的参数格式
  - 统一的事件处理
  - 统一的返回值

#### 3. 适配器层 (Adapter Layer)
- **职责：** 将统一接口转换为各引擎的原生 API
- **特点：**
  - 参数验证和转换
  - 引擎特性适配
  - 错误处理统一

#### 4. 地图引擎层 (Engine Layer)
- **职责：** 提供原生地图功能
- **特点：** 不同引擎的原生 SDK

## 适配器模式

HTMap 使用适配器模式来适配不同的地图引擎。

### 适配器模式原理

```javascript
// BaseAdapter 定义统一接口
class BaseAdapter {
  // 统一的方法定义
  setCenter(center) {
    // 参数验证
    const validCenter = this._validateCenter(center)
    // 调用子类实现
    this._setCenter(validCenter)
  }
  
  // 抽象方法，由子类实现
  _setCenter(center) {
    throw new Error('子类必须实现 _setCenter 方法')
  }
}

// TencentMap 适配器
class TencentMap extends BaseAdapter {
  _setCenter(center) {
    // 调用腾讯地图原生 API
    this.map.setCenter(new TMap.LatLng(center[1], center[0]))
  }
}

// MineMap 适配器
class MineMap extends BaseAdapter {
  _setCenter(center) {
    // 调用四维图新原生 API
    this.map.setCenter(center)
  }
}
```

### 适配器的优势

1. **参数验证统一** - 所有引擎使用相同的参数验证逻辑
2. **错误处理统一** - 统一的错误提示和处理
3. **扩展性强** - 新增引擎只需实现 BaseAdapter 接口
4. **维护性好** - 修改验证逻辑只需修改基类

## 设计原则

HTMap 遵循以下软件设计原则：

### 1. 单一职责原则 (SRP)

每个模块只负责一个功能：

- **HTMap 主类** - 只负责接口路由和实例管理
- **Markers 类** - 只负责标记点管理
- **Lines 类** - 只负责线条管理
- **适配器** - 只负责引擎适配

```javascript
// ✅ 好的设计：职责单一
class Markers {
  // 只处理标记点相关功能
  addGeometries() { ... }
  removeGeometries() { ... }
  updateMarkersGeometries() { ... }
}

// ❌ 不好的设计：职责混乱
class MapManager {
  // 混合了多种功能
  addMarker() { ... }
  addLine() { ... }
  addPolygon() { ... }
  setCenter() { ... }
}
```

### 2. 开闭原则 (OCP)

对扩展开放，对修改封闭：

```javascript
// ✅ 新增地图引擎无需修改现有代码
class MapFactory {
  static createMap(engine, options) {
    switch(engine) {
      case 'tencent': return new TencentMap(options)
      case 'minemap': return new MineMap(options)
      case 'mapbox': return new MapboxGL(options)
      // 新增引擎：只需添加新的 case
      case 'newengine': return new NewEngine(options)
    }
  }
}
```

### 3. 依赖倒置原则 (DIP)

高层模块不依赖低层模块，都依赖抽象：

```
应用代码
   ↓ (依赖)
HTMap 接口 (抽象)
   ↓ (实现)
各引擎适配器
```

### 4. 接口隔离原则 (ISP)

客户端不应依赖它不需要的接口：

```javascript
// ✅ 接口分离，按需使用
const markers = new HTMap.Markers({ ... })  // 只用标记点功能
const lines = new HTMap.Lines({ ... })      // 只用线条功能

// ❌ 接口臃肿
const allFeatures = new HTMap.AllFeatures({ 
  markers: { ... },
  lines: { ... },
  polygons: { ... }
  // 即使只需要标记点，也要传递所有配置
})
```

### 5. 里氏替换原则 (LSP)

子类可以替换父类而不影响程序正确性：

```javascript
// 所有适配器都可以替换使用
let adapter = new TencentMap(options)
adapter.setCenter([116.397128, 39.916527])

// 切换引擎不影响调用方式
adapter = new MineMap(options)
adapter.setCenter([116.397128, 39.916527])  // 相同的调用方式
```

## 核心组件

### 1. MapFactory 工厂类

负责根据引擎类型创建相应的地图实例。

```javascript
// 位置：src/utils/HTMap/core/MapFactory.js
class MapFactory {
  static createMap(containerId, engine, options) {
    // 检查引擎是否支持
    if (!isEngineSupported(engine)) {
      throw new Error(`不支持的地图引擎: ${engine}`)
    }
    
    // 创建对应的适配器实例
    switch (engine.toLowerCase()) {
      case 'tencent':
        return new TencentMap(containerId, options)
      case 'minemap':
        return new MineMap(containerId, options)
      case 'mapbox':
        return new MapboxGL(containerId, options)
      default:
        throw new Error(`不支持的地图引擎: ${engine}`)
    }
  }
}
```

**职责：**
- 引擎类型验证
- 实例创建
- 配置传递

### 2. 配置管理

HTMap 提供多层配置管理：

```javascript
// 引擎配置 (engineConfig.js)
export const engineConfig = {
  tencent: {
    id: 'tencent',
    name: '腾讯地图',
    supported: true,
    status: 'active'
  }
  // ...
}

// SDK 配置 (sdkConfig.js)
export const sdkConfig = {
  tencent: {
    js: 'https://map.qq.com/api/gljs?v=1.exp&key=YOUR_KEY',
    css: 'https://map.qq.com/api/gljs?v=1.exp',
    key: 'YOUR_KEY'
  }
  // ...
}

// 默认配置 (defaultConfig.js)
export const defaultConfig = {
  center: [116.397128, 39.916527],
  zoom: 12,
  minZoom: 3,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
}
```

### 3. 功能类

HTMap 提供以下功能类：

| 功能类 | 说明 | 主要方法 |
|-------|------|---------|
| `Markers` | 标记点管理 | `addGeometries`, `removeGeometries`, `updateMarkersGeometries` |
| `Lines` | 线条管理 | `addGeometries`, `removeGeometries`, `getTotalLength` |
| `Clusters` | 点位聚合 | `addToMap`, `removeClusters`, `on`, `off` |
| `Polygons` | 多边形管理 | `addGeometries`, `removeGeometries`, `updatePolygonsGeometries` |
| `Popup` | 弹窗管理 | `setLngLat`, `setContent`, `removePopup` |

每个功能类都遵循相同的设计模式：

```javascript
class FeatureClass {
  constructor(options) {
    // 1. 参数验证
    this._validateOptions(options)
    
    // 2. 数据标准化
    this._normalizeData()
    
    // 3. 添加到地图
    this.addToMap()
  }
  
  // 统一的方法命名
  addGeometries() { }
  removeGeometries() { }
  updateGeometries() { }
  setVisible() { }
  getVisible() { }
  on() { }
  off() { }
}
```

## 数据流转

### 1. 地图初始化流程

```
用户代码
  ↓
new HTMap('map', { engine: 'tencent', ... })
  ↓
HTMap.init()
  ↓
检查并加载 SDK (sdkConfig)
  ↓
MapFactory.createMap()
  ↓
创建 TencentMap 适配器
  ↓
调用腾讯地图原生 API
  ↓
返回地图实例
```

### 2. 添加标记点流程

```
用户代码
  ↓
new HTMap.Markers({ map, geometries, styles })
  ↓
Markers 构造函数
  ↓
验证和标准化数据
  ↓
调用 map.addMarkers()
  ↓
适配器转换参数
  ↓
调用引擎原生 API
  ↓
返回标记点实例
```

### 3. 事件处理流程

```
用户绑定事件
  ↓
markers.on('click', callback)
  ↓
等待标记点创建完成
  ↓
调用底层适配器的 on 方法
  ↓
适配器绑定引擎原生事件
  ↓
事件触发时调用 callback
```

## 扩展开发

### 添加新的地图引擎

如果您需要支持新的地图引擎，按以下步骤操作：

#### 1. 创建适配器

```javascript
// src/utils/HTMap/adapters/NewEngine.js
import BaseAdapter from './BaseAdapter.js'

export default class NewEngine extends BaseAdapter {
  constructor(containerId, options) {
    super(containerId, options)
    this.init()
  }
  
  // 实现初始化方法
  init() {
    // 创建地图实例
    this.map = new NewEngineSDK.Map({
      container: this.containerId,
      center: this.options.center,
      zoom: this.options.zoom
    })
  }
  
  // 实现必需的抽象方法
  _setCenter(center) {
    this.map.setCenter(center)
  }
  
  _getCenter() {
    return this.map.getCenter()
  }
  
  // ... 实现其他必需方法
}
```

#### 2. 注册到工厂

```javascript
// src/utils/HTMap/core/MapFactory.js
import NewEngine from '../adapters/NewEngine.js'

class MapFactory {
  static createMap(containerId, engine, options) {
    switch (engine.toLowerCase()) {
      case 'newengine':
        return new NewEngine(containerId, options)
      // ... 其他引擎
    }
  }
}
```

#### 3. 添加引擎配置

```javascript
// src/utils/HTMap/config/engineConfig.js
export const engineConfig = {
  newengine: {
    id: 'newengine',
    name: '新引擎',
    supported: true,
    status: 'active'
  }
}
```

#### 4. 添加 SDK 配置

```javascript
// src/utils/HTMap/config/sdkConfig.js
export const sdkConfig = {
  newengine: {
    js: 'https://cdn.newengine.com/sdk.js',
    css: 'https://cdn.newengine.com/sdk.css',
    key: 'YOUR_KEY'
  }
}
```

## 最佳实践

### 1. 统一错误处理

```javascript
try {
  const map = new HTMap('map', config)
  await map.init()
} catch (error) {
  console.error('地图初始化失败:', error.message)
  // 显示友好的错误提示
}
```

### 2. 生命周期管理

```javascript
// 组件销毁时清理资源
onBeforeUnmount(() => {
  if (markers) markers.removeMarkers()
  if (lines) lines.removeLines()
  if (map) map.destroy()
})
```

### 3. 事件解绑

```javascript
// 使用命名函数便于解绑
const handleClick = (e) => {
  console.log('点击事件', e)
}

markers.on('click', handleClick)

// 不需要时解绑
markers.off('click', handleClick)
```

### 4. 按需加载

```javascript
// 只创建需要的功能
if (needMarkers) {
  markers = new HTMap.Markers({ ... })
}

if (needLines) {
  lines = new HTMap.Lines({ ... })
}
```

## 总结

HTMap 通过以下设计实现了高质量的防腐层：

✅ **分层架构** - 清晰的职责划分  
✅ **适配器模式** - 灵活的引擎适配  
✅ **设计原则** - 遵循 SOLID 原则  
✅ **统一接口** - 一致的 API 设计  
✅ **扩展性强** - 易于添加新引擎  

---

**下一步：**
- [地图初始化与配置 →](./initialization.md)
- [地图基础操作 →](./map-operations.md)
- [标记点功能 →](./markers.md)

