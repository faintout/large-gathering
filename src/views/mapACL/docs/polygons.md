# Polygons 多边形功能

本文档详细介绍 HTMap 的多边形（Polygons）功能，包括构造参数、数据结构、样式配置和所有方法的使用说明。

## 概述

`Polygons` 类用于在地图上批量管理多边形，支持填充颜色、边框样式、虚线边框等多种样式。

**主要特性：**
- 📐 批量绘制多边形
- 🎨 丰富的样式选项（填充色、边框、虚线）
- 🎯 支持凸多边形和普通多边形
- 🖱️ 支持点击、悬停等事件
- 👁️ 可见性控制
- 🔄 动态增删改查

## 构造函数

### 创建 Polygons 实例

**语法：**
```javascript
const polygons = new HTMap.Polygons(options)
```

### 构造参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `map` | `Object` | 是 | - | 地图实例对象 | `mapInstance` |
| `id` | `String` | 否 | 自动生成 | 多边形组ID | `'polygons_group_001'` |
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

// 创建多边形组
const polygons = new HTMap.Polygons({
  map: map,
  id: 'my_polygons',
  geometries: [
    {
      id: 'polygon_1',
      paths: [
        [116.397128, 39.916527],
        [116.404448, 39.915225],
        [116.404448, 39.910225],
        [116.397128, 39.910527],
        [116.397128, 39.916527]  // 闭合
      ],
      properties: {
        name: '示例区域'
      },
      styleId: 'default_style'
    }
  ],
  styles: [
    {
      id: 'default_style',
      color: 'rgba(75, 152, 250, 0.3)',
      borderColor: 'rgba(75, 152, 250, 1)',
      borderWidth: 2,
      borderDashArray: [5, 5],
      isConvex: false
    }
  ]
})

