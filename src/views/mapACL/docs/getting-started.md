# 快速开始

欢迎使用 HTMap 地图防腐层！本文档将帮助您快速上手 HTMap，创建您的第一个地图应用。

## 什么是 HTMap？

HTMap 是一个统一的地图操作接口层，它为多种地图引擎提供了一致的 API 接口。通过 HTMap，您可以：

- 🔄 **统一接口** - 使用相同的代码操作不同的地图引擎
- 🚀 **快速切换** - 轻松在腾讯地图、四维图新、MapboxGL 之间切换
- 🛡️ **防腐设计** - 隔离底层地图引擎的变化，保护业务代码
- 📦 **功能完整** - 支持标记点、线条、多边形、聚合、弹窗等常用功能
- 🎯 **开箱即用** - 简单配置即可开始使用

## 核心特性

### 多引擎支持
- ✅ 腾讯地图 (TMap)
- ✅ 四维图新 (MineMap)  
- ✅ MapboxGL

### 丰富的功能
- 📍 **标记点管理** (Markers) - 批量标记点、拖拽功能、缩放级别控制
- 🎯 **DOM标记点** (Marker) - 单个自定义DOM标记点、完全自定义样式
- 📏 **线条绘制** (Lines) - 实线、虚线、发光线条、方向箭头、曲线
- 🎯 **点位聚合** (Clusters) - 智能聚合、自定义样式、点击展开
- ⬡ **多边形绘制** (Polygons) - 填充色、边框、虚线边框、凸多边形
- 💬 **信息弹窗** (Popup) - 自定义内容、位置控制、事件处理
- 🗺️ **路线规划** - 起终点规划、路线样式

### 强大的事件系统
- 统一的事件绑定和解绑
- 事件统一性检查
- 完整的事件回调参数

## 安装说明

### 1. 项目中引入

HTMap 作为项目工具类使用，位于项目的 `src/utils/HTMap/` 目录下。

```
src/
└── utils/
    └── HTMap/
        ├── index.js              # HTMap主入口
        ├── core/                 # 核心功能
        ├── adapters/             # 地图引擎适配器
        ├── classes/              # 功能类
        ├── config/               # 配置文件
        └── docs/                 # 文档
```

### 2. 在 Vue 组件中引入

```javascript
import HTMap from '@/utils/HTMap/index.js'
```

### 3. 配置地图引擎 SDK

在使用前需要配置相应的地图引擎 SDK。HTMap 会自动加载所需的 SDK 资源。

**配置文件位置：** `src/utils/HTMap/config/sdkConfig.js`

```javascript
// 示例：腾讯地图配置
export const sdkConfig = {
  tencent: {
    js: 'https://map.qq.com/api/gljs?v=1.exp&key=YOUR_KEY',
    css: 'https://map.qq.com/api/gljs?v=1.exp',
    key: 'YOUR_TENCENT_MAP_KEY',
    version: '1.exp'
  }
  // ... 其他引擎配置
}
```

## 第一个地图应用

让我们创建一个简单的地图应用，展示 HTMap 的基本用法。

### 完整示例代码

```vue
<template>
  <div class="map-container">
    <!-- 地图容器 -->
    <div id="map" style="width: 100%; height: 600px;"></div>
    
    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="addMarker">添加标记点</button>
      <button @click="addLine">添加线条</button>
      <button @click="addPolygon">添加多边形</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import HTMap from '@/utils/HTMap/index.js'

// 地图实例
const mapInstance = ref(null)

// 初始化地图
onMounted(async () => {
  try {
    // 创建地图实例
    const map = new HTMap('map', {
      engine: 'tencent',              // 使用腾讯地图引擎
      center: [116.397128, 39.916527], // 中心点：北京天安门
      zoom: 12,                        // 缩放级别
      pitch: 0,                        // 倾斜角度
      bearing: 0                       // 旋转角度
    })
    
    // 等待地图初始化完成
    await map.init()
    
    // 保存地图实例
    mapInstance.value = map
    
    console.log('地图初始化成功！')
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
})

// 添加标记点
const addMarker = () => {
  if (!mapInstance.value) return
  
  const markers = new HTMap.Markers({
    map: mapInstance.value,
    id: 'my_markers',
    geometries: [
      {
        id: 'marker_1',
        lngLat: [116.397128, 39.916527], // 天安门
        properties: {
          name: '天安门',
          type: 'landmark'
        },
        styleId: 'default_style'
      }
    ],
    styles: [
      {
        id: 'default_style',
        src: '/pin.png',                 // 标记点图标
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
    console.log('点击了标记点:', e.properties)
    alert(`点击了: ${e.properties.name}`)
  })
}

// 添加线条
const addLine = () => {
  if (!mapInstance.value) return
  
  const lines = new HTMap.Lines({
    map: mapInstance.value,
    id: 'my_lines',
    geometries: [
      {
        id: 'line_1',
        paths: [
          [116.397128, 39.916527],  // 起点
          [116.420000, 39.920000],  // 中间点
          [116.450000, 39.930000]   // 终点
        ],
        properties: {
          name: '示例路线'
        },
        styleId: 'line_style'
      }
    ],
    styles: [
      {
        id: 'line_style',
        color: '#FF0000',              // 红色
        width: 5,                      // 线宽5像素
        borderColor: '#000000',
        borderWidth: 1,
        lineCap: 'round',
        dashArray: [0, 0],             // 实线
        emitLight: false,
        dirArrows: true,               // 显示方向箭头
        dirAnimate: null,
        isCurve: false
      }
    ]
  })
  
  // 获取线条总长度
  const totalLength = lines.getTotalLength()
  console.log('线条总长度:', totalLength, '米')
}

// 添加多边形
const addPolygon = () => {
  if (!mapInstance.value) return
  
  const polygons = new HTMap.Polygons({
    map: mapInstance.value,
    id: 'my_polygons',
    geometries: [
      {
        id: 'polygon_1',
        paths: [
          [116.397128, 39.916527],
          [116.420000, 39.916527],
          [116.420000, 39.930000],
          [116.397128, 39.930000],
          [116.397128, 39.916527]  // 闭合多边形
        ],
        properties: {
          name: '示例区域'
        },
        styleId: 'polygon_style'
      }
    ],
    styles: [
      {
        id: 'polygon_style',
        color: 'rgba(75, 152, 250, 0.3)',      // 半透明蓝色填充
        borderColor: 'rgba(75, 152, 250, 1)',   // 蓝色边框
        borderWidth: 2,
        borderDashArray: null,                  // 实线边框
        isConvex: false
      }
    ]
  })
  
  // 绑定点击事件
  polygons.on('click', (e) => {
    console.log('点击了多边形:', e.properties)
  })
}
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1000;
}

.controls button {
  padding: 10px 20px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.controls button:hover {
  background: #66b1ff;
}
</style>
```

