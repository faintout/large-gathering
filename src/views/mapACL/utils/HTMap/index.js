import MapFactory from './core/MapFactory.js'
import {defaultConfig, mapboxConfig, mineMapConfig, tencentConfig} from './config/defaultConfig.js'
import {isSDKLoaded, loadEngineSDK} from './config/sdkConfig.js'
import { Marker, Markers, Lines, Clusters, Popup, Polygons, Tracks } from './classes/index.js'
import mapConfig from './mapConfig.js'

/**
 * HTMap 地图防腐层主入口
 * 提供统一的地图操作接口，支持多种地图引擎
 */
class HTMap {
  constructor(containerId, options = {}) {
    // 支持传入容器ID字符串或DOM元素
    this.containerId = typeof containerId === 'string' ? containerId : containerId.id
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId
    // 合并配置，但根据引擎类型过滤引擎特定配置
    this.currentEngine = options.engine || mapConfig.mapType
    this.options = {...defaultConfig, ...options, ...{engine: this.currentEngine}}
    this.mapInstance = null
    // 保存用户设置的原始zoom值（用于腾讯地图的zoom转换）
    this._userZoom = this.options.zoom
    // 验证容器是否存在
    if (!this.container) {
      throw new Error(`地图容器不存在`)
    }
  }


  /**
   * 初始化地图
   */
  async init() {
    try {
      // 检查并加载地图引擎SDK
      if (!isSDKLoaded(this.options.engine)) {
        console.log(`正在加载 ${this.options.engine} 地图引擎SDK...`)
        await loadEngineSDK(this.options.engine)
      }
      // 保存用户设置的原始zoom值
      this._userZoom = this.options.zoom
      // 统一zoom值
      switch(this.currentEngine) {
        // 腾讯zoom值加1
        case 'tencent':
          this.options.zoom = Math.min(this.options.zoom + 1, this.getMaxZoom())
          break
      }
      this.mapInstance = MapFactory.createMap(
        this.containerId,
        this.currentEngine,
        this.options
      )

      // 对于腾讯地图，监听zoom变化以同步_userZoom
      if (this.currentEngine === 'tencent' && this.mapInstance) {
        this.mapInstance.on('zoom', () => {
          if (this.mapInstance && this.mapInstance.getZoom) {
            const actualZoom = this.mapInstance.getZoom()
            // 从实际zoom值反推用户zoom值（减1）
            this._userZoom = Math.max(this.getMinZoom(), actualZoom - 1)
          }
        })
      }

      return this.mapInstance
    } catch (error) {
      console.error('HTMap初始化失败:', error)
      throw error
    }
  }

  /**
   * 销毁地图
   */
  destroy() {
    if (this.mapInstance && this.mapInstance.destroy) {
      this.mapInstance.destroy()
    }
    this.mapInstance = null
    this.currentEngine = null
  }

  /**
   * 设置地图中心点
   * @param {Array} center - 中心点坐标 [lng, lat]
   */
  setCenter(center) {
    if (this.mapInstance && this.mapInstance.setCenter) {
      return this.mapInstance.setCenter(center)
    }

    // 更新内部配置
    this.options.center = center
  }

  /**
   * 获取地图中心点
   * @returns {Array} 中心点坐标 [lng, lat]
   */
  getCenter() {
    if (this.mapInstance && this.mapInstance.getCenter) {
      return this.mapInstance.getCenter()
    }
    return this.options.center || [0, 0]
  }

  /**
   * 获取地图最小缩放级别
   * @returns {number} 最小缩放级别
   */
  getMinZoom() {
    // 从defaultConfig中获取当前引擎的minZoom
    switch (this.currentEngine) {
      case 'tencent':
        return tencentConfig.minZoom
      case 'minemap':
        return mineMapConfig.minZoom
      case 'mapbox':
        return mapboxConfig.minZoom
      default:
        return 0 // 默认最小0级
    }
  }

