# HTMap 地图防腐层

HTMap是一个统一的地图操作接口层，支持多种地图引擎，包括腾讯地图和MapboxGL。它提供了防腐层设计，使得上层应用可以统一调用地图功能，而底层可以灵活切换不同的地图引擎。

## 架构设计

### 核心组件

1. **HTMap主类** (`index.js`)
   - 提供统一的地图操作接口
   - 管理地图实例和生命周期
   - 处理配置和初始化

2. **地图工厂** (`core/MapFactory.js`)
   - 根据配置创建不同地图引擎的实例
   - 支持动态切换地图引擎

3. **适配器模式** (`adapters/`)
   - `BaseAdapter.js`: 定义所有地图引擎必须实现的接口
   - `TencentMap.js`: 腾讯地图适配器
   - `MapboxGL.js`: MapboxGL适配器

4. **配置管理** (`config/`)
   - `defaultConfig.js`: 默认配置和配置模板

## 核心功能

### 1. 标记点 (Marker)
- **基础图片支持**: 内置默认图标，支持自定义图片
- **事件回调**: 支持单击和双击事件
- **样式定制**: 可自定义颜色、尺寸、锚点位置
- **动态更新**: 支持位置、样式、图标的实时更新

### 2. 自定义气泡 (Popup)
- **灵活内容**: 支持HTML字符串和DOM元素
- **样式配置**: 可配置关闭按钮、最大宽度等
- **位置控制**: 支持动态设置位置和内容
- **交互控制**: 可配置点击地图是否关闭

### 3. 线条绘制 (Line)
- **路径绘制**: 支持多点连线
- **样式定制**: 可自定义颜色、宽度、透明度
- **高级样式**: 支持虚线、圆角等Mapbox特定样式
- **动态更新**: 支持路径和样式的实时更新

### 4. 线段管理 (Lines)
- **批量管理**: 支持批量添加、删除、更新线段
- **样式系统**: 支持多种样式定义和动态切换
- **事件绑定**: 支持点击、悬停等交互事件
- **几何操作**: 支持动态添加、删除、更新线段坐标
- **可见性控制**: 支持显示/隐藏线段组
- **长度计算**: 自动计算线段总长度

### 4. 聚合功能 (Cluster)
- **智能聚合**: 根据缩放级别自动聚合点
- **样式定制**: 可自定义聚合点和普通点的样式
- **交互支持**: 点击聚合点自动展开到下一级别
- **性能优化**: 大量点数据的高效渲染

## 使用方法

### 1. 基本初始化

```javascript
import HTMap from '@/utils/HTMap/index.js'

// 创建地图实例 - 支持传入容器ID字符串或DOM元素
const map = new HTMap('mapContainer', {
  engine: 'tencent', // 或 'mapbox'
  center: [114.884094, 40.8119],
  zoom: 15
})

// 或者传入DOM元素
const container = document.getElementById('mapContainer')
const map = new HTMap(container, {
  engine: 'tencent',
  center: [114.884094, 40.8119],
  zoom: 15
})
```

### 2. 地图信息获取

```javascript
// 获取地图中心点 - 现在可以直接调用，无需通过 mapInstance
const center = map.getCenter()           // 返回 [lng, lat]
const zoom = map.getZoom()               // 返回缩放级别
const pitch = map.getPitch()             // 返回倾斜角度
const bearing = map.getBearing()         // 返回旋转角度
const maxZoom = map.getMaxZoom()         // 返回最大缩放级别
const minZoom = map.getMinZoom()         // 返回最小缩放级别
const size = map.getSize()               // 返回容器尺寸 {width, height}
const bounds = map.getBounds()           // 返回地图边界 {north, south, east, west}

console.log('地图中心:', center)
console.log('当前缩放:', zoom)
console.log('容器尺寸:', size)
```

### 2. 标记点功能

```javascript
// 基础标记点
const marker = map.addMarker({
  lng: 114.884094,
  lat: 40.8119,
  color: '#FF0000',
  size: 32,
  onClick: (markerInstance, event) => {
    console.log('标记点被点击:', markerInstance)
  },
  onDblClick: (markerInstance, event) => {
    console.log('标记点被双击:', markerInstance)
  }
})

// 自定义图标标记点
const customMarker = map.addMarker({
  lng: 114.884094,
  lat: 40.8119,
  icon: '/icons/location.png',
  size: 48,
  anchor: 'center'
})

// 更新标记点
map.updateMarker(marker.id, {
  color: '#00FF00',
  size: 48
})

// 移除标记点
map.removeMarker(marker.id)
```

