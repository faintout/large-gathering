import { mineMapConfig } from '../../../config/defaultConfig.js'
import { buildMineMapConfig } from '../../../config/minemapStyleConfig.js'

/**
 * 地图状态管理器
 * 负责管理地图的状态相关方法，包括中心点、缩放、平移、旋转等
 * 兼容HTMap接口
 */
export default class StateManager {
  constructor(mapInstance) {
    this.map = mapInstance.map
    this.options = mapInstance.options || {}
    this.container = mapInstance.container || null
  }

 /**
    * 设置地图中心点和缩放级别
    * @param {Array} center - 中心点坐标 [lng, lat]
    * @param {number} zoom - 缩放级别
    */
   setView(center, zoom) {
     if (!this.map) return
 
     if (zoom !== undefined) {
       this.map.flyTo({
         center,
         zoom
       })
     } else {
       this.map.flyTo({ center })
     }
   }
 
   /**
    * 设置地图中心点
    * @param {Array} center - 中心点坐标 [lng, lat]
    * @param {object} options - 动画选项  废弃了不要了  todo 待修改
    */
   setCenter(center, options = {}) {
     if (!this.map) return
 
     if (options.animate !== false) {
       // 使用动画方式设置中心点
       this.map.flyTo({
         center,
         duration: options.duration || 1000,
         ...options
       })
     } else {
       // 直接设置中心点
       this.map.setCenter(center)
     }
   }
 
