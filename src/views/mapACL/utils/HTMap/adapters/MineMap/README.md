# MineMap 模块化架构

## 概述

MineMap 已成功拆分为模块化架构，提高了代码的可维护性和可扩展性。新的架构将原本的单一文件拆分为多个功能模块，每个模块负责特定的功能。

## 目录结构

```
src/utils/HTMap/adapters/MineMap/
├── index.js                    # 主入口文件，整合所有功能模块
├── core/                       # 核心功能模块
│   └── index.js               # 地图初始化、基础配置、事件管理等核心功能
├── markers/                    # 标记点功能模块
│   └── index.js               # 标记点管理、创建、事件处理等
├── popup/                      # 气泡功能模块
│   └── index.js               # 气泡创建、管理、样式处理等
├── infowindow/                 # 信息窗口功能模块
│   └── index.js               # 信息窗口创建、管理、拖拽等
├── lines/                      # 线条功能模块
│   └── index.js               # 线条管理、创建、样式处理等
├── cluster/                    # 聚合功能模块
│   └── index.js               # 聚合管理、创建、样式处理等
├── polygons/                   # 多边形功能模块
│   └── index.js               # 多边形管理、创建、样式处理等
├── state/                      # 地图状态功能模块
│   └── index.js               # 地图状态管理、中心点、缩放、平移等
├── events/                     # 地图事件功能模块
│   └── index.js               # 地图事件管理、监听器、节流防抖等
├── utils/                      # 工具函数模块
│   └── index.js               # 坐标转换、参数验证等工具函数
└── README.md                   # 本文档
```

## 模块说明

### 1. 核心模块 (core/index.js)
- **功能**: 地图初始化和基础配置
- **包含**: 
  - 地图实例创建和配置
  - 样式类型设置
  - 地图销毁

### 2. 标记点模块 (markers/MarkerManager.js)
- **功能**: 标记点管理
- **包含**:
  - 单个标记点创建
  - 批量标记点创建
  - 标记点事件处理
  - 拖拽功能支持
  - 样式管理

### 3. 气泡模块 (popup/PopupManager.js)
- **功能**: 气泡管理
- **包含**:
  - 气泡创建和显示
  - 气泡样式处理
  - 气泡事件绑定
  - 多种内容类型支持

### 4. 信息窗口模块 (infoWindow/InfoWindowManager.js)
- **功能**: 信息窗口管理
- **包含**:
  - 信息窗口创建和显示
  - 拖拽功能
  - 内容管理
  - 事件处理

### 5. 工具模块 (utils/coordinateUtils.js)
- **功能**: 通用工具函数
- **包含**:
  - 坐标格式解析和转换
  - 参数验证
  - 偏移量处理
  - 几何数据标准化

## 使用方式

### 基本使用
```javascript
import MineMap from '@/components/MineMap/index.js'

// 创建地图实例
const map = new MineMap('mapContainer', {
  center: [114.884094, 40.8119],
  zoom: 15,
  styleType: 'black'
})

// 添加标记点
const marker = map.addMarker({
  lngLat: [114.884094, 40.8119],
  content: '标记点内容'
})

// 添加气泡
const popup = map.addPopup({
  lngLat: [114.884094, 40.8119],
  content: '气泡内容'
})
```

### 向后兼容
原有的使用方式完全兼容，无需修改现有代码：

```javascript
import MineMap from '@/utils/HTMap/adapters/MineMap.js'

// 原有代码无需修改
const map = new MineMap('mapContainer', options)
```

## 优势

### 1. 模块化设计
- **单一职责**: 每个模块只负责特定功能
- **低耦合**: 模块间依赖关系清晰
- **高内聚**: 相关功能集中在同一模块

### 2. 可维护性
- **代码组织**: 功能按模块分类，便于查找和修改
- **独立开发**: 不同模块可以独立开发和测试
- **版本控制**: 模块级别的版本管理

