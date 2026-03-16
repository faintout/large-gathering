
/**
 * Lines 类 - 用于管理一组线段
 * 提供线段的批量操作、样式设置、事件绑定等功能
 */
export default class Lines {
  constructor(options = {}) {
    // 数据校验
    if (!options.map) {
      throw new Error('Lines: map instance is required')
    }
    this.lines = null // 这个应该回来不是数组，应该是一个完整的对象
    this.map = options.map
    this.styles = this._validateAndNormalizeStyles(options.styles || [])
    this.geometries = this._validateAndNormalizeGeometries(options.geometries || [])
    this.id = options.id || `lines_group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 如果有初始数据，立即添加到地图
    if (this.geometries.length > 0) {
      this.addToMap()
    }
  }

  // 验证和标准化几何数据
  _validateAndNormalizeGeometries(geometries) {
    if (!Array.isArray(geometries)) {
      console.warn('Lines: geometries should be an array, converting to empty array')
      return []
    }
    
    return geometries.map((geometry, index) => {
      // 验证必需的属性 - 线段需要路径数组
      if (!geometry.paths || !Array.isArray(geometry.paths)) {
        console.warn(`Lines: Invalid paths for geometry at index ${index}, skipping`)
        return null
      }
      
      // 验证路径数组是否有效（至少需要2个点）
      if (geometry.paths.length < 2) {
        console.warn(`Lines: Line geometry at index ${index} must have at least 2 coordinates, skipping`)
        return null
      }
      
      // 验证每个坐标点
      const validatedPaths = geometry.paths.map((coord, coordIndex) => {
        if (!Array.isArray(coord) || coord.length < 2) {
          console.warn(`Lines: Invalid coordinate at index ${coordIndex} in geometry ${index}, skipping`)
          return null
        }
        
        const lng = Number(coord[0])
        const lat = Number(coord[1])
        
        if (isNaN(lng) || isNaN(lat)) {
          console.error(`Lines: Invalid coordinate values at index ${coordIndex} in geometry ${index}, lng: ${coord[0]}, lat: ${coord[1]}. Both values must be valid numbers.`)
          return null
        }
        
        return [lng, lat]
      }).filter(coord => coord !== null)
      
      if (validatedPaths.length < 2) {
        console.warn(`Lines: Geometry at index ${index} has insufficient valid coordinates, skipping`)
        return null
      }

      // 标准化几何数据
      return {
        id: geometry.id || `line_geometry_${this.id || 'temp'}_${index}`,
        properties: geometry.properties || {},
        paths: validatedPaths,
        styleId: geometry.styleId || (this.styles.length > 0 ? this.styles[0].id : null)
      }
    }).filter(geometry => geometry !== null) // 过滤掉无效的几何数据
  }

  // 验证和标准化样式数据
  _validateAndNormalizeStyles(styles) {
    if (!Array.isArray(styles)) {
      console.warn('Lines: styles should be an array, using default style')
      return [this._getDefaultStyle()]
    }
    
    if (styles.length === 0) {
      console.warn('Lines: styles array is empty, using default style')
      return [this._getDefaultStyle()]
    }
    
    // 验证每个样式对象
    return styles.map((style, index) => {
      if (!style || typeof style !== 'object') {
        console.warn(`Lines: Invalid style at index ${index}, using default style`)
        return this._getDefaultStyle()
      }

      // 标准化样式数据
      const normalizedStyle = {
        id: style.id || `line_style_${this.id || 'temp'}_${index}`,
        color: style.color || '#4b98fa',
        width: Number(style.width) || 6,
        borderColor: style.borderColor || null,
        borderWidth: Number(style.borderWidth) || 0,
        lineCap: style.lineCap || 'round', // 'butt', 'round', 'square'
        dashArray: style.dashArray || [0, 0], // 虚线样式，如 [10, 5]
        emitLight: style.emitLight || false, // 线条发光与否
        dirArrows: style.dirArrows || false, // 方向箭头
        dirAnimate: style.dirAnimate || null, // 动效方向表示
        isCurve: style.isCurve !== undefined ? Boolean(style.isCurve) : false, // 是否绘制曲线
      }

      // 数据逻辑判断：检查是否使用了虚线（非实线）
      const isDashArray = Array.isArray(normalizedStyle.dashArray) && 
        !((normalizedStyle.dashArray.length === 2 && normalizedStyle.dashArray[0] === 0 && normalizedStyle.dashArray[1] === 0))
      
      // 处理 dashArray 和 dirAnimate 的冲突：dirAnimate 优先级更高
      if (normalizedStyle.dirAnimate && isDashArray) {
        console.warn(`Lines: Style ${normalizedStyle.id} has both dirAnimate and dashArray, dirAnimate takes priority, dashArray will be set to solid line`)
        normalizedStyle.dashArray = [0, 0] // 设为实线
      }

      return normalizedStyle
    })
  }

  // 获取默认样式
  _getDefaultStyle() {
    return {
      id: `default_line_style_${this.id || 'temp'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      color: '#4b98fa',           // 默认颜色
      width: 6,                   // 默认线宽
      borderColor: null,          // 默认无边框
      borderWidth: 0,             // 默认无边框宽度
      lineCap: 'round',           // 默认圆角端点
      dashArray: [0, 0],            // 默认实线
      emitLight: false,           // 默认不发光
      dirArrows: false,           // 默认无方向箭头
      dirAnimate: null,           // 默认无动效
      isCurve: false,             // 是否绘制曲线
    }
  }