### 3. 气泡功能

```javascript
// 文本气泡
const popup = map.addPopup({
  lng: 114.884094,
  lat: 40.8119,
  content: '<h3>标题</h3><p>这是气泡内容</p>',
  closeButton: true,
  closeOnClick: false,
  maxWidth: '300px'
})

// 自定义HTML气泡
const customPopup = map.addPopup({
  lng: 114.884094,
  lat: 40.8119,
  content: document.createElement('div'),
  closeButton: true
})

// 更新气泡
popup.setPosition(114.88, 40.81)
popup.setContent('<h3>新标题</h3>')

// 移除气泡
map.removePopup(popup.id)
```

### 4. 线条功能

```javascript
// 基础线条
const line = map.addLine({
  path: [
    [114.884094, 40.8119],
    [114.88, 40.81],
    [114.89, 40.82]
  ],
  strokeColor: '#FF0000',
  strokeWeight: 3,
  strokeOpacity: 0.8
})

// 样式线条
const styledLine = map.addLine({
  path: [
    [114.88, 40.81],
    [114.89, 40.82]
  ],
  strokeColor: '#00FF00',
  strokeWeight: 5,
  mapboxConfig: {
    'line-dasharray': [2, 2] // 虚线效果
  }
})

// 更新线条
map.updateLine(line.id, {
  path: [[118.177726746, 39.630245209], [118.20, 39.66]],
  strokeColor: '#0000FF'
})

// 移除线条
map.removeLine(line.id)
```

### 5. 线段管理功能 (Lines)

```javascript
// 使用 HTMap.Lines 类创建线段组
const linesGroup = new HTMap.Lines({
  map: map,
  id: 'my_lines_group',
  styles: [
    {
      id: 'red_line_style',
      color: '#ff0000',
      width: 5,
      opacity: 0.8,
      dashArray: [10, 5], // 虚线样式
      lineCap: 'round',
      lineJoin: 'round'
    },
    {
      id: 'blue_line_style',
      color: '#0066ff',
      width: 3,
      opacity: 1,
      dashArray: null, // 实线
      lineCap: 'square',
      lineJoin: 'miter'
    }
  ],
  geometries: [
    {
      id: 'line_1',
      coordinates: [
        [116.3974, 39.9093], // 北京天安门
        [116.4074, 39.9193], // 偏移点1
        [116.4174, 39.9293]  // 偏移点2
      ],
      properties: {
        name: '示例线段1',
        type: 'road'
      },
      styleId: 'red_line_style'
    },
    {
      id: 'line_2',
      coordinates: [
        [116.3874, 39.8993], // 起点
        [116.4274, 39.9393]  // 终点
      ],
      properties: {
        name: '示例线段2',
        type: 'boundary'
      },
      styleId: 'blue_line_style'
    }
  ]
})

// 绑定事件
linesGroup.on('click', (event) => {
  console.log('线段被点击:', event)
  console.log('线段属性:', event.properties)
})

linesGroup.on('mouseover', (event) => {
  console.log('鼠标悬停在线段上:', event)
})

// 动态添加线段
linesGroup.addGeometries([
  {
    id: 'line_3',
    coordinates: [
      [116.3774, 39.8893],
      [116.3874, 39.8993],
      [116.3974, 39.9093]
    ],
    properties: {
      name: '动态添加的线段',
      type: 'path'
    },
    styleId: 'red_line_style'
  }
])

// 更新线段样式
linesGroup.updateGeometryStyle('line_1', {
  color: '#00ff00',
  width: 8,
  opacity: 0.6,
  dashArray: [20, 10]
})

// 更新线段坐标
linesGroup.updateGeometryCoordinates('line_2', [
  [116.4074, 39.9193],
  [116.4174, 39.9293],
  [116.4274, 39.9393],
  [116.4374, 39.9493]
])

// 获取线段信息
console.log('线段组可见性:', linesGroup.getVisible())
console.log('线段几何数据:', linesGroup.getGeometries())
console.log('线段总长度:', linesGroup.getTotalLength(), '米')

// 删除线段
linesGroup.removeGeometries(['line_1', 'line_3'])

// 控制显示/隐藏
linesGroup.setVisible(false) // 隐藏
linesGroup.setVisible(true)  // 显示

// 清理线段组
linesGroup.off('click')
linesGroup.off('mouseover')
linesGroup.remove()
```