// 绑定点击事件
polygons.on('click', (e) => {
  console.log('点击了多边形:', e.properties.name)
})
```

## 方法快速索引

| 方法名 | 说明 | 跳转 |
|-------|------|------|
| `addToMap()` | 添加多边形到地图 | [查看详情](#addtomap-添加到地图) |
| `removePolygons()` | 移除所有多边形 | [查看详情](#removepolygons-移除所有多边形) |
| `setVisible(visible)` | 设置可见性 | [查看详情](#setvisible-设置可见性) |
| `getVisible()` | 获取可见性状态 | [查看详情](#getvisible-获取可见性) |
| `getGeometries()` | 获取所有几何数据 | [查看详情](#getgeometries-获取几何数据) |
| `addGeometries(geometries)` | 添加新多边形 | [查看详情](#addgeometries-添加新多边形) |
| `removeGeometries(ids)` | 删除指定多边形 | [查看详情](#removegeometries-删除多边形) |
| `updatePolygonsGeometries(geometries)` | 更新多边形数据 | [查看详情](#updatepolygonsgeometries-更新多边形) |
| `on(eventType, callback)` | 绑定事件 | [查看详情](#on-绑定事件) |
| `off(eventType, callback)` | 解绑事件 | [查看详情](#off-解绑事件) |

---

## 数据结构参考

### geometries 数据结构

每个 geometry 对象包含以下字段：

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `id` | `String` | 否 | 多边形唯一标识 | `'polygon_001'` |
| `paths` | `Array` | 是* | 路径坐标数组 | `[[116.397128, 39.916527], ...]` |
| `coordinates` | `Array` | 是* | 路径坐标数组（同paths） | `[[116.397128, 39.916527], ...]` |
| `properties` | `Object` | 否 | 自定义属性 | `{ name: '区域1', area: 1000 }` |
| `styleId` | `String` | 否 | 关联的样式ID | `'style_001'` |

**注意：** `paths` 和 `coordinates` 二选一，`paths` 优先级更高。

**geometries 完整示例：**
```javascript
geometries: [
  {
    id: 'area_1',
    paths: [
      [116.397128, 39.916527],  // 天安门
      [116.404448, 39.915225],  // 故宫
      [116.404448, 39.910225],  // 右下
      [116.397128, 39.910527],  // 左下
      [116.397128, 39.916527]   // 闭合（回到起点）
    ],
    properties: {
      name: '故宫区域',
      area: 720000,  // 平方米
      type: 'historical'
    },
    styleId: 'historical_style'
  },
  {
    id: 'area_2',
    // 使用coordinates字段也可以
    coordinates: [
      [116.391311, 39.906726],  // 天坛
      [116.396311, 39.906726],
      [116.396311, 39.901726],
      [116.391311, 39.901726],
      [116.391311, 39.906726]   // 闭合
    ],
    properties: {
      name: '天坛区域',
      area: 273000,
      type: 'park'
    },
    styleId: 'park_style'
  },
  {
    id: 'area_3',
    paths: [
      [116.36, 39.92],
      [116.38, 39.93],
      [116.37, 39.91],
      [116.36, 39.92]  // 闭合
    ],
    properties: {
      name: '不规则区域'
    },
    styleId: 'default_style'
  }
]
```

**坐标说明：**
- 至少需要3个坐标点才能形成多边形
- 建议最后一个点与第一个点相同，形成闭合多边形
- 坐标格式：`[经度, 纬度]`

### styles 样式结构

每个 style 对象包含以下字段：

| 字段名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `id` | `String` | 是 | 自动生成 | 样式唯一标识 | `'style_001'` |
| `color` | `String` | 否 | `'rgba(75,152,250,0.3)'` | 填充颜色 | `'rgba(75,152,250,0.3)'` |
| `borderColor` | `String` | 否 | `'rgba(75,152,250,1)'` | 边框颜色 | `'rgba(75,152,250,1)'` |
| `borderWidth` | `Number` | 否 | `2` | 边框宽度（像素） | `2` |
| `borderDashArray` | `Array` \| `null` | 否 | `null` | 虚线样式 [实线, 间隙] | `[5, 5]` \| `null` |
| `isConvex` | `Boolean` | 否 | `false` | 是否绘制凸多边形 | `true` \| `false` |

**styles 完整示例：**
```javascript
styles: [
  {
    id: 'historical_style',
    color: 'rgba(255, 0, 0, 0.3)',        // 半透明红色填充
    borderColor: 'rgba(255, 0, 0, 1)',    // 红色边框
    borderWidth: 2,                       // 边框宽度2像素
    borderDashArray: null,                // 实线边框
    isConvex: false                       // 普通多边形
  },
  {
    id: 'park_style',
    color: 'rgba(0, 255, 0, 0.2)',        // 半透明绿色填充
    borderColor: 'rgba(0, 255, 0, 1)',    // 绿色边框
    borderWidth: 3,                       // 边框宽度3像素
    borderDashArray: null,                // 实线边框
    isConvex: false
  },
  {
    id: 'dashed_style',
    color: 'rgba(75, 152, 250, 0.3)',     // 半透明蓝色填充
    borderColor: 'rgba(75, 152, 250, 1)', // 蓝色边框
    borderWidth: 2,
    borderDashArray: [5, 5],              // 虚线：5像素实线，5像素间隙
    isConvex: false
  },
  {
    id: 'convex_style',
    color: 'rgba(255, 165, 0, 0.3)',      // 半透明橙色填充
    borderColor: 'rgba(255, 165, 0, 1)',  // 橙色边框
    borderWidth: 2,
    borderDashArray: [10, 5],             // 虚线：10像素实线，5像素间隙
    isConvex: true                        // 凸多边形
  }
]
```

### 样式说明

#### color - 填充颜色
- 支持十六进制：`'#4b98fa'`
- 支持RGB：`'rgb(75, 152, 250)'`
- 支持RGBA（推荐）：`'rgba(75, 152, 250, 0.3)'`
- 透明度（alpha）范围：0-1

#### borderDashArray - 虚线样式
- `null` 或 `[0, 0]` - 实线
- `[5, 5]` - 短虚线（5像素实线，5像素间隙）
- `[10, 5]` - 长虚线（10像素实线，5像素间隙）
- `[1, 4]` - 点状虚线

#### isConvex - 凸多边形
- `false` - 普通多边形（支持凹陷）
- `true` - 凸多边形（自动计算凸包）

---

## 方法详解

### addToMap() - 添加到地图

将多边形组添加到地图上。**注意：**构造函数会自动调用此方法。

**方法签名：**
```javascript
polygons.addToMap()
```

**参数：** 无

**返回值：** 无

---

### removePolygons() - 移除所有多边形

从地图上移除所有多边形。

**方法签名：**
```javascript
polygons.removePolygons()
```

**参数：** 无

**返回值：** 无

**示例：**
```javascript
// 移除所有多边形
polygons.removePolygons()
```

---

### setVisible() - 设置可见性

设置多边形组的显示/隐藏状态。

**方法签名：**
```javascript
polygons.setVisible(visible)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `visible` | `Boolean` | 是 | 是否可见 | `true` \| `false` |

