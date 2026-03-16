# 地图初始化与配置

本文档详细介绍 HTMap 的初始化方法和配置选项。

## 基础初始化

### 创建地图实例

HTMap 提供两种初始化方式：标准初始化和自动初始化。

#### 方式一：标准初始化（推荐）

```javascript
import HTMap from '@/utils/HTMap/index.js'

// 1. 创建地图实例
const map = new HTMap('map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12
})

// 2. 等待地图初始化完成
await map.init()

// 3. 地图就绪，可以进行操作
console.log('地图初始化成功')
```

#### 方式二：自动初始化

```javascript
// 使用 HTMap.Map 类，自动初始化
const map = new HTMap.Map('map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12
})

// 无需调用 init()，Map 类会自动初始化
// 方法调用会自动等待初始化完成
await map.setCenter([116.4, 39.92])
```

### 完整的 Vue3 示例

```vue
<template>
  <div id="map" style="width: 100%; height: 600px;"></div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

const mapInstance = ref(null)

onMounted(async () => {
  try {
    // 创建地图
    const map = new HTMap('map', {
      engine: 'tencent',
      center: [116.397128, 39.916527],
      zoom: 12,
      pitch: 0,
      bearing: 0
    })
    
    // 初始化
    await map.init()
    
    // 保存实例
    mapInstance.value = map
    
    console.log('地图初始化成功')
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
})

// 组件销毁时清理
onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
  }
})
</script>
```

## 通用配置参数

### 配置参数表

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例值 |
|-------|------|------|--------|------|--------|
| `engine` | `String` | 是 | `'tencent'` | 地图引擎类型 | `'tencent'` \| `'minemap'` \| `'mapbox'` |
| `center` | `Array` | 否 | `[114.884094, 40.8119]` | 地图中心点坐标 [经度, 纬度] | `[116.397128, 39.916527]` |
| `zoom` | `Number` | 否 | `15` | 缩放级别 | `12` (3-20) |
| `minZoom` | `Number` | 否 | `3` | 最小缩放级别 | `3` |
| `maxZoom` | `Number` | 否 | `24` | 最大缩放级别 | `20` |
| `pitch` | `Number` | 否 | `0` | 倾斜角度（度） | `45` (0-80) |
| `rotation` | `Number` | 否 | `0` | 旋转角度（度） | `90` (0-360) |
| `viewMode` | `String` | 否 | `'3D'` | 视图模式 | `'2D'` \| `'3D'` |
| `styleType` | `String` | 否 | `'black'` | 地图样式类型 | `'black'` \| `'white'` \| `'satellite'` |

### 参数详细说明

#### engine - 地图引擎

指定使用的地图服务提供商。

```javascript
// 腾讯地图
engine: 'tencent'

// 四维图新
engine: 'minemap'

// MapboxGL
engine: 'mapbox'
```

**支持的引擎：**
- `tencent` - 腾讯地图
- `minemap` - 四维图新
- `mapbox` - MapboxGL

#### center - 中心点坐标

地图初始化时显示的中心位置，格式为 `[经度, 纬度]`。

```javascript
// 北京天安门
center: [116.397128, 39.916527]

// 上海外滩
center: [121.499763, 31.239895]

// 广州塔
center: [113.331656, 23.109361]
```

**坐标范围：**
- 经度：`-180` 到 `180`
- 纬度：`-90` 到 `90`

#### zoom - 缩放级别

控制地图的显示比例，数值越大显示越详细。

```javascript
zoom: 12  // 城市级别
zoom: 15  // 街道级别
zoom: 18  // 建筑级别
```

**级别说明：**
- `3-5` - 国家/省份级别
- `6-9` - 省份/城市级别
- `10-13` - 城市/区县级别
- `14-17` - 街道/小区级别
- `18-20` - 建筑/道路级别

#### pitch - 倾斜角度

控制地图的3D倾斜效果（单位：度）。

```javascript
pitch: 0   // 俯视（2D视图）
pitch: 45  // 倾斜45度
pitch: 60  // 倾斜60度
```

