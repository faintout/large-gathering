# API参考

本文档提供 HTMap 所有 API 的快速参考和索引。

## HTMap 主类

HTMap 主类是创建和管理地图实例的核心类。

### 构造函数

```javascript
new HTMap(container, config)
```

**参数：**
- `container` - 地图容器ID
- `config` - 地图配置对象

详见：[地图初始化 →](./initialization.md)

### 生命周期方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `init()` | 初始化地图（异步） | `Promise<void>` |
| `destroy()` | 销毁地图实例 | `void` |

### 地图操作方法

| 方法 | 说明 | 详细文档 |
|------|------|---------|
| `setCenter(lngLat)` | 设置地图中心 | [地图操作 →](./map-operations.md#setcenter) |
| `getCenter()` | 获取地图中心 | [地图操作 →](./map-operations.md#getcenter) |
| `setZoom(zoom)` | 设置缩放级别 | [地图操作 →](./map-operations.md#setzoom) |
| `getZoom()` | 获取缩放级别 | [地图操作 →](./map-operations.md#getzoom) |
| `getMinZoom()` | 获取最小缩放级别 | [地图操作 →](./map-operations.md#getminzoom) |
| `getMaxZoom()` | 获取最大缩放级别 | [地图操作 →](./map-operations.md#getmaxzoom) |
| `setPitch(pitch)` | 设置倾斜角度 | [地图操作 →](./map-operations.md#setpitch) |
| `getPitch()` | 获取倾斜角度 | [地图操作 →](./map-operations.md#getpitch) |
| `getMaxPitch()` | 获取最大倾斜角度 | [地图操作 →](./map-operations.md#getmaxpitch) |
| `setBearing(bearing)` | 设置旋转角度 | [地图操作 →](./map-operations.md#setbearing) |
| `getBearing()` | 获取旋转角度 | [地图操作 →](./map-operations.md#getbearing) |
| `setViewMode(mode)` | 设置视图模式 | [地图操作 →](./map-operations.md#setviewmode) |
| `setBounds(bounds)` | 设置地图范围 | [地图操作 →](./map-operations.md#setbounds) |
| `limitBounds(bounds)` | 限制地图范围 | [地图操作 →](./map-operations.md#limitbounds) |
| `getBounds()` | 获取地图范围 | [地图操作 →](./map-operations.md#getbounds) |
| `getSize()` | 获取容器尺寸 | [地图操作 →](./map-operations.md#getsize) |
| `easeTo(options)` | 平滑移动地图 | [地图操作 →](./map-operations.md#easeto) |
| `fitBounds(bounds)` | 适配到指定范围 | [地图操作 →](./map-operations.md#fitbounds) |
| `fitObjectsBounds(geometries)` | 适配到对象范围 | [地图操作 →](./map-operations.md#fitobjectsbounds) |
| `setStyleType(styleType)` | 切换样式主题 | [地图操作 →](./map-operations.md#setstyletype) |

### 路线规划方法

| 方法 | 说明 | 详细文档 |
|------|------|---------|
| `getRoute(options)` | 查询路线 | [路线规划 →](./route-planning.md) |

### 事件方法

| 方法 | 说明 | 详细文档 |
|------|------|---------|
| `on(eventType, callback)` | 绑定事件 | [事件系统 →](./events.md#事件绑定) |
| `off(eventType, callback)` | 解绑事件 | [事件系统 →](./events.md#事件解绑) |
| `isUnifiedEvent(eventType)` | 检查事件是否统一 | [事件系统 →](./events.md#检查事件是否统一) |

### 静态属性

| 属性 | 类型 | 说明 | 详细文档 |
|------|------|------|---------|
| `HTMap.unifiedEvents` | `Array` | 统一支持的事件列表 | [事件系统 →](./events.md#获取统一事件列表) |
| `HTMap.Map` | `Class` | 自动初始化的地图类 | [地图初始化 →](./initialization.md#方式二自动初始化) |
| `HTMap.Markers` | `Class` | 标记点管理类 | [标记点功能 →](./markers.md) |
| `HTMap.Marker` | `Class` | 单个DOM标记点类 | [单点标记 →](./markers.md#dommarker-单个dom标记点) |
| `HTMap.Lines` | `Class` | 线条管理类 | [线条功能 →](./lines.md) |
| `HTMap.Clusters` | `Class` | 聚合管理类 | [聚合功能 →](./clusters.md) |
| `HTMap.Polygons` | `Class` | 多边形管理类 | [多边形功能 →](./polygons.md) |
| `HTMap.Popup` | `Class` | 弹窗管理类 | [弹窗功能 →](./popup.md) |

---

## Markers 标记点类

标记点功能类，用于批量管理地图标记点。

### 构造函数

```javascript
new HTMap.Markers(options)
```

**参数选项：**
- `map` - 地图实例
- `id` - 标记组ID
- `geometries` - 几何数据数组
- `styles` - 样式配置数组
- `contentDom` - DOM元素
- `draggable` - 是否可拖拽
- `minZoom` - 最小缩放级别
- `maxZoom` - 最大缩放级别

详见：[标记点功能 →](./markers.md)

### addDomMarker() - 添加单个DOM标记点

**方法签名：**
```javascript
const marker = map.addDomMarker(options)
```

**参数选项：**
- `lngLat` - 位置坐标 [经度, 纬度]
- `contentDom` - 自定义DOM元素或HTML字符串
- `draggable` - 是否可拖拽
- `offset` - 偏移量 [x, y]
- `properties` - 自定义属性
- `minZoom` - 最小显示层级
- `maxZoom` - 最大显示层级

**返回值：** `Object` - 标记点实例

详见：[单点标记 →](./markers.md#dommarker-单个dom标记点)

---

## Marker (DomMarker) 单点标记类

用于管理单个自定义DOM标记点。

### 构造函数

```javascript
new HTMap.Marker(options)
```

**参数选项：**
- `map` - 地图实例（必填）
- `lngLat` - 位置坐标 [经度, 纬度]（必填）
- `contentDom` - 自定义DOM元素或HTML字符串
- `draggable` - 是否可拖拽
- `offset` - 偏移量 [x, y]
- `properties` - 自定义属性
- `minZoom` - 最小显示层级
- `maxZoom` - 最大显示层级

详见：[单点标记 →](./markers.md#dommarker-单个dom标记点)

### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `removeDomMarker()` | 移除标记点 | `void` |
| `setVisible(visible)` | 设置可见性 | `void` |
| `getVisible()` | 获取可见性 | `Boolean` |
| `setLngLat(lngLat)` | 设置位置坐标 | `Marker` |
| `getLngLat()` | 获取位置坐标 | `Array` |
| `updateMarkerDom(contentDom)` | 更新DOM元素 | `Marker` |
| `on(eventType, callback)` | 绑定事件 | `Marker` |
| `off(eventType, callback)` | 解绑事件 | `Marker` |

详见：[单点标记 →](./markers.md#dommarker-单个dom标记点)

---

## Lines 线条类

线条功能类，用于批量管理地图线条。

### 构造函数

```javascript
new HTMap.Lines(options)
```

**参数选项：**
- `map` - 地图实例
- `id` - 线条组ID
- `geometries` - 几何数据数组
- `styles` - 样式配置数组

详见：[线条功能 →](./lines.md)

### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `addToMap()` | 添加到地图 | `void` |
| `removeLines()` | 移除所有线条 | `void` |
| `setVisible(visible)` | 设置可见性 | `void` |
| `getVisible()` | 获取可见性 | `Boolean` |
| `getGeometries()` | 获取几何数据 | `Array` |
| `addGeometries(geometries)` | 添加新线条 | `void` |
| `removeGeometries(ids)` | 删除线条 | `void` |
| `updateLinesGeometries(geometries)` | 更新线条 | `void` |
| `getTotalLength()` | 获取总长度（米） | `Number` |
| `getLineDistanceById(id)` | 获取指定线条长度（米） | `Number` |
| `on(eventType, callback)` | 绑定事件 | `Lines` |
| `off(eventType, callback)` | 解绑事件 | `Lines` |

详见：[线条功能 →](./lines.md)

---

## Clusters 聚合类

聚合功能类，用于智能聚合大量点位数据。

### 构造函数

```javascript
new HTMap.Clusters(options)
```

**参数选项：**
- `map` - 地图实例
- `id` - 聚合组ID
- `geometries` - 几何数据数组
- `clusterConfig` - 聚合配置
- `clusterStyle` - 聚合点样式
- `nonClustersStyle` - 非聚合点样式数组
- `nonClustersDom` - DOM元素

详见：[聚合功能 →](./clusters.md)

### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `addToMap()` | 添加到地图 | `void` |
| `removeClusters()` | 移除所有聚合点 | `void` |
| `on(eventType, callback)` | 绑定事件 | `Clusters` |
| `off(eventType, callback)` | 解绑事件 | `Clusters` |

详见：[聚合功能 →](./clusters.md)

---

## Polygons 多边形类

多边形功能类，用于批量管理地图多边形。

### 构造函数

```javascript
new HTMap.Polygons(options)
```

**参数选项：**
- `map` - 地图实例
- `id` - 多边形组ID
- `geometries` - 几何数据数组
- `styles` - 样式配置数组

详见：[多边形功能 →](./polygons.md)

### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `addToMap()` | 添加到地图 | `void` |
| `removePolygons()` | 移除所有多边形 | `void` |
| `setVisible(visible)` | 设置可见性 | `void` |
| `getVisible()` | 获取可见性 | `Boolean` |
| `getGeometries()` | 获取几何数据 | `Array` |
| `addGeometries(geometries)` | 添加新多边形 | `void` |
| `removeGeometries(ids)` | 删除多边形 | `void` |
| `updatePolygonsGeometries(geometries)` | 更新多边形 | `void` |
| `on(eventType, callback)` | 绑定事件 | `Polygons` |
| `off(eventType, callback)` | 解绑事件 | `Polygons` |

详见：[多边形功能 →](./polygons.md)

---

## Popup 弹窗类

弹窗功能类，用于管理单个信息窗口。

### 构造函数

```javascript
new HTMap.Popup(options)
```

**参数选项：**
- `map` - 地图实例
- `id` - 弹窗ID
- `lngLat` - 位置坐标 [经度, 纬度]
- `content` - 弹窗内容（HTML或DOM）
- `offset` - 偏移量 {x, y}
- `showCloseBtn` - 是否显示关闭按钮
- `enableCustom` - 是否启用自定义样式

详见：[弹窗功能 →](./popup.md)

### 方法列表

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `addToMap()` | 添加到地图 | `void` |
| `removePopup()` | 移除弹窗 | `void` |
| `getElement()` | 获取DOM元素 | `HTMLElement` |
| `setLngLat(lngLat)` | 设置位置 | `void` |
| `setContent(content)` | 设置内容 | `void` |
| `on(eventType, callback)` | 绑定事件 | `Popup` |
| `off(eventType, callback)` | 解绑事件 | `Popup` |

详见：[弹窗功能 →](./popup.md)

---

## 数据类型

### 坐标格式

```typescript
type LngLat = [number, number]  // [经度, 纬度]
```

**示例：**
```javascript
[116.397128, 39.916527]  // 北京天安门
```

**约束：**
- 经度范围：-180 到 180
- 纬度范围：-90 到 90

### 边界格式

```typescript
type Bounds = [[number, number], [number, number]]  // [[西南角经纬度], [东北角经纬度]]
```

**示例：**
```javascript
[
  [116.3, 39.9],  // 西南角
  [116.5, 40.0]   // 东北角
]
```

### 几何数据

#### Marker几何数据

```typescript
interface MarkerGeometry {
  id?: string
  lngLat: LngLat
  properties?: object
  styleId?: string
}
```

#### Line几何数据

```typescript
interface LineGeometry {
  id?: string
  paths: LngLat[]
  properties?: object
  styleId?: string
}
```

#### Polygon几何数据

```typescript
interface PolygonGeometry {
  id?: string
  paths: LngLat[]  // 或 coordinates
  properties?: object
  styleId?: string
}
```

#### Cluster几何数据

```typescript
interface ClusterGeometry {
  id?: string
  lngLat: LngLat
  properties?: object
  styleId?: string
}
```

---

## 样式配置

### Marker样式

```typescript
interface MarkerStyle {
  id: string
  src?: string
  width?: number
  height?: number
  offset?: [number, number]
  rotation?: number
  faceForward?: 'standUp' | 'lieFlat'
}
```

### Line样式

```typescript
interface LineStyle {
  id: string
  color?: string
  width?: number
  borderColor?: string
  borderWidth?: number
  lineCap?: 'butt' | 'round' | 'square'
  dashArray?: [number, number]
  emitLight?: boolean
  dirArrows?: boolean
  dirAnimate?: 'forward' | 'backward' | null
  isCurve?: boolean
}
```

### Polygon样式

```typescript
interface PolygonStyle {
  id: string
  color?: string
  borderColor?: string
  borderWidth?: number
  borderDashArray?: [number, number] | null
  isConvex?: boolean
}
```

---

## 事件类型

### 地图事件

- `click` - 点击事件
- `dblclick` - 双击事件
- `movestart` - 移动开始
- `move` - 移动中
- `moveend` - 移动结束
- `dragstart` - 拖拽开始
- `drag` - 拖拽中
- `dragend` - 拖拽结束
- `zoom` - 缩放事件
- `zoomstart` - 缩放开始
- `zoomend` - 缩放结束
- `load` - 加载完成

详见：[事件系统 →](./events.md)

### 图层事件

- `click` - 点击事件
- `dblclick` - 双击事件
- `mouseenter` - 鼠标进入
- `mouseleave` - 鼠标离开
- `dragend` - 拖拽结束（Markers支持）

详见：[事件系统 →](./events.md)

---

## 配置选项

### 地图配置

```typescript
interface MapConfig {
  engine: 'tencent' | 'mapboxgl' | 'minemap'
  center: LngLat
  zoom: number
  minZoom?: number
  maxZoom?: number
  pitch?: number
  rotation?: number
  viewMode?: '2D' | '3D'
  styleType?: 'black' | 'white' | 'normal'
}
```

详见：[地图初始化 →](./initialization.md)

### 聚合配置

```typescript
interface ClusterConfig {
  maxZoom?: number
  minCount?: number
  radius?: number
  zoomOnClick?: boolean
}
```

详见：[聚合功能 →](./clusters.md)

---

**相关文档：**
- [快速开始 →](./getting-started.md)
- [核心概念 →](./core-concepts.md)
- [最佳实践 →](./best-practices.md)