   /**
    * 设置地图缩放级别
    * @param {number} zoom - 缩放级别
    * @param {object} options - 动画选项     废弃了不要了  todo 待修改
    */
   setZoom(zoom, options = {}) {
 
     if (!this.map) return
     const maxZoom = this.map.getMaxZoom()
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
   * 设置地图倾斜角度 (pitch)
   * @param {number} pitch - 倾斜角度 (0-60度)
   * @param {object} options - 动画选项
   */
  setPitch(pitch, options = {}) {
    if (!this.map) {
      console.warn('StateManager.setPitch: 地图实例未初始化')
      return false
    }

    try {
      // 使用配置中的视图模式而不是通过当前pitch判断
      const configuredViewMode = this.options.viewMode || '3D'
      
      // 如果是2D模式且pitch大于0，则限制为0
      if (configuredViewMode === '2D' && pitch > 0) {
        console.warn('StateManager.setPitch: 当前为2D地图模式，无法设置倾斜角度')
        pitch = 0
      }

      const validPitch = Math.max(0, Math.min(mineMapConfig.pitchRange[1], pitch))
      
      
      if (this.map.setPitch) {
        if (options.animate !== false) {
          this.map.flyTo({
            pitch: validPitch,
            duration: options.duration || 1000,
            ...options
          })
        } else {
          this.map.setPitch(validPitch)
        }
      } else {
        // 如果没有直接的setPitch方法，使用flyTo
        this.map.flyTo({
          pitch: validPitch,
          ...options
        })
      }
      
      return true
    } catch (error) {
      console.error('StateManager.setPitch: 设置倾斜角度失败:', error)
      return false
    }
  }
 
   /**
    * 设置地图旋转角度 (bearing)
    * @param {number} bearing - 旋转角度 (0-360度)
    * @param {object} options - 动画选项
    */
   setBearing(bearing, options = {}) {
     if (!this.map) return
 
     const validBearing = ((bearing % 360) + 360) % 360
     
     if (this.map.setBearing) {
       if (options.animate !== false) {
         this.map.flyTo({
           bearing: validBearing,
           duration: options.duration || 1000,
           ...options
         })
       } else {
         this.map.setBearing(validBearing)
       }
     } else {
       // 如果没有直接的setBearing方法，使用flyTo
       this.map.flyTo({
         bearing: validBearing,
         ...options
       })
     }
   }
 
  /**
   * 设置视图模式 (2D/3D)
   * @param {string} mode - 视图模式 ('2D' 或 '3D')
   * @param {object} options - 切换选项
   */
  setViewMode(mode, options = {}) {
    if (!this.map) {
      console.warn('StateManager.setViewMode: 地图实例未初始化')
      return false
    }

    try {
      if (mode === '3D') {
        // 3D模式：设置倾斜角度和最大pitch限制
        if (this.map.setMaxPitch) {
          this.map.setMaxPitch(mineMapConfig.pitchRange[1])
        }
        const pitch = options.pitch || 45
        this.setPitch(pitch, options)
      } else if (mode === '2D') {
        // 2D模式：重置倾斜角度并禁用pitch功能
        if (this.map.setMaxPitch) {
          this.map.setMaxPitch(0)
        }
        this.setPitch(0, options)
      } else {
        console.warn('StateManager.setViewMode: 无效的视图模式:', mode)
        return false
      }
      
      // 更新内部配置
      this.options.viewMode = mode
      return true
    } catch (error) {
      console.error('StateManager.setViewMode: 视图模式切换失败:', error)
      return false
    }
  }
 
  /**
   * 设置样式类型
   * @param {string} styleType - 样式类型
   * @param {object} options - 切换选项
   */
  setStyleType(styleType, options = {}) {
    if (!this.map) {
      console.warn('StateManager.setStyleType: 地图实例未初始化')
      return false
    }

    try {
      // 四维图新支持多种样式类型
      const styleMap = {
        'default': 'black',
        'black': 'black',
        'white': 'white',
        'blue': 'blue',
        'green': 'green',
        'red': 'red',
        'satellite': 'satellite',
        'hybrid': 'hybrid'
      }

      const mapStyle = styleMap[styleType] || styleType
      
      // 检查 minemap 全局变量是否可用
      if (typeof minemap === 'undefined') {
        console.warn('StateManager.setStyleType: minemap 全局变量未定义，无法切换样式')
        return false
      }
      
      // 重新构建样式配置
      let environment = import.meta.env.VITE_ENV || 'development'
      const newMapStyle = buildMineMapConfig(mapStyle)
      
      // 设置新的样式
      for (let key in newMapStyle) {
        minemap[key] = newMapStyle[key]
      }
      
      // 应用新样式到地图
      if (this.map.setStyle && newMapStyle.mapStyle) {
        this.map.setStyle(newMapStyle.mapStyle)
        // 更新内部配置
        this.options.styleType = styleType
        return true
      } else {
        console.warn('StateManager.setStyleType: 地图不支持样式切换或样式配置无效')
        return false
      }
    } catch (error) {
      console.error('StateManager.setStyleType: 样式切换失败:', error)
      return false
    }
  }
 
   /**
    * 获取地图倾斜角度 (pitch)
    * @returns {number} 倾斜角度
    */
   getPitch() {
     if (!this.map) return 0
     
     if (this.map.getPitch) {
       return this.map.getPitch()
     }
     
     return this.options.pitch || 0
   }
 
   /**
    * 获取地图旋转角度 (bearing)
    * @returns {number} 旋转角度
    */
   getBearing() {
     if (!this.map) return 0
     
     if (this.map.getBearing) {
       return this.map.getBearing()
     }
     
     return this.options.bearing || 0
   }
 
  /**
   * 获取当前视图模式
   * @returns {string} 视图模式 ('2D' 或 '3D')
   */
  getViewMode() {
    // 优先使用配置中的视图模式
    if (this.options.viewMode) {
      return this.options.viewMode
    }
    
    // 如果没有配置，则根据当前pitch和最大pitch限制来判断
    const currentPitch = this.getPitch()
    const maxPitch = this.getMaxPitch()
    
    // 如果最大pitch为0，说明是2D模式
    if (maxPitch === 0) {
      return '2D'
    }
    
    // 如果当前pitch大于0，说明是3D模式
    return currentPitch > 0 ? '3D' : '2D'
  }
 
  /**
   * 获取当前样式类型
   * @returns {string} 样式类型
   */
  getStyleType() {
    if (!this.map) return this.options.styleType || 'default'
    
    try {
      // 从当前样式配置中获取样式类型
      if (typeof minemap !== 'undefined' && minemap.mapStyle) {
        // 这里可以根据实际的样式配置来判断样式类型
        // 由于四维图新的样式配置比较复杂，暂时返回配置中的样式类型
        return this.options.styleType || 'default'
      }
      
      return this.options.styleType || 'default'
    } catch (error) {
      console.error('StateManager.getStyleType: 获取样式类型失败:', error)
      return this.options.styleType || 'default'
    }
  }
 
   /**
    * 获取地图中心点
    * @returns {Array} 中心点坐标 [lng, lat]
    */
   getCenter() {
     if (!this.map) return [0, 0]
     
     const center = this.map.getCenter()
     return [center.lng, center.lat]
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
   * 获取地图最大缩放级别
   * @returns {number} 最大缩放级别
   */
  getMaxZoom() {
    if (!this.map) return mineMapConfig.maxZoom || 20
    return this.map.getMaxZoom ? this.map.getMaxZoom() : (mineMapConfig.maxZoom || 20)
  }

  /**
   * 获取地图最小缩放级别
   * @returns {number} 最小缩放级别
   */
  getMinZoom() {
    if (!this.map) return mineMapConfig.minZoom || 3
    return this.map.getMinZoom ? this.map.getMinZoom() : (mineMapConfig.minZoom || 3)
  }

  /**
   * 获取MineMap支持的最大倾斜角度
   * 根据当前视图模式返回不同的值
   * @returns {number} 最大倾斜角度
   */
  getMaxPitch() {
    const currentViewMode = this.getViewMode()
    return currentViewMode === '2D' ? 0 : mineMapConfig.pitchRange[1]
  }
   /**
   * 设置地图视野范围 - 兼容HTMap接口
   * @param {object} options - 视野范围选项
   * @param {Array} options.sw - 西南角坐标 [lng, lat]
   * @param {Array} options.ne - 东北角坐标 [lng, lat]
   * @param {number|Array} options.padding - 边距
   * @param {number} options.duration - 动画时长
   * @returns {boolean} 设置是否成功
   */
  setBounds(options) {
    if (!this.map) return false

    try {
      // 验证参数格式
      if (!options || !options.sw || !options.ne) {
        console.error('StateManager.setBounds: 缺少必要的边界参数', options)
        return false
      }

      // 构建边界对象
      const bounds = {
        sw: options.sw,
        ne: options.ne
      }

      // 参数归一化
      const { bound, normalizedOptions } = this._normalizeBoundsOptions(bounds, options)
      
      
      if (this.map.fitBounds) {
        this.map.fitBounds(bound, normalizedOptions)
        return true
      } else {
        console.warn('StateManager.setBounds: 地图不支持 fitBounds 方法')
        return false
      }
    } catch (error) {
      console.error('StateManager.setBounds: 设置视野范围失败:', error)
      return false
    }
  }

  /**
   * 归一化边界选项，参照 TencentMap 的实现
   * @param {object} bounds - 边界对象
   * @param {object} options - 选项对象
   * @returns {object} 归一化后的选项
   * @private
   */
  _normalizeBoundsOptions(bounds, options) {
    const normalizedOptions = {}
    
    // 处理padding参数
    if (options.padding !== undefined) {
      if (typeof options.padding === 'number' || typeof options.padding === 'string') {
        // 单个数值，转换为四个方向的对象
        normalizedOptions.padding = {
          top: Number(options.padding),
          right: Number(options.padding),
          bottom: Number(options.padding),
          left: Number(options.padding)
        }
      } else if (Array.isArray(options.padding)) {
        if (options.padding.length === 4) {
          // 四个数值的数组 [top, right, bottom, left]
          normalizedOptions.padding = {
            top: Number(options.padding[0]) || 0,
            right: Number(options.padding[1]) || 0,
            bottom: Number(options.padding[2]) || 0,
            left: Number(options.padding[3]) || 0
          }
        } else if (options.padding.length === 2) {
          // 两个数值的数组 [vertical, horizontal]
          normalizedOptions.padding = {
            top: Number(options.padding[0]) || 0,
            right: Number(options.padding[1]) || 0,
            bottom: Number(options.padding[0]) || 0,
            left: Number(options.padding[1]) || 0
          }
        } else {
          // 其他情况，使用默认值
          normalizedOptions.padding = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        }
      } else if (typeof options.padding === 'object' && options.padding !== null) {
        // 对象格式 {top, right, bottom, left}
        normalizedOptions.padding = {
          top: Number(options.padding.top) || 0,
          right: Number(options.padding.right) || 0,
          bottom: Number(options.padding.bottom) || 0,
          left: Number(options.padding.left) || 0
        }
      } else {
        // 其他情况，使用默认值
        normalizedOptions.padding = {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      }
    } else {
      // 没有padding参数，使用默认值
      normalizedOptions.padding = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      }
    }

    // 处理其他参数
    normalizedOptions.duration = Number(options.duration) || 1000
    normalizedOptions.minZoom = Number(options.minZoom) || 3
    normalizedOptions.maxZoom = Number(options.maxZoom) || 20
    
    // 处理边界坐标
    let bound = null
    if (bounds.sw && bounds.ne) {
      // 确保坐标格式正确
      const sw = Array.isArray(bounds.sw) ? bounds.sw : [bounds.sw.lng || bounds.sw.lon, bounds.sw.lat]
      const ne = Array.isArray(bounds.ne) ? bounds.ne : [bounds.ne.lng || bounds.ne.lon, bounds.ne.lat]
      
      // 验证坐标有效性
      if (sw && ne && sw.length === 2 && ne.length === 2) {
        // 构建边界数组 [west, south, east, north]
        bound = [
          sw[0], // west
          sw[1], // south
          ne[0], // east
          ne[1]  // north
        ]
      }
    }

    return { bound, normalizedOptions }
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
        // 确保坐标格式正确
        const sw = Array.isArray(bounds.sw) ? bounds.sw : [bounds.sw.lng || bounds.sw.lon, bounds.sw.lat]
        const ne = Array.isArray(bounds.ne) ? bounds.ne : [bounds.ne.lng || bounds.ne.lon, bounds.ne.lat]
        
        // 验证坐标有效性
        if (!sw || !ne || sw.length !== 2 || ne.length !== 2) {
          console.error('StateManager.limitBounds: 无效的坐标格式', { sw, ne })
          return false
        }
        
        // 构建边界数组 [west, south, east, north]
        const bbox = [
          sw[0], // west
          sw[1], // south
          ne[0], // east
          ne[1]  // north
        ]


        // 监听地图移动事件，限制视野范围
        if (this.map.setMaxBounds) {
          this.map.setMaxBounds(bbox)
          return true
        } else {
          console.warn('StateManager.limitBounds: 地图不支持 setMaxBounds 方法')
          return false
        }
      }
      return false
    } catch (error) {
      console.error('StateManager.limitBounds: 限制视野范围失败:', error)
      return false
    }
  }

