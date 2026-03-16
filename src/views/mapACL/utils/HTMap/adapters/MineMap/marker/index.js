import { parseCoordinates, generateMarkerId } from '../utils/index.js'

/**
 * 单个标记点管理器 - 兼容 HTMap 接口
 * 使用 minemap.Marker 创建标记点，支持默认 DOM、HTML 字符串、自定义 DOM 元素
 * 参照 TencentMap.js 的实现方式，确保每个 marker 都是独立的实例
 */
export default class MarkerManager {
  constructor(mapInstance) {
    this.map = mapInstance.map
    this.marker = null
    this.element = null
    this.id = null
    this.coordinates = null
    this.options = null
    this.eventListeners = new Map()
    this._visibleMinZoom = 0
    this._visibleMaxZoom = 24
    this._markerZoomVisibleHandler = null
  }

  /**
   * 将 HTML 字符串转换为 DOM 元素
   * @param {string} htmlString - HTML 字符串
   * @returns {HTMLElement} DOM 元素
   * @private
   */
  _parseHTMLString(htmlString) {
    if (typeof htmlString !== 'string') {
      return null
    }
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlString.trim()
    return tempDiv.firstChild || tempDiv
  }

  /**
   * 创建默认标记点元素
   * @param {string} markerId - 标记点ID
   * @returns {HTMLElement} 标记点元素
   * @private
   */
  _createDefaultMarkerElement(markerId) {
    const img = document.createElement('img')
    img.src = require('../../assets/img/defaultPin.png')
    img.style.width = '38px'
    img.style.height = '46px'
    img.id = markerId
    img.className = 'ht-map-marker'
    img.style.display = 'block'
    img.style.cursor = 'pointer'
    return img
  }

  /**
   * 创建标记点元素 - 兼容 HTMap 接口
   * 支持两种模式：默认标记点、自定义DOM（HTML字符串或DOM元素）
   * @param {object} options - 标记点配置
   * @param {string} markerId - 标记点ID
   * @returns {HTMLElement} 标记点元素
   * @private
   */
  _createMarkerElement(options, markerId) {
    let element

    // 模式1：自定义DOM元素（支持HTMLElement或HTML字符串）
    if (options.element || options.contentDom) {
      const domElement = options.element || options.contentDom
      
      // 如果是字符串，解析为DOM元素
      if (typeof domElement === 'string') {
        element = this._parseHTMLString(domElement)
        if (!element) {
          element = this._createDefaultMarkerElement(markerId)
        }
      } 
      // 如果是DOM元素，克隆它（确保每个 marker 都有独立的 DOM 元素）
      else if (domElement && typeof domElement.cloneNode === 'function') {
        element = domElement.cloneNode(true)
      } 
      // 其他情况直接使用
      else {
        element = domElement
      }
      
      // 设置基础属性
      element.id = markerId
      element.className = element.className ? `${element.className} ht-map-marker` : 'ht-map-marker'
      if (!element.style) element.style = {}
      element.style.display = element.style.display || 'block'
      element.style.cursor = element.style.cursor || 'pointer'
    } 
    // 模式2：默认标记点
    else {
      element = this._createDefaultMarkerElement(markerId)
    }

    return element
  }

  /**
   * 转换偏移量格式
   * @param {Array|object} offset - 偏移量
   * @returns {Array} 偏移量数组
   * @private
   */
  _convertOffset(offset) {
    if (!offset) return [0, 0]
    
    if (Array.isArray(offset) && offset.length >= 2) {
      return [offset[0], offset[1]]
    }
    
    if (typeof offset === 'object') {
      return [offset.x || 0, offset.y || 0]
    }
    
    return [0, 0]
  }

