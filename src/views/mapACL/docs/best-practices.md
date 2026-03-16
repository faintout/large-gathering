# 最佳实践与常见问题

本文档提供 HTMap 使用的最佳实践建议、性能优化技巧、常见问题解答等内容。

## 性能优化

### 1. 大量标记点优化

当需要显示大量标记点时，使用聚合功能而不是直接渲染所有点。

```javascript
// ❌ 不推荐：直接渲染1000个标记点
const markers = new HTMap.Markers({
  map: map,
  geometries: thousandsOfPoints  // 1000+个点
})

// ✅ 推荐：使用聚合功能
const clusters = new HTMap.Clusters({
  map: map,
  geometries: thousandsOfPoints,
  clusterConfig: {
    maxZoom: 17,
    minCount: 2,
    radius: 60
  }
})
```

**性能对比：**
- 直接渲染1000个标记点：可能导致地图卡顿
- 使用聚合：流畅体验，即使10000+个点

### 2. 事件节流

对于频繁触发的事件（如 `move`、`zoom`），使用节流减少处理频率。

```javascript
import { throttle } from 'lodash-es'

// ❌ 不推荐：每次移动都执行
map.on('move', () => {
  updateMapInfo()  // 频繁执行
})

// ✅ 推荐：节流处理
const handleMove = throttle(() => {
  updateMapInfo()
}, 200)  // 200ms执行一次

map.on('move', handleMove)
```

### 3. 及时清理资源

组件销毁时及时清理地图资源，避免内存泄漏。

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const mapInstance = ref(null)
const markersInstance = ref(null)
const linesInstance = ref(null)

onMounted(async () => {
  // 初始化地图和图层
  const map = new HTMap('map', { /* ... */ })
  await map.init()
  mapInstance.value = map
  
  const markers = new HTMap.Markers({ /* ... */ })
  markersInstance.value = markers
})

// ✅ 正确的清理方式
onBeforeUnmount(() => {
  // 1. 清理图层
  if (markersInstance.value) {
    markersInstance.value.removeMarkers()
    markersInstance.value = null
  }
  
  if (linesInstance.value) {
    linesInstance.value.removeLines()
    linesInstance.value = null
  }
  
  // 2. 销毁地图
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
})
</script>
```

### 4. 样式复用

为相同样式的图层复用样式配置，避免重复定义。

```javascript
// ✅ 推荐：定义通用样式
const commonStyles = [
  {
    id: 'restaurant_style',
    src: '/restaurant.png',
    width: 36,
    height: 42
  },
  {
    id: 'hotel_style',
    src: '/hotel.png',
    width: 36,
    height: 42
  }
]

// 多个Markers实例共用样式
const markers1 = new HTMap.Markers({
  map: map,
  geometries: restaurantData,
  styles: commonStyles
})

const markers2 = new HTMap.Markers({
  map: map,
  geometries: hotelData,
  styles: commonStyles
})
```

### 5. 按需加载图层

根据地图缩放级别或视口范围按需加载图层数据。

```javascript
map.on('zoom', () => {
  const zoom = map.getZoom()
  
  // 根据缩放级别显示/隐藏图层
  if (zoom >= 15) {
    detailMarkers.setVisible(true)
  } else {
    detailMarkers.setVisible(false)
  }
})

map.on('moveend', () => {
  const bounds = map.getBounds()
  // 只加载视口范围内的数据
  loadDataInBounds(bounds)
})
```

---

## 错误处理

### 1. 地图初始化错误

```javascript
try {
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 12
  })
  
  await map.init()
  console.log('地图初始化成功')
} catch (error) {
  console.error('地图初始化失败:', error)
  
  // 根据错误类型处理
  if (error.message.includes('SDK')) {
    alert('地图SDK加载失败，请检查网络连接')
  } else if (error.message.includes('key')) {
    alert('地图密钥无效，请检查配置')
  } else {
    alert('地图初始化失败，请稍后重试')
  }
}
```

### 2. 数据验证错误

```javascript
// ✅ 推荐：验证数据后再创建图层
const createMarkers = (data) => {
  // 验证数据
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('标记点数据为空')
    return null
  }
  
  // 验证每个点的数据
  const validData = data.filter(item => {
    if (!item.lngLat || !Array.isArray(item.lngLat)) {
      console.warn('无效的标记点数据:', item)
      return false
    }
    return true
  })
  
  if (validData.length === 0) {
    console.warn('没有有效的标记点数据')
    return null
  }
  
  // 创建标记点
  return new HTMap.Markers({
    map: map,
    geometries: validData,
    styles: [/* ... */]
  })
}
```

### 3. 事件错误处理

```javascript
// ✅ 在事件处理器中捕获错误
markers.on('click', (e) => {
  try {
    // 处理点击事件
    handleMarkerClick(e)
  } catch (error) {
    console.error('处理标记点点击事件时出错:', error)
    // 不影响其他标记点的点击
  }
})
```

---

## 内存管理

### 1. 避免循环引用

```javascript
// ❌ 不推荐：可能导致内存泄漏
class MapManager {
  constructor() {
    this.map = new HTMap('map', { /* ... */ })
    this.markers = new HTMap.Markers({
      map: this.map,
      geometries: [/* ... */]
    })
    
    // 循环引用
    this.markers.manager = this
  }
}

