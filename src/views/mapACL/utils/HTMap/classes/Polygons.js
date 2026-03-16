/**
 * 多边形管理类
 * 提供多边形的添加、删除、更新、样式设置等功能
 * 支持多种地图引擎的统一接口
 */

export default class Polygons {
  constructor(options = {}) {
    this.polygonGroup = null
    this.map = options.map
    this.id = options.id || `polygons_group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.styles = this._validateAndNormalizeStyles(options.styles || [])
    this.geometries = this._validateAndNormalizeGeometries(options.geometries || [])

    // 如果有初始数据，立即添加到地图
    if (this.geometries.length > 0) {
      this.addToMap()
    }
  }

  /**
   * 验证和标准化样式数据
   * @param {Array} styles - 样式数组
   * @returns {Array} 验证后的样式数组
   * @private
   */
  _validateAndNormalizeStyles(styles) {
    if (!Array.isArray(styles)) {
      console.warn('Polygons: styles should be an array, using default style')
      return [this._getDefaultStyle()]
    }

    if (styles.length === 0) {
      console.warn('Polygons: styles array is empty, using default style')
      return [this._getDefaultStyle()]
    }

    // 验证每个样式对象
    return styles.map((style, index) => {
      if (!style || typeof style !== 'object') {
        console.warn(`Polygons: Invalid style at index ${index}, using default style`)
        return this._getDefaultStyle()
      }

      // 标准化样式数据
      const normalizedStyle = {
        id: style.id || `polygon_style_${this.id || 'temp'}_${index}`,
        color: style.color || 'rgba(75,152,250,0.3)',
        borderColor: style.borderColor || 'rgba(75, 152, 250, 1)',
        borderWidth: Number(style.borderWidth) || 2,
        borderDashArray: style.borderDashArray || null,
        isConvex: style.isConvex !== undefined ? Boolean(style.isConvex) : false
      }

      // 处理虚线参数 - 支持 [0,0] 表示实线
      if (Array.isArray(normalizedStyle.borderDashArray)) {
        if (normalizedStyle.borderDashArray.length === 2) {
          // 如果两个值都为0，表示实线
          if (normalizedStyle.borderDashArray[0] === 0 && normalizedStyle.borderDashArray[1] === 0) {
            normalizedStyle.borderDashArray = null
          }
        } else {
          normalizedStyle.borderDashArray = null
        }
      }

      return normalizedStyle
    })
  }

  /**
   * 获取默认样式
   * @returns {object} 默认样式对象
   * @private
   */
  _getDefaultStyle() {
    return {
      id: `default_polygon_style_${this.id || 'temp'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      color: 'rgba(75,152,250,0.3)', // 面颜色
      borderColor: 'rgba(75, 152, 250, 1)', // 边颜色
      borderWidth: 2, // 边线宽度
      borderDashArray: null, // 实线
      isConvex: false // 是否绘制凸多边形
    }
  }

  /**
   * 验证和标准化几何数据
   * @param {Array} geometries - 几何数据数组
   * @returns {Array} 验证后的几何数据数组
   * @private
   */
  _validateAndNormalizeGeometries(geometries) {
    if (!Array.isArray(geometries)) {
      console.warn('Polygons: geometries should be an array, converting to empty array')
      return []
    }

    return geometries.map((geometry, index) => {
      // 验证必需的属性 - 多边形需要路径数组
      let paths = null
      if (geometry.paths && Array.isArray(geometry.paths)) {
        paths = geometry.paths
      } else if (geometry.coordinates && Array.isArray(geometry.coordinates)) {
        paths = geometry.coordinates
      } else {
        console.warn(`Polygons: Invalid paths for geometry at index ${index}, skipping`)
        return null
      }

      // 验证路径数组是否有效（至少需要3个点）
      if (paths.length < 3) {
        console.warn(`Polygons: Polygon geometry at index ${index} must have at least 3 coordinates, skipping`)
        return null
      }

      // 验证每个坐标点
      const validatedPaths = paths.map((coord, coordIndex) => {
        if (!Array.isArray(coord) || coord.length < 2) {
          console.warn(`Polygons: Invalid coordinate at index ${coordIndex} in geometry ${index}, skipping`)
          return null
        }

        const lng = Number(coord[0])
        const lat = Number(coord[1])

        if (isNaN(lng) || isNaN(lat)) {
          console.error(`Polygons: Invalid coordinate values at index ${coordIndex} in geometry ${index}, lng: ${coord[0]}, lat: ${coord[1]}. Both values must be valid numbers.`)
          return null
        }

        return [lng, lat]
      }).filter(coord => coord !== null)

      if (validatedPaths.length < 3) {
        console.warn(`Polygons: Geometry at index ${index} has insufficient valid coordinates, skipping`)
        return null
      }

      // 标准化几何数据
      return {
        id: geometry.id || `polygon_geometry_${this.id || 'temp'}_${index}`,
        properties: geometry.properties || {},
        paths: validatedPaths,
        styleId: geometry.styleId || (this.styles.length > 0 ? this.styles[0].id : null)
      }
    }).filter(geometry => geometry !== null) // 过滤掉无效的几何数据
  }

