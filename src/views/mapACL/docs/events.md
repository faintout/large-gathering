# 事件系统

本文档详细介绍 HTMap 的事件系统，包括统一事件、事件绑定与解绑、事件统一性检查等。

## 概述

HTMap 提供了统一的事件系统，屏蔽了不同地图引擎之间的事件差异，使得事件处理更加简单和一致。

**核心特性：**
- 🎯 统一的事件接口
- 🔍 事件统一性检查
- ⚡ 自动事件适配
- 🛡️ 兼容性警告
- 📋 完整的事件列表

## 统一事件列表

HTMap 标准化了以下事件，这些事件在所有地图引擎中都能正常工作。

### 基础交互事件

| 事件名 | 说明 | 触发时机 | 示例 |
|-------|------|---------|------|
| `click` | 单击事件 | 鼠标单击地图或图层 | 点击标记点 |
| `dblclick` | 双击事件 | 鼠标双击地图或图层 | 双击放大 |

### 地图操作事件

| 事件名 | 说明 | 触发时机 |
|-------|------|---------|
| `movestart` | 移动开始 | 地图开始移动 |
| `move` | 移动中 | 地图正在移动 |
| `moveend` | 移动结束 | 地图移动结束 |
| `dragstart` | 拖拽开始 | 开始拖拽地图 |
| `drag` | 拖拽中 | 正在拖拽地图 |
| `dragend` | 拖拽结束 | 拖拽地图结束 |
| `zoom` | 缩放事件 | 缩放级别改变 |
| `zoomstart` | 缩放开始 | 开始缩放 |
| `zoomend` | 缩放结束 | 缩放结束 |

### 地图状态事件

| 事件名 | 说明 | 触发时机 |
|-------|------|---------|
| `load` | 加载完成 | 地图初始化完成 |

## 事件绑定

### 地图事件绑定

**方法签名：**
```javascript
map.on(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'click'` |
| `callback` | `Function` | 是 | 回调函数 | `(e) => {}` |

**示例：**
```javascript
// 绑定地图点击事件
map.on('click', (e) => {
  console.log('点击位置:', e.lngLat)
  console.log('经度:', e.lngLat[0])
  console.log('纬度:', e.lngLat[1])
})

// 绑定地图移动事件
map.on('move', () => {
  const center = map.getCenter()
  const zoom = map.getZoom()
  console.log('地图中心:', center, '缩放:', zoom)
})

// 绑定缩放事件
map.on('zoom', () => {
  const zoom = map.getZoom()
  console.log('当前缩放级别:', zoom)
})

// 绑定地图加载完成事件
map.on('load', () => {
  console.log('地图加载完成')
  // 在这里可以安全地添加图层
})
```

### 图层事件绑定

#### Markers 事件

```javascript
const markers = new HTMap.Markers({ /* ... */ })

// 点击事件
markers.on('click', (e) => {
  console.log('点击的标记点:', e.properties)
  console.log('标记点ID:', e.id)
  console.log('位置:', e.lngLat)
})

// 双击事件
markers.on('dblclick', (e) => {
  console.log('双击的标记点:', e.properties.name)
})

// 鼠标进入
markers.on('mouseenter', (e) => {
  console.log('鼠标进入:', e.id)
})

// 鼠标离开
markers.on('mouseleave', (e) => {
  console.log('鼠标离开:', e.id)
})

// 拖拽结束（需要先启用拖拽）
markers.enableDrag()
markers.on('dragend', (e) => {
  console.log('拖拽到新位置:', e.lngLat)
})
```

#### Lines 事件

```javascript
const lines = new HTMap.Lines({ /* ... */ })

// 点击事件
lines.on('click', (e) => {
  console.log('点击的线条:', e.properties.name)
  console.log('线条ID:', e.id)
  
  // 获取线条长度
  const distance = lines.getLineDistanceById(e.id)
  console.log('线条长度:', distance, '米')
})

// 双击事件
lines.on('dblclick', (e) => {
  console.log('双击的线条:', e.properties)
})

// 鼠标悬停
lines.on('mouseenter', (e) => {
  console.log('鼠标悬停在线条上:', e.id)
})
```

#### Polygons 事件

