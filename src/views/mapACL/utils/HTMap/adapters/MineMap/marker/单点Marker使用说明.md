# HTMap 单点 Marker 使用说明文档

## 目录

1. [概述](#概述)
2. [配置参数](#配置参数)
3. [API 方法](#api-方法)
4. [事件处理](#事件处理)
5. [使用示例](#使用示例)
6. [注意事项](#注意事项)

---

## 概述

`HTMap.Marker` 是 HTMap 地图反腐层提供的单点标记类，用于在地图上创建、管理和操作单个标记点。支持默认图标、自定义图片、自定义 DOM 三种模式。

### 引入方式

```javascript
import HTMap from '@/utils/HTMap'

// 创建 marker 实例
const marker = new HTMap.Marker(options)
```

---

## 配置参数

### 构造函数参数 (options)

创建 Marker 时需要传入配置对象，所有参数如下：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `map` | HTMap.Map | ✅ | - | 地图实例（必填） |
| `lngLat` | Array<number> | ✅ | - | 标记点坐标 [经度, 纬度] |
| `element` | HTMLElement | ❌ | null | 自定义 DOM 元素，为 null 时使用默认图标或 styles.src |
| `id` | string | ❌ | null | 标记点唯一标识符 |
| `anchor` | string | ❌ | 'center' | 锚点位置：'center' \| 'top' \| 'bottom' \| 'left' \| 'right' \| 'top-left' 等 |
| `offset` | Array<number> | ❌ | [0, 0] | 偏移量 [x, y]，单位：像素 |
| `draggable` | boolean | ❌ | false | 是否可拖拽 |
| `minZoom` | number | ❌ | 0 | 最小显示缩放级别 |
| `maxZoom` | number | ❌ | 24 | 最大显示缩放级别 |
| `styles` | object | ❌ | {} | 样式配置对象（见下方 styles 说明） |

### styles 对象参数

当不提供 `element` 时，可以通过 `styles` 对象自定义标记点样式：

| 参数 | 类型 | 说明 |
|------|------|------|
| `src` | string | 图片 URL（支持网络图片、base64 等） |
| `width` | number | 标记点宽度（像素），默认 40 |
| `height` | number | 标记点高度（像素），默认 46 |
| `text` | string | 文字内容 |
| `textSize` | number | 文字大小（像素），默认 12 |
| `textColor` | string | 文字颜色（十六进制），默认 '#000000' |
| `backColor` | string | 背景颜色（十六进制） |

### 参数示例

```javascript
// 1. 默认图标标记点
const marker1 = new HTMap.Marker({
  map: mapInstance,
  lngLat: [114.884094, 40.8119]
})

// 2. 自定义图片标记点
const marker2 = new HTMap.Marker({
  map: mapInstance,
  lngLat: [114.884094, 40.8119],
  styles: {
    src: 'https://example.com/icon.png',
    width: 50,
    height: 60
  }
})

// 3. 自定义 DOM 标记点
const customEl = document.createElement('div')
customEl.innerHTML = '<div style="background: #4B98FA; color: white; padding: 10px;">自定义DOM</div>'
const marker3 = new HTMap.Marker({
  map: mapInstance,
  lngLat: [114.884094, 40.8119],
  element: customEl
})

// 4. 完整配置示例
const marker4 = new HTMap.Marker({
  map: mapInstance,
  lngLat: [114.884094, 40.8119],
  id: 'marker-001',
  anchor: 'center',
  offset: [0, -20],
  draggable: true,
  minZoom: 10,
  maxZoom: 18,
  styles: {
    src: 'https://example.com/icon.png',
    width: 40,
    height: 46
  }
})
```

---

## API 方法

### 坐标相关

#### `setLngLat(lngLat)`

更新标记点坐标。

**参数：**
- `lngLat` (Array<number>): [经度, 纬度]

**返回值：** `this` (支持链式调用)

**示例：**
```javascript
marker.setLngLat([115.0, 40.5])
```

#### `getLngLat()`

获取标记点当前坐标。

**返回值：** `Array<number>` | `null`

**示例：**
```javascript
const position = marker.getLngLat()
console.log(position) // [114.884094, 40.8119]
```

---

### 可见性控制

#### `setVisible(visible)`

设置标记点显示/隐藏。

**参数：**
- `visible` (boolean): true 显示，false 隐藏

**返回值：** `this` (支持链式调用)

**示例：**
```javascript
marker.setVisible(false) // 隐藏
marker.setVisible(true)  // 显示
```

---

### 事件绑定

#### `on(event, callback)`

绑定事件监听器。

**参数：**
- `event` (string): 事件类型（见事件类型说明）
- `callback` (Function): 事件回调函数

**返回值：** `this` (支持链式调用)

**示例：**
```javascript
marker.on('click', (eventData) => {
  console.log('标记点被点击', eventData)
})
```

#### `off(event, callback)`

解绑事件监听器。

**参数：**
- `event` (string): 事件类型
- `callback` (Function): 要解绑的回调函数（可选，不传则解绑该事件的所有监听器）

**返回值：** `this` (支持链式调用)

**示例：**
```javascript
const handleClick = () => console.log('点击')
marker.on('click', handleClick)
marker.off('click', handleClick) // 解绑特定回调
marker.off('click') // 解绑所有 click 事件
```

#### `once(event, callback)`

绑定一次性事件监听器（触发一次后自动解绑）。

**参数：**
- `event` (string): 事件类型
- `callback` (Function): 事件回调函数

**返回值：** `this` (支持链式调用)

**示例：**
```javascript
marker.once('click', () => {
  console.log('只会触发一次')
})
```

---

### 属性获取

#### `getId()`

获取标记点 ID。

**返回值：** `string` | `null`

#### `getElement()`

获取标记点的 DOM 元素。

**返回值：** `HTMLElement` | `null`

**示例：**
```javascript
const el = marker.getElement()
if (el) {
  el.style.cursor = 'pointer'
}
```

#### `getMarker()`

获取底层原始 marker 实例。

**返回值：** `object` | `Promise` | `null`

#### `getProperties()`

获取标记点的所有自定义属性。

**返回值：** `object`

---

### 属性设置

#### `setProperties(props)`

设置自定义属性（合并到 options）。

**参数：**
- `props` (object): 要设置的属性对象

**返回值：** `this` (支持链式调用)

**示例：**
```javascript
marker.setProperties({
  customData: 'value',
  userId: 123
})
```

---

### 更新操作

#### `update(partial)`

批量更新标记点信息（坐标、样式、属性等）。

**参数：**
- `partial` (object): 要更新的属性对象

**返回值：** `this` (支持链式调用)

**支持更新的属性：**
- `lngLat`: 更新坐标
- `visible`: 更新可见性
- `draggable`: 更新拖拽状态
- `anchor`: 更新锚点
- `offset`: 更新偏移量
- `minZoom`: 更新最小缩放级别
- `maxZoom`: 更新最大缩放级别
- `styles`: 更新样式对象
- `element`: 更新 DOM 元素

**示例：**
```javascript
// 更新坐标和样式
marker.update({
  lngLat: [115.0, 40.5],
  styles: {
    src: 'https://example.com/new-icon.png',
    width: 60,
    height: 70
  }
})

// 更新可见性
marker.update({
  visible: false
})

// 更新 DOM 元素
const newEl = document.createElement('div')
newEl.textContent = '新的DOM'
marker.update({
  element: newEl
})
```

---

### 移除操作

#### `remove()`

从地图上移除标记点。

**返回值：** `boolean` - 移除是否成功

**示例：**
```javascript
const success = marker.remove()
if (success) {
  console.log('标记点已移除')
}
```

**注意：** 移除后，marker 实例仍然存在，但已从地图上移除。建议将引用设为 null：

```javascript
marker.remove()
marker = null
```

---

## 事件处理

### 支持的事件类型

| 事件类型 | 说明 | 事件数据 |
|---------|------|---------|
| `click` | 单击事件 | 标准事件数据对象 |
| `dblclick` | 双击事件 | 标准事件数据对象 |
| `rightClick` | 右键点击事件 | 标准事件数据对象 |
| `mouseenter` | 鼠标进入 | 标准事件数据对象 |
| `mouseleave` | 鼠标离开 | 标准事件数据对象 |
| `dragstart` | 拖拽开始 | 标准事件数据对象 |
| `drag` | 拖拽中 | 标准事件数据对象 |
| `dragend` | 拖拽结束 | 标准事件数据对象 |

### 事件数据对象 (eventData)

所有事件回调函数都会接收一个标准格式的事件数据对象：

```javascript
{
  // 事件类型
  type: 'click',
  
  // 目标元素
  target: HTMLElement,
  
  // 经纬度坐标
  lngLat: {
    lng: 114.884094,
    lat: 40.8119
  },
  latLng: { // 同 lngLat，兼容格式
    lng: 114.884094,
    lat: 40.8119
  },
  
  // 屏幕坐标（像素）
  point: {
    x: 100,
    y: 200
  },
  
  // 标记点信息
  marker: {
    id: 'marker-001',
    coordinates: [114.884094, 40.8119],
    properties: {}
  },
  
  // 标记点实例
  markerInstance: object,
  
  // 原始 DOM 事件
  originalEvent: Event,
  
  // 时间戳
  timestamp: 1234567890
}
```

### 事件使用示例

```javascript
// 单击事件
marker.on('click', (eventData) => {
  console.log('标记点被点击', eventData.lngLat)
})

// 双击事件
marker.on('dblclick', (eventData) => {
  console.log('标记点被双击', eventData)
})

// 右键点击事件
marker.on('rightClick', (eventData) => {
  console.log('标记点被右键点击', eventData)
  // 可以显示自定义菜单
})

// 鼠标进入/离开
marker.on('mouseenter', () => {
  console.log('鼠标进入标记点')
})

marker.on('mouseleave', () => {
  console.log('鼠标离开标记点')
})

// 拖拽事件（需要 draggable: true）
marker.on('dragstart', (eventData) => {
  console.log('开始拖拽', eventData.lngLat)
})

marker.on('drag', (eventData) => {
  console.log('拖拽中', eventData.lngLat)
})

marker.on('dragend', (eventData) => {
  console.log('拖拽结束', eventData.lngLat)
  // 可以保存新位置
})
```

---

## 使用示例

### 示例 1：创建默认图标标记点

```javascript
import HTMap from '@/utils/HTMap'

// 初始化地图
const map = new HTMap.Map('mapContainer', {
  engine: 'tencent',
  center: [114.884094, 40.8119],
  zoom: 15
})

// 创建默认标记点
const marker = new HTMap.Marker({
  map: map,
  lngLat: [114.884094, 40.8119]
})

// 绑定点击事件
marker.on('click', () => {
  console.log('标记点被点击')
})
```

### 示例 2：创建自定义图片标记点

```javascript
const marker = new HTMap.Marker({
  map: map,
  lngLat: [114.884094, 40.8119],
  styles: {
    src: 'https://example.com/marker-icon.png',
    width: 50,
    height: 60
  },
  anchor: 'center',
  offset: [0, -30],
  draggable: true
})

marker.on('click', (e) => {
  console.log('自定义图片标记点被点击', e.lngLat)
})
```

### 示例 3：创建自定义 DOM 标记点

```javascript
// 创建自定义 DOM
const customEl = document.createElement('div')
customEl.innerHTML = `
  <div style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: bold;
  ">
    <div>📍</div>
    <div>自定义标记</div>
  </div>
`

const marker = new HTMap.Marker({
  map: map,
  lngLat: [114.884094, 40.8119],
  element: customEl
})
```

### 示例 4：动态更新标记点

```javascript
// 更新坐标
marker.setLngLat([115.0, 40.5])

// 更新样式
marker.update({
  styles: {
    src: 'https://example.com/new-icon.png',
    width: 60,
    height: 70
  }
})

// 批量更新
marker.update({
  lngLat: [115.5, 41.0],
  visible: true,
  styles: {
    src: 'https://example.com/icon.png',
    width: 50,
    height: 50
  }
})

// 更新 DOM
const newEl = document.createElement('div')
newEl.textContent = '新内容'
marker.update({
  element: newEl
})
```

### 示例 5：监听拖拽并保存位置

```javascript
const marker = new HTMap.Marker({
  map: map,
  lngLat: [114.884094, 40.8119],
  draggable: true
})

marker.on('dragend', (eventData) => {
  const newPosition = eventData.lngLat
  console.log('新位置:', newPosition)
  
  // 保存到服务器
  saveMarkerPosition(marker.getId(), newPosition)
})

function saveMarkerPosition(id, position) {
  // 发送请求保存位置
  fetch('/api/marker/update', {
    method: 'POST',
    body: JSON.stringify({
      id,
      lng: position.lng,
      lat: position.lat
    })
  })
}
```

### 示例 6：根据缩放级别显示/隐藏标记点

```javascript
const marker = new HTMap.Marker({
  map: map,
  lngLat: [114.884094, 40.8119],
  minZoom: 10,  // 缩放级别 >= 10 时显示
  maxZoom: 18   // 缩放级别 <= 18 时显示
})

// 标记点在缩放级别 10-18 之间显示，其他级别自动隐藏
```

### 示例 7：链式调用

```javascript
const marker = new HTMap.Marker({
  map: map,
  lngLat: [114.884094, 40.8119]
})
  .setLngLat([115.0, 40.5])
  .setVisible(true)
  .on('click', () => console.log('点击'))
  .on('dblclick', () => console.log('双击'))
```

---

## 注意事项

### 1. Promise 返回值处理

某些底层 SDK 的方法可能返回 Promise，Marker 类已自动处理。如果遇到异步问题，可以手动等待：

```javascript
const marker = new HTMap.Marker({ map, lngLat: [114.9, 40.8] })

// 如果 marker.getMarker() 返回 Promise
const actualMarker = await marker.getMarker()
```

### 2. 坐标格式

坐标统一使用 `[经度, 纬度]` 格式，注意顺序。

### 3. 移除标记点

移除标记点后，建议将引用设为 `null`，避免内存泄漏：

```javascript
marker.remove()
marker = null
```

### 4. 事件解绑

在组件销毁或不再需要时，记得解绑事件：

```javascript
// Vue 组件中
onBeforeUnmount(() => {
  if (marker) {
    marker.off('click')
    marker.off('dblclick')
    // ... 解绑所有事件
    marker.remove()
    marker = null
  }
})
```

### 5. 缩放级别控制

`minZoom` 和 `maxZoom` 在 MineMap 等某些 SDK 中可能通过事件监听实现，性能开销较小。

### 6. 自定义 DOM 元素

- 确保自定义 DOM 元素已完全创建后再传入
- 建议使用 `cloneNode(true)` 克隆元素，避免引用问题
- 自定义 DOM 样式应自行处理，确保在地图上正确显示

### 7. 样式更新

- 更新图片时，如果是 `<img>` 标签会直接更新 `src`，如果是 `<div>` 会使用 `backgroundImage`
- 尺寸更新会同时更新 `style` 和属性（对于 img 标签）

---

## 版本信息

- **版本**: 1.0.0
- **最后更新**: 2024年
- **兼容性**: HTMap 反腐蚀层

---

## 技术支持

如有问题或建议，请联系开发团队。

