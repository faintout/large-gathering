# Lines 线条功能

本文档详细介绍 HTMap 的线条（Lines）功能，包括构造参数、数据结构、样式配置和所有方法的使用说明。

## 概述

`Lines` 类用于在地图上批量管理线条，支持实线、虚线、发光效果、方向箭头、曲线等多种样式。

**主要特性：**
- 📏 批量绘制线条
- 🎨 丰富的样式选项（颜色、宽度、虚线、边框等）
- ⚡ 发光效果和方向箭头
- 🎯 曲线绘制
- 🖱️ 支持点击、悬停等事件
- 👁️ 可见性控制
- 🔄 动态增删改查
- 📐 距离计算

## 构造函数

### 创建 Lines 实例

**语法：**
```javascript
const lines = new HTMap.Lines(options)
```

### 构造参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `map` | `Object` | 是 | - | 地图实例对象 | `mapInstance` |
| `id` | `String` | 否 | 自动生成 | 线条组ID | `'lines_group_001'` |
| `geometries` | `Array` | 是 | `[]` | 几何数据数组 | [详见 geometries 数据结构 →](#geometries-数据结构) |
| `styles` | `Array` | 否 | 默认样式 | 样式配置数组 | [详见 styles 样式结构 →](#styles-样式结构) |

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

// 创建线条组
const lines = new HTMap.Lines({
  map: map,
  id: 'my_lines',
  geometries: [
    {
      id: 'line_1',
      paths: [
        [116.397128, 39.916527],
        [116.404448, 39.915225],
        [116.391311, 39.906726]
      ],
      properties: {
        name: '示例路线'
      },
      styleId: 'default_style'
    }
  ],
  styles: [
    {
      id: 'default_style',
      color: '#FF0000',
      width: 5,
      borderColor: '#000000',
      borderWidth: 2,
      lineCap: 'round',
      dashArray: [0, 0],
      emitLight: false,
      dirArrows: true,
      dirAnimate: null,
      isCurve: false
    }
  ]
})

// 绑定点击事件
lines.on('click', (e) => {
  console.log('点击了线条:', e.properties.name)
})

// 获取线条总长度
const totalLength = lines.getTotalLength()
console.log('线条总长度:', totalLength, '米')
```

## 方法快速索引

| 方法名 | 说明 | 跳转 |
|-------|------|------|
| `addToMap()` | 添加线条到地图 | [查看详情](#addtomap-添加到地图) |
| `removeLines()` | 移除所有线条 | [查看详情](#removelines-移除所有线条) |
| `setVisible(visible)` | 设置可见性 | [查看详情](#setvisible-设置可见性) |
| `getVisible()` | 获取可见性状态 | [查看详情](#getvisible-获取可见性) |
| `getGeometries()` | 获取所有几何数据 | [查看详情](#getgeometries-获取几何数据) |
| `addGeometries(geometries)` | 添加新线条 | [查看详情](#addgeometries-添加新线条) |
| `removeGeometries(ids)` | 删除指定线条 | [查看详情](#removegeometries-删除线条) |
| `updateLinesGeometries(geometries)` | 更新线条数据 | [查看详情](#updatelinesgeometries-更新线条) |
| `getTotalLength()` | 获取所有线条总长度 | [查看详情](#gettotallength-获取总长度) |
| `getLineDistanceById(id)` | 获取指定线条长度 | [查看详情](#getlinedistancebyid-获取指定线条长度) |
| `on(eventType, callback)` | 绑定事件 | [查看详情](#on-绑定事件) |
| `off(eventType, callback)` | 解绑事件 | [查看详情](#off-解绑事件) |

---

## 数据结构参考

### geometries 数据结构

每个 geometry 对象包含以下字段：

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `id` | `String` | 否 | 线条唯一标识 | `'line_001'` |
| `paths` | `Array` | 是 | 路径坐标数组 | `[[116.397128, 39.916527], [116.4, 39.92]]` |
| `properties` | `Object` | 否 | 自定义属性 | `{ name: '路线1', distance: 1500 }` |
| `styleId` | `String` | 否 | 关联的样式ID | `'style_001'` |

**geometries 完整示例：**
```javascript
geometries: [
  {
    id: 'route_1',
    paths: [
      [116.397128, 39.916527],  // 起点：天安门
      [116.404448, 39.915225],  // 中间点：故宫
      [116.391311, 39.906726]   // 终点：天坛
    ],
    properties: {
      name: '北京历史文化线路',
      type: 'tourist_route',
      distance: 3500  // 米
    },
    styleId: 'tourist_style'
  },
  {
    id: 'subway_line_1',
    paths: [
      [116.367943, 39.906527],
      [116.387943, 39.906527],
      [116.407943, 39.906527],
      [116.427943, 39.906527]
    ],
    properties: {
      name: '地铁1号线',
      type: 'subway'
    },
    styleId: 'subway_style'
  }
]
```

### styles 样式结构

每个 style 对象包含以下字段：

| 字段名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `id` | `String` | 是 | 自动生成 | 样式唯一标识 | `'style_001'` |
| `color` | `String` | 否 | `'#4b98fa'` | 线条颜色（十六进制或rgba） | `'#FF0000'` \| `'rgba(255, 0, 0, 0.8)'` |
| `width` | `Number` | 否 | `6` | 线条宽度（像素） | `5` |
| `borderColor` | `String` | 否 | `null` | 边框颜色 | `'#000000'` |
| `borderWidth` | `Number` | 否 | `0` | 边框宽度（像素） | `2` |
| `lineCap` | `String` | 否 | `'round'` | 端点样式 | `'butt'` \| `'round'` \| `'square'` |
| `dashArray` | `Array` | 否 | `[0, 0]` | 虚线样式 [实线长度, 间隙长度] | `[10, 5]` |
| `emitLight` | `Boolean` | 否 | `false` | 是否发光 | `true` \| `false` |
| `dirArrows` | `Boolean` | 否 | `false` | 是否显示方向箭头 | `true` \| `false` |
| `dirAnimate` | `String` \| `null` | 否 | `null` | 动画方向 | `'forward'` \| `'backward'` \| `null` |
| `isCurve` | `Boolean` | 否 | `false` | 是否绘制曲线 | `true` \| `false` |

**styles 完整示例：**
```javascript
styles: [
  {
    id: 'tourist_style',
    color: '#FF0000',          // 红色
    width: 5,                  // 宽度5像素
    borderColor: '#000000',    // 黑色边框
    borderWidth: 2,            // 边框宽度2像素
    lineCap: 'round',          // 圆角端点
    dashArray: [0, 0],         // 实线
    emitLight: false,          // 不发光
    dirArrows: true,           // 显示方向箭头
    dirAnimate: null,          // 无动画
    isCurve: false             // 直线
  },
  {
    id: 'subway_style',
    color: '#0066FF',
    width: 8,
    borderColor: '#FFFFFF',
    borderWidth: 2,
    lineCap: 'round',
    dashArray: [0, 0],
    emitLight: true,           // 发光效果
    dirArrows: false,
    dirAnimate: null,
    isCurve: false
  },
  {
    id: 'dashed_style',
    color: '#00FF00',
    width: 4,
    borderColor: null,
    borderWidth: 0,
    lineCap: 'square',
    dashArray: [10, 5],        // 虚线：10像素实线，5像素间隙
    emitLight: false,
    dirArrows: false,
    dirAnimate: null,
    isCurve: false
  },
  {
    id: 'animated_style',
    color: '#FFA500',
    width: 6,
    borderColor: null,
    borderWidth: 0,
    lineCap: 'round',
    dashArray: [0, 0],
    emitLight: false,
    dirArrows: false,
    dirAnimate: 'forward',     // 前向流动动画
    isCurve: false
  }
]
```

### 样式说明

#### lineCap - 端点样式
- `'butt'` - 平头端点
- `'round'` - 圆角端点（推荐）
- `'square'` - 方形端点

#### dashArray - 虚线样式
- `[0, 0]` - 实线
- `[10, 5]` - 10像素实线，5像素间隙
- `[5, 5]` - 短虚线
- `[20, 10]` - 长虚线

#### dirAnimate - 动画方向
- `null` - 无动画
- `'forward'` - 前向流动
- `'backward'` - 后向流动

**注意：** `dirAnimate` 和 `dashArray` 不能同时使用，`dirAnimate` 优先级更高。

---

## 方法详解

### addToMap() - 添加到地图

将线条组添加到地图上。**注意：**构造函数会自动调用此方法。

**方法签名：**
```javascript
lines.addToMap()
```

**参数：** 无

**返回值：** 无

---

### removeLines() - 移除所有线条

从地图上移除所有线条。

**方法签名：**
```javascript
lines.removeLines()
```

**参数：** 无

**返回值：** 无

**示例：**
```javascript
// 移除所有线条
lines.removeLines()
```

---

### setVisible() - 设置可见性

设置线条组的显示/隐藏状态。

**方法签名：**
```javascript
lines.setVisible(visible)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `visible` | `Boolean` | 是 | 是否可见 | `true` \| `false` |

**返回值：** 无

**示例：**
```javascript
// 隐藏线条
lines.setVisible(false)

// 显示线条
lines.setVisible(true)

// 切换可见性
const isVisible = lines.getVisible()
lines.setVisible(!isVisible)
```

---

### getVisible() - 获取可见性

获取线条组当前的可见性状态。

**方法签名：**
```javascript
const visible = lines.getVisible()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Boolean` | 当前是否可见 | `true` \| `false` |

**示例：**
```javascript
const isVisible = lines.getVisible()
console.log('线条是否可见:', isVisible)
```

---

### getGeometries() - 获取几何数据

获取线条组的所有几何数据。

**方法签名：**
```javascript
const geometries = lines.getGeometries()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Array` | 几何数据数组 | `[{ id, paths, properties, styleId }]` |

**示例：**
```javascript
const geometries = lines.getGeometries()
console.log('所有线条数据:', geometries)
// 输出: [
//   {
//     id: 'line_1',
//     paths: [[116.397128, 39.916527], ...],
//     properties: { name: '示例路线' },
//     styleId: 'default_style'
//   },
//   ...
// ]

// 统计线条数量
console.log(`共有 ${geometries.length} 条线`)

// 遍历线条
geometries.forEach(geo => {
  console.log(`线条: ${geo.properties.name}, 节点数: ${geo.paths.length}`)
})
```

---

### addGeometries() - 添加新线条

向线条组添加新的线条。

**方法签名：**
```javascript
lines.addGeometries(newGeometries)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `newGeometries` | `Array` | 是 | 新增的几何数据数组 | 见下方示例 |

**返回值：** 无

**示例：**
```javascript
// 添加单条线
lines.addGeometries([
  {
    id: 'line_2',
    paths: [
      [116.3, 39.9],
      [116.35, 39.95]
    ],
    properties: {
      name: '新线条'
    },
    styleId: 'default_style'
  }
])

// 批量添加多条线
lines.addGeometries([
  {
    id: 'line_3',
    paths: [[116.36, 39.91], [116.38, 39.93]],
    properties: { name: '线条3' },
    styleId: 'default_style'
  },
  {
    id: 'line_4',
    paths: [[116.39, 39.92], [116.41, 39.94]],
    properties: { name: '线条4' },
    styleId: 'default_style'
  }
])
```

---

### removeGeometries() - 删除线条

根据ID删除指定的线条。

**方法签名：**
```javascript
lines.removeGeometries(idsToDelete)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `idsToDelete` | `Array` | 是 | 要删除的ID数组 | `['line_1', 'line_2']` |

**返回值：** 无

**示例：**
```javascript
// 删除单条线
lines.removeGeometries(['line_1'])

// 删除多条线
lines.removeGeometries(['line_1', 'line_2', 'line_3'])

// 删除所有线条
const allGeometries = lines.getGeometries()
const allIds = allGeometries.map(geo => geo.id)
lines.removeGeometries(allIds)
```

---

### updateLinesGeometries() - 更新线条

批量更新线条的数据（路径、属性、样式等）。

**方法签名：**
```javascript
lines.updateLinesGeometries(updatedGeometries)
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
// 更新线条路径
lines.updateLinesGeometries([
  {
    id: 'line_1',
    paths: [
      [116.5, 40.0],
      [116.6, 40.1]
    ]
  }
])

// 更新线条属性
lines.updateLinesGeometries([
  {
    id: 'line_1',
    properties: {
      name: '更新后的路线',
      distance: 2000
    }
  }
])

// 更新线条样式
lines.updateLinesGeometries([
  {
    id: 'line_1',
    styleId: 'new_style'
  }
])

// 同时更新多个字段
lines.updateLinesGeometries([
  {
    id: 'line_1',
    paths: [[116.5, 40.0], [116.6, 40.1]],
    properties: { name: '新路线' },
    styleId: 'new_style'
  },
  {
    id: 'line_2',
    paths: [[116.7, 40.2], [116.8, 40.3]]
  }
])
```

---

### on() - 绑定事件

为线条组绑定事件监听器。

**方法签名：**
```javascript
lines.on(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'click'` \| `'dblclick'` \| `'mouseenter'` \| `'mouseleave'` |
| `callback` | `Function` | 是 | 回调函数 | `(e) => { console.log(e) }` |

**回调函数参数 e 的结构：**
```javascript
{
  id: 'line_1',                // 线条ID
  paths: [[116.397128, 39.916527], ...],  // 路径
  properties: {                // 自定义属性
    name: '示例路线',
    distance: 1500
  },
  // ... 其他事件信息
}
```

**返回值：**

| 类型 | 说明 |
|------|------|
| `Lines` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 绑定点击事件
lines.on('click', (e) => {
  console.log('点击了线条:', e.properties.name)
  console.log('路径节点数:', e.paths.length)
})

// 绑定双击事件
lines.on('dblclick', (e) => {
  console.log('双击了线条:', e.properties.name)
})

// 绑定鼠标进入事件
lines.on('mouseenter', (e) => {
  console.log('鼠标进入线条:', e.properties.name)
  // 可以在这里改变线条样式
})

// 绑定鼠标离开事件
lines.on('mouseleave', (e) => {
  console.log('鼠标离开线条:', e.properties.name)
})

// 链式调用
lines
  .on('click', (e) => {
    console.log('点击:', e.properties.name)
  })
  .on('dblclick', (e) => {
    console.log('双击:', e.properties.name)
  })
```

---

### off() - 解绑事件

解除线条组的事件监听器。

**方法签名：**
```javascript
lines.off(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'click'` |
| `callback` | `Function` | 否 | 要解绑的回调函数 | `handleClick` |

**返回值：**

| 类型 | 说明 |
|------|------|
| `Lines` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 定义命名函数便于解绑
const handleClick = (e) => {
  console.log('点击了线条:', e.properties.name)
}

// 绑定事件
lines.on('click', handleClick)

// 解绑指定函数
lines.off('click', handleClick)

// 解绑所有click事件
lines.off('click')
```

---

### getTotalLength() - 获取总长度

计算所有线条的总长度（米）。

**方法签名：**
```javascript
const totalLength = lines.getTotalLength()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Number` | 所有线条的总长度（米） | `5432.18` |

**示例：**
```javascript
const totalLength = lines.getTotalLength()
console.log('线条总长度:', totalLength, '米')
// 输出: 线条总长度: 5432.18 米

// 转换为公里
const totalKm = (totalLength / 1000).toFixed(2)
console.log('线条总长度:', totalKm, '公里')
// 输出: 线条总长度: 5.43 公里
```

---

### getLineDistanceById() - 获取指定线条长度

根据ID获取指定线条的长度（米）。

**方法签名：**
```javascript
const distance = lines.getLineDistanceById(geometryId)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `geometryId` | `String` | 是 | 线条ID | `'line_1'` |

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Number` | 指定线条的长度（米），找不到返回0 | `2543.67` |

**示例：**
```javascript
// 获取指定线条长度
const distance = lines.getLineDistanceById('line_1')
console.log('线条 line_1 的长度:', distance, '米')
// 输出: 线条 line_1 的长度: 2543.67 米

// 获取所有线条的长度
const geometries = lines.getGeometries()
geometries.forEach(geo => {
  const distance = lines.getLineDistanceById(geo.id)
  console.log(`${geo.properties.name}: ${distance.toFixed(2)} 米`)
})
```

---

## 完整示例

### 示例1：地铁线路图

```javascript
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

const mapInstance = ref(null)
const linesInstance = ref(null)

onMounted(async () => {
  // 创建地图
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 11
  })
  await map.init()
  mapInstance.value = map
  
  // 创建地铁线路
  const lines = new HTMap.Lines({
    map: map,
    id: 'subway_lines',
    geometries: [
      {
        id: 'line_1',
        paths: [
          [116.327843, 39.906527],
          [116.367943, 39.906527],
          [116.397128, 39.916527],
          [116.427943, 39.906527],
          [116.467943, 39.906527]
        ],
        properties: {
          name: '地铁1号线',
          color: '#FF0000',
          stations: 23
        },
        styleId: 'line_1_style'
      },
      {
        id: 'line_2',
        paths: [
          [116.397128, 39.876527],
          [116.397128, 39.906527],
          [116.397128, 39.916527],
          [116.397128, 39.946527],
          [116.397128, 39.976527]
        ],
        properties: {
          name: '地铁2号线',
          color: '#0066FF',
          stations: 18
        },
        styleId: 'line_2_style'
      }
    ],
    styles: [
      {
        id: 'line_1_style',
        color: '#FF0000',
        width: 8,
        borderColor: '#FFFFFF',
        borderWidth: 2,
        lineCap: 'round',
        dashArray: [0, 0],
        emitLight: true,
        dirArrows: false,
        dirAnimate: null,
        isCurve: false
      },
      {
        id: 'line_2_style',
        color: '#0066FF',
        width: 8,
        borderColor: '#FFFFFF',
        borderWidth: 2,
        lineCap: 'round',
        dashArray: [0, 0],
        emitLight: true,
        dirArrows: false,
        dirAnimate: null,
        isCurve: false
      }
    ]
  })
  
  linesInstance.value = lines
  
  // 绑定点击事件
  lines.on('click', (e) => {
    const { name, stations } = e.properties
    const distance = lines.getLineDistanceById(e.id)
    
    alert(`${name}\n站点数: ${stations}\n线路长度: ${(distance / 1000).toFixed(2)} 公里`)
  })
  
  // 统计总长度
  const totalLength = lines.getTotalLength()
  console.log('地铁总长度:', (totalLength / 1000).toFixed(2), '公里')
})

onBeforeUnmount(() => {
  if (linesInstance.value) {
    linesInstance.value.removeLines()
  }
  if (mapInstance.value) {
    mapInstance.value.destroy()
  }
})
```

### 示例2：动态路线规划

```javascript
import { ref } from 'vue'

const lines = ref(null)
const routeCount = ref(0)

// 初始化线条组
const initLines = (map) => {
  lines.value = new HTMap.Lines({
    map: map,
    id: 'dynamic_routes',
    geometries: [],
    styles: [
      {
        id: 'route_style',
        color: '#00FF00',
        width: 4,
        borderColor: null,
        borderWidth: 0,
        lineCap: 'round',
        dashArray: [0, 0],
        emitLight: false,
        dirArrows: true,
        dirAnimate: null,
        isCurve: false
      },
      {
        id: 'animated_route_style',
        color: '#FFA500',
        width: 6,
        borderColor: null,
        borderWidth: 0,
        lineCap: 'round',
        dashArray: [0, 0],
        emitLight: false,
        dirArrows: false,
        dirAnimate: 'forward',  // 流动动画
        isCurve: false
      }
    ]
  })
}

// 添加路线
const addRoute = (waypoints, animated = false) => {
  routeCount.value++
  
  lines.value.addGeometries([
    {
      id: `route_${routeCount.value}`,
      paths: waypoints,
      properties: {
        name: `路线 ${routeCount.value}`,
        createdAt: new Date().toISOString()
      },
      styleId: animated ? 'animated_route_style' : 'route_style'
    }
  ])
  
  // 计算路线长度
  const distance = lines.value.getLineDistanceById(`route_${routeCount.value}`)
  console.log(`路线 ${routeCount.value} 长度:`, (distance / 1000).toFixed(2), '公里')
}

// 删除路线
const deleteRoute = (routeId) => {
  lines.value.removeGeometries([routeId])
}

// 更新路线路径
const updateRoutePath = (routeId, newPaths) => {
  lines.value.updateLinesGeometries([
    {
      id: routeId,
      paths: newPaths
    }
  ])
}

// 切换路线样式（动画/非动画）
const toggleRouteAnimation = (routeId, animated) => {
  lines.value.updateLinesGeometries([
    {
      id: routeId,
      styleId: animated ? 'animated_route_style' : 'route_style'
    }
  ])
}

// 获取所有路线信息
const getAllRoutesInfo = () => {
  const geometries = lines.value.getGeometries()
  const totalLength = lines.value.getTotalLength()
  
  return {
    count: geometries.length,
    totalLength: (totalLength / 1000).toFixed(2) + ' 公里',
    routes: geometries.map(geo => ({
      id: geo.id,
      name: geo.properties.name,
      length: (lines.value.getLineDistanceById(geo.id) / 1000).toFixed(2) + ' 公里',
      points: geo.paths.length
    }))
  }
}
```

---

## 注意事项

### 1. 路径坐标
- `paths` 至少需要2个坐标点
- 坐标格式：`[经度, 纬度]`
- 经度范围：-180 到 180，纬度范围：-90 到 90

### 2. 性能优化
- 大量线条或复杂路径可能影响性能
- 路径点数量建议控制在合理范围（<1000点）
- 及时调用 `removeLines()` 清理不需要的线条

### 3. 样式选择
- `emitLight` 发光效果消耗较多资源，谨慎使用
- `dirAnimate` 和 `dashArray` 冲突，`dirAnimate` 优先
- `isCurve` 曲线绘制在某些引擎可能不支持

### 4. 距离计算
- 使用 Haversine 公式计算
- 返回单位为米
- 计算精度受地球曲率影响

### 5. 边框样式
- 边框会增加线条视觉宽度
- `borderWidth` 为0时不显示边框
- 边框颜色建议与背景形成对比

---

**相关文档：**
- [标记点功能 →](./markers.md)
- [多边形功能 →](./polygons.md)
- [聚合功能 →](./clusters.md)
- [事件系统 →](./events.md)

