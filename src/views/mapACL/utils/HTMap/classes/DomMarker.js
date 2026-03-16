/**
 * DomMarker 类 - 用于管理单个标记点
 * 提供创建、移除、可见性、事件等操作
 */
import defaultPinImage from '../assets/img/defaultPin.png'
import {mapboxConfig, mineMapConfig, tencentConfig} from '../config/defaultConfig.js';

export default class DomMarker {
  constructor(options = {}) {
    if (!options.map) {
      throw new Error('DomMarker: map instance is required')
    }
    this.DomMarker = null // 单个popup对象
    this.map = options.map
    this.id = options.id || `marker_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

    // 验证lngLat数据
    if (!this._validateLngLat(options.lngLat)) {
      throw new Error('DomMarker: lngLat is required and must be an array with 2 valid numbers [lng, lat]')
    }
    this.lngLat = options.lngLat

    // 处理 contentDom：标准化处理（HTML 字符串转换为 DOM 元素），如果为空则生成默认图片元素
    if (options.contentDom) {
      this.contentDom = this._normalizeContentDom(options.contentDom) || this._createDefaultContentDom()
    } else {
      this.contentDom = this._createDefaultContentDom()
    }
    this.properties = options.properties
    this.options = options
    this.draggable = options.draggable || false
    this.offset = options.offset || [0, 0]
    this.minZoom = options.minZoom !== undefined ? Number(options.minZoom) : undefined
    this.maxZoom = options.maxZoom !== undefined ? Number(options.maxZoom) : undefined
    // anchor  offset 几个地图不一致，所以用了也没有用，暂时都隐藏掉，各地图就用默认的图片中心下边，offset 不偏移
    this.addToMap()
  }

  // 创建默认的 contentDom（使用默认图片）
  _createDefaultContentDom() {
    const img = document.createElement('img')
    img.src = defaultPinImage
    img.style.width = '38px'
    img.style.height = '46px'
    return img
  }

  // 标准化 contentDom：如果是 HTML 字符串，转换为 DOM 元素
  _normalizeContentDom(contentDom) {
    if (!contentDom) {
      return null
    }

    // 如果已经是 DOM 元素，直接返回
    if (contentDom instanceof HTMLElement) {
      return contentDom
    }

    // 如果是字符串，转换为 DOM 元素
    if (typeof contentDom === 'string') {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = contentDom.trim()
      // 如果只有一个子元素，返回该子元素；否则返回容器 div
      const firstChild = tempDiv.firstChild
      if (firstChild && firstChild === tempDiv.lastChild && tempDiv.childNodes.length === 1) {
        return firstChild
      }
      return tempDiv
    }

    // 其他类型，返回 null
    return null
  }

  // 验证lngLat数据
  _validateLngLat(lngLat) {
    // 检查是否存在
    if (!lngLat) {
      return false
    }
    // 检查是否为数组
    if (!Array.isArray(lngLat)) {
      return false
    }
    // 检查数组长度
    if (lngLat.length !== 2) {
      return false
    }

    // 检查经纬度是否可以转换为有效数字
    const lng = Number(lngLat[0])
    const lat = Number(lngLat[1])

    if (isNaN(lng) || isNaN(lat)) {
      return false
    }
    // 检查经纬度范围
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return false
    }
    return true
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

  // 添加到地图
  addToMap() {
    if (!this.map || !this.lngLat) return

    const domMarkerOptions = {
      map: this.map,
      id: this.id,
      lngLat: this.lngLat,
      contentDom: this.contentDom, // 适配器使用 element 字段接收 DOM 元素
      draggable: this.draggable,
      offset: this.offset,
      properties: this.properties
    }

    // 只有在定义了 minZoom 和 maxZoom 时才传递给底层适配器
    // 同时进行边界检查，确保值在地图允许的范围内
    if (this.minZoom !== undefined) {
      // 确保 minZoom 不小于地图最小缩放级别
      domMarkerOptions.minZoom = Math.max(this.minZoom, this._getMapMinZoom())
    }
    if (this.maxZoom !== undefined) {
      // 确保 maxZoom 不大于地图最大缩放级别
      domMarkerOptions.maxZoom = Math.min(this.maxZoom, this._getMapMaxZoom())
    }

    // 调用地图的批量添加方法（现在可能返回Promise）
    const result = this.map.addDomMarker(domMarkerOptions)
    // 处理异步返回的Promise
    if (result && typeof result.then === 'function') {
      // 如果是Promise，等待完成
      result.then(markers => {
        this.DomMarker = markers
        this._validateMarkersResult()
      }).catch(error => {
        // 静默处理错误
        this.DomMarker = null
      })
    } else {
      // 如果不是Promise，直接处理
      this.DomMarker = result
      this._validateMarkersResult()
    }
  }

  // 验证标记点结果
  _validateMarkersResult() {
    if (!this.DomMarker || typeof this.DomMarker !== 'object') {
      this.DomMarker = null
    }
  }

  // 移除
  removeDomMarker() {
    if (!this.map) {
      return
    }

    if (!this.DomMarker) {
      return
    }

    // 处理 Promise 返回值
    if (this.DomMarker && typeof this.DomMarker.then === 'function') {
      this.DomMarker.then(actualMarker => {
        if (actualMarker && typeof actualMarker.remove === 'function') {
          try {
            actualMarker.remove()
          } catch (error) {
            // 静默处理错误
          } finally {
            this.DomMarker = null
          }
        } else {
          this.DomMarker = null
        }
      }).catch(error => {
        this.DomMarker = null
      })
      return
    }

    // 同步调用 remove 方法（兼容 HTMap 接口）
    if (typeof this.DomMarker.remove === 'function') {
      try {
        this.DomMarker.remove()
      } catch (error) {
        // 静默处理错误
      } finally {
        this.DomMarker = null
      }
    } else {
      this.DomMarker = null
    }
  }

  /**
   * 设置点的可见性
   * @param {boolean} visible - true为显示，false为隐藏
   */
  setVisible(visible) {
    if (!this.DomMarker) {
      return
    }

    try {
      // 检查 markers 对象是否有 setVisible 方法
      if (typeof this.DomMarker.setVisible === 'function') {
        this.DomMarker.setVisible(visible)
        return
      }
    } catch (error) {
      // 静默处理错误
    }
  }
  getVisible() {
    if (!this.DomMarker) {
      return false
    }

    try {
      // 检查 DomMarker 对象是否有 getVisible 方法
      if (typeof this.DomMarker.getVisible === 'function') {
        return this.DomMarker.getVisible()
      }
    } catch (error) {
      // 静默处理错误
      return false
    }
  }


  // 设置坐标
  setLngLat(lngLat) {
    if (!this.DomMarker) {
      return this
    }
    
    // 验证坐标
    if (!this._validateLngLat(lngLat)) {
      return this
    }
    
    this.lngLat = lngLat
    
    if (typeof this.DomMarker.setLngLat === 'function') {
      try {
        this.DomMarker.setLngLat(lngLat)
      } catch (error) {
        // 静默处理错误
      }
    }
    
    return this
  }

  // 更新 DOM 元素
  updateMarkerDom(newContentDom) {
    if (!this.DomMarker) {
      return this
    }

    if (!newContentDom) {
      return this
    }

    // 标准化 contentDom：如果是 HTML 字符串，转换为 DOM 元素
    const normalizedContentDom = this._normalizeContentDom(newContentDom)
    if (!normalizedContentDom) {
      return this
    }

    // 处理 Promise 返回值
    if (this.DomMarker && typeof this.DomMarker.then === 'function') {
      this.DomMarker.then(actualMarker => {
        if (actualMarker && typeof actualMarker.update === 'function') {
          try {
            actualMarker.update({ element: normalizedContentDom })
            this.contentDom = normalizedContentDom
          } catch (error) {
            // 静默处理错误
          }
        }
      }).catch(error => {
        // 静默处理错误
      })
      return this
    }

    // 同步调用 update 方法（兼容 HTMap 接口）
    if (this.DomMarker && typeof this.DomMarker.update === 'function') {
      try {
        this.DomMarker.update({ element: normalizedContentDom })
        this.contentDom = normalizedContentDom
      } catch (error) {
        // 静默处理错误
      }
    }

    return this
  }


  // 事件
  on(event, callback) {
    // 如果是 Promise，等待 resolve 后再执行
    if (this.DomMarker && typeof this.DomMarker.then === 'function') {
      this.DomMarker.then(actualMarker => {
        if (actualMarker && typeof actualMarker.on === 'function') {
          actualMarker.on(event, callback)
        }
      }).catch(error => {
        // 静默处理错误
      })
      return this
    }
    
    // 如果 marker 已经创建，直接绑定事件
    if (this.DomMarker && typeof this.DomMarker.on === 'function') {
      this.DomMarker.on(event, callback)
    } else {
      // 如果 marker 还没有创建，等待 marker 创建完成后再绑定
      // 使用轮询方式，确保 marker 已经添加到地图
      let retryCount = 0
      const maxRetries = 10
      const retryInterval = 100
      
      const tryBind = () => {
        if (this.DomMarker && typeof this.DomMarker.on === 'function') {
          this.DomMarker.on(event, callback)
        } else if (retryCount < maxRetries) {
          retryCount++
          setTimeout(tryBind, retryInterval)
        }
      }
      
      setTimeout(tryBind, retryInterval)
    }
    return this
  }

  off(event, callback) {
    // 如果是 Promise，等待 resolve 后再执行
    if (this.DomMarker && typeof this.DomMarker.then === 'function') {
      this.DomMarker.then(actualMarker => {
        if (actualMarker && typeof actualMarker.off === 'function') {
          actualMarker.off(event, callback)
        }
      })
      return this
    }
    
    if (this.DomMarker && typeof this.DomMarker.off === 'function') {
      this.DomMarker.off(event, callback)
    }
    return this
  }

  // 获取经纬度 - 调用底层地图的方法
  getLngLat() {
    // 优先调用底层 marker 对象的 getLngLat 方法
    if (this.DomMarker && typeof this.DomMarker.getLngLat === 'function') {
      try {
        return this.DomMarker.getLngLat()
      } catch (error) {
        // 静默处理错误，使用备用坐标
        return this.lngLat
      }
    }

    // 如果都没有，回退到初始坐标
    return this.lngLat
  }

}