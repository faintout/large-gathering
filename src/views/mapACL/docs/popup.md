# Popup 弹窗功能

本文档详细介绍 HTMap 的弹窗（Popup）功能，包括构造参数、数据结构、样式配置和所有方法的使用说明。

## 概述

`Popup` 类用于在地图上创建和管理信息窗口（弹窗），支持HTML内容、DOM元素、自定义样式等。

**主要特性：**
- 💬 灵活的内容展示（HTML/DOM）
- 🎨 自定义样式和偏移
- 🎯 精确位置定位
- 🔘 可选关闭按钮
- 🖱️ 支持事件监听
- 🔄 动态更新内容和位置

## 构造函数

### 创建 Popup 实例

**语法：**
```javascript
const popup = new HTMap.Popup(options)
```

### 构造参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `map` | `Object` | 是 | - | 地图实例对象 | `mapInstance` |
| `id` | `String` | 否 | 自动生成 | 弹窗ID | `'popup_001'` |
| `lngLat` | `Array` | 是 | - | 弹窗位置 [经度, 纬度] | `[116.397128, 39.916527]` [详见说明 →](#参数详解) |
| `content` | `String` \| `DOM` | 否 | `'默认Popup内容'` | 弹窗内容 | `'<div>内容</div>'` [详见说明 →](#参数详解) |
| `offset` | `Object` | 否 | `{x: 0, y: 0}` | 偏移量 | `{x: 0, y: -20}` [详见说明 →](#参数详解) |
| `showCloseBtn` | `Boolean` | 否 | `false` | 是否显示关闭按钮 | `true` \| `false` |
| `enableCustom` | `Boolean` | 否 | `false` | 是否启用自定义样式 | `true` \| `false` |

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

// 创建弹窗
const popup = new HTMap.Popup({
  map: map,
  id: 'my_popup',
  lngLat: [116.397128, 39.916527],
  content: '<div style="padding: 10px;"><h3>天安门</h3><p>北京市中心</p></div>',
  offset: { x: 0, y: -20 },
  showCloseBtn: true,
  enableCustom: false
})

// 绑定关闭事件
popup.on('close', () => {
  console.log('弹窗已关闭')
})
```

## 方法快速索引

| 方法名 | 说明 | 跳转 |
|-------|------|------|
| `addToMap()` | 添加弹窗到地图 | [查看详情](#addtomap-添加到地图) |
| `removePopup()` | 移除弹窗 | [查看详情](#removepopup-移除弹窗) |
| `getElement()` | 获取弹窗DOM元素 | [查看详情](#getelement-获取dom元素) |
| `setLngLat(lngLat)` | 设置弹窗位置 | [查看详情](#setlnglat-设置位置) |
| `setContent(content)` | 设置弹窗内容 | [查看详情](#setcontent-设置内容) |
| `on(eventType, callback)` | 绑定事件 | [查看详情](#on-绑定事件) |
| `off(eventType, callback)` | 解绑事件 | [查看详情](#off-解绑事件) |

---

## 参数详解

#### lngLat - 位置坐标

**格式：** `[经度, 纬度]`

**约束：**
- 必须是长度为2的数组
- 经度范围：-180 到 180
- 纬度范围：-90 到 90
- 必须是有效数字

**示例：**
```javascript
lngLat: [116.397128, 39.916527]  // 天安门
lngLat: [116.404448, 39.915225]  // 故宫
lngLat: [121.473701, 31.230416]  // 上海外滩
```

#### content - 弹窗内容

支持两种类型：

**1. HTML字符串：**
```javascript
content: '<div class="popup-content">这是一个弹窗</div>'
content: '<h3>标题</h3><p>这是内容</p>'
```

**2. DOM元素：**
```javascript
const el = document.createElement('div')
el.innerHTML = '<p>自定义DOM元素</p>'
content: el
```

#### offset - 偏移量

控制弹窗相对于坐标点的偏移。

**结构：** `{ x: number, y: number }`

**示例：**
```javascript
offset: { x: 0, y: 0 }      // 无偏移
offset: { x: 0, y: -20 }    // 向上偏移20像素
offset: { x: 10, y: -30 }   // 向右10像素，向上30像素
```

#### showCloseBtn - 关闭按钮

控制是否显示关闭按钮。

```javascript
showCloseBtn: true   // 显示关闭按钮
showCloseBtn: false  // 不显示关闭按钮（默认）
```

#### enableCustom - 自定义样式

是否启用完全自定义的弹窗样式。

```javascript
enableCustom: false  // 使用默认样式（推荐）
enableCustom: true   // 完全自定义样式
```

---

## 方法详解

### addToMap() - 添加到地图

将弹窗添加到地图上。**注意：**构造函数会自动调用此方法。

**方法签名：**
```javascript
popup.addToMap()
```

**参数：** 无

**返回值：** 无

---

### removePopup() - 移除弹窗

从地图上移除弹窗。

**方法签名：**
```javascript
popup.removePopup()
```

**参数：** 无

**返回值：** 无

**示例：**
```javascript
// 移除弹窗
popup.removePopup()
```

---

### getElement() - 获取DOM元素

获取弹窗的DOM元素。

**方法签名：**
```javascript
const element = popup.getElement()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `HTMLElement` | 弹窗的DOM元素 | `<div class="popup">...</div>` |

**示例：**
```javascript
const element = popup.getElement()
console.log('弹窗元素:', element)

// 可以直接操作DOM
if (element) {
  element.style.border = '2px solid red'
}
```

---

### setLngLat() - 设置位置

更新弹窗的位置坐标。

**方法签名：**
```javascript
popup.setLngLat(lngLat)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `lngLat` | `Array` | 是 | 新的位置坐标 [经度, 纬度] | `[116.4, 39.92]` |

**返回值：** 无

**示例：**
```javascript
// 移动弹窗到新位置
popup.setLngLat([116.404448, 39.915225])

// 移动到故宫
popup.setLngLat([116.404448, 39.915225])

// 移动到天坛
popup.setLngLat([116.391311, 39.906726])

// 动态更新位置
const updatePosition = (lng, lat) => {
  popup.setLngLat([lng, lat])
}
updatePosition(116.4, 39.92)
```

---

### setContent() - 设置内容

更新弹窗的内容。

**方法签名：**
```javascript
popup.setContent(content)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `content` | `String` \| `DOM` | 是 | 新的内容 | `'<div>新内容</div>'` |

**返回值：** 无

**示例：**
```javascript
// 更新为HTML字符串
popup.setContent('<div><h3>新标题</h3><p>新内容</p></div>')

// 更新为DOM元素
const newEl = document.createElement('div')
newEl.innerHTML = '<p>动态内容</p>'
popup.setContent(newEl)

// 根据数据更新内容
const updateContent = (data) => {
  const html = `
    <div style="padding: 15px; min-width: 200px;">
      <h3 style="margin: 0 0 10px 0;">${data.name}</h3>
      <p style="margin: 5px 0;">地址: ${data.address}</p>
      <p style="margin: 5px 0;">评分: ${'⭐'.repeat(data.rating)}</p>
    </div>
  `
  popup.setContent(html)
}

updateContent({
  name: '故宫博物院',
  address: '北京市东城区景山前街4号',
  rating: 5
})
```

---

### on() - 绑定事件

为弹窗绑定事件监听器。

**方法签名：**
```javascript
popup.on(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'close'` \| `'open'` |
| `callback` | `Function` | 是 | 回调函数 | `() => { console.log('关闭') }` |

**支持的事件：**
- `close` - 弹窗关闭时触发
- `open` - 弹窗打开时触发（部分引擎支持）

**返回值：**

| 类型 | 说明 |
|------|------|
| `Popup` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 绑定关闭事件
popup.on('close', () => {
  console.log('弹窗已关闭')
})

// 绑定打开事件
popup.on('open', () => {
  console.log('弹窗已打开')
})

// 链式调用
popup
  .on('open', () => {
    console.log('打开')
  })
  .on('close', () => {
    console.log('关闭')
  })
```

---

### off() - 解绑事件

解除弹窗的事件监听器。

**方法签名：**
```javascript
popup.off(eventType, callback)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `eventType` | `String` | 是 | 事件类型 | `'close'` |
| `callback` | `Function` | 否 | 要解绑的回调函数 | `handleClose` |

**返回值：**

| 类型 | 说明 |
|------|------|
| `Popup` | 返回当前实例，支持链式调用 |

**示例：**
```javascript
// 定义命名函数便于解绑
const handleClose = () => {
  console.log('弹窗关闭')
}

// 绑定事件
popup.on('close', handleClose)

// 解绑指定函数
popup.off('close', handleClose)

// 解绑所有close事件
popup.off('close')
```

---

## 完整示例

### 示例1：POI信息弹窗

```vue
<template>
  <div class="map-container">
    <div id="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

const mapInstance = ref(null)
const popupInstance = ref(null)

// POI数据
const pois = [
  {
    id: 'poi_1',
    name: '故宫博物院',
    lngLat: [116.397128, 39.916527],
    address: '北京市东城区景山前街4号',
    type: '博物馆',
    rating: 5,
    description: '中国明清两代的皇家宫殿，旧称紫禁城',
    openTime: '08:30-17:00'
  },
  {
    id: 'poi_2',
    name: '天坛公园',
    lngLat: [116.391311, 39.906726],
    address: '北京市东城区天坛内东里7号',
    type: '公园',
    rating: 5,
    description: '明清两代皇帝祭天、祈谷和祈雨的场所',
    openTime: '06:00-21:00'
  }
]

// 创建弹窗内容
const createPopupContent = (poi) => {
  return `
    <div style="
      padding: 15px;
      min-width: 250px;
      font-family: Arial, sans-serif;
    ">
      <h3 style="
        margin: 0 0 10px 0;
        color: #333;
        font-size: 18px;
        border-bottom: 2px solid #409eff;
        padding-bottom: 5px;
      ">${poi.name}</h3>
      
      <div style="margin: 10px 0;">
        <p style="margin: 5px 0; color: #666;">
          <strong>类型：</strong>${poi.type}
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong>地址：</strong>${poi.address}
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong>评分：</strong>${'⭐'.repeat(poi.rating)}
        </p>
        <p style="margin: 5px 0; color: #666;">
          <strong>开放时间：</strong>${poi.openTime}
        </p>
      </div>
      
      <p style="
        margin: 10px 0 0 0;
        color: #999;
        font-size: 13px;
        line-height: 1.5;
      ">${poi.description}</p>
    </div>
  `
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
  
  // 创建标记点
  const markers = new HTMap.Markers({
    map: map,
    geometries: pois.map(poi => ({
      id: poi.id,
      lngLat: poi.lngLat,
      properties: poi,
      styleId: 'default_style'
    })),
    styles: [{
      id: 'default_style',
      src: '/pin.png',
      width: 40,
      height: 46,
      offset: [-20, -46]
    }]
  })
  
  // 点击标记点显示弹窗
  markers.on('click', (e) => {
    const poi = e.properties
    
    // 如果已有弹窗，先移除
    if (popupInstance.value) {
      popupInstance.value.removePopup()
    }
    
    // 创建新弹窗
    const popup = new HTMap.Popup({
      map: map,
      lngLat: poi.lngLat,
      content: createPopupContent(poi),
      offset: { x: 0, y: -46 },  // 向上偏移46像素（标记点高度）
      showCloseBtn: true,
      enableCustom: false
    })
    
    popupInstance.value = popup
    
    // 监听关闭事件
    popup.on('close', () => {
      console.log('关闭了弹窗:', poi.name)
      popupInstance.value = null
    })
  })
})

onBeforeUnmount(() => {
  if (popupInstance.value) {
    popupInstance.value.removePopup()
  }
  if (mapInstance.value) {
    mapInstance.value.destroy()
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
```

### 示例2：Vue组件作为弹窗内容

```vue
<template>
  <div class="map-container">
    <div id="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, createApp } from 'vue'
import HTMap from '@/utils/HTMap/index.js'
import PopupContent from './PopupContent.vue'

const mapInstance = ref(null)

// 使用Vue组件创建弹窗
const createVuePopup = (map, lngLat, data) => {
  // 创建容器
  const container = document.createElement('div')
  
  // 挂载Vue组件
  const app = createApp(PopupContent, {
    data: data,
    onClose: () => {
      popup.removePopup()
      app.unmount()
    }
  })
  
  app.mount(container)
  
  // 创建弹窗
  const popup = new HTMap.Popup({
    map: map,
    lngLat: lngLat,
    content: container,
    offset: { x: 0, y: -20 },
    showCloseBtn: false,  // 使用组件内的关闭按钮
    enableCustom: true
  })
  
  return popup
}

onMounted(async () => {
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 12
  })
  
  await map.init()
  mapInstance.value = map
  
  // 地图点击创建弹窗
  map.on('click', (e) => {
    const popup = createVuePopup(map, e.lngLat, {
      title: '点击位置',
      lng: e.lngLat[0].toFixed(6),
      lat: e.lngLat[1].toFixed(6)
    })
  })
})
</script>
```

**PopupContent.vue：**
```vue
<template>
  <div class="popup-content">
    <div class="popup-header">
      <h3>{{ data.title }}</h3>
      <button @click="handleClose" class="close-btn">×</button>
    </div>
    <div class="popup-body">
      <p>经度: {{ data.lng }}</p>
      <p>纬度: {{ data.lat }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: Object,
  onClose: Function
})

const handleClose = () => {
  emit('close')
}

const emit = defineEmits(['close'])
</script>

<style scoped>
.popup-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.popup-body {
  padding: 15px;
}

.popup-body p {
  margin: 5px 0;
  color: #666;
}
</style>
```

---

## 注意事项

### 1. 坐标验证
- `lngLat` 必须是长度为2的数组
- 经度范围：-180 到 180
- 纬度范围：-90 到 90
- 必须是有效数字

### 2. 内容更新
- 使用 `setContent()` 可以动态更新内容
- 支持HTML字符串和DOM元素
- 注意内容中的样式可能与地图主题冲突

### 3. 位置偏移
- `offset` 用于调整弹窗相对于坐标的位置
- y为负值表示向上偏移
- 通常需要根据标记点高度调整

### 4. 生命周期
- 构造时自动添加到地图
- 组件销毁前记得调用 `removePopup()`
- 避免内存泄漏

### 5. 性能考虑
- 同时显示过多弹窗会影响性能
- 建议同一时间只显示一个弹窗
- 及时清理不需要的弹窗实例

---

**相关文档：**
- [标记点功能 →](./markers.md)
- [事件系统 →](./events.md)
- [最佳实践 →](./best-practices.md)

