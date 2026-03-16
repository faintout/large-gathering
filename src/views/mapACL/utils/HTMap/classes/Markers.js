/**
 * Markers 类 - 用于管理一组标记点
 * 提供标记点的批量操作、样式设置、事件绑定等功能
 */
import defaultPinImage from '../assets/img/defaultPin.png'
import { tencentConfig, mineMapConfig, mapboxConfig } from '../config/defaultConfig.js'

export default class Markers {
  //  styles里面的offset 这个参数实际没有用到，mapboxgl 底层用的anchor：bottom  腾讯默认也是底部中间，offset 不好使，所以这个参数用了也是白用
  // todo 下一版去掉offset 参数，增加上anchor 参数来控制图片锚点就得了
  constructor(options = {}) {
    // 数据校验
    if (!options.map) {
      throw new Error('Markers: map instance is required')
    }

    this.markers = null // 这个应该回来不是数组，应该是一个完整的对象
    this.map = options.map
    this.contentDom = options.contentDom || null
    this.draggable = options.draggable || false // 提取 draggable 到顶层
    // 保存顶层的 minZoom 和 maxZoom（只有传递了才设置，否则为 undefined，由底层适配器处理）
    this.minZoom = options.minZoom !== undefined ? Number(options.minZoom) : undefined
    this.maxZoom = options.maxZoom !== undefined ? Number(options.maxZoom) : undefined
    this.styles = this._validateAndNormalizeStyles(options.styles || [], options)
    this.geometries = this._validateAndNormalizeGeometries(options.geometries || [])
    this.id = options.id || `markers_group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // 为了给 dom marker点位添加domOffset值
    this.domOffset = options.domOffset
    
    // 如果有初始数据，立即添加到地图
    if (this.geometries.length > 0) {
      this.addToMap()
    }
  }

  // 验证和标准化几何数据
  _validateAndNormalizeGeometries(geometries) {
    if (!Array.isArray(geometries)) {
      return []
    }
    
    return geometries.map((geometry, index) => {
      // 验证必需的属性
      if (!geometry.lngLat || !Array.isArray(geometry.lngLat) || geometry.lngLat.length !== 2) {
        return null
      }
      
      // 验证经纬度是否可以转换为数字
      const lng = Number(geometry.lngLat[0])
      const lat = Number(geometry.lngLat[1])
      
      if (isNaN(lng) || isNaN(lat)) {
        return null
      }

      // 标准化几何数据
      return {
        id: geometry.id || `geometry_${this.id || 'temp'}_${index}`,
        properties: geometry.properties || {},
        lngLat: [lng, lat],
        styleId: geometry.styleId || (this.styles.length > 0 ? this.styles[0].id : null)
      }
    }).filter(geometry => geometry !== null) // 过滤掉无效的几何数据
  }

  // 验证和标准化样式数据
  _validateAndNormalizeStyles(styles) {
    if (!Array.isArray(styles)) {
      return [this._getDefaultStyle()]
    }
    
    if (styles.length === 0) {
      return [this._getDefaultStyle()]
    }
    
    // 验证每个样式对象
    return styles.map((style, index) => {
      if (!style || typeof style !== 'object') {
        return this._getDefaultStyle()
      }

      let returnStyle = {
        id: style.id || `style_${this.id || 'temp'}_${index}`,
        src: style.src || defaultPinImage,
        width: Number(style.width) || 40,
        height: Number(style.height) || 46,
        rotation: Number(style.rotation) || 0,
        faceForward: style.faceForward || 'standUp',
      }
      if (style.offset) returnStyle.offset = style.offset

      // 标准化样式数据
      return returnStyle
    })
  }

  // 获取默认样式
  _getDefaultStyle() {
    return {
      id: `default_style_${this.id || 'temp'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      src: defaultPinImage,         // 使用导入的默认图标
      width: 40,                    // 默认宽度
      height: 46,                   // 默认高度
      // offset: [-20, -46],          // 锚点位置为中间底部，正常情况offset不用传递， 腾讯传递之后点位会飘，所以我觉得不要用，如果偷着用，就锚点为底部中间  向左 -  向右+ 向上 - 向下+
      rotation: 0,                  // 默认无旋转
      faceForward: 'standUp',       // 默认直立 'lieFlat' 'standUp'
    }
  }