  /**
   * 获取地图最大缩放级别
   * @returns {number} 最大缩放级别
   */
  getMaxZoom() {
    // 从defaultConfig中获取当前引擎的maxZoom
    switch (this.currentEngine) {
      case 'tencent':
        return tencentConfig.maxZoom
      case 'minemap':
        return mineMapConfig.maxZoom
      case 'mapbox':
        return mapboxConfig.maxZoom
      default:
        return 22 // 默认最大22级
    }
  }

  /**
   * 设置地图缩放等级
   * @param {number} zoom - 缩放级别
   */
  setZoom(zoom) {
    // 保存用户设置的原始zoom值
    this._userZoom = zoom
    
    if (this.mapInstance && this.mapInstance.setZoom) {
      // 统一各个厂商zoom值
      let actualZoom = zoom
      switch (this.currentEngine) {
        case 'tencent':
          actualZoom = Math.min(zoom + 1, this.getMaxZoom())
          break
      }
      return this.mapInstance.setZoom(actualZoom)
    }
    // 根据当前引擎动态获取zoom范围
    const minZoom = this.getMinZoom()
    const maxZoom = this.getMaxZoom()
    // 更新内部配置
    this.options.zoom = Math.max(minZoom, Math.min(maxZoom, zoom))
  }

  /**
   * 获取地图缩放级别
   * @returns {number} 缩放级别
   */
  getZoom() {
    if (this.mapInstance && this.mapInstance.getZoom) {
      switch (this.currentEngine) {
        case 'tencent':
          // 对于腾讯地图，直接返回用户设置的原始zoom值
          return this._userZoom
      }
      return this.mapInstance.getZoom()
    }
    const minZoom = this.getMinZoom()
    return this.options.zoom || minZoom
  }

  /**
   * 获取地图最大倾斜角度 (pitch)
   * @returns {number} 最大倾斜角度
   */
  getMaxPitch() {
    // 从defaultConfig中获取当前引擎的pitchRange
    switch (this.currentEngine) {
      case 'tencent':
        return tencentConfig.pitchRange[1]
      case 'minemap':
        return mineMapConfig.pitchRange[1]
      case 'mapbox':
        return mapboxConfig.pitchRange[1]
      default:
        return 60 // 默认最大60度
    }
  }

  /**
   * 设置地图倾斜角度 (pitch)
   * @param {number} pitch - 倾斜角度
   */
  setPitch(pitch) {
    if (this.mapInstance && this.mapInstance.setPitch) {
      return this.mapInstance.setPitch(pitch)
    }

    // 根据当前引擎动态获取pitch范围
    const maxPitch = this.getMaxPitch()
    // 更新内部配置
    this.options.pitch = Math.max(0, Math.min(maxPitch, pitch))
  }

  /**
   * 获取地图倾斜角度 (pitch)
   * @returns {number} 倾斜角度
   */
  getPitch() {
    if (this.mapInstance && this.mapInstance.getPitch) {
      return this.mapInstance.getPitch()
    }

    // 如果没有直接的getPitch方法，尝试从配置中获取
    return this.options.pitch || 0
  }

  /**
   * 设置地图旋转角度 (bearing)
   * @param {number} bearing - 旋转角度 (0-360度)
   */
  setBearing(bearing) {
    if (this.mapInstance && this.mapInstance.setBearing) {
      return this.mapInstance.setBearing(bearing)
    }

    // 更新内部配置
    this.options.bearing = ((bearing % 360) + 360) % 360
  }

  /**
   * 获取地图旋转角度 (bearing)
   * @returns {number} 旋转角度
   */
  getBearing() {
    if (this.mapInstance && this.mapInstance.getBearing) {
      return this.mapInstance.getBearing()
    }

    // 如果没有直接的getBearing方法，尝试从配置中获取
    return this.options.bearing || 0
  }

