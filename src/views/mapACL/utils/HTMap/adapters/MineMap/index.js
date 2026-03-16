import MineMapCore from './core/index.js'
import MarkerManager from './marker/index.js'
import MarkersManager from './markers/index.js'
import PopupManager from './popup/index.js'
import InfoWindowManager from './infoWindow/index.js'
import LinesManager from './lines/index.js'
import ClusterManager from './cluster/index.js'
import PolygonsManager from './polygons/index.js'
import TrackManager from './track/index.js'
import ControlManager from './control/index.js'
import EventManager from './events/index.js'
import { buildMineMapConfig } from '../../config/minemapStyleConfig.js'

/**
 * 四维图新MineMap适配器
 * 整合所有功能模块的主类
 */
export default class MineMap extends MineMapCore {
  constructor(containerId, options) {
    super(containerId, options)
    
    // 初始化各个功能管理器
    this.eventManager = new EventManager(this)
    this.markerManager = new MarkerManager(this)
    this.markersManager = new MarkersManager(this)
    this.popupManager = new PopupManager(this)
    this.infoWindowManager = new InfoWindowManager(this)
    this.linesManager = new LinesManager(this)
    this.clusterManager = new ClusterManager(this)
    this.polygonsManager = new PolygonsManager(this)
    this.trackManager = new TrackManager(this)
    this.controlManager = new ControlManager(this)
  }
  // ==================== Marker 相关方法 ====================
  
  /**
   * 添加单个标记点
   * 每次调用都创建新的 MarkerManager 实例，确保每个 marker 都是独立的
   * @param {object} options - 标记点配置
   * @returns {object} 标记点实例
   */
  addDomMarker(options) {
    // 每次创建新的 MarkerManager 实例，确保每个 marker 都是独立的
    const markerManager = new MarkerManager(this)
    return markerManager.addDomMarker(options)
  }

  /**
   * 批量添加标记点
   * @param {object} options - 标记点配置
   * @returns {object} 标记点实例
   */
  addMarkers(options) {
    return this.markersManager.addMarkers(options)
  }

  // ==================== Popup 相关方法 ====================
  
  /**
   * 添加自定义气泡
   * @param {object} options - 气泡配置
   * @returns {object} 气泡实例
   */
  addPopup(options) {
    return this.popupManager.addPopup(options)
  }

  /**
   * 移除气泡
   * @param {string|object} popup - 气泡ID或气泡实例
   */
  removePopup(popup) {
    return this.popupManager.removePopup(popup)
  }

  /**
   * 添加气泡 - 旧版兼容接口
   * @param {object} options - 气泡配置（旧版格式）
   * @returns {object} 气泡实例
   */
  addPopupLegacy(options) {
    // 转换为新版本参数格式
    const params = {
      lngLat: options.lngLat || [options.lng, options.lat],
      content: options.content,
      showCloseBtn: options.showCloseBtn !== false,
      offset: options.offset,
      className: options.className,
      onOpen: options.onOpen,
      onClose: options.onClose,
      onClick: options.onClick
    }

    return this.addPopup(params)
  }

  // ==================== InfoWindow 相关方法 ====================
  
  /**
   * 添加信息窗口
   * @param {object} options - 信息窗口配置
   * @returns {object} 信息窗口实例
   */
  addInfoWindow(options) {
    return this.infoWindowManager.addInfoWindow(options)
  }

  /**
   * 移除信息窗口
   * @param {string} infoWindowId - 信息窗口ID
   */
  removeInfoWindow(infoWindowId) {
    return this.infoWindowManager.removeInfoWindow(infoWindowId)
  }

  /**
   * 显示信息窗口
   * @param {string} infoWindowId - 信息窗口ID
   */
  showInfoWindow(infoWindowId) {
    return this.infoWindowManager.showInfoWindow(infoWindowId)
  }

  /**
   * 隐藏信息窗口
   * @param {string} infoWindowId - 信息窗口ID
   */
  hideInfoWindow(infoWindowId) {
    return this.infoWindowManager.hideInfoWindow(infoWindowId)
  }

  /**
   * 获取所有信息窗口
   * @returns {Array} 信息窗口列表
   */
  getAllInfoWindows() {
    return this.infoWindowManager.getAllInfoWindows()
  }

