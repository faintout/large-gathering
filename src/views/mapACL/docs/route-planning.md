# 路线规划

本文档详细介绍 HTMap 的路线规划功能，包括路线查询、路线渲染、完整示例等。

## 概述

HTMap 提供了路线规划功能，支持驾车、步行、骑行等多种出行方式的路线查询和渲染。

**主要特性：**
- 🚗 多种出行方式（驾车、步行、骑行）
- 🛣️ 自动路线渲染
- 📍 起终点标记
- 📐 距离和时间计算
- 🎨 自定义路线样式

## 路线查询

### getRoute() 方法

用于查询两点之间的路线。

**方法签名：**
```javascript
const route = await map.getRoute(options)
```

### 参数配置

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `from` | `Array` | 是 | - | 起点坐标 [经度, 纬度] | `[116.397128, 39.916527]` |
| `to` | `Array` | 是 | - | 终点坐标 [经度, 纬度] | `[116.404448, 39.915225]` |
| `mode` | `String` | 否 | `'driving'` | 出行方式 | `'driving'` \| `'walking'` \| `'bicycling'` |
| `policy` | `String` | 否 | `'LEAST_TIME'` | 路线策略 | 见下方策略说明 |

### 出行方式（mode）

| 值 | 说明 | 适用场景 |
|---|------|---------|
| `'driving'` | 驾车 | 汽车导航 |
| `'walking'` | 步行 | 步行导航 |
| `'bicycling'` | 骑行 | 骑行导航 |

### 路线策略（policy）

#### 驾车策略

| 值 | 说明 |
|---|------|
| `'LEAST_TIME'` | 时间最短（推荐） |
| `'LEAST_DISTANCE'` | 距离最短 |
| `'LEAST_FEE'` | 费用最少（避免收费路段） |
| `'REAL_TRAFFIC'` | 躲避拥堵 |

#### 步行/骑行策略

步行和骑行一般不需要指定策略，系统会自动选择最优路线。

### 基础示例

```javascript
import HTMap from '@/utils/HTMap/index.js'

// 创建地图
const map = new HTMap('map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12
})
await map.init()

// 查询驾车路线
try {
  const route = await map.getRoute({
    from: [116.397128, 39.916527],  // 天安门
    to: [116.404448, 39.915225],    // 故宫
    mode: 'driving',
    policy: 'LEAST_TIME'
  })
  
  console.log('路线查询成功:', route)
} catch (error) {
  console.error('路线查询失败:', error)
}
```

---

## 路线数据结构

### 返回数据

```javascript
{
  // 路线坐标点数组
  polyline: [
    [116.397128, 39.916527],
    [116.398128, 39.916627],
    [116.399128, 39.916727],
    // ... 更多坐标点
    [116.404448, 39.915225]
  ],
  
  // 路线总距离（米）
  distance: 1523,
  
  // 预计用时（秒）
  duration: 360,
  
  // 路线分段信息
  steps: [
    {
      instruction: '向北行驶',
      distance: 200,
      duration: 30,
      polyline: [...]
    },
    // ... 更多分段
  ]
}
```

### 数据字段说明

| 字段名 | 类型 | 说明 | 示例值 |
|-------|------|------|--------|
| `polyline` | `Array` | 路线坐标点数组 | `[[lng, lat], ...]` |
| `distance` | `Number` | 总距离（米） | `1523` |
| `duration` | `Number` | 预计用时（秒） | `360` |
| `steps` | `Array` | 路线分段信息 | 见下方 |

### steps 分段信息

| 字段名 | 类型 | 说明 |
|-------|------|------|
| `instruction` | `String` | 路段描述 |
| `distance` | `Number` | 路段距离（米） |
| `duration` | `Number` | 路段用时（秒） |
| `polyline` | `Array` | 路段坐标点 |

---

## 路线渲染

查询到路线后，可以使用 `Lines` 类渲染到地图上。

### 基础渲染

```javascript
// 1. 查询路线
const route = await map.getRoute({
  from: [116.397128, 39.916527],
  to: [116.404448, 39.915225],
  mode: 'driving'
})

// 2. 渲染路线
const lines = new HTMap.Lines({
  map: map,
  id: 'route_line',
  geometries: [
    {
      id: 'route_1',
      paths: route.polyline,
      properties: {
        distance: route.distance,
        duration: route.duration
      },
      styleId: 'route_style'
    }
  ],
  styles: [
    {
      id: 'route_style',
      color: '#4b98fa',
      width: 6,
      borderColor: '#fff',
      borderWidth: 2,
      lineCap: 'round',
      dirArrows: true  // 显示方向箭头
    }
  ]
})
```