### 6. 使用 HTMap 的 addLines 方法

```javascript
// 直接使用 HTMap 的 addLines 方法
const linesResult = map.addLines({
  id: 'route_lines',
  styles: [
    {
      id: 'route_style',
      color: '#00ff00',
      width: 4,
      opacity: 0.9,
      dashArray: [5, 5]
    }
  ],
  geometries: [
    {
      id: 'route_1',
      coordinates: [
        [116.3774, 39.8893],
        [116.3874, 39.8993],
        [116.3974, 39.9093],
        [116.4074, 39.9193]
      ],
      properties: {
        name: '路线1',
        type: 'route'
      },
      styleId: 'route_style'
    }
  ]
})

// 绑定事件
if (linesResult) {
  linesResult.on('click', (event) => {
    console.log('路线被点击:', event)
  })
}
```

### 5. 聚合功能

```javascript
// 准备聚合数据
const clusterData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [118.177726746, 39.630245209]
      },
      properties: { title: '聚合点1' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [118.18, 39.64]
      },
      properties: { title: '聚合点2' }
    }
  ]
}

// 添加聚合
const cluster = map.addCluster({
  data: clusterData,
  clusterMaxZoom: 14,
  clusterRadius: 50,
  clusterColor: '#11b4da',
  pointColor: '#11b4da'
})

// 移除聚合
map.removeCluster(cluster.id)
```

### 6. 批量操作

```javascript
// 获取所有图层
const allMarkers = map.getMarkers()
const allLines = map.getLines()
const allClusters = map.getClusters()

// 批量更新
allMarkers.forEach(marker => {
  map.updateMarker(marker.id, { size: 40 })
})

// 清除所有图层
map.clearLayers()
```

### 7. 地图引擎管理

HTMap使用 `engineConfig.js` 来管理支持的地图引擎：

```javascript
import { getActiveEngines, getEngineExtConfig, isEngineSupported } from '@/utils/HTMap/config/engineConfig.js'

// 获取所有活跃的地图引擎
const engines = getActiveEngines()

// 获取特定引擎的扩展配置信息
const engineInfo = getEngineExtConfig('tencent')

// 检查引擎是否支持
const isSupported = isEngineSupported('tencent')
```

### 8. 腾讯地图配置

```javascript
const tencentConfig = {
  engine: 'tencent',
  center: [114.884094, 40.8119],
  zoom: 15,
  tencentConfig: {
    key: 'YOUR_TENCENT_MAP_KEY',
    style: 'normal', // 'normal' | 'satellite' | 'hybrid'
    showControl: true,
    draggable: true,
    scrollWheel: true
  }
}
```

### 9. 四维图新配置

```javascript
const minemapConfig = {
  engine: 'minemap',
  center: [114.884094, 40.8119],
  zoom: 15,
  minemapConfig: {
    key: 'YOUR_MINEMAP_KEY',
    style: 'default',
    showControl: true,
    mapType: 'vector', // 'vector' | 'satellite' | 'terrain'
    draggable: true,
    scrollWheel: true
  }
}
```

### 10. MapboxGL配置

```javascript
const mapboxConfig = {
  engine: 'mapbox',
  center: [114.884094, 40.8119],
  zoom: 15,
  style: 'mapbox://styles/mapbox/streets-v11',
  mapboxConfig: {
    accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
    dragPan: true,
    scrollZoom: true
  }
}
```

### 11. 地图操作

```javascript
// 设置视图
map.setView([114.884094, 40.8119], 12)

// 设置地图中心点
map.setCenter([114.884094, 40.8119])

// 设置地图缩放级别
map.setZoom(15)

// 设置倾斜角度
map.setPitch(45)

// 设置旋转角度
map.setRotation(90)

// 2D/3D切换
map.setViewMode('3D', { pitch: 45 })

// 样式主题切换
map.setStyleType('satellite')

// 平滑动画
map.flyTo([114.884094, 40.8119], 15, {
  pitch: 30,
  bearing: 45,
  duration: 2000
})

// 获取地图状态
const viewport = map.getViewport()
console.log('当前视角:', viewport)

// 获取当前视图模式
const viewMode = map.getViewMode()
console.log('当前视图模式:', viewMode)

// 获取当前样式类型
const styleType = map.getStyleType()
console.log('当前样式类型:', styleType)

// 销毁地图
map.destroy()
```

### 12. 新增的地图操作方法

