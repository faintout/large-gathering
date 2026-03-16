# Clusters 聚合功能

本文档详细介绍 HTMap 的点聚合（Clusters）功能，包括构造参数、数据结构、样式配置和所有方法的使用说明。

## 概述

`Clusters` 类用于在地图上智能地聚合大量点位数据，当点位密集时自动聚合为聚合点，提升地图性能和用户体验。

**主要特性：**
- 🎯 智能聚合算法
- 🎨 丰富的聚合样式（支持MapboxGL表达式）
- 📊 动态聚合数量显示
- 🖱️ 点击自动放大
- 👁️ 可自定义聚合点和非聚合点样式
- 🌐 支持DOM自定义渲染
- ⚡ 高性能处理海量数据

## 构造函数

### 创建 Clusters 实例

**语法：**
```javascript
const clusters = new HTMap.Clusters(options)
```

### 构造参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `map` | `Object` | 是 | - | 地图实例对象 | `mapInstance` |
| `id` | `String` | 否 | 自动生成 | 聚合组ID | `'clusters_group_001'` |
| `geometries` | `Array` | 是 | `[]` | 几何数据数组 | [详见 geometries 数据结构 →](#geometries-数据结构) |
| `clusterConfig` | `Object` | 否 | 默认配置 | 聚合配置 | [详见 clusterConfig 配置 →](#clusterconfig-配置结构) |
| `clusterStyle` | `Object` | 否 | 默认样式 | 聚合点样式 | [详见 clusterStyle 样式 →](#clusterstyle-聚合点样式) |
| `nonClustersStyle` | `Array` | 否 | 默认样式 | 非聚合点样式数组 | [详见 nonClustersStyle 样式 →](#nonclustersStyle-非聚合点样式) |
| `nonClustersDom` | `DOM` \| `null` | 否 | `null` | 非聚合点DOM元素 | DOM元素 |

### 基础示例

```javascript
import HTMap from '@/utils/HTMap/index.js'

// 创建地图
const map = new HTMap('map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 10
})
await map.init()

// 创建聚合点
const clusters = new HTMap.Clusters({
  map: map,
  id: 'my_clusters',
  geometries: [
    {
      id: 'point_1',
      lngLat: [116.397128, 39.916527],
      properties: { name: '点位1' },
      styleId: 'default_style'
    },
    {
      id: 'point_2',
      lngLat: [116.404448, 39.915225],
      properties: { name: '点位2' },
      styleId: 'default_style'
    }
    // ... 更多点位
  ],
  clusterConfig: {
    maxZoom: 17,
    minCount: 2,
    radius: 60,
    zoomOnClick: true
  },
  clusterStyle: {
    circleColor: '#50A0FF',
    circleRadius: 20,
    strokeColor: '#FFFFFF',
    strokeWidth: 4,
    textColor: '#FFFFFF',
    textSize: 14,
    clusterCustom: null
  },
  nonClustersStyle: [
    {
      id: 'default_style',
      src: '/pin.png',
      width: 40,
      height: 46,
      offset: [-20, -46],
      rotation: 0,
      faceForward: 'standUp'
    }
  ],
  nonClustersDom: null
})

// 绑定点击事件
clusters.on('click', (e) => {
  if (e.cluster) {
    console.log('点击了聚合点，包含', e.point_count, '个点')
  } else {
    console.log('点击了单个点:', e.properties.name)
  }
})
```

## 方法快速索引

| 方法名 | 说明 | 跳转 |
|-------|------|------|
| `addToMap()` | 添加聚合点到地图 | [查看详情](#addtomap-添加到地图) |
| `removeClusters()` | 移除所有聚合点 | [查看详情](#removeclusters-移除所有聚合点) |
| `on(eventType, callback)` | 绑定事件 | [查看详情](#on-绑定事件) |
| `off(eventType, callback)` | 解绑事件 | [查看详情](#off-解绑事件) |

---

## 数据结构参考

### geometries 数据结构

每个 geometry 对象包含以下字段：

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `id` | `String` | 否 | 点位唯一标识 | `'point_001'` |
| `lngLat` | `Array` | 是 | 经纬度坐标 [经度, 纬度] | `[116.397128, 39.916527]` |
| `properties` | `Object` | 否 | 自定义属性 | `{ name: '北京', count: 10 }` |
| `styleId` | `String` | 否 | 关联的非聚合样式ID | `'style_001'` |

**geometries 完整示例：**
```javascript
geometries: [
  {
    id: 'point_1',
    lngLat: [116.397128, 39.916527],  // 天安门
    properties: {
      name: '故宫博物院',
      type: 'museum',
      rating: 5,
      visitors: 50000
    },
    styleId: 'museum_style'
  },
  {
    id: 'point_2',
    lngLat: [116.404448, 39.915225],  // 故宫
    properties: {
      name: '景山公园',
      type: 'park',
      rating: 4.5,
      visitors: 20000
    },
    styleId: 'park_style'
  },
  {
    id: 'point_3',
    lngLat: [116.391311, 39.906726],  // 天坛
    properties: {
      name: '天坛公园',
      type: 'park',
      rating: 5,
      visitors: 30000
    },
    styleId: 'park_style'
  }
]
```

### clusterConfig 配置结构

聚合行为配置：

| 字段名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `maxZoom` | `Number` | 否 | `17` | 最大聚合缩放级别 | `17` |
| `minCount` | `Number` | 否 | `2` | 最小聚合数量 | `2` |
| `radius` | `Number` | 否 | `60` | 聚合半径（像素） | `60` |
| `zoomOnClick` | `Boolean` | 否 | `true` | 点击聚合点是否放大 | `true` |

**clusterConfig 完整示例：**
```javascript
clusterConfig: {
  maxZoom: 17,        // 缩放级别>17时不再聚合
  minCount: 2,        // 至少2个点才聚合
  radius: 60,         // 60像素半径内的点聚合在一起
  zoomOnClick: true   // 点击聚合点自动放大
}
```

**配置说明：**
- `maxZoom`: 当地图缩放级别大于此值时，不再进行聚合，显示所有单个点
- `minCount`: 只有当聚合点包含的点数大于等于此值时才显示为聚合点
- `radius`: 聚合半径越大，聚合的点越多
- `zoomOnClick`: 设为true时，点击聚合点会自动放大地图

### clusterStyle 聚合点样式

聚合点的样式配置，支持单一值和MapboxGL表达式：

| 字段名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `circleColor` | `String` \| `Array` | 否 | `'#50A0FF'` | 圆圈颜色 | `'#50A0FF'` 或表达式 |
| `circleRadius` | `Number` \| `Array` | 否 | `20` | 圆圈半径 | `20` 或表达式 |
| `strokeColor` | `String` | 否 | `'#50A0FF'` | 边框颜色 | `'#FFFFFF'` |
| `strokeWidth` | `Number` | 否 | `4` | 边框宽度 | `4` |
| `textColor` | `String` | 否 | `'#FFFFFF'` | 文字颜色 | `'#FFFFFF'` |
| `textSize` | `Number` | 否 | `14` | 文字大小 | `14` |
| `clusterCustom` | `Object` \| `null` | 否 | `null` | 自定义聚合配置 | `null` |

#### 基础样式示例（单一值）

```javascript
clusterStyle: {
  circleColor: '#50A0FF',     // 蓝色圆圈
  circleRadius: 20,           // 半径20像素
  strokeColor: '#FFFFFF',     // 白色边框
  strokeWidth: 4,             // 边框宽度4像素
  textColor: '#FFFFFF',       // 白色文字
  textSize: 14,               // 文字大小14px
  clusterCustom: null
}
```

#### 高级样式示例（MapboxGL表达式）

使用表达式可以根据聚合点数量动态改变样式：

```javascript
clusterStyle: {
  // 根据聚合点数量改变颜色
  circleColor: [
    'step',
    ['get', 'point_count'],
    '#51bbd6',    // < 100个点：蓝色
    100,
    '#f1f075',    // 100-750个点：黄色
    750,
    '#f28cb1'     // > 750个点：粉色
  ],
  
  // 根据聚合点数量改变半径
  circleRadius: [
    'step',
    ['get', 'point_count'],
    20,           // < 100个点：半径20
    100,
    30,           // 100-750个点：半径30
    750,
    40            // > 750个点：半径40
  ],
  
  strokeColor: '#FFFFFF',
  strokeWidth: 4,
  textColor: '#FFFFFF',
  textSize: 14,
  clusterCustom: null
}
```

**MapboxGL 表达式语法：**
```javascript
[
  'step',                      // 阶梯函数
  ['get', 'point_count'],      // 获取聚合点数量
  defaultValue,                // 默认值（小于第一个阈值）
  threshold1, value1,          // 阈值1及对应值
  threshold2, value2,          // 阈值2及对应值
  ...
]
```

### nonClustersStyle 非聚合点样式

非聚合点（单个点）的样式数组，结构与 Markers 样式一致：

| 字段名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `id` | `String` | 是 | 自动生成 | 样式唯一标识 | `'style_001'` |
| `src` | `String` | 否 | 默认图标 | 图标图片路径 | `'/pin.png'` |
| `width` | `Number` | 否 | `40` | 图标宽度 | `40` |
| `height` | `Number` | 否 | `46` | 图标高度 | `46` |
| `offset` | `Array` | 否 | `[-20, -46]` | 图标偏移 [x, y] | `[-20, -46]` |
| `rotation` | `Number` | 否 | `0` | 旋转角度 | `0` |
| `faceForward` | `String` | 否 | `'standUp'` | 朝向方式 | `'standUp'` \| `'lieFlat'` |

**nonClustersStyle 完整示例：**
```javascript
nonClustersStyle: [
  {
    id: 'museum_style',
    src: '/images/museum-pin.png',
    width: 40,
    height: 46,
    offset: [-20, -46],
    rotation: 0,
    faceForward: 'standUp'
  },
  {
    id: 'park_style',
    src: '/images/park-pin.png',
    width: 35,
    height: 41,
    offset: [-17.5, -41],
    rotation: 0,
    faceForward: 'standUp'
  }
]
```

---

## 方法详解

### addToMap() - 添加到地图

将聚合点组添加到地图上。**注意：**构造函数会自动调用此方法。

**方法签名：**
```javascript
clusters.addToMap()
```

**参数：** 无

**返回值：** 无

---

### removeClusters() - 移除所有聚合点

从地图上移除所有聚合点。

**方法签名：**
```javascript
clusters.removeClusters()
```

**参数：** 无

**返回值：** 无

**示例：**
```javascript
// 移除所有聚合点
clusters.removeClusters()
```

---

### on() - 绑定事件

为聚合点组绑定事件监听器。

**方法签名：**
```javascript
clusters.on(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'click'` \| `'dblclick'` |
| `callback` | `Function` | 是 | 回调函数 | `(e) => { console.log(e) }` |

**回调函数参数 e 的结构（聚合点）：**
```javascript
{
  cluster: true,              // 是否为聚合点
  cluster_id: 123,            // 聚合点ID
  point_count: 50,            // 包含的点数
  lngLat: [116.397128, 39.916527],  // 聚合点位置
  // ... 其他信息
}
```

**回调函数参数 e 的结构（单个点）：**
```javascript
{
  cluster: false,             // 不是聚合点
  id: 'point_1',              // 点位ID
  lngLat: [116.397128, 39.916527],  // 点位位置
  properties: {               // 自定义属性
    name: '点位1',
    type: 'museum'
  }
  // ... 其他信息
}
```

**返回值：**

| 类型 | 说明 |
|------|------|
| `Clusters` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 绑定点击事件 - 区分聚合点和单个点
clusters.on('click', (e) => {
  if (e.cluster) {
    // 点击的是聚合点
    console.log(`聚合点被点击，包含 ${e.point_count} 个点`)
    console.log('聚合点位置:', e.lngLat)
  } else {
    // 点击的是单个点
    console.log('单个点被点击:', e.properties.name)
    console.log('点位ID:', e.id)
    console.log('点位位置:', e.lngLat)
  }
})

// 绑定双击事件
clusters.on('dblclick', (e) => {
  if (e.cluster) {
    console.log('双击聚合点')
  } else {
    console.log('双击单个点:', e.properties)
  }
})

// 链式调用
clusters
  .on('click', (e) => {
    console.log('点击事件', e)
  })
  .on('dblclick', (e) => {
    console.log('双击事件', e)
  })
```

---

### off() - 解绑事件

解除聚合点组的事件监听器。

**方法签名：**
```javascript
clusters.off(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'click'` |
| `callback` | `Function` | 否 | 要解绑的回调函数 | `handleClick` |

**返回值：**

| 类型 | 说明 |
|------|------|
| `Clusters` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 定义命名函数便于解绑
const handleClick = (e) => {
  console.log('点击事件', e.properties)
}

// 绑定事件
clusters.on('click', handleClick)

// 解绑指定函数
clusters.off('click', handleClick)

// 解绑所有click事件
clusters.off('click')
```

---

## 完整示例

### 示例1：城市POI聚合

```vue
<template>
  <div class="map-container">
    <div id="map"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>POI聚合控制</h3>
      <div class="stats">
        <p>总点位数: {{ totalPoints }}</p>
        <p>当前缩放: {{ currentZoom }}</p>
      </div>
      <button @click="toggleClusters">{{ showClusters ? '隐藏' : '显示' }}聚合</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

const mapInstance = ref(null)
const clustersInstance = ref(null)
const totalPoints = ref(0)
const currentZoom = ref(10)
const showClusters = ref(true)

// 生成模拟POI数据
const generatePOIData = (count = 1000) => {
  const types = ['restaurant', 'hotel', 'shopping', 'attraction']
  const data = []
  
  // 北京市中心附近随机生成点位
  for (let i = 0; i < count; i++) {
    const lng = 116.2 + Math.random() * 0.4  // 116.2 ~ 116.6
    const lat = 39.8 + Math.random() * 0.3   // 39.8 ~ 40.1
    const type = types[Math.floor(Math.random() * types.length)]
    
    data.push({
      id: `poi_${i}`,
      lngLat: [lng, lat],
      properties: {
        name: `${type}_${i}`,
        type: type,
        rating: (Math.random() * 5).toFixed(1)
      },
      styleId: `${type}_style`
    })
  }
  
  return data
}

const toggleClusters = () => {
  if (clustersInstance.value) {
    if (showClusters.value) {
      clustersInstance.value.removeClusters()
    } else {
      clustersInstance.value.addToMap()
    }
    showClusters.value = !showClusters.value
  }
}

onMounted(async () => {
  // 创建地图
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 10
  })
  
  await map.init()
  mapInstance.value = map
  
  // 生成POI数据
  const poiData = generatePOIData(1000)
  totalPoints.value = poiData.length
  
  // 创建聚合点
  const clusters = new HTMap.Clusters({
    map: map,
    id: 'poi_clusters',
    geometries: poiData,
    clusterConfig: {
      maxZoom: 17,
      minCount: 2,
      radius: 60,
      zoomOnClick: true
    },
    clusterStyle: {
      // 根据点数动态改变颜色
      circleColor: [
        'step',
        ['get', 'point_count'],
        '#51bbd6',    // < 100
        100,
        '#f1f075',    // 100-750
        750,
        '#f28cb1'     // > 750
      ],
      // 根据点数动态改变半径
      circleRadius: [
        'step',
        ['get', 'point_count'],
        20,           // < 100
        100,
        30,           // 100-750
        750,
        40            // > 750
      ],
      strokeColor: '#FFFFFF',
      strokeWidth: 4,
      textColor: '#FFFFFF',
      textSize: 14,
      clusterCustom: null
    },
    nonClustersStyle: [
      {
        id: 'restaurant_style',
        src: '/images/restaurant.png',
        width: 36,
        height: 42,
        offset: [-18, -42],
        rotation: 0,
        faceForward: 'standUp'
      },
      {
        id: 'hotel_style',
        src: '/images/hotel.png',
        width: 36,
        height: 42,
        offset: [-18, -42],
        rotation: 0,
        faceForward: 'standUp'
      },
      {
        id: 'shopping_style',
        src: '/images/shopping.png',
        width: 36,
        height: 42,
        offset: [-18, -42],
        rotation: 0,
        faceForward: 'standUp'
      },
      {
        id: 'attraction_style',
        src: '/images/attraction.png',
        width: 36,
        height: 42,
        offset: [-18, -42],
        rotation: 0,
        faceForward: 'standUp'
      }
    ]
  })
  
  clustersInstance.value = clusters
  
  // 绑定点击事件
  clusters.on('click', (e) => {
    if (e.cluster) {
      console.log(`聚合点包含 ${e.point_count} 个点`)
      // zoomOnClick为true时会自动放大
    } else {
      alert(`名称: ${e.properties.name}\n类型: ${e.properties.type}\n评分: ${e.properties.rating}`)
    }
  })
  
  // 监听缩放变化
  map.on('zoom', () => {
    currentZoom.value = map.getZoom().toFixed(2)
  })
})

onBeforeUnmount(() => {
  if (clustersInstance.value) {
    clustersInstance.value.removeClusters()
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

.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.control-panel h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.stats p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.control-panel button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
  border: none;
  background: #409eff;
  color: white;
  border-radius: 4px;
}

.control-panel button:hover {
  background: #66b1ff;
}
</style>
```

### 示例2：动态更新聚合数据

```javascript
import { ref } from 'vue'

const clusters = ref(null)
let poiIdCounter = 0

// 初始化聚合
const initClusters = (map) => {
  clusters.value = new HTMap.Clusters({
    map: map,
    id: 'dynamic_clusters',
    geometries: [],
    clusterConfig: {
      maxZoom: 17,
      minCount: 2,
      radius: 60,
      zoomOnClick: true
    },
    clusterStyle: {
      circleColor: [
        'step',
        ['get', 'point_count'],
        '#51bbd6',
        100,
        '#f1f075',
        750,
        '#f28cb1'
      ],
      circleRadius: [
        'step',
        ['get', 'point_count'],
        20,
        100,
        30,
        750,
        40
      ],
      strokeColor: '#FFFFFF',
      strokeWidth: 4,
      textColor: '#FFFFFF',
      textSize: 14
    },
    nonClustersStyle: [
      {
        id: 'default_style',
        src: '/pin.png',
        width: 40,
        height: 46,
        offset: [-20, -46]
      }
    ]
  })
}

// 添加随机点位
const addRandomPoints = (count = 10) => {
  const newPoints = []
  
  for (let i = 0; i < count; i++) {
    poiIdCounter++
    const lng = 116.2 + Math.random() * 0.4
    const lat = 39.8 + Math.random() * 0.3
    
    newPoints.push({
      id: `poi_${poiIdCounter}`,
      lngLat: [lng, lat],
      properties: {
        name: `动态点位 ${poiIdCounter}`,
        createdAt: new Date().toISOString()
      },
      styleId: 'default_style'
    })
  }
  
  // 注意：Clusters类目前需要重新创建来更新数据
  // 建议保存geometries数据，添加新数据后重新创建
  console.log('新增点位:', newPoints)
  
  // 实际使用中需要保存原有数据并重新创建clusters
  // const allGeometries = [...existingGeometries, ...newPoints]
  // clusters.value.removeClusters()
  // clusters.value = new HTMap.Clusters({ map, geometries: allGeometries, ... })
}
```

---

## 注意事项

### 1. 坐标格式
- `lngLat` 格式：`[经度, 纬度]`
- 经度范围：-180 到 180
- 纬度范围：-90 到 90

### 2. 性能优化
- 聚合功能专为处理大量数据设计
- 建议数据量 > 100 时使用聚合
- 数据量 < 100 时可直接使用 Markers

### 3. 聚合配置
- `maxZoom` 越大，高缩放级别下越容易聚合
- `radius` 越大，聚合的点越多，但可能不够精确
- `minCount` 建议设为 2，避免单点聚合

### 4. 样式表达式
- MapboxGL 表达式语法功能强大
- 支持 `step`、`interpolate` 等函数
- 腾讯地图会自动转换表达式

### 5. 事件处理
- 通过 `e.cluster` 判断是聚合点还是单个点
- 聚合点包含 `point_count` 属性
- 单个点包含完整的 `properties` 数据

### 6. 数据更新
- Clusters 目前不支持动态添加/删除数据
- 需要更新数据时，建议重新创建 Clusters 实例
- 记得先调用 `removeClusters()` 清理旧实例

---

**相关文档：**
- [标记点功能 →](./markers.md)
- [线条功能 →](./lines.md)
- [事件系统 →](./events.md)
- [最佳实践 →](./best-practices.md)