### 添加起终点标记

```javascript
// 创建起终点标记
const markers = new HTMap.Markers({
  map: map,
  geometries: [
    {
      id: 'start_marker',
      lngLat: [116.397128, 39.916527],
      properties: { type: 'start', name: '起点' },
      styleId: 'start_style'
    },
    {
      id: 'end_marker',
      lngLat: [116.404448, 39.915225],
      properties: { type: 'end', name: '终点' },
      styleId: 'end_style'
    }
  ],
  styles: [
    {
      id: 'start_style',
      src: '/images/start.png',
      width: 40,
      height: 46,
      offset: [-20, -46]
    },
    {
      id: 'end_style',
      src: '/images/end.png',
      width: 40,
      height: 46,
      offset: [-20, -46]
    }
  ]
})
```

---

## 完整示例

### 示例1：基础路线规划

```vue
<template>
  <div class="map-container">
    <div id="map"></div>
    
    <!-- 路线规划面板 -->
    <div class="route-panel">
      <h3>路线规划</h3>
      
      <div class="form-group">
        <label>起点：</label>
        <input v-model="from" placeholder="点击地图选择起点" readonly />
      </div>
      
      <div class="form-group">
        <label>终点：</label>
        <input v-model="to" placeholder="点击地图选择终点" readonly />
      </div>
      
      <div class="form-group">
        <label>出行方式：</label>
        <select v-model="mode">
          <option value="driving">驾车</option>
          <option value="walking">步行</option>
          <option value="bicycling">骑行</option>
        </select>
      </div>
      
      <div class="form-group" v-if="mode === 'driving'">
        <label>路线策略：</label>
        <select v-model="policy">
          <option value="LEAST_TIME">时间最短</option>
          <option value="LEAST_DISTANCE">距离最短</option>
          <option value="LEAST_FEE">费用最少</option>
          <option value="REAL_TRAFFIC">躲避拥堵</option>
        </select>
      </div>
      
      <button @click="planRoute" :disabled="!from || !to">规划路线</button>
      
      <div v-if="routeInfo" class="route-info">
        <h4>路线信息</h4>
        <p>距离：{{ (routeInfo.distance / 1000).toFixed(2) }} 公里</p>
        <p>用时：{{ Math.ceil(routeInfo.duration / 60) }} 分钟</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

const mapInstance = ref(null)
const markersInstance = ref(null)
const linesInstance = ref(null)

const from = ref('')
const to = ref('')
const fromLngLat = ref(null)
const toLngLat = ref(null)
const mode = ref('driving')
const policy = ref('LEAST_TIME')
const routeInfo = ref(null)
const selectingType = ref('from')  // 'from' | 'to'

// 规划路线
const planRoute = async () => {
  if (!fromLngLat.value || !toLngLat.value) {
    alert('请先选择起点和终点')
    return
  }
  
  try {
    // 查询路线
    const route = await mapInstance.value.getRoute({
      from: fromLngLat.value,
      to: toLngLat.value,
      mode: mode.value,
      policy: mode.value === 'driving' ? policy.value : undefined
    })
    
    // 保存路线信息
    routeInfo.value = route
    
    // 清除旧路线
    if (linesInstance.value) {
      linesInstance.value.removeLines()
    }
    
    // 渲染新路线
    const lines = new HTMap.Lines({
      map: mapInstance.value,
      id: 'route_line',
      geometries: [
        {
          id: 'route_1',
          paths: route.polyline,
          properties: {
            distance: route.distance,
            duration: route.duration
          },
          styleId: 'route_style'
        }
      ],
      styles: [
        {
          id: 'route_style',
          color: '#4b98fa',
          width: 6,
          borderColor: '#fff',
          borderWidth: 2,
          lineCap: 'round',
          dirArrows: true,
          dirAnimate: null
        }
      ]
    })
    
    linesInstance.value = lines
    
    // 自动缩放到路线范围
    mapInstance.value.fitBounds([fromLngLat.value, toLngLat.value])
    
  } catch (error) {
    console.error('路线规划失败:', error)
    alert('路线规划失败，请稍后重试')
  }
}

// 更新标记点
const updateMarkers = () => {
  // 清除旧标记
  if (markersInstance.value) {
    markersInstance.value.removeMarkers()
  }
  
  const geometries = []
  
  if (fromLngLat.value) {
    geometries.push({
      id: 'start_marker',
      lngLat: fromLngLat.value,
      properties: { type: 'start' },
      styleId: 'start_style'
    })
  }
  
  if (toLngLat.value) {
    geometries.push({
      id: 'end_marker',
      lngLat: toLngLat.value,
      properties: { type: 'end' },
      styleId: 'end_style'
    })
  }
  
  if (geometries.length > 0) {
    const markers = new HTMap.Markers({
      map: mapInstance.value,
      geometries: geometries,
      styles: [
        {
          id: 'start_style',
          src: '/images/start.png',
          width: 40,
          height: 46,
          offset: [-20, -46]
        },
        {
          id: 'end_style',
          src: '/images/end.png',
          width: 40,
          height: 46,
          offset: [-20, -46]
        }
      ]
    })
    
    markersInstance.value = markers
  }
}

onMounted(async () => {
  // 创建地图
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 12
  })
  
  await map.init()
  mapInstance.value = map
  
  // 点击地图选择起终点
  map.on('click', (e) => {
    const lngLatStr = `${e.lngLat[0].toFixed(6)}, ${e.lngLat[1].toFixed(6)}`
    
    if (!fromLngLat.value) {
      // 选择起点
      fromLngLat.value = e.lngLat
      from.value = `起点: ${lngLatStr}`
    } else if (!toLngLat.value) {
      // 选择终点
      toLngLat.value = e.lngLat
      to.value = `终点: ${lngLatStr}`
    } else {
      // 重新选择起点
      fromLngLat.value = e.lngLat
      from.value = `起点: ${lngLatStr}`
      toLngLat.value = null
      to.value = ''
      routeInfo.value = null
      
      if (linesInstance.value) {
        linesInstance.value.removeLines()
      }
    }
    
    updateMarkers()
  })
})

onBeforeUnmount(() => {
  if (linesInstance.value) {
    linesInstance.value.removeLines()
  }
  if (markersInstance.value) {
    markersInstance.value.removeMarkers()
  }
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

.route-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  z-index: 1000;
}

.route-panel h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input[readonly] {
  background: #f5f5f5;
  cursor: not-allowed;
}

button {
  width: 100%;
  padding: 10px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background: #66b1ff;
}

.route-info {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 4px;
}

.route-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #409eff;
}

.route-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}
</style>
```

