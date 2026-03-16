# Markers 标记点功能

本文档详细介绍 HTMap 的标记点（Markers）功能，包括构造参数、数据结构、样式配置和所有方法的使用说明。

## 概述

`Markers` 类用于在地图上批量管理标记点，支持自定义样式、事件绑定、动态增删改查等功能。

**主要特性：**
- 📍 批量添加标记点
- 🎨 自定义图标和样式
- 🖱️ 支持点击、悬停等事件
- 👁️ 可见性控制
- 🔄 动态增删改查
- 🎯 拖拽功能
- 📏 缩放级别控制

## 构造函数

### 创建 Markers 实例

**语法：**
```javascript
const markers = new HTMap.Markers(options)
```

### 构造参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `map` | `Object` | 是 | - | 地图实例对象 | `mapInstance` |
| `id` | `String` | 否 | 自动生成 | 标记点组ID | `'markers_group_001'` |
| `geometries` | `Array` | 是 | `[]` | 几何数据数组 | [详见 geometries 数据结构 →](#geometries-数据结构) |
| `styles` | `Array` | 否 | 默认样式 | 样式配置数组 | [详见 styles 样式结构 →](#styles-样式结构) |
| `contentDom` | `Function` \| `null` | 否 | `null` | 自定义DOM生成函数 | `(properties) => DOM` |
| `draggable` | `Boolean` | 否 | `false` | 是否可拖拽 | `true` |
| `minZoom` | `Number` | 否 | - | 最小显示层级 | `3` |
| `maxZoom` | `Number` | 否 | - | 最大显示层级 | `18` |

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

// 创建标记点
const markers = new HTMap.Markers({
  map: map,
  id: 'my_markers',
  geometries: [
    {
      id: 'marker_1',
      lngLat: [116.397128, 39.916527],
      properties: {
        name: '天安门'
      },
      styleId: 'default_style'
    }
  ],
  styles: [
    {
      id: 'default_style',
      src: '/pin.png',
      width: 40,
      height: 46,
      offset: [-20, -46],
      rotation: 0,
      faceForward: 'standUp'
    }
  ]
})

// 绑定点击事件
markers.on('click', (e) => {
  console.log('点击了标记点:', e.properties.name)
})
```

## 方法快速索引

| 方法名 | 说明 | 跳转 |
|-------|------|------|
| `addToMap()` | 添加标记点到地图 | [查看详情](#addtomap-添加到地图) |
| `removeMarkers()` | 移除所有标记点 | [查看详情](#removemarkers-移除所有标记点) |
| `setVisible(visible)` | 设置可见性 | [查看详情](#setvisible-设置可见性) |
| `getVisible()` | 获取可见性状态 | [查看详情](#getvisible-获取可见性) |
| `getGeometries()` | 获取所有几何数据 | [查看详情](#getgeometries-获取几何数据) |
| `addGeometries(geometries)` | 添加新标记点 | [查看详情](#addgeometries-添加新标记点) |
| `removeGeometries(ids)` | 删除指定标记点 | [查看详情](#removegeometries-删除标记点) |
| `updateMarkersGeometries(geometries)` | 更新标记点数据 | [查看详情](#updatemarkersgeometries-更新标记点) |
| `enableDrag()` | 启用拖拽功能 | [查看详情](#enabledrag-启用拖拽) |
| `disableDrag()` | 禁用拖拽功能 | [查看详情](#disabledrag-禁用拖拽) |
| `on(eventType, callback)` | 绑定事件 | [查看详情](#on-绑定事件) |
| `off(eventType, callback)` | 解绑事件 | [查看详情](#off-解绑事件) |

---

## 数据结构参考

### geometries 数据结构

每个 geometry 对象包含以下字段：

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `id` | `String` | 否 | 标记点唯一标识 | `'marker_001'` |
| `lngLat` | `Array` | 是 | 经纬度坐标 [经度, 纬度] | `[116.397128, 39.916527]` |
| `properties` | `Object` | 否 | 自定义属性 | `{ name: '北京', type: 'city' }` |
| `styleId` | `String` | 否 | 关联的样式ID | `'style_001'` |

**geometries 完整示例：**
```javascript
geometries: [
  {
    id: 'marker_beijing',
    lngLat: [116.397128, 39.916527],  // 北京天安门
    properties: {
      name: '北京天安门',
      type: 'landmark',
      description: '中华人民共和国的象征'
    },
    styleId: 'landmark_style'
  },
  {
    id: 'marker_shanghai',
    lngLat: [121.499763, 31.239895],  // 上海外滩
    properties: {
      name: '上海外滩',
      type: 'landmark'
    },
    styleId: 'landmark_style'
  },
  {
    id: 'marker_guangzhou',
    lngLat: [113.331656, 23.109361],  // 广州塔
    properties: {
      name: '广州塔',
      type: 'landmark'
    },
    styleId: 'landmark_style'
  }
]
```

### styles 样式结构

每个 style 对象包含以下字段：

| 字段名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `id` | `String` | 是 | 自动生成 | 样式唯一标识 | `'style_001'` |
| `src` | `String` | 否 | 默认图标 | 图标图片路径 | `'/images/pin.png'` |
| `width` | `Number` | 否 | `40` | 图标宽度（像素） | `40` |
| `height` | `Number` | 否 | `46` | 图标高度（像素） | `46` |
| `offset` | `Array` | 否 | `[-20, -46]` | 图标偏移 [x, y] | `[-20, -46]` |
| `rotation` | `Number` | 否 | `0` | 旋转角度（度） | `45` |
| `faceForward` | `String` | 否 | `'standUp'` | 朝向模式 | `'standUp'` \| `'lieFlat'` |

**styles 完整示例：**
```javascript
styles: [
  {
    id: 'landmark_style',
    src: '/images/landmark-pin.png',
    width: 40,
    height: 46,
    offset: [-20, -46],    // 图标底部中心对齐到坐标点
    rotation: 0,           // 不旋转
    faceForward: 'standUp' // 直立
  },
  {
    id: 'hotel_style',
    src: '/images/hotel-pin.png',
    width: 32,
    height: 38,
    offset: [-16, -38],
    rotation: 0,
    faceForward: 'standUp'
  },
  {
    id: 'restaurant_style',
    src: '/images/restaurant-pin.png',
    width: 36,
    height: 42,
    offset: [-18, -42],
    rotation: 0,
    faceForward: 'standUp'
  }
]
```

---

## 方法详解

### addToMap() - 添加到地图

将标记点组添加到地图上。**注意：**构造函数会自动调用此方法。

**方法签名：**
```javascript
markers.addToMap()
```

**参数：** 无

**返回值：** 无

**示例：**
```javascript
const markers = new HTMap.Markers({
  map: map,
  geometries: [/* ... */],
  styles: [/* ... */]
})
// 自动调用 addToMap()，无需手动调用
```

---

### removeMarkers() - 移除所有标记点

从地图上移除所有标记点。

**方法签名：**
```javascript
markers.removeMarkers()
```

**参数：** 无

**返回值：** 无

**示例：**
```javascript
// 移除所有标记点
markers.removeMarkers()
```

---

### setVisible() - 设置可见性

设置标记点组的显示/隐藏状态。

**方法签名：**
```javascript
markers.setVisible(visible)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `visible` | `Boolean` | 是 | 是否可见 | `true` \| `false` |

**返回值：** 无

**示例：**
```javascript
// 隐藏标记点
markers.setVisible(false)

// 显示标记点
markers.setVisible(true)

// 切换可见性
const isVisible = markers.getVisible()
markers.setVisible(!isVisible)
```

---

### getVisible() - 获取可见性

获取标记点组当前的可见性状态。

**方法签名：**
```javascript
const visible = markers.getVisible()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Boolean` | 当前是否可见 | `true` \| `false` |

**示例：**
```javascript
const isVisible = markers.getVisible()
console.log('标记点是否可见:', isVisible)
// 输出: 标记点是否可见: true

if (isVisible) {
  console.log('标记点当前可见')
} else {
  console.log('标记点当前隐藏')
}
```

---

### getGeometries() - 获取几何数据

获取标记点组的所有几何数据。

**方法签名：**
```javascript
const geometries = markers.getGeometries()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Array` | 几何数据数组 | `[{ id, lngLat, properties, styleId }]` |

**示例：**
```javascript
const geometries = markers.getGeometries()
console.log('所有标记点数据:', geometries)
// 输出: [
//   {
//     id: 'marker_1',
//     lngLat: [116.397128, 39.916527],
//     properties: { name: '北京天安门' },
//     styleId: 'default_style'
//   },
//   ...
// ]

// 统计标记点数量
console.log(`共有 ${geometries.length} 个标记点`)

// 遍历标记点
geometries.forEach(geo => {
  console.log(`标记点: ${geo.properties.name}, 位置: ${geo.lngLat}`)
})
```

---

### addGeometries() - 添加新标记点

向标记点组添加新的标记点。

**方法签名：**
```javascript
markers.addGeometries(newGeometries)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `newGeometries` | `Array` | 是 | 新增的几何数据数组 | 见下方示例 |

**返回值：** 无

**示例：**
```javascript
// 添加单个标记点
markers.addGeometries([
  {
    id: 'marker_new',
    lngLat: [116.4, 39.9],
    properties: {
      name: '新标记点',
      type: 'poi'
    },
    styleId: 'default_style'
  }
])

// 批量添加多个标记点
markers.addGeometries([
  {
    id: 'marker_2',
    lngLat: [116.41, 39.91],
    properties: { name: '地点2' },
    styleId: 'default_style'
  },
  {
    id: 'marker_3',
    lngLat: [116.42, 39.92],
    properties: { name: '地点3' },
    styleId: 'default_style'
  },
  {
    id: 'marker_4',
    lngLat: [116.43, 39.93],
    properties: { name: '地点4' },
    styleId: 'default_style'
  }
])
```

---

### removeGeometries() - 删除标记点

根据ID删除指定的标记点。

**方法签名：**
```javascript
markers.removeGeometries(idsToDelete)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `idsToDelete` | `Array` | 是 | 要删除的ID数组 | `['marker_1', 'marker_2']` |

**返回值：** 无

**示例：**
```javascript
// 删除单个标记点
markers.removeGeometries(['marker_1'])

// 删除多个标记点
markers.removeGeometries(['marker_1', 'marker_2', 'marker_3'])

// 删除所有标记点（先获取所有ID）
const allGeometries = markers.getGeometries()
const allIds = allGeometries.map(geo => geo.id)
markers.removeGeometries(allIds)
```

---

### updateMarkersGeometries() - 更新标记点

批量更新标记点的数据（位置、属性、样式等）。

**方法签名：**
```javascript
markers.updateMarkersGeometries(updatedGeometries)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `updatedGeometries` | `Array` | 是 | 要更新的数据数组 | 见下方示例 |

**updatedGeometries 结构：**
每个对象必须包含 `id` 字段，其他字段为要更新的内容。

**返回值：** 无

**示例：**
```javascript
// 更新标记点位置
markers.updateMarkersGeometries([
  {
    id: 'marker_1',
    lngLat: [116.5, 40.0]  // 新位置
  }
])

// 更新标记点属性
markers.updateMarkersGeometries([
  {
    id: 'marker_1',
    properties: {
      name: '更新后的名称',
      type: 'updated'
    }
  }
])

// 更新标记点样式
markers.updateMarkersGeometries([
  {
    id: 'marker_1',
    styleId: 'new_style'
  }
])

// 同时更新多个字段
markers.updateMarkersGeometries([
  {
    id: 'marker_1',
    lngLat: [116.5, 40.0],
    properties: { name: '新名称' },
    styleId: 'new_style'
  },
  {
    id: 'marker_2',
    lngLat: [116.6, 40.1],
    properties: { name: '另一个新名称' }
  }
])
```

---

### on() - 绑定事件

为标记点组绑定事件监听器。

**方法签名：**
```javascript
markers.on(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'click'` \| `'dblclick'` \| `'mouseenter'` \| `'mouseleave'` |
| `callback` | `Function` | 是 | 回调函数 | `(e) => { console.log(e) }` |

**回调函数参数 e 的结构：**
```javascript
{
  id: 'marker_1',           // 标记点ID
  lngLat: [116.397128, 39.916527],  // 坐标
  properties: {             // 自定义属性
    name: '北京天安门',
    type: 'landmark'
  },
  // ... 其他事件信息
}
```

**返回值：**

| 类型 | 说明 |
|------|------|
| `Markers` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 绑定点击事件
markers.on('click', (e) => {
  console.log('点击了标记点:', e.properties.name)
  console.log('坐标:', e.lngLat)
  alert(`您点击了: ${e.properties.name}`)
})

// 绑定双击事件
markers.on('dblclick', (e) => {
  console.log('双击了标记点:', e.properties.name)
})

// 绑定鼠标进入事件
markers.on('mouseenter', (e) => {
  console.log('鼠标进入标记点:', e.properties.name)
  // 可以在这里改变标记点样式
})

// 绑定鼠标离开事件
markers.on('mouseleave', (e) => {
  console.log('鼠标离开标记点:', e.properties.name)
  // 恢复标记点样式
})

// 链式调用
markers
  .on('click', (e) => {
    console.log('点击:', e.properties.name)
  })
  .on('dblclick', (e) => {
    console.log('双击:', e.properties.name)
  })
```

---

### off() - 解绑事件

解除标记点组的事件监听器。

**方法签名：**
```javascript
markers.off(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'click'` |
| `callback` | `Function` | 否 | 要解绑的回调函数 | `handleClick` |

**返回值：**

| 类型 | 说明 |
|------|------|
| `Markers` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 定义命名函数便于解绑
const handleClick = (e) => {
  console.log('点击了标记点:', e.properties.name)
}

// 绑定事件
markers.on('click', handleClick)

// 解绑指定函数
markers.off('click', handleClick)

// 解绑所有click事件
markers.off('click')
```

---

### enableDrag() - 启用拖拽

启用标记点的拖拽功能。

**方法签名：**
```javascript
markers.enableDrag()
```

**参数：** 无

**返回值：** 无

**示例：**
```javascript
// 启用拖拽
markers.enableDrag()

// 绑定拖拽结束事件
markers.on('dragend', (e) => {
  console.log('拖拽后的新位置:', e.lngLat)
  console.log('标记点ID:', e.id)
})
```

---

### disableDrag() - 禁用拖拽

禁用标记点的拖拽功能。

**方法签名：**
```javascript
markers.disableDrag()
```

**参数：** 无

**返回值：** 无

**示例：**
```javascript
// 禁用拖拽
markers.disableDrag()
```

---

## 完整示例

### 示例1：城市地标标记

```javascript
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

const mapInstance = ref(null)
const markersInstance = ref(null)

onMounted(async () => {
  // 创建地图
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 5
  })
  await map.init()
  mapInstance.value = map
  
  // 创建城市地标标记点
  const markers = new HTMap.Markers({
    map: map,
    id: 'city_landmarks',
    geometries: [
      {
        id: 'beijing',
        lngLat: [116.397128, 39.916527],
        properties: {
          name: '北京',
          landmark: '天安门',
          population: '2154万',
          description: '中华人民共和国首都'
        },
        styleId: 'capital_style'
      },
      {
        id: 'shanghai',
        lngLat: [121.499763, 31.239895],
        properties: {
          name: '上海',
          landmark: '东方明珠',
          population: '2428万',
          description: '国际金融中心'
        },
        styleId: 'city_style'
      },
      {
        id: 'guangzhou',
        lngLat: [113.331656, 23.109361],
        properties: {
          name: '广州',
          landmark: '广州塔',
          population: '1868万',
          description: '千年商都'
        },
        styleId: 'city_style'
      },
      {
        id: 'shenzhen',
        lngLat: [114.057868, 22.543099],
        properties: {
          name: '深圳',
          landmark: '平安金融中心',
          population: '1768万',
          description: '改革开放窗口'
        },
        styleId: 'city_style'
      }
    ],
    styles: [
      {
        id: 'capital_style',
        src: '/images/capital-pin.png',
        width: 50,
        height: 58,
        offset: [-25, -58],
        rotation: 0,
        faceForward: 'standUp'
      },
      {
        id: 'city_style',
        src: '/images/city-pin.png',
        width: 40,
        height: 46,
        offset: [-20, -46],
        rotation: 0,
        faceForward: 'standUp'
      }
    ],
    minZoom: 4,    // 4级以上才显示
    maxZoom: 18    // 18级以下才显示
  })
  
  markersInstance.value = markers
  
  // 绑定点击事件
  markers.on('click', (e) => {
    const { name, landmark, population, description } = e.properties
    
    // 显示信息弹窗
    const popup = new HTMap.Popup({
      map: map,
      lngLat: e.lngLat,
      content: `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 10px 0;">${name}</h3>
          <p style="margin: 5px 0;"><strong>地标:</strong> ${landmark}</p>
          <p style="margin: 5px 0;"><strong>人口:</strong> ${population}</p>
          <p style="margin: 5px 0;">${description}</p>
        </div>
      `,
      showCloseBtn: true,
      offset: { x: 0, y: -58 }
    })
    
    // 平滑移动到该城市
    map.easeTo({
      center: e.lngLat,
      zoom: 10,
      duration: 2000
    })
  })
  
  // 适应所有标记点
  const allCoords = markers.getGeometries().map(geo => geo.lngLat)
  map.fitObjectsBounds({
    coordinates: allCoords,
    padding: 100,
    duration: 2000
  })
})

onBeforeUnmount(() => {
  if (markersInstance.value) {
    markersInstance.value.removeMarkers()
  }
  if (mapInstance.value) {
    mapInstance.value.destroy()
  }
})
```

### 示例2：动态添加和管理标记点

```javascript
import { ref } from 'vue'

const markers = ref(null)
const markerCount = ref(0)

// 初始化标记点组
const initMarkers = (map) => {
  markers.value = new HTMap.Markers({
    map: map,
    id: 'dynamic_markers',
    geometries: [],
    styles: [
      {
        id: 'poi_style',
        src: '/images/poi-pin.png',
        width: 32,
        height: 38,
        offset: [-16, -38],
        rotation: 0,
        faceForward: 'standUp'
      }
    ],
    draggable: true  // 可拖拽
  })
  
  // 监听拖拽事件
  markers.value.on('dragend', (e) => {
    console.log(`标记点 ${e.id} 移动到:`, e.lngLat)
  })
}

// 添加随机标记点
const addRandomMarker = () => {
  const center = [116.397128, 39.916527]
  const randomOffset = () => (Math.random() - 0.5) * 0.1
  
  markerCount.value++
  
  markers.value.addGeometries([
    {
      id: `marker_${markerCount.value}`,
      lngLat: [
        center[0] + randomOffset(),
        center[1] + randomOffset()
      ],
      properties: {
        name: `标记点 ${markerCount.value}`,
        createdAt: new Date().toISOString()
      },
      styleId: 'poi_style'
    }
  ])
}

// 删除指定标记点
const deleteMarker = (markerId) => {
  markers.value.removeGeometries([markerId])
}

// 删除所有标记点
const deleteAllMarkers = () => {
  const geometries = markers.value.getGeometries()
  const ids = geometries.map(geo => geo.id)
  markers.value.removeGeometries(ids)
  markerCount.value = 0
}

// 更新标记点位置
const updateMarkerPosition = (markerId, newLngLat) => {
  markers.value.updateMarkersGeometries([
    {
      id: markerId,
      lngLat: newLngLat
    }
  ])
}

// 切换可见性
const toggleVisibility = () => {
  const isVisible = markers.value.getVisible()
  markers.value.setVisible(!isVisible)
}

// 启用/禁用拖拽
const toggleDrag = (enable) => {
  if (enable) {
    markers.value.enableDrag()
  } else {
    markers.value.disableDrag()
  }
}
```

---

## 注意事项

### 1. 坐标格式
- 必须使用 `[经度, 纬度]` 格式
- 经度范围：-180 到 180
- 纬度范围：-90 到 90

### 2. 性能优化
- 大量标记点（>1000个）建议使用聚合功能（Clusters）
- 使用 `minZoom` 和 `maxZoom` 控制显示层级
- 及时调用 `removeMarkers()` 清理不需要的标记点

### 3. 事件处理
- 使用命名函数便于解绑事件
- 避免在事件回调中进行大量计算
- 及时解绑不需要的事件监听器

### 4. 样式图片
- 建议使用 PNG 格式，支持透明背景
- 图片尺寸建议在 32x32 到 64x64 之间
- 使用 CDN 或本地资源加速加载

### 5. 拖拽功能
- 拖拽功能需要在构造时设置 `draggable: true` 或调用 `enableDrag()`
- 拖拽事件包括：`dragstart`、`drag`、`dragend`
- 拖拽可能影响地图性能，谨慎使用

---

## DomMarker 单个DOM标记点

HTMap 提供了 `Marker` (DomMarker) 类用于管理单个自定义DOM标记点，适合需要高度自定义外观的场景。

### 与 Markers 的区别

| 特性 | Markers | Marker (DomMarker) |
|------|---------|-------------------|
| 用途 | 批量管理多个标记点 | 管理单个自定义标记点 |
| 样式 | 使用图片样式 | 使用自定义DOM元素 |
| 性能 | 适合大量标记点 | 适合少量自定义标记点 |
| 自定义 | 样式受限 | 完全自定义HTML/CSS |

### 创建 DomMarker

#### 方式一：使用 HTMap.Marker 类

```javascript
const marker = new HTMap.Marker({
  map: map,
  lngLat: [116.397128, 39.916527],
  contentDom: '<div class="custom-marker">自定义标记</div>',
  draggable: true,
  offset: [0, -20],
  properties: {
    name: '天安门',
    type: 'landmark'
  },
  minZoom: 5,
  maxZoom: 18
})
```

#### 方式二：使用 map.addDomMarker 方法

```javascript
const marker = map.addDomMarker({
  lngLat: [116.397128, 39.916527],
  contentDom: document.getElementById('my-marker'),
  draggable: false
})
```

### 构造参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| `map` | `Object` | 是 | - | 地图实例 |
| `lngLat` | `Array` | 是 | - | 位置坐标 [经度, 纬度] |
| `contentDom` | `HTMLElement` \| `String` | 否 | 默认图标 | 自定义DOM元素或HTML字符串 |
| `draggable` | `Boolean` | 否 | `false` | 是否可拖拽 |
| `offset` | `Array` | 否 | `[0, 0]` | 偏移量 [x, y] |
| `properties` | `Object` | 否 | `{}` | 自定义属性 |
| `minZoom` | `Number` | 否 | - | 最小显示层级 |
| `maxZoom` | `Number` | 否 | - | 最大显示层级 |

### 方法

#### removeDomMarker() - 移除标记点

```javascript
marker.removeDomMarker()
```

#### setVisible(visible) - 设置可见性

```javascript
marker.setVisible(true)   // 显示
marker.setVisible(false)  // 隐藏
```

#### getVisible() - 获取可见性

```javascript
const visible = marker.getVisible()
```

#### setLngLat(lngLat) - 设置位置

```javascript
marker.setLngLat([116.4, 39.92])
```

#### getLngLat() - 获取位置

```javascript
const lngLat = marker.getLngLat()
```

#### updateMarkerDom(newContentDom) - 更新DOM元素

```javascript
marker.updateMarkerDom('<div class="new-style">更新后的内容</div>')
```

#### on(event, callback) - 绑定事件

```javascript
marker.on('click', (e) => {
  console.log('标记点被点击')
})
```

#### off(event, callback) - 解绑事件

```javascript
marker.off('click', handleClick)
```

### 完整示例

```javascript
import { ref } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

// 创建自定义标记点
const createCustomMarker = (map) => {
  // 创建自定义DOM元素
  const markerElement = document.createElement('div')
  markerElement.className = 'custom-marker'
  markerElement.innerHTML = `
    <div class="marker-icon">
      <img src="/marker-icon.png" />
      <div class="marker-label">天安门</div>
    </div>
  `
  
  // 创建标记点
  const marker = new HTMap.Marker({
    map: map,
    lngLat: [116.397128, 39.916527],
    contentDom: markerElement,
    draggable: true,
    offset: [0, -30],
    properties: {
      name: '天安门',
      type: 'landmark',
      description: '中华人民共和国的象征'
    },
    minZoom: 5,
    maxZoom: 18
  })
  
  // 绑定点击事件
  marker.on('click', () => {
    console.log('点击了自定义标记点')
    alert('天安门 - 中华人民共和国的象征')
  })
  
  // 绑定拖拽结束事件
  marker.on('dragend', () => {
    const newPos = marker.getLngLat()
    console.log('新位置:', newPos)
  })
  
  return marker
}

// 使用HTML字符串创建标记点
const createHTMLMarker = (map) => {
  const marker = new HTMap.Marker({
    map: map,
    lngLat: [116.404448, 39.915225],
    contentDom: `
      <div style="
        background: #ff4444;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        故宫
      </div>
    `,
    offset: [0, -10]
  })
  
  marker.on('click', () => {
    marker.updateMarkerDom(`
      <div style="
        background: #44ff44;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        故宫 (已访问)
      </div>
    `)
  })
  
  return marker
}
```

### 样式定制

```css
/* 自定义标记点样式 */
.custom-marker {
  position: relative;
  cursor: pointer;
}

.marker-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;
}

.marker-icon:hover {
  transform: scale(1.1);
}

.marker-icon img {
  width: 32px;
  height: 38px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.marker-label {
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
```

### 注意事项

1. **性能考虑**：DomMarker 使用DOM元素，大量使用会影响性能。如果需要显示大量标记点，建议使用 `Markers` 类。

2. **默认图标**：如果不提供 `contentDom`，会使用默认图标（38x46像素的图钉图标）。

3. **坐标验证**：`lngLat` 必须是有效的经纬度坐标，否则会抛出错误。

4. **缩放级别限制**：`minZoom` 和 `maxZoom` 会自动限制在地图引擎允许的范围内。

5. **事件绑定时机**：如果标记点还未完全添加到地图，事件绑定会自动延迟执行。

---

**相关文档：**
- [地图基础操作 →](./map-operations.md)
- [线条功能 →](./lines.md)
- [聚合功能 →](./clusters.md)
- [事件系统 →](./events.md)