  /**
   * 协议：设置信息窗可见性（轨迹等信息窗）。委托给 trackManager，若无实现则空操作。
   * @param {boolean} visible - true 显示，false 关闭
   */
  setInfoWindowVisible(visible) {
    if (typeof visible !== 'boolean') return
    if (this.trackManager && typeof this.trackManager.setInfoWindowVisible === 'function') {
      this.trackManager.setInfoWindowVisible(visible)
    }
  }

  // ==================== Lines 相关方法 ====================
  
  /**
   * 添加线条
   * @param {object} options - 线条配置
   * @returns {object} 线条实例
   */
  addLines(options) {
    return this.linesManager.addLines(options)
  }

  /**
   * 获取所有线条
   * @returns {Array} 线条列表
   */
  getAllLines() {
    return this.linesManager.getAllLines()
  }

  /**
   * 根据ID获取线条
   * @param {string} id - 线条ID
   * @returns {object} 线条对象
   */
  getLine(id) {
    return this.linesManager.getLine(id)
  }

  /**
   * 移除指定线条
   * @param {string} id - 线条ID
   */
  removeLine(id) {
    return this.linesManager.removeLine(id)
  }

  /**
   * 清除所有线条
   */
  clearAllLines() {
    return this.linesManager.clearAllLines()
  }

  // ==================== Cluster 相关方法 ====================
  
  /**
   * 添加聚合功能
   * @param {object} options - 聚合配置
   * @returns {object} 聚合实例
   */
  addClusters(options) {
    return this.clusterManager.addClusters(options)
  }

  /**
   * 添加聚合功能 - 兼容方法名
   * @param {object} options - 聚合配置
   * @returns {object} 聚合实例
   */
  addCluster(options) {
    return this.addClusters(options)
  }

  /**
   * 获取所有聚合
   * @returns {Array} 聚合列表
   */
  getAllClusters() {
    return this.clusterManager.getAllClusters()
  }

  /**
   * 根据ID获取聚合
   * @param {string} id - 聚合ID
   * @returns {object} 聚合对象
   */
  getCluster(id) {
    return this.clusterManager.getCluster(id)
  }

  /**
   * 移除指定聚合
   * @param {string} id - 聚合ID
   */
  removeCluster(id) {
    return this.clusterManager.removeCluster(id)
  }

  /**
   * 清除所有聚合
   */
  clearAllClusters() {
    return this.clusterManager.clearAllClusters()
  }

  // ==================== Polygons 相关方法 ====================
  
  /**
   * 添加多边形
   * @param {object} options - 多边形配置
   * @returns {object} 多边形实例
   */
  addPolygons(options) {
    return this.polygonsManager.addPolygons(options)
  }

  /**
   * 添加圆形
   * @param {object} options - 圆形配置
   * @returns {object} 圆形实例
   */
  addCircle(options) {
    return this.polygonsManager.addCircle(options)
  }

  /**
   * 获取所有多边形
   * @returns {Array} 多边形列表
   */
  getAllPolygons() {
    return this.polygonsManager.getAllPolygons()
  }

  /**
   * 根据ID获取多边形
   * @param {string} id - 多边形ID
   * @returns {object} 多边形对象
   */
  getPolygon(id) {
    return this.polygonsManager.getPolygon(id)
  }

  /**
   * 移除指定多边形
   * @param {string} id - 多边形ID
   */
  removePolygon(id) {
    return this.polygonsManager.removePolygon(id)
  }

  /**
   * 清除所有多边形
   */
  clearAllPolygons() {
    return this.polygonsManager.clearAllPolygons()
  }

  // ==================== Track 轨迹（实时车辆轨迹） ====================
  /**
   * 添加轨迹 - 实时显示车辆轨迹（参照 MineData 符号追踪示例）
   * @param {object} options - { id, path, symbol?, lineStyle?, showLine?, showPlate?, showSpeed?, label?, plate?, onClick? }
   * @param {function} [options.onClick] - 该车辆图标的点击回调，参数为 { trackId, track, lngLat, originalEvent }
   * @returns {object|null}
   */
  addTrack(options) {
    return this.trackManager.addTrack(options)
  }