  /**
   * 2D/3D切换
   * @param {string} mode - 视图模式 ('2D' 或 '3D')
   * 动画时常自己把握吧  duration: 1500
   */
  setViewMode(mode) {
    if (this.mapInstance && this.mapInstance.setViewMode) {
      return this.mapInstance.setViewMode(mode)
    }

    // 更新内部配置
    this.options.viewMode = mode
  }

  /**
   * 限制地图视野范围
   * @param {object} options - 移动选项
   * @param {object} options.sw - 视野范围 sw: [lng, lat]
   * @param {object} options.ne - 视野范围 ne: [lng, lat]
   * @param {object} options.padding - 边距  单个数值或四个数值数组 [top, right, bottom, left]
   */
  setBounds(options) {
    if (this.mapInstance && this.mapInstance.setBounds) {
      return this.mapInstance.setBounds(options)
    }
  }

  /**
   * 限制地图视野范围
   * @param {object} bounds - 视野范围 {sw: [lng, lat], ne: [lng, lat]}
   * @returns {boolean} 操作是否成功
   */
  limitBounds(bounds) {
    if (this.mapInstance && this.mapInstance.limitBounds) {
      return this.mapInstance.limitBounds(bounds)
    }
    return false
  }

  /**
   * 获取地图边界
   * @returns {object} 地图边界 {sw, ne}
   */
  getBounds() {
    if (this.mapInstance && this.mapInstance.getBounds) {
      return this.mapInstance.getBounds()
    }

    // 如果没有 getBounds 方法，返回默认边界
    const center = this.getCenter()
    const zoom = this.getZoom()
    const offset = Math.pow(2, 15 - zoom) * 0.01 // 简单的边界计算
    return {
      sw: [center[0] - offset, center[1] - offset],  // 西南角 [经度, 纬度]
      ne: [center[0] + offset, center[1] + offset]   // 东北角 [经度, 纬度]
    }
  }

  /**
   * 平滑过渡到指定视角 (easeTo)
   * @param {object} options - 移动选项
   * @param {Array} options.center - 中心点坐标 [lng, lat]
   * @param {number} options.zoom - 缩放级别
   * @param {number} options.bearing - 旋转角度 (0-360度)
   * @param {number} options.pitch - 倾斜角度 (0-各地图最大值)
   * @param {number} options.padding - 单个数值或四个数值数组 [top, right, bottom, left]
   * @param {number} options.duration - 动画时长 (毫秒)
   */
  easeTo(options) {
    // 如果包含zoom参数，先保存用户设置的原始值
    if (options.zoom !== undefined) {
      this._userZoom = options.zoom
      // 对于腾讯地图，需要转换zoom值
      if (this.currentEngine === 'tencent') {
        options = { ...options, zoom: Math.min(options.zoom + 1, this.getMaxZoom()) }
      }
    }
    
    // 优先使用 easeTo 方法
    if (this.mapInstance && this.mapInstance.easeTo) {
      return this.mapInstance.easeTo(options)
    }
  }

  /**
   * 平滑过渡到指定边界范围 (easeToBounds)
   * @param {object} options - 边界选项
   * @param {Array} options.sw - 西南角坐标 [lng, lat]
   * @param {Array} options.ne - 东北角坐标 [lng, lat]
   * @param {number|Array} options.padding - 边距，单个数值或四个数值数组 [top, right, bottom, left]
   * @param {number} options.duration - 动画时长 (毫秒)
   */
  fitBounds(options) {
    // 优先使用 easeToBounds 方法
    if (this.mapInstance && this.mapInstance.fitBounds) {
    // 筛选无效的经纬度
    // 验证经纬度数据格式
    const coordSw = options.sw
    const coordNe = options.ne
    if (!Array.isArray(coordSw) || coordSw.length !== 2 || !Array.isArray(coordNe) || coordNe.length !== 2) {
      throw new Error(`sw和ne坐标格式错误，应为 [经度, 纬度] 格式`)
    }
    if (coordSw[0] < -180 || coordSw[0] > 180 || coordSw[1] < -90 || coordSw[1] > 90 || coordNe[0] < -180 || coordNe[0] > 180 || coordNe[1] < -90 || coordNe[1] > 90) {
      throw new Error(`sw和ne坐标超出范围 (-180 到 180) (-90 到 90)`)
    }
    if (coordSw[0] > coordNe[0] || coordSw[1] > coordNe[1]) {
      throw new Error(`sw坐标应小于ne坐标：sw[经度] < ne[经度] 且 sw[纬度] < ne[纬度]`)
    }
    return this.mapInstance.fitBounds(options)
    }
    // 如果都不支持，抛出错误
    throw new Error('当前地图引擎不支持 easeToBounds 方法')
  }

