import BaseAdapter from './BaseAdapter.js'
import {
  getEngineSDKConfig
} from '../config/sdkConfig.js'
import {mapboxConfig} from "@/utils/HTMap/config/defaultConfig.js";
import { calculateDistance, calculateControlPoint, generateCurvePoints,generateConvexPolygon } from '../utils/toolUtils.js'

/**
 * 统一坐标转换工具类
 * 支持各种坐标格式的批量转换
 */
class CoordinateTransform {
  static PI = 3.1415926535897932384626
  static A = 6378245.0
  static EE = 0.00669342162296594323

  /**
   * 判断是否在中国范围内
   */
  static isInChina(lng, lat) {
    return lng >= 72.004 && lng <= 137.8347 && lat >= 0.8293 && lat <= 55.8271
  }

  /**
   * 转换纬度
   */
  static transformLat(lng, lat) {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat +
      0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
    ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(lat * this.PI) + 40.0 * Math.sin(lat / 3.0 * this.PI)) * 2.0 / 3.0
    ret += (160.0 * Math.sin(lat / 12.0 * this.PI) + 320 * Math.sin(lat * this.PI / 30.0)) * 2.0 / 3.0
    return ret
  }

  /**
   * 转换经度
   */
  static transformLng(lng, lat) {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng +
      0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
    ret += (20.0 * Math.sin(6.0 * lng * this.PI) + 20.0 * Math.sin(2.0 * lng * this.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(lng * this.PI) + 40.0 * Math.sin(lng / 3.0 * this.PI)) * 2.0 / 3.0
    ret += (150.0 * Math.sin(lng / 12.0 * this.PI) + 300.0 * Math.sin(lng / 30.0 * this.PI)) * 2.0 / 3.0
    return ret
  }

  /**
   * WGS84 转 GCJ02
   * @param {number} lng 经度
   * @param {number} lat 纬度
   * @returns {Array} [lng, lat]
   */
  static wgs84ToGcj02(lng, lat) {
    if (!this.isInChina(lng, lat)) {
      return [lng, lat]
    }

    let dlat = this.transformLat(lng - 105.0, lat - 35.0)
    let dlng = this.transformLng(lng - 105.0, lat - 35.0)

    const radlat = lat / 180.0 * this.PI
    let magic = Math.sin(radlat)
    magic = 1 - this.EE * magic * magic
    const sqrtmagic = Math.sqrt(magic)

    dlat = (dlat * 180.0) / ((this.A * (1 - this.EE)) / (magic * sqrtmagic) * this.PI)
    dlng = (dlng * 180.0) / (this.A / sqrtmagic * Math.cos(radlat) * this.PI)

    return [lng + dlng, lat + dlat]
  }

  /**
   * GCJ02 转 WGS84
   * @param {number} lng 经度
   * @param {number} lat 纬度
   * @returns {Array} [lng, lat]
   */
  static gcj02ToWgs84(lng, lat) {
    if (!this.isInChina(lng, lat)) {
      return [lng, lat]
    }

    let dlat = this.transformLat(lng - 105.0, lat - 35.0)
    let dlng = this.transformLng(lng - 105.0, lat - 35.0)

    const radlat = lat / 180.0 * this.PI
    let magic = Math.sin(radlat)
    magic = 1 - this.EE * magic * magic
    const sqrtmagic = Math.sqrt(magic)

    dlat = (dlat * 180.0) / ((this.A * (1 - this.EE)) / (magic * sqrtmagic) * this.PI)
    dlng = (dlng * 180.0) / (this.A / sqrtmagic * Math.cos(radlat) * this.PI)

    return [lng - dlng, lat - dlat]
  }

  /**
   * 自动识别并转换为 WGS84 坐标
   * @param {number} lng 经度
   * @param {number} lat 纬度
   * @param {number} threshold 判断阈值（米），默认 2 米
   * @returns {Array} [lng, lat] WGS84 坐标
   */
  static autoTransformToWgs84(lng, lat, threshold = 2) {
    if (!this.isInChina(lng, lat)) {
      return [lng, lat]
    }

    const wgs84Coord = this.gcj02ToWgs84(lng, lat)
    const backToGcj02 = this.wgs84ToGcj02(wgs84Coord[0], wgs84Coord[1])
    const distance = calculateDistance([lng, lat], backToGcj02)
    
    return distance < threshold ? wgs84Coord : [lng, lat]
  }

  // ==================== 统一转换接口 ====================

  /**
   * 转换单个坐标点
   * @param {Array|Object} coord - 坐标 [lng, lat] 或 {lng, lat}
   * @returns {Array} [lng, lat]
   */
  static transformPoint(coord) {
    if (!coord) return null

    let lng, lat
    if (Array.isArray(coord)) {
      [lng, lat] = coord
    } else if (typeof coord === 'object') {
      lng = coord.lng || coord.longitude || coord[0]
      lat = coord.lat || coord.latitude || coord[1]
    } else {
      return null
    }

    if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
      return null
    }

    return this.gcj02ToWgs84(lng, lat)
  }

  /**
   * 转换坐标数组
   * @param {Array} coords - 坐标数组
   * @returns {Array} 转换后的坐标数组
   */
  static transformPoints(coords) {
    if (!Array.isArray(coords)) return []

    return coords.map(coord => this.transformPoint(coord)).filter(Boolean)
  }

  /**
   * 转换路径（线段或多边形边界）
   * @param {Array} paths - 路径数组
   * @returns {Array} 转换后的路径数组
   */
  static transformPaths(paths) {
    if (!Array.isArray(paths)) return []

    return paths.map(coord => {
      const transformed = this.transformPoint(coord)
      return transformed || coord // 如果转换失败，保留原坐标
    })
  }

  /**
   * 转换边界框
   * @param {Object} bounds - 边界框 {sw: [lng, lat], ne: [lng, lat]}
   * @returns {Object} 转换后的边界框
   */
  static transformBounds(bounds) {
    if (!bounds || !bounds.sw || !bounds.ne) return bounds

    const sw = this.transformPoint(bounds.sw)
    const ne = this.transformPoint(bounds.ne)

    return sw && ne ? { sw, ne } : bounds
  }

  /**
   * 转换几何对象（多边形或线段）
   * @param {Object} geometry - 几何对象
   * @returns {Object} 转换后的几何对象
   */
  static transformGeometry(geometry) {
    if (!geometry) return geometry

    const result = { ...geometry }

    // 转换paths
    if (geometry.paths) {
      result.paths = this.transformPaths(geometry.paths)
    }

    // 转换coordinates
    if (geometry.coordinates) {
      result.coordinates = this.transformPaths(geometry.coordinates)
    }

    // 转换单个坐标点
    if (geometry.lngLat) {
      result.lngLat = this.transformPoint(geometry.lngLat)
    }

    return result
  }

  /**
   * 转换几何对象数组
   * @param {Array} geometries - 几何对象数组
   * @returns {Array} 转换后的几何对象数组
   */
  static transformGeometries(geometries) {
    if (!Array.isArray(geometries)) return []

    return geometries.map(geometry => this.transformGeometry(geometry))
  }
}

/**
 * MapboxGL适配器
 * 实现MapboxGL的特定功能
 */
export default class MapboxGL extends BaseAdapter {
  constructor(containerId, options) {
    super(containerId, options)
    // 初始化标记点列表 - 参照腾讯地图实现
    this.markers = new Map()
    // 缓存坐标转换设置
    this._enableCoordinateTransform = this.options.enableCoordinateTransform !== false
    this.init()
  }

  /**
   * 统一坐标转换入口
   * 根据数据类型自动选择转换方法
   * @param {*} data - 需要转换的数据
   * @param {string} context - 上下文信息，用于调试
   * @returns {*} 转换后的数据
   */
  _transformCoordinates(data, context = '') {
    if (!this._enableCoordinateTransform || !data) {
      return data
    }

    let result = data
    let transformCount = 0

    try {
      // 处理不同类型的坐标数据
      if (Array.isArray(data)) {
        // 判断是单个坐标点还是坐标数组
        if (data.length === 2 && typeof data[0] === 'number' && typeof data[1] === 'number') {
          // 单个坐标点 [lng, lat]
          result = CoordinateTransform.transformPoint(data)
          transformCount = result ? 1 : 0
        } else {
          // 坐标数组或路径
          result = CoordinateTransform.transformPaths(data)
          transformCount = result.length
        }
      } else if (typeof data === 'object') {
        // 处理对象类型
        if (data.sw && data.ne) {
          // 边界框对象
          const originalData = { ...data }
          result = CoordinateTransform.transformBounds(data)
          transformCount = 2
          if (context && result !== data) {
            console.log(`MapboxGL坐标转换[${context}]: SW [${originalData.sw[0]}, ${originalData.sw[1]}] -> [${result.sw[0]}, ${result.sw[1]}], NE [${originalData.ne[0]}, ${originalData.ne[1]}] -> [${result.ne[0]}, ${result.ne[1]}]`)
          }
        } else if (data.paths || data.coordinates || data.lngLat) {
          // 几何对象
          result = CoordinateTransform.transformGeometry(data)
          transformCount = data.paths ? data.paths.length : (data.coordinates ? data.coordinates.length : 1)
        } else if (data.lng !== undefined && data.lat !== undefined) {
          // 坐标对象 {lng, lat}
          result = CoordinateTransform.transformPoint(data)
          transformCount = result ? 1 : 0
          if (Array.isArray(result)) {
            result = { lng: result[0], lat: result[1] }
          }
        }
      }

      // 输出调试信息
      if (context && transformCount > 0 && Array.isArray(result) && Array.isArray(data)) {
        console.log(`MapboxGL坐标转换[${context}]: 转换了 ${transformCount} 个坐标点`)
      }

    } catch (error) {
      console.warn(`MapboxGL坐标转换失败[${context}]:`, error)
      result = data // 转换失败时返回原数据
    }

    return result
  }

  /**
   * 初始化MapboxGL地图
   */
  init() {
    try {
      // 从sdkConfig.js获取MapboxGL的配置信息
      const sdkConfig = getEngineSDKConfig('mapbox')
      if (!sdkConfig) {
        throw new Error('MapboxGL SDK配置不存在')
      }

      // 检查MapboxGL是否已加载
      if (typeof mapboxgl === 'undefined') {
        throw new Error(`MapboxGL未加载，请先加载SDK: ${sdkConfig.js}`)
      }

      // 设置访问令牌 - 优先使用sdkConfig中的accessToken，如果没有则使用外部传入的mapboxToken
      if (sdkConfig.accessToken) {
        mapboxgl.accessToken = sdkConfig.accessToken
      } else if (this.options.mapboxToken) {
        mapboxgl.accessToken = this.options.mapboxToken
      } else {
        throw new Error('MapboxGL访问令牌未配置，请在sdkConfig.js中设置accessToken或传入mapboxToken参数')
      }

      // 从配置中获取默认样式和配置
      const defaultStyle = 'mapbox://styles/mapbox/dark-v10'||'mapbox://styles/mapbox/streets-v11'
      const defaultCenter = [114.884094, 40.8119]
      const defaultZoom = 15
      const defaultPitch = 0
      const defaultBearing = 0

      // 创建地图实例
      // 处理地图中心坐标转换
      const centerCoords = this._transformCoordinates(this.options.center || defaultCenter, '地图初始化中心点')

      this.map = new mapboxgl.Map({
        container: this.container,
        style: this.options.style || defaultStyle,
        center: centerCoords,
        zoom: this.options.zoom || defaultZoom,
        pitch: this.options.pitch || defaultPitch,
        bearing: this.options.bearing || defaultBearing,
        maxZoom: sdkConfig.maxZoom || 24, // 从SDK配置获取最大缩放级别
        ...this.options.mapboxConfig
      })

      // 如果是2D模式，则设置最大pitch为0，禁用倾斜功能
      if (this.options.viewMode === '2D') {
        this.map.setMaxPitch(0);
      }else{
        this.map.setMaxPitch(mapboxConfig.pitchRange[1]);
      }

      // 绑定地图事件
      this._bindMapEvents()

      console.log(`MapboxGL地图初始化成功，版本: ${sdkConfig.version}`)
    } catch (error) {
      console.error('MapboxGL地图初始化失败:', error)
      throw error
    }
  }

  /**
   * 获取MapboxGL支持的最大缩放级别
   * @returns {number} 最大缩放级别
   */
  getMaxZoom() {
    const sdkConfig = getEngineSDKConfig('mapbox')
    return sdkConfig ? sdkConfig.maxZoom : 24
  }

  /**
   * 获取MapboxGL支持的最大倾斜角度
   * 根据当前视图模式返回不同的值
   * @returns {number} 最大倾斜角度
   */
  getMaxPitch() {
    // 如果是2D模式，最大pitch为0
    if (this.options.viewMode === '2D') {
      return 0
    }
    // 3D模式返回配置的最大值
    return mapboxConfig.pitchRange[1]
  }

  /**
   * 绑定地图事件
   */
  _bindMapEvents() {
    if (!this.map) return

    // 事件配置映射
    // const eventConfigs = {
    //   // 基础事件
    //   'load': () => ({ map: this.map }),
    //   'style.load': () => ({}),
    //   'error': (evt) => ({ error: evt.error, originalEvent: evt }),

    //   // 点击事件
    //   'click': (evt) => this._formatClickEvent(evt),
    //   'dblclick': (evt) => this._formatClickEvent(evt),
    //   'contextmenu': (evt) => this._formatClickEvent(evt),

    //   // 缩放事件
    //   'zoomstart': () => ({ zoom: this.map.getZoom() }),
    //   'zoom': () => ({ zoom: this.map.getZoom() }),
    //   'zoomend': () => ({ zoom: this.map.getZoom() }),

    //   // 移动事件
    //   'movestart': (evt) => this._formatMoveEvent(evt),
    //   'move': (evt) => this._formatMoveEvent(evt),
    //   'moveend': (evt) => this._formatMoveEvent(evt),

    //   // 旋转事件
    //   'rotatestart': () => ({ bearing: this.map.getBearing() }),
    //   'rotate': () => ({ bearing: this.map.getBearing() }),
    //   'rotateend': () => ({ bearing: this.map.getBearing() }),

    //   // 倾斜事件
    //   'pitchstart': () => ({ pitch: this.map.getPitch() }),
    //   'pitch': () => ({ pitch: this.map.getPitch() }),
    //   'pitchend': () => ({ pitch: this.map.getPitch() }),

    //   // 鼠标事件
    //   'mouseenter': (evt) => this._formatMouseEvent(evt),
    //   'mouseleave': (evt) => this._formatMouseEvent(evt),
    //   'mousemove': (evt) => this._formatMouseEvent(evt),
    //   'mousedown': (evt) => this._formatMouseEvent(evt),
    //   'mouseup': (evt) => this._formatMouseEvent(evt),

    //   // 拖拽事件
    //   'dragstart': () => ({ center: this.map.getCenter() }),
    //   'drag': () => ({ center: this.map.getCenter() }),
    //   'dragend': () => ({ center: this.map.getCenter() }),

    //   // 数据事件
    //   'dataloading': () => ({}),
    //   'data': () => ({}),
    //   'sourcedata': () => ({}),
    //   'render': () => ({})
    // }

    // // 批量绑定事件
    // Object.entries(eventConfigs).forEach(([eventName, dataFormatter]) => {
    //   this.map.on(eventName, (evt) => {
    //     const eventData = dataFormatter(evt)
    //     this.triggerEvent(eventName, eventData)
    //   })
    // })

    // 地图加载完成事件
    this.map.on('load', () => {
      this.triggerEvent('load', {
        map: this.map
      })
    })

    // 地图点击事件
    this.map.on('click', (evt) => {
      this.triggerEvent('click', {
        lngLat: [evt.lngLat.lng, evt.lngLat.lat],
        pixel: [evt.point.x, evt.point.y]
      })
    })
    this.map.on('dblclick', (evt) => {
      this.triggerEvent('dblclick', {
        lngLat: [evt.lngLat.lng, evt.lngLat.lat],
        pixel: [evt.point.x, evt.point.y]
      })
    })

    // 地图缩放事件
    this.map.on('zoom', () => {
      this.triggerEvent('zoom', {
        zoom: this.map.getZoom()
      })
    })

    // 地图移动事件
    this.map.on('move', () => {
      this.triggerEvent('move', {
        center: this.map.getCenter()
      })
    })
    this.map.on('movestart', () => {
      this.triggerEvent('movestart', {
        center: this.map.getCenter()
      })
    })
    this.map.on('moveend', () => {
      this.triggerEvent('moveend', {
        center: this.map.getCenter()
      })
    })
    this.map.on('dragstart', () => {
      this.triggerEvent('dragstart', {
        center: this.map.getCenter()
      })
    })
    this.map.on('drag', () => {
      this.triggerEvent('drag', {
        center: this.map.getCenter()
      })
    })
    this.map.on('dragend', () => {
      this.triggerEvent('dragend', {
        center: this.map.getCenter()
      })
    })
  }

  /**
   * 设置地图中心点和缩放级别
   * @param {Array} center - 中心点坐标 [lng, lat]
   * @param {number} zoom - 缩放级别
   */
  setView(center, zoom) {
    if (!this.map) return

    // 验证缩放级别是否在允许范围内
    if (zoom !== undefined) {
      const maxZoom = this.getMaxZoom()
      const minZoom = 0
      const clampedZoom = Math.max(minZoom, Math.min(zoom, maxZoom))

      this.map.flyTo({
        center,
        zoom: clampedZoom
      })
    } else {
      this.map.flyTo({
        center
      })
    }
  }

  /**
   * 设置地图中心点
   * @param {Array} center - 中心点坐标 [lng, lat]
   * @param {object} options - 动画选项  废弃了不要了  todo 待修改
   */
  setCenter(center, options = {}) {
    if (!this.map) return

    // 处理坐标转换
    const transformedCenter = this._transformCoordinates(center, 'setCenter')

    if (options.animate !== false) {
      // 使用动画方式设置中心点
      this.map.flyTo({
        center: transformedCenter,
        duration: options.duration || 1000,
        ...options
      })
    } else {
      // 直接设置中心点
      this.map.setCenter(transformedCenter)
    }
  }

  /**
   * 设置地图缩放级别
   * @param {number} zoom - 缩放级别
   * @param {object} options - 动画选项   废弃了不要了  todo 待修改
   */
  setZoom(zoom, options = {}) {
    if (!this.map) return

    const maxZoom = this.getMaxZoom()
    const minZoom = 0
    const validZoom = Math.max(minZoom, Math.min(zoom, maxZoom))

    if (options.animate !== false) {
      // 使用动画方式设置缩放级别
      this.map.flyTo({
        zoom: validZoom,
        duration: options.duration || 1000,
        ...options
      })
    } else {
      // 直接设置缩放级别
      this.map.setZoom(validZoom)
    }
  }

  /**
   * 设置地图倾斜角度
   * @param {number} pitch - 倾斜角度 (0-85度)
   * @param {object} options - 动画选项
   */
  setPitch(pitch, options = {}) {
    if (!this.map) return

    const validPitch = Math.max(0, Math.min(mapboxConfig.pitchRange[1], pitch))

    if (options.animate !== false) {
      // 使用动画方式设置倾斜角度
      this.map.flyTo({
        pitch: validPitch,
        duration: options.duration || 1000,
        ...options
      })
    } else {
      // 直接设置倾斜角度
      this.map.setPitch(validPitch)
    }
  }

  /**
   * 设置地图旋转角度
   * @param {number} rotation - 旋转角度 (0-360度)
   * @param {object} options - 动画选项
   */
  setBearing(rotation, options = {}) {
    if (!this.map) return

    const validRotation = ((rotation % 360) + 360) % 360

    if (options.animate !== false) {
      // 使用动画方式设置旋转角度
      this.map.flyTo({
        bearing: validRotation,
        duration: options.duration || 1000,
        ...options
      })
    } else {
      // 直接设置旋转角度
      this.map.setBearing(validRotation)
    }
  }

  /**
   * 设置视图模式 (2D/3D)
   * @param {string} mode - 视图模式 ('2D' 或 '3D')
   * @param {object} options - 切换选项
   */
  setViewMode(mode, options = {}) {
    if (!this.map) return

    if (mode === '3D') {
      // 3D模式：设置倾斜角度和最大pitch限制
      this.map.setMaxPitch(mapboxConfig.pitchRange[1])
      const pitch = options.pitch || 45
      this.setPitch(pitch, options)
    } else {
      // 2D模式：重置倾斜角度并禁用pitch功能
      this.map.setMaxPitch(0)
      this.setPitch(0, options)
    }

    // 更新内部配置
    this.options.viewMode = mode
  }

  /**
   * 设置样式类型
   * @param {string} styleType - 样式类型
   * @param {object} options - 切换选项
   */
  setStyleType(styleType, options = {}) {
    if (!this.map) return

    // MapboxGL支持多种样式类型
    const styleMap = {
      'default': 'mapbox://styles/mapbox/streets-v11',
      'satellite': 'mapbox://styles/mapbox/satellite-v9',
      'hybrid': 'mapbox://styles/mapbox/satellite-streets-v11',
      // 'dark': 'mapbox://styles/mapbox/dark-v10',
      'black': 'mapbox://styles/mapbox/dark-v10',
      // 'light': 'mapbox://styles/mapbox/light-v10',
      'white': 'mapbox://styles/mapbox/light-v10',
      'outdoors': 'mapbox://styles/mapbox/outdoors-v11',
      'navigation': 'mapbox://styles/mapbox/navigation-day-v1',
      'navigation-night': 'mapbox://styles/mapbox/navigation-night-v1'
    }

    const mapStyle = styleMap[styleType] || styleType

    this.map.setStyle(mapStyle, options)
  }

  /**
   * 获取地图倾斜角度
   * @returns {number} 倾斜角度
   */
  getPitch() {
    if (!this.map) return 0
    return this.map.getPitch()
  }

  /**
   * 获取地图旋转角度
   * @returns {number} 旋转角度
   */
  getRotation() {
    if (!this.map) return 0
    return this.map.getBearing()
  }

  /**
   * 获取当前视图模式
   * @returns {string} 视图模式 ('2D' 或 '3D')
   */
  getViewMode() {
    const pitch = this.getPitch()
    return pitch > 0 ? '3D' : '2D'
  }

  /**
   * 获取当前样式类型
   * @returns {string} 样式类型
   */
  getStyleType() {
    if (!this.map) return this.options.styleType || 'default'

    const style = this.map.getStyle()
    if (style && style.sprite) {
      // 从样式URL中提取样式类型
      const url = style.sprite
      if (url.includes('streets')) return 'default'
      if (url.includes('satellite')) return 'satellite'
      if (url.includes('dark')) return 'dark'
      if (url.includes('light')) return 'light'
      if (url.includes('outdoors')) return 'outdoors'
      if (url.includes('navigation')) return 'navigation'
    }

    return this.options.styleType || 'default'
  }

  /**
   * 获取地图中心点
   * @returns {Array} 中心点坐标 [lng, lat]
   */
  getCenter() {
    if (!this.map) return [0, 0]

    const center = this.map.getCenter()
    const wgs84Center = [center.lng, center.lat]

    // 如果启用了坐标转换，需要将WGS84坐标转换回GCJ02供外部使用
    // if (this._enableCoordinateTransform) {
      return CoordinateTransform.wgs84ToGcj02(wgs84Center[0], wgs84Center[1])
    // }

    return wgs84Center
  }

  /**
   * 获取地图缩放级别
   * @returns {number} 缩放级别
   */
  getZoom() {
    if (!this.map) return 0
    return this.map.getZoom()
  }

  /**
   * 子类需要实现的具体平滑移动方法
   * @param {object} options - 验证后的移动选项
   * @param {Array} options.center - 验证后的中心点坐标 [lng, lat]
   * @param {number} options.zoom - 验证后的缩放级别
   * @param {number} options.bearing - 验证后的旋转角度
   * @param {number} options.pitch - 验证后的倾斜角度
   * @param {object|number} options.padding - 验证后的边界内边距 [top, right, bottom, left]
   * @param {number} options.duration - 验证后的动画时长
   * @returns {boolean} 操作是否成功
   * @private
   */
  easeTo(options) {
    if (!this.map) return false

    try {
      // 使用easeTo方法进行平滑移动
      const lngLat = options.center
      options.center = this._transformCoordinates(lngLat, 'easeTo')
      this.map.easeTo(options)
      return true
    } catch (error) {
      console.error('MapboxGL _easeTo error:', error)
      return false
    }
  }

  /**
   * 解析坐标格式 - 支持多种坐标格式
   * @param {object} options - 标记点配置
   * @returns {Array} 坐标数组 [lng, lat]
   * @private
   */
  _parseCoordinates(options) {
    let coordinates = null

    // 支持多种坐标格式
    if (options.lngLat && Array.isArray(options.lngLat)) {
      coordinates = options.lngLat
    } else if (options.lng && options.lat) {
      coordinates = [options.lng, options.lat]
    } else if (options.position && Array.isArray(options.position)) {
      coordinates = options.position
    } else if (options.position && typeof options.position === 'object') {
      // 支持对象格式 {lng: 114, lat: 40}
      coordinates = [options.position.lng, options.position.lat]
    }

    if (!coordinates) {
      console.warn('MapboxGL._parseCoordinates: 无法解析坐标格式', options)
      return [0, 0]
    }
    console.log('坐标解析-origin',coordinates)
    console.log('坐标解析',this._transformCoordinates(coordinates, '坐标解析'))
    // 统一坐标转换
    return this._transformCoordinates(coordinates, '坐标解析')
  }