  /**
   * 更新轨迹数据 - 根据新坐标实时更新车辆位置与轨迹线
   * @param {string} id - 轨迹ID
   * @param {Array<Array<number>>} path - 路径坐标
   * @param {object} [extraOptions] - 可选，透传到底层（如 plate、label、speed、heading）
   */
  updateTrack(id, path, extraOptions) {
    return this.trackManager.updateTrack(id, path, extraOptions)
  }

  /**
   * 追加一个坐标点，实时更新轨迹（逐点上报）
   * @param {string} id - 轨迹ID
   * @param {Array<number>|object} lngLat - 新点 [lng, lat] 或 { lng, lat }
   * @param {object} [extraOptions] - 可选，透传到底层（如 plate、speed、heading）
   */
  pushTrackPoint(id, lngLat, extraOptions) {
    return this.trackManager.pushTrackPoint(id, lngLat, extraOptions)
  }

  /** 移除轨迹 */
  removeTrack(id) {
    return this.trackManager.removeTrack(id)
  }

  /** 获取轨迹 */
  getTrack(id) {
    return this.trackManager.getTrack(id)
  }

  /** 获取所有轨迹 */
  getAllTracks() {
    return this.trackManager.getAllTracks()
  }

  /**
   * 获取底层轨迹管理器（供 HTMap.Tracks 解析并调用 updateTracks/stopTracks/removeTracks）
   * @returns {import('./track/index.js').default}
   */
  getTrackManager() {
    return this.trackManager
  }

  /**
   * 添加轨迹层：一次性传入 id、styles、minZoom、maxZoom，与 HTMap.Tracks.addToMap 对应
   * @param {object} config - { map, id, styles, minZoom?, maxZoom? }
   * @returns {import('./track/index.js').default} 轨迹管理器实例
   */
  addTracks(config = {}) {
    if (!this.trackManager) return null
    if (Array.isArray(config.styles) && config.styles.length > 0 && typeof this.trackManager.setStyles === 'function') {
      this.trackManager.setStyles(config.styles)
    }
    if ((config.minZoom !== undefined || config.maxZoom !== undefined) && typeof this.trackManager.setZoomRange === 'function') {
      this.trackManager.setZoomRange(config.minZoom, config.maxZoom)
    }
    return this.trackManager
  }

  /**
   * HTMap 协议：批量更新车流轨迹（供 new HTMap.Tracks({ map }).updateTracks 使用）
   * @param {object} payload - { itemsData: Array<{ id, styleId?, contentDom?, lngLat, heading? }>, options?: { smoothTime?, calculateAngle? } }
   */
  updateTracks(payload) {
    return this.trackManager.updateTracks(payload)
  }

  /** 协议：停止并移除所有轨迹（供 HTMap.Tracks.stopTracks 使用） */
  stopTracks() {
    return this.trackManager.stopTracks()
  }

  /** 协议：停止并移除所有轨迹 */
  removeTracks() {
    return this.trackManager.removeTracks()
  }

  /** 设置车辆轨迹点击回调 */
  setOnTrackClick(callback) {
    if (this.trackManager && typeof this.trackManager.setOnTrackClick === 'function') {
      this.trackManager.setOnTrackClick(callback)
    }
  }

  // ==================== 地图状态相关方法 ====================
  
  /**
   * 设置地图中心点和缩放级别
   * @param {Array|object} center - 中心点坐标 [lng, lat] 或 {lng, lat}
   * @param {number} zoom - 缩放级别
   */
  setCenterAndZoom(center, zoom) {
    return this.controlManager.setCenterAndZoom(center, zoom)
  }

  /**
   * 设置地图视图 - 兼容HTMap接口
   * @param {Array|object} center - 中心点坐标 [lng, lat] 或 {lng, lat}
   * @param {number} zoom - 缩放级别
   */
  setView(center, zoom) {
    return this.controlManager.setView(center, zoom)
  }

  /**
   * 设置地图中心点
   * @param {Array|object} center - 中心点坐标 [lng, lat] 或 {lng, lat}
   * @param {object} options - 动画选项
   */
  setCenter(center, options = {}) {
    return this.controlManager.setCenter(center, options)
  }