### 3. 可扩展性
- **新功能**: 可以轻松添加新的功能模块
- **功能增强**: 可以独立增强特定模块的功能
- **插件化**: 支持插件式扩展

### 4. 性能优化
- **按需加载**: 可以按需导入特定模块
- **代码分割**: 支持代码分割和懒加载
- **内存管理**: 更好的内存使用和垃圾回收

## 扩展指南

### 添加新功能模块

1. **创建模块目录**
   ```bash
   mkdir src/components/MineMap/newFeature
   ```

2. **创建管理器类**
   ```javascript
   // src/components/MineMap/newFeature/NewFeatureManager.js
   export default class NewFeatureManager {
     constructor(mapInstance) {
       this.map = mapInstance.map
     }
     
     // 实现功能方法
   }
   ```

3. **在主入口文件中集成**
   ```javascript
   // src/components/MineMap/index.js
   import NewFeatureManager from './newFeature/NewFeatureManager.js'
   
   export default class MineMap extends MineMapCore {
     constructor(containerId, options) {
       super(containerId, options)
       this.newFeatureManager = new NewFeatureManager(this)
     }
     
     // 添加公共方法
     addNewFeature(options) {
       return this.newFeatureManager.addNewFeature(options)
     }
   }
   ```

### 修改现有模块

1. **定位模块**: 根据功能找到对应的模块文件
2. **修改实现**: 在对应模块中修改或添加功能
3. **测试验证**: 确保修改不影响其他模块
4. **更新文档**: 更新相关文档和注释

## 注意事项

1. **向后兼容**: 保持与原有API的兼容性
2. **错误处理**: 每个模块都应该有完善的错误处理
3. **事件管理**: 注意事件监听器的清理，避免内存泄漏
4. **性能考虑**: 避免在模块间创建不必要的依赖关系

## 功能模块详细说明

### 6. 线条模块 (lines/LinesManager.js)
- **功能**: 线条管理
- **包含**:
  - 线段组创建和管理
  - 支持多种样式配置
  - 方向箭头功能
  - 线条事件处理
  - 动态添加/删除线条

### 7. 聚合模块 (cluster/ClusterManager.js)
- **功能**: 聚合管理
- **包含**:
  - 点聚合功能
  - 聚合样式配置
  - 未聚合点显示
  - 聚合事件处理
  - 自定义DOM支持

### 8. 多边形模块 (polygons/index.js)
- **功能**: 多边形管理
- **包含**:
  - 多边形创建和显示
  - 圆形创建功能
  - 填充和边框样式
  - 多边形事件处理
  - 动态几何数据管理

### 9. 地图状态模块 (state/index.js)
- **功能**: 地图状态管理
- **包含**:
  - 中心点设置和获取
  - 缩放级别控制
  - 地图平移和飞行
  - 倾斜和旋转控制
  - 视野范围管理
  - 状态保存和恢复

### 10. 地图事件模块 (events/index.js)
- **功能**: 地图事件管理
- **包含**:
  - 地图原生事件绑定
  - 事件监听器管理
  - 事件节流和防抖
  - 事件数据格式化
  - 批量事件操作

## HTMap接口兼容性

### 事件方法
- `on(event, callback)` - 绑定事件监听器
- `off(event, callback)` - 移除事件监听器
- `once(event, callback)` - 一次性事件监听器
- `onThrottled(event, callback, delay)` - 节流事件监听器
- `onDebounced(event, callback, delay)` - 防抖事件监听器
- `onMultiple(events)` - 批量添加事件监听器
- `offMultiple(events)` - 批量移除事件监听器

### 样式方法
- `setStyleType(styleType)` - 设置地图样式类型
- `getStyleType()` - 获取当前地图样式类型

### 兼容方法
- `addPopupLegacy(options)` - 旧版气泡添加方法
- `destroy()` - 销毁地图实例
- `_setBounds(options)` - BaseAdapter抽象方法实现，设置地图视野范围