**返回值：** 无

**示例：**
```javascript
// 隐藏多边形
polygons.setVisible(false)

// 显示多边形
polygons.setVisible(true)

// 切换可见性
const isVisible = polygons.getVisible()
polygons.setVisible(!isVisible)
```

---

### getVisible() - 获取可见性

获取多边形组当前的可见性状态。

**方法签名：**
```javascript
const visible = polygons.getVisible()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Boolean` | 当前是否可见 | `true` \| `false` |

**示例：**
```javascript
const isVisible = polygons.getVisible()
console.log('多边形是否可见:', isVisible)
```

---

### getGeometries() - 获取几何数据

获取多边形组的所有几何数据。

**方法签名：**
```javascript
const geometries = polygons.getGeometries()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Array` | 几何数据数组 | `[{ id, paths, properties, styleId }]` |

**示例：**
```javascript
const geometries = polygons.getGeometries()
console.log('所有多边形数据:', geometries)
// 输出: [
//   {
//     id: 'polygon_1',
//     paths: [[116.397128, 39.916527], ...],
//     properties: { name: '示例区域' },
//     styleId: 'default_style'
//   },
//   ...
// ]

// 统计多边形数量
console.log(`共有 ${geometries.length} 个多边形`)

// 遍历多边形
geometries.forEach(geo => {
  console.log(`多边形: ${geo.properties.name}, 顶点数: ${geo.paths.length}`)
})
```

---

### addGeometries() - 添加新多边形

向多边形组添加新的多边形。

**方法签名：**
```javascript
polygons.addGeometries(newGeometries)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `newGeometries` | `Array` | 是 | 新增的几何数据数组 | 见下方示例 |

**返回值：** 无

**示例：**
```javascript
// 添加单个多边形
polygons.addGeometries([
  {
    id: 'polygon_2',
    paths: [
      [116.3, 39.9],
      [116.35, 39.95],
      [116.3, 39.95],
      [116.3, 39.9]  // 闭合
    ],
    properties: {
      name: '新区域'
    },
    styleId: 'default_style'
  }
])

// 批量添加多个多边形
polygons.addGeometries([
  {
    id: 'polygon_3',
    paths: [[116.36, 39.91], [116.38, 39.93], [116.36, 39.93], [116.36, 39.91]],
    properties: { name: '区域3' },
    styleId: 'default_style'
  },
  {
    id: 'polygon_4',
    paths: [[116.39, 39.92], [116.41, 39.94], [116.39, 39.94], [116.39, 39.92]],
    properties: { name: '区域4' },
    styleId: 'default_style'
  }
])
```

---

### removeGeometries() - 删除多边形

根据ID删除指定的多边形。

**方法签名：**
```javascript
polygons.removeGeometries(idsToDelete)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `idsToDelete` | `Array` | 是 | 要删除的ID数组 | `['polygon_1', 'polygon_2']` |

**返回值：** 无

**示例：**
```javascript
// 删除单个多边形
polygons.removeGeometries(['polygon_1'])

// 删除多个多边形
polygons.removeGeometries(['polygon_1', 'polygon_2', 'polygon_3'])

// 删除所有多边形
const allGeometries = polygons.getGeometries()
const allIds = allGeometries.map(geo => geo.id)
polygons.removeGeometries(allIds)
```

---

### updatePolygonsGeometries() - 更新多边形

批量更新多边形的数据（路径、属性、样式等）。

