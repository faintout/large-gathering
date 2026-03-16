# 地图基础操作

本文档详细介绍 HTMap 提供的地图基础操作方法，包括视图控制、2D/3D切换、样式主题等功能。

## 方法快速索引

| 方法名 | 说明 | 跳转 |
|-------|------|------|
| `setCenter(center, options)` | 设置地图中心点 | [查看详情](#setcenter-设置地图中心点) |
| `getCenter()` | 获取地图中心点 | [查看详情](#getcenter-获取地图中心点) |
| `setZoom(zoom)` | 设置缩放级别 | [查看详情](#setzoom-设置缩放级别) |
| `getZoom()` | 获取缩放级别 | [查看详情](#getzoom-获取缩放级别) |
| `setPitch(pitch)` | 设置倾斜角度 | [查看详情](#setpitch-设置倾斜角度) |
| `getPitch()` | 获取倾斜角度 | [查看详情](#getpitch-获取倾斜角度) |
| `setBearing(bearing)` | 设置旋转角度 | [查看详情](#setbearing-设置旋转角度) |
| `getBearing()` | 获取旋转角度 | [查看详情](#getbearing-获取旋转角度) |
| `setViewMode(mode)` | 设置视图模式 | [查看详情](#setviewmode-设置视图模式) |
| `setBounds(bounds, options)` | 设置地图显示范围 | [查看详情](#setbounds-设置地图显示范围) |
| `limitBounds(bounds)` | 限制地图可移动范围 | [查看详情](#limitbounds-限制地图可移动范围) |
| `getBounds()` | 获取当前地图范围 | [查看详情](#getbounds-获取当前地图范围) |
| `easeTo(options)` | 平滑动画移动地图 | [查看详情](#easeto-平滑动画移动地图) |
| `fitBounds(bounds, options)` | 自适应显示范围 | [查看详情](#fitbounds-自适应显示范围) |
| `fitObjectsBounds(geometries, options)` | 自适应显示对象 | [查看详情](#fitobjectsbounds-自适应显示对象) |

## 视图控制方法

### setCenter() - 设置地图中心点

设置地图的中心点坐标。

**方法签名：**
```javascript
map.setCenter(center, options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `center` | `Array` | 是 | 中心点坐标 [经度, 纬度] | `[116.397128, 39.916527]` |
| `options` | `Object` | 否 | 动画选项 | `{ animate: true, duration: 2000 }` |
| `options.animate` | `Boolean` | 否 | 是否使用动画 | `true` |
| `options.duration` | `Number` | 否 | 动画时长（毫秒） | `2000` |

**返回值：** 无

**示例：**
```javascript
// 设置地图中心点到北京天安门
map.setCenter([116.397128, 39.916527])

// 带动画效果
map.setCenter([116.397128, 39.916527], {
  animate: true,
  duration: 2000
})

// 设置到上海外滩
map.setCenter([121.499763, 31.239895])
```

---

### getCenter() - 获取地图中心点

获取地图当前的中心点坐标。

**方法签名：**
```javascript
const center = map.getCenter()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Array` | 中心点坐标 [经度, 纬度] | `[116.397128, 39.916527]` |

**示例：**
```javascript
const center = map.getCenter()
console.log('当前中心点:', center)
// 输出: 当前中心点: [116.397128, 39.916527]

// 获取经纬度
const [lng, lat] = map.getCenter()
console.log(`经度: ${lng}, 纬度: ${lat}`)
// 输出: 经度: 116.397128, 纬度: 39.916527
```

---

### setZoom() - 设置缩放级别

设置地图的缩放级别。

**方法签名：**
```javascript
map.setZoom(zoom, options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `zoom` | `Number` | 是 | 缩放级别 (通常 3-20) | `12` |
| `options` | `Object` | 否 | 动画选项 | `{ animate: true, duration: 1500 }` |
| `options.animate` | `Boolean` | 否 | 是否使用动画 | `true` |
| `options.duration` | `Number` | 否 | 动画时长（毫秒） | `1500` |

**返回值：** 无

**示例：**
```javascript
// 设置到城市级别
map.setZoom(12)

// 设置到街道级别（带动画）
map.setZoom(15, {
  animate: true,
  duration: 1500
})

// 设置到建筑级别
map.setZoom(18)
```

---

### getZoom() - 获取缩放级别

获取地图当前的缩放级别。

**方法签名：**
```javascript
const zoom = map.getZoom()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Number` | 当前缩放级别 | `12` |

**示例：**
```javascript
const zoom = map.getZoom()
console.log('当前缩放级别:', zoom)
// 输出: 当前缩放级别: 12

// 判断缩放级别
if (zoom < 10) {
  console.log('当前在城市级别')
} else if (zoom < 15) {
  console.log('当前在区县级别')
} else {
  console.log('当前在街道级别')
}
```

---

### setPitch() - 设置倾斜角度

设置地图的倾斜角度（3D效果）。

**方法签名：**
```javascript
map.setPitch(pitch, options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `pitch` | `Number` | 是 | 倾斜角度（0-60度或0-80度） | `45` |
| `options` | `Object` | 否 | 动画选项 | `{ animate: true, duration: 2000 }` |
| `options.animate` | `Boolean` | 否 | 是否使用动画 | `true` |
| `options.duration` | `Number` | 否 | 动画时长（毫秒） | `2000` |

**返回值：** 无

**示例：**
```javascript
// 设置倾斜45度
map.setPitch(45)

// 设置倾斜60度（带动画）
map.setPitch(60, {
  animate: true,
  duration: 2000
})

// 恢复俯视视角
map.setPitch(0)
```

---

### getPitch() - 获取倾斜角度

获取地图当前的倾斜角度。

**方法签名：**
```javascript
const pitch = map.getPitch()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Number` | 当前倾斜角度（度） | `45` |

**示例：**
```javascript
const pitch = map.getPitch()
console.log('当前倾斜角度:', pitch, '度')
// 输出: 当前倾斜角度: 45 度

// 判断是否是3D视图
if (pitch > 0) {
  console.log('当前是3D视图')
} else {
  console.log('当前是2D视图')
}
```

---

### setBearing() / setRotation() - 设置旋转角度

设置地图的旋转角度。

**方法签名：**
```javascript
map.setBearing(bearing, options)
// 或
map.setRotation(rotation, options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `bearing` / `rotation` | `Number` | 是 | 旋转角度（0-360度） | `90` |
| `options` | `Object` | 否 | 动画选项 | `{ animate: true, duration: 3000 }` |
| `options.animate` | `Boolean` | 否 | 是否使用动画 | `true` |
| `options.duration` | `Number` | 否 | 动画时长（毫秒） | `3000` |

**返回值：** 无

**示例：**
```javascript
// 顺时针旋转90度
map.setBearing(90)

// 顺时针旋转180度（带动画）
map.setBearing(180, {
  animate: true,
  duration: 3000
})

// 恢复正北朝上
map.setBearing(0)
```

---

### getBearing() / getRotation() - 获取旋转角度

获取地图当前的旋转角度。

**方法签名：**
```javascript
const bearing = map.getBearing()
// 或
const rotation = map.getRotation()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Number` | 当前旋转角度（度） | `90` |

**示例：**
```javascript
const bearing = map.getBearing()
console.log('当前旋转角度:', bearing, '度')
// 输出: 当前旋转角度: 90 度

// 判断地图朝向
if (bearing === 0) {
  console.log('正北朝上')
} else if (bearing === 90) {
  console.log('正东朝上')
} else if (bearing === 180) {
  console.log('正南朝上')
} else if (bearing === 270) {
  console.log('正西朝上')
}
```

---

### getMinZoom() - 获取最小缩放级别

获取地图的最小缩放级别。

**方法签名：**
```javascript
const minZoom = map.getMinZoom()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Number` | 最小缩放级别 | `3` |

**示例：**
```javascript
const minZoom = map.getMinZoom()
console.log('最小缩放级别:', minZoom)
// 输出: 最小缩放级别: 3
```

---

### getMinZoom() - 获取最小缩放级别

获取地图的最小缩放级别（根据当前地图引擎动态获取）。

**方法签名：**
```javascript
const minZoom = map.getMinZoom()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Number` | 最小缩放级别 | `3` |

**示例：**
```javascript
const minZoom = map.getMinZoom()
console.log('最小缩放级别:', minZoom)
// 输出: 最小缩放级别: 3

// 不同引擎的最小缩放级别可能不同
// 腾讯地图: 3
// 四维图新: 3
// MapboxGL: 0
```

---

### getMaxZoom() - 获取最大缩放级别

获取地图的最大缩放级别（根据当前地图引擎动态获取）。

**方法签名：**
```javascript
const maxZoom = map.getMaxZoom()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Number` | 最大缩放级别 | `22` |

**示例：**
```javascript
const maxZoom = map.getMaxZoom()
console.log('最大缩放级别:', maxZoom)
// 输出: 最大缩放级别: 22

// 不同引擎的最大缩放级别
// 腾讯地图: 22
// 四维图新: 20
// MapboxGL: 22
```

---

### getMaxPitch() - 获取最大倾斜角度

获取地图的最大倾斜角度（根据当前地图引擎动态获取）。

**方法签名：**
```javascript
const maxPitch = map.getMaxPitch()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Number` | 最大倾斜角度（度） | `80` |

**示例：**
```javascript
const maxPitch = map.getMaxPitch()
console.log('最大倾斜角度:', maxPitch, '度')
// 输出: 最大倾斜角度: 80 度

// 不同引擎的最大倾斜角度
// 腾讯地图: 80
// 四维图新: 60
// MapboxGL: 85
```

---

### getSize() - 获取容器尺寸

获取地图容器的尺寸。

**方法签名：**
```javascript
const size = map.getSize()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Object` | 容器尺寸对象 | `{ width: 1200, height: 600 }` |

**返回值对象结构：**
```javascript
{
  width: 1200,   // 宽度（像素）
  height: 600    // 高度（像素）
}
```

**示例：**
```javascript
const size = map.getSize()
console.log('容器尺寸:', size)
// 输出: 容器尺寸: { width: 1200, height: 600 }

console.log(`宽度: ${size.width}px, 高度: ${size.height}px`)
// 输出: 宽度: 1200px, 高度: 600px
```

---

## 视图模式控制

### setViewMode() - 切换2D/3D模式

切换地图的2D/3D显示模式。

**方法签名：**
```javascript
map.setViewMode(mode, options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `mode` | `String` | 是 | 视图模式 | `'2D'` \| `'3D'` |
| `options` | `Object` | 否 | 配置选项 | `{ pitch: 45, animate: true }` |
| `options.pitch` | `Number` | 否 | 3D模式下的倾斜角度 | `45` |
| `options.animate` | `Boolean` | 否 | 是否使用动画 | `true` |
| `options.duration` | `Number` | 否 | 动画时长（毫秒） | `2000` |

**返回值：** 无

**示例：**
```javascript
// 切换到3D模式
map.setViewMode('3D', {
  pitch: 45,
  animate: true,
  duration: 2000
})

// 切换到2D模式
map.setViewMode('2D', {
  animate: true
})

// 切换到3D模式（倾斜60度）
map.setViewMode('3D', {
  pitch: 60
})
```

---

### getViewMode() - 获取当前视图模式

获取地图当前的视图模式。

**方法签名：**
```javascript
const viewMode = map.getViewMode()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `String` | 当前视图模式 | `'2D'` \| `'3D'` |

**示例：**
```javascript
const viewMode = map.getViewMode()
console.log('当前视图模式:', viewMode)
// 输出: 当前视图模式: 3D
```

---

### setStyleType() - 切换样式主题

切换地图的样式主题（如卫星图、暗色主题等）。

**方法签名：**
```javascript
map.setStyleType(styleType, options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `styleType` | `String` | 是 | 样式类型 | `'black'` \| `'white'` \| `'satellite'` |
| `options` | `Object` | 否 | 切换选项 | `{}` |

**返回值：** 无

**支持的样式类型：**
- `'black'` / `'dark'` - 暗色主题
- `'white'` / `'light'` - 亮色主题
- `'satellite'` - 卫星图
- `'hybrid'` - 混合图（卫星图+路网）
- `'normal'` / `'default'` - 默认样式

**示例：**
```javascript
// 切换到卫星图
map.setStyleType('satellite')

// 切换到暗色主题
map.setStyleType('black')

// 切换到亮色主题
map.setStyleType('white')

// 切换到混合图
map.setStyleType('hybrid')
```

---

### getStyleType() - 获取当前样式类型

获取地图当前的样式类型。

**方法签名：**
```javascript
const styleType = map.getStyleType()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `String` | 当前样式类型 | `'black'` |

**示例：**
```javascript
const styleType = map.getStyleType()
console.log('当前样式类型:', styleType)
// 输出: 当前样式类型: black
```

---

## 边界与视野控制

### getBounds() - 获取地图边界

获取地图当前显示的地理边界。

**方法签名：**
```javascript
const bounds = map.getBounds()
```

**参数：** 无

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Object` | 边界对象 | `{ sw: [116.3, 39.9], ne: [116.5, 40.0] }` |

**返回值对象结构：**
```javascript
{
  sw: [116.3, 39.9],  // 西南角坐标 [经度, 纬度]
  ne: [116.5, 40.0]   // 东北角坐标 [经度, 纬度]
}
```

**示例：**
```javascript
const bounds = map.getBounds()
console.log('地图边界:', bounds)
// 输出: 地图边界: { sw: [116.3, 39.9], ne: [116.5, 40.0] }

const [swLng, swLat] = bounds.sw
const [neLng, neLat] = bounds.ne
console.log(`西南角: ${swLng}, ${swLat}`)
console.log(`东北角: ${neLng}, ${neLat}`)
```

---

### setBounds() - 设置地图边界

设置地图显示的地理边界范围。

**方法签名：**
```javascript
map.setBounds(options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `options` | `Object` | 是 | 边界配置对象 | - |
| `options.sw` | `Array` | 是 | 西南角坐标 [经度, 纬度] | `[116.3, 39.9]` |
| `options.ne` | `Array` | 是 | 东北角坐标 [经度, 纬度] | `[116.5, 40.0]` |
| `options.padding` | `Number` \| `Array` | 否 | 边距（像素） | `50` 或 `[10, 20, 10, 20]` |
| `options.duration` | `Number` | 否 | 动画时长（毫秒） | `2000` |

**返回值：** 无

**示例：**
```javascript
// 设置地图边界
map.setBounds({
  sw: [116.3, 39.9],
  ne: [116.5, 40.0]
})

// 带边距的边界
map.setBounds({
  sw: [116.3, 39.9],
  ne: [116.5, 40.0],
  padding: 50  // 四周留50像素边距
})

// 带不同边距
map.setBounds({
  sw: [116.3, 39.9],
  ne: [116.5, 40.0],
  padding: [10, 20, 10, 20],  // 上、右、下、左
  duration: 2000
})
```

---

### limitBounds() - 限制地图视野范围

限制地图的可视范围，用户无法拖动到范围外。

**方法签名：**
```javascript
map.limitBounds(bounds)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `bounds` | `Object` | 是 | 边界对象 | `{ sw: [116.3, 39.9], ne: [116.5, 40.0] }` |
| `bounds.sw` | `Array` | 是 | 西南角坐标 [经度, 纬度] | `[116.3, 39.9]` |
| `bounds.ne` | `Array` | 是 | 东北角坐标 [经度, 纬度] | `[116.5, 40.0]` |

**返回值：**

| 类型 | 说明 | 示例值 |
|------|------|--------|
| `Boolean` | 是否成功设置 | `true` |

**示例：**
```javascript
// 限制地图视野在北京市范围内
const success = map.limitBounds({
  sw: [115.4, 39.4],   // 西南角
  ne: [117.5, 41.1]    // 东北角
})

if (success) {
  console.log('视野限制设置成功')
}
```

---

## 平滑动画

### easeTo() - 平滑过渡到指定视角

使用平滑动画过渡到指定的地图视角。

**方法签名：**
```javascript
map.easeTo(options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `options` | `Object` | 是 | 视角配置对象 | - |
| `options.center` | `Array` | 否 | 中心点坐标 [经度, 纬度] | `[116.397128, 39.916527]` |
| `options.zoom` | `Number` | 否 | 缩放级别 | `15` |
| `options.bearing` | `Number` | 否 | 旋转角度（度） | `90` |
| `options.pitch` | `Number` | 否 | 倾斜角度（度） | `45` |
| `options.padding` | `Number` \| `Array` | 否 | 边距（像素） | `50` 或 `[10, 20, 10, 20]` |
| `options.duration` | `Number` | 否 | 动画时长（毫秒） | `3000` |

**返回值：** 无

**示例：**
```javascript
// 平滑过渡到新视角
map.easeTo({
  center: [116.397128, 39.916527],
  zoom: 15,
  bearing: 0,
  pitch: 45,
  duration: 3000
})

// 只改变中心点和缩放
map.easeTo({
  center: [121.499763, 31.239895],  // 上海
  zoom: 12,
  duration: 2000
})

// 3D视角动画
map.easeTo({
  pitch: 60,
  bearing: 90,
  duration: 2000
})
```

---

### fitBounds() - 平滑过渡到指定边界

使用平滑动画调整视角以适应指定的地理边界。

**方法签名：**
```javascript
map.fitBounds(options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `options` | `Object` | 是 | 边界配置对象 | - |
| `options.sw` | `Array` | 是 | 西南角坐标 [经度, 纬度] | `[116.3, 39.9]` |
| `options.ne` | `Array` | 是 | 东北角坐标 [经度, 纬度] | `[116.5, 40.0]` |
| `options.padding` | `Number` \| `Array` | 否 | 边距（像素） | `50` 或 `[10, 20, 10, 20]` |
| `options.duration` | `Number` | 否 | 动画时长（毫秒） | `2000` |

**返回值：** 无

**示例：**
```javascript
// 适应指定边界
map.fitBounds({
  sw: [116.3, 39.9],
  ne: [116.5, 40.0],
  padding: 50,
  duration: 2000
})

// 不同方向的边距
map.fitBounds({
  sw: [116.3, 39.9],
  ne: [116.5, 40.0],
  padding: [20, 40, 20, 40],  // 上、右、下、左
  duration: 1500
})
```

---

### fitObjectsBounds() - 适应多个对象的范围

自动计算并适应多个地理坐标点的边界范围。

**方法签名：**
```javascript
map.fitObjectsBounds(options)
```

**参数：**

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| `options` | `Object` | 是 | 配置对象 | - |
| `options.coordinates` | `Array` | 是 | 坐标点数组 | `[[116.3, 39.9], [116.4, 40.0], [116.5, 40.1]]` |
| `options.padding` | `Number` \| `Array` | 否 | 边距（像素） | `50` 或 `[10, 20, 10, 20]` |
| `options.duration` | `Number` | 否 | 动画时长（毫秒） | `2000` |

**返回值：** 无

**示例：**
```javascript
// 适应多个标记点
map.fitObjectsBounds({
  coordinates: [
    [116.397128, 39.916527],  // 天安门
    [116.404448, 39.915225],  // 故宫
    [116.391311, 39.906726],  // 天坛
    [116.420000, 39.920000]   // 其他点
  ],
  padding: 50,
  duration: 2000
})

// 适应线条路径
const linePaths = [
  [116.3, 39.9],
  [116.35, 39.95],
  [116.4, 40.0],
  [116.45, 40.05]
]

map.fitObjectsBounds({
  coordinates: linePaths,
  padding: [20, 40, 20, 40],
  duration: 1500
})
```

---

## 地图生命周期

### destroy() - 销毁地图

销毁地图实例，释放资源。

**方法签名：**
```javascript
map.destroy()
```

**参数：** 无

**返回值：** 无

**示例：**
```javascript
// 在 Vue 组件销毁时清理地图
onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
})
```

---

## 完整示例

### 示例1：创建带控制面板的地图

```vue
<template>
  <div class="map-container">
    <div id="map"></div>
    
    <!-- 控制面板 -->
    <div class="controls">
      <h3>地图控制</h3>
      
      <!-- 视图模式 -->
      <div class="control-group">
        <label>视图模式:</label>
        <button @click="setViewMode('2D')">2D</button>
        <button @click="setViewMode('3D')">3D</button>
      </div>
      
      <!-- 样式主题 -->
      <div class="control-group">
        <label>样式主题:</label>
        <button @click="setStyle('black')">暗色</button>
        <button @click="setStyle('white')">亮色</button>
        <button @click="setStyle('satellite')">卫星</button>
      </div>
      
      <!-- 缩放控制 -->
      <div class="control-group">
        <label>缩放: {{ zoom }}</label>
        <button @click="zoomIn">+</button>
        <button @click="zoomOut">-</button>
      </div>
      
      <!-- 旋转控制 -->
      <div class="control-group">
        <label>旋转: {{ bearing }}°</label>
        <button @click="rotate(-45)">逆时针</button>
        <button @click="rotate(45)">顺时针</button>
        <button @click="resetBearing">重置</button>
      </div>
      
      <!-- 预设位置 -->
      <div class="control-group">
        <label>跳转到:</label>
        <button @click="goToBeijing">北京</button>
        <button @click="goToShanghai">上海</button>
        <button @click="goToGuangzhou">广州</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

const mapInstance = ref(null)
const zoom = ref(12)
const bearing = ref(0)

onMounted(async () => {
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 12
  })
  
  await map.init()
  mapInstance.value = map
  
  // 监听地图变化
  updateMapInfo()
})

// 更新地图信息
const updateMapInfo = () => {
  if (!mapInstance.value) return
  zoom.value = Math.round(mapInstance.value.getZoom())
  bearing.value = Math.round(mapInstance.value.getBearing())
}

// 切换视图模式
const setViewMode = (mode) => {
  mapInstance.value?.setViewMode(mode, {
    pitch: mode === '3D' ? 45 : 0,
    animate: true,
    duration: 2000
  })
}

// 切换样式
const setStyle = (styleType) => {
  mapInstance.value?.setStyleType(styleType)
}

// 放大
const zoomIn = () => {
  const currentZoom = mapInstance.value?.getZoom() || 12
  mapInstance.value?.setZoom(currentZoom + 1, {
    animate: true,
    duration: 500
  })
  setTimeout(updateMapInfo, 500)
}

// 缩小
const zoomOut = () => {
  const currentZoom = mapInstance.value?.getZoom() || 12
  mapInstance.value?.setZoom(currentZoom - 1, {
    animate: true,
    duration: 500
  })
  setTimeout(updateMapInfo, 500)
}

// 旋转
const rotate = (angle) => {
  const currentBearing = mapInstance.value?.getBearing() || 0
  mapInstance.value?.setBearing(currentBearing + angle, {
    animate: true,
    duration: 1000
  })
  setTimeout(updateMapInfo, 1000)
}

// 重置旋转
const resetBearing = () => {
  mapInstance.value?.setBearing(0, {
    animate: true,
    duration: 1000
  })
  setTimeout(updateMapInfo, 1000)
}

// 跳转到北京
const goToBeijing = () => {
  mapInstance.value?.easeTo({
    center: [116.397128, 39.916527],
    zoom: 12,
    bearing: 0,
    pitch: 0,
    duration: 2000
  })
}

// 跳转到上海
const goToShanghai = () => {
  mapInstance.value?.easeTo({
    center: [121.499763, 31.239895],
    zoom: 12,
    bearing: 0,
    pitch: 0,
    duration: 2000
  })
}

// 跳转到广州
const goToGuangzhou = () => {
  mapInstance.value?.easeTo({
    center: [113.331656, 23.109361],
    zoom: 12,
    bearing: 0,
    pitch: 0,
    duration: 2000
  })
}

onBeforeUnmount(() => {
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

.controls {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  z-index: 1000;
}

.controls h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 500;
}

.control-group button {
  margin-right: 5px;
  padding: 5px 10px;
  font-size: 12px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
  border-radius: 4px;
}

.control-group button:hover {
  background: #e0e0e0;
}
</style>
```

---

**下一步：**
- [标记点功能 →](./markers.md)
- [线条功能 →](./lines.md)
- [事件系统 →](./events.md)