  // 添加线段到地图
  addToMap() {
    if (!this.map) return
    
    // 准备传递给地图的参数
    const linesConfig = {
      map: this.map,
      id: this.id,
      geometries: this.geometries,
      styles: this.styles
    }
    
    // 调用地图的批量添加方法（现在返回包含 source 和 layer 的对象）
    this.lines = this.map.addLines(linesConfig)
    
    // 验证返回结果
    if (!this.lines || typeof this.lines !== 'object') {
      console.warn('Lines: addLines 返回的结果不是预期的对象格式')
      this.lines = null
    }
  }

  // 从地图移除所有线段
  removeLines() {
    if (!this.map) return

    if (this.lines && typeof this.lines.removeLines === 'function') {
      this.lines.removeLines()
    }
    this.lines = null
  }

  /**
   * 设置所有线段的可见性
   * @param {boolean} visible - true为显示，false为隐藏
   */
  setVisible(visible) {
    if (!this.lines) {
      console.warn('Lines.setVisible: 线段组未初始化')
      return
    }

    try {
      // 检查 lines 对象是否有 setVisible 方法
      if (typeof this.lines.setVisible === 'function') {
        this.lines.setVisible(visible)
        return
      }
    } catch (error) {
      console.error(`Lines.setVisible: ${visible ? '显示' : '隐藏'}线段失败:`, error)
    }
  }

  /**
   * 获取线段组的可见性状态
   * @returns {boolean} true为可见，false为不可见
   */
  getVisible() {
    if (!this.lines) {
      console.warn('Lines.getVisible: 线段组未初始化')
      return false
    }

    try {
      // 检查 lines 对象是否有 getVisible 方法
      if (typeof this.lines.getVisible === 'function') {
        return this.lines.getVisible()
      }
    } catch (error) {
      console.error('Lines.getVisible: 获取线段可见性时出错:', error)
      return false
    }
  }