  /**
   * 获取地图当前视野范围
   * @returns {object|false} 视野范围对象 {sw: [lng, lat], ne: [lng, lat]} 或 false
   */
  getBounds() { 
    if (!this.map) return false
    
    try {
      const bounds = this.map.getBounds()
      if (bounds && bounds._sw && bounds._ne) {
        return {
          ne: [bounds._ne.lng, bounds._ne.lat],
          sw: [bounds._sw.lng, bounds._sw.lat],  
        }
      } else if (bounds && bounds.getSouthWest && bounds.getNorthEast) {
        // 兼容不同的 bounds 对象格式
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()
        return {
          ne: [ne.lng, ne.lat],
          sw: [sw.lng, sw.lat],
        }
      }
      return false
    } catch (error) {
      console.error('StateManager.getBounds: 获取视野范围失败:', error)
      return false
    }
  }
  /**
   * 适应地图视野范围 - 兼容HTMap接口
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
    if (!this.map) return false
    
    try {
      // 验证参数格式
      if (!options || !options.sw || !options.ne) {
        console.error('StateManager.fitBounds: 缺少必要的边界参数', options)
        return false
      }

      // 构建边界对象
      const bounds = {
        sw: options.sw,
        ne: options.ne
      }

      // 参数归一化
      const { bound, normalizedOptions } = this._normalizeBoundsOptions(bounds, options)
      
      
      if (this.map.fitBounds) {
        this.map.fitBounds(bound, normalizedOptions)
        return true
      } else {
        console.warn('StateManager.fitBounds: 地图不支持 fitBounds 方法')
        return false
      }
    } catch (error) {
      console.error('StateManager.fitBounds: 适应视野范围失败:', error)
      return false
    }
  }
 
  /**
   * 设置地图扩展视野
   * @param {object} extent - 扩展视野 {southwest: [lng, lat], northeast: [lng, lat]}
   * @param {object} options - 动画选项
   * @returns {boolean} 操作是否成功
   */
  setExtent(extent, options = {}) {
    if (!extent) return false
    
    // 转换格式：southwest/northeast -> sw/ne
    const bounds = {
      sw: extent.southwest || extent.sw,
      ne: extent.northeast || extent.ne
    }
    
    return this.setBounds(bounds, options)
  }