```javascript
const polygons = new HTMap.Polygons({ /* ... */ })

// 点击事件
polygons.on('click', (e) => {
  console.log('点击的多边形:', e.properties.name)
  console.log('多边形ID:', e.id)
  console.log('多边形路径:', e.paths)
})

// 鼠标进入
polygons.on('mouseenter', (e) => {
  console.log('鼠标进入多边形:', e.id)
})

// 鼠标离开
polygons.on('mouseleave', (e) => {
  console.log('鼠标离开多边形:', e.id)
})
```

#### Clusters 事件

```javascript
const clusters = new HTMap.Clusters({ /* ... */ })

// 点击聚合点
clusters.on('click', (e) => {
  if (e.cluster) {
    // 点击的是聚合点
    console.log('聚合点包含:', e.point_count, '个点')
    console.log('聚合点ID:', e.cluster_id)
  } else {
    // 点击的是单个点
    console.log('单个点:', e.properties)
  }
})
```

#### Popup 事件

```javascript
const popup = new HTMap.Popup({ /* ... */ })

// 关闭事件
popup.on('close', () => {
  console.log('弹窗已关闭')
})

// 打开事件（部分引擎支持）
popup.on('open', () => {
  console.log('弹窗已打开')
})
```

## 事件解绑

### off() 方法

**方法签名：**
```javascript
map.off(eventType, callback)
// 或
layer.off(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `eventType` | `String` | 是 | 事件类型 |
| `callback` | `Function` | 否 | 要解绑的回调函数（不传则解绑所有该类型事件） |

**示例：**
```javascript
// 定义命名函数
const handleClick = (e) => {
  console.log('点击事件', e)
}

// 绑定事件
map.on('click', handleClick)

// 解绑特定函数
map.off('click', handleClick)

// 解绑所有click事件
map.off('click')

// 图层事件解绑
markers.on('click', handleMarkerClick)
markers.off('click', handleMarkerClick)
```

## 事件统一性检查

HTMap 提供了事件统一性检查功能，帮助开发者识别和使用正确的事件。

### 检查事件是否统一

**方法签名：**
```javascript
const isUnified = map.isUnifiedEvent(eventType)
```

**示例：**
```javascript
// 检查统一事件
console.log(map.isUnifiedEvent('click'))      // true
console.log(map.isUnifiedEvent('dblclick'))   // true
console.log(map.isUnifiedEvent('move'))       // true

// 检查未统一事件
console.log(map.isUnifiedEvent('viewreset'))  // false（引擎特有）
```

### 获取统一事件列表

**静态方法：**
```javascript
const unifiedEvents = HTMap.unifiedEvents
```

**示例：**
```javascript
console.log('HTMap支持的统一事件:', HTMap.unifiedEvents)
// 输出: ['click', 'dblclick', 'movestart', 'move', 'moveend', ...]
```

### 事件警告机制

当您使用未统一的事件时，HTMap 会在控制台显示警告信息：

```javascript
// 使用未统一的事件
map.on('viewreset', (e) => {
  console.log('视图重置')
})