HTMap新增了以下地图操作方法，提供更灵活的地图控制：

#### 基础操作方法

```javascript
// 设置地图中心点
map.setCenter([116.397128, 39.916527], {
  animate: true,        // 是否使用动画
  duration: 2000        // 动画时长（毫秒）
})

// 设置地图缩放等级
map.setZoom(18, {
  animate: true,
  duration: 1500
})

// 设置地图倾斜角
map.setPitch(45, {
  animate: true,
  duration: 2000
})

// 设置地图旋转角
map.setRotation(90, {
  animate: true,
  duration: 3000
})
```

#### 高级操作方法

```javascript
// 2D/3D切换
map.setViewMode('3D', {
  pitch: 45,            // 3D模式下的倾斜角度
  animate: true,
  duration: 2000
})

// 样式主题切换
map.setStyleType('satellite')  // 切换到卫星图
map.setStyleType('dark')       // 切换到深色主题
map.setStyleType('light')      // 切换到浅色主题
```

#### 获取方法

```javascript
// 获取地图中心点
const center = map.getCenter()           // [经度, 纬度]

// 获取地图缩放等级
const zoom = map.getZoom()               // 缩放级别

// 获取地图倾斜角
const pitch = map.getPitch()             // 倾斜角度

// 获取地图旋转角
const rotation = map.getRotation()       // 旋转角度

// 获取当前视图模式
const viewMode = map.getViewMode()       // '2D' 或 '3D'

// 获取当前样式类型
const styleType = map.getStyleType()     // 样式类型
```

#### 组合操作方法

```javascript
// 一次性设置多个视角参数
map.setViewport([116.397128, 39.916527], 18, {
  pitch: 45,
  bearing: 90,
  animate: true,
  duration: 3000
})

// 平滑飞行到指定位置和视角
map.flyTo([116.397128, 39.916527], 18, {
  pitch: 60,
  bearing: 45,
  duration: 5000
})

// 重置地图视角到默认状态
map.resetViewport()
```

#### 事件监听

```javascript
// 监听地图倾斜角度变化
map.onPitchChange((data) => {
  console.log('倾斜角度变化:', data.pitch)
})

// 监听地图旋转角度变化
map.onBearingChange((data) => {
  console.log('旋转角度变化:', data.bearing)
})

// 监听地图视角整体变化
map.onViewportChange((data) => {
  console.log('视角变化:', data)
})
```

#### 事件统一性检查

HTMap提供了智能的事件统一性检查功能，帮助开发者识别和使用事件：

```javascript
// 1. 查询统一事件列表
const unifiedEvents = HTMap.getUnifiedEvents()
console.log('HTMap统一事件：', unifiedEvents)

// 2. 检查事件是否为统一事件
const isClickUnified = HTMap.isUnifiedEvent('click')      // true
const isViewResetUnified = HTMap.isUnifiedEvent('viewreset')  // false

// 3. 获取当前引擎支持的事件
const engineEvents = map.getEngineEvents()
console.log('当前引擎支持的事件：', engineEvents)

// 4. 获取未统一的事件列表
const unifiedEvents = map.getUnifiedEvents()
console.log('未统一的事件：', unifiedEvents)

// 5. 获取事件使用建议
const suggestion = map.getEventSuggestion('viewreset')
console.log(suggestion)
// 输出：事件 "viewreset" 是 tencent 引擎特有事件，HTMap未统一标准化。建议优先使用统一事件：click, dblclick, contextmenu, move, zoom, dragstart, dragend, zoomstart, zoomend, load, render, tileload, tileloadstart, tileerror, viewport, pitch, bearing, resize, focus, blur

// 6. 事件绑定时的自动检查
// 绑定统一事件（无警告）
map.on('click', callback)

// 绑定未统一事件（会有console警告，但仍能正常工作）
map.on('viewreset', callback)
// 控制台会显示：[HTMap] 事件 "viewreset" 未在HTMap中统一标准化。该事件将直接透传给 tencent 地图引擎，可能存在兼容性问题。建议使用统一事件：click, dblclick, contextmenu, move, zoom, dragstart, dragend, zoomstart, zoomend, load, render, tileload, tileloadstart, tileerror, viewport, pitch, bearing, resize, focus, blur
```