  /**
   * 获取地图扩展视野
   * @returns {object|false} 扩展视野信息 {southwest: [lng, lat], northeast: [lng, lat]} 或 false
   */
  getExtent() {
    const bounds = this.getBounds()
    if (!bounds) return false
    
    return {
      southwest: bounds.sw,
      northeast: bounds.ne
    }
  }

  /**
   * 设置地图最大视野范围
   * @param {object} bounds - 视野范围 {sw: [lng, lat], ne: [lng, lat]}
   * @returns {boolean} 操作是否成功
   */
  setMaxBounds(bounds) {
    return this.limitBounds(bounds)
  }
  // ==================== 地图飞行方法 ====================

  /**
   * 飞行到指定位置
   * @param {object} options - 参数
   * @returns {Promise} 飞行完成后的Promise
   */
  flyTo(options) {
    if (!this.map) return Promise.reject(new Error('地图未初始化'))
    return new Promise((resolve, reject) => {
      try {
        const flyOptions = {
          center: options.center,
          zoom: options.zoom,
          duration: options.duration || 2000,
          essential: options.essential !== false,
          bearing: options.bearing,
          pitch: options.pitch,
          ...options
        }

        // 监听飞行结束事件
        const onMoveEnd = () => {
          this.map.off('moveend', onMoveEnd)
          resolve({
            center: this.map.getCenter(),
            zoom: this.map.getZoom(),
            bearing: this.map.getBearing(),
            pitch: this.map.getPitch()
          })
        }

        this.map.on('moveend', onMoveEnd)
        this.map.flyTo(flyOptions)
      } catch (error) {
        reject(error)
      }
    })
  }
  /**
   * 平滑移动到指定位置，支持padding转换为经纬度偏移
   * @param {object} options - 移动选项
   * @param {Array|object} options.center - 中心点坐标 [lng, lat] 或 {lng, lat}（必填）
   * @param {number} [options.zoom=15] - 缩放级别（可选，默认15）
   * @param {number} [options.bearing] - 旋转角度（可选）
   * @param {number} [options.pitch] - 倾斜角度（可选）
   * @param {number|Array} [options.padding=[0,0,0,0]] - 边距（像素），将转换为经纬度偏移（可选，默认[0,0,0,0]）
   * @param {number} [options.duration=1000] - 动画时长（可选，默认1000ms）
   * @returns {Promise} 移动完成后的Promise
   * @private
   */
  easeTo(options = {}) {
    if (!this.map) return Promise.reject(new Error('地图未初始化'))

    // 验证必填参数
    if (!options.center) {
      return Promise.reject(new Error('easeTo: center 参数是必填的'))
    }

    return new Promise((resolve, reject) => {
      try {
        // 设置默认值
        const easeOptions = {
          zoom: 15, // 默认缩放级别
          padding: [0, 0, 0, 0], // 默认padding
          duration: 1000, // 默认动画时长
          bearing: 0, // 默认旋转角度
          pitch: 0, // 默认倾斜角度
          ...options // 用户传入的参数覆盖默认值
        }
        
        // 处理center参数（必填）
        easeOptions.center = this._transformCoordinates(options.center, 'easeTo')
        
        // 处理padding参数，将像素偏移转换为经纬度偏移（有默认值，但如果不为[0,0,0,0]才处理）
        const padding = easeOptions.padding
        const hasPadding = Array.isArray(padding) 
          ? padding.some(v => v !== 0) 
          : padding !== 0 && padding !== undefined && padding !== null
        
        if (hasPadding) {
          // 使用目标center作为基准点
          const adjustedCenter = this._convertPaddingToLngLatOffset(
            easeOptions.center, 
            padding,
            easeOptions.zoom
          )
          easeOptions.center = adjustedCenter
        }
        // 移除padding参数，因为已经转换为center偏移或不需要处理
        delete easeOptions.padding
        
        // 监听动画完成事件
        const onMoveEnd = () => {
          this.map.off('moveend', onMoveEnd)
          resolve({
            center: this.getCenter(),
            zoom: this.getZoom(),
            bearing: this.getBearing(),
            pitch: this.getPitch()
          })
        }
        
        this.map.on('moveend', onMoveEnd)
        
        // 执行平滑移动
        this.map.easeTo(easeOptions)
        
      } catch (error) {
        console.error('MineMap._easeTo: 平滑移动失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 将padding（像素）转换为经纬度偏移
   * @param {Array} center - 当前中心点 [lng, lat]
   * @param {number|Array} padding - 边距（像素）
   * @param {number} zoom - 当前缩放级别
   * @returns {Array} 调整后的中心点坐标 [lng, lat]
   * @private
   */
  _convertPaddingToLngLatOffset(center, padding, zoom) {
    if (!center || !padding) return center

    try {
      const [lng, lat] = center
      
      // 处理padding参数
      let paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0
      
      if (Array.isArray(padding)) {
        // 四个数值数组 [top, right, bottom, left]
        if (padding.length === 4) {
          [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding
        } else if (padding.length === 2) {
          // 两个数值 [vertical, horizontal]
          [paddingTop, paddingRight] = padding
          paddingBottom = paddingTop
          paddingLeft = paddingRight
        }
      } else if (typeof padding === 'number') {
        // 单个数值，应用到所有边
        paddingTop = paddingRight = paddingBottom = paddingLeft = padding
      }
      
      // 使用更简单但更准确的转换方法
      // 基于当前地图的视野范围来计算像素到经纬度的转换
      const container = this.container
      if (!container) {
        console.warn('MineMap._convertPaddingToLngLatOffset: 无法获取容器，使用默认转换')
        // 使用简化的转换公式
        const scale = Math.pow(2, zoom) * 0.0001 // 经验值
        const lngOffset = (paddingLeft - paddingRight) * scale
        const latOffset = (paddingTop - paddingBottom) * scale
        return [lng + lngOffset, lat + latOffset]
      }
      
      // 获取容器尺寸
      const containerWidth = container.clientWidth || container.offsetWidth || 800
      const containerHeight = container.clientHeight || container.offsetHeight || 600
      
      // 获取当前视野范围
      const bounds = this.map.getBounds()
      const lngRange = bounds.getEast() - bounds.getWest()
      const latRange = bounds.getNorth() - bounds.getSouth()
      
      // 计算每像素对应的经纬度
      const lngPerPixel = lngRange / containerWidth
      const latPerPixel = latRange / containerHeight
      
      // 计算偏移量（像素转经纬度）
      // 注意：这里的逻辑是让地图中心向padding较小的方向偏移
      // 例如：如果左边padding大，右边padding小，则中心点向右偏移
      const lngOffset = (paddingLeft - paddingRight) * lngPerPixel
      const latOffset = (paddingTop - paddingBottom) * latPerPixel
      
      // 如果所有方向的padding都相同，则不需要偏移
      // 但我们可以提供一个选项来测试偏移效果
      if (lngOffset === 0 && latOffset === 0) {
        // 为了测试效果，可以添加一个小的测试偏移
        // 取消注释下面的代码来测试偏移效果
        // const testOffset = 0.001 // 测试偏移量
        // return [lng + testOffset, lat + testOffset]
      }
      
      // 应用偏移
      const adjustedLng = lng + lngOffset
      const adjustedLat = lat + latOffset
      
      
      return [adjustedLng, adjustedLat]
      
    } catch (error) {
      console.error('MineMap._convertPaddingToLngLatOffset: 转换失败:', error)
      return center
    }
  }

  /**
   * 获取指定缩放级别和纬度下的像素到经纬度转换比例
   * @param {number} zoom - 缩放级别
   * @param {number} lat - 纬度
   * @returns {object} 转换比例 {lng: number, lat: number}
   * @private
   */
  _getPixelsPerDegree(zoom, lat) {
    try {
      // 获取地图容器的实际尺寸
      const container = this.container
      if (!container) {
        console.warn('MineMap._getPixelsPerDegree: 无法获取容器尺寸，使用默认值')
        return { lng: 100, lat: 100 }
      }
      
      const containerWidth = container.clientWidth || container.offsetWidth || 800
      const containerHeight = container.clientHeight || container.offsetHeight || 600
      
      // 基于容器尺寸和当前视野计算像素到经纬度的转换比例
      const currentCenter = this.getCenter()
      const currentZoom = this.getZoom()
      
      // 计算当前视野的经纬度范围
      const bounds = this.map.getBounds()
      const lngRange = bounds.getEast() - bounds.getWest()
      const latRange = bounds.getNorth() - bounds.getSouth()
      
      // 计算每像素对应的经纬度
      const lngPixelsPerDegree = containerWidth / lngRange
      const latPixelsPerDegree = containerHeight / latRange
      
      
      return {
        lng: lngPixelsPerDegree,
        lat: latPixelsPerDegree
      }
    } catch (error) {
      console.error('MineMap._getPixelsPerDegree: 计算失败:', error)
      // 返回基于缩放级别的默认值
      const basePixelsPerDegree = Math.pow(2, zoom) * 2
      return {
        lng: basePixelsPerDegree,
        lat: basePixelsPerDegree
      }
    }
  }

  /**
   * 转换坐标格式
   * @param {Array|object} coordinates - 坐标
   * @param {string} context - 调用上下文
   * @returns {Array} 标准坐标数组 [lng, lat]
   * @private
   */
  _transformCoordinates(coordinates, context = '') {
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      return coordinates
    }
    if (typeof coordinates === 'object' && coordinates !== null && 'lng' in coordinates && 'lat' in coordinates) {
      return [coordinates.lng, coordinates.lat]
    }
    console.warn(`StateManager._transformCoordinates: 无效的坐标格式在 ${context}:`, coordinates)
    return [0, 0] // Default to [0,0] or throw an error
  }

  /**
   * 格式化移动事件数据
   * @param {object} evt - 事件对象
   * @returns {object} 格式化后的事件数据
   * @private
   */
  _formatMoveEvent(evt) {
    if (!this.map) return {}
    
    try {
      const center = this.getCenter()
      const zoom = this.getZoom()
      const bearing = this.getBearing()
      const pitch = this.getPitch()
      
      return {
        center,
        zoom,
        bearing,
        pitch,
        originalEvent: evt
      }
    } catch (error) {
      console.error('StateManager._formatMoveEvent: 格式化移动事件失败:', error)
      return { originalEvent: evt }
    }
  }

  /**
   * 格式化鼠标事件数据
   * @param {object} evt - 事件对象
   * @returns {object} 格式化后的事件数据
   * @private
   */
  _formatMouseEvent(evt) {
    if (!this.map) return {}
    
    try {
      const lngLat = evt.lngLat || evt.latlng
      const point = evt.point || evt.containerPoint
      
      return {
        lngLat: lngLat ? [lngLat.lng, lngLat.lat] : null,
        point: point ? [point.x, point.y] : null,
        originalEvent: evt
      }
    } catch (error) {
      console.error('StateManager._formatMouseEvent: 格式化鼠标事件失败:', error)
      return { originalEvent: evt }
    }
  }
  /**
   * 获取当前地图状态
   * @returns {object} 地图状态对象
   */
  getState() {
    return {
      center: this.getCenter(),
      zoom: this.getZoom(),
      pitch: this.getPitch(),
      bearing: this.getBearing(),
      viewMode: this.getViewMode(),
      maxZoom: this.getMaxZoom(),
      minZoom: this.getMinZoom()
    }
  }

  /**
   * 设置地图状态
   * @param {object} state - 地图状态对象
   * @param {object} options - 选项
   */
  setState(state, options = {}) {
    if (!this.map || !state) return

    try {
      const flyOptions = {
        duration: options.duration || 1000,
        essential: true,
        ...options
      }

      // 设置中心点
      if (state.center) {
        const centerArray = Array.isArray(state.center) ? state.center : [state.center.lng, state.center.lat]
        flyOptions.center = centerArray
      }

      // 设置缩放级别
      if (state.zoom !== undefined) {
        flyOptions.zoom = state.zoom
      }

      // 设置倾斜角度
      if (state.pitch !== undefined) {
        flyOptions.pitch = state.pitch
      }

      // 设置旋转角度
      if (state.bearing !== undefined) {
        flyOptions.bearing = state.bearing
      }

      // 执行飞行
      this.map.flyTo(flyOptions)
    } catch (error) {
      console.error('StateManager.setState: 设置状态失败:', error)
    }
  }

  /**
   * 重置地图状态到初始状态
   * @param {object} options - 选项
   */
  resetState(options = {}) {
    if (!this.map) return

    try {
      const defaultState = {
        center: [114.884094, 40.8119], // 默认中心点
        zoom: 15, // 默认缩放级别
        pitch: 0, // 默认倾斜角度
        bearing: 0 // 默认旋转角度
      }

      this.setState(defaultState, options)
    } catch (error) {
      console.error('StateManager.resetState: 重置状态失败:', error)
    }
  }

  /**
   * 检查地图是否已加载
   * @returns {boolean} 地图是否已加载
   */
  isLoaded() {
    return !!(this.map && this.map.loaded)
  }

  /**
   * 等待地图加载完成
   * @returns {Promise} 地图加载完成的Promise
   */
  waitForLoad() {
    return new Promise((resolve, reject) => {
      if (this.isLoaded()) {
        resolve(this.map)
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('地图加载超时'))
      }, 10000) // 10秒超时

      const checkLoad = () => {
        if (this.isLoaded()) {
          clearTimeout(timeout)
          resolve(this.map)
        } else {
          setTimeout(checkLoad, 100)
        }
      }

      checkLoad()
    })
  }

  /**
   * 获取地图容器的尺寸
   * @returns {object} 容器尺寸 {width, height}
   */
  getContainerSize() {
    if (!this.container) return { width: 800, height: 600 }
    
    return {
      width: this.container.clientWidth || this.container.offsetWidth || 800,
      height: this.container.clientHeight || this.container.offsetHeight || 600
    }
  }

  /**
   * 检查地图是否支持某个功能
   * @param {string} feature - 功能名称
   * @returns {boolean} 是否支持该功能
   */
  supportsFeature(feature) {
    if (!this.map) return false
    
    const featureMap = {
      'setMaxPitch': () => typeof this.map.setMaxPitch === 'function',
      'setMaxBounds': () => typeof this.map.setMaxBounds === 'function',
      'fitBounds': () => typeof this.map.fitBounds === 'function',
      'setStyle': () => typeof this.map.setStyle === 'function',
      'flyTo': () => typeof this.map.flyTo === 'function',
      'easeTo': () => typeof this.map.easeTo === 'function',
      'setPitch': () => typeof this.map.setPitch === 'function',
      'getPitch': () => typeof this.map.getPitch === 'function'
    }
    
    const checker = featureMap[feature]
    return checker ? checker() : false
  }

  /**
   * 调试倾斜角设置问题
   * @param {number} targetPitch - 目标倾斜角
   * @returns {object} 调试信息
   */
  debugPitchSetting(targetPitch) {
    const debugInfo = {
      mapExists: !!this.map,
      mapLoaded: this.isLoaded(),
      configuredViewMode: this.options.viewMode,
      currentViewMode: this.getViewMode(),
      currentPitch: this.getPitch(),
      maxPitch: this.getMaxPitch(),
      targetPitch: targetPitch,
      supportsSetPitch: this.supportsFeature('setPitch'),
      supportsGetPitch: this.supportsFeature('getPitch'),
      supportsFlyTo: this.supportsFeature('flyTo'),
      supportsSetMaxPitch: this.supportsFeature('setMaxPitch'),
      mineMapConfig: {
        pitchRange: mineMapConfig.pitchRange,
        maxZoom: mineMapConfig.maxZoom,
        minZoom: mineMapConfig.minZoom
      }
    }
    
    return debugInfo
  }
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
}
