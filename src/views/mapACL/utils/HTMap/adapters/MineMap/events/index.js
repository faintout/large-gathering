/**
 * 地图事件管理器
 * 负责管理所有地图相关的事件处理
 */
export default class EventManager {
  constructor(mapInstance) {
    this.map = mapInstance.map
    this.mapInstance = mapInstance
    // 初始化事件监听器存储
    this.eventListeners = new Map()
    // 事件节流和防抖存储
    this.eventThrottles = new Map()
    this.eventDebounces = new Map()
    
    // 绑定地图原生事件
    this._bindMapEvents()
  }

  /**
   * 绑定地图事件
   */
  _bindMapEvents() {
    if (!this.map) return

    const eventConfigs = {
      // 基础事件
      'load': () => ({ map: this.map }),
      'style.load': () => ({}),
      'error': (evt) => ({ error: evt.error, originalEvent: evt }),
      
      // 点击事件
      'click': (evt) => this._formatClickEvent(evt),
      'dblclick': (evt) => this._formatClickEvent(evt),
      'contextmenu': (evt) => this._formatClickEvent(evt),
      
      // 缩放事件
      'zoomstart': () => ({ zoom: this.map.getZoom() }),
      'zoom': () => ({ zoom: this.map.getZoom() }),
      'zoomend': () => ({ zoom: this.map.getZoom() }),
      
      // 移动事件
      'movestart': (evt) => this._formatMoveEvent(evt),
      'move': (evt) => this._formatMoveEvent(evt),
      'moveend': (evt) => this._formatMoveEvent(evt),
      
      // 旋转事件
      'rotatestart': () => ({ bearing: this.map.getBearing() }),
      'rotate': () => ({ bearing: this.map.getBearing() }),
      'rotateend': () => ({ bearing: this.map.getBearing() }),
      
      // 倾斜事件
      'pitchstart': () => ({ pitch: this.map.getPitch() }),
      'pitch': () => ({ pitch: this.map.getPitch() }),
      'pitchend': () => ({ pitch: this.map.getPitch() }),
      
      // 鼠标事件
      'mouseenter': (evt) => this._formatMouseEvent(evt),
      'mouseleave': (evt) => this._formatMouseEvent(evt),
      'mousemove': (evt) => this._formatMouseEvent(evt),
      'mousedown': (evt) => this._formatMouseEvent(evt),
      'mouseup': (evt) => this._formatMouseEvent(evt),
      
      // 拖拽事件
      'dragstart': () => ({ center: this.map.getCenter() }),
      'drag': () => ({ center: this.map.getCenter() }),
      'dragend': () => ({ center: this.map.getCenter() }),
      
      // 数据事件
      'dataloading': () => ({}),
      'data': () => ({}),
      'sourcedata': () => ({}),
      'render': () => ({})
    }

    // 批量绑定事件
    Object.entries(eventConfigs).forEach(([eventName, dataFormatter]) => {
      this.map.on(eventName, (evt) => {
        const eventData = dataFormatter(evt)
        this.triggerEvent(eventName, eventData)
      })
    })
  }

  /**
   * 格式化点击事件数据
   * @param {object} evt - 原始事件对象
   * @returns {object} 格式化后的事件数据
   * @private
   */
  _formatClickEvent(evt) {
    return {
      lngLat: evt.lngLat || { lng: evt.lng, lat: evt.lat },
      point: evt.point || { x: evt.x, y: evt.y },
      originalEvent: evt.originalEvent || evt
    }
  }

  /**
   * 格式化移动事件数据
   * @param {object} evt - 原始事件对象
   * @returns {object} 格式化后的事件数据
   * @private
   */
  _formatMoveEvent(evt) {
    return {
      target: evt.target,
      originalEvent: evt.originalEvent,
      type: evt.type,
      timestamp: Date.now()
    }
  }