  // 获取地图的最小缩放级别（从defaultConfig中获取）
  _getMapMinZoom() {
    const engine = this.map?.options?.engine || 'tencent'
    
    switch (engine) {
      case 'tencent':
        return tencentConfig.minZoom
      case 'minemap':
        return mineMapConfig.minZoom
      case 'mapbox':
        return mapboxConfig.minZoom
      default:
        return 0
    }
  }

  // 获取地图的最大缩放级别（从defaultConfig中获取）
  _getMapMaxZoom() {
    const engine = this.map?.options?.engine || 'tencent'
    
    switch (engine) {
      case 'tencent':
        return tencentConfig.maxZoom
      case 'minemap':
        return mineMapConfig.maxZoom
      case 'mapbox':
        return mapboxConfig.maxZoom
      default:
        return 24
    }
  }

  // 添加标记点到地图
  addToMap() {
    if (!this.map) return
    
    // 准备传递给地图的参数
    const markersConfig = {
      map: this.map,
      id: this.id,
      geometries: this.geometries,
      draggable: this.draggable
    }

    // 添加domOffset值
    if(this.domOffset !==undefined){
      markersConfig.domOffset = this.domOffset
    }
    
    // 只有在定义了 minZoom 和 maxZoom 时才传递给底层适配器
    // 同时进行边界检查，确保值在地图允许的范围内
    if (this.minZoom !== undefined) {
      // 确保 minZoom 不小于地图最小缩放级别
      markersConfig.minZoom = Math.max(this.minZoom, this._getMapMinZoom())
    }
    if (this.maxZoom !== undefined) {
      // 确保 maxZoom 不大于地图最大缩放级别
      markersConfig.maxZoom = Math.min(this.maxZoom, this._getMapMaxZoom())
    }
    
    // 如果有 contentDom，则传递 contentDom；否则传递 styles
    if (this.contentDom) {
      markersConfig.contentDom = this.contentDom
    } else {
      markersConfig.styles = this.styles
    }
    
    // 调用地图的批量添加方法（现在可能返回Promise）
    const result = this.map.addMarkers(markersConfig)
    
    // 处理异步返回的Promise
    if (result && typeof result.then === 'function') {
      // 如果是Promise，等待完成
      result.then(markers => {
        this.markers = markers
        this._validateMarkersResult()
      }).catch(error => {
        this.markers = null
      })
    } else {
      // 如果不是Promise，直接处理
      this.markers = result
      this._validateMarkersResult()
    }
  }

  // 验证标记点结果
  _validateMarkersResult() {
    if (!this.markers || typeof this.markers !== 'object') {
      this.markers = null
    }
  }

  // 从地图移除所有标记点
  removeMarkers() {
    if (!this.map) {
      return
    }

    if (!this.markers) {
      return
    }

    if (typeof this.markers.removeMarkers !== 'function') {
      return
    }

    try {
      this.markers.removeMarkers()
    } catch (error) {
      // 静默处理错误
    } finally {
      this.markers = null
    }
  }

  /**
   * 设置所有标记点的可见性
   * @param {boolean} visible - true为显示，false为隐藏
   */
  setVisible(visible) {
    if (!this.markers) {
      return
    }

    try {
      // 检查 markers 对象是否有 setVisible 方法
      if (typeof this.markers.setVisible === 'function') {
        this.markers.setVisible(visible)
        return
      }
    } catch (error) {
      // 静默处理错误
    }
  }

  /**
   * 获取标记点组的可见性状态
   * @returns {boolean} true为可见，false为不可见
   */
  getVisible() {
    if (!this.markers) {
      return false
    }

    try {
      // 检查 markers 对象是否有 getVisible 方法
      if (typeof this.markers.getVisible === 'function') {
        return this.markers.getVisible()
      }
    } catch (error) {
      return false
    }
  }

  /**
   * 获取Markers对象中所有几何数据
   * @returns {Array} 几何数据数组
   */
  _getGeometries() {
    return [...this.geometries] // 返回副本，避免外部修改
  }

  /**
   * 获取所有几何数据
   * @returns {Array} 几何数据数组
   */
  getGeometries() {
    if (!this.markers) {
      return []
    }

    try {
      // 直接调用底层地图厂商的getGeometries方法
      return this.markers.getGeometries()
    } catch (error) {
      return []
    }
  }