// ✅ 推荐：避免循环引用
class MapManager {
  constructor() {
    this.map = new HTMap('map', { /* ... */ })
    this.markers = new HTMap.Markers({
      map: this.map,
      geometries: [/* ... */]
    })
  }
  
  destroy() {
    this.markers.removeMarkers()
    this.markers = null
    
    this.map.destroy()
    this.map = null
  }
}
```

### 2. 清理事件监听器

```javascript
class MapComponent {
  constructor() {
    this.map = null
    this.eventHandlers = {}
  }
  
  init() {
    this.map = new HTMap('map', { /* ... */ })
    
    // 保存事件处理器引用
    this.eventHandlers.click = (e) => this.handleClick(e)
    this.eventHandlers.zoom = () => this.handleZoom()
    
    this.map.on('click', this.eventHandlers.click)
    this.map.on('zoom', this.eventHandlers.zoom)
  }
  
  destroy() {
    // 解绑所有事件
    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      this.map.off(event, handler)
    })
    
    this.eventHandlers = {}
    this.map.destroy()
    this.map = null
  }
}
```

### 3. 大对象处理

```javascript
// ✅ 处理大量数据时，分批加载
const loadLargeDataset = async (allData) => {
  const batchSize = 1000
  const batches = []
  
  for (let i = 0; i < allData.length; i += batchSize) {
    batches.push(allData.slice(i, i + batchSize))
  }
  
  // 分批创建标记点
  for (const batch of batches) {
    const markers = new HTMap.Markers({
      map: map,
      geometries: batch,
      styles: [/* ... */]
    })
    
    // 等待一小段时间，避免阻塞UI
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}
```

---

## 多引擎兼容

### 1. 使用统一事件

```javascript
// ✅ 推荐：使用统一事件
map.on('click', handleClick)
map.on('zoom', handleZoom)
map.on('move', handleMove)

// ⚠️ 谨慎：使用引擎特有事件
map.on('tilesloaded', handleTilesLoaded)  // 腾讯地图特有
// 会收到警告：该事件未在HTMap中统一标准化
```

### 2. 样式表达式转换

HTMap 自动转换 MapboxGL 表达式到腾讯地图：

```javascript
// ✅ 使用MapboxGL表达式（自动转换）
const clusters = new HTMap.Clusters({
  map: map,
  clusterStyle: {
    circleColor: [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1'
    ]
  }
})
```

### 3. 引擎切换

切换地图引擎时只需修改配置，代码无需改动：

```javascript
// 腾讯地图
const map1 = new HTMap('map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12
})

// 切换到MapboxGL（代码不变）
const map2 = new HTMap('map', {
  engine: 'mapboxgl',
  center: [116.397128, 39.916527],
  zoom: 12
})
```

---

## 常见问题

### Q1: 地图初始化失败？

**原因：**
- SDK未加载完成
- 配置错误
- 网络问题

**解决方案：**
```javascript
// 确保等待地图初始化完成
const map = new HTMap('map', { /* ... */ })

try {
  await map.init()
  console.log('地图初始化成功')
} catch (error) {
  console.error('初始化失败:', error)
}
```

### Q2: 标记点不显示？

**可能原因：**
1. 坐标错误
2. 样式图片路径错误
3. 缩放级别超出 minZoom/maxZoom 范围

**解决方案：**
```javascript
// 1. 检查坐标格式
lngLat: [116.397128, 39.916527]  // ✅ 正确
lngLat: [39.916527, 116.397128]  // ❌ 错误：经纬度顺序反了

// 2. 检查图片路径
styles: [{
  src: '/images/pin.png',  // 确保路径正确
  width: 40,
  height: 46
}]

// 3. 检查缩放级别
const zoom = map.getZoom()
console.log('当前缩放:', zoom)
// 如果设置了 minZoom: 10, maxZoom: 18
// 确保当前缩放在这个范围内
```

### Q3: 事件不触发？

**原因：**
- 事件名称错误
- 图层被遮挡
- 事件未正确绑定

**解决方案：**
```javascript
// 1. 检查事件名称（区分大小写）
markers.on('click', handleClick)  // ✅
markers.on('Click', handleClick)  // ❌

// 2. 检查图层顺序
// 后添加的图层在上层，可能遮挡先添加的图层

// 3. 确保图层已添加到地图
const markers = new HTMap.Markers({ /* ... */ })
// 构造函数会自动调用 addToMap()
```

### Q4: 内存泄漏？

**原因：**
- 未解绑事件
- 未清理图层
- 循环引用

**解决方案：**
```javascript
// Vue组件中正确的清理方式
onBeforeUnmount(() => {
  // 1. 解绑事件
  map.off('click', handleClick)
  
  // 2. 清理图层
  markers.removeMarkers()
  lines.removeLines()
  
  // 3. 销毁地图
  map.destroy()
  
  // 4. 清空引用
  map = null
  markers = null
  lines = null
})
```

### Q5: 性能问题？

**原因：**
- 图层过多
- 数据量过大
- 频繁更新

**解决方案：**
```javascript
// 1. 使用聚合
const clusters = new HTMap.Clusters({ /* ... */ })