**统一事件（推荐使用）：**
- 基础交互：`click`, `dblclick`, `contextmenu`
- 地图操作：`move`, `zoom`, `dragstart`, `dragend`, `zoomstart`, `zoomend`
- 地图状态：`load`, `render`, `tileload`, `tileloadstart`, `tileerror`
- 视角变化：`viewport`, `pitch`, `bearing`
- 其他：`resize`, `focus`, `blur`

**引擎特有事件（谨慎使用）：**
- 这些事件是特定地图引擎支持的，HTMap未统一标准化
- 使用时会给出console警告，但仍然正常工作
- 可能存在跨引擎兼容性问题

#### 支持的样式类型

不同地图引擎支持的样式类型：

**腾讯地图 (tencent):**
- `default` / `normal` - 默认样式
- `satellite` - 卫星图
- `hybrid` - 混合图
- `dark` - 深色主题
- `light` - 浅色主题

**MapboxGL (mapbox):**
- `default` / `streets` - 街道样式
- `satellite` - 卫星图
- `hybrid` - 混合图
- `dark` - 深色主题
- `light` - 浅色主题
- `outdoors` - 户外样式
- `navigation` - 导航样式

**四维图新 (minemap):**
- `default` / `black` - 默认黑色样式
- `white` - 白色样式
- `blue` - 蓝色样式
- `green` - 绿色样式
- `red` - 红色样式
- `satellite` - 卫星图
- `hybrid` - 混合图

## 功能特性

### 1. 统一接口
- 所有地图引擎使用相同的API接口
- 支持动态切换地图引擎
- 统一的错误处理和事件管理

### 2. 事件系统
- 支持地图加载、点击、缩放、移动等事件
- 支持标记点的单击和双击事件
- 统一的事件监听和触发机制
- 支持自定义事件回调
- **事件统一性检查**：自动识别统一事件和引擎特有事件，提供console提示和使用建议

### 3. 图层管理
- 统一的图层添加、移除、清理接口
- 自动生成唯一图层ID
- 支持批量图层操作
- 完整的CRUD操作支持

### 4. 配置管理
- 灵活的配置选项
- 引擎特定的配置支持
- 默认配置和配置模板

### 5. 性能优化
- 智能聚合算法
- 事件冒泡控制
- 内存管理优化
- 图层批量操作

## 扩展开发

### 1. 添加新的地图引擎

1. 在 `adapters/` 目录下创建新的适配器类
2. 继承 `BaseAdapter` 类并实现所有必需的方法
3. 在 `MapFactory.js` 中添加新引擎的支持

```javascript
// 示例：添加高德地图支持
export default class AMap extends BaseAdapter {
  constructor(container, options) {
    super(container, options)
    this.init()
  }
  
  init() {
    // 实现高德地图初始化逻辑
  }
  
  // 实现其他必需方法...
}
```

### 2. 添加新的功能模块

1. 在 `modules/` 目录下创建新的功能模块
2. 继承 `BaseModule` 类
3. 在适配器中集成新模块

## 文档

- [功能使用示例](./docs/功能使用示例.md) - 详细的使用示例和最佳实践
- [API参考](./docs/API参考.md) - 完整的API接口文档
- [SDK配置说明](./docs/SDK配置说明.md) - 各地图引擎的配置说明
- [事件统一性检查使用示例](./docs/事件统一性检查使用示例.md) - 事件统一性检查功能的使用方法和最佳实践
- [事件统一性检查测试示例](./docs/事件统一性检查测试示例.md) - 完整的功能测试代码和预期输出

## 注意事项

1. **API密钥**: 使用腾讯地图需要有效的API密钥，使用MapboxGL需要有效的访问令牌
2. **SDK加载**: 确保在使用前已正确加载相应的地图SDK
3. **浏览器兼容性**: 不同地图引擎对浏览器的兼容性要求不同
4. **性能考虑**: 大量图层操作时注意性能优化
5. **事件处理**: 标记点事件会自动阻止冒泡，避免触发地图事件
6. **内存管理**: 及时移除不需要的图层和事件监听器

## 错误处理

HTMap提供了统一的错误处理机制：

```javascript
try {
  const map = new HTMap(container, config)
} catch (error) {
  console.error('地图初始化失败:', error.message)
  // 处理错误
}
```

## 示例项目

查看以下示例了解完整的使用方法：
- `src/views/mapBase/index.vue` - 基础地图功能
- `src/views/mapMarker/index.vue` - 标记点功能
- `src/views/mapLine/index.vue` - 线条绘制
- `src/views/mapConverge/index.vue` - 聚合功能

## 许可证

本项目采用 MIT 许可证。 