  /**
   * 添加标记点 - 兼容 HTMap 接口
   * 使用 new minemap.Marker 创建标记点
   * @param {object} options - 标记点配置
   * @param {Array|object} options.lngLat - 坐标位置 [lng, lat] 或 {lng, lat}（必填）
   * @param {string} options.id - 标记点ID（可选）
   * @param {boolean} options.draggable - 是否可拖拽，默认 false（可选）
   * @param {string} options.anchor - 锚点位置，默认 'bottom'（可选）
   * @param {Array} options.offset - 偏移量 [x, y]，默认 [0, 0]（可选）
   * @param {number} options.minZoom - 最小缩放级别，默认 0（可选）
   * @param {number} options.maxZoom - 最大缩放级别，默认 24（可选）
   * @param {HTMLElement|string} options.element - 自定义DOM元素或HTML字符串（可选）
   * @param {HTMLElement|string} options.contentDom - 自定义DOM元素或HTML字符串（可选，与element相同）
   * @param {object} options.properties - 自定义属性对象（可选）
   * @returns {object} 标记点实例
   */
  addDomMarker(options) {
    if (!this.map) {
      return null
    }

    // 验证必需参数
    if (!options.lngLat) {
      return null
    }

    try {
      // 解析坐标
      const coordinates = parseCoordinates(options)
      const markerId = options.id || generateMarkerId()
      
      // 统一参数默认值
      const anchor = options.anchor || 'bottom'
      const offset = options.offset || [0, 0]
      const draggable = (typeof options.draggable === 'boolean') ? options.draggable : false
      const minZoom = options.minZoom !== undefined ? options.minZoom : 0
      const maxZoom = options.maxZoom !== undefined ? options.maxZoom : 24
      const properties = options.properties || {}
      
      // 创建标记点元素（支持默认或自定义DOM）
      const el = this._createMarkerElement(options, markerId)
      
      // 构建 marker 配置
      const markerConfig = {
        element: el,
        anchor,
        offset: this._convertOffset(offset),
        draggable,
      }

      // 处理faceForward参数
      if (options.faceForward) {
        if (options.faceForward === 'map') {
          markerConfig.pitchAlignment = 'map'
          markerConfig.rotationAlignment = 'map'
        } else if (options.faceForward === 'viewport') {
          markerConfig.pitchAlignment = 'viewport'
          markerConfig.rotationAlignment = 'viewport'
        }
      }

      // 添加可选参数
      if (options.pitchAlignment) {
        markerConfig.pitchAlignment = options.pitchAlignment
      }
      if (options.rotationAlignment) {
        markerConfig.rotationAlignment = options.rotationAlignment
      }
      if (options.scale !== undefined) {
        markerConfig.scale = options.scale
      }
      if (options.rotation !== undefined) {
        markerConfig.rotation = options.rotation
      }
      if (options.color) {
        markerConfig.color = options.color
      }

      // ====== 手动实现 minZoom/maxZoom 缩放区间控制显隐 ======
      // 保存缩放范围到实例属性，确保每个 marker 都有独立的缩放范围
      this._visibleMinZoom = minZoom
      this._visibleMaxZoom = maxZoom
      
      // 在创建 marker 之前，先判断当前 zoom，如果不在范围内则先隐藏 DOM，避免闪现
      const currentZoom = this.map.getZoom ? this.map.getZoom() : 0
      const visibleMinZoom = minZoom != null ? minZoom : 0
      const visibleMaxZoom = maxZoom != null ? maxZoom : 24
      
      // 优先判断当前 zoom，如果不满足 minZoom/maxZoom 则先隐藏
      if (currentZoom < visibleMinZoom || currentZoom > visibleMaxZoom) {
        el.style.display = 'none'
      } else {
        el.style.display = 'block'
      }
      
      // 使用 new minemap.Marker 创建标记点
      this.marker = new minemap.Marker(markerConfig)
        .setLngLat(coordinates)
        .addTo(this.map)

      // 保存实例信息
      this.element = el
      this.id = markerId
      this.coordinates = coordinates
      this.options = {
        ...options,
        anchor,
        offset,
        draggable,
        minZoom,
        maxZoom,
        properties,
      }
      
      // 实时监听zoom事件，实现marker实时显示/隐藏
      // 使用箭头函数保存 this 上下文，确保能访问实例属性
      const self = this
      this._markerZoomVisibleHandler = () => {
        if (!self || !self.map) return
        
        // 如果 marker id 不存在，无法根据 id 获取 DOM
        if (!self.id) return
        
        const zoom = self.map.getZoom ? self.map.getZoom() : 0
        
        // 根据 marker id 获取 DOM 元素（优先顺序：element -> getElementById -> marker.getElement）
        let el = self.element
        if (!el) {
          // 尝试通过 id 查找 DOM 元素
          el = document.getElementById(self.id)
        }
        if (!el && self.marker && self.marker.getElement) {
          // 最后尝试从 marker 实例获取
          el = self.marker.getElement()
        }
        if (!el) return
        
        // 从实例属性读取最新的缩放范围（支持动态更新）
        const visibleMinZoom = self._visibleMinZoom != null ? self._visibleMinZoom : 0
        const visibleMaxZoom = self._visibleMaxZoom != null ? self._visibleMaxZoom : 24
        
        // 根据缩放级别控制显示/隐藏
        if (zoom < visibleMinZoom || zoom > visibleMaxZoom) {
          el.style.display = 'none'
        } else {
          el.style.display = 'block'
        }
      }
      // 同时注册zoom（实时）和moveend（兜底）事件
      if (this.map && this.map.on) {
        this.map.on('zoom', this._markerZoomVisibleHandler)
        this.map.on('moveend', this._markerZoomVisibleHandler)
        // 立即执行一次可见性检查（不需要延迟，因为已经在创建前判断过）
        if (self && self._markerZoomVisibleHandler) {
          try {
            self._markerZoomVisibleHandler()
          } catch (error) {
            // 静默处理初始化错误
          }
        }
      }
      // ============  end手动控制显隐 ==================

      // 包装 remove 方法，确保清理事件监听器
      // 参照 TencentMap.js 的方式，每个 marker 都有独立的 remove 方法
      const originalRemove = this.marker.remove.bind(this.marker)
      const selfForRemove = this // 保存 MarkerManager 实例引用
      
      this.marker.remove = (...args) => {
        // 先调用原始 remove（必须先调用，再清理引用）
        let result = false
        try {
          if (originalRemove && typeof originalRemove === 'function') {
            result = originalRemove(...args)
          }
        } catch (error) {
          // 即使原始 remove 失败，也继续清理引用
          result = false
        }
        
        // 解绑 zoom 事件监听器
        if (selfForRemove.map && selfForRemove._markerZoomVisibleHandler) {
          try {
            selfForRemove.map.off && selfForRemove.map.off('zoom', selfForRemove._markerZoomVisibleHandler)
            selfForRemove.map.off && selfForRemove.map.off('moveend', selfForRemove._markerZoomVisibleHandler)
          } catch (error) {
            // 静默处理解绑错误
          }
          selfForRemove._markerZoomVisibleHandler = null
        }
        
        // 清理所有引用
        if (selfForRemove.element) {
          // 尝试从 DOM 中移除元素（如果还在 DOM 中）
          try {
            const el = selfForRemove.element
            if (el && el.parentNode) {
              el.parentNode.removeChild(el)
            }
          } catch (error) {
            // 静默处理 DOM 移除错误（可能元素已经被移除）
          }
        }
        
        // 清理事件监听器
        if (selfForRemove.eventListeners && selfForRemove.eventListeners.clear) {
          selfForRemove.eventListeners.clear()
        }
        
        // 清理所有引用（最后清理）
        selfForRemove.element = null
        selfForRemove.id = null
        selfForRemove.coordinates = null
        selfForRemove.options = null
        selfForRemove._visibleMinZoom = null
        selfForRemove._visibleMaxZoom = null
        // 注意：不要在这里设置 selfForRemove.marker = null
        // 因为原始 remove 可能还需要访问 marker
        
        return result
      }

      // 返回标记点实例
      return this._createMarkerInstance()
    } catch (error) {
      return null
    }
  }