// 2. 按需加载
map.on('moveend', () => {
  const bounds = map.getBounds()
  loadVisibleData(bounds)
})

// 3. 节流
const handleMove = throttle(() => {
  updateInfo()
}, 200)
map.on('move', handleMove)

// 4. 虚拟化（大数据场景）
// 只渲染视口内的数据
```

### Q6: 多边形不闭合？

**原因：**
- 首尾坐标不一致

**解决方案：**
```javascript
// ✅ 正确：首尾坐标相同
paths: [
  [116.397128, 39.916527],
  [116.404448, 39.915225],
  [116.404448, 39.910225],
  [116.397128, 39.910527],
  [116.397128, 39.916527]  // 回到起点
]

// ❌ 错误：不闭合
paths: [
  [116.397128, 39.916527],
  [116.404448, 39.915225],
  [116.404448, 39.910225]
  // 缺少回到起点的坐标
]
```

### Q7: 聚合点数量不准确？

**原因：**
- `clusterConfig` 配置不当

**解决方案：**
```javascript
clusterConfig: {
  maxZoom: 17,     // 调整最大聚合缩放级别
  minCount: 2,     // 至少2个点才聚合
  radius: 60,      // 聚合半径
  zoomOnClick: true
}

// 如果缩放级别 > maxZoom，不再聚合，显示所有单个点
```

### Q8: 弹窗位置不正确？

**原因：**
- 偏移量设置不当

**解决方案：**
```javascript
// 根据标记点高度调整偏移
const popup = new HTMap.Popup({
  map: map,
  lngLat: [116.397128, 39.916527],
  content: '<div>内容</div>',
  offset: { x: 0, y: -46 }  // 向上偏移标记点高度
})
```

---

## 开发建议

### 1. 使用 TypeScript

```typescript
import HTMap from '@/utils/HTMap/index.js'
import type { MapConfig, MarkerGeometry } from '@/utils/HTMap/types'

const config: MapConfig = {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12
}

const geometries: MarkerGeometry[] = [
  {
    id: 'marker_1',
    lngLat: [116.397128, 39.916527],
    properties: { name: '北京' },
    styleId: 'style_1'
  }
]
```

### 2. 统一的错误处理

```javascript
class MapErrorHandler {
  static handle(error, context) {
    console.error(`[${context}] 错误:`, error)
    
    // 上报错误（可选）
    this.reportError(error, context)
    
    // 用户提示
    this.showUserMessage(error)
  }
  
  static reportError(error, context) {
    // 上报到监控系统
    // sentry.captureException(error)
  }
  
  static showUserMessage(error) {
    // 友好的错误提示
    if (error.message.includes('SDK')) {
      alert('地图加载失败，请刷新重试')
    }
  }
}

// 使用
try {
  const map = new HTMap('map', { /* ... */ })
  await map.init()
} catch (error) {
  MapErrorHandler.handle(error, '地图初始化')
}
```

### 3. 配置管理

```javascript
// config/map.config.js
export const mapConfig = {
  tencent: {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 12,
    minZoom: 3,
    maxZoom: 22
  },
  mapboxgl: {
    engine: 'mapboxgl',
    center: [116.397128, 39.916527],
    zoom: 12,
    minZoom: 0,
    maxZoom: 22
  }
}

// 使用
import { mapConfig } from './config/map.config.js'

const map = new HTMap('map', mapConfig.tencent)
```

### 4. 调试工具

```javascript
// 开发环境下的调试工具
if (process.env.NODE_ENV === 'development') {
  window.$htmap = {
    map: mapInstance,
    markers: markersInstance,
    lines: linesInstance,
    
    // 调试方法
    getMapInfo() {
      return {
        center: this.map.getCenter(),
        zoom: this.map.getZoom(),
        bounds: this.map.getBounds()
      }
    },
    
    getLayersInfo() {
      return {
        markers: this.markers?.getGeometries().length || 0,
        lines: this.lines?.getGeometries().length || 0
      }
    }
  }
  
  console.log('HTMap调试工具已挂载到 window.$htmap')
}
```

---

## 性能监控

```javascript
class MapPerformance {
  static measure(name, fn) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    console.log(`[性能] ${name}: ${(end - start).toFixed(2)}ms`)
    
    return result
  }
  
  static async measureAsync(name, fn) {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    
    console.log(`[性能] ${name}: ${(end - start).toFixed(2)}ms`)
    
    return result
  }
}

// 使用
const map = await MapPerformance.measureAsync('地图初始化', async () => {
  const map = new HTMap('map', { /* ... */ })
  await map.init()
  return map
})

const markers = MapPerformance.measure('创建1000个标记点', () => {
  return new HTMap.Markers({
    map: map,
    geometries: thousandsOfPoints
  })
})
```

---

**相关文档：**
- [核心概念 →](./core-concepts.md)
- [地图初始化 →](./initialization.md)
- [事件系统 →](./events.md)
- [API参考 →](./api-reference.md)