  /**
   * 设置地图缩放级别
   * @param {number} zoom - 缩放级别
   * @param {object} options - 动画选项
   */
  setZoom(zoom, options = {}) {
    return this.controlManager.setZoom(zoom, options)
  }

  /**
   * 设置地图倾斜角度 (pitch)
   * @param {number} pitch - 倾斜角度 (0-85)
   * @param {object} options - 动画选项
   */
  setPitch(pitch, options = {}) {
    return this.controlManager.setPitch(pitch, options)
  }

  /**
   * 设置地图旋转角度 (bearing)
   * @param {number} bearing - 旋转角度 (0-360)
   * @param {object} options - 动画选项
   */
  setBearing(bearing, options = {}) {
    return this.controlManager.setBearing(bearing, options)
  }

  /**
   * 设置视图模式 (2D/3D)
   * @param {string} viewMode - 视图模式 '2D' 或 '3D'
   * @param {object} options - 切换选项
   */
  setViewMode(viewMode, options = {}) {
    return this.controlManager.setViewMode(viewMode, options)
  }

  /**
   * 获取地图中心点
   * @returns {Array} 中心点坐标 [lng, lat]
   */
  getCenter() {
    return this.controlManager.getCenter()
  }

  /**
   * 获取地图缩放级别
   * @returns {number} 缩放级别
   */
  getZoom() {
    return this.controlManager.getZoom()
  }

  /**
   * 获取地图倾斜角度 (pitch)
   * @returns {number} 倾斜角度
   */
  getPitch() {
    return this.controlManager.getPitch()
  }

  /**
   * 获取地图旋转角度 (bearing)
   * @returns {number} 旋转角度
   */
  getBearing() {
    return this.controlManager.getBearing()
  }

  /**
   * 获取当前视图模式
   * @returns {string} 视图模式 '2D' 或 '3D'
   */
  getViewMode() {
    return this.controlManager.getViewMode()
  }

  /**
   * 获取最大缩放级别
   * @returns {number} 最大缩放级别
   */
  getMaxZoom() {
    return this.controlManager.getMaxZoom()
  }

  /**
   * 获取最小缩放级别
   * @returns {number} 最小缩放级别
   */
  getMinZoom() {
    return this.controlManager.getMinZoom()
  }

  /**
   * 飞行到指定位置 - 兼容HTMap接口
   * @param {Array|object} center - 中心点坐标
   * @param {number} zoom - 缩放级别
   * @param {object} options - 飞行选项
   * @returns {Promise} 飞行完成后的Promise
   */
  flyTo(center, zoom, options = {}) {
    return this.controlManager.flyTo(center, zoom, options)
  }

  /**
   * 平滑移动到指定位置
   * @param {object} options - 移动选项
   */
  _easeTo(options) {
    return this.controlManager.easeTo(options)
  }

  /**
   * 适应地图视野范围 - BaseAdapter抽象方法实现
   * @param {object} options - 边界选项
   * @param {Array} options.sw - 西南角坐标 [lng, lat]
   * @param {Array} options.ne - 东北角坐标 [lng, lat]
   * @param {object|number} options.padding - 边界内边距
   * @param {number} options.maxZoom - 最大缩放级别限制
   * @param {number} options.duration - 动画时长
   * @param {boolean} options.animate - 是否使用动画
   * @returns {boolean} 操作是否成功
   */
  fitBounds(options) {
    return this.controlManager.fitBounds(options)
  }

  /**
   * 适应地图视野范围的具体实现 - 供BaseAdapter调用
   * @param {object} options - 验证后的边界选项
   * @returns {boolean} 操作是否成功
   * @private
   */
  _fitBounds(options) {
    return this.controlManager.fitBounds(options)
  }

  /**
   * 限制地图视野范围
   * @param {Array} bounds - 边界范围 [[swLng, swLat], [neLng, neLat]]
   */
  setMaxBounds(bounds) {
    return this.controlManager.setMaxBounds(bounds)
  }

  /**
   * 限制地图视野范围 - 兼容HTMap接口
   * @param {object} bounds - 边界范围 {sw: [lng, lat], ne: [lng, lat]}
   * @returns {boolean} 操作是否成功
   */
  limitBounds(bounds) {
    return this.controlManager.limitBounds(bounds)
  }