**范围：** 0 到 80 度（不同引擎略有差异）

#### rotation / bearing - 旋转角度

控制地图的旋转方向（单位：度）。

```javascript
rotation: 0    // 正北朝上
rotation: 90   // 顺时针旋转90度
rotation: 180  // 正南朝上
```

**范围：** 0 到 360 度

#### viewMode - 视图模式

控制地图的显示模式。

```javascript
viewMode: '2D'  // 平面视图（俯视）
viewMode: '3D'  // 三维视图（可倾斜）
```

#### styleType - 样式类型

控制地图的整体视觉风格。

```javascript
styleType: 'black'     // 暗色主题
styleType: 'white'     // 亮色主题
styleType: 'satellite' // 卫星图
```

### 完整配置示例

```javascript
const map = new HTMap('map', {
  // 地图引擎
  engine: 'tencent',
  
  // 视图配置
  center: [116.397128, 39.916527],  // 北京天安门
  zoom: 12,                          // 城市级别
  pitch: 45,                         // 倾斜45度
  rotation: 0,                       // 正北朝上
  
  // 缩放限制
  minZoom: 3,                        // 最小缩放到3级
  maxZoom: 20,                       // 最大缩放到20级
  
  // 显示模式
  viewMode: '3D',                    // 3D模式
  styleType: 'black'                 // 暗色主题
})
```

## 引擎特定配置

不同的地图引擎有各自独特的配置选项。

### 腾讯地图配置

腾讯地图支持通过 `tencentConfig` 传递特定配置。

```javascript
const map = new HTMap('map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12,
  
  // 腾讯地图特定配置
  tencentConfig: {
    key: 'YOUR_TENCENT_MAP_KEY',     // API密钥（必填）
    style: 'normal',                  // 地图样式
    showControl: true,                // 显示控件
    draggable: true,                  // 可拖拽
    scrollWheel: true,                // 滚轮缩放
    doubleClickZoom: true,            // 双击缩放
    keyboard: true,                   // 键盘操作
    touchZoom: true,                  // 触摸缩放
    inertia: true,                    // 惯性拖拽
    showScale: true,                  // 显示比例尺
    showZoom: true,                   // 显示缩放控件
    showScaleControl: true,           // 显示比例尺控件
    showFullscreenControl: true,      // 显示全屏控件
    showLocationControl: true,        // 显示定位控件
    showCompassControl: true,         // 显示指南针控件
    show3DControl: true               // 显示3D控件
  }
})
```

**腾讯地图样式选项：**
- `'normal'` - 默认样式
- `'satellite'` - 卫星图
- `'hybrid'` - 混合图（卫星图+路网）

**缩放范围：**
- `minZoom`: 3
- `maxZoom`: 22
- `pitchRange`: [0, 80]

### 四维图新配置

四维图新支持通过 `minemapConfig` 传递特定配置。

```javascript
const map = new HTMap('map', {
  engine: 'minemap',
  center: [116.397128, 39.916527],
  zoom: 12,
  
  // 四维图新特定配置
  minemapConfig: {
    key: 'YOUR_MINEMAP_KEY',         // API密钥（必填）
    solution: 'YOUR_SOLUTION_ID',    // 解决方案ID
    style: 'default',                // 地图样式
    showControl: true,               // 显示控件
    mapType: 'vector',               // 地图类型
    draggable: true,                 // 可拖拽
    scrollWheel: true                // 滚轮缩放
  }
})
```

**四维图新样式选项：**
- `'default'` / `'black'` - 默认黑色样式
- `'white'` - 白色样式
- `'blue'` - 蓝色样式
- `'green'` - 绿色样式
- `'red'` - 红色样式
- `'satellite'` - 卫星图
- `'hybrid'` - 混合图

**地图类型：**
- `'vector'` - 矢量地图
- `'satellite'` - 卫星地图
- `'terrain'` - 地形地图

**缩放范围：**
- `minZoom`: 3
- `maxZoom`: 20
- `pitchRange`: [0, 60]

### MapboxGL 配置

MapboxGL 支持通过 `mapboxConfig` 传递特定配置。