  /**
   * 添加多边形到地图
   */
  addToMap() {
    if (!this.map) return
    
    // 准备传递给地图的参数
    const polygonsConfig = {
      map: this.map,
      id: this.id,
      geometries: this.geometries,
      styles: this.styles
    }
    
    // 调用地图的批量添加方法（现在返回包含 source 和 layer 的对象）
    this.polygonGroup = this.map.addPolygons(polygonsConfig)
    
    // 验证返回结果
    if (!this.polygonGroup || typeof this.polygonGroup !== 'object') {
      console.warn('Polygons: addPolygons 返回的结果不是预期的对象格式')
      this.polygonGroup = null
    } else {
      console.log('Polygons: 成功创建多边形图层', this.polygonGroup)
    }
  }

  /**
   * 移除所有多边形
   */
  removePolygons() {
    if (!this.map) return

    if (this.polygonGroup && typeof this.polygonGroup.removePolygons === 'function') {
      this.polygonGroup.removePolygons()
    }
    this.polygonGroup = null
  }

  /**
   * 设置所有多边形的可见性
   * @param {boolean} visible - true为显示，false为隐藏
   */
  setVisible(visible) {
    if (!this.polygonGroup) {
      console.warn('Polygons.setVisible: 多边形组未初始化')
      return
    }

    try {
      // 检查 polygonGroup 对象是否有 setVisible 方法
      if (typeof this.polygonGroup.setVisible === 'function') {
        this.polygonGroup.setVisible(visible)
        console.log(`Polygons.setVisible: 成功${visible ? '显示' : '隐藏'}所有多边形`)
        return
      }
      console.log(`Polygons.setVisible: 成功${visible ? '显示' : '隐藏'}多边形`)
    } catch (error) {
      console.error(`Polygons.setVisible: ${visible ? '显示' : '隐藏'}多边形失败:`, error)
    }
  }

  /**
   * 获取多边形组的可见性状态
   * @returns {boolean} true为可见，false为不可见
   */
  getVisible() {
    if (!this.polygonGroup) {
      console.warn('Polygons.getVisible: 多边形组未初始化')
      return false
    }

    try {
      // 检查 polygonGroup 对象是否有 getVisible 方法
      if (typeof this.polygonGroup.getVisible === 'function') {
        return this.polygonGroup.getVisible()
      }
    } catch (error) {
      console.error('Polygons.getVisible: 获取多边形可见性时出错:', error)
      return false
    }
  }

  /**
   * 添加几何数据
   * @param {Array} newGeometries - 几何数据数组
   */
  addGeometries(newGeometries) {
    if (!Array.isArray(newGeometries)) {
      console.warn('Polygons.addGeometries: 参数必须是数组')
      return
    }
    if (newGeometries.length === 0) {
      console.warn('Polygons.addGeometries: 没有要添加的数据')
      return
    }

    // 验证和标准化新数据（支持自定义styleId）
    const validatedGeometries = this._validateAndNormalizeGeometries(newGeometries)

    if (validatedGeometries.length === 0) {
      console.warn('Polygons.addGeometries: 没有有效的数据可以添加')
      return
    }

    // 如果多边形已经添加到地图，需要更新地图上的多边形
    if (this.polygonGroup) {
      try {
        // 检查地图多边形对象是否有 addGeometries 方法
        if (typeof this.polygonGroup.addGeometries === 'function') {
          // 先调用地图厂商的addGeometries方法
          this.polygonGroup.addGeometries(validatedGeometries)
          // 添加成功后再更新本地数据
          this.geometries.push(...validatedGeometries)
          console.log(`Polygons.addGeometries: 成功添加 ${validatedGeometries.length} 个多边形`)
        } else {
          // 如果没有addGeometries方法，先更新本地数据，然后重新添加所有多边形到地图
          this.geometries.push(...validatedGeometries)
          this.removePolygons()
          this.addToMap()
        }
      } catch (error) {
        console.error('Polygons.addGeometries: 添加多边形到地图失败:', error)
        // 如果地图操作失败，不更新本地数据
      }
    } else {
      // 如果多边形还没有添加到地图，先更新本地数据，然后添加到地图
      this.geometries.push(...validatedGeometries)
      this.addToMap()
    }
  }