## 使用示例

### 线条功能
```javascript
// 添加线条
const lines = map.addLines({
  id: 'my-lines',
  geometries: [
    {
      id: 'line1',
      paths: [[114.884094, 40.8119], [114.885094, 40.8129]],
      styleId: 'line-style-1'
    }
  ],
  styles: [
    {
      id: 'line-style-1',
      color: '#ff0000',
      width: 3,
      dirArrows: true
    }
  ]
})

// 添加几何数据
lines.addGeometries([
  {
    id: 'line2',
    paths: [[114.886094, 40.8139], [114.887094, 40.8149]],
    styleId: 'line-style-1'
  }
])
```

### 聚合功能
```javascript
// 添加聚合
const cluster = map.addClusters({
  id: 'my-cluster',
  geometries: [
    {
      id: 'point1',
      lngLat: [114.884094, 40.8119],
      properties: { name: '点1' }
    }
  ],
  clusterStyle: {
    circleColor: '#51bbd6',
    circleRadius: 20,
    textColor: '#ffffff'
  }
})

// 绑定聚合点击事件
cluster.onClusterClick((eventData) => {
  console.log('聚合点击:', eventData)
})
```

### 多边形功能
```javascript
// 添加多边形
const polygons = map.addPolygons({
  id: 'my-polygons',
  geometries: [
    {
      id: 'polygon1',
      paths: [
        [114.884094, 40.8119],
        [114.885094, 40.8119],
        [114.885094, 40.8129],
        [114.884094, 40.8129],
        [114.884094, 40.8119]
      ],
      styleId: 'polygon-style-1'
    }
  ],
  styles: [
    {
      id: 'polygon-style-1',
      fillColor: '#ff0000',
      fillOpacity: 0.5,
      strokeColor: '#ff0000',
      strokeWidth: 2
    }
  ]
})

// 添加圆形
const circle = map.addCircle({
  id: 'my-circle',
  center: [114.884094, 40.8119],
  radius: 1000, // 1000米
  styles: [
    {
      fillColor: '#00ff00',
      fillOpacity: 0.3,
      strokeColor: '#00ff00',
      strokeWidth: 2
    }
  ]
})
```

### 地图状态功能
```javascript
// 设置地图中心点和缩放级别
map.setCenterAndZoom([114.884094, 40.8119], 15)

// 设置地图视图
map.setView([114.884094, 40.8119], 15)

// 设置地图中心点（带动画）
map.setCenter([114.884094, 40.8119], {
  animate: true,
  duration: 1000
})

// 设置缩放级别
map.setZoom(16, { animate: true })

// 设置倾斜角度（3D效果）
map.setPitch(45, { animate: true })

// 设置旋转角度
map.setBearing(90, { animate: true })

// 设置视图模式
map.setViewMode('3D', { pitch: 60 })

// 飞行到指定位置
map.flyTo([114.884094, 40.8119], 15, {
  duration: 2000,
  pitch: 45,
  bearing: 0
}).then((result) => {
  console.log('飞行完成:', result)
})

// 设置地图视野范围
map.fitBounds([
  [114.884094, 40.8119],
  [114.885094, 40.8129]
], { padding: 50 })

// 适应坐标数组
map.fitCoordinates([
  [114.884094, 40.8119],
  [114.885094, 40.8129],
  [114.886094, 40.8139]
])

// 平移地图
map.panBy([100, 100], { animate: true })

// 平移到指定位置
map.panTo([114.884094, 40.8119])

// 获取当前地图状态
const state = map.getState()
console.log('当前状态:', state)

// 设置地图状态
map.setState({
  center: [114.884094, 40.8119],
  zoom: 15,
  pitch: 30,
  bearing: 45
}, { duration: 1500 })

// 重置地图状态
map.resetState({ duration: 1000 })
```