```javascript
const map = new HTMap('map', {
  engine: 'mapbox',
  center: [116.397128, 39.916527],
  zoom: 12,
  
  // MapboxGL 特定配置
  mapboxConfig: {
    accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',  // 访问令牌（必填）
    style: 'mapbox://styles/mapbox/streets-v11',  // 地图样式URL
    dragPan: true,                            // 可拖拽
    scrollZoom: true,                         // 滚轮缩放
    doubleClickZoom: true,                    // 双击缩放
    keyboard: true,                           // 键盘操作
    touchZoomRotate: true,                    // 触摸缩放旋转
    trackResize: true,                        // 自动调整大小
    preserveDrawingBuffer: false,             // 保留绘制缓冲区
    attributionControl: true,                 // 显示版权信息
    logoPosition: 'bottom-left'               // Logo位置
  }
})
```

**MapboxGL 内置样式：**
- `'mapbox://styles/mapbox/streets-v11'` - 街道样式
- `'mapbox://styles/mapbox/outdoors-v11'` - 户外样式
- `'mapbox://styles/mapbox/light-v10'` - 浅色样式
- `'mapbox://styles/mapbox/dark-v10'` - 深色样式
- `'mapbox://styles/mapbox/satellite-v9'` - 卫星图
- `'mapbox://styles/mapbox/satellite-streets-v11'` - 卫星街道混合
- `'mapbox://styles/mapbox/navigation-day-v1'` - 导航日间
- `'mapbox://styles/mapbox/navigation-night-v1'` - 导航夜间

**缩放范围：**
- `minZoom`: 0
- `maxZoom`: 22
- `pitchRange`: [0, 85]

## SDK 配置管理

HTMap 会自动加载所需的地图引擎 SDK，您需要在配置文件中设置 SDK 资源地址和密钥。

### SDK 配置文件

**文件位置：** `src/utils/HTMap/config/sdkConfig.js`

```javascript
export const sdkConfig = {
  // 腾讯地图 SDK 配置
  tencent: {
    js: 'https://map.qq.com/api/gljs?v=1.exp&key=YOUR_KEY',
    css: 'https://map.qq.com/api/gljs?v=1.exp',
    key: 'YOUR_TENCENT_MAP_KEY',
    version: '1.exp',
    globalVariable: 'TMap'  // 全局变量名
  },
  
  // 四维图新 SDK 配置
  minemap: {
    js: 'https://minedata.cn/minemapapi/v2.0.0/minemap.js',
    css: 'https://minedata.cn/minemapapi/v2.0.0/minemap.css',
    key: 'YOUR_MINEMAP_KEY',
    solution: 'YOUR_SOLUTION_ID',
    version: '2.0.0',
    globalVariable: 'minemap'
  },
  
  // MapboxGL SDK 配置
  mapbox: {
    js: 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js',
    css: 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css',
    accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
    version: 'v2.15.0',
    globalVariable: 'mapboxgl'
  }
}
```

### 配置密钥

#### 1. 腾讯地图密钥

