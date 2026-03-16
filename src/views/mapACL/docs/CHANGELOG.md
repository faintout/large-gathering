# HTMap 文档更新日志

## 2024-11-28 更新

### 新增功能文档

#### 1. DomMarker (单个DOM标记点) 功能
**文件：** `docs/markers.md`

- 新增 `DomMarker 单个DOM标记点` 章节
- 详细介绍了 `HTMap.Marker` 类的使用方法
- 包含完整的 API 说明、示例代码和样式定制指南
- 说明了与 `Markers` 类的区别和适用场景

#### 2. 地图限制值获取方法
**文件：** `docs/map-operations.md`

- `getMinZoom()` - 获取最小缩放级别
- `getMaxZoom()` - 获取最大缩放级别  
- `getMaxPitch()` - 获取最大倾斜角度
- 这些方法会根据当前地图引擎动态返回限制值

#### 3. 事件统一性检查
**文件：** `docs/events.md` 和 `docs/api-reference.md`

- `isUnifiedEvent()` - 检查事件是否为统一事件
- `HTMap.unifiedEvents` - 统一支持的事件列表（静态属性）
- 详细说明了如何使用这些功能来确保跨引擎兼容性

### API 参考文档更新

**文件：** `docs/api-reference.md`

#### 新增 API 方法

1. **地图操作方法**
   - `getMinZoom()` - 获取最小缩放级别
   - `getMaxZoom()` - 获取最大缩放级别
   - `getMaxPitch()` - 获取最大倾斜角度
   - `getSize()` - 获取容器尺寸
   - `setStyleType()` - 切换样式主题

2. **标记点方法**
   - `addDomMarker(options)` - 添加单个DOM标记点

3. **事件方法**
   - `isUnifiedEvent(eventType)` - 检查事件是否统一

#### 新增静态属性

- `HTMap.unifiedEvents` - 统一支持的事件列表
- `HTMap.Map` - 自动初始化的地图类
- `HTMap.Marker` - 单个DOM标记点类

#### 新增类文档

**Marker (DomMarker) 类**
- 构造函数参数说明
- 完整的方法列表：
  - `removeDomMarker()`
  - `setVisible()`
  - `getVisible()`
  - `setLngLat()`
  - `getLngLat()`
  - `updateMarkerDom()`
  - `on()` / `off()`

### 文档结构优化

#### 1. 首页更新
**文件：** `docs/index.md`

- 更新了功能特性描述，突出 DOM标记点功能

#### 2. 快速开始文档
**文件：** `docs/getting-started.md`

- 更新了功能列表，添加了 DOM标记点的说明
- 区分了批量标记点和单个DOM标记点的使用场景

### 文档内容完善

#### 1. 标记点文档
**文件：** `docs/markers.md`

新增内容：
- DomMarker 与 Markers 的对比表格
- 两种创建 DomMarker 的方式
- 完整的构造参数说明
- 所有方法的详细文档
- 实际使用示例
- CSS 样式定制指南
- 注意事项和最佳实践

#### 2. 地图操作文档
**文件：** `docs/map-operations.md`

新增内容：
- `getMinZoom()` 方法文档（包含不同引擎的返回值）
- `getMaxZoom()` 方法文档（包含不同引擎的返回值）
- `getMaxPitch()` 方法文档（包含不同引擎的返回值）
- 每个方法都包含了针对不同地图引擎的说明

### 代码示例更新

#### 1. 新增 DomMarker 示例

**基础示例：**
```javascript
const marker = new HTMap.Marker({
  map: map,
  lngLat: [116.397128, 39.916527],
  contentDom: '<div class="custom-marker">自定义标记</div>',
  draggable: true
})
```

**完整示例：**
- 自定义DOM元素创建
- HTML字符串创建
- 事件绑定
- 样式定制

#### 2. 新增事件统一性检查示例

```javascript
// 检查事件是否统一
console.log(map.isUnifiedEvent('click'))  // true

// 获取所有统一事件
console.log(HTMap.unifiedEvents)
```

### 文档一致性改进

1. **跨文档链接**：所有新增内容都添加了相关文档的链接
2. **术语统一**：统一使用 "DomMarker"、"单个DOM标记点" 等术语
3. **格式规范**：所有新增文档遵循现有的 Markdown 格式规范

### 下一步计划

1. 添加更多的示例代码和演示项目
2. 完善 TypeScript 类型定义文档
3. 添加性能优化指南
4. 补充常见问题解答 (FAQ)

---

## 更新影响

### 受影响的文档

- ✅ `docs/api-reference.md` - 主要更新
- ✅ `docs/map-operations.md` - 新增方法文档
- ✅ `docs/markers.md` - 新增 DomMarker 章节
- ✅ `docs/index.md` - 更新功能描述
- ✅ `docs/getting-started.md` - 更新功能列表

### 向后兼容性

所有更新都是新增内容，不影响现有 API 的使用，完全向后兼容。

### 建议

使用者应该：
1. 阅读新增的 DomMarker 文档，了解单个DOM标记点的使用方法
2. 了解 `getMinZoom()`、`getMaxZoom()`、`getMaxPitch()` 方法，更好地控制地图行为
3. 使用 `isUnifiedEvent()` 检查事件兼容性，避免跨引擎问题

---

**更新人员：** AI Assistant  
**更新日期：** 2024-11-28  
**版本：** v1.1.0

