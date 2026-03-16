import { tencentConfig, mineMapConfig, mapboxConfig } from '../config/defaultConfig.js'

/**
 * 地图适配器基类
 * 定义所有地图引擎必须实现接口
 */
export default class BaseAdapter {
  constructor(containerId, options = {}) {
    if (new.target === BaseAdapter) {
      throw new Error('BaseAdapter 是抽象类，不能直接实例化')
    }
    
    // 支持传入容器ID字符串或DOM元素
    this.containerId = typeof containerId === 'string' ? containerId : containerId.id
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId
    this.options = options
    this.map = null
    this.layers = new Map()
    // 通用事件系统
    this.eventListeners = new Map()
    
    // 验证容器是否存在
    if (!this.container) {
      throw new Error(`地图容器不存在: ${this.containerId}`)
    }
  }

  /**
   * 绑定自定义事件监听
   * 适配器可在内部通过 this.triggerEvent(event, data) 触发
   */
  on(event, callback) {
    if (!event || typeof callback !== 'function') return
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  /**
   * 解绑事件监听
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) return
    if (!callback) {
      this.eventListeners.delete(event)
      return
    }
    const listeners = this.eventListeners.get(event)
    const idx = listeners.indexOf(callback)
    if (idx > -1) listeners.splice(idx, 1)
    if (listeners.length === 0) this.eventListeners.delete(event)
  }

  /**
   * 触发自定义事件
   */
  triggerEvent(event, data) {
    if (!this.eventListeners.has(event)) return
    const listeners = [...this.eventListeners.get(event)]
    listeners.forEach(cb => {
      try { cb(data) } catch (e) { console.error(`事件 ${event} 回调执行错误:`, e) }
    })
  }

  /**
   * 初始化地图 - 子类必须实现
   */
  init() {
    throw new Error('init 方法必须由子类实现')
  }

  /**
   * 销毁地图
   */
  destroy() {
    if (this.map) {
      // 清除所有图层
      this.clearLayers()
      
      // 销毁地图实例
      if (this.map.destroy) {
        this.map.destroy()
      }
      
      this.map = null
    }
  }

  /**
   * 设置地图中心点
   * @param {Array} center - 中心点坐标 [lng, lat]
   */
  setCenter(center) {
    // 参数验证和格式转换
    let validCenter
    
    try {
      if (typeof center === 'string') {
        // 处理字符串格式的中心点
        validCenter = JSON.parse(center.replace(/'/g, '"'))
      } else if (Array.isArray(center)) {
        validCenter = center
      } else {
        throw new Error('中心点参数格式错误')
      }
      
      // 验证数组格式和长度
      if (!Array.isArray(validCenter) || validCenter.length !== 2) {
        throw new Error('中心点必须是包含两个元素的数组 [经度, 纬度]')
      }
      
      // 验证数值类型
      if (typeof validCenter[0] !== 'number' || typeof validCenter[1] !== 'number') {
        throw new Error('中心点坐标必须是数值类型')
      }
      
      // 验证经纬度范围
      if (validCenter[0] < -180 || validCenter[0] > 180) {
        throw new Error('经度必须在 -180 到 180 之间')
      }
      if (validCenter[1] < -90 || validCenter[1] > 90) {
        throw new Error('纬度必须在 -90 到 90 之间')
      }
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('中心点字符串格式错误，请使用 [经度, 纬度] 格式')
      }
      throw error
    }
    
    // 调用子类的具体实现
    this._setCenter(validCenter)
  }
  
  /**
   * 子类需要实现的具体设置中心点方法
   * @param {Array} center - 验证后的中心点坐标 [lng, lat]
   * @private
   */
  _setCenter(center) {
    throw new Error('_setCenter 方法必须由子类实现')
  }

  /**
   * 获取地图中心点
   * @returns {Array} 中心点坐标 [lng, lat]
   */
  getCenter() {
    throw new Error('getCenter 方法必须由子类实现')
  }

  /**
   * 设置地图缩放级别
   * @param {number|string} zoom - 缩放级别
   */
  setZoom(zoom) {
    let validZoom = zoom
    
    // 如果是字符串，尝试转换为数字
    if (typeof zoom === 'string') {
      validZoom = parseFloat(zoom)
      
      // 检查转换是否成功
      if (isNaN(validZoom)) {
        throw new Error('缩放级别字符串无法转换为有效数字')
      }
    }
    
    // 参数类型验证
    if (typeof validZoom !== 'number') {
      throw new Error('缩放级别必须是数值类型或可转换为数值的字符串')
    }
    
    // 检查是否为有效数字
    if (!Number.isFinite(validZoom)) {
      throw new Error('缩放级别必须是有限数值')
    }
    
    // 检查缩放级别范围 (一般地图的缩放级别在 0-24 之间)
    if (validZoom < 0 || validZoom > 24) {
      throw new Error('缩放级别必须在 0 到 24 之间')
    }
    
    throw new Error('setZoom 方法必须由子类实现')
  }

  /**
   * 获取地图缩放级别
   * @returns {number} 缩放级别
   */
  getZoom() {
    throw new Error('getZoom 方法必须由子类实现')
  }


  /**
   *  todo 看是否需要
   * 设置地图中心点和缩放级别
   * @param {Array} center - 中心点坐标 [lng, lat]
   * @param {number} zoom - 缩放级别
   */
  setView(center, zoom) {
    throw new Error('setView 方法必须由子类实现')
  }

  /**
   * 平滑过渡到指定视角 (easeTo)
   * @param {object} options - 移动选项
   * @param {Array} options.center - 中心点坐标 [lng, lat]
   * @param {number} options.zoom - 缩放级别
   * @param {number} options.bearing - 旋转角度 (0-360度)  非必填
   * @param {number} options.pitch - 倾斜角度 (0-90度)     非必填
   * @param {object|number} options.padding - 边界内边距，可以是数字或数组 [top, right, bottom, left]   非必填
   * @param {number} options.duration - 动画时长 (毫秒) 非必填，默认值 1500
   */
  easeTo(options) {
    // 参数验证
    let validCenter, validZoom, validBearing, validPitch, validDuration, validPadding
    
    try {
      // 验证中心点
      if (typeof options.center === 'string') {
        validCenter = JSON.parse(options.center.replace(/'/g, '"'))
      } else if (Array.isArray(options.center)) {
        validCenter = options.center
      } else {
        throw new Error('中心点参数格式错误')
      }
      
      if (!Array.isArray(validCenter) || validCenter.length !== 2) {
        throw new Error('中心点必须是包含两个元素的数组 [经度, 纬度]')
      }
      
      const lng = parseFloat(validCenter[0])
      const lat = parseFloat(validCenter[1])
      
      if (isNaN(lng) || isNaN(lat)) {
        throw new Error('请输入有效的经纬度坐标')
      }
      
      if (lng < -180 || lng > 180) {
        throw new Error('经度必须在 -180 到 180 之间')
      }
      if (lat < -90 || lat > 90) {
        throw new Error('纬度必须在 -90 到 90 之间')
      }
      
      // 验证缩放级别
      validZoom = parseInt(options.zoom)
      if (isNaN(validZoom)) {
        throw new Error('请输入有效的缩放级别')
      }
      
      // 获取当前地图引擎的缩放级别范围
      const minZoom = this.getMinZoom()
      const maxZoom = this.getMaxZoom()
      if (validZoom < minZoom || validZoom > maxZoom) {
        throw new Error(`缩放级别必须在 ${minZoom} - ${maxZoom} 之间`)
      }
      
      // 验证旋转角度（非必填，如果填写了则校验格式）
      if (options.bearing !== undefined && options.bearing !== null) {
        validBearing = parseFloat(options.bearing)
        if (isNaN(validBearing)) {
          throw new Error('请输入有效的旋转角度')
        }
        if (validBearing < 0 || validBearing > 360) {
          throw new Error('旋转角度必须在 0 - 360 度之间')
        }
      }
      
      // 验证倾斜角度（非必填，如果填写了则校验格式）
      if (options.pitch !== undefined && options.pitch !== null) {
        validPitch = parseFloat(options.pitch)
        if (isNaN(validPitch)) {
          throw new Error('请输入有效的倾斜角度')
        }
        
        // 获取当前地图引擎的倾斜角度范围
        const maxPitch = this.getMaxPitch()
        if (validPitch < 0 || validPitch > maxPitch) {
          throw new Error(`倾斜角度必须在 0 - ${maxPitch} 度之间`)
        }
      }
      
      // 验证动画时长（非必填，如果填写了则校验格式，未填写则使用默认值 1500）
      if (options.duration !== undefined && options.duration !== null) {
        validDuration = parseInt(options.duration)
        if (isNaN(validDuration)) {
          throw new Error('请输入有效的动画时长')
        }
        if (validDuration < 0) {
          throw new Error('动画时长不能为负数')
        }
      } else {
        validDuration = 1500 // 默认值
      }
      
      // 验证padding参数（非必填，如果填写了则校验格式）
      if (options.padding !== undefined && options.padding !== null) {
        if (typeof options.padding === 'number') {
          if (isNaN(options.padding) || !Number.isFinite(options.padding)) {
            throw new Error('padding值必须是有效的数字')
          }
          if (options.padding < 0) {
            throw new Error('padding值不能为负数')
          }
          validPadding = options.padding
        } else if (Array.isArray(options.padding)) {
          // 验证数组格式的padding [top, right, bottom, left]
          if (options.padding.length !== 4) {
            throw new Error('padding数组必须包含4个元素 [top, right, bottom, left]')
          }
          
          const [top, right, bottom, left] = options.padding
          if (typeof top !== 'number' || isNaN(top) || !Number.isFinite(top) || top < 0) {
            throw new Error('padding[0] (top) 必须是大于等于0的有效数字')
          }
          if (typeof right !== 'number' || isNaN(right) || !Number.isFinite(right) || right < 0) {
            throw new Error('padding[1] (right) 必须是大于等于0的有效数字')
          }
          if (typeof bottom !== 'number' || isNaN(bottom) || !Number.isFinite(bottom) || bottom < 0) {
            throw new Error('padding[2] (bottom) 必须是大于等于0的有效数字')
          }
          if (typeof left !== 'number' || isNaN(left) || !Number.isFinite(left) || left < 0) {
            throw new Error('padding[3] (left) 必须是大于等于0的有效数字')
          }
          validPadding = options.padding
        } else {
          throw new Error('padding参数必须是数字或数组格式 [top, right, bottom, left]')
        }
      }
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('中心点字符串格式错误，请使用 [经度, 纬度] 格式')
      }
      throw error
    }
    
    // 调用子类的具体实现
    this._easeTo({
      center: validCenter,
      zoom: validZoom,
      bearing: validBearing,
      pitch: validPitch,
      duration: validDuration,
      padding: validPadding
    })
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
   * @private
   */
  _easeTo(options) {
    throw new Error('_easeTo 方法必须由子类实现')
  }



  /**
   * 获取地图最小缩放级别
   * @returns {number} 最小缩放级别
   */
  getMinZoom() {
    // 从配置中获取当前地图引擎的最小缩放级别
    const engine = this.options?.engine || 'tencent'
    
    switch (engine) {
      case 'tencent':
        return tencentConfig.minZoom
      case 'minemap':
        return mineMapConfig.minZoom
      case 'mapbox':
        return mapboxConfig.minZoom
      default:
        return 0 // 默认值
    }
  }

  /**
   * 获取地图最大缩放级别
   * @returns {number} 最大缩放级别
   */
  getMaxZoom() {
    // 从配置中获取当前地图引擎的最大缩放级别
    const engine = this.options?.engine || 'tencent'
    
    switch (engine) {
      case 'tencent':
        return tencentConfig.maxZoom
      case 'minemap':
        return mineMapConfig.maxZoom
      case 'mapbox':
        return mapboxConfig.maxZoom
      default:
        return 22 // 默认值
    }
  }

  /**
   * 获取地图最大倾斜角度
   * @returns {number} 最大倾斜角度
   */
  getMaxPitch() {
    // 从配置中获取当前地图引擎的最大倾斜角度
    const engine = this.options?.engine || 'tencent'
    
    switch (engine) {
      case 'tencent':
        return tencentConfig.pitchRange[1]
      case 'minemap':
        return mineMapConfig.pitchRange[1]
      case 'mapbox':
        return mapboxConfig.pitchRange[1]
      default:
        return 60 // 默认值
    }
  }

  /**
   * 设置地图倾斜角度
   * @param {number} pitch - 倾斜角度 (0-60度)
   * @param {object} options - 动画选项
   */
  setPitch(pitch, options = {}) {
    throw new Error('setPitch 方法必须由子类实现')
  }

  /**
   * 设置地图旋转角度
   * @param {number} rotation - 旋转角度 (0-360度)
   * @param {object} options - 动画选项
   */
  setRotation(rotation, options = {}) {
    throw new Error('setRotation 方法必须由子类实现')
  }

  /**
   * 设置视图模式 (2D/3D)
   * @param {string} mode - 视图模式 ('2D' 或 '3D')
   * @param {object} options - 切换选项
   */
  setViewMode(mode, options = {}) {
    throw new Error('setViewMode 方法必须由子类实现')
  }

  /**
   * 设置样式类型
   * @param {string} styleType - 样式类型
   * @param {object} options - 切换选项
   */
  setStyleType(styleType, options = {}) {
    throw new Error('setStyleType 方法必须由子类实现')
  }

  /**
   * 获取地图倾斜角度
   * @returns {number} 倾斜角度
   */
  getPitch() {
    throw new Error('getPitch 方法必须由子类实现')
  }

  /**
   * 获取地图旋转角度
   * @returns {number} 旋转角度
   */
  getRotation() {
    throw new Error('getRotation 方法必须由子类实现')
  }

  /**
   * 获取当前视图模式
   * @returns {string} 视图模式 ('2D' 或 '3D')
   */
  getViewMode() {
    throw new Error('getViewMode 方法必须由子类实现')
  }

  /**
   * 获取当前样式类型
   * @returns {string} 样式类型
   */
  getStyleType() {
    throw new Error('getStyleType 方法必须由子类实现')
  }

  /**
   * 设置地图视野范围 - 基类实现，包含参数验证
   * @param {object} options - 移动选项
   * @param {object} options.sw - 视野范围 sw: [lng, lat]
   * @param {object} options.ne - 视野范围 ne: [lng, lat]
   * @param {object} options.padding - 边距  单个数值或四个数值数组 [top, right, bottom, left]
   * @returns {boolean} 设置是否成功
   */
  setBounds(options) {
    if (!this.map) return false

    try {
      // 验证边界坐标
      if (!Array.isArray(options.sw) || !Array.isArray(options.ne) ||
        options.sw.length !== 2 || options.ne.length !== 2) {
        throw new Error('视野范围格式错误：请检查西南角和东北角坐标');
      }

      // 验证坐标值的有效性
      if (options.sw[0] >= options.ne[0] || options.sw[1] >= options.ne[1]) {
        throw new Error('视野范围坐标错误：西南角坐标应小于东北角坐标');
      }

      // 验证经纬度范围
      if (options.sw[0] < -180 || options.sw[0] > 180 || options.ne[0] < -180 || options.ne[0] > 180) {
        throw new Error('经度必须在 -180 到 180 之间');
      }
      if (options.sw[1] < -90 || options.sw[1] > 90 || options.ne[1] < -90 || options.ne[1] > 90) {
        throw new Error('纬度必须在 -90 到 90 之间');
      }

      // 处理padding参数
      if (options.padding !== undefined && options.padding !== null) {
        if (Array.isArray(options.padding)) {
          // 四个数值数组 [top, right, bottom, left]
          if (options.padding.length !== 4) {
            throw new Error('padding数组格式错误：应为4个数值 [top, right, bottom, left]');
          }
        } else if (typeof options.padding === 'number') {
        } else {
          throw new Error('padding参数格式错误：应为数值或四个数值数组');
        }
      }


      // 调用子类的具体实现方法
      return this._setBounds(options);
    } catch (error) {
      console.error('设置视野范围失败:', error);
      throw error;
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
      // 验证边界坐标
      if (!bounds || !bounds.sw || !bounds.ne) {
        throw new Error('边界参数格式错误：请提供 sw 和 ne 坐标');
      }

      if (!Array.isArray(bounds.sw) || !Array.isArray(bounds.ne) ||
        bounds.sw.length !== 2 || bounds.ne.length !== 2) {
        throw new Error('边界坐标格式错误：请检查西南角和东北角坐标');
      }

      // 验证坐标值的有效性
      if (bounds.sw[0] >= bounds.ne[0] || bounds.sw[1] >= bounds.ne[1]) {
        throw new Error('边界坐标错误：西南角坐标应小于东北角坐标');
      }

      // 验证经纬度范围
      if (bounds.sw[0] < -180 || bounds.sw[0] > 180 || bounds.ne[0] < -180 || bounds.ne[0] > 180) {
        throw new Error('经度必须在 -180 到 180 之间');
      }
      if (bounds.sw[1] < -90 || bounds.sw[1] > 90 || bounds.ne[1] < -90 || bounds.ne[1] > 90) {
        throw new Error('纬度必须在 -90 到 90 之间');
      }

      // 调用子类的具体实现方法
      return this._limitBounds(bounds);
    } catch (error) {
      console.error('限制地图视野范围失败:', error);
      return false;
    }
  }

  /**
   * 子类需要实现的具体设置视野范围方法
   * @param {object} options - 移动选项
   * @returns {boolean} 设置是否成功
   * @private
   */
  _setBounds(options) {
    throw new Error('_setBounds 方法必须由子类实现');
  }

  /**
   * 子类需要实现的具体限制视野范围方法
   * @param {object} bounds - 边界范围
   * @returns {boolean} 设置是否成功
   * @private
   */
  _limitBounds(bounds) {
    throw new Error('_limitBounds 方法必须由子类实现');
  }

  /**
   * 将地图视野调整到包含指定边界范围的最佳视图
   * @param {object} options - 边界选项
   * @param {Array} options.sw - 西南角坐标 [lng, lat]
   * @param {Array} options.ne - 东北角坐标 [lng, lat]
   * @param {object|number} options.padding - 边界内边距，可以是数字或数组 [top, right, bottom, left]
   * @param {number} options.maxZoom - 最大缩放级别限制
   * @param {number} options.duration - 动画时长 (毫秒)
   * @param {boolean} options.animate - 是否使用动画
   * @returns {boolean} 操作是否成功
   */
  fitBounds(options) {
    if (!this.map) {
      console.warn('地图尚未初始化，无法执行 fitBounds 操作')
      return false
    }

    try {
      // 参数验证
      if (!options || !options.sw || !options.ne) {
        throw new Error('必须提供 sw 和 ne 参数')
      }

      let validSw = options.sw
      let validNe = options.ne

      // 处理字符串格式的坐标
      if (typeof options.sw === 'string') {
        try {
          validSw = JSON.parse(options.sw.replace(/'/g, '"'))
        } catch (error) {
          throw new Error('sw坐标字符串格式错误，请使用 [经度, 纬度] 格式')
        }
      }

      if (typeof options.ne === 'string') {
        try {
          validNe = JSON.parse(options.ne.replace(/'/g, '"'))
        } catch (error) {
          throw new Error('ne坐标字符串格式错误，请使用 [经度, 纬度] 格式')
        }
      }

      // 验证坐标格式
      if (!Array.isArray(validSw) || validSw.length !== 2) {
        throw new Error('sw坐标必须是包含两个元素的数组 [经度, 纬度]')
      }

      if (!Array.isArray(validNe) || validNe.length !== 2) {
        throw new Error('ne坐标必须是包含两个元素的数组 [经度, 纬度]')
      }

      // 验证坐标值
      const [swLng, swLat] = validSw
      const [neLng, neLat] = validNe

      // 检查经纬度范围
      if (swLng < -180 || swLng > 180 || neLng < -180 || neLng > 180) {
        throw new Error('经度必须在 -180 到 180 之间')
      }
      if (swLat < -90 || swLat > 90 || neLat < -90 || neLat > 90) {
        throw new Error('纬度必须在 -90 到 90 之间')
      }

      // 验证坐标逻辑关系
      if (swLng >= neLng || swLat >= neLat) {
        throw new Error('sw坐标应小于ne坐标：sw[经度] < ne[经度] 且 sw[纬度] < ne[纬度]')
      }

      // 验证padding参数
      let validPadding = options.padding
      if (validPadding !== undefined && validPadding !== null) {
        if (typeof validPadding === 'number') {
          if (validPadding < 0) {
            throw new Error('padding值不能为负数')
          }
        } else if (Array.isArray(validPadding)) {
          if (validPadding.length !== 4) {
            throw new Error('padding数组必须包含4个元素 [top, right, bottom, left]')
          }

          const [top, right, bottom, left] = validPadding
          if (typeof top !== 'number' || top < 0 ||
            typeof right !== 'number' || right < 0 ||
            typeof bottom !== 'number' || bottom < 0 ||
            typeof left !== 'number' || left < 0) {
            throw new Error('padding数组中的所有值必须是大于等于0的数字')
          }
        } else {
          throw new Error('padding参数必须是数字或数组格式 [top, right, bottom, left]')
        }
      }

      // 验证动画时长
      let validDuration = options.duration
      if (validDuration !== undefined && validDuration !== null) {
        if (typeof validDuration === 'string') {
          validDuration = parseInt(validDuration)
        }

        if (typeof validDuration !== 'number' || isNaN(validDuration) || validDuration < 0) {
          throw new Error('duration必须是大于等于0的数字')
        }
      }

      // 调用子类的具体实现
      return this._fitBounds({
        sw: validSw,
        ne: validNe,
        padding: validPadding,
        duration: validDuration,
      })

    } catch (error) {
      console.error('fitBounds 操作失败:', error)
      throw error
    }
  }

  /**
   * 子类需要实现的具体 fitBounds 方法
   * @param {object} options - 验证后的边界选项
   * @param {Array} options.sw - 验证后的西南角坐标 [lng, lat]
   * @param {Array} options.ne - 验证后的东北角坐标 [lng, lat]
   * @param {object|number} options.padding - 验证后的边界内边距
   * @param {number} options.duration - 验证后的动画时长
   * @returns {boolean} 操作是否成功
   * @private
   */
  _fitBounds(options) {
    throw new Error('_fitBounds 方法必须由子类实现')
  }

  // ~~~~~~~~~ 以上为地图方法 ~~~~~~~~~~~~~

  /**
   * 批量添加线段
   * @param {object} options - 线段配置对象 {map, id, geometries, styles}
   * @returns {object} 线段对象
   */
  addLines(options) {
    throw new Error('addLines 方法必须由子类实现')
  }

  // ~~~~~~~~~ 下面方法没验证过没屡过 ~~~~~~~~~~~~~



  /**
   * 添加DOM标记点
   * @param {object} options - 标记点配置
   * @returns {object} 标记点实例
   */
  addDomMarker(options) {
    throw new Error('addDomMarker 方法必须由子类实现')
  }

  /**
   * 添加自定义气泡
   * @param {object} options - 气泡配置
   * @returns {object} 气泡实例
   */
  addPopup(options) {
    throw new Error('addPopup 方法必须由子类实现')
  }

  /**
   * 添加线条
   * @param {object} options - 线条配置
   * @returns {object} 线条实例
   */
  addLine(options) {
    throw new Error('addLine 方法必须由子类实现')
  }

  /**
   * 添加聚合功能
   * @param {object} options - 聚合配置
   * @returns {object} 聚合实例
   */
  addCluster(options) {
    throw new Error('addCluster 方法必须由子类实现')
  }

  /**
   * 移除标记点
   * @param {string} id - 标记点ID
   */
  removeMarker(id) {
    throw new Error('removeMarker 方法必须由子类实现')
  }

  /**
   * 移除气泡
   * @param {string} id - 气泡ID
   */
  removePopup(id) {
    throw new Error('removePopup 方法必须由子类实现')
  }

  /**
   * 移除线条
   * @param {string} id - 线条ID
   */
  removeLine(id) {
    throw new Error('removeLine 方法必须由子类实现')
  }

  /**
   * 移除聚合
   * @param {string} id - 聚合ID
   */
  removeCluster(id) {
    throw new Error('removeCluster 方法必须由子类实现')
  }

  /**
   * 更新标记点
   * @param {string} id - 标记点ID
   * @param {object} options - 更新配置
   */
  updateMarker(id, options) {
    throw new Error('updateMarker 方法必须由子类实现')
  }

  /**
   * 更新线条
   * @param {string} id - 线条ID
   * @param {object} options - 更新配置
   */
  updateLine(id, options) {
    throw new Error('updateLine 方法必须由子类实现')
  }

  /**
   * 获取所有标记点
   * @returns {Array} 标记点列表
   */
  getMarkers() {
    throw new Error('getMarkers 方法必须由子类实现')
  }

  /**
   * 获取所有线条
   * @returns {Array} 线条列表
   */
  getLines() {
    throw new Error('getLines 方法必须由子类实现')
  }

  /**
   * 获取所有聚合
   * @returns {Array} 聚合列表
   */
  getClusters() {
    throw new Error('getClusters 方法必须由子类实现')
  }

  /**
   * 添加图层
   * @param {string} id - 图层ID
   * @param {object} layer - 图层实例
   */
  addLayer(id, layer) {
    this.layers.set(id, layer)
  }

  /**
   * 移除图层
   * @param {string} id - 图层ID
   */
  removeLayer(id) {
    if (this.layers.has(id)) {
      const layer = this.layers.get(id)
      if (layer && layer.remove) {
        layer.remove()
      }
      this.layers.delete(id)
    }
  }

  /**
   * 清除所有图层
   */
  clearLayers() {
    this.layers.forEach((layer, id) => {
      this.removeLayer(id)
    })
  }


} 