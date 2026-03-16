/**
 * 地图引擎扩展配置文件
 * 管理地图引擎的状态、文档链接等扩展信息
 */

// 地图引擎扩展信息配置
export const engineExtConfig = {
  tencent: {
    id: 'tencent',
    name: '腾讯地图',
    supported: true,
    status: 'active', // active, inactive, deprecated
    website: 'https://lbs.qq.com/',
    docs: 'https://lbs.qq.com/webApi/javascriptGL/glGuide/glBasic'
  },
  minemap: {
    id: 'minemap',
    name: '四维图新',
    supported: true,
    status: 'active',
    website: 'https://www.minemap.com/',
    docs: 'https://www.minemap.com/docs/'
  },
  mapbox: {
    id: 'mapbox',
    name: 'MapboxGL',
    supported: true,
    status: 'active',
    website: 'https://www.mapbox.com/',
    docs: 'https://docs.mapbox.com/mapbox-gl-js/'
  },
  amap: {
    id: 'amap',
    name: '高德地图',
    supported: false,
    status: 'planned', // 计划支持
    website: 'https://lbs.amap.com/',
    docs: 'https://lbs.amap.com/api/javascript-api/summary'
  },
  baidu: {
    id: 'baidu',
    name: '百度地图',
    supported: false,
    status: 'planned',
    website: 'https://lbsyun.baidu.com/',
    docs: 'https://lbsyun.baidu.com/index.php?title=jspopular3.0'
  }
}

// 地图引擎状态枚举
export const EngineStatus = {
  ACTIVE: 'active',      // 活跃状态：当前已支持并可正常使用
  INACTIVE: 'inactive',  // 非活跃状态：暂时不可用，但可能在未来恢复
  PLANNED: 'planned',    // 计划中：正在开发或计划支持，暂不可用
  DEPRECATED: 'deprecated' // 已废弃：不再维护，建议迁移到其他引擎
}

// 地图引擎类型枚举
export const EngineType = {
  TENCENT: 'tencent',
  MINEMAP: 'minemap',
  MAPBOX: 'mapbox',
  AMAP: 'amap',
  BAIDU: 'baidu'
}

// 获取引擎扩展配置
export const getEngineExtConfig = (engineId) => {
  return engineExtConfig[engineId] || null
}

// 获取所有引擎扩展配置
export const getAllEngineExtConfig = () => {
  return engineExtConfig
}

// 检查引擎是否支持
export const isEngineSupported = (engineId) => {
  const extConfig = engineExtConfig[engineId]
  return extConfig && extConfig.status === 'active'
}

// 获取活跃的地图引擎列表
export const getActiveEngines = () => {
  return Object.values(engineExtConfig).filter(engine => 
    engine.supported && engine.status === 'active'
  )
}

export default {
  engineExtConfig,
  EngineStatus,
  EngineType,
  getEngineExtConfig,
  getAllEngineExtConfig,
  isEngineSupported,
  getActiveEngines
} 