**方法签名：**
```javascript
polygons.updatePolygonsGeometries(updatedGeometries)
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
// 更新多边形路径
polygons.updatePolygonsGeometries([
  {
    id: 'polygon_1',
    paths: [
      [116.5, 40.0],
      [116.6, 40.1],
      [116.5, 40.1],
      [116.5, 40.0]
    ]
  }
])

// 更新多边形属性
polygons.updatePolygonsGeometries([
  {
    id: 'polygon_1',
    properties: {
      name: '更新后的区域',
      area: 2000
    }
  }
])

// 更新多边形样式
polygons.updatePolygonsGeometries([
  {
    id: 'polygon_1',
    styleId: 'style2'
  }
])

// 同时更新多个字段
polygons.updatePolygonsGeometries([
  {
    id: 'polygon_1',
    paths: [[116.5, 40.0], [116.6, 40.1], [116.5, 40.1], [116.5, 40.0]],
    properties: { name: '新区域' },
    styleId: 'style2'
  },
  {
    id: 'polygon_2',
    paths: [[116.7, 40.2], [116.8, 40.3], [116.7, 40.3], [116.7, 40.2]]
  }
])
```

---

### on() - 绑定事件

为多边形组绑定事件监听器。

**方法签名：**
```javascript
polygons.on(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'click'` \| `'dblclick'` \| `'mouseenter'` \| `'mouseleave'` |
| `callback` | `Function` | 是 | 回调函数 | `(e) => { console.log(e) }` |

**回调函数参数 e 的结构：**
```javascript
{
  id: 'polygon_1',                       // 多边形ID
  paths: [[116.397128, 39.916527], ...], // 路径
  properties: {                          // 自定义属性
    name: '示例区域',
    area: 1000
  },
  // ... 其他事件信息
}
```

**返回值：**

| 类型 | 说明 |
|------|------|
| `Polygons` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 绑定点击事件
polygons.on('click', (e) => {
  console.log('点击了多边形:', e.properties.name)
  console.log('区域面积:', e.properties.area, '平方米')
})

// 绑定双击事件
polygons.on('dblclick', (e) => {
  console.log('双击了多边形:', e.properties.name)
})

// 绑定鼠标进入事件
polygons.on('mouseenter', (e) => {
  console.log('鼠标进入多边形:', e.properties.name)
  // 可以在这里改变多边形样式
})

// 绑定鼠标离开事件
polygons.on('mouseleave', (e) => {
  console.log('鼠标离开多边形:', e.properties.name)
})

// 链式调用
polygons
  .on('click', (e) => {
    console.log('点击:', e.properties.name)
  })
  .on('dblclick', (e) => {
    console.log('双击:', e.properties.name)
  })