  /**
   * 创建标记点元素 - 支持 HTMap 标准参数格式
   * @param {object} options - 标记点配置
   * @param {string} markerId - 标记点ID
   * @returns {HTMLElement} 标记点元素
   * @private
   */
  _createMarkerElement(options, markerId) {
    // 如果提供了自定义元素，直接使用
    if (options.element) {
      return options.element
    }

    // 如果提供了自定义DOM内容，创建元素
    if (options.contentDom) {
      const element = options.contentDom.cloneNode(true)
      element.className = element.className ? `${element.className} ht-map-marker` : 'ht-map-marker'
      element.style.display = 'block'
      return element
    }

    // 创建默认元素
    const element = document.createElement('div')
    element.className = 'ht-map-marker'
    element.id = markerId

    // 获取图标配置
    const iconConfig = this._getIconConfig(options)

    if (iconConfig.type === 'image') {
      // 使用图片图标
      element.style.backgroundImage = `url(${iconConfig.src})`
      element.style.backgroundSize = 'contain'
      element.style.backgroundRepeat = 'no-repeat'
      element.style.backgroundPosition = 'center'
    } else if (iconConfig.type === 'color') {
      // 使用颜色圆形标记
      element.style.backgroundColor = iconConfig.color
      element.style.borderRadius = '50%'
      element.style.border = '2px solid white'
      element.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'
    } else {
      // 使用默认图标
      element.style.backgroundImage = `url(${iconConfig.src})`
      element.style.backgroundSize = 'contain'
      element.style.backgroundRepeat = 'no-repeat'
      element.style.backgroundPosition = 'center'
    }

    // 设置尺寸
    element.style.width = `${iconConfig.size}px`
    element.style.height = `${iconConfig.size}px`
    element.style.cursor = 'pointer'

    // 设置其他样式
    if (options.className) {
      element.className += ` ${options.className}`
    }

    return element
  }

  /**
   * 获取图标配置 - 支持 HTMap 标准参数格式
   * @param {object} options - 标记点配置
   * @returns {object} 图标配置对象
   * @private
   */
  _getIconConfig(options) {
    const size = options.size || options.iconSize || 32
    const color = options.color || options.iconColor || '#FB4436'

    // 优先使用自定义图标 - 支持多种属性名
    if (options.icon || options.iconUrl || options.src) {
      return {
        type: 'image',
        src: options.icon || options.iconUrl || options.src,
        size: size
      }
    }

    // 使用默认图标
    if (options.defaultIcon) {
      return {
        type: 'image',
        src: options.defaultIcon,
        size: size
      }
    }

    // 如果没有指定图标，使用颜色圆形标记
    return {
      type: 'color',
      color: color,
      size: size
    }
  }

  /**
   * 转换偏移量 - 支持多种格式
   * @param {Array|string|number} offset - 偏移量
   * @returns {Array} 标准化的偏移量数组 [x, y]
   * @private
   */
  _convertOffset(offset) {
    if (!offset) return [0, 0]

    // 如果已经是数组，转换数组中的数值字符串
    if (Array.isArray(offset)) {
      return offset.map(val => {
        if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
          return Number(val)
        }
        return typeof val === 'number' ? val : 0
      })
    }

    // 如果是单个数值或数值字符串，转换为数组
    if (typeof offset === 'string' && !isNaN(offset) && offset.trim() !== '') {
      const numVal = Number(offset)
      return [numVal, numVal] // 默认x和y使用相同值
    }

    if (typeof offset === 'number') {
      return [offset, offset] // 默认x和y使用相同值
    }