  /**
   * 创建标记点实例对象
   * 参照 TencentMap.js 的方式，确保每个 marker 都是独立的实例
   * @returns {object} 标记点实例
   * @private
   */
  _createMarkerInstance() {
    // 保存 MarkerManager 实例引用，用于在 instance 方法中访问
    // 参照 TencentMap.js 的方式，使用 this 保存引用
    const markerManager = this
    
    // 创建返回对象
    const instance = {
      id: this.id,
      marker: this.marker,
      element: this.element,
      coordinates: this.coordinates,
      
      // 获取标记点信息
      getId: () => this.id,
      getCoordinates: () => this.coordinates,
      getElement: () => this.element,
      getMarker: () => this.marker,
      getProperties: () => this.options?.properties || {},
      setProperties: (props = {}) => {
        if (!this.options) this.options = {}
        if (!this.options.properties) this.options.properties = {}
        Object.assign(this.options.properties, props)
        return instance
      },
      
      // 更新标记点位置
      setLngLat: (lngLat) => {
        if (this.marker) {
          const coordinates = parseCoordinates({ lngLat })
          this.marker.setLngLat(coordinates)
          this.coordinates = coordinates
          return instance
        }
        return null
      },
      
      // 设置标记点可见性
      setVisible: (visible) => {
        // 根据 marker id 获取 DOM 元素（优先顺序：element -> getElementById -> marker.getElement）
        let el = this.element
        if (!el && this.id) {
          el = document.getElementById(this.id)
        }
        if (!el && this.marker && this.marker.getElement) {
          el = this.marker.getElement()
        }
        if (el) {
          el.style.display = visible ? 'block' : 'none'
        }
        return instance
      },
      
      // 获取标记点可见性
      getVisible: () => {
        // 根据 marker id 获取 DOM 元素（优先顺序：element -> getElementById -> marker.getElement）
        let el = this.element
        if (!el && this.id) {
          el = document.getElementById(this.id)
        }
        if (!el && this.marker && this.marker.getElement) {
          el = this.marker.getElement()
        }
        if (el) {
          const display = el.style.display || window.getComputedStyle(el).display
          return display !== 'none'
        }
        return false
      },
      
      // 更新标记点内容等
      update: (partial = {}) => {
        if (!this.marker || !this.element) return instance
        
        try {
          // 更新坐标
          if (partial.lngLat) {
            const coordinates = parseCoordinates({ lngLat: partial.lngLat })
            if (this.marker) {
              this.marker.setLngLat(coordinates)
              this.coordinates = coordinates
            }
          }
          
          // 更新可见性
          if (partial.visible !== undefined) {
            // 根据 marker id 获取 DOM 元素
            let el = this.element
            if (!el && this.id) {
              el = document.getElementById(this.id)
            }
            if (!el && this.marker && this.marker.getElement) {
              el = this.marker.getElement()
            }
            if (el) {
              el.style.display = partial.visible ? 'block' : 'none'
            }
          }
          
          // 更新拖拽状态
          if (partial.draggable !== undefined) {
            if (this.marker && typeof this.marker.setDraggable === 'function') {
              this.marker.setDraggable(partial.draggable)
            }
            this.options.draggable = partial.draggable
          }
          
          // 更新element（自定义DOM，支持HTMLElement或HTML字符串）
          if (partial.element !== undefined) {
            let newElement
            
            // 如果是字符串，解析为DOM元素
            if (typeof partial.element === 'string') {
              const tempDiv = document.createElement('div')
              tempDiv.innerHTML = partial.element.trim()
              newElement = tempDiv.firstChild || tempDiv
            } 
            // 如果是DOM元素，克隆它
            else if (partial.element && typeof partial.element.cloneNode === 'function') {
              newElement = partial.element.cloneNode(true)
            } 
            // 其他情况直接使用
            else {
              newElement = partial.element
            }
            
            // 设置基础属性
            if (newElement) {
              // 保留原有元素的 id（如果有）
              if (this.element && this.element.id) {
                newElement.id = this.element.id
              }
              newElement.className = newElement.className ? `${newElement.className} ht-map-marker` : 'ht-map-marker'
              if (!newElement.style) newElement.style = {}
              // 保留原有元素的 display 状态（如果有）
              const currentDisplay = this.element && this.element.style ? this.element.style.display : 'block'
              newElement.style.display = newElement.style.display || currentDisplay || 'block'
              newElement.style.cursor = newElement.style.cursor || 'pointer'
              
              // 替换element
              this.element = newElement
              
              // 调用底层 marker 的 setElement 方法更新 DOM
              if (this.marker && typeof this.marker.setElement === 'function') {
                try {
                  this.marker.setElement(newElement)
                } catch (error) {
                  // setElement 失败时的处理
                }
              }
            }
          }
          
          // 更新选项（这些属性需要在创建时设置，这里只更新options记录）
          if (partial.anchor !== undefined) {
            this.options.anchor = partial.anchor
          }
          if (partial.offset !== undefined) {
            this.options.offset = partial.offset
          }
          if (partial.minZoom !== undefined) {
            this.options.minZoom = partial.minZoom
            // 更新 MarkerManager 实例的缩放范围
            if (markerManager) {
              markerManager._visibleMinZoom = partial.minZoom != null ? partial.minZoom : 0
              // 立即触发一次可见性检查，应用新的缩放范围
              if (markerManager._markerZoomVisibleHandler) {
                markerManager._markerZoomVisibleHandler()
              }
            }
          }
          if (partial.maxZoom !== undefined) {
            this.options.maxZoom = partial.maxZoom
            // 更新 MarkerManager 实例的缩放范围
            if (markerManager) {
              markerManager._visibleMaxZoom = partial.maxZoom != null ? partial.maxZoom : 24
              // 立即触发一次可见性检查，应用新的缩放范围
              if (markerManager._markerZoomVisibleHandler) {
                markerManager._markerZoomVisibleHandler()
              }
            }
          }
          
          // 更新 properties
          if (partial.properties !== undefined) {
            if (!this.options.properties) this.options.properties = {}
            Object.assign(this.options.properties, partial.properties)
          }
          
          // 更新内部options（排除properties，因为已单独处理）
          const { properties, ...restPartial } = partial
          Object.assign(this.options, restPartial)
        } catch (error) {
          // 静默失败，不输出错误日志
        }
        
        return instance
      },
      
      // 删除标记点仅分发
      // 参照 TencentMap.js 的方式，每个 marker 都有独立的 remove 方法
      remove: () => {
        if (!this.marker) {
          return false
        }
        
        // 调用包装后的 remove 方法，确保清理事件监听器
        let result = false
        try {
          // 调用包装后的 remove 方法（已经包含了清理逻辑）
          result = this.marker.remove()
        } catch (error) {
          // 即使 remove 失败，也尝试清理
          result = false
        }
        
        // 确保清理 MarkerManager 实例的引用（双重保险）
        if (markerManager && markerManager.marker) {
          markerManager.marker = null
        }
        
        return result
      },
      
      // 事件绑定 - 兼容 HTMap 接口，生成标准事件数据格式
      on: (event, callback) => {
        // 获取 DOM 元素（优先顺序：element -> getElementById -> marker.getElement）
        let el = this.element
        if (!el && this.id) {
          el = document.getElementById(this.id)
        }
        if (!el && this.marker && this.marker.getElement) {
          el = this.marker.getElement()
        }
        
        if (!el || !this.marker) {
          // 如果元素或 marker 不存在，延迟绑定
          setTimeout(() => {
            instance.on(event, callback)
          }, 100)
          return instance
        }
        
        // 转换事件名称（rightClick -> contextmenu）
        const domEventType = event === 'rightClick' ? 'contextmenu' : event
        
        // 创建事件包装器，生成标准格式的事件数据
        const wrappedCallback = (e) => {
          const eventData = {
            // HTMap 标准格式
            type: event,
            target: el,
            lngLat: this.coordinates ? {
              lng: this.coordinates[0],
              lat: this.coordinates[1]
            } : null,
            latLng: this.coordinates ? {
              lng: this.coordinates[0],
              lat: this.coordinates[1]
            } : null,
            point: {
              x: e.clientX || 0,
              y: e.clientY || 0
            },
            originalEvent: e,
            
            // 标记点相关数据
            marker: {
              id: this.id,
              coordinates: this.coordinates,
              properties: this.options?.properties || {}
            },
            markerInstance: this.marker,
            geometry: {
              id: this.id,
              coordinates: this.coordinates,
              properties: this.options?.properties || {}
            },
            properties: this.options?.properties || {},
            id: this.id,
            coordinates: this.coordinates,
            
            // 事件状态
            timestamp: Date.now()
          }
          
          // 调用原始回调，传入标准格式的事件数据
          callback(eventData)
        }
        
        if (!markerManager.eventListeners.has(event)) {
          markerManager.eventListeners.set(event, [])
        }
        // 存储原始回调，用于解绑
        markerManager.eventListeners.get(event).push({ original: callback, wrapped: wrappedCallback })
        
        // 创建最终的事件处理函数
        const finalHandler = (e) => {
          // 阻止右键菜单（如果是 rightClick）
          if (event === 'rightClick' && e.preventDefault) {
            e.preventDefault()
          }
          wrappedCallback(e)
        }
        
        // 绑定事件到 DOM 元素
        el.addEventListener(domEventType, finalHandler)
        
        // 更新存储，包含最终处理函数用于解绑
        const lastItem = markerManager.eventListeners.get(event)[markerManager.eventListeners.get(event).length - 1]
        lastItem.finalHandler = finalHandler
        
        return instance
      },
      
      // 事件解绑
      off: (event, callback) => {
        // 获取 DOM 元素（优先顺序：element -> getElementById -> marker.getElement）
        let el = this.element
        if (!el && this.id) {
          el = document.getElementById(this.id)
        }
        if (!el && this.marker && this.marker.getElement) {
          el = this.marker.getElement()
        }
        
        if (!el || !markerManager.eventListeners.has(event)) {
          return instance
        }
        
        const list = markerManager.eventListeners.get(event)
        if (list) {
          // 查找匹配的原始回调
          const idx = list.findIndex(item => item.original === callback)
          if (idx > -1) {
            const domEventType = event === 'rightClick' ? 'contextmenu' : event
            const item = list[idx]
            // 使用 finalHandler 进行解绑（如果有）
            const handlerToRemove = item.finalHandler || item.wrapped
            el.removeEventListener(domEventType, handlerToRemove)
            list.splice(idx, 1)
            if (list.length === 0) {
              markerManager.eventListeners.delete(event)
            }
          }
        }
        return instance
      },
      
      // 触发事件
      trigger: (event, data) => {
        // 获取 DOM 元素（优先顺序：element -> getElementById -> marker.getElement）
        let el = this.element
        if (!el && this.id) {
          el = document.getElementById(this.id)
        }
        if (!el && this.marker && this.marker.getElement) {
          el = this.marker.getElement()
        }
        
        if (el) {
          const customEvent = new CustomEvent(event, { detail: data })
          el.dispatchEvent(customEvent)
          return instance
        }
        return null
      },
      
      // HTMap兼容的事件方法
      // 一次性事件绑定
      once: (event, callback) => {
        if (this.marker && this.element) {
          const onceCallback = (eventData) => {
            callback(eventData)
            instance.off(event, onceCallback)
          }
          return instance.on(event, onceCallback)
        }
        return null
      },
      
      // 事件管理方法 - 兼容HTMap接口
      getEventListenersCount: (event) => {
        if (event) {
          const listeners = markerManager.eventListeners.get(event)
          return listeners ? listeners.length : 0
        } else {
          let total = 0
          markerManager.eventListeners.forEach(listeners => {
            total += listeners.length
          })
          return total
        }
      },
      hasEventListeners: (event) => {
        const listeners = markerManager.eventListeners.get(event)
        return listeners && listeners.length > 0
      },
      
      // 移除所有事件监听器
      removeAllListeners: (event) => {
        if (event) {
          // 移除特定事件的所有监听器
          if (markerManager.eventListeners.has(event)) {
            const list = markerManager.eventListeners.get(event)
            const domEventType = event === 'rightClick' ? 'contextmenu' : event
            list.forEach(item => {
              const handlerToRemove = item.finalHandler || item.wrapped
              this.element.removeEventListener(domEventType, handlerToRemove)
            })
            markerManager.eventListeners.delete(event)
          }
          return instance
        } else {
          // 移除所有事件的所有监听器
          markerManager.eventListeners.forEach((listeners, eventName) => {
            const domEventType = eventName === 'rightClick' ? 'contextmenu' : eventName
            listeners.forEach(item => {
              const handlerToRemove = item.finalHandler || item.wrapped
              this.element.removeEventListener(domEventType, handlerToRemove)
            })
          })
          markerManager.eventListeners.clear()
          return instance
        }
      },
      
      // 检查标记点是否已移除
      isRemoved: () => {
        return this.marker === null
      },
      
      // 获取标记点状态
      getStatus: () => {
        return {
          id: this.id,
          coordinates: this.coordinates,
          isRemoved: this.isRemoved(),
          hasElement: this.element !== null,
          hasMarker: this.marker !== null,
          listenerCount: instance.getEventListenersCount()
        }
      }
    }
    
    // 使用 Object.defineProperty 添加 properties 的 getter/setter
    Object.defineProperty(instance, 'properties', {
      get: () => this.options?.properties || {},
      set: (value) => {
        if (!this.options) this.options = {}
        this.options.properties = value || {}
      },
      enumerable: true,
      configurable: true
    })
    
    return instance
  }
}