  /**
   * 删除指定的几何数据
   * @param {Array} idsToDelete - 要删除的ID数组
   */
  removeGeometries(idsToDelete) {
    if (!Array.isArray(idsToDelete)) {
      console.warn('Polygons.removeGeometries: 参数必须是数组')
      return
    }

    if (idsToDelete.length === 0) {
      console.warn('Polygons.removeGeometries: 没有要删除的数据')
      return
    }

    if (!this.polygonGroup) {
      console.warn('Polygons.removeGeometries: 多边形组未初始化')
      return
    }

    try {
      // 直接调用底层地图厂商的removeGeometries方法
      this.polygonGroup.removeGeometries(idsToDelete)

      // 从本地数据中移除对应的数据
      this.geometries = this.geometries.filter(geometry => !idsToDelete.includes(geometry.id))

      console.log(`Polygons.removeGeometries: 成功删除 ${idsToDelete.length} 个多边形`)
    } catch (error) {
      console.error('Polygons.removeGeometries: 删除多边形失败:', error)
    }
  }

  /**
   * 获取几何数据
   * @returns {Array} 几何数据数组
   */
  getGeometries() {
    if (!this.polygonGroup) {
      console.warn('Polygons.getGeometries: 多边形组未初始化')
      return []
    }

    try {
      // 直接调用底层地图厂商的getGeometries方法
      return this.polygonGroup.getGeometries()
    } catch (error) {
      console.error('Polygons.getGeometries: 获取几何数据失败:', error)
      return []
    }
  }

  /**
   * 更新几何数据
   * @param {Array} updatedGeometries - 要更新的几何数据数组
   */
  updatePolygonsGeometries(updatedGeometries) {
    if (!Array.isArray(updatedGeometries)) {
      console.warn('Polygons.updatePolygonsGeometries: 参数必须是数组')
      return
    }

    if (updatedGeometries.length === 0) {
      console.warn('Polygons.updatePolygonsGeometries: 没有要更新的数据')
      return
    }

    if (!this.polygonGroup) {
      console.warn('Polygons.updatePolygonsGeometries: 多边形组未初始化')
      return
    }

    try {
      // 检查地图多边形对象是否有 updatePolygonsGeometries 方法
      if (typeof this.polygonGroup.updatePolygonsGeometries === 'function') {
        // 直接调用地图厂商的批量更新方法
        this.polygonGroup.updatePolygonsGeometries(updatedGeometries)
        
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
        
        console.log(`Polygons.updatePolygonsGeometries: 成功更新 ${updatedGeometries.length} 个多边形`)
      }
    } catch (error) {
      console.error('Polygons.updatePolygonsGeometries: 批量更新多边形失败:', error)
    }
  }

  /**
   * 为所有多边形绑定事件
   * @param {string} eventType - 事件类型
   * @param {function} callback - 回调函数
   * @returns {Polygons} 返回当前实例，支持链式调用
   */
  on(eventType, callback) {
    if (!eventType || typeof callback !== 'function') {
      console.warn('Polygons.on: 需要提供有效的事件类型和回调函数')
      return this
    }

    // 使用递归检查确保多边形组已创建
    const checkAndBindEvents = (retryCount = 0) => {
      // 检查this.polygonGroup是否存在且为对象
      if (!this.polygonGroup || typeof this.polygonGroup !== 'object') {
        if (retryCount < 20) {
          // 如果多边形组还没创建完成，等待50ms后重试
          setTimeout(() => checkAndBindEvents(retryCount + 1), 50)
          return
        } else {
          console.warn('Polygons.on: 多边形组创建失败，无法绑定事件')
          return
        }
      }

      // 直接调用this.polygonGroup的on方法
      this.polygonGroup.on(eventType, callback)

      console.log(`Polygons.on: 成功为多边形组绑定了 ${eventType} 事件`)
    }

    checkAndBindEvents()
    return this
  }

  /**
   * 为所有多边形解绑事件
   * @param {string} eventType - 事件类型
   * @param {function} callback - 回调函数（可选）
   * @returns {Polygons} 返回当前实例，支持链式调用
   */
  off(eventType, callback) {
    if (!eventType) {
      console.warn('Polygons.off: 需要提供有效的事件类型')
      return this
    }

    // 使用递归检查确保多边形组已创建
    const checkAndUnbindEvents = (retryCount = 0) => {
      // 检查this.polygonGroup是否存在且为对象
      if (!this.polygonGroup || typeof this.polygonGroup !== 'object') {
        if (retryCount < 20) {
          // 如果多边形组还没创建完成，等待50ms后重试
          setTimeout(() => checkAndUnbindEvents(retryCount + 1), 50)
          return
        } else {
          console.warn('Polygons.off: 多边形组创建失败，无法解绑事件')
          return
        }
      }
      // 直接调用this.polygonGroup的off方法
      this.polygonGroup.off(eventType, callback)

      console.log(`Polygons.off: 成功为多边形组解绑了 ${eventType} 事件`)
    }

    checkAndUnbindEvents()
    return this
  }
}