// 控制台警告：
// [HTMap] 事件 "viewreset" 未在HTMap中统一标准化。
// 该事件将直接透传给地图引擎，可能存在兼容性问题。
```

## 完整示例

### 示例1：地图交互面板

```vue
<template>
  <div class="map-container">
    <div id="map"></div>
    
    <!-- 事件日志面板 -->
    <div class="event-log">
      <h3>事件日志</h3>
      <button @click="clearLog">清空日志</button>
      <div class="log-list">
        <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type">{{ log.type }}</span>
          <span class="log-detail">{{ log.detail }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

const mapInstance = ref(null)
const eventLogs = ref([])
const eventHandlers = ref({})

// 添加日志
const addLog = (type, detail) => {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift({ time, type, detail })
  
  // 只保留最近50条
  if (eventLogs.value.length > 50) {
    eventLogs.value = eventLogs.value.slice(0, 50)
  }
}

// 清空日志
const clearLog = () => {
  eventLogs.value = []
}

onMounted(async () => {
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 12
  })
  
  await map.init()
  mapInstance.value = map
  
  // 绑定地图事件
  const handleClick = (e) => {
    addLog('click', `点击位置: ${e.lngLat[0].toFixed(6)}, ${e.lngLat[1].toFixed(6)}`)
  }
  
  const handleDblClick = (e) => {
    addLog('dblclick', `双击位置: ${e.lngLat[0].toFixed(6)}, ${e.lngLat[1].toFixed(6)}`)
  }
  
  const handleZoom = () => {
    const zoom = map.getZoom()
    addLog('zoom', `缩放级别: ${zoom.toFixed(2)}`)
  }
  
  const handleMoveStart = () => {
    addLog('movestart', '开始移动地图')
  }
  
  const handleMoveEnd = () => {
    const center = map.getCenter()
    addLog('moveend', `移动结束: ${center[0].toFixed(6)}, ${center[1].toFixed(6)}`)
  }
  
  // 绑定事件
  map.on('click', handleClick)
  map.on('dblclick', handleDblClick)
  map.on('zoom', handleZoom)
  map.on('movestart', handleMoveStart)
  map.on('moveend', handleMoveEnd)
  
  // 保存事件处理器以便解绑
  eventHandlers.value = {
    click: handleClick,
    dblclick: handleDblClick,
    zoom: handleZoom,
    movestart: handleMoveStart,
    moveend: handleMoveEnd
  }
  
  addLog('load', '地图加载完成')
})

onBeforeUnmount(() => {
  // 解绑所有事件
  if (mapInstance.value && eventHandlers.value) {
    Object.entries(eventHandlers.value).forEach(([eventType, handler]) => {
      mapInstance.value.off(eventType, handler)
    })
  }
  
  // 销毁地图
  if (mapInstance.value) {
    mapInstance.value.destroy()
  }
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

#map {
  width: 100%;
  height: 100%;
}

.event-log {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
  z-index: 1000;
}

.event-log h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.event-log button {
  padding: 5px 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

.log-list {
  max-height: 400px;
  overflow-y: auto;
}

.log-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  display: flex;
  gap: 10px;
}

.log-time {
  color: #999;
  min-width: 80px;
}

.log-type {
  color: #409eff;
  font-weight: bold;
  min-width: 80px;
}

.log-detail {
  color: #666;
  flex: 1;
}
</style>
```

### 示例2：图层事件管理

```javascript
import { ref } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

// 创建事件管理器
class EventManager {
  constructor() {
    this.handlers = new Map()
  }
  
  // 注册事件
  register(target, eventType, handler) {
    const key = `${target.id || 'map'}_${eventType}`
    
    // 保存处理器引用
    if (!this.handlers.has(key)) {
      this.handlers.set(key, [])
    }
    this.handlers.get(key).push({ target, handler })
    
    // 绑定事件
    target.on(eventType, handler)
  }
  
  // 注销事件
  unregister(target, eventType) {
    const key = `${target.id || 'map'}_${eventType}`
    const handlers = this.handlers.get(key)
    
    if (handlers) {
      handlers.forEach(({ target, handler }) => {
        target.off(eventType, handler)
      })
      this.handlers.delete(key)
    }
  }
  
  // 注销所有事件
  unregisterAll() {
    this.handlers.forEach((handlers, key) => {
      handlers.forEach(({ target, handler }) => {
        const eventType = key.split('_').pop()
        target.off(eventType, handler)
      })
    })
    this.handlers.clear()
  }
}

// 使用示例
const eventManager = new EventManager()
const mapInstance = ref(null)
const markersInstance = ref(null)

const setupEvents = async () => {
  // 创建地图
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 12
  })
  await map.init()
  mapInstance.value = map
  
  // 创建标记点
  const markers = new HTMap.Markers({
    map: map,
    geometries: [/* ... */],
    styles: [/* ... */]
  })
  markersInstance.value = markers
  
  // 注册地图事件
  eventManager.register(map, 'click', (e) => {
    console.log('地图点击:', e.lngLat)
  })
  
  eventManager.register(map, 'zoom', () => {
    console.log('缩放变化:', map.getZoom())
  })
  
  // 注册标记点事件
  eventManager.register(markers, 'click', (e) => {
    console.log('标记点点击:', e.properties.name)
  })
  
  eventManager.register(markers, 'mouseenter', (e) => {
    console.log('鼠标进入标记点:', e.id)
  })
}

