import TencentMap from '../adapters/TencentMap/index.js'
import MineMap from '../adapters/MineMap/index.js'
import MapboxGL from '../adapters/MapboxGL.js'
import { isEngineSupported } from '../config/engineConfig.js'

/**
 * 地图工厂类
 * 负责根据配置创建不同地图引擎的实例
 */
class MapFactory {
  /**
   * 创建地图实例
   * @param {string} containerId - 地图容器的id
   * @param {string} engine - 地图引擎类型 ('tencent' | 'mapbox')
   * @param {object} options - 配置选项
   * @returns {BaseMap} 地图实例
   */
  static createMap(containerId, engine, options) {
    // 检查引擎是否支持
    if (!isEngineSupported(engine)) {
      throw new Error(`不支持的地图引擎: ${engine}`)
    }
    
    switch (engine.toLowerCase()) {
      case 'tencent':
        return new TencentMap(containerId, options)
      case 'minemap':
        return new MineMap(containerId, options)
      case 'mapbox':
        return new MapboxGL(containerId, options)
      default:
        throw new Error(`不支持的地图引擎: ${engine}`)
    }
  }

  /**
   * 获取支持的地图引擎列表
   * @returns {Array} 支持的引擎列表
   */
  static getSupportedEngines() {
    return ['tencent', 'minemap', 'mapbox']
  }

  /**
   * 检查引擎是否支持
   * @param {string} engine - 引擎名称
   * @returns {boolean} 是否支持
   */
  static isEngineSupported(engine) {
    return isEngineSupported(engine)
  }
}

export default MapFactory 