  /**
   * 添加新的几何数据
   * @param {Array} newGeometries - 要添加的几何数据数组
   */
  addGeometries(newGeometries) {
    if (!Array.isArray(newGeometries)) {
      console.warn('Lines.addGeometries: 参数必须是数组')
      return
    }
    if (newGeometries.length === 0) {
      console.warn('Lines.addGeometries: 没有要添加的数据')
      return
    }

    // 验证和标准化新数据（支持自定义styleId）
    const validatedGeometries = this._validateAndNormalizeGeometries(newGeometries)

    if (validatedGeometries.length === 0) {
      console.warn('Lines.addGeometries: 没有有效的数据可以添加')
      return
    }

    // 如果线段已经添加到地图，需要更新地图上的线段
    if (this.lines) {
      try {
        // 检查地图线段对象是否有 addGeometries 方法
        if (typeof this.lines.addGeometries === 'function') {
          // 先调用地图厂商的addGeometries方法
          this.lines.addGeometries(validatedGeometries)
          // 添加成功后再更新本地数据
          this.geometries.push(...validatedGeometries)
        } else {
          // 如果没有addGeometries方法，先更新本地数据，然后重新添加所有线段到地图
          this.geometries.push(...validatedGeometries)
          this.removeLines()
          this.addToMap()
        }
      } catch (error) {
        console.error('Lines.addGeometries: 添加线段到地图失败:', error)
        // 如果地图操作失败，不更新本地数据
      }
    } else {
      // 如果线段还没有添加到地图，直接添加到地图
      this.addToMap()
    }
  }

  /**
   * 删除指定的几何数据
   * @param {Array} idsToDelete - 要删除的ID数组
   */
  removeGeometries(idsToDelete) {
    if (!Array.isArray(idsToDelete)) {
      console.warn('Lines.removeGeometries: 参数必须是数组')
      return
    }

    if (idsToDelete.length === 0) {
      console.warn('Lines.removeGeometries: 没有要删除的数据')
      return
    }

    if (!this.lines) {
      console.warn('Lines.removeGeometries: 线段组未初始化')
      return
    }

    try {
      // 直接调用底层地图厂商的removeGeometries方法
      this.lines.removeGeometries(idsToDelete)

      // 从本地数据中移除对应的数据
      this.geometries = this.geometries.filter(geometry => !idsToDelete.includes(geometry.id))
    } catch (error) {
      console.error('Lines.removeGeometries: 删除线段失败:', error)
    }
  }

  /**
   * 获取所有几何数据
   * @returns {Array} 几何数据数组
   */
  getGeometries() {
    if (!this.lines) {
      console.warn('Lines.getGeometries: 线段组未初始化')
      return []
    }

    try {
      // 直接调用底层地图厂商的getGeometries方法
      return this.lines.getGeometries()
    } catch (error) {
      console.error('Lines.getGeometries: 获取几何数据失败:', error)
      return []
    }
  }

