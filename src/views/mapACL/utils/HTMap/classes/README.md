# HTMap 类库

这个目录包含了HTMap框架中各种地图元素的类定义，采用模块化设计，便于维护和扩展。

## 目录结构

```
classes/
├── index.js          # 统一导出文件
├── Markers.js        # 标记点管理类
├── README.md         # 本说明文件
└── (未来扩展)
    ├── Lines.js      # 线条管理类
    ├── Polygons.js   # 多边形管理类
    ├── DrawTools.js  # 绘制工具类
    └── Clusters.js   # 聚合管理类
```

## 已实现的类

### Markers 类
用于管理一组标记点，提供批量操作、样式设置、事件绑定等功能。

**主要功能：**
- 批量添加/移除标记点
- 统一设置样式（颜色、大小、图标等）
- 事件监听器管理
- 标记点查找和更新
- 位置信息获取
- 数据校验和自动补全
- 样式循环应用（当样式数量少于几何数据时）

**使用示例：**
```javascript
import { Markers } from '@/utils/HTMap/classes'
import defaultPinIcon from '@/utils/HTMap/assets/img/defaultPin.png'

// 创建标记点组（使用新的geometries和styles参数）
const markersGroup = new Markers({
  id: 'my_markers',
  map: mapInstance,
  geometries: [
    {
      id: 'point1',
      properties: { name: '标记点1' },
      lngLat: [114.884094, 40.8119]
    },
    {
      id: 'point2',
      properties: { name: '标记点2' },
      lngLat: [114.885094, 40.8129]
    }
  ],
  styles: [
    { 
      id: 'style1',
      src: defaultPinIcon,
      width: 32,
      height: 32,
      offset: [16, 32],
      color: '#FF0000'
    },
    { 
      id: 'style2',
      src: defaultPinIcon,
      width: 24,
      height: 24,
      offset: [12, 24],
      color: '#00FF00'
    }
  ]
})

// 也可以不传styles，系统会自动补全默认样式
const simpleMarkersGroup = new Markers({
  map: mapInstance,
  geometries: [
    {
      id: 'point3',
      properties: { name: '标记点3' },
      lngLat: [114.886094, 40.8139]
    }
  ]
  // styles 不传，系统会自动使用默认样式
})
```

// 批量操作
markersGroup.setColor('#FF00FF')
markersGroup.setSize(32)
markersGroup.setVisible(false)

// 添加新标记点
markersGroup.addMarker(
  {
    id: 'point3',
    properties: { name: '新标记点' },
    lngLat: [114.886094, 40.8139]
  },
  { color: '#0000FF', size: 28 }
)

// 使用options方式添加标记点
markersGroup.addMarkerWithOptions({
  geometry: {
    id: 'point4',
    properties: { name: '选项标记点' },
    lngLat: [114.887094, 40.8149]
  },
  style: { color: '#FFFF00', size: 32 }
})
```

## 扩展指南

### 添加新的类

1. 在 `classes/` 目录下创建新的类文件（如 `Lines.js`）
2. 在 `index.js` 中添加导出语句
3. 在 `HTMap/index.js` 中导入并添加到 `HTMap` 对象上

**示例：**
```javascript
// classes/Lines.js
export default class Lines {
  constructor(options = {}) {
    this.map = options.map
    this.geometries = options.geometries || []
    this.styles = options.styles || []
    this.id = options.id || `lines_group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // 实现线条管理逻辑
  }
}

// classes/index.js
export { default as Lines } from './Lines.js'

// HTMap/index.js
import { Markers, Lines } from './classes/index.js'
HTMap.Markers = Markers
HTMap.Lines = Lines
```

### 类设计原则

1. **单一职责**：每个类只负责一种地图元素
2. **统一接口**：保持相似的方法命名和参数结构
3. **事件支持**：提供统一的事件绑定机制
4. **批量操作**：支持对整组元素进行统一操作
5. **ID管理**：自动生成唯一标识符

## 注意事项

- 所有类都需要接收 `map` 实例作为第一个参数
- 类名使用复数形式（如 `Markers`、`Lines`）
- 使用 `geometries` 和 `styles` 参数来管理几何数据和样式
- 几何数据应包含 `id`、`properties` 和 `lngLat` 属性
- 样式数据应包含地图元素的可视化属性（如 `color`、`size` 等）
- 保持与现有HTMap API的兼容性
- 添加新功能时考虑向后兼容性

## 数据校验和补全

### 几何数据校验
- 自动验证 `lngLat` 数组格式和数值有效性
- 自动生成缺失的 `id` 属性
- 过滤无效的几何数据

### 样式数据补全
- 当 `styles` 为空或无效时，自动使用默认样式
- 默认样式包含：`color: '#00FF00'`, `size: 24`, `draggable: false` 等
- 样式数组会循环应用到几何数据（当样式数量少于几何数据时）

### 错误处理
- 构造函数会抛出错误如果缺少必需的 `map` 参数
- 无效数据会通过 `console.warn` 输出警告信息
- 无效的几何数据会被自动过滤掉