**获取步骤：**
1. 访问 [腾讯位置服务控制台](https://lbs.qq.com/console/mykey.html)
2. 登录并创建应用
3. 申请 WebServiceAPI 密钥
4. 将密钥填入配置文件

```javascript
tencentConfig: {
  key: 'YOUR_TENCENT_MAP_KEY'  // 替换为您的密钥
}
```

#### 2. 四维图新密钥

**获取步骤：**
1. 访问 [四维图新开发者平台](https://www.minemap.com/)
2. 注册并创建应用
3. 获取 Key 和 Solution ID
4. 将密钥填入配置文件

```javascript
minemapConfig: {
  key: 'YOUR_MINEMAP_KEY',
  solution: 'YOUR_SOLUTION_ID'
}
```

#### 3. MapboxGL 访问令牌

**获取步骤：**
1. 访问 [Mapbox 官网](https://www.mapbox.com/)
2. 注册账号并登录
3. 在 Account 页面获取 Access Token
4. 将令牌填入配置文件

```javascript
mapboxConfig: {
  accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN'
}
```

### SDK 加载检查

HTMap 会自动检查 SDK 是否已加载，如果未加载会自动加载。

```javascript
import { isSDKLoaded, loadEngineSDK } from '@/utils/HTMap/config/sdkConfig.js'

// 检查 SDK 是否已加载
if (!isSDKLoaded('tencent')) {
  console.log('SDK 未加载，正在加载...')
  await loadEngineSDK('tencent')
}
```

## 初始化最佳实践

### 1. 错误处理

```javascript
try {
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 12
  })
  
  await map.init()
  
  console.log('地图初始化成功')
} catch (error) {
  if (error.message.includes('容器不存在')) {
    console.error('地图容器DOM元素不存在')
  } else if (error.message.includes('SDK')) {
    console.error('地图SDK加载失败，请检查网络连接和API密钥')
  } else {
    console.error('地图初始化失败:', error.message)
  }
  
  // 显示用户友好的错误提示
  alert('地图加载失败，请刷新页面重试')
}
```

### 2. 等待 DOM 就绪

```javascript
import { onMounted } from 'vue'

onMounted(async () => {
  // 确保 DOM 元素已渲染
  await nextTick()
  
  // 创建地图
  const map = new HTMap('map', {
    engine: 'tencent',
    center: [116.397128, 39.916527],
    zoom: 12
  })
  
  await map.init()
})
```

### 3. 响应式容器

```vue
<template>
  <div class="map-wrapper">
    <div id="map" ref="mapContainer"></div>
  </div>
</template>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
  min-height: 400px;  /* 设置最小高度 */
}
</style>
```

### 4. 性能优化

```javascript
// 延迟加载非关键配置
const map = new HTMap('map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12
  // 先使用默认配置，快速初始化
})

await map.init()

// 地图就绪后再设置高级配置
map.setPitch(45)
map.setViewMode('3D')
```

### 5. 多地图实例管理

```javascript
const maps = {
  main: null,
  mini: null
}

// 创建主地图
maps.main = new HTMap('main-map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 12
})
await maps.main.init()

// 创建小地图
maps.mini = new HTMap('mini-map', {
  engine: 'tencent',
  center: [116.397128, 39.916527],
  zoom: 8
})
await maps.mini.init()

// 统一销毁
const destroyAllMaps = () => {
  Object.values(maps).forEach(map => {
    if (map) map.destroy()
  })
}
```

## 常见问题

### Q1: 地图容器不存在错误？

**原因：** DOM 元素还未渲染完成就尝试创建地图。

**解决：** 在 `onMounted` 生命周期中创建地图。

```javascript
onMounted(async () => {
  const map = new HTMap('map', { ... })
  await map.init()
})
```

### Q2: SDK 加载失败？

**原因：** 网络问题或 API 密钥配置错误。

**解决：**
1. 检查网络连接
2. 检查 `sdkConfig.js` 中的密钥配置
3. 检查密钥是否有效且有足够的配额

### Q3: 地图显示不完整？

**原因：** 容器高度未设置或为 0。

**解决：** 为地图容器设置明确的高度。

```css
#map {
  width: 100%;
  height: 600px;  /* 明确设置高度 */
}
```

### Q4: 如何动态切换地图引擎？

**方法：** 销毁当前地图，重新创建新引擎的地图。

```javascript
// 销毁当前地图
if (mapInstance.value) {
  mapInstance.value.destroy()
}

// 创建新引擎的地图
mapInstance.value = new HTMap('map', {
  engine: 'minemap',  // 切换到四维图新
  center: [116.397128, 39.916527],
  zoom: 12
})

await mapInstance.value.init()
```

### Q5: 地图初始化很慢？

**原因：** SDK 资源加载慢或文件过大。

**优化方案：**
1. 使用 CDN 加速
2. 本地缓存 SDK 文件
3. 预加载 SDK 资源
4. 使用懒加载策略

---

**下一步：**
- [地图基础操作 →](./map-operations.md)
- [标记点功能 →](./markers.md)
- [API 参考 →](./api-reference.md)