  /**
   * 添加新的几何数据
   * @param {Array} newGeometries - 要添加的几何数据数组
   */
  addGeometries(newGeometries) {
    if (!Array.isArray(newGeometries)) {
      return
    }
    if (newGeometries.length === 0) {
      return
    }

    // 验证和标准化新数据（支持自定义styleId）
    const validatedGeometries = this._validateAndNormalizeGeometries(newGeometries)

    if (validatedGeometries.length === 0) {
      return
    }

    // 如果标记点已经添加到地图，需要更新地图上的标记点
    if (this.markers) {
      try {
        // 检查地图标记点对象是否有 addGeometries 方法
        if (typeof this.markers.addGeometries === 'function') {
          // 先调用地图厂商的addGeometries方法
          this.markers.addGeometries(validatedGeometries)
          // 添加成功后再更新本地数据
          this.geometries.push(...validatedGeometries)
        } else {
          // 如果没有addGeometries方法，先更新本地数据，然后重新添加所有标记点到地图
          this.geometries.push(...validatedGeometries)
          this.removeMarkers()
          this.addToMap()
        }
      } catch (error) {
        // 如果地图操作失败，不更新本地数据
      }
    } else {
      // 如果标记点还没有添加到地图，直接添加到地图
      this.addToMap()
    }
  }

  /**
   * 删除指定的几何数据
   * @param {Array} idsToDelete - 要删除的ID数组
   */
  removeGeometries(idsToDelete) {
    if (!Array.isArray(idsToDelete)) {
      return
    }

    if (idsToDelete.length === 0) {
      return
    }

    if (!this.markers) {
      return
    }

    try {
      // 直接调用底层地图厂商的removeGeometries方法
      this.markers.removeGeometries(idsToDelete)
      
      // 从本地数据中移除对应的数据
      this.geometries = this.geometries.filter(geometry => !idsToDelete.includes(geometry.id))
    } catch (error) {
      // 静默处理错误
    }
  }

  /**
   * 批量更新几何数据
   * @param {Array} updatedGeometries - 要更新的几何数据数组，每个对象包含id和要更新的属性
   */
  updateMarkersGeometries(updatedGeometries) {
    if (!Array.isArray(updatedGeometries)) {
      return
    }

    if (updatedGeometries.length === 0) {
      return
    }

    if (!this.markers) {
      return
    }

    try {
      // 检查地图标记点对象是否有 updateMarkersGeometries 方法
      if (typeof this.markers.updateMarkersGeometries === 'function') {
        // 直接调用地图厂商的批量更新方法
        this.markers.updateMarkersGeometries(updatedGeometries)
        
        // 更新本地数据
        updatedGeometries.forEach(updatedGeo => {
          const geometryIndex = this.geometries.findIndex(geo => geo.id === updatedGeo.id)
          if (geometryIndex !== -1) {
            // 合并更新数据
            this.geometries[geometryIndex] = {
              ...this.geometries[geometryIndex],
              ...updatedGeo
            }
          }
        })
      }
    } catch (error) {
      // 静默处理错误
    }
  }

  // 为所有marker绑定事件
  on(eventType, callback) {
    if (!eventType || typeof callback !== 'function') {
      return this
    }

    // 使用递归检查确保标记点已创建
    const checkAndBindEvents = (retryCount = 0) => {
      // 检查this.markers是否存在且为对象
      if (!this.markers || typeof this.markers !== 'object') {
        if (retryCount < 20) {
          // 如果标记点还没创建完成，等待50ms后重试
          setTimeout(() => checkAndBindEvents(retryCount + 1), 50)
          return
        } else {
          return
        }
      }

      // 直接调用this.markers的on方法
      this.markers.on(eventType, callback)
    }

    checkAndBindEvents()
    return this
  }

  // 为所有marker解绑事件
  off(eventType, callback) {
    if (!eventType) {
      return this
    }

    // 使用递归检查确保标记点已创建
    const checkAndUnbindEvents = (retryCount = 0) => {
      // 检查this.markers是否存在且为对象
      if (!this.markers || typeof this.markers !== 'object') {
        if (retryCount < 20) {
          // 如果标记点还没创建完成，等待50ms后重试
          setTimeout(() => checkAndUnbindEvents(retryCount + 1), 50)
          return
        } else {
          return
        }
      }

      // 直接调用this.markers的off方法
      this.markers.off(eventType, callback)
    }

    checkAndUnbindEvents()
    return this
  }

  enableDrag(styles) {
    if (!this.map) return

    if (this.markers && typeof this.markers.enableDrag === 'function') {
      this.markers.enableDrag(styles)
    }
  }

  disableDrag() {
    if (!this.map) return

    if (this.markers && typeof this.markers.disableDrag === 'function') {
      this.markers.disableDrag()
    }
  }
}