### 地图事件功能
```javascript
// 添加事件监听器
map.addEventListener('click', (eventData) => {
  console.log('地图点击:', eventData)
})

// 添加双击事件监听器
map.addEventListener('dblclick', (eventData) => {
  console.log('地图双击:', eventData)
})

// 添加缩放事件监听器
map.addEventListener('zoomend', (eventData) => {
  console.log('缩放结束:', eventData.zoom)
})

// 添加移动事件监听器
map.addEventListener('moveend', (eventData) => {
  console.log('移动结束:', eventData.center)
})

// 添加带节流的事件监听器
map.addThrottledEventListener('mousemove', (eventData) => {
  console.log('鼠标移动:', eventData)
}, 100)

// 添加带防抖的事件监听器
map.addDebouncedEventListener('resize', (eventData) => {
  console.log('窗口大小改变:', eventData)
}, 300)

// 一次性事件监听器
map.once('load', (eventData) => {
  console.log('地图加载完成')
})

// 批量添加事件监听器
map.addEventListeners({
  'click': (eventData) => console.log('点击:', eventData),
  'dblclick': (eventData) => console.log('双击:', eventData),
  'contextmenu': (eventData) => console.log('右键:', eventData)
})

// 移除事件监听器
const clickHandler = (eventData) => console.log('点击:', eventData)
map.addEventListener('click', clickHandler)
map.removeEventListener('click', clickHandler)

// 批量移除事件监听器
map.removeEventListeners({
  'click': clickHandler,
  'dblclick': dblClickHandler
})

// 检查事件是否有监听器
if (map.hasEventListeners('click')) {
  console.log('点击事件有监听器')
}

// 获取事件监听器数量
const clickCount = map.getEventListenersCount('click')
console.log('点击事件监听器数量:', clickCount)

// 获取支持的事件列表
const supportedEvents = map.getSupportedEvents()
console.log('支持的事件:', supportedEvents)

// 清除所有事件监听器
map.clearAllEvents()

// 手动触发事件
map.triggerEvent('customEvent', { data: 'custom data' })
```

### HTMap兼容方法使用示例
```javascript
// HTMap兼容的事件方法
map.on('click', (eventData) => {
  console.log('HTMap兼容点击事件:', eventData)
})

map.off('click', clickHandler)

map.onThrottled('mousemove', (eventData) => {
  console.log('节流鼠标移动:', eventData)
}, 100)

map.onDebounced('resize', (eventData) => {
  console.log('防抖窗口大小改变:', eventData)
}, 300)

// 批量事件操作
map.onMultiple({
  'click': (data) => console.log('点击:', data),
  'dblclick': (data) => console.log('双击:', data)
})

map.offMultiple(['click', 'dblclick'])

// 样式方法
map.setStyleType('dark')
const currentStyle = map.getStyleType()
console.log('当前样式:', currentStyle)

// 旧版气泡兼容
const legacyPopup = map.addPopupLegacy({
  lng: 114.884094,
  lat: 40.8119,
  content: '旧版格式气泡',
  showCloseBtn: true
})

// 设置地图视野范围
map.setBounds({
  sw: [114.0, 40.0],  // 西南角坐标
  ne: [115.0, 41.0],  // 东北角坐标
  padding: 50          // 边距
})

// 销毁地图
map.destroy()
```

## 未来计划

- [x] 实现线条功能模块 (lines)
- [x] 实现聚合功能模块 (cluster)  
- [x] 实现多边形功能模块 (polygons)
- [x] 实现地图状态功能模块 (state)
- [x] 实现地图事件功能模块 (events)
- [x] 完善HTMap接口兼容性
- [ ] 添加单元测试
- [ ] 添加TypeScript支持
- [ ] 优化性能和内存使用
- [ ] 添加更多几何图形支持（椭圆、扇形等）
- [ ] 添加动画效果支持
- [ ] 添加热力图功能
- [ ] 添加轨迹回放功能
