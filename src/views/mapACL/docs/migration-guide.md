# 迁移指南

本文档提供从原生地图API迁移到HTMap的指南，以及不同地图引擎间切换的方法。

## 从腾讯地图迁移

### 原生腾讯地图

```javascript
// 原生腾讯地图代码
const map = new TMap.Map('map', {
  center: new TMap.LatLng(39.916527, 116.397128),
  zoom: 12,
  pitch: 0,
  rotation: 0
})

const marker = new TMap.MultiMarker({
  map: map,
  geometries: [
    {
      id: 'marker_1',
      position: new TMap.LatLng(39.916527, 116.397128),
      properties: {
        title: '标记点'
      }
    }
  ]
})

marker.on('click', (e) => {
  console.log('点击了标记点')
})
```

### 迁移到HTMap

```javascript
// HTMap代码
const map = new HTMap('map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],  // 注意：[经度, 纬度]
  zoom: 12,
  pitch: 0,
  rotation: 0
})

await map.init()

const markers = new HTMap.Markers({
  map: map,
  geometries: [
    {
      id: 'marker_1',
      lngLat: [116.397128, 39.916527],  // 注意：[经度, 纬度]
      properties: {
        name: '标记点'
      },
      styleId: 'default_style'
    }
  ],
  styles: [
    {
      id: 'default_style',
      src: '/pin.png',
      width: 40,
      height: 46
    }
  ]
})

markers.on('click', (e) => {
  console.log('点击了标记点')
})
```

### 主要差异

| 功能 | 腾讯地图 | HTMap |
|------|---------|-------|
| 坐标格式 | `LatLng(lat, lng)` | `[lng, lat]` |
| 地图创建 | 同步 | 异步（需await） |
| 标记点 | `MultiMarker` | `HTMap.Markers` |
| 事件绑定 | 直接on | 统一on |

---

## 从MapboxGL迁移

### 原生MapboxGL

```javascript
// 原生MapboxGL代码
mapboxgl.accessToken = 'your-token'

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [116.397128, 39.916527],
  zoom: 12
})

map.on('load', () => {
  map.addLayer({
    id: 'markers',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [116.397128, 39.916527]
            },
            properties: {
              title: '标记点'
            }
          }
        ]
      }
    },
    layout: {
      'icon-image': 'marker-15'
    }
  })
})
```

### 迁移到HTMap

```javascript
// HTMap代码
const map = new HTMap('map', {
  engine: 'mapboxgl',  // 指定引擎为mapboxgl
  center: [116.397128, 39.916527],
  zoom: 12
})

await map.init()  // 等待地图加载完成

const markers = new HTMap.Markers({
  map: map,
  geometries: [
    {
      id: 'marker_1',
      lngLat: [116.397128, 39.916527],
      properties: {
        name: '标记点'
      },
      styleId: 'default_style'
    }
  ],
  styles: [
    {
      id: 'default_style',
      src: '/pin.png',
      width: 40,
      height: 46
    }
  ]
})
```

### 主要差异

| 功能 | MapboxGL | HTMap |
|------|----------|-------|
| 图层管理 | 手动addLayer | 自动管理 |
| GeoJSON | 需要手动构造 | 自动处理 |
| 样式配置 | layout/paint | 统一styles |
| 加载完成 | on('load') | await init() |

---

## 不同引擎间切换

HTMap 最大的优势之一就是可以轻松切换地图引擎，无需修改业务代码。

### 切换步骤

**1. 修改配置文件**

```javascript
// config/map.config.js

// 腾讯地图配置
export const tencentConfig = {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12
}

// MapboxGL配置
export const mapboxConfig = {
  engine: 'mapboxgl',
  center: [116.397128, 39.916527],
  zoom: 12
}

// 四维图新配置
export const minemapConfig = {
  engine: 'minemap',
  center: [116.397128, 39.916527],
  zoom: 12
}
```

**2. 切换引擎**

```javascript
import { tencentConfig, mapboxConfig } from './config/map.config.js'

// 使用腾讯地图
const map = new HTMap('map', tencentConfig)

// 切换到MapboxGL（只需修改配置）
// const map = new HTMap('map', mapboxConfig)

await map.init()

// 业务代码完全相同，无需修改
const markers = new HTMap.Markers({
  map: map,
  geometries: [/* ... */],
  styles: [/* ... */]
})
```

### 切换注意事项

#### 1. 坐标系统

HTMap 统一使用 WGS84 坐标系（经纬度），但注意：
- 国内地图可能需要坐标转换
- 腾讯地图使用GCJ02坐标系

#### 2. 样式差异

某些样式在不同引擎中可能有细微差异：
- 线条发光效果（`emitLight`）在某些引擎可能不支持
- 凸多边形（`isConvex`）在某些引擎可能不支持
- MapboxGL表达式会自动转换（腾讯地图）

#### 3. 功能限制

| 功能 | 腾讯地图 | MapboxGL | 四维图新 |
|------|---------|----------|---------|
| 3D视图 | ✅ | ✅ | ✅ |
| 路线规划 | ✅ | ❌ | ✅ |
| 聚合 | ✅ | ✅ | ✅ |
| 自定义DOM标记 | ✅ | ⚠️ | ✅ |

---

## 配置迁移

### SDK配置

不同引擎需要不同的SDK配置。

**腾讯地图：**
```javascript
// src/utils/HTMap/config/sdkConfig.js
export const sdkConfig = {
  tencent: {
    key: 'your-tencent-key',
    version: '1.0'
  }
}
```