  /**
   * 适应地图视野范围
   * @param {Array} coordinates - 坐标数组
   * @param {object} options - 选项
   */
  fitCoordinates(coordinates, options = {}) {
    return this.controlManager.fitCoordinates(coordinates, options)
  }

  /**
   * 设置地图扩展视野
   * @param {object} extend - 扩展视野配置
   */
  setExtend(extend) {
    return this.controlManager.setExtend(extend)
  }

  /**
   * 获取地图扩展视野
   * @returns {object} 扩展视野配置
   */
  getExtend() {
    return this.controlManager.getExtend()
  }

  /**
   * 平移地图
   * @param {Array} offset - 偏移量 [x, y] 像素
   * @param {object} options - 选项
   */
  panBy(offset, options = {}) {
    return this.controlManager.panBy(offset, options)
  }

  /**
   * 平移到指定位置
   * @param {Array|object} center - 中心点坐标
   * @param {object} options - 选项
   */
  panTo(center, options = {}) {
    return this.controlManager.panTo(center, options)
  }

  /**
   * 获取当前地图状态
   * @returns {object} 地图状态对象
   */
  getState() {
    return this.controlManager.getState()
  }

  /**
   * 设置地图状态
   * @param {object} state - 地图状态对象
   * @param {object} options - 选项
   */
  setState(state, options = {}) {
    return this.controlManager.setState(state, options)
  }

  /**
   * 重置地图状态到初始状态
   * @param {object} options - 选项
   */
  resetState(options = {}) {
    return this.controlManager.resetState(options)
  }
    /**
   * 设置地图视野范围 - BaseAdapter抽象方法实现
   * @param {object} options - 视野范围选项
   * @param {Array} options.sw - 西南角坐标 [lng, lat]
   * @param {Array} options.ne - 东北角坐标 [lng, lat]
   * @param {number|Array} options.padding - 边距
   * @param {number} options.duration - 动画时长
   * @returns {boolean} 设置是否成功
   */
  setBounds(options) {
    return this.controlManager.setBounds(options)
  }

  /**
   * 设置地图视野范围的具体实现 - 供BaseAdapter调用
   * @param {object} options - 视野范围选项
   * @returns {boolean} 设置是否成功
   * @private
   */
  _setBounds(options) {
    return this.controlManager.setBounds(options)
  }
  // ==================== 事件相关方法 ====================
  
  /**
   * 绑定事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  addEventListener(event, callback) {
    return this.eventManager.addEventListener(event, callback)
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  removeEventListener(event, callback) {
    return this.eventManager.removeEventListener(event, callback)
  }

  /**
   * 添加带节流的事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {number} delay - 节流延迟时间
   */
  addThrottledEventListener(event, callback, delay = 100) {
    return this.eventManager.addThrottledEventListener(event, callback, delay)
  }

  /**
   * 添加带防抖的事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {number} delay - 防抖延迟时间
   */
  addDebouncedEventListener(event, callback, delay = 300) {
    return this.eventManager.addDebouncedEventListener(event, callback, delay)
  }

  /**
   * 一次性事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  once(event, callback) {
    return this.eventManager.once(event, callback)
  }

  /**
   * 批量添加事件监听器
   * @param {object} eventHandlers - 事件处理器对象
   */
  addEventListeners(eventHandlers) {
    return this.eventManager.addEventListeners(eventHandlers)
  }

  /**
   * 批量移除事件监听器
   * @param {object} eventHandlers - 事件处理器对象
   */
  removeEventListeners(eventHandlers) {
    return this.eventManager.removeEventListeners(eventHandlers)
  }

  /**
   * 获取事件监听器数量
   * @param {string} event - 事件名称
   * @returns {number} 监听器数量
   */
  getEventListenersCount(event) {
    return this.eventManager.getEventListenersCount(event)
  }

  /**
   * 检查事件是否有监听器
   * @param {string} event - 事件名称
   * @returns {boolean} 是否有监听器
   */
  hasEventListeners(event) {
    return this.eventManager.hasEventListeners(event)
  }