// 清理事件
const cleanup = () => {
  eventManager.unregisterAll()
  
  if (markersInstance.value) {
    markersInstance.value.removeMarkers()
  }
  
  if (mapInstance.value) {
    mapInstance.value.destroy()
  }
}
```

## 最佳实践

### 1. 使用命名函数

```javascript
// ✅ 好的做法
const handleClick = (e) => {
  console.log('点击事件', e)
}
map.on('click', handleClick)
map.off('click', handleClick)  // 可以正确解绑

// ❌ 不好的做法
map.on('click', (e) => {
  console.log('点击事件', e)
})
map.off('click')  // 只能解绑所有click事件
```

### 2. 及时解绑事件

```javascript
// Vue组件中
onBeforeUnmount(() => {
  // 解绑事件
  map.off('click', handleClick)
  map.off('zoom', handleZoom)
  
  // 清理图层
  markers.removeMarkers()
  lines.removeLines()
  
  // 销毁地图
  map.destroy()
})
```

### 3. 避免事件处理器中的大量计算

```javascript
// ❌ 不好的做法
map.on('move', () => {
  // 大量计算
  const center = map.getCenter()
  const zoom = map.getZoom()
  // 复杂的数据处理...
  heavyCalculation()
})

// ✅ 好的做法 - 使用节流
import { throttle } from 'lodash-es'

const handleMove = throttle(() => {
  const center = map.getCenter()
  const zoom = map.getZoom()
  // 处理数据
}, 200)

map.on('move', handleMove)
```

### 4. 使用统一事件

```javascript
// ✅ 推荐 - 使用统一事件
map.on('click', handleClick)
map.on('zoom', handleZoom)
map.on('move', handleMove)

// ⚠️ 谨慎 - 使用引擎特有事件
map.on('viewreset', handleViewReset)  // 会有警告
```

### 5. 事件委托

```javascript
// 对于大量图层，使用事件委托
markers.on('click', (e) => {
  // 根据ID或properties区分不同的标记点
  switch(e.properties.type) {
    case 'restaurant':
      showRestaurantInfo(e)
      break
    case 'hotel':
      showHotelInfo(e)
      break
    default:
      showDefaultInfo(e)
  }
})
```

## 引擎特有事件

某些事件是特定地图引擎支持的，HTMap 未统一标准化。使用这些事件时会收到警告。

### 腾讯地图特有事件
- `viewreset`
- `tilesloaded`
- 等

### MapboxGL 特有事件
- `style.load`
- `render`
- 等

### 四维图新特有事件
- `complete`
- 等

**注意：** 使用引擎特有事件时，需要注意跨引擎兼容性问题。

## 常见问题

### Q1: 事件无法触发？

**原因：** 
- 事件名称拼写错误
- 图层未添加到地图
- 事件被其他图层遮挡

**解决：**
```javascript
// 检查事件名称
console.log(HTMap.unifiedEvents)

// 确保图层已添加
markers.on('click', (e) => {
  console.log('点击事件', e)
})
```

### Q2: 如何阻止事件冒泡？

```javascript
markers.on('click', (e) => {
  // 处理标记点点击
  console.log('标记点点击')
  
  // 阻止事件冒泡到地图
  e.stopPropagation && e.stopPropagation()
})
```

### Q3: 事件解绑失败？

**原因：** 使用匿名函数无法精确解绑

**解决：** 使用命名函数
```javascript
const handleClick = (e) => { /* ... */ }
map.on('click', handleClick)
map.off('click', handleClick)
```

### Q4: 如何监听多个图层的相同事件？

```javascript
const handleClick = (layer) => (e) => {
  console.log(`${layer}被点击:`, e)
}

markers.on('click', handleClick('markers'))
lines.on('click', handleClick('lines'))
polygons.on('click', handleClick('polygons'))
```

---

**相关文档：**
- [地图基础操作 →](./map-operations.md)
- [标记点功能 →](./markers.md)
- [线条功能 →](./lines.md)
- [最佳实践 →](./best-practices.md)