  /**
   * 格式化鼠标事件数据
   * @param {object} evt - 原始事件对象
   * @returns {object} 格式化后的事件数据
   * @private
   */
  _formatMouseEvent(evt) {
    return {
      target: evt.target,
      latlng: [evt.lngLat.lng, evt.lngLat.lat],
      pixel: [evt.point.x, evt.point.y],
      originalEvent: evt
    }
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {object} eventData - 事件数据
   */
  triggerEvent(eventName, eventData) {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName)
      listeners.forEach(callback => {
        try {
          callback(eventData)
        } catch (error) {
          console.error(`EventManager.triggerEvent: 事件回调执行错误 [${eventName}]:`, error)
        }
      })
    }
  }

  /**
   * 触发事件 - HTMap兼容方法
   * @param {string} event - 事件名称
   * @param {object} data - 事件数据
   */
  trigger(event, data) {
    return this.triggerEvent(event, data)
  }

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} delay - 延迟时间
   * @returns {Function} 节流后的函数
   * @private
   */
  _throttle(func, delay) {
    let timeoutId
    let lastExecTime = 0
    return function (...args) {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args)
        lastExecTime = currentTime
      } else {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func.apply(this, args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  }

  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} delay - 延迟时间
   * @returns {Function} 防抖后的函数
   * @private
   */
  _debounce(func, delay) {
    let timeoutId
    return function (...args) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  }

  /**
   * 添加带节流的事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {number} delay - 节流延迟时间
   */
  addThrottledEventListener(event, callback, delay = 100) {
    const throttledCallback = this._throttle(callback, delay)
    this.eventThrottles.set(event, throttledCallback)
    this.addEventListener(event, throttledCallback)
  }

  /**
   * 添加带防抖的事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {number} delay - 防抖延迟时间
   */
  addDebouncedEventListener(event, callback, delay = 300) {
    let timeoutId
    const debouncedCallback = (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => callback.apply(this, args), delay)
    }
    this.eventDebounces.set(event, debouncedCallback)
    this.addEventListener(event, debouncedCallback)
  }

  /**
   * 添加带节流的事件监听器 - HTMap兼容方法
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {number} delay - 节流延迟时间（毫秒）
   */
  onThrottled(event, callback, delay = 100) {
    const throttledCallback = this._throttle(callback, delay)
    this.on(event, throttledCallback)
  }

  /**
   * 添加带防抖的事件监听器 - HTMap兼容方法
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {number} delay - 防抖延迟时间（毫秒）
   */
  onDebounced(event, callback, delay = 300) {
    const debouncedCallback = this._debounce(callback, delay)
    this.on(event, debouncedCallback)
  }

  /**
   * 绑定事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  /**
   * 绑定事件监听器 - HTMap兼容方法
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {object} options - 事件选项
   */
  on(event, callback, options = {}) {
    if (!this.map) return this
    
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
    
    return this
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
      
      // 如果没有监听器了，删除该事件
      if (listeners.length === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  /**
   * 移除事件监听器 - HTMap兼容方法
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数（可选，如果不传则移除该事件的所有监听器）
   */
  off(event, callback) {
    if (!this.map) return this
    
    if (this.eventListeners.has(event)) {
      if (callback) {
        // 移除特定的回调函数
        const listeners = this.eventListeners.get(event)
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      } else {
        // 移除该事件的所有监听器
        this.eventListeners.delete(event)
      }
    }
    
    return this
  }

  /**
   * 检查是否为地图原生事件
   * @param {string} event - 事件名称
   * @returns {boolean} 是否为原生事件
   * @private
   */
  _isNativeMapEvent(event) {
    const nativeEvents = [
      'load', 'click', 'dblclick', 'contextmenu',
      'zoomstart', 'zoom', 'zoomend',
      'movestart', 'move', 'moveend',
      'rotatestart', 'rotate', 'rotateend',
      'pitchstart', 'pitch', 'pitchend',
      'mouseenter', 'mouseleave', 'mousemove', 'mousedown', 'mouseup',
      'dragstart', 'drag', 'dragend',
      'error', 'dataloading',
    ]
    return nativeEvents.includes(event)
  }

  /**
   * 获取地图事件列表
   * @returns {Array} 支持的事件列表
   */
  getSupportedEvents() {
    return [
      'load', 'click', 'dblclick', 'contextmenu',
      'zoomstart', 'zoom', 'zoomend',
      'movestart', 'move', 'moveend',
      'rotatestart', 'rotate', 'rotateend',
      'pitchstart', 'pitch', 'pitchend',
      'mouseenter', 'mouseleave', 'mousemove', 'mousedown', 'mouseup',
      'dragstart', 'drag', 'dragend',
      'error', 'dataloading', 'data', 'styledata', 'sourcedata',
      'render', 
    ]
  }

  /**
   * 清除所有地图事件监听
   */
  clearAllEvents() {
    if (!this.map) return

    // 清除所有原生事件监听
    const events = this.getSupportedEvents()
    events.forEach(event => {
      this.map.off(event)
    })

    // 清除所有自定义事件监听器
    this.eventListeners.clear()
    
    // 清除节流和防抖存储
    this.eventThrottles.clear()
    this.eventDebounces.clear()
  }

  /**
   * 获取事件监听器数量
   * @param {string} event - 事件名称
   * @returns {number} 监听器数量
   */
  getEventListenersCount(event) {
    if (this.eventListeners.has(event)) {
      return this.eventListeners.get(event).length
    }
    return 0
  }

  /**
   * 检查事件是否有监听器
   * @param {string} event - 事件名称
   * @returns {boolean} 是否有监听器
   */
  hasEventListeners(event) {
    return this.getEventListenersCount(event) > 0
  }

  /**
   * 一次性事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  once(event, callback) {
    const onceCallback = (eventData) => {
      callback(eventData)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }

  /**
   * 批量添加事件监听器
   * @param {object} eventHandlers - 事件处理器对象
   */
  addEventListeners(eventHandlers) {
    Object.entries(eventHandlers).forEach(([event, callback]) => {
      this.addEventListener(event, callback)
    })
  }

  /**
   * 批量移除事件监听器
   * @param {object} eventHandlers - 事件处理器对象
   */
  removeEventListeners(eventHandlers) {
    Object.entries(eventHandlers).forEach(([event, callback]) => {
      this.removeEventListener(event, callback)
    })
  }

  /**
   * 批量添加事件监听器 - HTMap兼容方法
   * @param {object} events - 事件配置对象 {eventName: callback}
   */
  onMultiple(events) {
    Object.entries(events).forEach(([event, callback]) => {
      this.on(event, callback)
    })
  }

  /**
   * 批量移除事件监听器 - HTMap兼容方法
   * @param {Array} events - 事件名称数组
   */
  offMultiple(events) {
    events.forEach(event => {
      this.off(event)
    })
  }

  /**
   * 销毁事件管理器
   */
  destroy() {
    this.clearAllEvents()
    this.eventListeners.clear()
    this.eventThrottles.clear()
    this.eventDebounces.clear()
  }
}