  /**
   * 获取地图事件列表
   * @returns {Array} 支持的事件列表
   */
  getSupportedEvents() {
    return this.eventManager.getSupportedEvents()
  }

  /**
   * 清除所有地图事件监听
   */
  clearAllEvents() {
    return this.eventManager.clearAllEvents()
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {object} eventData - 事件数据
   */
  triggerEvent(eventName, eventData) {
    return this.eventManager.triggerEvent(eventName, eventData)
  }

  // ==================== HTMap兼容的事件方法 ====================
  
  /**
   * 绑定事件监听器 - HTMap兼容接口
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {object} options - 事件选项
   */
  on(event, callback, options = {}) {
    return this.eventManager.on(event, callback, options)
  }

  /**
   * 移除事件监听器 - HTMap兼容接口
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    return this.eventManager.off(event, callback)
  }

  /**
   * 一次性事件监听器 - HTMap兼容接口
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  once(event, callback) {
    return this.eventManager.once(event, callback)
  }

  /**
   * 添加带节流的事件监听器 - HTMap兼容接口
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {number} delay - 节流延迟时间
   */
  onThrottled(event, callback, delay = 100) {
    return this.eventManager.onThrottled(event, callback, delay)
  }

  /**
   * 添加带防抖的事件监听器 - HTMap兼容接口
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {number} delay - 防抖延迟时间
   */
  onDebounced(event, callback, delay = 300) {
    return this.eventManager.onDebounced(event, callback, delay)
  }

  /**
   * 批量添加事件监听器 - HTMap兼容接口
   * @param {object} events - 事件配置对象 {eventName: callback}
   */
  onMultiple(events) {
    return this.eventManager.onMultiple(events)
  }

  /**
   * 批量移除事件监听器 - HTMap兼容接口
   * @param {Array|object} events - 事件名称数组或事件配置对象
   */
  offMultiple(events) {
    return this.eventManager.offMultiple(events)
  }

  // ==================== 样式相关方法 ====================
  
  /**
   * 设置地图样式类型 - HTMap兼容接口
   * @param {string} styleType - 样式类型
   * @param {object} options - 切换选项
   */
  setStyleType(styleType, options = {}) {
    if (!this.map) return

    try {
      let environment = import.meta.env.VITE_ENV
      const mapStyle = buildMineMapConfig(styleType)
      
      // 更新全局配置
      for (let key in mapStyle) {
        minemap[key] = mapStyle[key]
      }
      
      // 设置地图样式
      if (this.map.setStyle) {
        this.map.setStyle(minemap.mapStyle)
      }
      
      // 更新选项中的样式类型
      this.options.styleType = styleType
    } catch (error) {
      console.error('MineMap.setStyleType: 设置失败:', error)
    }
  }

  /**
   * 获取当前地图样式类型 - HTMap兼容接口
   * @returns {string} 样式类型
   */
  getStyleType() {
    return this.options.styleType || 'black'
  }

  // ==================== 地图销毁方法 ====================
  
  /**
   * 销毁地图 - HTMap兼容接口
   */
  destroy() {
    try {
      // 清除所有事件监听器
      if (this.eventManager) {
        this.eventManager.destroy()
      }
      
      // 销毁各个管理器
      if (this.markerManager) {
        this.markerManager.clearAllMarkers && this.markerManager.clearAllMarkers()
      }
      if (this.linesManager) {
        this.linesManager.clearAllLines && this.linesManager.clearAllLines()
      }
      if (this.clusterManager) {
        this.clusterManager.clearAllClusters && this.clusterManager.clearAllClusters()
      }
      if (this.polygonsManager) {
        this.polygonsManager.clearAllPolygons && this.polygonsManager.clearAllPolygons()
      }
      if (this.trackManager) {
        this.trackManager.removeTracks && this.trackManager.removeTracks()
      }

      // 清除所有标记点
      this.markers.clear()
      
      // 销毁地图实例
      if (this.map) {
        this.map.remove()
        this.map = null
      }
    } catch (error) {
      console.error('MineMap.destroy: 销毁失败:', error)
    }
  }
  /**
   * 路径规划
   */
  getRoute(options) {
    return this.controlManager.getRoute(options)
  }
  // ==================== BaseAdapter 抽象方法实现 ====================
  
}