### 代码说明

#### 1. 创建地图实例

```javascript
const map = new HTMap('map', {
  engine: 'tencent',              // 地图引擎类型
  center: [116.397128, 39.916527], // 中心点 [经度, 纬度]
  zoom: 12                         // 缩放级别
})

await map.init()  // 等待地图初始化完成
```

**参数说明：**
- `'map'` - 地图容器的 DOM ID
- `engine` - 地图引擎：`'tencent'` | `'minemap'` | `'mapbox'`
- `center` - 中心点坐标 `[经度, 纬度]`，范围：经度 [-180, 180]，纬度 [-90, 90]
- `zoom` - 缩放级别，范围通常为 3-20

#### 2. 添加标记点

```javascript
const markers = new HTMap.Markers({
  map: mapInstance.value,          // 地图实例
  id: 'my_markers',                // 标记点组ID
  geometries: [...],               // 几何数据
  styles: [...]                    // 样式配置
})
```

#### 3. 绑定事件

```javascript
markers.on('click', (e) => {
  console.log('点击事件:', e)
})
```

支持的事件包括：`click`、`dblclick`、`mouseenter`、`mouseleave` 等。

## 下一步

恭喜！您已经完成了第一个 HTMap 地图应用。接下来您可以：

1. 📖 [核心概念](./core-concepts.md) - 深入了解 HTMap 的架构设计
2. ⚙️ [地图初始化与配置](./initialization.md) - 学习详细的配置选项
3. 🗺️ [地图基础操作](./map-operations.md) - 掌握地图操作方法
4. 📍 [标记点功能](./markers.md) - 深入学习标记点功能
5. 📏 [线条功能](./lines.md) - 学习线条绘制
6. 🎯 [聚合功能](./clusters.md) - 了解点位聚合
7. ⬡ [多边形功能](./polygons.md) - 掌握多边形绘制
8. 💬 [弹窗功能](./popup.md) - 学习信息弹窗

## 常见问题

### Q: 如何切换地图引擎？

只需要修改 `engine` 参数即可：

```javascript
// 使用腾讯地图
const map = new HTMap('map', { engine: 'tencent', ... })

// 使用四维图新
const map = new HTMap('map', { engine: 'minemap', ... })

// 使用 MapboxGL
const map = new HTMap('map', { engine: 'mapbox', ... })
```

### Q: 地图初始化失败怎么办？

1. 检查地图容器是否存在
2. 检查 SDK 配置是否正确
3. 检查 API Key 是否有效
4. 查看浏览器控制台的错误信息

### Q: 如何获取地图当前状态？

```javascript
const center = map.getCenter()    // 获取中心点
const zoom = map.getZoom()        // 获取缩放级别
const pitch = map.getPitch()      // 获取倾斜角度
const bearing = map.getBearing()  // 获取旋转角度
```

### Q: 支持哪些浏览器？

HTMap 支持所有现代浏览器：
- Chrome (推荐)
- Firefox
- Safari
- Edge

## 技术支持

如果您在使用过程中遇到问题，可以：

1. 查看 [完整 API 文档](./api-reference.md)
2. 查看 [最佳实践](./best-practices.md)
3. 联系开发团队获取支持

---

**下一步：** [核心概念 →](./core-concepts.md)