```

---

### off() - 解绑事件

解除多边形组的事件监听器。

**方法签名：**
```javascript
polygons.off(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'click'` |
| `callback` | `Function` | 否 | 要解绑的回调函数 | `handleClick` |

**返回值：**

| 类型 | 说明 |
|------|------|
| `Polygons` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 定义命名函数便于解绑
const handleClick = (e) => {
  console.log('点击了多边形:', e.properties.name)
}

// 绑定事件
polygons.on('click', handleClick)

// 解绑指定函数
polygons.off('click', handleClick)

// 解绑所有click事件
polygons.off('click')
```

---

## 完整示例

### 示例1：行政区域划分

```vue
<template>
  <div class="map-container">
    <div id="map"></div>
    
    <!-- 区域选择面板 -->
    <div class="area-panel">
      <h3>行政区域</h3>
      <div v-for="area in areas" :key="area.id" class="area-item">
        <div 
          class="color-box" 
          :style="{ backgroundColor: area.color }"
        ></div>
        <span>{{ area.name }}</span>
        <span class="area-size">{{ area.area }} km²</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

const mapInstance = ref(null)
const polygonsInstance = ref(null)

const areas = ref([
  { id: 'area_1', name: '东城区', color: 'rgba(255, 0, 0, 0.3)', area: 41.84 },
  { id: 'area_2', name: '西城区', color: 'rgba(0, 255, 0, 0.3)', area: 50.70 },
  { id: 'area_3', name: '朝阳区', color: 'rgba(0, 0, 255, 0.3)', area: 470.8 },
  { id: 'area_4', name: '海淀区', color: 'rgba(255, 255, 0, 0.3)', area: 430.77 }
])

onMounted(async () => {
  // 创建地图
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 10
  })
  
  await map.init()
  mapInstance.value = map
  
  // 创建多边形数据
  const geometries = [
    {
      id: 'area_1',
      paths: [
        [116.397128, 39.916527],
        [116.430128, 39.916527],
        [116.430128, 39.886527],
        [116.397128, 39.886527],
        [116.397128, 39.916527]
      ],
      properties: { name: '东城区', area: 41.84 },
      styleId: 'style_1'
    },
    {
      id: 'area_2',
      paths: [
        [116.360128, 39.916527],
        [116.397128, 39.916527],
        [116.397128, 39.886527],
        [116.360128, 39.886527],
        [116.360128, 39.916527]
      ],
      properties: { name: '西城区', area: 50.70 },
      styleId: 'style_2'
    },
    {
      id: 'area_3',
      paths: [
        [116.430128, 39.916527],
        [116.530128, 39.916527],
        [116.530128, 39.816527],
        [116.430128, 39.816527],
        [116.430128, 39.916527]
      ],
      properties: { name: '朝阳区', area: 470.8 },
      styleId: 'style_3'
    },
    {
      id: 'area_4',
      paths: [
        [116.260128, 39.916527],
        [116.360128, 39.916527],
        [116.360128, 39.816527],
        [116.260128, 39.816527],
        [116.260128, 39.916527]
      ],
      properties: { name: '海淀区', area: 430.77 },
      styleId: 'style_4'
    }
  ]
  
  // 创建样式
  const styles = areas.value.map((area, index) => ({
    id: `style_${index + 1}`,
    color: area.color,
    borderColor: area.color.replace('0.3', '1'),
    borderWidth: 2,
    borderDashArray: null,
    isConvex: false
  }))
  
  // 创建多边形
  const polygons = new HTMap.Polygons({
    map: map,
    id: 'admin_areas',
    geometries: geometries,
    styles: styles
  })
  
  polygonsInstance.value = polygons
  
  // 绑定点击事件
  polygons.on('click', (e) => {
    const { name, area } = e.properties
    alert(`区域：${name}\n面积：${area} km²`)
  })
  
  // 绑定鼠标进入事件（高亮效果）
  polygons.on('mouseenter', (e) => {
    console.log('鼠标进入:', e.properties.name)
    // 可以在这里改变样式实现高亮
  })
})

onBeforeUnmount(() => {
  if (polygonsInstance.value) {
    polygonsInstance.value.removePolygons()
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

.area-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.area-panel h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.area-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.area-size {
  margin-left: auto;
  color: #999;
  font-size: 12px;
}
</style>
```

---

## 注意事项

### 1. 坐标格式
- `paths` 或 `coordinates` 至少需要3个坐标点
- 坐标格式：`[经度, 纬度]`
- 建议首尾坐标相同，形成闭合多边形
- 经度范围：-180 到 180，纬度范围：-90 到 90

### 2. 性能优化
- 复杂多边形（顶点数>100）可能影响性能
- 大量多边形建议使用分组管理
- 及时调用 `removePolygons()` 清理不需要的多边形

### 3. 填充颜色
- 使用 RGBA 格式可设置透明度
- 透明度建议设为 0.2-0.5，兼顾美观和可见性
- 颜色与边框颜色建议保持统一色系

### 4. 边框样式
- 虚线边框使用 `borderDashArray`
- 实线设为 `null` 或 `[0, 0]`
- 边框宽度建议 1-3 像素

### 5. 凸多边形
- `isConvex: true` 会自动计算凸包
- 适用于不规则多边形的外轮廓绘制
- 某些地图引擎可能不支持此功能

---

**相关文档：**
- [标记点功能 →](./markers.md)
- [线条功能 →](./lines.md)
- [聚合功能 →](./clusters.md)
- [事件系统 →](./events.md)