    return [0, 0]
  }

  /**
   * 绑定标记点事件 - 支持 HTMap 标准事件格式
   * @param {object} marker - 标记点实例
   * @param {HTMLElement} element - 标记点元素
   * @param {Array} coordinates - 坐标
   * @param {object} options - 标记点配置
   * @private
   */
  _bindMarkerEvents(marker, element, coordinates, options) {
    // 创建事件数据格式化函数 - 兼容 mapMarkerEvents 格式
    const createEventData = (event, eventType) => ({
      // 原始数据
      marker: marker,
      event: event,
      // lngLat: coordinates,
      element: element,
      type: eventType,
      // HTMap 兼容格式
      markerInstance: marker,
      originalEvent: event,
      // mapMarkerEvents 兼容格式
      lngLat: {
        lng: options.lngLat.lng,
        lat: options.lngLat.lat
      },
      geometry: {
        properties: {
          name: options.properties?.name || options.id || '未知标记点',
          description: options.properties?.description || '无描述',
          type: options.properties?.type || 'default'
        }
      },
      target: {
        properties: {
          name: options.properties?.name || options.id || '未知标记点',
          description: options.properties?.description || '无描述',
          type: options.properties?.type || 'default'
        }
      },
      point: {
        x: event.clientX || 0,
        y: event.clientY || 0
      },
      timestamp: Date.now()
    })

    // 点击事件 - 支持多种属性名
    if (options.onClick || options.onclick) {
      const callback = options.onClick || options.onclick
      element.addEventListener('click', (e) => {
        e.stopPropagation()
        callback(createEventData(e, 'click'))
      })
    }

    // 双击事件 - 支持多种属性名
    if (options.onDblClick || options.ondblclick) {
      const callback = options.onDblClick || options.ondblclick
      element.addEventListener('dblclick', (e) => {
        e.stopPropagation()
        callback(createEventData(e, 'dblclick'))
      })
    }

    // 鼠标进入事件 - 支持多种属性名
    if (options.onMouseEnter || options.onMouseover || options.onmouseover) {
      const callback = options.onMouseEnter || options.onMouseover || options.onmouseover
      element.addEventListener('mouseenter', (e) => {
        callback(createEventData(e, 'mouseenter'))
      })
    }

    // 鼠标离开事件 - 支持多种属性名
    if (options.onMouseLeave || options.onMouseout || options.onmouseout) {
      const callback = options.onMouseLeave || options.onMouseout || options.onmouseout
      element.addEventListener('mouseleave', (e) => {
        callback(createEventData(e, 'mouseleave'))
      })
    }

    // 拖拽事件
    if (options.draggable) {
      if (options.onDragStart || options.ondragstart) {
        const callback = options.onDragStart || options.ondragstart
        element.addEventListener('dragstart', (e) => {
          callback(createEventData(e, 'dragstart'))
        })
      }

      if (options.onDrag || options.ondrag) {
        const callback = options.onDrag || options.ondrag
        element.addEventListener('drag', (e) => {
          callback(createEventData(e, 'drag'))
        })
      }

      if (options.onDragEnd || options.ondragend) {
        const callback = options.onDragEnd || options.ondragend
        element.addEventListener('dragend', (e) => {
          callback(createEventData(e, 'dragend'))
        })
      }
    }

    // 右键菜单事件 - 支持多种属性名
    if (options.onContextMenu || options.oncontextmenu || options.onRightClick) {
      const callback = options.onContextMenu || options.oncontextmenu || options.onRightClick
      element.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        callback(createEventData(e, 'contextmenu'))
      })
    }
  }

  /**
   * 添加单个标记点 - 支持 HTMap 标准参数格式
   * @param {object} options - 标记点配置
   * @returns {object} 标记点实例
   */
  addDomMarker(options) {
    if (!this.map) return null

    // 验证必要参数 - 支持多种坐标格式
    if (!options.lngLat && (!options.lng || !options.lat) && !options.position) {
      console.warn('MapboxGL.addDomMarker: 缺少位置参数 (lngLat、lng/lat 或 position)')
      return null
    }

    try {
      // 处理坐标格式 - 支持多种格式
      const coordinates = this._parseCoordinates(options)

      // 生成唯一ID
      const markerId = options.id || `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 创建标记点元素
      const element = this._createMarkerElement(options, markerId)
      // 创建 MapboxGL Marker 实例
      const initZoomEventListeners = (dom)=>{
        const minZoom = options.minZoom||0;
        const maxZoom = options.maxZoom||24;
        //初始化监听
        const zoom = this.map.getZoom();
        dom.style.display = zoom >= minZoom && zoom <= maxZoom ? 'block' : 'none';
        // 缩放监听
        this.map.on('zoom', () => {
          if(!this.map){
            return
          }
          //判断是否需要修改自定义覆盖物的显示
          const zoom = this.map.getZoom();
          dom.style.display = zoom >= minZoom && zoom <= maxZoom ? 'block' : 'none';

        })
      }
      initZoomEventListeners(element)
      const marker = new mapboxgl.Marker({
        element: element,
        anchor: options.anchor || 'bottom',
        offset: options.offset||options.domOffset || [0, 0],
        draggable: options.draggable || false
      })
        .setLngLat(coordinates)
        .addTo(this.map)

      // 绑定事件
      this._bindMarkerEvents(marker, element, coordinates, options)

      // 存储到图层管理
      this.addLayer(markerId, marker)

      // 创建标记点数据（用于事件管理器）
      const markerData = {
        id: markerId,
        lngLat: options.lngLat,
        properties: options.properties || {}
      }

      // 创建事件管理器 - 和 addMarkers 一样的事件绑定能力
      const eventManager = this._createMarkerEventManager(markerId, markerId, [markerData], [marker])

      // 返回标记点对象 - HTMap 兼容格式 + 事件管理能力
      return {
        id: markerId,
        marker: marker,
        element: element,
        lngLat: options.lngLat,
        // HTMap 标准方法
        remove: () => {
          if (eventManager) {
            eventManager.clearAll()
          }
          marker.remove()
          this.layers.delete(markerId)
        },
        setLngLat: (lngLat) => {
          // 统一坐标转换
          const transformedLngLat = this._transformCoordinates(lngLat, 'marker.setLngLat')
          marker.setLngLat(transformedLngLat)
          // 更新 markerData 中的坐标
          markerData.lngLat = transformedLngLat
        },
        setVisible: (visible) => {
          element.style.display = visible ? 'block' : 'none'
        },
        getVisible: () => {
          return element.style.display !== 'none'
        },
        // 事件绑定方法 - 和 addMarkers 一样
        bindEvents: (eventHandlers) => {
          if (eventManager) {
            eventManager.bindEvents(eventHandlers)
          }
        },
        // 事件监听器方法 - 支持 marker.on('click', fun) 方式调用
        on: (event, callback) => eventManager ? eventManager.on(event, callback) : null,
        off: (event, callback) => eventManager ? eventManager.off(event, callback) : null,
        once: (event, callback) => eventManager ? eventManager.once(event, callback) : null,
        getListenerCount: (event) => eventManager ? eventManager.getListenerCount(event) : 0,
        clearAllListeners: () => eventManager ? eventManager.clearAll() : null
      }

    } catch (error) {
      console.error('MapboxGL.addDomMarker: 添加标记点失败:', error)
      return null
    }
  }

  /**
   * 批量添加标记点
   * @param {object} options - 标记点配置
   * @returns {object} 标记点实例
   */
  addMarkers(options) {
    if (!this.map) return null
    // 验证必需参数
    if (!options.geometries || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      console.warn('MapboxGL.addMarkers: geometries 参数无效或为空')
      return null
    }
    const sourceId = `${options.id}-source`
    const layerId = `${options.id}-layer`
    const styles = options.styles || []
    // 修改styles中的offset为默认值
    // options.styles?.forEach(style => {
    //   style.offset = [0, 0]
    // })

    try {
      // 标准化几何数据 - 支持多种坐标格式
      const normalizedGeometries = this.#normalizeGeometries(options.geometries, options.styles)

      // 构建 GeoJSON 数据
      const geojsonData = {
        type: 'FeatureCollection',
        features: options.geometries.map(geometry => ({
          type: 'Feature',
          id: geometry.id,
          geometry: {
            type: 'Point',
            coordinates: this._transformCoordinates(geometry.lngLat, 'addMarkers-GeoJSON')
          },
          properties: {
            ...geometry.properties,
            id: geometry.id,
            styleId: geometry.styleId
          }
        }))
      }

      // 添加数据源
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData,
        dynamic: true // 必须加上
      })

      // 根据配置选择不同的渲染方式
      if (options.contentDom) {
        // 使用自定义DOM方式
        return this.#addMarkersWithContentDom(options, sourceId, layerId, geojsonData, normalizedGeometries)
      } else if (options.styles && options.styles.length > 0) {
        // 使用样式图标方式
        return this.#addMarkersWithStyles(options, sourceId, layerId, geojsonData, normalizedGeometries)
      } else {
        // 使用默认标记点方式
        return this.#addMarkersWithDefault(options, sourceId, layerId, geojsonData, normalizedGeometries)
      }
    } catch (error) {
      console.error('MapboxGL.addMarkers: 添加标记点失败:', error)
      return null
    }

  }
  /**
   * 标准化几何数据 - 支持多种坐标格式
   * @param {Array} geometries - 几何数据数组
   * @param {Array} styles - 样式数组（可选）
   * @returns {Array} 标准化后的几何数据
   * @private
   */
  // _normalizeGeometries-废弃(geometries, styles = []) {
  //   debugger
  //   return geometries.map((geometry, index) => {
  //     // 解析坐标
  //     const coordinates = this._parseCoordinates(geometry)

  //     // 确保每个几何数据都有一个有效的 styleId
  //     let styleId = geometry.styleId
  //     if (!styleId && styles.length > 0) {
  //       // 如果没有指定 styleId，使用第一个样式
  //       styleId = styles[0].id || `style_0`
  //     }

  //     return {
  //       id: geometry.id || `geometry_${index}`,
  //       lngLat: coordinates,
  //       properties: geometry.properties || {},
  //       styleId: styleId
  //     }
  //   })
  // }

  /**
   * 标准化几何数据 - 支持多种坐标格式（私有方法重载）
   * @param {Array} geometries - 几何数据数组
   * @param {Array} styles - 样式数组（可选）
   * @returns {Array} 标准化后的几何数据
   * @private
   */
  #normalizeGeometries(geometries, styles = []) {
    return this._normalizeGeometries(geometries, styles)
  }
  /**
   * 使用自定义DOM方式添加标记点
   * @param {object} options - 标记点配置
   * @param {string} sourceId - 数据源ID
   * @param {string} layerId - 图层ID
   * @param {object} geojsonData - GeoJSON数据
   * @param {Array} normalizedGeometries - 标准化后的几何数据
   * @returns {object} 标记点实例
   * @private
   */
  #addMarkersWithContentDom(options, sourceId, layerId, geojsonData, normalizedGeometries) {
    const self = this // 保存 MineMap 实例的引用

    // 使用 symbol 图层显示自定义 DOM 内容
    self.map.addLayer({
      id: layerId,
      type: 'symbol',
      source: sourceId,
      layout: {
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      },
      minzoom: options.minZoom||0,  // 最小缩放级别（当地图缩放到 >=5 时显示）
      maxzoom: options.maxZoom||24,  // 最大缩放级别（当地图缩放到 <=10 时显示）
    })
    const initZoomEventListeners = (dom)=>{
      const minZoom = options.minZoom||0;
      const maxZoom = options.maxZoom||24;
      //初始化监听
      const zoom = self.map.getZoom();
      dom.style.display = zoom >= minZoom && zoom <= maxZoom ? 'block' : 'none';
      // 缩放监听
      self.map.on('zoom', () => {
        if(!self.map){
          return
        }
        //判断是否需要修改自定义覆盖物的显示
        const zoom = self.map.getZoom();
        dom.style.display = zoom >= minZoom && zoom <= maxZoom ? 'block' : 'none';

      })
    }

    // 为每个点创建自定义 DOM 标记
    const markers = []
    normalizedGeometries.forEach((geometry) => {
      const markerElement = options.contentDom.cloneNode(true)
      markerElement.style.display = 'block'
      markerElement.classList.add('ht-map-marker', 'ht-map-marker-custom')


      initZoomEventListeners(markerElement)
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: options.anchor || 'bottom',
        offset: options.domOffset||options.offset || [0, 0]
      })
        .setLngLat(self._transformCoordinates(geometry.lngLat, 'addMarkers样式标记点'))
        .addTo(self.map)

      markers.push(marker)
    })

    // 创建事件管理器
    const eventManager = self._createMarkerEventManager(layerId, sourceId, normalizedGeometries, markers)

    // 创建标记组对象 - 完全参照腾讯地图实现
    const markerGroup = {
      id: options.id,
      sourceId,
      layerId,
      markers,
      geometries: normalizedGeometries,

      // 事件绑定方法 - 仿照腾讯地图实现
      bindEvents: (eventHandlers) => {
        if (eventManager) {
          eventManager.bindEvents(eventHandlers)
        }
      },

      // 事件监听器方法 - 支持 markers.on('click', fun) 方式调用
      on: (event, callback) => eventManager ? eventManager.on(event, callback) : null,
      off: (event, callback) => eventManager ? eventManager.off(event, callback) : null,
      once: (event, callback) => eventManager ? eventManager.once(event, callback) : null,

      // 更新几何数据的方法 - 参照腾讯地图实现
      updateMarkersGeometries: (newGeometries) => {
        if (!Array.isArray(newGeometries)) return false

        const updatedGeometries = newGeometries.map(geo => {
          if (!geo.lngLat || !Array.isArray(geo.lngLat) || geo.lngLat.length < 2) {
            console.warn(`updateGeometries: 几何数据 ${geo.id} 坐标无效，跳过`)
            return null
          }

          return {
            id: geo.id,
            lngLat: geo.lngLat,
            properties: {...geo.properties, styleId: geo.styleId} || {}
          }
        }).filter(Boolean)

        if (updatedGeometries.length > 0) {
          // 更新数据源
          const geojsonData = {
            type: 'FeatureCollection',
            features: updatedGeometries.map(geo => ({
              type: 'Feature',
              id: geo.id,
              geometry: {
                type: 'Point',
                coordinates: this._transformCoordinates(geo.lngLat, 'addMarkers-GeoJSON')
              },
              properties: geo.properties || {}
            }))
          }

          if (self.map.getSource(sourceId)) {
            self.map.getSource(sourceId).updateData(geojsonData)
            // markerGroup.geometries = updatedGeometries
            return true
          }
        }
        return false
      },

      // 添加几何数据的方法 - 参照腾讯地图实现
      addGeometries: (newGeometries) => {
        if (!Array.isArray(newGeometries)) return false

        const validatedGeometries = newGeometries.map(geo => {
          if (!geo.lngLat || !Array.isArray(geo.lngLat) || geo.lngLat.length < 2) {
            console.warn(`addGeometries: 几何数据 ${geo.id} 坐标无效，跳过`)
            return null
          }

          return {
            id: geo.id,
            lngLat: geo.lngLat,
            properties: geo.properties || {}
          }
        }).filter(Boolean)

        if (validatedGeometries.length > 0) {
          // 为新几何数据创建新的 DOM Marker 实例
          validatedGeometries.forEach(geometry => {
            const markerElement = options.contentDom.cloneNode(true)
            markerElement.style.display = 'block'
            markerElement.className = 'ht-map-marker ht-map-marker-custom'

            const marker = new mapboxgl.Marker({
              element: markerElement,
              anchor: options.anchor || 'bottom',
              offset: options.offset || [0, 0]
            })
              .setLngLat(this._transformCoordinates(geometry.lngLat))
              .addTo(self.map)

            markers.push(marker)
          })

          // 更新几何数据
          markerGroup.geometries.push(...validatedGeometries)
          return true
        }
        return false
      },

      // 删除几何数据的方法 - 参照腾讯地图实现
      removeGeometries: (idsToDelete) => {
        if (!Array.isArray(idsToDelete)) return false

        // 找到要删除的 marker 实例
        const markersToRemove = []
        idsToDelete.forEach(id => {
          const markerIndex = markerGroup.geometries.findIndex(geo => geo.id === id)
          if (markerIndex !== -1) {
            if (markers[markerIndex]) {
              markersToRemove.push(markers[markerIndex])
              markers.splice(markerIndex, 1)
            }
            markerGroup.geometries.splice(markerIndex, 1)
          }
        })

        // 移除 marker 实例
        markersToRemove.forEach(marker => {
          if (marker && marker.remove) {
            marker.remove()
          }
        })

        return true
      },

      // 更新样式的方法 - 参照腾讯地图实现（DOM 标记点不支持样式更新）
      updateStyles: (newStyles) => {
        console.warn('DOM 标记点不支持样式更新，请使用样式图标标记点')
        return false
      },

      // 获取特定标记点的方法 - 参照腾讯地图实现
      getMarker: (markerId) => {
        return markerGroup.geometries.find(geo => geo.id === markerId)
      },

      // 获取所有几何数据的方法 - 参照腾讯地图实现
      getGeometries: () => {
        return markerGroup.geometries
      },

      // 移除方法 - 参照腾讯地图实现
      remove: () => {
        markers.forEach(marker => marker.remove())
        if (self.map.getLayer(layerId)) {
          self.map.removeLayer(layerId)
        }
        if (self.map.getSource(sourceId)) {
          self.map.removeSource(sourceId)
        }
        // 从标记点列表中移除
        self.markers.delete(options.id)
      },

      // HTMap 标准方法 - 兼容 HTMap.Markers 类
      removeMarkers: () => {
        markers.forEach(marker => marker.remove())
        if (self.map?.getLayer(layerId)) {
          self.map.removeLayer(layerId)
        }
        if (self.map?.getSource(sourceId)) {
          self.map.removeSource(sourceId)
        }
        // 从标记点列表中移除
        self.markers.delete(options.id)
      },

      // 设置可见性
      setVisible: (visible) => {
        const visibility = visible ? 'visible' : 'none'
        if (self.map.getLayer(layerId)) {
          self.map.setLayoutProperty(layerId, 'visibility', visibility)
        }
        markers.forEach(marker => {
          marker.getElement().style.display = visible ? 'block' : 'none'
        })
      },

      // 事件管理器引用
      eventManager: eventManager
    }

    // 将标记组添加到列表中 - 参照腾讯地图实现
    self.markers.set(options.id, markerGroup)

    console.log(`✅ 成功添加标记组 ${options.id}，包含 ${normalizedGeometries.length} 个标记点`)
    return markerGroup
  }
  /**
   * 使用样式图标方式添加标记点
   * @param {object} options - 标记点配置
   * @param {string} sourceId - 数据源ID
   * @param {string} layerId - 图层ID
   * @param {object} geojsonData - GeoJSON数据
   * @param {Array} normalizedGeometries - 标准化后的几何数据
   * @returns {object} 标记点实例
   * @private
   */
  async #addMarkersWithStyles(options, sourceId, layerId, geojsonData, normalizedGeometries) {
    // 筛选出可拖拽 和不可拖拽的
    const self = this // 保存 MapboxGL 实例的引用
    const styles = options.styles || []
    const createdLayers = [] // 记录创建的图层ID

    // 创建拖动事件管理器（用于 draggable 模式）- 包含所有事件类型
    const dragEventListeners = {
      // 拖拽事件
      dragstart: [],
      drag: [],
      dragend: [],
      // 点击事件
      click: [],
      dblclick: [],
      // 鼠标事件
      mouseenter: [],
      mouseleave: [],
      mouseover: [],
      mouseout: [],
      mousedown: [],
      mouseup: [],
      mousemove: [],
      // 右键菜单事件
      contextmenu: []
    }

    // 为每个样式创建图标和图层
    // 预加载所有图标，然后再创建图层
    const iconLoadPromises = styles.map((style, index) => {
      return new Promise((resolve, reject) => {
        const iconId = `${options.id}-icon-${style.id || index}`

        // 如果图标已存在，直接resolve
        if (self.map.hasImage(iconId)) {
          resolve({ iconId, width: style.width || 32, height: style.height || 32 })
          return
        }

        const img = new Image()
        img.onload = () => {
          try {
            if (!self.map.hasImage(iconId)) {
              self.map.addImage(iconId, img)
            }
            resolve({ iconId, width: img.width, height: img.height, style })
          } catch (error) {
            reject(error)
          }
        }
        img.onerror = reject
        img.src = style.src || '/src/utils/HTMap/assets/img/defaultPin.png'
      })
    })

    // 等待所有图标加载完成后再创建图层
    await Promise.all(iconLoadPromises).then(loadedIcons => {
      // 如果启用拖拽功能，创建拖拽标记点而不创建图层
      if (options.draggable) {
        normalizedGeometries.forEach(geometry => {
          // 获取对应的样式配置
          const geometryStyle = styles.find(style => style.id === geometry.styleId) || styles[0] || {}
          const markerElement = document.createElement('div')
          markerElement.style.width = `${geometryStyle.width || 32}px`
          markerElement.style.height = `${geometryStyle.height || 32}px`
          markerElement.style.backgroundImage = `url(${geometryStyle.src || '/src/utils/HTMap/assets/img/defaultPin.png'})`
          markerElement.style.backgroundSize = 'contain'
          markerElement.style.backgroundRepeat = 'no-repeat'
          markerElement.style.cursor = 'grab'
          markerElement.style.pointerEvents = 'auto'
          markerElement.className = 'ht-map-marker ht-map-marker-draggable'

          // 应用偏移量
          const offset = geometryStyle.offset || [0, 0]

          const draggableMarker = new mapboxgl.Marker({
            element: markerElement,
            draggable: true,
            anchor: options.anchor || geometryStyle.anchor || 'bottom',
            offset: offset
          })
            .setLngLat(self._transformCoordinates(geometry.lngLat, 'addMarkers可拖拽标记点'))
            .addTo(self.map)

          // 创建事件数据格式化函数
          const createDragEventData = (eventType, lngLat) => {
            // 转换坐标回 GCJ02（如果启用了坐标转换）
            const gcj02Coords = CoordinateTransform.wgs84ToGcj02(lngLat.lng, lngLat.lat)
            return {
              // 基本信息
              type: eventType,
              geometry: geometry,
              // mapMarkerEvents 兼容格式
              lngLat: {
                lng: gcj02Coords[0],
                lat: gcj02Coords[1]
              },
              point: {
                x: 0,
                y: 0
              },
              timestamp: Date.now(),
              target: {
                properties: geometry.properties || {}
              },
              markerInstance: draggableMarker
            }
          }

          // 创建 DOM 事件数据格式化函数
          const createDomEventData = (event, eventType) => {
            const lngLat = draggableMarker.getLngLat()
            const gcj02Coords = CoordinateTransform.wgs84ToGcj02(lngLat.lng, lngLat.lat)
            return {
              // 基本信息
              type: eventType,
              geometry: geometry,
              event: event,
              element: markerElement,
              // mapMarkerEvents 兼容格式
              lngLat: {
                lng: gcj02Coords[0],
                lat: gcj02Coords[1]
              },
              point: {
                x: event.clientX || 0,
                y: event.clientY || 0
              },
              timestamp: Date.now(),
              target: {
                properties: geometry.properties || {}
              },
              markerInstance: draggableMarker,
              originalEvent: event
            }
          }

          // 绑定 DOM 事件监听器（点击、鼠标等事件）
          // 点击事件
          markerElement.addEventListener('click', (e) => {
            e.stopPropagation()
            const eventData = createDomEventData(e, 'click')
            
            // 触发通过 options 传入的回调
            if (options.onClick || options.onclick) {
              const callback = options.onClick || options.onclick
              callback(eventData)
            }
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.click.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('click 事件回调执行错误:', error)
              }
            })
          })

          // 双击事件
          markerElement.addEventListener('dblclick', (e) => {
            e.stopPropagation()
            const eventData = createDomEventData(e, 'dblclick')
            
            // 触发通过 options 传入的回调
            if (options.onDblClick || options.ondblclick) {
              const callback = options.onDblClick || options.ondblclick
              callback(eventData)
            }
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.dblclick.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('dblclick 事件回调执行错误:', error)
              }
            })
          })

          // 鼠标进入事件
          markerElement.addEventListener('mouseenter', (e) => {
            const eventData = createDomEventData(e, 'mouseenter')
            
            // 触发通过 options 传入的回调
            if (options.onMouseEnter || options.onMouseover || options.onmouseover) {
              const callback = options.onMouseEnter || options.onMouseover || options.onmouseover
              callback(eventData)
            }
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.mouseenter.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('mouseenter 事件回调执行错误:', error)
              }
            })
          })

          // 鼠标离开事件
          markerElement.addEventListener('mouseleave', (e) => {
            const eventData = createDomEventData(e, 'mouseleave')
            
            // 触发通过 options 传入的回调
            if (options.onMouseLeave || options.onMouseout || options.onmouseout) {
              const callback = options.onMouseLeave || options.onMouseout || options.onmouseout
              callback(eventData)
            }
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.mouseleave.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('mouseleave 事件回调执行错误:', error)
              }
            })
          })

          // 鼠标悬停事件
          markerElement.addEventListener('mouseover', (e) => {
            const eventData = createDomEventData(e, 'mouseover')
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.mouseover.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('mouseover 事件回调执行错误:', error)
              }
            })
          })

          // 鼠标移出事件
          markerElement.addEventListener('mouseout', (e) => {
            const eventData = createDomEventData(e, 'mouseout')
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.mouseout.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('mouseout 事件回调执行错误:', error)
              }
            })
          })

          // 鼠标按下事件
          markerElement.addEventListener('mousedown', (e) => {
            const eventData = createDomEventData(e, 'mousedown')
            
            // 触发通过 options 传入的回调
            if (options.onMouseDown || options.onmousedown) {
              const callback = options.onMouseDown || options.onmousedown
              callback(eventData)
            }
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.mousedown.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('mousedown 事件回调执行错误:', error)
              }
            })
          })

          // 鼠标释放事件
          markerElement.addEventListener('mouseup', (e) => {
            const eventData = createDomEventData(e, 'mouseup')
            
            // 触发通过 options 传入的回调
            if (options.onMouseUp || options.onmouseup) {
              const callback = options.onMouseUp || options.onmouseup
              callback(eventData)
            }
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.mouseup.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('mouseup 事件回调执行错误:', error)
              }
            })
          })

          // 鼠标移动事件
          markerElement.addEventListener('mousemove', (e) => {
            const eventData = createDomEventData(e, 'mousemove')
            
            // 触发通过 options 传入的回调
            if (options.onMouseMove || options.onmousemove) {
              const callback = options.onMouseMove || options.onmousemove
              callback(eventData)
            }
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.mousemove.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('mousemove 事件回调执行错误:', error)
              }
            })
          })

          // 右键菜单事件
          markerElement.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            const eventData = createDomEventData(e, 'contextmenu')
            
            // 触发通过 options 传入的回调
            if (options.onContextMenu || options.oncontextmenu || options.onRightClick) {
              const callback = options.onContextMenu || options.oncontextmenu || options.onRightClick
              callback(eventData)
            }
            
            // 触发通过 on() 方法绑定的回调
            dragEventListeners.contextmenu.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('contextmenu 事件回调执行错误:', error)
              }
            })
          })

          // 绑定拖拽事件
          draggableMarker.on('dragstart', () => {
            markerElement.style.cursor = 'grabbing'
            const eventData = createDragEventData('dragstart', draggableMarker.getLngLat())

            // 触发通过 options 传入的回调
            if (options.onDragStart) {
              options.onDragStart(eventData)
            }

            // 触发通过 on() 方法绑定的回调
            dragEventListeners.dragstart.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('dragstart 事件回调执行错误:', error)
              }
            })
          })

          draggableMarker.on('drag', () => {
            const eventData = createDragEventData('drag', draggableMarker.getLngLat())

            // 触发通过 options 传入的回调
            if (options.onDrag) {
              options.onDrag(eventData)
            }

            // 触发通过 on() 方法绑定的回调
            dragEventListeners.drag.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('drag 事件回调执行错误:', error)
              }
            })
          })

          draggableMarker.on('dragend', () => {
            markerElement.style.cursor = 'grab'
            const newLngLat = draggableMarker.getLngLat()

            // 更新几何数据 - 需要反向转换回GCJ02供外部使用
            const wgs84Coords = [newLngLat.lng, newLngLat.lat]
            geometry.lngLat = newLngLat

            // 更新数据源
            const updatedFeatures = geojsonData.features.map(feature => {
              if (feature.id === geometry.id) {
                return {
                  ...feature,
                  geometry: {
                    type: 'Point',
                    coordinates: [newLngLat.lng, newLngLat.lat]
                  }
                }
              }
              return feature
            })

            self.map.getSource(sourceId).setData({
              ...geojsonData,
              features: updatedFeatures
            })

            const eventData = createDragEventData('dragend', newLngLat)

            // 触发通过 options 传入的回调
            if (options.onDragEnd) {
              options.onDragEnd(eventData)
            }

            // 触发通过 on() 方法绑定的回调
            dragEventListeners.dragend.forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                console.error('dragend 事件回调执行错误:', error)
              }
            })
          })

          // 存储拖拽标记点引用
          if (!self.draggableMarkers) {
            self.draggableMarkers = new Map()
          }
          self.draggableMarkers.set(geometry.id, draggableMarker)
        })
      } else {
        // 非拖拽模式，创建图层
        loadedIcons.forEach((iconInfo, index) => {
          const style = styles[index]
          const styleLayerId = `${layerId}-style-${style.id || index}`

          // 计算正确的 icon-size
          const iconSize = (style.width / iconInfo.width) || 1

          // 创建图层，直接使用正确的 icon-size
          self.map.addLayer({
            id: styleLayerId,
            type: 'symbol',
            source: sourceId,
            filter: ['==', ['get', 'styleId'], style.id || `style_${index}`],
            layout: {
              'icon-image': iconInfo.iconId,
              'icon-offset': style.offset || [0, 0],
              'icon-size': iconSize, // 直接设置正确的大小
              'icon-anchor': options.anchor || style.anchor || 'bottom',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-rotation-alignment': style.faceForward === 'lieFlat' ? 'map' : 'viewport',
              'icon-rotate': ['case',
                ['has', 'rotation'],
                ['get', 'rotation'],
                style.rotation || 0
              ]
            },
            minzoom: options.minZoom||0,  // 最小缩放级别（当地图缩放到 >=5 时显示）
            maxzoom: options.maxZoom||24,  // 最大缩放级别（当地图缩放到 <=10 时显示）
            paint: {
              'icon-opacity': style.opacity || 1
            }
          })

          createdLayers.push(styleLayerId)
        })
      }
    }).catch(error => {
      console.error('MapboxGL.addMarkersWithStyles: 图标加载失败:', error)
    })

    // 创建事件管理器（样式图标方式不需要 Marker 实例）
    // 为每个图层创建事件管理器
    const eventManagers = createdLayers.map(layerId =>
      this._createMarkerEventManager(layerId, sourceId, normalizedGeometries, null)
    )

    // 创建标记组对象 - 完全参照腾讯地图实现
    const markerGroup = {
      id: options.id,
      sourceId,
      layerId: createdLayers, // 现在是图层数组
      geometries: normalizedGeometries,
      styles: styles,
      draggable: options.draggable || false,

      // 事件绑定方法 - 仿照腾讯地图实现
      bindEvents: (eventHandlers) => {
        eventManagers.forEach(eventManager => {
          if (eventManager) {
            eventManager.bindEvents(eventHandlers)
          }
        })
      },

      // 事件监听器方法 - 支持 markers.on('click', fun) 方式调用
      on: (event, callback) => {
        // 如果处于拖拽模式，所有事件都使用拖动事件管理器
        if (options.draggable && dragEventListeners[event]) {
          if (!dragEventListeners[event].includes(callback)) {
            dragEventListeners[event].push(callback)
          }
        } else {
          // 非拖拽模式使用标准事件管理器
          eventManagers.forEach(eventManager => {
            if (eventManager) {
              eventManager.on(event, callback)
            }
          })
        }
      },
      off: (event, callback) => {
        // 如果处于拖拽模式，所有事件都使用拖动事件管理器
        if (options.draggable && dragEventListeners[event]) {
          const index = dragEventListeners[event].indexOf(callback)
          if (index > -1) {
            dragEventListeners[event].splice(index, 1)
          }
        } else {
          // 非拖拽模式使用标准事件管理器
          eventManagers.forEach(eventManager => {
            if (eventManager) {
              eventManager.off(event, callback)
            }
          })
        }
      },
      once: (event, callback) => {
        // 如果处于拖拽模式，所有事件都使用拖动事件管理器
        if (options.draggable && dragEventListeners[event]) {
          const onceCallback = (data) => {
            callback(data)
            // 执行一次后移除
            const index = dragEventListeners[event].indexOf(onceCallback)
            if (index > -1) {
              dragEventListeners[event].splice(index, 1)
            }
          }
          dragEventListeners[event].push(onceCallback)
        } else {
          // 非拖拽模式使用标准事件管理器
          eventManagers.forEach(eventManager => {
            if (eventManager) {
              eventManager.once(event, callback)
            }
          })
        }
      },

      // 更新几何数据的方法 - 参照腾讯地图实现
      updateMarkersGeometries: (newGeometries) => {
        if (!Array.isArray(newGeometries)) return false

        const updatedGeometries = newGeometries.map(geo => {
          if (!geo.lngLat || !Array.isArray(geo.lngLat) || geo.lngLat.length < 2) {
            console.warn(`updateGeometries: 几何数据 ${geo.id} 坐标无效，跳过`)
            return null
          }

          return {
            id: geo.id,
            lngLat: geo.lngLat,
            properties: {...geo.properties, styleId: geo.styleId} || {},
            styleId: geo.styleId
          }
        }).filter(Boolean)

        if (updatedGeometries.length > 0) {
          // 如果是拖拽模式，更新拖拽标记点的位置和样式
          if (options.draggable && self.draggableMarkers) {
            updatedGeometries.forEach(geo => {
              const draggableMarker = self.draggableMarkers.get(geo.id)
              if (draggableMarker) {
                // 查找旧的几何数据，检查 styleId 是否改变
                const oldGeometry = markerGroup.geometries.find(g => g.id === geo.id)
                const styleChanged = oldGeometry && oldGeometry.styleId !== geo.styleId

                // 转换坐标并更新拖拽标记点位置
                const transformedCoords = self._transformCoordinates(geo.lngLat, 'updateMarkersGeometries')
                draggableMarker.setLngLat(transformedCoords)

                // 如果样式ID改变，更新标记点的样式
                if (styleChanged && geo.styleId) {
                  const newStyle = styles.find(style => style.id === geo.styleId)
                  if (newStyle) {
                    const markerElement = draggableMarker.getElement()
                    if (markerElement) {
                      // 更新样式
                      markerElement.style.width = `${newStyle.width || 32}px`
                      markerElement.style.height = `${newStyle.height || 32}px`
                      markerElement.style.backgroundImage = `url(${newStyle.src || '/src/utils/HTMap/assets/img/defaultPin.png'})`

                      // 更新锚点（如果有）
                      if (newStyle.anchor && newStyle.anchor !== (options.anchor || oldGeometry.anchor)) {
                        // MapboxGL 不支持动态改变 anchor，需要重新创建 marker
                        console.warn(`MapboxGL.updateMarkersGeometries: anchor 改变需要重新创建标记点 ${geo.id}`)
                      }

                      console.log(`MapboxGL.updateMarkersGeometries: 更新了拖拽标记点 ${geo.id} 的样式 (styleId: ${geo.styleId})`)
                    }
                  } else {
                    console.warn(`MapboxGL.updateMarkersGeometries: 找不到样式 ${geo.styleId}`)
                  }
                }

                console.log(`MapboxGL.updateMarkersGeometries: 更新了拖拽标记点 ${geo.id} 的位置`)
              }
            })
          }

          // 更新几何数据
          markerGroup.geometries = updatedGeometries

          // 更新数据源
          const geojsonData = {
            type: 'FeatureCollection',
            features: updatedGeometries.map(geo => ({
              type: 'Feature',
              id: geo.id,
              geometry: {
                type: 'Point',
                coordinates: self._transformCoordinates(geo.lngLat, 'updateMarkersGeometries-GeoJSON')
              },
              properties: geo.properties || {}
            }))
          }

          if (self.map.getSource(sourceId)) {
            self.map.getSource(sourceId).setData(geojsonData)
            return true
          }
        }
        return false
      },

      // 更新样式的方法 - 参照腾讯地图实现
      updateStyles: (newStyles) => {
        if (!Array.isArray(newStyles)) return false

        const updatedStyleMap = {}
        newStyles.forEach(style => {
          if (style.id && style.src) {
            updatedStyleMap[style.id] = style
          }
        })

        if (Object.keys(updatedStyleMap).length > 0) {
          // 更新图层样式
          if (self.map.getLayer(layerId)) {
            self.map.setLayoutProperty(layerId, 'icon-image', updatedStyleMap[Object.keys(updatedStyleMap)[0]].src)
          }
          return true
        }
        return false
      },

      // 添加几何数据的方法 - 参照腾讯地图实现
      addGeometries: (newGeometries) => {
        if (!Array.isArray(newGeometries)) return false

        const validatedGeometries = newGeometries.map(geo => {
          if (!geo.lngLat || !Array.isArray(geo.lngLat) || geo.lngLat.length < 2) {
            console.warn(`addGeometries: 几何数据 ${geo.id} 坐标无效，跳过`)
            return null
          }

          return {
            id: geo.id,
            lngLat: geo.lngLat,
            properties: geo.properties || {},
            styleId: geo.styleId || null
          }
        }).filter(Boolean)

        if (validatedGeometries.length > 0) {
          // 更新几何数据
          markerGroup.geometries.push(...validatedGeometries)

          // 重新构建 GeoJSON 数据
          const updatedGeojsonData = {
            type: 'FeatureCollection',
            features: markerGroup.geometries.map(geometry => ({
              type: 'Feature',
              id: geometry.id,
              geometry: {
                type: 'Point',
                coordinates: self._transformCoordinates(geometry.lngLat, 'addGeometries-GeoJSON')
              },
              properties: {
                ...geometry.properties,
                styleId: geometry.styleId
              }
            }))
          }

          // 更新数据源
          if (self.map.getSource(sourceId)) {
            self.map.getSource(sourceId).setData(updatedGeojsonData)
          }

          // 如果是拖拽模式，为新增的几何数据创建拖拽 Marker 实例
          if (options.draggable && self.draggableMarkers) {
            validatedGeometries.forEach(geometry => {
              // 检查是否已经存在该标记点
              if (!self.draggableMarkers.has(geometry.id)) {
                // 获取对应的样式配置
                const geometryStyle = styles.find(style => style.id === geometry.styleId) || styles[0] || {}

                const markerElement = document.createElement('div')
                markerElement.style.width = `${geometryStyle.width || 32}px`
                markerElement.style.height = `${geometryStyle.height || 32}px`
                markerElement.style.backgroundImage = `url(${geometryStyle.src || '/src/utils/HTMap/assets/img/defaultPin.png'})`
                markerElement.style.backgroundSize = 'contain'
                markerElement.style.backgroundRepeat = 'no-repeat'
                markerElement.style.cursor = 'grab'
                markerElement.style.pointerEvents = 'auto'
                markerElement.className = 'ht-map-marker ht-map-marker-draggable'

                // 应用偏移量 - 优先使用options.offset，然后是geometryStyle.offset
                const offset = geometryStyle.offset || [0, 0]

                const draggableMarker = new mapboxgl.Marker({
                  element: markerElement,
                  draggable: true,
                  anchor: options.anchor || geometryStyle.anchor || 'bottom',
                  offset: offset
                })
                  .setLngLat(self._transformCoordinates(geometry.lngLat, 'addGeometries可拖拽标记点'))
                  .addTo(self.map)

                // 创建事件数据格式化函数（用于新增的标记点）
                const createDragEventData = (eventType, lngLat) => {
                  // 转换坐标回 GCJ02（如果启用了坐标转换）
                  const gcj02Coords = CoordinateTransform.wgs84ToGcj02(lngLat.lng, lngLat.lat)

                  return {
                    // 基本信息
                    type: eventType,
                    geometry: geometry,
                    // mapMarkerEvents 兼容格式
                    lngLat: {
                      lng: gcj02Coords[0],
                      lat: gcj02Coords[1]
                    },
                    point: {
                      x: 0,
                      y: 0
                    },
                    timestamp: Date.now(),
                    target: {
                      properties: geometry.properties || {}
                    },
                    markerInstance: draggableMarker
                  }
                }

                // 创建 DOM 事件数据格式化函数
                const createDomEventData = (event, eventType) => {
                  const lngLat = draggableMarker.getLngLat()
                  const gcj02Coords = CoordinateTransform.wgs84ToGcj02(lngLat.lng, lngLat.lat)
                  return {
                    // 基本信息
                    type: eventType,
                    geometry: geometry,
                    event: event,
                    element: markerElement,
                    // mapMarkerEvents 兼容格式
                    lngLat: {
                      lng: gcj02Coords[0],
                      lat: gcj02Coords[1]
                    },
                    point: {
                      x: event.clientX || 0,
                      y: event.clientY || 0
                    },
                    timestamp: Date.now(),
                    target: {
                      properties: geometry.properties || {}
                    },
                    markerInstance: draggableMarker,
                    originalEvent: event
                  }
                }

                // 绑定 DOM 事件监听器（点击、鼠标等事件）
                // 点击事件
                markerElement.addEventListener('click', (e) => {
                  e.stopPropagation()
                  const eventData = createDomEventData(e, 'click')
                  
                  // 触发通过 options 传入的回调
                  if (options.onClick || options.onclick) {
                    const callback = options.onClick || options.onclick
                    callback(eventData)
                  }
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.click.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('click 事件回调执行错误:', error)
                    }
                  })
                })

                // 双击事件
                markerElement.addEventListener('dblclick', (e) => {
                  e.stopPropagation()
                  const eventData = createDomEventData(e, 'dblclick')
                  
                  // 触发通过 options 传入的回调
                  if (options.onDblClick || options.ondblclick) {
                    const callback = options.onDblClick || options.ondblclick
                    callback(eventData)
                  }
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.dblclick.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('dblclick 事件回调执行错误:', error)
                    }
                  })
                })

                // 鼠标进入事件
                markerElement.addEventListener('mouseenter', (e) => {
                  const eventData = createDomEventData(e, 'mouseenter')
                  
                  // 触发通过 options 传入的回调
                  if (options.onMouseEnter || options.onMouseover || options.onmouseover) {
                    const callback = options.onMouseEnter || options.onMouseover || options.onmouseover
                    callback(eventData)
                  }
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.mouseenter.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('mouseenter 事件回调执行错误:', error)
                    }
                  })
                })

                // 鼠标离开事件
                markerElement.addEventListener('mouseleave', (e) => {
                  const eventData = createDomEventData(e, 'mouseleave')
                  
                  // 触发通过 options 传入的回调
                  if (options.onMouseLeave || options.onMouseout || options.onmouseout) {
                    const callback = options.onMouseLeave || options.onMouseout || options.onmouseout
                    callback(eventData)
                  }
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.mouseleave.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('mouseleave 事件回调执行错误:', error)
                    }
                  })
                })

                // 鼠标悬停事件
                markerElement.addEventListener('mouseover', (e) => {
                  const eventData = createDomEventData(e, 'mouseover')
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.mouseover.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('mouseover 事件回调执行错误:', error)
                    }
                  })
                })

                // 鼠标移出事件
                markerElement.addEventListener('mouseout', (e) => {
                  const eventData = createDomEventData(e, 'mouseout')
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.mouseout.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('mouseout 事件回调执行错误:', error)
                    }
                  })
                })

                // 鼠标按下事件
                markerElement.addEventListener('mousedown', (e) => {
                  const eventData = createDomEventData(e, 'mousedown')
                  
                  // 触发通过 options 传入的回调
                  if (options.onMouseDown || options.onmousedown) {
                    const callback = options.onMouseDown || options.onmousedown
                    callback(eventData)
                  }
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.mousedown.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('mousedown 事件回调执行错误:', error)
                    }
                  })
                })

                // 鼠标释放事件
                markerElement.addEventListener('mouseup', (e) => {
                  const eventData = createDomEventData(e, 'mouseup')
                  
                  // 触发通过 options 传入的回调
                  if (options.onMouseUp || options.onmouseup) {
                    const callback = options.onMouseUp || options.onmouseup
                    callback(eventData)
                  }
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.mouseup.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('mouseup 事件回调执行错误:', error)
                    }
                  })
                })

                // 鼠标移动事件
                markerElement.addEventListener('mousemove', (e) => {
                  const eventData = createDomEventData(e, 'mousemove')
                  
                  // 触发通过 options 传入的回调
                  if (options.onMouseMove || options.onmousemove) {
                    const callback = options.onMouseMove || options.onmousemove
                    callback(eventData)
                  }
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.mousemove.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('mousemove 事件回调执行错误:', error)
                    }
                  })
                })

                // 右键菜单事件
                markerElement.addEventListener('contextmenu', (e) => {
                  e.preventDefault()
                  const eventData = createDomEventData(e, 'contextmenu')
                  
                  // 触发通过 options 传入的回调
                  if (options.onContextMenu || options.oncontextmenu || options.onRightClick) {
                    const callback = options.onContextMenu || options.oncontextmenu || options.onRightClick
                    callback(eventData)
                  }
                  
                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.contextmenu.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('contextmenu 事件回调执行错误:', error)
                    }
                  })
                })

                // 绑定拖拽事件
                draggableMarker.on('dragstart', () => {
                  markerElement.style.cursor = 'grabbing'
                  const eventData = createDragEventData('dragstart', draggableMarker.getLngLat())

                  // 触发通过 options 传入的回调
                  if (options.onDragStart) {
                    options.onDragStart(eventData)
                  }

                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.dragstart.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('dragstart 事件回调执行错误:', error)
                    }
                  })
                })

                draggableMarker.on('drag', () => {
                  const eventData = createDragEventData('drag', draggableMarker.getLngLat())

                  // 触发通过 options 传入的回调
                  if (options.onDrag) {
                    options.onDrag(eventData)
                  }

                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.drag.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('drag 事件回调执行错误:', error)
                    }
                  })
                })

                draggableMarker.on('dragend', () => {
                  markerElement.style.cursor = 'grab'
                  const newLngLat = draggableMarker.getLngLat()

                  // 更新几何数据
                  const wgs84Coords = [newLngLat.lng, newLngLat.lat]
                  geometry.lngLat = newLngLat

                  // 更新数据源
                  const updatedFeatures = updatedGeojsonData.features.map(feature => {
                    if (feature.id === geometry.id) {
                      return {
                        ...feature,
                        geometry: {
                          type: 'Point',
                          coordinates: [newLngLat.lng, newLngLat.lat]
                        }
                      }
                    }
                    return feature
                  })

                  self.map.getSource(sourceId).setData({
                    ...updatedGeojsonData,
                    features: updatedFeatures
                  })

                  const eventData = createDragEventData('dragend', newLngLat)

                  // 触发通过 options 传入的回调
                  if (options.onDragEnd) {
                    options.onDragEnd(eventData)
                  }

                  // 触发通过 on() 方法绑定的回调
                  dragEventListeners.dragend.forEach(callback => {
                    try {
                      callback(eventData)
                    } catch (error) {
                      console.error('dragend 事件回调执行错误:', error)
                    }
                  })
                })

                // 存储拖拽标记点引用
                self.draggableMarkers.set(geometry.id, draggableMarker)
                console.log(`MapboxGL.addGeometries: 为新增几何数据 ${geometry.id} 创建了拖拽标记点`)
              }
            })
          }

          return true
        }
        return false
      },

      // 删除几何数据的方法 - 参照腾讯地图实现
      removeGeometries: (idsToDelete) => {
        if (!Array.isArray(idsToDelete)) return false

        // 如果是拖拽模式，先删除对应的拖拽 Marker 实例
        if (options.draggable && self.draggableMarkers) {
          idsToDelete.forEach(id => {
            const draggableMarker = self.draggableMarkers.get(id)
            if (draggableMarker && typeof draggableMarker.remove === 'function') {
              draggableMarker.remove()
              self.draggableMarkers.delete(id)
              console.log(`MapboxGL.removeGeometries: 删除了拖拽标记点 ${id}`)
            }
          })
        }

        // 过滤掉要删除的几何数据
        markerGroup.geometries = markerGroup.geometries.filter(geo => !idsToDelete.includes(geo.id))

        // 重新构建 GeoJSON 数据
        const updatedGeojsonData = {
          type: 'FeatureCollection',
          features: markerGroup.geometries.map(geometry => ({
            type: 'Feature',
            id: geometry.id,
            geometry: {
              type: 'Point',
              coordinates: self._transformCoordinates(geometry.lngLat, 'updateGeometries-GeoJSON')
            },
            properties: {
              ...geometry.properties,
              styleId: geometry.styleId
            }
          }))
        }

        // 更新数据源
        if (self.map.getSource(sourceId)) {
          self.map.getSource(sourceId).setData(updatedGeojsonData)
        }
        return true
      },

      // 获取特定标记点的方法 - 参照腾讯地图实现
      getMarker: (markerId) => {
        return markerGroup.geometries.find(geo => geo.id === markerId)
      },

      // 获取所有几何数据的方法 - 参照腾讯地图实现
      getGeometries: () => {
        return markerGroup.geometries
      },

      // 移除方法 - 参照腾讯地图实现
      remove: () => {
        // 移除所有拖拽标记点
        if (options.draggable && self.draggableMarkers) {
          normalizedGeometries.forEach(geometry => {
            const draggableMarker = self.draggableMarkers.get(geometry.id)
            if (draggableMarker && typeof draggableMarker.remove === 'function') {
              draggableMarker.remove()
            }
            self.draggableMarkers.delete(geometry.id)
          })
        }

        // 移除所有图层
        createdLayers.forEach(layerId => {
          if (self.map.getLayer(layerId)) {
            self.map.removeLayer(layerId)
          }
        })
        // 移除数据源
        if (self.map.getSource(sourceId)) {
          self.map.removeSource(sourceId)
        }
        // 移除所有图标
        styles.forEach((style, index) => {
          const iconId = `${options.id}-icon-${style.id || index}`
          if (self.map.hasImage(iconId)) {
            self.map.removeImage(iconId)
          }
        })
        // 从标记点列表中移除
        self.markers.delete(options.id)
      },

      // HTMap 标准方法 - 兼容 HTMap.Markers 类
      removeMarkers: () => {
        // 移除所有拖拽标记点
        if (options.draggable && self.draggableMarkers) {
          normalizedGeometries.forEach(geometry => {
            const draggableMarker = self.draggableMarkers.get(geometry.id)
            if (draggableMarker && typeof draggableMarker.remove === 'function') {
              draggableMarker.remove()
            }
            self.draggableMarkers.delete(geometry.id)
          })
        }

        // 移除所有图层
        createdLayers.forEach(layerId => {
          if (self.map?.getLayer(layerId)) {
            self.map.removeLayer(layerId)
          }
        })
        // 移除数据源
        if (self.map?.getSource(sourceId)) {
          self.map.removeSource(sourceId)
        }
        // 移除所有图标
        styles.forEach((style, index) => {
          const iconId = `${options.id}-icon-${style.id || index}`
          if (self.map?.hasImage(iconId)) {
            self.map.removeImage(iconId)
          }
        })
        // 从标记点列表中移除
        self.markers.delete(options.id)

        console.log(`MapboxGL.removeMarkers: 已移除标记组 ${options.id}`)
      },

      // 设置可见性
      setVisible: (visible) => {
        if (options.draggable && self.draggableMarkers) {
          // 拖拽模式下，控制拖拽标记点的可见性
          normalizedGeometries.forEach(geometry => {
            const draggableMarker = self.draggableMarkers.get(geometry.id)
            if (draggableMarker && draggableMarker.getElement) {
              const element = draggableMarker.getElement()
              if (element) {
                element.style.display = visible ? 'block' : 'none'
              }
            }
          })
        } else {
          // 非拖拽模式下，控制图层可见性
          const visibility = visible ? 'visible' : 'none'
          createdLayers.forEach(layerId => {
            if (self.map.getLayer(layerId)) {
              self.map.setLayoutProperty(layerId, 'visibility', visibility)
            }
          })
        }
      },

      // 获取可见性
      getVisible: () => {
        if (options.draggable && self.draggableMarkers) {
          // 拖拽模式下，检查第一个拖拽标记点的可见性
          const firstGeometry = normalizedGeometries[0]
          if (firstGeometry) {
            const draggableMarker = self.draggableMarkers.get(firstGeometry.id)
            if (draggableMarker && draggableMarker.getElement) {
              const element = draggableMarker.getElement()
              return element ? element.style.display !== 'none' : true
            }
          }
          return true
        } else {
          // 非拖拽模式下，检查图层可见性
          if (createdLayers.length > 0 && self.map.getLayer(createdLayers[0])) {
            return self.map.getLayoutProperty(createdLayers[0], 'visibility') !== 'none'
          }
          return true
        }
      },

      // 获取拖拽标记点
      getDraggableMarkers: () => {
        if (!options.draggable || !self.draggableMarkers) {
          return new Map()
        }
        return self.draggableMarkers.map(marker => ({
          ...marker,
          paths: marker.properties?.originPaths || marker.paths  // 优先返回原始坐标
        }))
      },

      // 事件管理器引用
      eventManagers: eventManagers
    }

    // 将标记组添加到列表中 - 参照腾讯地图实现
    self.markers.set(options.id, markerGroup)

    console.log(`✅ 成功添加标记组 ${options.id}，包含 ${normalizedGeometries.length} 个标记点`)
    return markerGroup
  }

  /**
   * 使用默认标记点方式添加标记点
   * @param {object} options - 标记点配置
   * @param {string} sourceId - 数据源ID
   * @param {string} layerId - 图层ID
   * @param {object} geojsonData - GeoJSON数据
   * @param {Array} normalizedGeometries - 标准化后的几何数据
   * @returns {object} 标记点实例
   * @private
   */
  #addMarkersWithDefault(options, sourceId, layerId, geojsonData, normalizedGeometries) {
    const self = this // 保存 MineMap 实例的引用

    // 为每个点创建默认标记点
    const markers = []
    normalizedGeometries.forEach(geometry => {
      const markerOptions = {
        id: geometry.id,
        lngLat: geometry.lngLat,
        ...options.defaultMarkerOptions, // 允许传递默认标记点配置
        ...geometry // 允许每个标记点有自己的配置
      }

      const marker = self.addDomMarker(markerOptions)
      if (marker) {
        markers.push(marker)
      }
    })

    // 创建事件管理器
    const eventManager = self._createMarkerEventManager(layerId, sourceId, normalizedGeometries, markers)

    // 创建标记组对象 - 完全参照腾讯地图实现
    const markerGroup = {
      id: options.id,
      sourceId,
      layerId,
      markers,
      geometries: normalizedGeometries,

      // 事件绑定方法 - 仿照腾讯地图实现
      bindEvents: (eventHandlers) => {
        if (eventManager) {
          eventManager.bindEvents(eventHandlers)
        }
      },

      // 事件监听器方法 - 支持 markers.on('click', fun) 方式调用
      on: (event, callback) => eventManager ? eventManager.on(event, callback) : null,
      off: (event, callback) => eventManager ? eventManager.off(event, callback) : null,
      once: (event, callback) => eventManager ? eventManager.once(event, callback) : null,

      // 更新几何数据的方法 - 参照腾讯地图实现
      updateMarkersGeometries: (newGeometries) => {
        if (!Array.isArray(newGeometries)) return false

        const updatedGeometries = newGeometries.map(geo => {
          if (!geo.lngLat || !Array.isArray(geo.lngLat) || geo.lngLat.length < 2) {
            console.warn(`updateGeometries: 几何数据 ${geo.id} 坐标无效，跳过`)
            return null
          }

          return {
            id: geo.id,
            lngLat: geo.lngLat,
            properties: {...geo.properties, styleId: geo.styleId} || {}
          }
        }).filter(Boolean)

        if (updatedGeometries.length > 0) {
          // 更新数据源
          const geojsonData = {
            type: 'FeatureCollection',
            features: updatedGeometries.map(geo => ({
              type: 'Feature',
              id: geo.id,
              geometry: {
                type: 'Point',
                coordinates: this._transformCoordinates(geo.lngLat, 'addMarkers-GeoJSON')
              },
              properties: geo.properties || {}
            }))
          }

          if (self.map.getSource(sourceId)) {
            self.map.getSource(sourceId).updateData(geojsonData)
            // markerGroup.geometries = updatedGeometries
            return true
          }
        }
        return false
      },

      // 更新样式的方法 - 参照腾讯地图实现（默认标记点不支持样式更新）
      updateStyles: (newStyles) => {
        console.warn('默认标记点不支持样式更新，请使用样式图标标记点')
        return false
      },

      // 获取特定标记点的方法 - 参照腾讯地图实现
      getMarker: (markerId) => {
        return normalizedGeometries.find(geo => geo.id === markerId)
      },

      // 移除方法 - 参照腾讯地图实现
      remove: () => {
        console.log('移除所有标记点');

        markers.forEach(marker => marker.remove())
        if (self.map.getLayer(layerId)) {
          self.map.removeLayer(layerId)
        }
        if (self.map.getSource(sourceId)) {
          self.map.removeSource(sourceId)
        }
        // 从标记点列表中移除
        self.markers.delete(options.id)
      },

      // 设置可见性
      setVisible: (visible) => {
        const visibility = visible ? 'visible' : 'none'
        if (self.map.getLayer(layerId)) {
          self.map.setLayoutProperty(layerId, 'visibility', visibility)
        }
        markers.forEach(marker => {
          marker.setVisible(visible)
        })
      },

      // 事件管理器引用
      eventManager: eventManager
    }

    // 将标记组添加到列表中 - 参照腾讯地图实现
    self.markers.set(options.id, markerGroup)

    console.log(`✅ 成功添加标记组 ${options.id}，包含 ${normalizedGeometries.length} 个标记点`)
    return markerGroup
  }

  /**
   * 添加自定义气泡 - 对接 HTMap 标准接口
   * @param {object} options - 气泡配置
   * @returns {object} 气泡实例
   */
  addPopup(options) {
    // 完全对齐 MineMap.addPopup 的行为
    if (!this.map) return null

    // 将传入参数视为 MineMap 风格的 params
    const params = { ...options }
    // MineMap 默认强制显示关闭按钮
    // params.showCloseBtn = true

    // 验证必要参数（MineMap 要求 lngLat 且为数组）
    if (!params.lngLat || !Array.isArray(params.lngLat) || params.lngLat.length !== 2) {
      console.warn('MapboxGL.addPopup: 缺少或格式错误的 lngLat 参数，应为 [lng, lat] 格式')
      return null
    }

    if (!params.content) {
      console.warn('MapboxGL.addPopup: 缺少内容参数 (content)')
      return null
    }

    try {
      // 统一坐标转换
      const coordinates = this._transformCoordinates(params.lngLat, 'addPopup')
      // const coordinates = params.lngLat

      const popupId = params.id || `popup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 处理偏移量（对象 -> 数组）
      const offsetObj = params.offset || { x: 0, y: 0 }
      const offsetArray = Array.isArray(params.offset)
        ? params.offset
        : [offsetObj.x || 0, offsetObj.y || 0]

      // 创建内容
      const popupContent = this._createPopupContent(params, popupId)

      // 创建 MapboxGL Popup（对齐 MineMap 的默认项）
      const popup = new mapboxgl.Popup({
        closeButton: params.showCloseBtn || false,
        closeOnClick: false,
        closeOnMove: false,
        focusAfterOpen: false,
        offset: offsetArray,
        maxWidth: params.maxWidth || 'none',
        className: params.className || 'ht-map-popup'
      })
        .setLngLat(coordinates) // coordinates已经通过_transformCoordinates转换
        .setDOMContent(popupContent)
        .addTo(this.map)

      // 绑定事件（保持与 MineMap 一致，由 _bindPopupEvents 处理 open/close 回调；on/off 提供 DOM 事件能力）
      this._bindPopupEvents(popup, popupContent, coordinates, params)

      // 存入图层管理
      this.addLayer(popupId, popup)

      // 构建与 MineMap 完全一致的返回对象
      const popupInstance = {
        id: popupId,
        popup: popup,
        element: popupContent,
        lngLat: params.lngLat,
        lng: params.lngLat.lng,
        lat: params.lngLat.lat,
        content: params.content,
        params: params,
        offset: offsetObj
      }

      // MineMap 风格方法
      popupInstance.removePopup = () => {
        if (popup) {
          popup.remove()
          this.layers.delete(popupId)
        }
      }

      popupInstance.setLngLat = (lngLat) => {
        const coords = Array.isArray(lngLat) ? lngLat : [lngLat.lng, lngLat.lat]
        const coordinates = this._transformCoordinates(lngLat, 'addPopup')
        popup.setLngLat(coordinates)
        popupInstance.lngLat = coords
        popupInstance.lng = coords[0]
        popupInstance.lat = coords[1]
      }

      popupInstance.getElement = () => {
        return popupContent
      }

      // HTMap 兼容方法别名
      popupInstance.remove = popupInstance.removePopup
      popupInstance.setPosition = (lng, lat) => {
        const coordinates = this._transformCoordinates([lng, lat], 'addPopup')
        popupInstance.setLngLat(coordinates)
      }
      popupInstance.getPosition = () => coordinates
      popupInstance.setContent = (content) => {
        const newContent = this._createPopupContent({ content }, popupId)
        popup.setDOMContent(newContent)
        popupInstance.element = newContent
        popupInstance.content = content
      }
      popupInstance.setVisible = (visible) => {
        if (visible) {
          popup.addTo(this.map)
        } else {
          popup.remove()
        }
      }
      popupInstance.getVisible = () => popup.isOpen()

      // 事件监听（DOM 事件，与 MineMap 一致）
      popupInstance.on = (event, callback) => {
        if ((event === 'open' || event === 'close') && popup && typeof popup.on === 'function') {
          popup.on(event, callback)
        } else {
          popupContent.addEventListener(event, callback)
        }
      }
      popupInstance.off = (event, callback) => {
        if ((event === 'open' || event === 'close') && popup && typeof popup.off === 'function') {
          popup.off(event, callback)
        } else {
          popupContent.removeEventListener(event, callback)
        }
      }

      // 动态样式（保持精简能力）
      popupInstance.setStyle = (property, value) => {
        if (popupContent && property && value !== undefined) {
          const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
          popupContent.style.setProperty(cssProperty, value)
        }
      }

      popupInstance.setStyles = (styles) => {
        if (popupContent && styles && typeof styles === 'object') {
          Object.keys(styles).forEach(property => {
            const value = styles[property]
            if (value !== undefined && value !== null) {
              const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
              popupContent.style.setProperty(cssProperty, value)
            }
          })
        }
      }

      popupInstance.getStyle = (property) => {
        if (popupContent && property) {
          const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
          return popupContent.style.getPropertyValue(cssProperty) || getComputedStyle(popupContent).getPropertyValue(cssProperty)
        }
        return null
      }

      // 类管理
      popupInstance.addClass = (className) => {
        if (popupContent && className) popupContent.classList.add(className)
      }
      popupInstance.removeClass = (className) => {
        if (popupContent && className) popupContent.classList.remove(className)
      }
      popupInstance.toggleClass = (className) => {
        if (popupContent && className) popupContent.classList.toggle(className)
      }
      popupInstance.hasClass = (className) => {
        return popupContent && className ? popupContent.classList.contains(className) : false
      }

      // 显隐（不销毁 Popup，仅控制内容容器）
      popupInstance.show = () => {
        if (popupContent) {
          popupContent.style.display = 'block'
          popupContent.style.visibility = 'visible'
        }
      }
      popupInstance.hide = () => {
        if (popupContent) {
          popupContent.style.display = 'none'
          popupContent.style.visibility = 'hidden'
        }
      }

      return popupInstance

    } catch (error) {
      console.error('MapboxGL.addPopup: 添加气泡失败:', error)
      return null
    }
  }

  /**
   * 创建气泡内容
   * @param {object} options - 气泡配置
   * @param {string} popupId - 气泡ID
   * @returns {HTMLElement} 气泡内容元素
   * @private
   */
  _createPopupContent(options, popupId) {
    const content = options.content

    // 创建气泡容器
    const popupElement = document.createElement('div')
    popupElement.className = 'ht-map-popup-content'
    popupElement.id = `popup-content-${popupId}`

    // 处理不同类型的内容
    if (typeof content === 'string') {
      // HTML 字符串
      popupElement.innerHTML = content
    } else if (content instanceof HTMLElement) {
      // DOM 元素
      popupElement.appendChild(content)
    } else if (typeof content === 'object' && content.title) {
      // 结构化内容对象
      const title = document.createElement('div')
      title.className = 'ht-map-popup-title'
      title.textContent = content.title
      popupElement.appendChild(title)

      if (content.description) {
        const description = document.createElement('div')
        description.className = 'ht-map-popup-description'
        description.textContent = content.description
        popupElement.appendChild(description)
      }

      if (content.html) {
        const htmlContent = document.createElement('div')
        htmlContent.className = 'ht-map-popup-html'
        htmlContent.innerHTML = content.html
        popupElement.appendChild(htmlContent)
      }
    } else {
      // 默认内容
      popupElement.textContent = '气泡内容'
    }
    // 添加样式
    popupElement.style.cssText = `
      width: auto;
      height: auto;
      min-width: 100px;
      min-height: auto;
      max-width: none;
      max-height: none;
      // padding: 10px;
      // background-color: rgb(255, 255, 255);
      color: rgb(51, 51, 51);
      border-radius: 4px;
      font-size: 14px;
      display: inline-block;
      position: relative;
      overflow: visible;
      box-sizing: border-box;
      // box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      line-height: 1.4;
    `

    return popupElement
  }

  /**
   * 绑定气泡事件
   * @param {object} popup - 气泡实例
   * @param {HTMLElement} element - 气泡内容元素
   * @param {Array} coordinates - 坐标
   * @param {object} options - 气泡配置
   * @private
   */
  _bindPopupEvents(popup, element, coordinates, options) {
    // 绑定点击事件
    if (options.onClick) {
      element.addEventListener('click', (e) => {
        e.stopPropagation()
        options.onClick({
          lngLat: coordinates,
          popup: popup,
          element: element,
          originalEvent: e
        })
      })
    }

    // 绑定关闭事件
    popup.on('close', () => {
      if (options.onClose) {
        options.onClose({
          lngLat: coordinates,
          popup: popup,
          element: element
        })
      }
    })

    // 绑定打开事件
    popup.on('open', () => {
      if (options.onOpen) {
        options.onOpen({
          lngLat: coordinates,
          popup: popup,
          element: element
        })
      }
    })
  }

  /**
   * 添加线条
   * @param {object} options - 线条配置
   * @returns {object} 线条实例
   */
  addLine(options) {
    if (!this.map) return null

    // 生成唯一ID
    const id = options.id || `line_${Date.now()}_${Math.random()}`

    // 处理坐标转换
    const coordinates = this._transformCoordinates(options.path || [], 'addLine')

    // 添加线条数据源
    this.map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }
    })

    // 添加线条图层
    this.map.addLayer({
      id: `${id}_layer`,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': options.strokeColor || '#FF0000',
        'line-width': options.strokeWeight || 3,
        'line-opacity': options.strokeOpacity || 1
      }
    })

    // 创建线条实例对象
    const lineInstance = {
      id: `${id}_layer`,
      source: id,
      remove: () => {
        this.map.removeLayer(`${id}_layer`)
        this.map.removeSource(id)
      }
    }

    this.addLayer(id, lineInstance)

    return {
      id,
      instance: lineInstance,
      remove: () => this.removeLayer(id)
    }
  }

  // ==================== Lines 相关方法 ====================

  /**
   * 批量添加线段 - 支持 HTMap 标准参数格式
   * @param {object} options - 线段配置对象 {map, id, geometries, styles}
   * @returns {object} 线段对象
   */
  addLines(options) {
    if (!this.map) return null

    // 验证必要参数
    if (!options.geometries || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      console.error('MapboxGL.addLines: geometries数组不能为空')
      return null
    }

    if (!options.styles || !Array.isArray(options.styles) || options.styles.length === 0) {
      console.error('MapboxGL.addLines: styles数组不能为空')
      return null
    }

    const sourceId = `${options.id}-source`
    const layerId = `${options.id}-layer`

    try {
      // 验证和标准化样式数据
      const validatedStyles = this._validateLineStyles(options.styles)

      // 验证和标准化几何数据
      const validatedGeometries = this._validateLineGeometries(options.geometries)

      const isCurveByStyleId = id=>validatedStyles.find(style => style.id === id)?.isCurve

      if (validatedGeometries.length === 0) {
        console.error('MapboxGL.addLines: 没有有效的几何数据')
        return null
      }

      // 构建 GeoJSON 数据
      const geojsonData = {
        type: 'FeatureCollection',
        features: validatedGeometries.map(geometry => ({
          type: 'Feature',
          id: geometry.id,
          geometry: {
            type: 'LineString',
            // 根据参数判断是否绘制曲线
            coordinates: isCurveByStyleId(geometry.styleId) ? this._generateCurveFeatures(geometry.paths) : geometry.paths
          },
          properties: {
            ...geometry.properties,
            id: geometry.id,
            styleId: geometry.styleId
          }
        }))
      }

      // 添加数据源
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData,
        dynamic: true
      })

      // 使用第一个样式作为默认样式
      const defaultStyle = validatedStyles[0]

      // 添加线段图层
      // this.map.addLayer({
      //   id: layerId,
      //   type: 'line',
      //   source: sourceId,
      //   layout: {
      //     'line-join': defaultStyle.lineJoin || 'round',
      //     'line-cap': defaultStyle.lineCap || 'round'
      //   },
      //   paint: {
      //     'line-color': defaultStyle.color,
      //     'line-width': defaultStyle.width,
      //     'line-opacity': defaultStyle.opacity || 1,
      //     'line-dasharray': defaultStyle.dashArray && defaultStyle.dashArray.length > 0 ? defaultStyle.dashArray : null
      //   }
      // })

      // 基于样式按 styleId 拆分多图层渲染（支持描边与发光）
      const createdLayers = []
      validatedStyles.forEach((style, idx) => {
        const styleLayerIdBase = `${layerId}-${style.id || idx}`

        // 可选描边层（置于主线层下方）
        if (style.borderColor && Number(style.borderWidth) > 0) {
          const outlineId = `${styleLayerIdBase}-outline`
          this.map.addLayer({
            id: outlineId,
            type: 'line',
            source: sourceId,
            filter: ['==', ['get', 'styleId'], style.id || `line_style_${idx}`],
            layout: {
              'line-join': style.lineJoin || 'round',
              'line-cap': style.lineCap || 'round'
            },
            paint: {
              'line-color': style.borderColor,
              // 外轮廓宽度 = 主线宽度 + 边框宽度（避免过厚）
              'line-width': (Number(style.width) || 6) + (Number(style.borderWidth) || 0),
              'line-opacity': style.opacity != null ? Number(style.opacity) : 1,
              ...(style.emitLight ? { 'line-blur': 1.5 } : {})
            }
          })
          createdLayers.push(outlineId)
        }

        // 主线层
        const mainId = `${styleLayerIdBase}`
        const paint = {
          'line-color': style.color,
          'line-width': Number(style.width) || 6,
          'line-opacity': style.opacity != null ? Number(style.opacity) : 1,
          ...(style.emitLight ? { 'line-blur': 1 } : {})
        }
        // 仅当 dashArray 合法且不全为 0 时设置
        if (Array.isArray(style.dashArray) && style.dashArray.length === 2 &&
          (Number(style.dashArray[0]) !== 0 || Number(style.dashArray[1]) !== 0)) {
          paint['line-dasharray'] = [Number(style.dashArray[0]), Number(style.dashArray[1])]
        }

        this.map.addLayer({
          id: mainId,
          type: 'line',
          source: sourceId,
          filter: ['==', ['get', 'styleId'], style.id || `line_style_${idx}`],
          layout: {
            'line-join': style.lineJoin || 'round',
            'line-cap': style.lineCap || 'round'
          },
          paint
        })
        createdLayers.push(mainId)

        // 如果启用了方向箭头，添加符号图层
        if (style.dirArrows) {
          const arrowId = `${styleLayerIdBase}-arrows`

          // 确保箭头图标已加载
          this._ensureArrowIcon().then(() => {
            this.map.addLayer({
              id: arrowId,
              type: 'symbol',
              source: sourceId,
              filter: ['==', ['get', 'styleId'], style.id || `line_style_${idx}`],
              layout: {
                'icon-allow-overlap': true,
                'icon-image': 'allow',  // 使用默认箭头图标
                'symbol-placement': 'line',
                'icon-size': 0.7,
                'symbol-spacing': style.dirAnimate?.spacing || 100,
                'icon-rotation-alignment': 'map'
              },
              paint: {
                'icon-color': style.color || '#ff0000'
              }
            })
            createdLayers.push(arrowId)
          }).catch(error => {
            console.warn('MapboxGL.addLines: 加载箭头图标失败:', error)
          })
        }
      })

      // 创建线段组对象
      const lineGroup = {
        id: options.id,
        sourceId,
        layerId: createdLayers,
        geometries: validatedGeometries,
        styles: validatedStyles,

        // 事件绑定方法（为每个样式图层绑定）
        on: (eventType, callback) => {
          if (Array.isArray(createdLayers)) {
            createdLayers.forEach(lid => {
              this._bindLineEvents(lid, sourceId, lineGroup.geometries, eventType, callback)
            })
          } else {
            this._bindLineEvents(createdLayers, sourceId, lineGroup.geometries, eventType, callback)
          }
        },

        // 解绑事件方法（简单日志）
        off: (eventType) => {
          console.log(`解绑线段组 ${options.id} 的 ${eventType} 事件`)
        },

        // 添加几何数据方法
        addGeometries: (newGeometries) => {
          const validatedNewGeometries = this._validateLineGeometries(newGeometries)
          if (validatedNewGeometries.length > 0) {
            const updatedGeometries = [...(lineGroup.geometries || []), ...validatedNewGeometries]
            const updatedGeojsonData = {
              type: 'FeatureCollection',
              features: updatedGeometries.map(geometry => ({
                type: 'Feature',
                id: geometry.id,
                geometry: {
                  type: 'LineString',
                  coordinates: isCurveByStyleId(geometry.styleId) ? this._generateCurveFeatures(geometry.paths) : geometry.paths
                },
                properties: {
                  ...geometry.properties,
                  styleId: geometry.styleId
                }
              }))
            }
            if (this.map.getSource(sourceId)) {
              this.map.getSource(sourceId).setData(updatedGeojsonData)
              lineGroup.geometries = updatedGeometries
            }
          }
        },

        // 删除几何数据方法
        removeGeometries: (idsToDelete) => {
          if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) {
            return false
          }
          const prev = lineGroup.geometries || []
          const remainingGeometries = prev.filter(geo => !idsToDelete.includes(geo.id))
          const updatedGeojsonData = {
            type: 'FeatureCollection',
            features: remainingGeometries.map(geometry => ({
              type: 'Feature',
              id: geometry.id,
              geometry: {
                type: 'LineString',
                coordinates: isCurveByStyleId(geometry.styleId) ? this._generateCurveFeatures(geometry.paths) : geometry.paths
              },
              properties: {
                ...geometry.properties,
                styleId: geometry.styleId
              }
            }))
          }
          if (this.map.getSource(sourceId)) {
            this.map.getSource(sourceId).setData(updatedGeojsonData)
            lineGroup.geometries = remainingGeometries
            return true
          }
          return false
        },

        // 更新几何数据方法
        updateLinesGeometries: (updatedGeometries) => {
          const validatedUpdatedGeometries = this._validateLineGeometries(updatedGeometries)
          const updatedGeometriesMap = new Map()
          validatedUpdatedGeometries.forEach(geo => {
            updatedGeometriesMap.set(geo.id, geo)
          })
          const baseGeometries = lineGroup.geometries || []

          // 更新几何数据，如果 styleId 为空则保留原有的 styleId
          const finalGeometries = baseGeometries.map(geo => {
            const updated = updatedGeometriesMap.get(geo.id)
            if (updated) {
              // 如果更新数据没有传 styleId 或者为空，则使用原来的 styleId
              return {
                ...updated,
                styleId: updated.styleId || geo.styleId
              }
            }
            return geo
          })

          const updatedGeojsonData = {
            type: 'FeatureCollection',
            features: finalGeometries.map(geometry => ({
              type: 'Feature',
              id: geometry.id,
              geometry: {
                type: 'LineString',
                coordinates: isCurveByStyleId(geometry.styleId) ? this._generateCurveFeatures(geometry.paths) : geometry.paths
              },
              properties: {
                ...geometry.properties,
                styleId: geometry.styleId
              }
            }))
          }
          if (this.map.getSource(sourceId)) {
            this.map.getSource(sourceId).updateData(updatedGeojsonData)
            lineGroup.geometries = finalGeometries
          }
        },

        // 设置可见性（作用于所有样式图层）
        setVisible: (visible) => {
          const visibility = visible ? 'visible' : 'none'
          ;(Array.isArray(createdLayers) ? createdLayers : [createdLayers]).forEach(lid => {
            if (this.map.getLayer(lid)) {
              this.map.setLayoutProperty(lid, 'visibility', visibility)
            }
          })
        },

        // 获取可见性（任取第一个图层判断）
        getVisible: () => {
          const first = Array.isArray(createdLayers) ? createdLayers[0] : createdLayers
          if (first && this.map.getLayer(first)) {
            const layout = this.map.getLayoutProperty(first, 'visibility')
            return layout !== 'none'
          }
          return false
        },

        // 移除方法（移除所有图层与数据源）
        remove: () => {
          ;(Array.isArray(createdLayers) ? [...createdLayers].reverse() : [createdLayers]).forEach(lid => {
            if (this.map.getLayer(lid)) {
              this.map.removeLayer(lid)
            }
          })
          if (this.map.getSource(sourceId)) {
            this.map.removeSource(sourceId)
          }
        },
        // 兼容 HTMap.Lines 的接口
        removeLines: () => {
          ;(Array.isArray(createdLayers) ? [...createdLayers].reverse() : [createdLayers]).forEach(lid => {
            if (this.map?.getLayer(lid)) {
              this.map.removeLayer(lid)
            }
          })
          if (this.map?.getSource(sourceId)) {
            this.map.removeSource(sourceId)
          }
        },

        // 获取几何数据方法（兼容 Lines 类）
        // 返回原始坐标（originPaths），避免重复转换导致偏移
        getGeometries: () => {
          return lineGroup.geometries.map(geo => ({
            ...geo,
            paths: geo.properties?.originPaths || geo.paths  // 优先返回原始坐标
          }))
        },

        // 获取总长度方法（兼容 Lines 类）
        getTotalLength: () => {
          let totalLength = 0
          ;(lineGroup.geometries || []).forEach(geometry => {
            if (geometry.paths && geometry.paths.length > 1) {
              for (let i = 0; i < geometry.paths.length - 1; i++) {
                const distance = lineGroup._calculateDistance(
                  geometry.paths[i],
                  geometry.paths[i + 1]
                )
                totalLength += distance
              }
            }
          })
          return totalLength
        },

        // 通过ID获取线段距离方法（兼容 Lines 类）
        getLineDistanceById: (geometryId) => {
          const geometry = (lineGroup.geometries || []).find(geo => geo.id === geometryId)
          if (!geometry || !geometry.paths || geometry.paths.length < 2) {
            return 0
          }
          let totalDistance = 0
          for (let i = 0; i < geometry.paths.length - 1; i++) {
            const distance = lineGroup._calculateDistance(
              geometry.paths[i],
              geometry.paths[i + 1]
            )
            totalDistance += distance
          }
          return totalDistance
        },

        // 计算两点之间的距离（使用Haversine公式）
        _calculateDistance: (coord1, coord2) => {
          const R = 6371000 // 地球半径（米）
          const dLat = lineGroup._toRadians(coord2[1] - coord1[1])
          const dLng = lineGroup._toRadians(coord2[0] - coord1[0])
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lineGroup._toRadians(coord1[1])) * Math.cos(lineGroup._toRadians(coord2[1])) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          return R * c
        },

        // 将角度转换为弧度
        _toRadians: (degrees) => {
          return degrees * (Math.PI / 180)
        }
      }

      console.log(`✅ 成功添加线段组 ${options.id}，包含 ${validatedGeometries.length} 条线段`)
      return lineGroup

    } catch (error) {
      console.error('MapboxGL.addLines: 添加线段失败:', error)
      return null
    }
  }

  /**
   * 生成曲线坐标点
   * @param {Array} geometries - 几何数据数组
   * @returns {Array} 曲线坐标点数组
   * @private
   */
  _generateCurveFeatures(geometries) {
    const features = [];
    // 为每个坐标数组生成线段
    for (let i = 0; i < geometries.length - 1; i++) {
      const startPoint = geometries[i];
      const endPoint = geometries[i + 1];

      // 计算两点之间的距离
      const distance = calculateDistance(startPoint, endPoint);

      // 计算控制点（曲线最高点）
      const controlPoint = calculateControlPoint(startPoint, endPoint, distance);

      // 生成曲线坐标点
      const curvePoints = generateCurvePoints(startPoint, endPoint, controlPoint);

      // 创建线段特征
      const feature = {
        type: 'Feature',
        id: geometries[i].id,
        geometry: {
          type: 'LineString',
          coordinates: curvePoints
        },
        properties: {
          ...geometries[i],
        }
      };
      features.push(...curvePoints);
    }
    return features;
  }
  /**
   * 验证和标准化线段样式数据
   * @param {Array} styles - 样式数组
   * @returns {Array} 验证后的样式数组
   * @private
   */
  _validateLineStyles(styles) {
    if (!Array.isArray(styles) || styles.length === 0) {
      return [this._getDefaultLineStyle()]
    }

    return styles.map((style, index) => {
      if (!style || typeof style !== 'object') {
        console.warn(`MapboxGL._validateLineStyles: 无效的样式对象 at index ${index}，使用默认样式`)
        return this._getDefaultLineStyle()
      }

      return {
        id: style.id || `line_style_${index}`,
        color: style.color || '#4b98fa',
        width: Number(style.width) || 6,
        borderColor: style.borderColor || null,
        borderWidth: Number(style.borderWidth) || 0,
        lineCap: style.lineCap || 'round',
        lineJoin: style.lineJoin || 'round',
        dashArray: style.dashArray || null,
        opacity: Number(style.opacity) || 1,
        emitLight: style.emitLight || false,
        dirArrows: style.dirArrows || false,
        dirAnimate: style.dirAnimate || null,
        isCurve: style.isCurve !== undefined ? Boolean(style.isCurve) : false
      }
    })
  }

  /**
   * 验证和标准化线段几何数据
   * @param {Array} geometries - 几何数据数组
   * @returns {Array} 验证后的几何数据数组
   * @private
   */
  _validateLineGeometries(geometries) {
    if (!Array.isArray(geometries)) {
      console.warn('MapboxGL._validateLineGeometries: geometries 应该是数组')
      return []
    }

    return geometries.map((geometry, index) => {
      // 验证必需的属性 - 线段需要路径数组
      if (!geometry.paths || !Array.isArray(geometry.paths)) {
        console.warn(`MapboxGL._validateLineGeometries: 几何数据 ${index} 缺少有效的 paths 属性，跳过`)
        return null
      }

      // 验证路径数组是否有效（至少需要2个点）
      if (geometry.paths.length < 2) {
        console.warn(`MapboxGL._validateLineGeometries: 线段几何数据 ${index} 必须至少有2个坐标点，跳过`)
        return null
      }

      // 验证并转换坐标点
      const validatedPaths = geometry.paths.map((coord, coordIndex) => {
        if (!Array.isArray(coord) || coord.length < 2) {
          console.warn(`MapboxGL._validateLineGeometries: 几何数据 ${index} 的坐标点 ${coordIndex} 无效，跳过`)
          return null
        }

        const lng = Number(coord[0])
        const lat = Number(coord[1])

        if (isNaN(lng) || isNaN(lat)) {
          console.error(`MapboxGL._validateLineGeometries: 几何数据 ${index} 的坐标点 ${coordIndex} 包含无效数值，lng: ${coord[0]}, lat: ${coord[1]}`)
          return null
        }

        return [lng, lat]
      }).filter(coord => coord !== null)

      if (validatedPaths.length < 2) {
        console.warn(`MapboxGL._validateLineGeometries: 几何数据 ${index} 有效坐标点不足，跳过`)
        return null
      }

      // 统一坐标转换
      const transformedPaths = this._transformCoordinates(validatedPaths, `线段几何验证-${index}`)
      return {
        id: geometry.id || `line_geometry_${index}`,
        properties: {...geometry.properties,originPaths:validatedPaths} || {},
        paths: transformedPaths,
        styleId: geometry.styleId || null
      }
    }).filter(geometry => geometry !== null)
  }

  /**
   * 获取默认线段样式
   * @returns {object} 默认样式对象
   * @private
   */
  _getDefaultLineStyle() {
    return {
      id: `default_line_style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      color: '#4b98fa',
      width: 6,
      borderColor: null,
      borderWidth: 0,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: null,
      opacity: 1,
      emitLight: false,
      dirArrows: false,
      dirAnimate: null
    }
  }

  /**
   * 绑定线段事件
   * @param {string} layerId - 图层ID
   * @param {string} sourceId - 数据源ID
   * @param {Array} geometries - 几何数据数组
   * @param {string} eventType - 事件类型
   * @param {function} callback - 回调函数
   * @private
   */
  _bindLineEvents(layerId, sourceId, geometries, eventType, callback) {
    if (!this.map) return

    // 支持的事件类型
    const supportedEvents = ['click', 'dblclick', 'contextmenu', 'mouseenter', 'mouseleave', 'mousemove']

    if (!supportedEvents.includes(eventType)) {
      console.warn(`MapboxGL._bindLineEvents: 不支持的事件类型 ${eventType}`)
      return
    }

    // 将 rightClick 映射到 contextmenu
    const mapEventType = eventType === 'rightClick' ? 'contextmenu' : eventType

    try {
      // 绑定地图事件
      this.map.on(mapEventType, layerId, (evt) => {
        if (evt.features && evt.features.length > 0) {
          const feature = evt.features[0]
          console.log('feature',feature)
          const geometry = geometries.find(geo => geo.id === feature.properties.id)

          if (geometry) {
            const eventData = {
              geometry: geometry,
              properties: geometry.properties,
              lngLat: evt.lngLat,
              point: evt.point,
              feature: feature,
              layerId: layerId,
              sourceId: sourceId,
              type: eventType,
              timestamp: Date.now()
            }
            console.log('eventData',eventData)
            callback(eventData)
          }
        }
      })

      console.log(`MapboxGL._bindLineEvents: 成功绑定线段事件 ${eventType}`)
    } catch (error) {
      console.error(`MapboxGL._bindLineEvents: 绑定线段事件 ${eventType} 失败:`, error)
    }
  }



  /**
   * 添加聚合功能
   * @param {object} options - 聚合配置
   * @returns {object} 聚合实例
   */
  addCluster(options) {
    if (!this.map) return null

    // 生成唯一ID
    const id = options.id || `cluster_${Date.now()}_${Math.random()}`

    // 添加聚合数据源
    this.map.addSource(id, {
      type: 'geojson',
      data: options.data,
      cluster: true,
      clusterMaxZoom: options.clusterMaxZoom || 14,
      clusterRadius: options.clusterRadius || 50
    })

    // 添加聚合点图层
    this.map.addLayer({
      id: `${id}_clusters`,
      type: 'circle',
      source: id,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': options.clusterColor || '#11b4da',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, 100,
          30, 750,
          40
        ]
      }
    })

    // 添加聚合点数量标签
    this.map.addLayer({
      id: `${id}_cluster-count`,
      type: 'symbol',
      source: id,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    })

    // 添加未聚合的点图层
    this.map.addLayer({
      id: `${id}_unclustered-point`,
      type: 'circle',
      source: id,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': options.pointColor || '#11b4da',
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    })

    // 创建聚合实例对象
    const clusterInstance = {
      id: `${id}_clusters`,
      source: id,
      remove: () => {
        this.map.removeLayer(`${id}_unclustered-point`)
        this.map.removeLayer(`${id}_cluster-count`)
        this.map.removeLayer(`${id}_clusters`)
        this.map.removeSource(id)
      }
    }

    this.addLayer(id, clusterInstance)

    // 绑定聚合点击事件
    this.map.on('click', `${id}_clusters`, (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [`${id}_clusters`]
      })
      const clusterId = features[0].properties.cluster_id
      this.map.getSource(id).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return
        this.map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        })
      })
    })

    return {
      id,
      instance: clusterInstance,
      remove: () => this.removeLayer(id)
    }
  }

  /**
   * 移除标记点 - 支持 HTMap 标准接口
   * @param {string|object} marker - 标记点ID或标记点对象
   * @returns {boolean} 是否移除成功
   */
  removeMarker(marker) {
    if (!this.map) return false

    try {
      let markerId = null
      let markerInstance = null

      if (typeof marker === 'string') {
        // 传入的是ID
        markerId = marker
        const layer = this.layers.get(markerId)
        if (!layer) {
          console.warn(`MapboxGL.removeMarker: 未找到ID为 ${markerId} 的标记点`)
          return false
        }
        markerInstance = layer
      } else if (marker && marker.remove) {
        // 传入的是标记点对象
        markerInstance = marker.marker || marker
        markerId = marker.id
      } else {
        console.warn('MapboxGL.removeMarker: 无效的标记点参数')
        return false
      }

      // 移除标记点
      if (markerInstance && markerInstance.remove) {
        markerInstance.remove()
        if (markerId) {
          this.layers.delete(markerId)
        }
        return true
      }

      return false
    } catch (error) {
      console.error('MapboxGL.removeMarker: 移除标记点失败:', error)
      return false
    }
  }

  /**
   * 移除所有标记点
   * @returns {number} 移除的标记点数量
   */
  removeAllMarkers() {
    if (!this.map) return 0

    let count = 0
    const markersToRemove = []

    // 收集所有标记点
    this.layers.forEach((layer, id) => {
      if (layer && layer.remove) {
        markersToRemove.push({ id, marker: layer })
      }
    })

    // 移除所有标记点
    markersToRemove.forEach(({ id, marker }) => {
      try {
        marker.remove()
        this.layers.delete(id)
        count++
      } catch (error) {
        console.error(`移除标记点 ${id} 时出错:`, error)
      }
    })

    console.log(`成功移除 ${count} 个标记点`)
    return count
  }

  /**
   * 获取标记点数量
   * @returns {number} 标记点数量
   */
  getMarkerCount() {
    if (!this.map) return 0

    let count = 0
    this.layers.forEach((layer) => {
      if (layer && layer.getLngLat) {
        count++
      }
    })

    return count
  }

  /**
   * 移除气泡 - 对接 HTMap 标准接口
   * @param {string|object} popup - 气泡ID或气泡对象
   * @returns {boolean} 是否移除成功
   */
  removePopup(popup) {
    if (!this.map) return false

    try {
      let popupId = null
      let popupInstance = null

      if (typeof popup === 'string') {
        // 传入的是ID
        popupId = popup
        const layer = this.layers.get(popupId)
        if (!layer) {
          console.warn(`MapboxGL.removePopup: 未找到ID为 ${popupId} 的气泡`)
          return false
        }
        popupInstance = layer
      } else if (popup && popup.remove) {
        // 传入的是气泡对象，直接调用其remove方法
        popup.remove()
        return true
      } else if (popup && popup.popup) {
        // 传入的是包装后的气泡对象
        popupInstance = popup.popup
        popupId = popup.id
      } else {
        console.warn('MapboxGL.removePopup: 无效的气泡参数')
        return false
      }

      // 移除气泡
      if (popupInstance && popupInstance.remove) {
        popupInstance.remove()
        if (popupId) {
          this.layers.delete(popupId)
        }
        return true
      }

      return false
    } catch (error) {
      console.error('MapboxGL.removePopup: 移除气泡失败:', error)
      return false
    }
  }

  // ==================== InfoWindow 相关方法 ====================

  /**
   * 添加信息窗口 - 对接 HTMap 标准接口
   * @param {object} options - 信息窗口配置
   * @returns {object} 信息窗口实例
   */
  addInfoWindow(options) {
    if (!this.map) return null

    // 验证必要参数
    if (!options.lngLat && (!options.lng || !options.lat) && !options.position) {
      console.warn('MapboxGL.addInfoWindow: 缺少位置参数 (lngLat、lng/lat 或 position)')
      return null
    }

    if (!options.content) {
      console.warn('MapboxGL.addInfoWindow: 缺少内容参数 (content)')
      return null
    }

    try {
      // 统一坐标转换处理
      const coordinates = this._parseCoordinates(options)

      // 生成唯一ID
      const infoWindowId = options.id || `infowindow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 创建信息窗口内容
      const infoWindowContent = this._createInfoWindowContent(options, infoWindowId)

      // 创建 MapboxGL Popup 实例作为信息窗口
      const infoWindow = new mapboxgl.Popup({
        closeButton: options.closeButton !== false, // 默认显示关闭按钮
        closeOnClick: options.closeOnClick !== false, // 默认点击地图关闭
        closeOnMove: options.closeOnMove || false, // 默认不随地图移动关闭
        focusAfterOpen: options.focusAfterOpen !== false, // 默认打开后聚焦
        offset: options.offset || [0, 0], // 偏移量
        maxWidth: options.maxWidth || '300px', // 最大宽度
        className: options.className || 'ht-map-infowindow', // CSS 类名
        draggable: options.draggable || false // 是否可拖拽
      })
        .setLngLat(coordinates)
        .setDOMContent(infoWindowContent)
        .addTo(this.map)

      // 绑定事件
      this._bindInfoWindowEvents(infoWindow, infoWindowContent, coordinates, options)

      // 存储到图层管理
      this.addLayer(infoWindowId, infoWindow)

      // 返回信息窗口对象 - HTMap 兼容格式
      return {
        id: infoWindowId,
        instance: infoWindow,
        lng: coordinates[0],
        lat: coordinates[1],
        options: options,
        remove: () => this.removeInfoWindow(infoWindowId),
        setPosition: (lng, lat) => {
          infoWindow.setLngLat([lng, lat])
        },
        getPosition: () => [coordinates[0], coordinates[1]],
        setContent: (content) => {
          const newContent = this._createInfoWindowContent({...options, content}, infoWindowId)
          infoWindow.setDOMContent(newContent)
        },
        show: () => infoWindow.addTo(this.map),
        hide: () => infoWindow.remove(),
        isVisible: () => infoWindow.isOpen(),
        setDraggable: (draggable) => {
          // 更新拖拽状态
          if (draggable) {
            this._enableInfoWindowDragging(infoWindow, infoWindowContent)
          } else {
            this._disableInfoWindowDragging(infoWindow, infoWindowContent)
          }
        }
      }
    } catch (error) {
      console.error('MapboxGL.addInfoWindow 创建失败:', error)
      return null
    }
  }

  /**
   * 移除信息窗口
   * @param {string} id - 信息窗口ID
   */
  removeInfoWindow(id) {
    if (!this.map) return false

    try {
      const infoWindow = this.layers.get(id)
      if (infoWindow && infoWindow.instance) {
        infoWindow.instance.remove()
        this.layers.delete(id)
        return true
      }
      return false
    } catch (error) {
      console.error('MapboxGL.removeInfoWindow 移除失败:', error)
      return false
    }
  }

  /**
   * 创建信息窗口内容
   * @param {object} options - 信息窗口配置
   * @param {string} infoWindowId - 信息窗口ID
   * @returns {HTMLElement} 信息窗口内容元素
   * @private
   */
  _createInfoWindowContent(options, infoWindowId) {
    const container = document.createElement('div')
    container.className = 'ht-infowindow-content'
    container.setAttribute('data-infowindow-id', infoWindowId)

    // 处理内容类型
    if (typeof options.content === 'string') {
      container.innerHTML = options.content
    } else if (options.content instanceof HTMLElement) {
      container.appendChild(options.content)
    } else {
      container.innerHTML = '<div class="ht-infowindow-default">信息窗口内容</div>'
    }

    // 添加拖拽手柄（如果启用拖拽）
    if (options.draggable) {
      const dragHandle = document.createElement('div')
      dragHandle.className = 'ht-infowindow-drag-handle'
      dragHandle.innerHTML = '⋮⋮'
      dragHandle.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        width: 20px;
        height: 20px;
        background: rgba(0,0,0,0.1);
        border-radius: 3px;
        cursor: move;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #666;
        user-select: none;
      `
      container.appendChild(dragHandle)
    }

    return container
  }

  /**
   * 绑定信息窗口事件
   * @param {object} infoWindow - 信息窗口实例
   * @param {HTMLElement} content - 内容元素
   * @param {Array} coordinates - 坐标
   * @param {object} options - 配置选项
   * @private
   */
  _bindInfoWindowEvents(infoWindow, content, coordinates, options) {
    // 绑定打开事件
    infoWindow.on('open', () => {
      if (options.onOpen) {
        options.onOpen({
          lngLat: coordinates,
          infoWindow: infoWindow,
          element: content
        })
      }
    })

    // 绑定关闭事件
    infoWindow.on('close', () => {
      if (options.onClose) {
        options.onClose({
          lngLat: coordinates,
          infoWindow: infoWindow,
          element: content
        })
      }
    })

    // 如果启用拖拽，添加拖拽功能
    if (options.draggable) {
      this._enableInfoWindowDragging(infoWindow, content)
    }
  }

  /**
   * 启用信息窗口拖拽功能
   * @param {object} infoWindow - 信息窗口实例
   * @param {HTMLElement} content - 内容元素
   * @private
   */
  _enableInfoWindowDragging(infoWindow, content) {
    const dragHandle = content.querySelector('.ht-infowindow-drag-handle')
    if (!dragHandle) return

    let isDragging = false
    let startPos = { x: 0, y: 0 }
    let startLngLat = null

    const startDrag = (e) => {
      e.preventDefault()
      e.stopPropagation()
      isDragging = true
      startPos = { x: e.clientX, y: e.clientY }
      startLngLat = infoWindow.getLngLat()

      document.addEventListener('mousemove', drag)
      document.addEventListener('mouseup', endDrag)

      // 添加拖拽样式
      content.style.cursor = 'move'
      content.style.userSelect = 'none'
    }

    const drag = (e) => {
      if (!isDragging) return

      e.preventDefault()
      const deltaX = e.clientX - startPos.x
      const deltaY = e.clientY - startPos.y

      // 将屏幕坐标转换为地理坐标
      const point = this.map.project(startLngLat)
      const newPoint = [point.x + deltaX, point.y + deltaY]
      const newLngLat = this.map.unproject(newPoint)

      infoWindow.setLngLat(newLngLat)
    }

    const endDrag = (e) => {
      if (!isDragging) return

      isDragging = false
      content.style.cursor = ''
      content.style.userSelect = ''

      document.removeEventListener('mousemove', drag)
      document.removeEventListener('mouseup', endDrag)

      // 触发拖拽结束事件
      if (infoWindow._onDragEnd) {
        infoWindow._onDragEnd({
          lngLat: infoWindow.getLngLat(),
          infoWindow: infoWindow,
          element: content
        })
      }
    }

    dragHandle.addEventListener('mousedown', startDrag)
  }

  /**
   * 禁用信息窗口拖拽功能
   * @param {object} infoWindow - 信息窗口实例
   * @param {HTMLElement} content - 内容元素
   * @private
   */
  _disableInfoWindowDragging(infoWindow, content) {
    const dragHandle = content.querySelector('.ht-infowindow-drag-handle')
    if (dragHandle) {
      dragHandle.remove()
    }
  }

  /**
   * 移除线条
   * @param {string} id - 线条ID
   */
  removeLine(id) {
    const line = this.layers.get(id)
    if (line && line.instance) {
      line.instance.remove()
      this.layers.delete(id)
    }
  }

  /**
   * 移除聚合
   * @param {string} id - 聚合ID
   */
  removeCluster(id) {
    const cluster = this.layers.get(id)
    if (cluster && cluster.instance) {
      cluster.instance.remove()
      this.layers.delete(id)
    }
  }

  /**
   * 更新标记点
   * @param {string} id - 标记点ID
   * @param {object} options - 更新配置
   */
  updateMarker(id, options) {
    const marker = this.layers.get(id)
    if (!marker) return false

    // 更新位置
    if (options.lng !== undefined || options.lat !== undefined) {
      const lng = options.lng !== undefined ? options.lng : marker.lng
      const lat = options.lat !== undefined ? options.lat : marker.lat
      marker.setPosition(lng, lat)
    }

    // 更新图标
    if (options.icon !== undefined) {
      marker.element.style.backgroundImage = `url(${options.icon})`
      marker.element.style.backgroundColor = 'transparent'
      marker.element.style.borderRadius = '0'
      marker.element.style.border = 'none'
    }

    // 更新颜色
    if (options.color !== undefined && !options.icon) {
      marker.element.style.backgroundColor = options.color
      marker.element.style.backgroundImage = 'none'
      marker.element.style.borderRadius = '50%'
      marker.element.style.border = '2px solid white'
    }

    // 更新尺寸
    if (options.size !== undefined) {
      marker.element.style.width = `${options.size}px`
      marker.element.style.height = `${options.size}px`
    }

    // 更新事件回调
    if (options.onClick !== undefined) {
      // 移除旧的事件监听器
      marker.element.removeEventListener('click', marker.options.onClick)
      // 添加新的事件监听器
      marker.element.addEventListener('click', (e) => {
        e.stopPropagation()
        options.onClick(marker, e)
      })
      marker.options.onClick = options.onClick
    }

    if (options.onDblClick !== undefined) {
      // 移除旧的事件监听器
      marker.element.removeEventListener('dblclick', marker.options.onDblClick)
      // 添加新的事件监听器
      marker.element.addEventListener('dblclick', (e) => {
        e.stopPropagation()
        options.onDblClick(marker, e)
      })
      marker.options.onDblClick = options.onDblClick
    }

    return true
  }

  /**
   * 更新线条
   * @param {string} id - 线条ID
   * @param {object} options - 更新配置
   */
  updateLine(id, options) {
    const line = this.layers.get(id)
    if (!line) return false

    // 更新路径
    if (options.path) {
      // 处理坐标转换
      const coordinates = this._transformCoordinates(options.path, 'updateLine')

      this.map.getSource(line.source).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      })
    }

    // 更新样式
    if (options.strokeColor || options.strokeWeight || options.strokeOpacity) {
      const paint = {}
      if (options.strokeColor) paint['line-color'] = options.strokeColor
      if (options.strokeWeight) paint['line-width'] = options.strokeWeight
      if (options.strokeOpacity) paint['line-opacity'] = options.strokeOpacity

      this.map.setPaintProperty(line.id, 'line-color', paint['line-color'] || line.options.strokeColor)
      this.map.setPaintProperty(line.id, 'line-width', paint['line-width'] || line.options.strokeWeight)
      this.map.setPaintProperty(line.id, 'line-opacity', paint['line-opacity'] || line.options.strokeOpacity)
    }

    return true
  }

  /**
   * 获取所有标记点
   * @returns {Array} 标记点列表
   */
  getMarkers() {
    const markers = []
    this.layers.forEach((layer, id) => {
      if (id.startsWith('marker_') || layer.instance && layer.instance instanceof mapboxgl.Marker) {
        markers.push(layer)
      }
    })
    return markers
  }

  /**
   * 获取所有线条
   * @returns {Array} 线条列表
   */
  getLines() {
    const lines = []
    this.layers.forEach((layer, id) => {
      if (id.startsWith('line_') || layer.instance && layer.source) {
        lines.push(layer)
      }
    })
    return lines
  }

  /**
   * 获取所有聚合
   * @returns {Array} 聚合列表
   */
  getClusters() {
    const clusters = []
    this.layers.forEach((layer, id) => {
      if (id.startsWith('cluster_') || layer.instance && layer.source) {
        clusters.push(layer)
      }
    })
    return clusters
  }

  /**
   * 设置地图视野范围（适应到指定区域）
   * @param {object} bounds - 视野范围 {sw: [lng, lat], ne: [lng, lat]}
   * @param {object} options - 动画选项
   */
  setBounds(bounds, options = {}) {
    if (!this.map) return false

    try {
      if (bounds && bounds.sw && bounds.ne) {
        // 统一坐标转换
        const transformedBounds = this._transformCoordinates(bounds, 'setBounds')

        const bbox = [
          transformedBounds.sw[0], // west
          transformedBounds.sw[1], // south
          transformedBounds.ne[0], // east
          transformedBounds.ne[1] // north
        ]

        this.map.fitBounds(bbox, {
          padding: options.padding || 50,
          duration: options.duration || 1000,
          ...options
        })
        return true
      }
      return false
    } catch (error) {
      console.error('MapboxGL setBounds error:', error)
      return false
    }
  }

  /**
   * 限制地图视野范围
   * @param {object} bounds - 视野范围 {sw: [lng, lat], ne: [lng, lat]}
   * @returns {boolean} 操作是否成功
   */
  limitBounds(bounds) {
    if (!this.map) return false

    try {
      if (bounds && bounds.sw && bounds.ne) {
        // 统一坐标转换
        const transformedBounds = this._transformCoordinates(bounds, 'limitBounds')

        const bbox = [
          transformedBounds.sw[0], // west
          transformedBounds.sw[1], // south
          transformedBounds.ne[0], // east
          transformedBounds.ne[1] // north
        ]

        this.map.setMaxBounds(bbox)
        return true
      }
      return false
    } catch (error) {
      console.error('MapboxGL limitBounds error:', error)
      return false
    }
  }

  /**
   * 平滑移动到对象集合的合适位置
   * @param {Array} objects - 对象数组，支持 marker、line、polygon 等
   * @param {number} duration - 动画时长 (毫秒)
   * @returns {boolean} 操作是否成功
   */
  easeToObjects(objects) {
    const {
      coordinates,
      padding,
      duration
    } = objects
    try {      // 调用地图API的fitBounds方法
      this.map.fitBounds(coordinates, {
        duration: duration || 1000,
        padding: padding || 0
      })

      return true

    } catch (error) {
      console.error('MapboxGL easeToObjects error:', error)
      return false
    }
  }

  /**
   * 适应地图视野范围
   * @param {object} bounds - 视野范围 {sw: [lng, lat], ne: [lng, lat],padding,duration}
   */
  fitBounds(bounds) {
    const { padding, duration } = bounds

    // 统一坐标转换
    const transformedBounds = this._transformCoordinates(bounds, 'fitBounds')

    return this.map.fitBounds([transformedBounds.sw, transformedBounds.ne], {
      duration: duration || 1000,
      padding: padding || 50
    })
  }

  /**
   * 设置地图扩展视野
   * @param {object} extent - 扩展视野 {southwest: [lng, lat], northeast: [lng, lat]}
   * @param {object} options - 动画选项
   */
  setExtent(extent, options = {}) {
    return this.setBounds(extent, options)
  }

  /**
   * 获取地图扩展视野
   * @returns {object} 扩展视野信息
   */
  getExtent() {
    return this.getBounds()
  }

  /**
   * 创建标记点事件管理器 - 仿照腾讯地图实现
   * @param {string} layerId - 图层ID
   * @param {string} sourceId - 数据源ID
   * @param {Array} markersData - 标记点数据
   * @param {Array} markers - 标记点实例数组（可选）
   * @returns {object} 事件管理器对象
   * @private
   */
  _createMarkerEventManager(layerId, sourceId, markersData, markers = null) {
    if (!this.map) return null

    // 事件监听器存储
    const eventListeners = new Map()

    // 支持的事件类型
    const supportedEvents = [
      'click', 'dblclick', 'contextmenu', 'rightClick',
      'mouseenter', 'mouseleave', 'mousemove',
      'mousedown', 'mouseup'
    ]

    // 绑定地图事件 - 使用 MapboxGL 支持的事件绑定方式
    const bindMapEvents = () => {
      console.log(`MapboxGL: 开始绑定事件到图层 ${layerId}，标记点数量: ${markersData.length}`)

      // 检查是否有 Marker 实例（DOM 标记点方式）
      if (markers && markers.length > 0) {
        console.log(`MapboxGL: 检测到 ${markers.length} 个 Marker 实例，直接绑定事件到 Marker`)

        // 为每个 Marker 实例绑定事件
        markers.forEach((marker, index) => {
          const markerData = markersData[index]
          if (!markerData) return

          supportedEvents.forEach(eventType => {
            console.log(`MapboxGL: 为 Marker ${markerData.id} 绑定事件 ${eventType}`)

            // 获取 Marker 的 DOM 元素
            const element = marker.getElement()
            if (!element) return

            // 绑定 DOM 事件
            const domEventType = eventType === 'rightClick' ? 'contextmenu' : eventType

            element.addEventListener(domEventType, (evt) => {
              console.log(`MapboxGL: Marker ${markerData.id} 触发事件 ${eventType}`)

              const eventData = {
                marker: markerData,
                markerInstance: marker,
                event: evt,
                // lngLat: markerData.lngLat,
                point: { x: evt.clientX, y: evt.clientY },
                layerId: layerId,
                sourceId: sourceId,
                geometry: {
                  id: markerData.id,
                  properties: markerData.properties || {}
                },
                lngLat: {
                  lng: markerData.lngLat[0],
                  lat: markerData.lngLat[1]
                },
                type: eventType,
                timestamp: Date.now()
              }

              // 触发事件监听器
              if (eventListeners.has(eventType)) {
                console.log(`MapboxGL: 触发 Marker 事件 ${eventType}，监听器数量:`, eventListeners.get(eventType).length)
                eventListeners.get(eventType).forEach(callback => {
                  try {
                    callback(eventData)
                  } catch (error) {
                    console.error(`Marker 事件 ${eventType} 回调执行错误:`, error)
                  }
                })
              }
            })
          })
        })
      } else {
        // 检查图层是否存在（样式图标或默认标记点方式）
        if (!this.map.getLayer(layerId)) {
          console.warn(`MapboxGL: 图层 ${layerId} 不存在，无法绑定事件`)
          return
        }

        // 尝试不同的 MapboxGL 事件绑定方式
        supportedEvents.forEach(eventType => {
          // 将 rightClick 映射到 contextmenu
          const mapEventType = eventType === 'rightClick' ? 'contextmenu' : eventType

          console.log(`MapboxGL: 尝试绑定事件 ${eventType} (地图事件类型: ${mapEventType}) 到图层 ${layerId}`)

          try {
            // 方式1: 尝试使用图层ID绑定事件
            this.map.on(mapEventType, layerId, (evt) => {
              console.log(`MapboxGL: 收到图层事件111 ${mapEventType}，原始事件:`, evt.target)
              handleMapEvent(evt, eventType)
            })
          } catch (error) {
            console.warn(`MapboxGL: 图层事件绑定失败，尝试其他方式:`, error)

            try {
              // 方式2: 尝试直接绑定到地图
              this.map.on(mapEventType, (evt) => {
                console.log(`MapboxGL: 收到地图事件 ${mapEventType}，原始事件:`, evt)
                handleMapEvent(evt, eventType)
              })
            } catch (error2) {
              console.warn(`MapboxGL: 地图事件绑定也失败:`, error2)
            }
          }
        })
      }

      // 事件处理函数
      const handleMapEvent = (evt, eventType) => {

        console.log(`MapboxGL: 处理事件 ${eventType}，事件数据:`, evt)

        // 检查是否有特征数据
        if (evt.features && evt.features.length > 0) {
          const feature = evt.features[0]
          console.log(`MapboxGL: 找到特征 ${feature.id}，坐标:`, feature.geometry.coordinates)

          const markerData = markersData.find(marker =>
            marker.id === feature.properties.id ||
            (marker.lngLat && this._transformCoordinates(marker.lngLat, '事件坐标比较')[0] === feature.geometry.coordinates[0] && this._transformCoordinates(marker.lngLat, '事件坐标比较')[1] === feature.geometry.coordinates[1])
          )

          if (markerData) {
            console.log(`MapboxGL: 找到匹配的标记点数据:`, markerData)

            // 特殊处理鼠标样式
            if (eventType === 'mouseenter') {
              this.map.getCanvas().style.cursor = 'pointer'
            } else if (eventType === 'mouseleave') {
              this.map.getCanvas().style.cursor = ''
            }
            const eventData = {
              // 原始数据
              marker: markerData,
              feature: feature,
              event: evt,
              // lngLat: feature.geometry.coordinates,
              point: evt.point,
              layerId: layerId,
              sourceId: sourceId,
              target: feature,
              // HTMap 兼容格式
              markerInstance: markerData,
              originalEvent: evt,
              // 腾讯地图兼容格式
              geometry: {
                id: feature.id,
                properties: markerData.properties || {}
              },
              lngLat: {
                lng: markerData.lngLat[0],
                lat: markerData.lngLat[1]
              },
              type: eventType,
              timestamp: Date.now()
            }

            console.log(`MapboxGL: 准备触发事件 ${eventType}，事件数据:`, eventData)

            // 调用所有注册的监听器
            if (eventListeners.has(eventType)) {
              console.log(`MapboxGL: 触发事件 ${eventType}，监听器数量:`, eventListeners.get(eventType).length)
              eventListeners.get(eventType).forEach(callback => {
                try {
                  callback(eventData)
                } catch (error) {
                  console.error(`事件 ${eventType} 回调执行错误:`, error)
                }
              })
            } else {
              console.log(`MapboxGL: 事件 ${eventType} 没有注册的监听器`)
            }
          } else {
            console.log(`MapboxGL: 未找到匹配的标记点数据`)
          }
        } else {
          // mouseLeave 特殊 移出时无特征数据
          if(eventType==='mouseleave'){
            if (eventListeners.has(eventType)) {
              console.log(`MapboxGL: 触发事件 ${eventType}，监听器数量:`, eventListeners.get(eventType).length)
              eventListeners.get('mouseleave').forEach(callback => {
                try {
                  const eventData = {
                    // 原始数据
                    marker: null,
                    feature: null,
                    event: evt,
                    lngLat: null,
                    point: evt.point,
                    layerId: layerId,
                    sourceId: sourceId,
                    target: null,
                    // HTMap 兼容格式
                    markerInstance: null,
                    originalEvent: evt,
                    // 腾讯地图兼容格式
                    geometry: null,
                    type: eventType,
                    timestamp: Date.now()
                  }
                  callback(eventData)
                } catch (error) {
                  console.error(`事件 ${eventType} 回调执行错误:`, error)
                }
              })
            } else {
              console.log(`MapboxGL: 事件 ${eventType} 没有注册的监听器`)
            }
            return
          }
          console.log(`MapboxGL: 事件 ${eventType} 没有特征数据`)
        }
      }
    }

    // 立即绑定事件
    bindMapEvents()

    // 返回事件管理器 - 仿照腾讯地图的 bindEvents 方法
    return {
      /**
       * 绑定事件处理器 - 仿照腾讯地图实现
       * @param {object} eventHandlers - 事件处理器对象
       */
      bindEvents(eventHandlers) {
        if (!eventHandlers || typeof eventHandlers !== 'object') {
          console.warn('bindEvents: 需要提供有效的事件处理器对象')
          return
        }

        // 绑定点击事件
        if (eventHandlers.onClick) {
          this.on('click', (eventData) => {
            const markerGroup = this
            const e = eventData
            const clickedGeo = markersData.find(geo => geo.id === e.geometry.id)
            if (clickedGeo) {
              eventHandlers.onClick(markerGroup, e, clickedGeo)
            }
          })
        }

        // 绑定双击事件
        if (eventHandlers.onDblClick) {
          this.on('dblclick', (eventData) => {
            const markerGroup = this
            const e = eventData
            const clickedGeo = markersData.find(geo => geo.id === e.geometry.id)
            if (clickedGeo && eventHandlers.onDblClick) {
              eventHandlers.onDblClick(markerGroup, e, clickedGeo)
            }
          })
        }

        // 绑定鼠标进入事件
        if (eventHandlers.onMouseEnter) {
          this.on('mouseenter', (eventData) => {
            const markerGroup = this
            const e = eventData
            const hoveredGeo = markersData.find(geo => geo.id === e.geometry.id)
            if (hoveredGeo && eventHandlers.onMouseEnter) {
              eventHandlers.onMouseEnter(markerGroup, e, hoveredGeo)
            }
          })
        }

        // 绑定鼠标离开事件
        if (eventHandlers.onMouseLeave) {
          this.on('mouseleave', (eventData) => {
            const markerGroup = this
            const e = eventData
            const leftGeo = markersData.find(geo => geo.id === e.geometry.id)
            if (leftGeo && eventHandlers.onMouseLeave) {
              eventHandlers.onMouseLeave(markerGroup, e, leftGeo)
            }
          })
        }

        // 绑定右键事件
        if (eventHandlers.onRightClick) {
          this.on('rightClick', (eventData) => {
            const markerGroup = this
            const e = eventData
            const clickedGeo = markersData.find(geo => geo.id === e.geometry.id)
            if (clickedGeo && eventHandlers.onRightClick) {
              eventHandlers.onRightClick(markerGroup, e, clickedGeo)
            }
          })
        }
      },

      /**
       * 添加事件监听器
       * @param {string} event - 事件名称
       * @param {function} callback - 回调函数
       */
      on(event, callback) {
        if (!supportedEvents.includes(event)) {
          console.warn(`不支持的事件类型: ${event}`)
          return
        }

        if (!eventListeners.has(event)) {
          eventListeners.set(event, [])
        }
        eventListeners.get(event).push(callback)
        console.log(`MapboxGL: 注册事件监听器 ${event}，当前监听器数量:`, eventListeners.get(event).length)
      },

      /**
       * 移除事件监听器
       * @param {string} event - 事件名称
       * @param {function} callback - 回调函数（可选）
       */
      off(event, callback) {
        if (!eventListeners.has(event)) return

        if (callback) {
          const listeners = eventListeners.get(event)
          const index = listeners.indexOf(callback)
          if (index > -1) {
            listeners.splice(index, 1)
          }
          if (listeners.length === 0) {
            eventListeners.delete(event)
          }
        } else {
          eventListeners.delete(event)
        }
      },

      /**
       * 一次性事件监听器
       * @param {string} event - 事件名称
       * @param {function} callback - 回调函数
       */
      once(event, callback) {
        const onceCallback = (data) => {
          callback(data)
          this.off(event, onceCallback)
        }
        this.on(event, onceCallback)
      },

      /**
       * 获取事件监听器数量
       * @param {string} event - 事件名称（可选）
       * @returns {number|object} 监听器数量
       */
      getListenerCount(event) {
        if (event) {
          return eventListeners.has(event) ? eventListeners.get(event).length : 0
        }

        const counts = {}
        eventListeners.forEach((listeners, eventName) => {
          counts[eventName] = listeners.length
        })
        return counts
      },

      /**
       * 清除所有事件监听器
       */
      clearAll() {
        eventListeners.clear()
      },

      /**
       * 获取支持的事件类型
       * @returns {Array} 支持的事件类型数组
       */
      getSupportedEvents() {
        return [...supportedEvents]
      }
    }
  }

  /**
   * 销毁地图
   */
  destroy() {
    if (this.map) {
      // 清理所有聚合资源
      this._cleanupAllClusterResources()

      this.map.remove()
      this.map = null
    }
    super.destroy()
  }

  // ==================== Clusters 相关方法 ====================

  /**
   * 添加聚合功能 - 支持 HTMap 标准参数格式
   * @param {object} options - 聚合配置
   * @returns {object} 聚合实例
   */
  addClusters(options) {
    if (!this.map) {
      console.warn('MapboxGL.addClusters: 地图未初始化')
      return null
    }
    options.nonClustersStyle?.forEach(style => {
      style.offset = [0, 0]
    })

    // 验证必需参数
    if (!options.geometries || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      console.warn('MapboxGL.addClusters: geometries 参数无效或为空')
      return null
    }

    const clusterId = options.id || `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sourceId = `${clusterId}-source`

    try {
      const self = this // 保存 MapboxGL 实例引用

      // 标准化配置
      const config = this._normalizeClusterConfig(options)

      // 标准化几何数据
      const normalizedGeometries = this._normalizeGeometries(options.geometries)

      // 创建GeoJSON数据
      const geojsonData = this._createClusterGeoJSON(normalizedGeometries)

      // 添加数据源
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: config.clusterConfig.maxZoom,
        clusterRadius: config.clusterConfig.radius,
        clusterMinPoints: config.clusterConfig.minCount, // 设置最小聚合点数
        promoteId: 'id'
      })

      console.log(`MapboxGL.addClusters: 数据源 ${sourceId} 已添加，包含 ${geojsonData.features.length} 个要素`)

      // 添加图层
      this._addClusterLayers(clusterId, sourceId, config)

      // 创建聚合实例
      const clusterInstance = this._createClusterInstance(clusterId, sourceId, config, normalizedGeometries, self)

      // 存储聚合实例
      this.layers.set(clusterId, clusterInstance)

      // 根据 zoomOnClick 配置决定是否自动绑定聚合点击事件（参照MineMap实现）
      if (config.clusterConfig.zoomOnClick) {
        setTimeout(() => {
          this._bindClusterEvents(clusterId, sourceId, normalizedGeometries, 'click', (eventData) => {
            console.log('聚合点击事件回调:', eventData)
          })
        }, 100)
        console.log(`MapboxGL.addClusters: 已启用聚合点击放大功能`)
      } else {
        console.log(`MapboxGL.addClusters: 聚合点击放大功能已禁用`)
      }

      console.log(`MapboxGL.addClusters: 成功创建聚合 ${clusterId}`)
      return clusterInstance

    } catch (error) {
      console.error('MapboxGL.addClusters: 添加聚合失败:', error)
      return null
    }
  }

  /**
   * 标准化聚合配置
   * @param {object} options - 原始配置
   * @returns {object} 标准化后的配置
   * @private
   */
  _normalizeClusterConfig(options) {
    return {
      id: options.id,
      clusterConfig: {
        maxZoom: options.clusterConfig?.maxZoom || 17,
        radius: options.clusterConfig?.radius || 60,
        minCount: options.clusterConfig?.minCount || 2,
        zoomOnClick: options.clusterConfig?.zoomOnClick !== false
      },
      clusterStyle: this._normalizeClusterStyle(options.clusterStyle),
      nonClustersStyle: this._normalizeNonClustersStyle(options.nonClustersStyle || []),
      nonClustersDom: options.nonClustersDom || null
    }
  }
  /**
   * 标准化聚合配置
   * @param {object} options - 原始配置
   * @returns {object} 标准化后的配置
   * @private
   */
  // _normalizeClusterConfig(options) {
  //   return {
  //     id: options.id,
  //     clusterConfig: {
  //       maxZoom: options.clusterConfig?.maxZoom || 17,
  //       radius: options.clusterConfig?.radius || 60,
  //       minCount: options.clusterConfig?.minCount || 2,
  //       zoomOnClick: options.clusterConfig?.zoomOnClick !== false
  //     },
  //     clusterStyle: this._normalizeClusterStyle(options.clusterStyle),
  //     nonClustersStyle: this._normalizeNonClustersStyle(options.nonClustersStyle || []),
  //     nonClustersDom: options.nonClustersDom || null
  //   }
  // }
  /**
   * 获取默认聚合样式
   * @returns {object} 默认聚合样式
   * @private
   */
  _getDefaultClusterStyle() {
    return {
      circleColor: 'rgba(80, 160, 255, 1)',
      circleRadius: 20,
      strokeColor: 'rgba(80, 160, 255, 1)',
      strokeWidth: 4,
      textColor: 'rgba(255, 255, 255, 1)',
      textSize: 14,
      textHaloColor: '#ffffff',
      textHaloWidth: 1,
      clusterCustom: null
    }
  }
  /**
   * 标准化聚合样式配置
   * @param {object} clusterStyle - 聚合样式配置
   * @returns {object} 标准化后的聚合样式
   * @private
   */
  _normalizeClusterStyle(clusterStyle) {
    if (!clusterStyle || typeof clusterStyle !== 'object') {
      return this._getDefaultClusterStyle()
    }

    return {
      // 聚合点样式 - 支持单一值或数组格式
      circleColor: clusterStyle.circleColor || 'rgba(80, 160, 255, 1)',
      circleRadius: clusterStyle.circleRadius || 20,
      strokeColor: clusterStyle.strokeColor || 'rgba(80, 160, 255, 1)',
      strokeWidth: clusterStyle.strokeWidth || 4,

      // 文字样式
      textColor: clusterStyle.textColor || 'rgba(255, 255, 255, 1)',
      textSize: Number(clusterStyle.textSize) || 14,
      textHaloColor: clusterStyle.textHaloColor || '#ffffff',
      textHaloWidth: clusterStyle.textHaloWidth !== undefined ? Number(clusterStyle.textHaloWidth) : 1,

      // 自定义参数
      clusterCustom: clusterStyle.clusterCustom || null
    }
  }
  /**
   * 获取默认非聚合样式
   * @returns {object} 默认非聚合样式
   * @private
   */
  _getDefaultNonClustersStyle() {
    return {
      id: 'default_non_clusters_style',
      src: this._getDefaultPinImage(),
      width: 20,
      height: 20,
      offset: [-10, -10],
      rotation: 0,
      faceForward: 'standUp',
      draggable: false
    }
  }
  /**
   * 标准化非聚合样式配置
   * @param {Array} nonClustersStyle - 非聚合样式数组
   * @returns {Array} 标准化后的非聚合样式
   * @private
   */
  _normalizeNonClustersStyle(nonClustersStyle) {
    console.log('非聚合样式配置:', nonClustersStyle);

    if (!Array.isArray(nonClustersStyle) || nonClustersStyle.length === 0) {
      return [this._getDefaultNonClustersStyle()]
    }

    return nonClustersStyle.map((style, index) => {
      if (!style || typeof style !== 'object') {
        console.warn(`MineMap: 无效的非聚合样式配置，索引 ${index}，使用默认样式`)
        return this._getDefaultNonClustersStyle()
      }

      return {
        id: style.id || `non_clusters_style_${index}`,
        src: style.src || this._getDefaultPinImage(),
        width: Number(style.width) || 20,
        height: Number(style.height) || 20,
        offset: Array.isArray(style.offset) ? style.offset : [-10, -10],
        rotation: Number(style.rotation) || 0,
        faceForward: style.faceForward || 'standUp',
        draggable: style.draggable === true
      }
    })
  }

  /**
   * 标准化几何数据
   * @param {Array} geometries - 几何数据
   * @returns {Array} 标准化后的几何数据
   * @private
   */
  _normalizeGeometries(geometries) {
    if (!Array.isArray(geometries)) return [];

    return geometries.map((geometry, index) => {
      if (!geometry) return null;

      // 必要字段验证
      if (!geometry.lngLat && !geometry.position && !(geometry.lng !== undefined && geometry.lat !== undefined)) {
        console.warn(`MapboxGL._normalizeGeometries: 几何数据 ${index} 缺少坐标信息`);
        return null;
      }

      // 统一坐标格式
      let lngLat = null;
      if (geometry.lngLat) {
        lngLat = geometry.lngLat;
      } else if (geometry.position) {
        lngLat = Array.isArray(geometry.position) ? geometry.position : [geometry.position.lng, geometry.position.lat];
      } else if (geometry.lng !== undefined && geometry.lat !== undefined) {
        lngLat = [geometry.lng, geometry.lat];
      }

      if (!lngLat || lngLat.length < 2) {
        console.warn(`MapboxGL._normalizeGeometries: 几何数据 ${index} 坐标格式无效`);
        return null;
      }

      // 坐标值验证
      if (typeof lngLat[0] !== 'number' || typeof lngLat[1] !== 'number' ||
        isNaN(lngLat[0]) || isNaN(lngLat[1]) ||
        lngLat[0] < -180 || lngLat[0] > 180 ||
        lngLat[1] < -90 || lngLat[1] > 90) {
        console.warn(`MapboxGL._normalizeGeometries: 几何数据 ${index} 坐标值无效: [${lngLat[0]}, ${lngLat[1]}]`);
        return null;
      }

      // 标准化属性
      const properties = geometry.properties || {};

      return {
        id: geometry.id || `geometry_${index}_${Date.now()}`,
        styleId: geometry.styleId || `style_${index % 10}`, // 样式ID，支持不同样式的非聚合点
        lngLat: lngLat,
        properties: properties
      };
    }).filter(Boolean); // 过滤掉无效的几何数据
  }

  /**
   * 创建聚合GeoJSON数据
   * @param {Array} geometries - 几何数据
   * @returns {object} GeoJSON数据
   * @private
   */
  _createClusterGeoJSON(geometries) {
    const geojson = {
      type: 'FeatureCollection',
      features: geometries.map(geometry => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: this._transformCoordinates(geometry.lngLat, 'addClusters-GeoJSON')
        },
        properties: {
          id: geometry.id,
          styleId: geometry.styleId, // 添加styleId属性，用于图层过滤
          ...geometry.properties
        }
      }))
    }
    console.log(`MapboxGL._createClusterGeoJSON: 创建GeoJSON数据，包含 ${geojson.features.length} 个要素`)
    return geojson
  }

  /**
   * 创建聚合实例
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} config - 配置
   * @param {Array} geometries - 几何数据
   * @param {object} self - MapboxGL实例引用
   * @returns {object} 聚合实例
   * @private
   */
  _createClusterInstance(clusterId, sourceId, config, geometries, self) {
    // 用于存储事件监听器的引用
    const eventListeners = new Map();

    return {
      id: clusterId,
      sourceId: sourceId,
      geometries: geometries,
      config: config,
      map: self.map,
      eventListeners: eventListeners,

      // 绑定事件
      on(eventType, callback) {
        console.log(`MapboxGL.on: 绑定事件 ${eventType} 到聚合 ${clusterId}`)
        const listeners = self._bindClusterEvents(clusterId, sourceId, geometries, eventType, callback)
        // 保存监听器引用以便后续解绑
        eventListeners.set(eventType, listeners)
        return this
      },

      // 解绑事件
      off(eventType, callback) {
        console.log(`MapboxGL.off: 解绑事件 ${eventType} 从聚合 ${clusterId}`)

        const listeners = eventListeners.get(eventType)
        if (listeners) {
          // 解绑所有保存的监听器
          listeners.forEach(({ layerId, listener }) => {
            if (self.map.getLayer(layerId)) {
              console.log(`MapboxGL.off: 解绑图层 ${layerId} 的 ${eventType} 事件`)
              self.map.off(eventType, layerId, listener)
            }
          })

          // 处理DOM元素事件解绑
          if (listeners.domListeners) {
            listeners.domListeners.forEach(({ element, domEventType, listener }) => {
              if (element && element.parentNode) {
                element.removeEventListener(domEventType, listener)
                console.log(`MapboxGL.off: 解绑DOM元素的 ${domEventType} 事件`)
              }
            })
          }

          // 清除监听器引用
          eventListeners.delete(eventType)
        }

        return this
      },

      // 更新数据
      updateData(newGeometries) {
        try {
          const normalizedGeometries = self._normalizeGeometries(newGeometries)
          const geojsonData = self._createClusterGeoJSON(normalizedGeometries)
          this.map.getSource(sourceId).setData(geojsonData)
          this.geometries = normalizedGeometries
          console.log(`MapboxGL.updateData: 成功更新聚合 ${clusterId} 数据`)
        } catch (error) {
          console.error('MapboxGL.updateData: 更新聚合数据失败:', error)
        }
        return this
      },

      // 更新样式
      updateStyle(newStyle) {
        try {
          // 移除现有图层
          self._removeClusterLayers(clusterId)

          // 更新配置
          this.config.clusterStyle = { ...this.config.clusterStyle, ...newStyle }

          // 重新添加图层
          self._addClusterLayers(clusterId, sourceId, this.config)

          console.log(`MapboxGL.updateStyle: 成功更新聚合 ${clusterId} 样式`)
        } catch (error) {
          console.error('MapboxGL.updateStyle: 更新聚合样式失败:', error)
        }
        return this
      },

      // 移除聚合
      removeCluster() {
        try {
          self._removeClusterLayers(clusterId)

          if (this.map?.getSource(sourceId)) {
            this.map.removeSource(sourceId)
          }

          self.layers.delete(clusterId)
          console.log(`MapboxGL.removeCluster: 成功移除聚合 ${clusterId}`)
        } catch (error) {
          console.error('MapboxGL.removeCluster: 移除聚合失败:', error)
        }
        return this
      },

      // 设置可见性
      setVisible(visible) {
        try {
          self._setClusterLayersVisible(clusterId, visible)
          console.log(`MapboxGL.setVisible: 成功${visible ? '显示' : '隐藏'}聚合 ${clusterId}`)
        } catch (error) {
          console.error('MapboxGL.setVisible: 设置聚合可见性失败:', error)
        }
        return this
      },

      // 获取可见性
      getVisible() {
        try {
          return self._getClusterLayersVisible(clusterId)
        } catch (error) {
          console.error('MapboxGL.getVisible: 获取聚合可见性失败:', error)
          return false
        }
      },

      // 获取信息
      getInfo() {
        return {
          id: clusterId,
          sourceId: sourceId,
          geometries: this.geometries,
          config: this.config,
          visible: this.getVisible()
        }
      }
    }
  }

  /**
   * 添加聚合图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} config - 聚合配置
   * @private
   */
  _addClusterLayers(clusterId, sourceId, config) {
    const clusterStyle = config.clusterStyle
    const nonClustersStyle = config.nonClustersStyle
    const minCount = config.clusterConfig.minCount || 2

    // 添加未聚合点图层
    this._addUnclusteredLayer(clusterId, sourceId, clusterStyle, nonClustersStyle, config.nonClustersDom)

    // 添加聚合圆圈图层
    this._addClusterCircleLayers(clusterId, sourceId, clusterStyle, minCount)

    // 添加聚合数量文字图层
    this._addClusterTextLayer(clusterId, sourceId, clusterStyle, minCount)
  }

  /**
   * 添加未聚合点图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} clusterStyle - 聚合样式
   * @param {Array} nonClustersStyle - 非聚合点样式
   * @param {HTMLElement} nonClustersDom - 非聚合点DOM
   * @private
   */
  _addUnclusteredLayer(clusterId, sourceId, clusterStyle, nonClustersStyle, nonClustersDom) {
    console.log(`MapboxGL._addUnclusteredLayer: 开始处理非聚合点图层 ${clusterId}`)

    // 如果提供了自定义DOM，使用DOM方式创建标记点
    if (nonClustersDom) {
      this._addUnclusteredDomLayer(clusterId, sourceId, nonClustersDom);
      return;
    }

    // 如果提供了有效的图标样式，为每个样式创建对应的图层
    if (nonClustersStyle.length > 0) {
      let successCount = 0;
      let totalValidStyles = 0;

      // 统计有效样式数量
      nonClustersStyle.forEach(style => {
        if (style && style.src) {
          totalValidStyles++;
        }
      });

      console.log(`MapboxGL._addUnclusteredLayer: 发现 ${totalValidStyles} 个有效样式`);

      // 为每个样式创建图层
      nonClustersStyle.forEach((style, styleIndex) => {
        if (style && style.src) {
          const iconId = `${clusterId}-icon-${style.id || styleIndex}`;
          const layerId = `${clusterId}-unclustered-${style.id || styleIndex}`;

          console.log(`MapboxGL._addUnclusteredLayer: 处理样式 ${styleIndex}`, {
            styleId: style.id,
            iconId,
            layerId,
            src: style.src
          });

          // 预加载图标，成功后添加图标图层
          // 检查图标是否已经存在
          if (this.map.hasImage(iconId)) {
            console.log(`MapboxGL._addUnclusteredLayer: 图标 ${iconId} 已存在，直接添加图层`)

            // 计算正确的 icon-size（假设图标已存在时使用默认尺寸或样式中的宽度）
            const iconSize = style.width ? (style.width / 32) : 1 // 假设默认图标宽度为32px

            // 添加图标图层
            const iconLayerConfig = {
              id: layerId,
              type: 'symbol',
              source: sourceId,
              filter: [
                'all',
                ['!', ['has', 'point_count']],
                ['==', ['get', 'styleId'], style.id || `style_${styleIndex}`]
              ],
              layout: {
                'icon-image': iconId,
                'icon-size': iconSize,
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-offset': style.offset || [0, 0],
                'icon-rotation-alignment': style.faceForward === 'lieFlat' ? 'map' : 'viewport',
                'icon-pitch-alignment': style.faceForward === 'lieFlat' ? 'map' : 'viewport',
                'icon-rotate': style.rotation || 0,
                'icon-anchor': style.anchor || 'bottom'
              },
              paint: {
                'icon-opacity': style.opacity || 1
              }
            };

            this.map.addLayer(iconLayerConfig);
            successCount++;

            console.log(`MapboxGL._addUnclusteredLayer: 成功添加样式图层 ${layerId} (${successCount}/${totalValidStyles})`);
            return;
          }

          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            try {
              // 再次检查图标是否已经存在（防止并发加载）
              if (!this.map.hasImage(iconId)) {
                this.map.addImage(iconId, img)
              }
              console.log(`MapboxGL._addUnclusteredLayer: 成功加载图标 ${iconId}`)

              // 计算正确的 icon-size
              const iconSize = (style.width / img.width) || 1

              // 添加图标图层
              const iconLayerConfig = {
                id: layerId,
                type: 'symbol',
                source: sourceId,
                filter: [
                  'all',
                  ['!', ['has', 'point_count']],
                  ['==', ['get', 'styleId'], style.id || `style_${styleIndex}`]
                ],
                layout: {
                  'icon-image': iconId,
                  'icon-size': iconSize,
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                  'icon-offset': style.offset || [0, 0],
                  'icon-rotation-alignment': style.faceForward === 'lieFlat' ? 'map' : 'viewport',
                  'icon-pitch-alignment': style.faceForward === 'lieFlat' ? 'map' : 'viewport',
                  'icon-rotate': style.rotation || 0,
                  'icon-anchor': style.anchor || 'bottom'
                },
                paint: {
                  'icon-opacity': style.opacity || 1
                }
              };

              this.map.addLayer(iconLayerConfig);
              successCount++;

              console.log(`MapboxGL._addUnclusteredLayer: 成功添加样式图层 ${layerId} (${successCount}/${totalValidStyles})`);

              // 验证图层是否真的被添加
              setTimeout(() => {
                const addedLayer = this.map.getLayer(layerId);
                if (addedLayer) {
                  console.log(`MapboxGL._addUnclusteredLayer: 验证成功，样式图层 ${layerId} 存在`);
                } else {
                  console.error(`MapboxGL._addUnclusteredLayer: 验证失败，样式图层 ${layerId} 不存在`);
                }
              }, 100);
            } catch (error) {
              console.warn(`MapboxGL._addUnclusteredLayer: 添加图标失败:`, error)

              // 检查是否所有样式都处理完了
              if (styleIndex === nonClustersStyle.length - 1 && successCount === 0) {
                console.log(`MapboxGL._addUnclusteredLayer: 所有样式图标加载失败，添加默认图层`);
                this._addDefaultUnclusteredLayer(clusterId, sourceId);
              }
            }
          }
          img.onerror = (error) => {
            console.warn(`MapboxGL._addUnclusteredLayer: 样式 ${style.id || styleIndex} 图标加载失败:`, error);

            // 检查是否所有样式都处理完了
            if (styleIndex === nonClustersStyle.length - 1 && successCount === 0) {
              console.log(`MapboxGL._addUnclusteredLayer: 所有样式图标加载失败，添加默认图层`);
              this._addDefaultUnclusteredLayer(clusterId, sourceId);
            }
          }
          img.src = style.src
        } else {
          console.warn(`MapboxGL._addUnclusteredLayer: 样式 ${styleIndex} 无效，跳过`);

          // 如果这是最后一个样式且所有样式都无效，添加默认图层
          if (styleIndex === nonClustersStyle.length - 1 && totalValidStyles === 0) {
            console.log('MapboxGL._addUnclusteredLayer: 没有有效样式，添加默认图层');
            this._addDefaultUnclusteredLayer(clusterId, sourceId);
          }
        }
      });
    } else {
      // 没有提供样式，使用默认样式
      console.log(`MapboxGL._addUnclusteredLayer: 没有图标样式，使用默认圆形样式`);
      this._addDefaultUnclusteredLayer(clusterId, sourceId);
    }
  }

  /**
   * 添加默认未聚合点图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @private
   */
  _addDefaultUnclusteredLayer(clusterId, sourceId) {
    try {
      const layerConfig = {
        id: `${clusterId}-unclustered`,
        type: 'symbol',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-size': 0.5,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        },
        paint: {
          'icon-color': '#ff0000'
        }
      }

      this.map.addLayer(layerConfig)
      console.log(`MapboxGL._addDefaultUnclusteredLayer: 成功添加默认圆形图层 ${clusterId}-unclustered`)
    } catch (error) {
      console.error('MapboxGL._addDefaultUnclusteredLayer: 添加默认图层失败:', error)
    }
  }

  /**
   * 添加自定义DOM方式的未聚合点图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} nonClustersDom - 自定义DOM配置
   * @private
   */
  _addUnclusteredDomLayer(clusterId, sourceId, nonClustersDom) {
    try {
      console.log(`MapboxGL._addUnclusteredDomLayer: 开始添加自定义DOM未聚合点图层 ${clusterId}`);

      // 检查数据源是否存在
      if (!this.map.getSource(sourceId)) {
        console.error(`MapboxGL._addUnclusteredDomLayer: 数据源 ${sourceId} 不存在`);
        return;
      }

      // 创建自定义DOM标记点
      const markers = [];
      const source = this.map.getSource(sourceId);

      if (source && source._data && source._data.features) {
        source._data.features.forEach(feature => {
          if (!feature.properties.point_count) {
            // 创建自定义DOM元素
            const element = this._createCustomDomElement(nonClustersDom, feature);

            // 创建标记点
            const marker = new mapboxgl.Marker({
              element: element,
              anchor: 'bottom'
            }).setLngLat(feature.geometry.coordinates).addTo(this.map);

            markers.push(marker);
          }
        });
      }

      // 存储标记点引用
      this.layers.set(`${clusterId}-unclustered-dom-markers`, markers);
      console.log(`MapboxGL._addUnclusteredDomLayer: 成功添加自定义DOM图层，包含 ${markers.length} 个标记点`);

    } catch (error) {
      console.error('MapboxGL._addUnclusteredDomLayer: 添加自定义DOM图层失败:', error);
    }
  }

  /**
   * 创建自定义DOM元素
   * @param {object} domConfig - DOM配置
   * @param {object} feature - 特征数据
   * @returns {HTMLElement} DOM元素
   * @private
   */
  _createCustomDomElement(domConfig, feature) {
    const element = document.createElement('div');
    element.className = 'ht-map-cluster-marker';

    // 应用样式
    if (domConfig.style) {
      Object.assign(element.style, domConfig.style);
    }

    // 设置内容
    if (domConfig.content) {
      if (typeof domConfig.content === 'string') {
        element.innerHTML = domConfig.content;
      } else if (domConfig.content instanceof HTMLElement) {
        element.appendChild(domConfig.content.cloneNode(true));
      }
    }

    // 如果是Canvas内容
    if (domConfig.canvasDom) {
      element.innerHTML = domConfig.canvasDom;
      const canvas = element.querySelector('canvas');
      if (canvas) {
        // 这里可以进一步处理Canvas绘制
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 例如绘制一个简单的圆
          ctx.fillStyle = '#4b98fa';
          ctx.beginPath();
          ctx.arc(canvas.width/2, canvas.height/2, canvas.width/4, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }

    // 设置属性
    if (domConfig.attributes) {
      Object.entries(domConfig.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    // 为点击事件添加ID属性
    if (feature.properties && feature.properties.id) {
      element.setAttribute('data-marker-id', feature.properties.id);
    }

    return element;
  }

  /**
   * 安全加载图片
   * @param {string} src - 图片源
   * @param {string} iconId - 图标ID
   * @param {Function} onSuccess - 成功回调
   * @param {Function} onError - 错误回调
   * @private
   */
  _safeLoadImage(src, iconId, onSuccess, onError) {
    try {
      // 检查图标是否已经存在
      if (this.map.hasImage && this.map.hasImage(iconId)) {
        console.log(`MapboxGL._safeLoadImage: 图标 ${iconId} 已存在，跳过加载`)
        onSuccess()
        return
      }

      // 使用 Image 对象加载图片
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          this.map.addImage(iconId, img)
          console.log(`MapboxGL._safeLoadImage: 成功加载图标 ${iconId}`)
          onSuccess(img)
        } catch (error) {
          console.warn('MapboxGL._safeLoadImage: 添加图标失败:', error)
          onError(error)
        }
      }
      img.onerror = (error) => {
        console.warn('MapboxGL._safeLoadImage: 图片加载失败:', error)
        onError(error)
      }
      img.src = src
    } catch (error) {
      console.warn('MapboxGL._safeLoadImage: 加载图标时发生错误:', error)
      onError(error)
    }
  }

  /**
   * 添加聚合圆圈图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} clusterStyle - 聚合样式
   * @param {number} minCount - 最小聚合数
   * @private
   */
  _addClusterCircleLayers(clusterId, sourceId, clusterStyle, minCount = 2) {
    // 处理测试页面参数格式 - circleColor, circleRadius, strokeColor, strokeWidth
    if (clusterStyle.circleColor && clusterStyle.circleRadius) {
      // 使用测试页面的参数格式
      if (Array.isArray(clusterStyle.circleColor)) {
        // 动态颜色配置 - 转换为 MapboxGL 格式
        const colors = this._convertDynamicColorArray(clusterStyle.circleColor)
        const radii = Array.isArray(clusterStyle.circleRadius) ? clusterStyle.circleRadius : [clusterStyle.circleRadius]

        colors.forEach((colorConfig, i) => {
          const radius = radii[Math.min(i, radii.length - 1)] || 30
          const strokeColor = this._getStrokeColorByIndex(clusterStyle.strokeColor, i)

          this.map.addLayer({
            id: `${clusterId}-circle-${i}`,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-color': colorConfig[1],
              'circle-radius': radius,
              'circle-stroke-color': strokeColor || '#ffffff',
              'circle-stroke-width': clusterStyle.strokeWidth || 2
            },
            filter: i === 0 ?
              ['>=', 'point_count', Math.max(colorConfig[0], minCount)] :
              ['all', ['>=', 'point_count', Math.max(colorConfig[0], minCount)], ['<', 'point_count', colors[i - 1][0]]]
          })
        })
      } else {
        // 单一颜色配置
        this.map.addLayer({
          id: `${clusterId}-circle-0`,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-color': clusterStyle.circleColor,
            'circle-radius': clusterStyle.circleRadius,
            'circle-stroke-color': clusterStyle.strokeColor || '#ffffff',
            'circle-stroke-width': clusterStyle.strokeWidth || 2
          },
          filter: ['>=', 'point_count', minCount]
        })
      }
    } else {
      // 使用 MineMap 兼容的参数格式
      // 添加外圈图层
      clusterStyle.outerColors.forEach((color, i) => {
        this.map.addLayer({
          id: `${clusterId}-outer-${i}`,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-color': color[1],
            'circle-radius': clusterStyle.outerRadius
          },
          filter: i === 0 ?
            ['>=', 'point_count', Math.max(color[0], minCount)] :
            ['all', ['>=', 'point_count', Math.max(color[0], minCount)], ['<', 'point_count', clusterStyle.outerColors[i - 1][0]]]
        })
      })

      // 添加内圈图层
      clusterStyle.innerColors.forEach((color, i) => {
        this.map.addLayer({
          id: `${clusterId}-inner-${i}`,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-color': color[1],
            'circle-radius': clusterStyle.innerRadius
          },
          filter: i === 0 ?
            ['>=', 'point_count', Math.max(color[0], minCount)] :
            ['all', ['>=', 'point_count', Math.max(color[0], minCount)], ['<', 'point_count', clusterStyle.innerColors[i - 1][0]]]
        })
      })
    }
  }

  /**
   * 添加聚合文字图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} clusterStyle - 聚合样式
   * @param {number} minCount - 最小聚合数
   * @private
   */
  _addClusterTextLayer(clusterId, sourceId, clusterStyle, minCount = 2) {
    // 处理自定义展示内容
    let textField = '{point_count}' // 默认显示聚合个数
    if (clusterStyle.clusterCustomEnabled && clusterStyle.clusterCustom) {
      try {
        // 如果提供了自定义展示内容，尝试使用
        if (typeof clusterStyle.clusterCustom === 'string') {
          textField = clusterStyle.clusterCustom
        } else if (Array.isArray(clusterStyle.clusterCustom)) {
          textField = clusterStyle.clusterCustom
        }
      } catch (error) {
        console.warn('MapboxGL._addClusterTextLayer: 自定义展示内容解析失败，使用默认:', error)
        textField = '{point_count}'
      }
    }
    this.map.addLayer({
      id: `${clusterId}-count`,
      type: 'symbol',
      source: sourceId,
      layout: {
        'text-field': textField,
        'text-size': clusterStyle.textSize,
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': clusterStyle.textColor,
        'text-halo-color': clusterStyle.textHaloColor,
        'text-halo-width': clusterStyle.textHaloWidth
      },
      filter: ['all', ['has', 'point_count'], ['>=', 'point_count', minCount]]
    })
  }

  /**
   * 转换动态颜色数组为 MapboxGL 格式
   * @param {Array} colorArray - 动态颜色数组 [color1, count1, color2, count2, ...]
   * @returns {Array} 转换后的格式 [[count1, color1], [count2, color2], ...]
   * @private
   */
  _convertDynamicColorArray(colorArray) {
    if (!Array.isArray(colorArray)) return [[2, '#51bbd6']]

    const result = []
    for (let i = 0; i < colorArray.length; i += 2) {
      if (i + 1 < colorArray.length) {
        const color = colorArray[i]
        const count = colorArray[i + 1]
        result.push([count, color])
      }
    }
    return result.length > 0 ? result : [[2, '#51bbd6']]
  }

  /**
   * 根据索引获取边框颜色
   * @param {string|Array} strokeColorConfig - 边框颜色配置
   * @param {number} index - 索引
   * @returns {string} 边框颜色
   * @private
   */
  _getStrokeColorByIndex(strokeColorConfig, index) {
    if (typeof strokeColorConfig === 'string') {
      return strokeColorConfig
    } else if (Array.isArray(strokeColorConfig)) {
      // 动态边框颜色配置
      const strokeColors = this._convertDynamicColorArray(strokeColorConfig)
      const strokeColorItem = strokeColors[Math.min(index, strokeColors.length - 1)]
      return strokeColorItem ? strokeColorItem[1] : '#ffffff'
    }
    return '#ffffff'
  }

  /**
   * 绑定聚合事件
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {Array} geometries - 几何数据
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   * @private
   */
  _bindClusterEvents(clusterId, sourceId, geometries, eventType, callback) {
    const supportedEvents = ['click', 'dblclick', 'contextmenu', 'mouseenter', 'mouseleave', 'mousemove'];

    if (!supportedEvents.includes(eventType)) {
      console.warn(`MapboxGL._bindClusterEvents: 不支持的事件类型: ${eventType}`);
      return [];
    }

    // 获取聚合实例以获取原始配置
    const cluster = this.layers.get(clusterId);
    const nonClustersStyle = cluster?.config?.nonClustersStyle || [];

    // 存储所有监听器引用
    const listeners = [];
    const domListeners = [];

    // 绑定聚合点事件
    const clusterLayerId = `${clusterId}-circle-0`;

    console.log(`MapboxGL._bindClusterEvents: 绑定聚合图层事件 ${clusterLayerId}`);

    // 创建聚合点事件监听器
    const clusterListener = (evt) => {
      if (evt.features && evt.features.length > 0) {
        const feature = evt.features[0];
        const clusterIdValue = feature.properties.cluster_id;

        // 如果是点击事件且启用了 zoomOnClick，则放大到聚合
        if (eventType === 'click') {
          const cluster = this.layers.get(clusterId);
          if (cluster && cluster.config.clusterConfig.zoomOnClick) {
            this.map.getSource(sourceId).getClusterExpansionZoom(clusterIdValue, (error, zoom) => {
              if (error) {
                console.error('MapboxGL._bindClusterEvents: 获取聚合放大层级失败:', error);
                return;
              }

              this.map.easeTo({
                center: feature.geometry.coordinates,
                zoom: zoom,
                duration: 1000,
                easing: (t) => t * (2 - t) // easeOutQuad
              });

              console.log(`MapboxGL._bindClusterEvents: 聚合下探，从缩放级别 ${this.map.getZoom()} 到 ${zoom}`);
            });
          }
        }

        // 获取聚合内的点
        this.map.getSource(sourceId).getClusterLeaves(clusterIdValue, Infinity, 0, (error, leaves) => {
          if (error) {
            console.error('MapboxGL._bindClusterEvents: 获取聚合点失败:', error);
            return;
          }

          const eventData = {
            clusterId: clusterIdValue,
            geometries: leaves,
            point: evt.point,
            bounds: this._calculateClusterBounds(leaves),
            lngLat: {
              lng: evt.lngLat.lng,
              lat: evt.lngLat.lat
            },
            type: eventType,
            timestamp: Date.now()
          };

          callback(eventData);
        });
      }
    };

    // 绑定聚合点事件并保存监听器引用
    if (this.map.getLayer(clusterLayerId)) {
      this.map.on(eventType, clusterLayerId, clusterListener);
      listeners.push({ layerId: clusterLayerId, listener: clusterListener });
    }

    // 绑定未聚合点图层事件

    // 检查是否有自定义样式的未聚合点图层
    let hasCustomStyles = false;

    // 为每个样式图层绑定事件
    nonClustersStyle.forEach((style, styleIndex) => {
      const layerId = `${clusterId}-unclustered-${style.id || styleIndex}`;

      if (this.map.getLayer(layerId)) {
        hasCustomStyles = true;

        const unclusteredListener = (evt) => {
          if (evt.features && evt.features.length > 0) {
            const feature = evt.features[0];
            const geometry = geometries.find(geo => geo.id === feature.properties.id);

            if (geometry) {
              const eventData = {
                geometry: geometry,
                lngLat: {
                  lng: evt.lngLat.lng,
                  lat: evt.lngLat.lat
                },
                point: evt.point,
                target: {
                  properties: geometry.properties
                },
                type: eventType,
                timestamp: Date.now()
              };

              callback(eventData);
            }
          }
        };

        this.map.on(eventType, layerId, unclusteredListener);
        listeners.push({ layerId: layerId, listener: unclusteredListener });
      }
    });

    // 如果没有自定义样式，检查默认未聚合点图层
    if (!hasCustomStyles) {
      const defaultLayerId = `${clusterId}-unclustered`;
      if (this.map.getLayer(defaultLayerId)) {
        const defaultUnclusteredListener = (evt) => {
          if (evt.features && evt.features.length > 0) {
            const feature = evt.features[0];
            const geometry = geometries.find(geo => geo.id === feature.properties.id);

            if (geometry) {
              const eventData = {
                geometry: geometry,
                lngLat: {
                  lng: evt.lngLat.lng,
                  lat: evt.lngLat.lat
                },
                point: evt.point,
                target: {
                  properties: geometry.properties
                },
                type: eventType,
                timestamp: Date.now()
              };

              callback(eventData);
            }
          }
        };

        this.map.on(eventType, defaultLayerId, defaultUnclusteredListener);
        listeners.push({ layerId: defaultLayerId, listener: defaultUnclusteredListener });
      }
    }

    // 处理自定义DOM标记点事件
    const markers = this.layers.get(`${clusterId}-unclustered-dom-markers`);
    if (Array.isArray(markers) && markers.length > 0) {
      markers.forEach((marker, index) => {
        const element = marker.getElement();
        if (!element) return;

        const markerId = element.getAttribute('data-marker-id');
        const geometry = markerId ? geometries.find(geo => geo.id === markerId) : geometries[index];

        if (!geometry) return;

        // 绑定DOM事件
        const domEventType = eventType === 'contextmenu' ? 'contextmenu' :
          eventType === 'dblclick' ? 'dblclick' :
            eventType === 'mouseenter' ? 'mouseenter' :
              eventType === 'mouseleave' ? 'mouseleave' :
                eventType === 'mousemove' ? 'mousemove' : 'click';

        const domListener = (evt) => {
          const lngLat = marker.getLngLat();

          const eventData = {
            geometry: geometry,
            lngLat: {
              lng: lngLat.lng,
              lat: lngLat.lat
            },
            point: { x: evt.clientX, y: evt.clientY },
            target: {
              properties: geometry.properties
            },
            type: eventType,
            timestamp: Date.now()
          };

          callback(eventData);
        };

        element.addEventListener(domEventType, domListener);
        domListeners.push({ element: element, domEventType: domEventType, listener: domListener });
      });
    }

    // 返回所有监听器引用
    const result = [...listeners];
    if (domListeners.length > 0) {
      result.domListeners = domListeners;
    }
    return result;
  }

  /**
   * 计算聚合边界
   * @param {Array} leaves - 聚合内的点
   * @returns {object} 边界信息
   * @private
   */
  _calculateClusterBounds(leaves) {
    if (!leaves || leaves.length === 0) return null

    let minLng = Infinity, minLat = Infinity
    let maxLng = -Infinity, maxLat = -Infinity

    leaves.forEach(leaf => {
      const [lng, lat] = leaf.geometry.coordinates
      minLng = Math.min(minLng, lng)
      minLat = Math.min(minLat, lat)
      maxLng = Math.max(maxLng, lng)
      maxLat = Math.max(maxLat, lat)
    })

    return {
      sw: [minLng, minLat],
      ne: [maxLng, maxLat]
    }
  }

  /**
   * 解绑聚合事件
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {string} eventType - 事件类型
   * @private
   */
  _unbindClusterEvents(clusterId, sourceId, eventType) {
    const supportedEvents = ['click', 'dblclick', 'contextmenu', 'mouseenter', 'mouseleave', 'mousemove'];

    if (!supportedEvents.includes(eventType)) {
      console.warn(`MapboxGL._unbindClusterEvents: 不支持的事件类型: ${eventType}`);
      return;
    }

    // 获取聚合实例以获取原始配置
    const cluster = this.layers.get(clusterId);
    const nonClustersStyle = cluster?.config?.nonClustersStyle || [];

    // 解绑聚合点主图层事件
    const clusterLayerId = `${clusterId}-circle-0`;
    if (this.map.getLayer(clusterLayerId)) {
      console.log(`MapboxGL._unbindClusterEvents: 解绑聚合图层事件 ${clusterLayerId}`);
      this.map.off(eventType, clusterLayerId);
    }

    // 解绑聚合文字图层事件
    const countLayerId = `${clusterId}-count`;
    if (this.map.getLayer(countLayerId)) {
      console.log(`MapboxGL._unbindClusterEvents: 解绑聚合文字图层事件 ${countLayerId}`);
      this.map.off(eventType, countLayerId);
    }

    // 解绑未聚合点图层事件

    // 处理自定义样式的未聚合点图层
    nonClustersStyle.forEach((style, styleIndex) => {
      const layerId = `${clusterId}-unclustered-${style.id || styleIndex}`;

      if (this.map.getLayer(layerId)) {
        this.map.off(eventType, layerId);
      }
    });

    // 检查默认未聚合点图层
    const defaultLayerId = `${clusterId}-unclustered`;
    if (this.map.getLayer(defaultLayerId)) {
      this.map.off(eventType, defaultLayerId);
    }

    // 处理自定义DOM标记点事件
    const markers = this.layers.get(`${clusterId}-unclustered-dom-markers`);
    if (Array.isArray(markers) && markers.length > 0) {
      markers.forEach((marker) => {
        const element = marker.getElement();
        if (!element) return;

        // 解绑DOM事件
        const domEventType = eventType === 'contextmenu' ? 'contextmenu' :
          eventType === 'dblclick' ? 'dblclick' :
            eventType === 'mouseenter' ? 'mouseenter' :
              eventType === 'mouseleave' ? 'mouseleave' :
                eventType === 'mousemove' ? 'mousemove' : 'click';

        const clonedElement = element.cloneNode(true);
        element.parentNode.replaceChild(clonedElement, element);
      });
    }
  }

  /**
   * 移除聚合图层
   * @param {string} clusterId - 聚合ID
   * @private
   */
  _removeClusterLayers(clusterId) {
    const layerIds = [
      `${clusterId}-unclustered`,
      `${clusterId}-count`
    ]
    // 获取聚合实例以获取原始配置
    const cluster = this.layers.get(clusterId)
    const clusterStyle = cluster?.config?.clusterStyle || {}
    const nonClustersStyle = cluster?.config?.nonClustersStyle || []

    // 根据实际配置移除外圈和内圈图层
    if (clusterStyle.outerColors) {
      clusterStyle.outerColors.forEach((color, i) => {
        layerIds.push(`${clusterId}-outer-${i}`)
      })
    }

    if (clusterStyle.innerColors) {
      clusterStyle.innerColors.forEach((color, i) => {
        layerIds.push(`${clusterId}-inner-${i}`)
      })
    }
    // 额外清理：移除所有以 clusterId 开头的图层（防止遗漏）
    const allLayers = this.map?.getStyle().layers || []
    allLayers.forEach(layer => {
      if (layer.id && layer.id.startsWith(clusterId)) {
        layerIds.push(layer.id)
      }
    })
    // 移除所有图层
    layerIds.forEach(layerId => {
      if (this.map?.getLayer(layerId)) {
        this.map.removeLayer(layerId)
        console.log(`MapboxGL._removeClusterLayers: 已移除图层 ${layerId}`)
      }
    })

    nonClustersStyle.forEach((style, styleIndex) => {
      if (style && style.id) {
        const layerId = `${clusterId}-unclustered-${style.id}`
        layerIds.push(layerId)

        // 移除对应的图标资源
        const iconId = `${clusterId}-icon-${style.id}`
        if (this.map?.hasImage && this.map?.hasImage(iconId)) {
          this.map.removeImage(iconId)
          console.log(`MineMap._removeClusterLayers: 已移除图标 ${iconId}`)
        }
      } else {
        // 如果没有id，使用索引
        const layerId = `${clusterId}-unclustered-${styleIndex}`
        layerIds.push(layerId)

        const iconId = `${clusterId}-icon-${styleIndex}`
        if (this.map?.hasImage && this.map?.hasImage(iconId)) {
          this.map.removeImage(iconId)
          console.log(`MineMap._removeClusterLayers: 已移除图标 ${iconId}`)
        }
      }
    })

    // 移除图标资源
    const iconId = `${clusterId}-icon`
    if (this.map?.hasImage && this.map?.hasImage(iconId)) {
      this.map.removeImage(iconId)
      console.log(`MapboxGL._removeClusterLayers: 已移除图标 ${iconId}`)
    }
  }

  /**
   * 设置聚合图层可见性
   * @param {string} clusterId - 聚合ID
   * @param {boolean} visible - 是否可见
   * @private
   */
  _setClusterLayersVisible(clusterId, visible) {
    // 获取聚合实例以获取原始配置
    const cluster = this.layers.get(clusterId)
    const clusterStyle = cluster?.config?.clusterStyle || {}
    const layerIds = [
      `${clusterId}-unclustered`,
      `${clusterId}-count`
    ]

    // 根据实际配置添加外圈和内圈图层ID
    if (clusterStyle.outerColors) {
      clusterStyle.outerColors.forEach((color, i) => {
        layerIds.push(`${clusterId}-outer-${i}`)
      })
    }

    if (clusterStyle.innerColors) {
      clusterStyle.innerColors.forEach((color, i) => {
        layerIds.push(`${clusterId}-inner-${i}`)
      })
    }

    const visibility = visible ? 'visible' : 'none'
    layerIds.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, 'visibility', visibility)
      }
    })
  }

  /**
   * 获取聚合图层可见性
   * @param {string} clusterId - 聚合ID
   * @returns {boolean} 是否可见
   * @private
   */
  _getClusterLayersVisible(clusterId) {
    const unclusteredLayerId = `${clusterId}-unclustered`
    if (this.map.getLayer(unclusteredLayerId)) {
      const visibility = this.map.getLayoutProperty(unclusteredLayerId, 'visibility')
      return visibility !== 'none'
    }

    const countLayerId = `${clusterId}-count`
    if (this.map.getLayer(countLayerId)) {
      const visibility = this.map.getLayoutProperty(countLayerId, 'visibility')
      return visibility !== 'none'
    }

    return false
  }

  /**
   * 移除聚合
   * @param {string} id - 聚合ID
   */
  removeCluster(id) {
    const cluster = this.layers.get(id)
    if (cluster && typeof cluster.removeCluster === 'function') {
      cluster.removeCluster()
    }
  }

  /**
   * 获取所有聚合
   * @returns {Array} 聚合列表
   */
  getClusters() {
    const clusters = []
    this.layers.forEach((layer, id) => {
      if (layer && typeof layer.updateData === 'function') {
        clusters.push(layer)
      }
    })
    return clusters
  }

  /**
   * 计算图标大小
   * @param {object} style - 样式配置
   * @returns {number} 图标大小比例
   * @private
   */
  _calculateIconSize(style) {
    // 如果样式中直接指定了 iconSize，使用它
    if (style.iconSize !== undefined) {
      return 0.5||style.iconSize
    }

    // 如果指定了 width，基于 width 计算
    if (style.width !== undefined) {
      // MapboxGL 中图标大小是相对于图标原始尺寸的比例
      // 假设大多数图标的原始尺寸在 32px 左右
      return 0.5||style.width / 32
    }

    // 默认大小
    return 0.5
  }

  /**
   * 清理所有聚合资源
   * @private
   */
  _cleanupAllClusterResources() {
    try {
      this.layers.forEach((layer, id) => {
        if (layer && typeof layer.removeCluster === 'function') {
          layer.removeCluster()
        }
      })
      console.log('MapboxGL._cleanupAllClusterResources: 成功清理所有聚合资源')
    } catch (error) {
      console.error('MapboxGL._cleanupAllClusterResources: 清理聚合资源时出错:', error)
    }
  }

  /**
   * 批量添加多边形 - 支持 HTMap 标准参数格式
   * @param {object} options - 多边形配置对象 {map, id, geometries, styles}
   * @returns {object} 多边形组对象
   */
  addPolygons(options) {
    if (!this.map) return null

    // 验证必要参数
    if (!options || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      console.warn('MapboxGL.addPolygons: geometries 数组不能为空')
      return null
    }

    const groupId = options.id || `polygons_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sourceId = `${groupId}-source`

    try {
      // 验证与标准化样式
      const styles = this._validatePolygonStyles(options.styles)
      // 验证与标准化几何
      const geometries = this._validatePolygonGeometries(options.geometries, styles)

      const isConvexByStyleId = id=>styles.find(style => style.id === id)?.isConvex

      if (geometries.length === 0) {
        console.warn('MapboxGL.addPolygons: 没有有效的几何数据')
        return null
      }

      // 构建 GeoJSON
      const geojsonData = {
        type: 'FeatureCollection',
        features: geometries.map(geometry => ({
          type: 'Feature',
          id: geometry.id,
          geometry: {
            type: 'Polygon',
            coordinates: isConvexByStyleId(geometry.styleId) ? generateConvexPolygon(geometry.paths) : [geometry.paths]
          },
          properties: {
            ...geometry.properties,
            id: geometry.id,
            styleId: geometry.styleId
          }
        }))
      }

      // 添加数据源
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId)
      }
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData
      })

      // 创建样式图层（填充 + 边线）
      const createdLayers = []
      styles.forEach((style, idx) => {
        const baseLayerId = `${groupId}-fill-${style.id || idx}`
        const outlineLayerId = `${groupId}-outline-${style.id || idx}`

        // 填充层
        this.map.addLayer({
          id: baseLayerId,
          type: 'fill',
          source: sourceId,
          filter: ['==', ['get', 'styleId'], style.id || `polygon_style_${idx}`],
          layout: {},
          paint: {
            'fill-color': style.color,
            'fill-opacity': 1
          }
        })
        createdLayers.push(baseLayerId)

        // 边线层
        this.map.addLayer({
          id: outlineLayerId,
          type: 'line',
          source: sourceId,
          filter: ['==', ['get', 'styleId'], style.id || `polygon_style_${idx}`],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': style.borderColor || '#ffffff',
            'line-width': Number(style.borderWidth) || 2,
            ...(Array.isArray(style.borderDashArray) && style.borderDashArray.length === 2 && (Number(style.borderDashArray[0]) !== 0 || Number(style.borderDashArray[1]) !== 0)
              ? { 'line-dasharray': [Number(style.borderDashArray[0]), Number(style.borderDashArray[1])] }
              : {})
          }
        })
        createdLayers.push(outlineLayerId)
      })

      // 构建多边形组对象
      const polygonGroup = {
        id: groupId,
        sourceId,
        layerId: createdLayers, // 兼容命名
        layers: createdLayers,
        geometries:options.geometries,
        styles,

        // 事件绑定（为所有样式图层绑定）
        on: (eventType, callback) => {
          (createdLayers || []).forEach(layerId => {
            if (!this.map.getLayer(layerId)) return
            this.map.on(eventType, layerId, (evt) => {
              if (evt.features && evt.features.length > 0) {
                const feature = evt.features[0]
                const geom = geometries.find(g => g.id === feature.properties.id)
                if (geom) {
                  callback({
                    geometry: geom,
                    properties: geom.properties,
                    lngLat: evt.lngLat,
                    point: evt.point,
                    feature: feature,
                    layerId,
                    sourceId,
                    type: eventType,
                    timestamp: Date.now()
                  })
                }
              }
            })
          })
        },
        off: (eventType, callback) => {
          (createdLayers || []).forEach(layerId => {
            if (!this.map.getLayer(layerId)) return
            // MapboxGL off 需要相同的回调引用；如无，清理不做强制
            if (callback) {
              this.map.off(eventType, layerId, callback)
            }
          })
        },

        // 添加几何
        addGeometries: (newGeometries) => {
          const validated = this._validatePolygonGeometries(newGeometries, styles)
          if (validated.length === 0) return false
          polygonGroup.geometries.push(...validated)
          const next = {
            type: 'FeatureCollection',
            features: polygonGroup.geometries.map(geometry => ({
              type: 'Feature',
              id: geometry.id,
              geometry: {
                type: 'Polygon',
                coordinates: isConvexByStyleId(geometry.styleId) ? generateConvexPolygon(geometry.paths) : [geometry.paths]
              },
              properties: {
                ...geometry.properties,
                styleId: geometry.styleId
              }
            }))
          }
          const src = this.map.getSource(sourceId)
          if (src) src.setData(next)
          return true
        },

        // 删除几何
        removeGeometries: (idsToDelete) => {
          if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) return false
          polygonGroup.geometries = polygonGroup.geometries.filter(g => !idsToDelete.includes(g.id))
          const next = {
            type: 'FeatureCollection',
            features: polygonGroup.geometries.map(geometry => ({
              type: 'Feature',
              id: geometry.id,
              geometry: {
                type: 'Polygon',
                coordinates: isConvexByStyleId(geometry.styleId) ? generateConvexPolygon(geometry.paths) : [geometry.paths]
              },
              properties: {
                ...geometry.properties,
                styleId: geometry.styleId
              }
            }))
          }
          const src = this.map.getSource(sourceId)
          if (src) src.setData(next)
          return true
        },

        // 更新几何
        updatePolygonsGeometries: (updatedGeometries) => {
          const validated = this._validatePolygonGeometries(updatedGeometries, styles)
          const mapById = new Map(validated.map(g => [g.id, g]))
          polygonGroup.geometries = (polygonGroup.geometries || []).map(g => mapById.get(g.id) || g)
          const next = {
            type: 'FeatureCollection',
            features: polygonGroup.geometries.map(geometry => ({
              type: 'Feature',
              id: geometry.id,
              geometry: {
                type: 'Polygon',
                coordinates: isConvexByStyleId(geometry.styleId) ? generateConvexPolygon(geometry.paths) : [geometry.paths]
              },
              properties: {
                ...geometry.properties,
                styleId: geometry.styleId
              }
            }))
          }
          const src = this.map.getSource(sourceId)
          if (src) src.setData(next)
        },

        // 可见性控制
        setVisible: (visible) => {
          const visibility = visible ? 'visible' : 'none'
          createdLayers.forEach(layerId => {
            if (this.map.getLayer(layerId)) {
              this.map.setLayoutProperty(layerId, 'visibility', visibility)
            }
          })
        },
        getVisible: () => {
          if (createdLayers.length > 0 && this.map.getLayer(createdLayers[0])) {
            return this.map.getLayoutProperty(createdLayers[0], 'visibility') !== 'none'
          }
          return false
        },

        // 数据获取
        getGeometries: () => {
          return polygonGroup.geometries.map(geo => ({
            ...geo,
            paths: geo.properties?.originPaths || geo.paths  // 优先返回原始坐标
          }))
        },

        // 移除
        removePolygons: () => {
          [...createdLayers].reverse().forEach(layerId => {
            if (this.map?.getLayer(layerId)) {
              this.map.removeLayer(layerId)
            }
          })
          if (this.map?.getSource(sourceId)) {
            this.map.removeSource(sourceId)
          }
        }
      }

      // 记录并返回
      this.layers.set(groupId, polygonGroup)
      console.log(`✅ 成功添加多边形组 ${groupId}，包含 ${geometries.length} 个多边形`)
      return polygonGroup

    } catch (error) {
      console.error('MapboxGL.addPolygons: 添加多边形失败:', error)
      return null
    }
  }

  // ----------------------------------路径规划----------------------------------


  /**
   * 路径规划前置接口
   * @param {Array} styles
   * @returns {Array}
   * @private
   */
  getRoute(options){
    return Promise.resolve({
      message: 'Success',
      route:{
        distance: 0,
        polyline: [
          [options.from.lng, options.from.lat],
          ...options.waypoints.map(point => [point.lng, point.lat]),
          [options.to.lng, options.to.lat],
        ],
      },
      status:0
    })  // 默认返回空数组
  }

  /**
   * 验证与标准化多边形样式
   * @param {Array} styles
   * @returns {Array}
   * @private
   */
  _validatePolygonStyles(styles) {
    if (!Array.isArray(styles) || styles.length === 0) {
      return [this._getDefaultPolygonStyle()]
    }
    return styles.map((style, index) => {
      const normalized = {
        id: style.id || `polygon_style_${index}`,
        color: style.color || 'rgba(75,152,250,0.3)',
        borderColor: style.borderColor || 'rgba(75, 152, 250, 1)',
        borderWidth: Number(style.borderWidth) || 2,
        borderDashArray: Array.isArray(style.borderDashArray) ? style.borderDashArray.slice(0, 2) : null,
        // 默认为false
        isConvex: style.isConvex !== undefined ? Boolean(style.isConvex) : false
      }
      if (Array.isArray(normalized.borderDashArray) && normalized.borderDashArray.length === 2) {
        if (Number(normalized.borderDashArray[0]) === 0 && Number(normalized.borderDashArray[1]) === 0) {
          normalized.borderDashArray = null
        }
      } else {
        normalized.borderDashArray = null
      }
      return normalized
    })
  }

  _getDefaultPolygonStyle() {
    return {
      id: `default_polygon_style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      color: 'rgba(75,152,250,0.3)',
      borderColor: 'rgba(75, 152, 250, 1)',
      borderWidth: 2,
      borderDashArray: null,
      isConvex: false // 是否绘制凸多边形
    }
  }

  /**
   * 获取默认图标
   * @returns {string} 默认图标路径
   * @private
   */
  _getDefaultPinImage() {
    // 返回默认的pin图标路径
    return '/src/utils/HTMap/assets/img/defaultPin.png'
  }

  /**
   * 验证与标准化多边形几何
   * @param {Array} geometries
   * @param {Array} styles
   * @returns {Array}
   * @private
   */
  _validatePolygonGeometries(geometries, styles = []) {
    if (!Array.isArray(geometries)) return []

    return geometries.map((geometry, index) => {
      const paths = geometry.paths || geometry.coordinates
      if (!Array.isArray(paths) || paths.length < 3) {
        console.warn(`MapboxGL._validatePolygonGeometries: 几何 ${index} 的 paths 无效，跳过`)
        return null
      }

      // 验证坐标点
      const validatedPaths = paths.map((coord, i) => {
        if (!Array.isArray(coord) || coord.length < 2) {
          console.warn(`MapboxGL._validatePolygonGeometries: 坐标 ${i} 无效，跳过`)
          return null
        }
        const lng = Number(coord[0])
        const lat = Number(coord[1])
        if (isNaN(lng) || isNaN(lat)) {
          console.warn(`MapboxGL._validatePolygonGeometries: 坐标值无效 lng:${coord[0]} lat:${coord[1]}，跳过`)
          return null
        }

        return [lng, lat]
      }).filter(Boolean)

      if (validatedPaths.length < 3) return null

      // 统一坐标转换
      const transformedPaths = this._transformCoordinates(validatedPaths, `多边形几何验证-${index}`)

      // 自动闭合 ring（MapboxGL Polygon 需要闭合环）
      const first = transformedPaths[0]
      const last = transformedPaths[transformedPaths.length - 1]
      if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
        transformedPaths.push([first[0], first[1]])
      }

      // styleId 兜底到第一个样式
      let styleId = geometry.styleId
      if (!styleId && styles.length > 0) styleId = styles[0].id

      return {
        id: geometry.id || `polygon_${index}`,
        properties: {...geometry.properties,originPaths:validatedPaths} || {},
        paths: transformedPaths,
        styleId
      }
    }).filter(Boolean)
  }

  /**
   * 确保箭头图标已加载到地图中
   * @returns {Promise} 加载完成的Promise
   * @private
   */
  _ensureArrowIcon() {
    return new Promise((resolve, reject) => {
      // 检查图标是否已经存在
      if (this.map.hasImage('allow')) {
        resolve()
        return
      }

      try {
        // 创建简单的箭头图标
        const canvas = document.createElement('canvas')
        canvas.width = 20
        canvas.height = 20
        const ctx = canvas.getContext('2d')

        // 绘制类似 > 的简单箭头
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // 绘制 > 形状的箭头
        ctx.beginPath()
        ctx.moveTo(6, 5)    // 左上角起点
        ctx.lineTo(14, 10)  // 箭头尖端（中心右侧）
        ctx.lineTo(6, 15)   // 左下角终点
        ctx.stroke()

        // 添加图标到地图
        const imageData = ctx.getImageData(0, 0, 20, 20)
        this.map.addImage('allow', imageData)
        resolve()
      } catch (error) {
        console.error('创建箭头图标失败:', error)
        reject(error)
      }
    })
  }
}