  /**
   * 平滑移动到对象集合的合适位置
   * @param {object} options - 移动选项
   * @param {Array} options.coordinates - 经纬度数组的数组，每个元素是 [lng, lat] 格式
   *                                   例如: [[-76.543, 39.185], [-76.528, 39.183], [-76.529, 39.176]]
   * @param {number|Array} options.padding - 边界内边距 (像素)，可以是数字或数组 [top, right, bottom, left]
   * @param {number} options.duration - 动画时长 (毫秒)
   *
   * @example
   * // 使用示例
   * mapObject.fitObjectsBounds({
   *   coordinates: [
   *     [-76.54335737228394, 39.18579907229748],
   *     [-76.52803659439087, 39.1838364847587],
   *     [-76.5295386314392, 39.17683392507606],
   *     [-76.54520273208618, 39.17876344106642]
   *   ],
   *   padding: 50,
   *   duration: 2000
   * })
   */
  fitObjectsBounds(options = {}) {
    const { coordinates, padding, duration } = options
    
    try {
      // 验证参数
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        throw new Error('请传入有效的经纬度数组')
      }

      // 验证经纬度数据格式
      for (let i = 0; i < coordinates.length; i++) {
        const coord = coordinates[i]
        if (!Array.isArray(coord) || coord.length !== 2) {
          throw new Error(`第 ${i + 1} 个坐标格式错误，应为 [经度, 纬度] 格式`)
        }
        
        const [lng, lat] = coord
        if (typeof lng !== 'number' || typeof lat !== 'number' || 
            isNaN(lng) || isNaN(lat)) {
          throw new Error(`第 ${i + 1} 个坐标包含无效数值`)
        }
        
        if (lng < -180 || lng > 180) {
          throw new Error(`第 ${i + 1} 个坐标经度超出范围 (-180 到 180)`)
        }
        
        if (lat < -90 || lat > 90) {
          throw new Error(`第 ${i + 1} 个坐标纬度超出范围 (-90 到 90)`)
        }
      }

      // 计算边界范围
      let minLng = coordinates[0][0]
      let maxLng = coordinates[0][0]
      let minLat = coordinates[0][1]
      let maxLat = coordinates[0][1]

      for (const coord of coordinates) {
        const [lng, lat] = coord
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
      }

      // 构建 fitBounds 参数
      const fitBoundsOptions = {
        sw: [minLng, minLat],
        ne: [maxLng, maxLat],
        duration: duration || 2000
      }

      // 添加 padding 参数
      if (padding !== undefined) {
        if (typeof padding === 'number') {
          fitBoundsOptions.padding = padding
        } else if (Array.isArray(padding)) {
          if (padding.length === 4) {
            fitBoundsOptions.padding = padding
          } else {
            throw new Error('padding 数组必须包含 4 个值 [top, right, bottom, left]')
          }
        } else {
          throw new Error('padding 必须是数字或包含 4 个数字的数组')
        }
      }

      // 调用具体适配器的 fitBounds 方法
      if (this.mapInstance && this.mapInstance.fitBounds) {
        this.mapInstance.fitBounds(fitBoundsOptions)
      } else {
        throw new Error('当前地图引擎不支持 fitBounds 方法')
      }

    } catch (error) {
      console.error('fitObjectsBounds 执行失败:', error)
      throw error
    }
  }

  /**
   * 统一支持的事件列表
   * 这些事件在HTMap中已经标准化，可以安全使用
   */
  static get unifiedEvents() {
    return [
      // 基础交互事件
      'click', 'dblclick',
      // 地图操作事件  
      'movestart', 'move', 'movestart', 'dragstart', 'drag', 'dragend', 'zoom',
      // 地图状态事件
      'load',
    ]
  }


  /**
   * 检查事件是否为统一事件
   * @param {string} event - 事件名称
   * @returns {boolean} 是否为统一事件
   */
  isUnifiedEvent(event) {
    return HTMap.unifiedEvents.includes(event)
  }


  /**
   * 绑定事件监听器
   * @param {string} event - 事件名称
   * @param {function} callback - 回调函数
   */
  on(event, callback) {
    if (this.mapInstance && this.mapInstance.on) {
      // 检查是否为统一事件
      if (!this.isUnifiedEvent(event)) {
        console.warn(
          `[HTMap] 事件 "${event}" 未在HTMap中统一标准化。` +
          `该事件将直接透传给地图引擎，可能存在兼容性问题。}`
        )
      }
      
      // 直接调用地图实例的on方法
      this.mapInstance.on(event, callback)
    } else {
      console.error(`[HTMap] 地图实例不存在或没有on方法:`, this.mapInstance)
    }
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {function} callback - 回调函数
   */
  off(event, callback) {
    if (this.mapInstance && this.mapInstance.off) {
      // 检查是否为统一事件
      if (!this.isUnifiedEvent(event)) {
        console.warn(
          `[HTMap] 正在解绑未统一的事件 "${event}"。` +
          `该事件将直接透传给 地图引擎处理。`
        )
      }
      
      // 直接调用地图实例的off方法
      this.mapInstance.off(event, callback)
    }
  }


  // ~~~~~~~~~~~~~~~~   上面为地图基础事件   ~~~~~~~~~~~~~~~~~~

  /**
   * 添加标记点
   * @param {Object} config - 标记点配置对象 {map, id, geometries, styles, contentDom}
   * @returns {Object} 标记点对象
   */
  addMarkers(config = {}) {
    if (!config.geometries || !Array.isArray(config.geometries) || config.geometries.length === 0) {
      return null
    }
    // 直接调用底层地图厂家的批量添加方法
    const markers = this.mapInstance.addMarkers(config)
    // 返回标记点对象
    return markers
  }

  /**
   * 添加单个标记点
   * @param {Object} config - 标记点配置
   * @returns {Object} 标记点对象
   */
  addDomMarker(config = {}) {
    if (!config.lngLat) {
      return null
    }
    // 直接调用底层地图厂家的单点添加方法
    if (!this.mapInstance || typeof this.mapInstance.addDomMarker !== 'function') {
      throw new Error('底层 mapInstance 未实现 addDomMarker 方法')
    }
    // 返回标记点对象
    return this.mapInstance.addDomMarker(config)
  }

  /**
   * 添加线段
   * @param {Object} config - 线段配置对象 {map, id, geometries, styles}
   * @returns {Object} 线段对象
   */
  addLines(config = {}) {
    if (!config.geometries || !Array.isArray(config.geometries) || config.geometries.length === 0) {
      return null
    }
    // 直接调用底层地图厂家的批量添加方法
    const lines = this.mapInstance.addLines(config)
    // 返回线段对象
    return lines
  }

  /**
   * 添加聚合
   * @param {Object} config - 聚合配置对象 {map, id, geometries, clusterStyle, nonClustersStyle, clusterConfig}
   * @returns {Object} 聚合对象
   */
  addClusters(config = {}) {
    if (!config.geometries || !Array.isArray(config.geometries) || config.geometries.length === 0) {
      console.error('addClusters: geometries数组不能为空')
      return null
    }
    // 直接调用底层地图厂家的聚合添加方法
    const clusters = this.mapInstance.addClusters(config)
    // 返回聚合对象
    return clusters
  }

  /**
   * 添加多边形
   * @param {Object} config - 多边形配置对象 {map, id, geometries, styles}
   * @returns {Object} 多边形对象
   */
  addPolygons(config = {}) {
    if (!config.geometries || !Array.isArray(config.geometries) || config.geometries.length === 0) {
      console.error('addPolygons: geometries数组不能为空')
      return null
    }
    // 直接调用底层地图厂家的批量添加方法
    const polygons = this.mapInstance.addPolygons(config)
    // 返回多边形对象
    return polygons
  }

  /**
   * 添加自定义气泡
   * @param {object} options - 气泡配置
   * @returns {object} 气泡实例
   */
  addPopup(options={}) {
    if (this.mapInstance && this.mapInstance.addPopup) {
      return this.mapInstance.addPopup(options)
    }
  }
  /**
   * 获取路线规划
   * @param {object} options - 路线规划配置
   * @returns {object} 路线规划对象
   */
  getRoute(options={}) {
    if (!options.from || !options.to) {
      console.error('路线规划起始点和终点不能为空')
      return null
    }
    if (this.mapInstance && this.mapInstance.getRoute) {
        return this.mapInstance.getRoute(options)
    }
  }

  /**
   * 添加轨迹层（一次性传入 id、styles、minZoom、maxZoom 等配置）
   * @param {Object} config - 轨迹配置 { map, id, styles, minZoom?, maxZoom? }
   * @returns {Object|Promise<Object>} 轨迹管理器实例，适配器可返回 Promise
   */
  addTracks(config = {}) {
    if (!this.mapInstance || typeof this.mapInstance.addTracks !== 'function') {
      console.error('底层 mapInstance 未实现 addTracks 方法')
      return null
    }
    return this.mapInstance.addTracks(config)
  }

  // ==================== 代理方法 ====================
  // 这些方法直接代理到 mapInstance，提供更简洁的 API

  /**
   * 获取地图容器尺寸
   * @returns {object} 容器尺寸 {width, height}
   */
  getSize() {
    if (this.mapInstance && this.mapInstance.getSize) {
      return this.mapInstance.getSize()
    }
    if (this.container) {
      return {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      }
    }
    return { width: 0, height: 0 }
  }

  /**
   * 样式主题切换
   * @param {string} styleType - 样式类型
   * @param {object} options - 切换选项
   */
  setStyleType(styleType, options = {}) {
    if (this.mapInstance && this.mapInstance.setStyleType) {
      return this.mapInstance.setStyleType(styleType, options)
    }
    
    // 如果没有直接的setStyleType方法，尝试使用setStyle
    if (this.mapInstance && this.mapInstance.setStyle) {
      return this.mapInstance.setStyle(styleType, options)
    }
    
    // 更新内部配置
    this.options.styleType = styleType
  }
}



// 创建 Map 类，继承自 HTMap
class Map extends HTMap {
  constructor(containerId, options = {}) {
    super(containerId, options)
    // 在构造函数中自动初始化,需要等待地图初始化完成
    this._initPromise = this.init()
    this._isReady = false
    
    // 代理所有方法调用，等待初始化完成
    return new Proxy(this, {
      get(target, prop) {
        // 如果是方法调用，等待初始化完成
        if (typeof target[prop] === 'function' && prop !== 'init') {
          return function(...args) {
            if (!target._isReady) {
              // 如果地图还没初始化完成，等待初始化后直接返回结果
              return target._initPromise.then(() => {
                target._isReady = true
                return target[prop].apply(target, args)
              })
            }
            return target[prop].apply(target, args)
          }
        }
        return target[prop]
      }
    })
  }
}

// 将类添加到 HTMap 上
HTMap.Map = Map
HTMap.Markers = Markers
HTMap.Marker = Marker
HTMap.Lines = Lines
HTMap.Clusters = Clusters
HTMap.Popup = Popup
HTMap.Polygons = Polygons
HTMap.Tracks = Tracks

// 导出HTMap类
export default HTMap