---

## 高级功能

### 多条路线对比

```javascript
// 查询多条路线
const routes = await Promise.all([
  map.getRoute({ from, to, policy: 'LEAST_TIME' }),
  map.getRoute({ from, to, policy: 'LEAST_DISTANCE' }),
  map.getRoute({ from, to, policy: 'LEAST_FEE' })
])

// 渲染所有路线（不同颜色）
const colors = ['#4b98fa', '#67c23a', '#e6a23c']

routes.forEach((route, index) => {
  new HTMap.Lines({
    map: map,
    id: `route_${index}`,
    geometries: [{
      id: `route_line_${index}`,
      paths: route.polyline,
      styleId: `style_${index}`
    }],
    styles: [{
      id: `style_${index}`,
      color: colors[index],
      width: 5,
      dirArrows: true
    }]
  })
})
```

### 途经点路线

```javascript
// 多个途经点的路线规划
const waypoints = [
  [116.397128, 39.916527],  // 起点
  [116.400128, 39.918527],  // 途经点1
  [116.402128, 39.916527],  // 途经点2
  [116.404448, 39.915225]   // 终点
]

// 分段查询并拼接
const allPolylines = []
for (let i = 0; i < waypoints.length - 1; i++) {
  const route = await map.getRoute({
    from: waypoints[i],
    to: waypoints[i + 1],
    mode: 'driving'
  })
  allPolylines.push(...route.polyline)
}

// 渲染完整路线
const lines = new HTMap.Lines({
  map: map,
  geometries: [{
    id: 'full_route',
    paths: allPolylines,
    styleId: 'route_style'
  }],
  styles: [{
    id: 'route_style',
    color: '#4b98fa',
    width: 6,
    dirArrows: true
  }]
})
```

---

## 注意事项

### 1. API限制
- 需要配置有效的地图API密钥
- 注意API调用频率限制
- 大量查询建议使用缓存

### 2. 坐标格式
- 起终点坐标格式：`[经度, 纬度]`
- 确保坐标在有效范围内

### 3. 错误处理
- 路线查询可能失败（网络、距离过远等）
- 建议使用 try-catch 捕获错误

### 4. 性能优化
- 避免频繁查询路线
- 缓存已查询的路线数据
- 及时清理不需要的路线图层

---

**相关文档：**
- [线条功能 →](./lines.md)
- [标记点功能 →](./markers.md)
- [地图基础操作 →](./map-operations.md)