  /**
   * 批量更新几何数据
   * @param {Array} updatedGeometries - 要更新的几何数据数组，每个对象包含id和要更新的属性
   */
  updateLinesGeometries(updatedGeometries) {
    if (!Array.isArray(updatedGeometries)) {
      console.warn('Lines.updateLinesGeometries: 参数必须是数组')
      return
    }

    if (updatedGeometries.length === 0) {
      console.warn('Lines.updateLinesGeometries: 没有要更新的数据')
      return
    }

    if (!this.lines) {
      console.warn('Lines.updateLinesGeometries: 线段组未初始化')
      return
    }

    updatedGeometries.forEach(item =>{
      if (!item.styleId || item.styleId === '') {
        item.styleId = this.styles[0].id
      }
    })

    try {
      // 检查地图线段对象是否有 updateLinesGeometries 方法
      if (typeof this.lines.updateLinesGeometries === 'function') {
        // 直接调用地图厂商的批量更新方法
        this.lines.updateLinesGeometries(updatedGeometries)
        
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
      console.error('Lines.updateLinesGeometries: 批量更新线段失败:', error)
    }
  }

  // 为所有线段绑定事件
  on(eventType, callback) {
    if (!eventType || typeof callback !== 'function') {
      console.warn('Lines.on: 需要提供有效的事件类型和回调函数')
      return this
    }

    // 使用递归检查确保线段已创建
    const checkAndBindEvents = (retryCount = 0) => {
      // 检查this.lines是否存在且为对象
      if (!this.lines || typeof this.lines !== 'object') {
        if (retryCount < 20) {
          // 如果线段还没创建完成，等待50ms后重试
          setTimeout(() => checkAndBindEvents(retryCount + 1), 50)
          return
        } else {
          console.warn('Lines.on: 线段创建失败，无法绑定事件')
          return
        }
      }

      // 直接调用this.lines的on方法
      this.lines.on(eventType, callback)
    }

    checkAndBindEvents()
    return this
  }

  // 为所有线段解绑事件
  off(eventType, callback) {
    if (!eventType) {
      console.warn('Lines.off: 需要提供有效的事件类型')
      return this
    }

    // 使用递归检查确保线段已创建
    const checkAndUnbindEvents = (retryCount = 0) => {
      // 检查this.lines是否存在且为对象
      if (!this.lines || typeof this.lines !== 'object') {
        if (retryCount < 20) {
          // 如果线段还没创建完成，等待50ms后重试
          setTimeout(() => checkAndUnbindEvents(retryCount + 1), 50)
          return
        } else {
          console.warn('Lines.off: 线段创建失败，无法解绑事件')
          return
        }
      }
      // 直接调用this.lines的off方法
      this.lines.off(eventType, callback)
    }

    checkAndUnbindEvents()
    return this
  }

  // ~~~~~~~~~~~~~~~~~~    下方为扩展功能    ~~~~~~~~~~~~~~~~~~~~~~
  /**
   * 获取线段的总长度（所有线段长度之和）
   * @returns {number} 总长度（米）
   */
  getTotalLength() {
    if (!this.lines) {
      console.warn('Lines.getTotalLength: 线段组未初始化')
      return 0
    }

    try {
      // 检查地图线段对象是否有 getTotalLength 方法
      if (typeof this.lines.getTotalLength === 'function') {
        return this.lines.getTotalLength()
      } else {
        // 如果没有内置方法，可以计算所有线段的总长度
        let totalLength = 0
        this.geometries.forEach(geometry => {
          if (geometry.paths && geometry.paths.length > 1) {
            for (let i = 0; i < geometry.paths.length - 1; i++) {
              const distance = this._calculateDistance(
                geometry.paths[i],
                geometry.paths[i + 1]
              )
              totalLength += distance
            }
          }
        })
        return totalLength
      }
    } catch (error) {
      console.error('Lines.getTotalLength: 获取线段总长度失败:', error)
      return 0
    }
  }

  /**
   * 通过ID获取某一条线的距离
   * @param {string} geometryId - 线段ID
   * @returns {number} 线段距离（米），如果找不到线段则返回0
   */
  getLineDistanceById(geometryId) {
    if (!geometryId) {
      console.warn('Lines.getLineDistanceById: 需要提供有效的线段ID')
      return 0
    }

    if (!this.lines) {
      console.warn('Lines.getLineDistanceById: 线段组未初始化')
      return 0
    }

    try {
      // 检查地图线段对象是否有 getLineDistanceById 方法
      if (typeof this.lines.getLineDistanceById === 'function') {
        return this.lines.getLineDistanceById(geometryId)
      } else {
        // 如果没有内置方法，从本地数据中查找并计算距离
        const geometry = this.geometries.find(geo => geo.id === geometryId)
        
        if (!geometry) {
          console.warn(`Lines.getLineDistanceById: 未找到ID为 ${geometryId} 的线段`)
          return 0
        }

        if (!geometry.paths || geometry.paths.length < 2) {
          console.warn(`Lines.getLineDistanceById: 线段 ${geometryId} 的路径数据无效`)
          return 0
        }

        // 计算线段总距离
        let totalDistance = 0
        for (let i = 0; i < geometry.paths.length - 1; i++) {
          const distance = this._calculateDistance(
            geometry.paths[i],
            geometry.paths[i + 1]
          )
          totalDistance += distance
        }

        return totalDistance
      }
    } catch (error) {
      console.error('Lines.getLineDistanceById: 获取线段距离失败:', error)
      return 0
    }
  }

  /**
   * 计算两点之间的距离（使用Haversine公式）
   * @param {Array} coord1 - 第一个坐标点 [lng, lat]
   * @param {Array} coord2 - 第二个坐标点 [lng, lat]
   * @returns {number} 距离（米）
   */
  _calculateDistance(coord1, coord2) {
    const R = 6371000 // 地球半径（米）
    const dLat = this._toRadians(coord2[1] - coord1[1])
    const dLng = this._toRadians(coord2[0] - coord1[0])
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRadians(coord1[1])) * Math.cos(this._toRadians(coord2[1])) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * 将角度转换为弧度
   * @param {number} degrees - 角度
   * @returns {number} 弧度
   */
  _toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }


  // todo  以上梳理完成

  //
  // /**
  //  * 更新指定线段的样式
  //  * @param {string} geometryId - 要更新的线段ID
  //  * @param {Object} newStyle - 新的样式对象
  //  */
  // updateGeometryStyle(geometryId, newStyle) {
  //   if (!geometryId || !newStyle) {
  //     console.warn('Lines.updateGeometryStyle: 需要提供有效的ID和样式对象')
  //     return
  //   }
  //
  //   if (!this.lines) {
  //     console.warn('Lines.updateGeometryStyle: 线段组未初始化')
  //     return
  //   }
  //
  //   try {
  //     // 检查地图线段对象是否有 updateGeometryStyle 方法
  //     if (typeof this.lines.updateGeometryStyle === 'function') {
  //       this.lines.updateGeometryStyle(geometryId, newStyle)
  //       console.log(`Lines.updateGeometryStyle: 成功更新线段 ${geometryId} 的样式`)
  //     } else {
  //       console.warn('Lines.updateGeometryStyle: 地图不支持动态更新线段样式')
  //     }
  //   } catch (error) {
  //     console.error('Lines.updateGeometryStyle: 更新线段样式失败:', error)
  //   }
  // }
  //
  // /**
  //  * 更新指定线段的坐标
  //  * @param {string} geometryId - 要更新的线段ID
  //  * @param {Array} newPaths - 新的路径数组
  //  */
  // updateGeometryPaths(geometryId, newPaths) {
  //   if (!geometryId || !Array.isArray(newPaths)) {
  //     console.warn('Lines.updateGeometryPaths: 需要提供有效的ID和路径数组')
  //     return
  //   }
  //
  //   if (!this.lines) {
  //     console.warn('Lines.updateGeometryPaths: 线段组未初始化')
  //     return
  //   }
  //
  //   // 验证新坐标
  //   const validatedGeometries = this._validateAndNormalizeGeometries([{
  //     id: geometryId,
  //     paths: newPaths
  //   }])
  //
  //   if (validatedGeometries.length === 0) {
  //     console.warn('Lines.updateGeometryPaths: 新路径无效')
  //     return
  //   }
  //
  //   try {
  //     // 检查地图线段对象是否有 updateGeometryPaths 方法
  //     if (typeof this.lines.updateGeometryPaths === 'function') {
  //       this.lines.updateGeometryPaths(geometryId, validatedGeometries[0].paths)
  //
  //       // 更新本地数据
  //       const geometryIndex = this.geometries.findIndex(geo => geo.id === geometryId)
  //       if (geometryIndex !== -1) {
  //         this.geometries[geometryIndex].paths = validatedGeometries[0].paths
  //       }
  //
  //       console.log(`Lines.updateGeometryPaths: 成功更新线段 ${geometryId} 的路径`)
  //     } else {
  //       console.warn('Lines.updateGeometryPaths: 地图不支持动态更新线段路径')
  //     }
  //   } catch (error) {
  //     console.error('Lines.updateGeometryPaths: 更新线段路径失败:', error)
  //   }
  // }
}