**MapboxGL：**
```javascript
export const sdkConfig = {
  mapboxgl: {
    accessToken: 'your-mapbox-token',
    style: 'mapbox://styles/mapbox/streets-v11'
  }
}
```

**四维图新：**
```javascript
export const sdkConfig = {
  minemap: {
    key: 'your-minemap-key',
    solution: 'your-solution-id'
  }
}
```

---

## 常见迁移场景

### 场景1：大量标记点

**原生代码：**
```javascript
// 腾讯地图
const markers = new TMap.MultiMarker({
  map: map,
  geometries: largeDataset.map(item => ({
    id: item.id,
    position: new TMap.LatLng(item.lat, item.lng)
  }))
})
```

**HTMap（推荐使用聚合）：**
```javascript
const clusters = new HTMap.Clusters({
  map: map,
  geometries: largeDataset.map(item => ({
    id: item.id,
    lngLat: [item.lng, item.lat],  // 注意：[经度, 纬度]
    properties: item,
    styleId: 'default_style'
  })),
  clusterConfig: {
    maxZoom: 17,
    minCount: 2,
    radius: 60
  }
})
```

### 场景2：绘制路线

**原生代码：**
```javascript
// 腾讯地图
const line = new TMap.MultiPolyline({
  map: map,
  geometries: [
    {
      id: 'line_1',
      paths: routeData.map(point => 
        new TMap.LatLng(point.lat, point.lng)
      ),
      styleId: 'style_1'
    }
  ],
  styles: {
    'style_1': {
      color: '#3777FF',
      width: 6
    }
  }
})
```

**HTMap：**
```javascript
const lines = new HTMap.Lines({
  map: map,
  geometries: [
    {
      id: 'line_1',
      paths: routeData.map(point => [point.lng, point.lat]),
      styleId: 'style_1'
    }
  ],
  styles: [
    {
      id: 'style_1',
      color: '#3777FF',
      width: 6,
      dirArrows: true  // 显示方向箭头
    }
  ]
})
```

### 场景3：信息窗口

**原生代码：**
```javascript
// 腾讯地图
const infoWindow = new TMap.InfoWindow({
  map: map,
  position: new TMap.LatLng(39.916527, 116.397128),
  content: '<div>信息窗口内容</div>'
})
```

**HTMap：**
```javascript
const popup = new HTMap.Popup({
  map: map,
  lngLat: [116.397128, 39.916527],
  content: '<div>信息窗口内容</div>',
  offset: { x: 0, y: -20 },
  showCloseBtn: true
})
```

---

## 迁移检查清单

### 代码层面

- [ ] 坐标格式转换（LatLng → [lng, lat]）
- [ ] 地图初始化改为异步（await init()）
- [ ] 标记点使用Markers类
- [ ] 线条使用Lines类
- [ ] 多边形使用Polygons类
- [ ] 聚合使用Clusters类
- [ ] 弹窗使用Popup类
- [ ] 事件绑定统一使用on/off
- [ ] 清理资源使用统一方法

### 配置层面

- [ ] 更新SDK配置
- [ ] 配置地图引擎
- [ ] 配置地图密钥/Token
- [ ] 配置默认样式
- [ ] 配置默认缩放范围

### 测试层面

- [ ] 地图初始化测试
- [ ] 标记点显示测试
- [ ] 线条绘制测试
- [ ] 多边形绘制测试
- [ ] 事件交互测试
- [ ] 性能测试
- [ ] 多引擎切换测试

---

## 迁移最佳实践

### 1. 渐进式迁移

不要一次性迁移所有代码，建议分模块逐步迁移：

```javascript
// 第1步：迁移地图初始化
const map = new HTMap('map', config)
await map.init()

// 第2步：迁移标记点
const markers = new HTMap.Markers({ /* ... */ })

// 第3步：迁移其他图层
// ...
```

### 2. 封装通用配置

```javascript
// config/map.config.js
export const getMapConfig = (engine = 'tencent') => {
  const baseConfig = {
    center: [116.397128, 39.916527],
    zoom: 12,
    minZoom: 3,
    maxZoom: 22
  }
  
  return {
    ...baseConfig,
    engine
  }
}

// 使用
const map = new HTMap('map', getMapConfig('tencent'))
```

### 3. 统一坐标转换

```javascript
// utils/coordinate.js
export const toHTMapLngLat = (lat, lng) => {
  return [lng, lat]
}

export const toHTMapLngLatArray = (coords) => {
  return coords.map(coord => [coord.lng, coord.lat])
}

// 使用
const lngLat = toHTMapLngLat(39.916527, 116.397128)
```

### 4. 错误处理

```javascript
try {
  const map = new HTMap('map', config)
  await map.init()
  
  const markers = new HTMap.Markers({ /* ... */ })
  
} catch (error) {
  console.error('地图初始化失败:', error)
  // 降级方案
  showStaticMap()
}
```

---

## 获取帮助

如果在迁移过程中遇到问题：

1. 查看 [API参考](./api-reference.md)
2. 查看 [最佳实践](./best-practices.md)
3. 查看 [常见问题](./best-practices.md#常见问题)
4. [提交Issue](https://github.com/your-repo/HTMap/issues)

---

**相关文档：**
- [快速开始 →](./getting-started.md)
- [核心概念 →](./core-concepts.md)
- [API参考 →](./api-reference.md)
- [最佳实践 →](./best-practices.md)

