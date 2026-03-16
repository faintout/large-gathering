# HTMap 配置说明

## 配置文件结构

HTMap使用分层配置管理，确保配置的清晰性和可维护性。

### 1. defaultConfig.js - 默认配置
- 包含地图的通用配置选项
- 不包含特定地图引擎的敏感信息（如API密钥、访问令牌等）
- 提供基础的地图参数设置

### 2. sdkConfig.js - SDK配置
- 包含各地图引擎SDK的加载地址和版本信息
- 包含敏感配置信息（如API密钥、访问令牌等）
- 支持不同环境的配置切换

### 3. engineConfig.js - 引擎扩展配置
- 包含地图引擎的状态、文档链接等扩展信息
- 管理引擎的启用/禁用状态

## MapboxGL 配置说明

### AccessToken 配置位置
MapboxGL的accessToken现在统一配置在 `sdkConfig.js` 中：

```javascript
// src/utils/HTMap/config/sdkConfig.js
export const mapboxSDKConfig = {
  js: 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js',
  css: 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css',
  version: '2.15.0',
  required: ['mapboxgl'],
  maxZoom: 24,
  features: ['矢量地图', '自定义样式', '3D建筑', '热力图', '聚合'],
  // Mapbox访问令牌 - 在这里配置
  accessToken: 'your-mapbox-access-token'
}
```

### 使用方式
创建MapboxGL地图时，无需传入accessToken：

```javascript
import HTMap from '@/utils/HTMap'

const map = new HTMap('map-container', {
  engine: 'mapbox',
  center: [114.884094, 40.8119],
  zoom: 15
  // accessToken会自动从sdkConfig中获取
})
```

### 配置优先级
1. **优先使用** `sdkConfig.js` 中的 `accessToken`
2. **备用方案** 如果sdkConfig中没有配置，则使用传入的 `mapboxToken` 参数
3. **错误提示** 如果都没有配置，会抛出明确的错误信息

## 环境配置建议

### 开发环境
```javascript
// 在sdkConfig.js中直接配置
accessToken: 'your-development-token'
```

### 生产环境
```javascript
// 使用环境变量
accessToken: process.env.MAPBOX_ACCESS_TOKEN || 'your-production-token'
```

### 多环境配置
```javascript
// 根据环境动态配置
const getAccessToken = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return 'dev-token'
    case 'staging':
      return 'staging-token'
    case 'production':
      return 'prod-token'
    default:
      return 'default-token'
  }
}

export const mapboxSDKConfig = {
  // ... 其他配置
  accessToken: getAccessToken()
}
```

## 安全注意事项

1. **不要** 将真实的accessToken提交到版本控制系统
2. **使用** 环境变量或配置文件来管理敏感信息
3. **定期** 轮换accessToken以确保安全性
4. **限制** accessToken的权限范围，只授予必要的权限

## 迁移指南

### 从旧版本迁移
如果你之前使用 `mapboxToken` 参数：

```javascript
// 旧方式
const map = new HTMap('container', {
  engine: 'mapbox',
  mapboxToken: 'your-token'  // 移除这行
})

// 新方式
const map = new HTMap('container', {
  engine: 'mapbox'
  // accessToken会自动从sdkConfig获取
})
```

### 配置迁移步骤
1. 将accessToken从代码中移除
2. 在 `sdkConfig.js` 中配置accessToken
3. 测试地图功能是否正常
4. 清理不再使用的配置代码 