# HTMap API 参考文档

本文档详细说明了HTMap地图防腐层的所有API接口，包括参数、返回值和用法说明。

## 核心类

### HTMap

HTMap是地图防腐层的主类，提供统一的地图操作接口。

#### 构造函数

```javascript
new HTMap(containerId, options)
```

**参数:**
- `containerId` (string|HTMLElement): 地图容器的ID字符串或DOM元素
- `options` (object): 地图配置选项

**配置选项:**
```javascript
{
  engine: 'mapbox',            // 地图引擎类型
  center: [lng, lat],          // 地图中心点坐标
  zoom: 15,                    // 地图缩放级别
  pitch: 0,                    // 地图倾斜角度 (0-60度)
  bearing: 0,                  // 地图旋转角度 (0-360度)
  style: 'mapbox://styles/...', // 地图样式
  mapboxConfig: {},            // Mapbox特定配置（可选）
  minemapConfig: {},           // 四维地图特定配置
  tencentConfig: {}            // 腾讯地图特定配置
}
```

**注意:** MapboxGL的accessToken已在 `src/utils/HTMap/config/sdkConfig.js` 中配置，无需在创建地图时传入。如需修改，请直接编辑该配置文件。

## 地图控制方法

### 视角控制

#### setView(center, zoom)
设置地图中心点和缩放级别

**参数:**
- `center` (Array): 中心点坐标 [lng, lat]
- `zoom` (number): 缩放级别

**返回值:** 无

**示例:**
```javascript
map.setView([118.177726746, 39.630245209], 15)
```

#### setPitch(pitch, options)
设置地图倾斜角度

**参数:**
- `pitch` (number): 倾斜角度 (0-60度)
- `options` (object): 动画选项

**返回值:** 无

**示例:**
```javascript
map.setPitch(45, { duration: 1000 })
```

#### setBearing(bearing, options)
设置地图旋转角度

**参数:**
- `bearing` (number): 旋转角度 (0-360度)
- `options` (object): 动画选项

**返回值:** 无

**示例:**
```javascript
map.setBearing(90, { duration: 1000 })
```

#### setViewport(center, zoom, options)
设置地图完整视角

**参数:**
- `center` (Array): 中心点坐标 [lng, lat]
- `zoom` (number): 缩放级别
- `options` (object): 视角选项 {pitch, bearing}

**返回值:** 无

**示例:**
```javascript
map.setViewport([118.177726746, 39.630245209], 15, {
  pitch: 30,
  bearing: 45
})
```

### 获取方法

#### getCenter()
获取地图中心点

**返回值:** Array - 中心点坐标 [lng, lat]

**示例:**
```javascript
const center = map.getCenter()
console.log('地图中心:', center)
```

#### getZoom()
获取地图缩放级别

**返回值:** number - 缩放级别

**示例:**
```javascript
const zoom = map.getZoom()
console.log('当前缩放级别:', zoom)
```

#### getPitch()
获取地图倾斜角度

**返回值:** number - 倾斜角度

**示例:**
```javascript
const pitch = map.getPitch()
console.log('当前倾斜角度:', pitch)
```

#### getBearing()
获取地图旋转角度

**返回值:** number - 旋转角度

**示例:**
```javascript
const bearing = map.getBearing()
console.log('当前旋转角度:', bearing)
```

#### getViewport()
获取地图完整视角信息

**返回值:** object - 视角信息 {center, zoom, pitch, bearing}

**示例:**
```javascript
const viewport = map.getViewport()
console.log('当前视角:', viewport)
```

#### getMinZoom()
获取地图最小缩放级别

**返回值:** number - 最小缩放级别

**示例:**
```javascript
const minZoom = map.getMinZoom()
console.log('最小缩放级别:', minZoom)
```

#### getMaxZoom()
获取地图最大缩放级别

**返回值:** number - 最大缩放级别

**示例:**
```javascript
const maxZoom = map.getMaxZoom()
console.log('最大缩放级别:', maxZoom)
```

#### getMinPitch()
获取地图最小倾斜角度

**返回值:** number - 最小倾斜角度

**示例:**
```javascript
const minPitch = map.getMinPitch()
console.log('最小倾斜角度:', minPitch)
```

#### getMaxPitch()
获取地图最大倾斜角度

**返回值:** number - 最大倾斜角度

**示例:**
```javascript
const maxPitch = map.getMaxPitch()
console.log('最大倾斜角度:', maxPitch)
```

## 地图生命周期

### init()
初始化地图

**返回值:** Promise - 地图实例

**示例:**
```javascript
try {
  const mapInstance = await map.init()
  console.log('地图初始化成功:', mapInstance)
} catch (error) {
  console.error('地图初始化失败:', error)
}
```

### destroy()
销毁地图

**返回值:** 无

**示例:**
```javascript
map.destroy()
```

### onMapReady(callback)
地图就绪回调

**参数:**
- `callback` (Function): 地图就绪后的回调函数

**返回值:** 无

**示例:**
```javascript
map.onMapReady(() => {
  console.log('地图已就绪，可以开始操作')
})
```

## 视图模式控制

### setViewMode(mode)
设置视图模式

**参数:**
- `mode` (string): 视图模式，支持 '2D' 或 '3D'

**返回值:** 无

**示例:**
```javascript
map.setViewMode('3D')  // 切换到3D模式
map.setViewMode('2D')  // 切换到2D模式
```

### setStyleType(type)
设置样式类型

**参数:**
- `type` (string): 样式类型，支持 'black' 或 'white'

**返回值:** 无

**示例:**
```javascript
map.setStyleType('black')  // 切换到黑色主题
map.setStyleType('white')  // 切换到白色主题
```

## 错误处理

HTMap 提供了完善的错误处理机制，所有方法在参数验证失败或执行出错时都会抛出相应的错误信息。

### 常见错误类型

- **参数格式错误**: 当传入的参数格式不正确时
- **参数范围错误**: 当参数值超出有效范围时
- **地图未初始化**: 当在地图初始化完成前调用方法时
- **引擎不支持**: 当调用的方法在当前地图引擎中不支持时

### 错误处理示例

```javascript
try {
  map.setCenter([200, 100])  // 经度超出范围
} catch (error) {
  console.error('设置中心点失败:', error.message)
  // 输出: 设置中心点失败: 经度必须在 -180 到 180 之间
}
```

## 注意事项

1. **地图初始化**: 在使用地图功能前，必须先调用 `init()` 方法初始化地图
2. **参数验证**: 所有坐标参数都会自动验证格式和范围
3. **引擎差异**: 不同地图引擎对某些参数的支持可能有所不同
4. **异步操作**: 地图初始化是异步操作，需要使用 `await` 或 `.then()` 处理
5. **资源清理**: 在页面卸载前，建议调用 `destroy()` 方法清理地图资源

## 完整示例

```javascript
import HTMap from '@/utils/HTMap'

// 创建地图实例
const map = new HTMap('map-container', {
  engine: 'mapbox',
  center: [118.177726746, 39.630245209],
  zoom: 15,
  pitch: 0,
  bearing: 0
})

// 初始化地图
try {
  await map.init()
  
  // 地图就绪后执行操作
  map.onMapReady(() => {
    console.log('地图已就绪')
    
    // 设置地图视角
    map.setViewport([118.18, 39.64], 16, {
      pitch: 30,
      bearing: 45
    })
    
    // 获取地图状态
    const center = map.getCenter()
    const zoom = map.getZoom()
    console.log('当前中心点:', center, '缩放级别:', zoom)
  })
  
} catch (error) {
  console.error('地图初始化失败:', error)
}
``` 