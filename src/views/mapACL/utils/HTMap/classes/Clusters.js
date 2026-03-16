import transformExpression from '../utils/transformExpression.js'
import defaultPinImage from '../assets/img/defaultPin.png'

/**
 * Clusters 类 - 用于管理点位聚合
 * 提供聚合点的批量操作、样式设置、事件绑定等功能
 */
export default class Clusters {
  constructor(options = {}) {
    // 数据校验
    if (!options.map) {
      throw new Error('Clusters: map instance is required')
    }

    this.clusters = null // 聚合对象
    this.map = options.map
    this.id = options.id || `clusters_group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.nonClustersStyle = this._validateAndNormalizeNonClustersStyle(options.nonClustersStyle) // 未聚合点样式
    this.nonClustersDom = options.nonClustersDom || null

    this.geometries = this._validateAndNormalizeGeometries(options.geometries || []) // 数据
    this.clusterConfig = this._validateAndNormalizeClusterConfig(options.clusterConfig)
    this.clusterStyle = this._validateAndNormalizeClusterStyle(options.clusterStyle)

    // 如果有初始数据，立即添加到地图
    if (this.geometries.length > 0) {
      this.addToMap()
    }
  }

  // 验证和标准化几何数据
  _validateAndNormalizeGeometries(geometries) {
    if (!Array.isArray(geometries)) {
      console.warn('Clusters: geometries should be an array, converting to empty array')
      return []
    }

    return geometries.map((geometry, index) => {
      // 验证必需的属性
      if (!geometry.lngLat || !Array.isArray(geometry.lngLat) || geometry.lngLat.length !== 2) {
        console.warn(`Clusters: Invalid lngLat for geometry at index ${index}, skipping`)
        return null
      }

      // 验证经纬度是否可以转换为数字
      const lng = Number(geometry.lngLat[0])
      const lat = Number(geometry.lngLat[1])

      if (isNaN(lng) || isNaN(lat)) {
        console.error(`Clusters: Invalid lngLat values for geometry at index ${index}, lng: ${geometry.lngLat[0]}, lat: ${geometry.lngLat[1]}. Both values must be valid numbers.`)
        return null
      }

      // 标准化几何数据
      return {
        id: geometry.id || `cluster_geometry_${this.id || 'temp'}_${index}`,
        properties: geometry.properties || {},
        lngLat: [lng, lat],
        styleId: geometry.styleId || (this.nonClustersStyle.length > 0 ? this.nonClustersStyle[0].id : null)
      }
    }).filter(geometry => geometry !== null) // 过滤掉无效的几何数据
  }

  // 验证和标准化未聚合点样式数据
  _validateAndNormalizeNonClustersStyle(styles) {
    if (!Array.isArray(styles) || styles.length === 0) {
      return [this._getDefaultNonClustersStyle()]
    }

    // 验证每个样式对象
    return styles.map((style, index) => {
      if (!style || typeof style !== 'object') {
        console.warn(`Clusters: Invalid nonClustersStyle at index ${index}, using default style`)
        return this._getDefaultNonClustersStyle()
      }

      // 标准化未聚合点样式数据 - 与 markers style 结构一致
      let returnStyle = {
        id: style.id || `non_clusters_style_${this.id || 'temp'}_${index}`,
        src: style.src || defaultPinImage, // 默认使用 pin 图片
        width: Number(style.width) || 40, // 默认宽度
        height: Number(style.height) || 46, // 默认高度
        rotation: Number(style.rotation) || 0, // 旋转角
        faceForward: style.faceForward || 'standUp', // 默认直立 'lieFlat' 'standUp'
        draggable: style.draggable === true // 默认不可拖拽
      }
      if (Array.isArray(style.offset)) returnStyle.offset = style.offset

      return returnStyle
    })
  }
  // 获取默认未聚合点样式
  _getDefaultNonClustersStyle() {
    return {
      id: `default_non_clusters_style_${this.id || 'temp'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      src: defaultPinImage,   // 使用导入的默认图标
      width: 40, // 默认宽度
      height: 46, // 默认高度
      // offset: [-20, -46],          // 锚点位置为中间底部，正常情况offset不用传递， 腾讯传递之后点位会飘，所以我觉得不要用，如果偷着用，就锚点为底部中间  向左 -  向右+ 向上 - 向下+
      rotation: 0, // 旋转角
      faceForward: 'standUp', // 默认直立 'lieFlat' 'standUp'
      draggable: false // 默认不可拖拽
    }
  }

  // 验证和标准化聚合配置数据
  _validateAndNormalizeClusterConfig(config) {
    if (!config || typeof config !== 'object') {
      return this._getDefaultClusterConfig()
    }

    // 标准化聚合配置数据
    return {
      maxZoom: Number(config.maxZoom) || 17, // 超过最大层级则不再聚合
      minCount: Number(config.minCount) || 2, // 最小聚合个数
      radius: Number(config.radius) || 60, // 聚合半径（像素）
      zoomOnClick: config.zoomOnClick !== false, // 点击之后放大层级，默认为true
      // 允许其他自定义配置参数
      ...config
    }
  }
  // 获取默认聚合配置
  _getDefaultClusterConfig() {
    return {
      maxZoom: 17, // 超过最大层级则不再聚合
      minCount: 2, // 最小聚合个数
      radius: 60, // 聚合半径（像素）
      zoomOnClick: true // 点击之后放大层级
    }
  }

  // 验证和标准化聚合样式数据
  _validateAndNormalizeClusterStyle(style) {
    if (!style || typeof style !== 'object') {
      return this._getDefaultClusterStyle()
    }

    // 标准化聚合样式数据
    return {
      id: style.id || `cluster_style_${this.id || 'temp'}_${Date.now()}`,
      // 聚合点样式
      circleColor: style.circleColor || 'rgba(80, 160, 255, 1)', // 圈的颜色 单一颜色 || 数组
      circleRadius: style.circleRadius || 20, // 圈的半径 单一数值 || 数组
      strokeColor: style.strokeColor || 'rgba(80, 160, 255, 1)', // 圈边框的颜色 单一颜色 || 数组
      strokeWidth: style.strokeWidth || 4, // 圈边框的宽度 单一数值 || 数组
      // 文字样式
      textColor: style.textColor || 'rgba(255, 255, 255, 1)', // 文字颜色
      textSize: Number(style.textSize) || 14, // 文字大小
      // 自定义参数
      clusterCustom: style.clusterCustom || null // 聚合自定义展示内容公式，不传或者传null 则默认展示聚合的个数
    }
  }
  // 获取默认聚合样式
  _getDefaultClusterStyle() {
    return {
      id: `default_cluster_style_${this.id || 'temp'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      // 聚合点样式
      circleColor: 'rgba(80, 160, 255, 1)', // 圈的颜色 单一颜色 || 数组
      circleRadius: 20, // 圈的半径 单一数值 || 数组
      strokeColor: 'rgba(80, 160, 255, 1)', // 圈边框的颜色 单一颜色 || 数组
      strokeWidth: 4, // 圈边框的宽度 单一数值 || 数组
      // 文字样式
      textColor: 'rgba(255, 255, 255, 1)', // 文字颜色
      textSize: 14, // 文字大小
      // 自定义参数
      clusterCustom: null // 聚合自定义展示内容公式，不传或者传null 则默认展示聚合的个数
    }
  }



  // 添加聚合到地图
  addToMap() {
    if (!this.map) return

    // 准备传递给地图的参数
    const clustersConfig = {
      map: this.map,
      id: this.id,
      geometries: this.geometries,
      clusterStyle: this.clusterStyle,
      clusterConfig: this.clusterConfig
    }
    if (this.nonClustersDom) {
      clustersConfig.nonClustersDom = this.nonClustersDom
    } else {
      clustersConfig.nonClustersStyle = this.nonClustersStyle
    }

    // 检查是否为腾讯地图且传入了 clusterCustom 参数
    if (this.map.constructor.name === 'TencentMap' && this.clusterStyle.clusterCustom) {
      try {
        // 将 MapboxGL 表达式转换为 JS 函数字符串
        const functionString = transformExpression(this.clusterStyle.clusterCustom)
        // 将字符串转换为可执行的函数
        const compiledFunction = new Function('return ' + functionString)()
        // 将编译后的函数添加到 clusterStyle 中
        clustersConfig.clusterStyle = {
          ...this.clusterStyle,
          clusterCustom: compiledFunction
        }
      } catch (error) {
        console.error('Clusters: 编译 clusterCustom 表达式失败:', error)
        // 如果编译失败，使用原始值
        clustersConfig.clusterStyle = this.clusterStyle
      }
    }
    // 调用地图的聚合添加方法
    const result = this.map.addClusters(clustersConfig)

    // 处理异步返回的Promise
    if (result && typeof result.then === 'function') {
      // 如果是Promise，等待完成
      result.then(clusters => {
        this.clusters = clusters
        // 验证返回结果
        if (!this.clusters || typeof this.clusters !== 'object') {
          console.warn('Clusters: addClusters 返回的结果不是预期的对象格式')
          this.clusters = null
        } else {
        }
      }).catch(error => {
        // 静默处理错误
        this.clusters = null
      })
    } else {
      // 如果不是Promise，直接处理
      this.clusters = result
      // 验证返回结果
      if (!this.clusters || typeof this.clusters !== 'object') {
        console.warn('Clusters: addClusters 返回的结果不是预期的对象格式')
        this.clusters = null
      }
    }

  }

  // 从地图移除所有聚合
  removeClusters() {
    if (!this.map) return

    if (this.clusters && typeof this.clusters.removeCluster === 'function') {
      this.clusters.removeCluster()
    }
    this.clusters = null
  }

  // 为所有聚合绑定事件
  on(eventType, callback) {
    if (!eventType || typeof callback !== 'function') {
      console.warn('Clusters.on: 需要提供有效的事件类型和回调函数')
      return this
    }
    // 使用递归检查确保聚合已创建且on方法可用
    const checkAndBindEvents = (retryCount = 0) => {
      // 检查this.clusters是否存在且为对象，并且on方法已准备好
      if (!this.clusters || typeof this.clusters !== 'object' || typeof this.clusters.on !== 'function') {
        if (retryCount < 20) {
          // 如果聚合还没创建完成，等待50ms后重试
          setTimeout(() => checkAndBindEvents(retryCount + 1), 50)
          return
        } else {
          console.warn('Clusters.on: 聚合创建失败或on方法未准备好，无法绑定事件')
          return
        }
      }

      // 直接调用this.clusters的on方法
      this.clusters.on(eventType, callback)

    }

    checkAndBindEvents()
    return this
  }

  // 为所有聚合解绑事件
  off(eventType, callback) {
    if (!eventType) {
      console.warn('Clusters.off: 需要提供有效的事件类型')
      return this
    }

    // 使用递归检查确保聚合已创建且off方法可用
    const checkAndUnbindEvents = (retryCount = 0) => {
      // 检查this.clusters是否存在且为对象，并且off方法已准备好
      if (!this.clusters || typeof this.clusters !== 'object' || typeof this.clusters.off !== 'function') {
        if (retryCount < 20) {
          // 如果聚合还没创建完成，等待50ms后重试
          setTimeout(() => checkAndUnbindEvents(retryCount + 1), 50)
          return
        } else {
          console.warn('Clusters.off: 聚合创建失败或off方法未准备好，无法解绑事件')
          return
        }
      }

      // 直接调用this.clusters的off方法
      this.clusters.off(eventType, callback)

    }

    checkAndUnbindEvents()
    return this
  }


  // ~~~~~~~~~~~~~~~~~~~   下方功能暂时不加   ~~~~~~~~~~~~~~~~~~~~~

  // /**
  //  * 设置所有聚合的可见性
  //  * @param {boolean} visible - true为显示，false为隐藏
  //  */
  // setVisible(visible) {
  //   if (!this.clusters) {
  //     console.warn('Clusters.setVisible: 聚合组未初始化')
  //     return
  //   }
  //
  //   try {
  //     // 检查 clusters 对象是否有 setVisible 方法
  //     if (typeof this.clusters.setVisible === 'function') {
  //       this.clusters.setVisible(visible)
  //       console.log(`Clusters.setVisible: 成功${visible ? '显示' : '隐藏'}所有聚合`)
  //       return
  //     }
  //     console.log(`Clusters.setVisible: 成功${visible ? '显示' : '隐藏'}聚合`)
  //   } catch (error) {
  //     console.error(`Clusters.setVisible: ${visible ? '显示' : '隐藏'}聚合失败:`, error)
  //   }
  // }
  //
  // /**
  //  * 获取聚合组的可见性状态
  //  * @returns {boolean} true为可见，false为不可见
  //  */
  // getVisible() {
  //   if (!this.clusters) {
  //     console.warn('Clusters.getVisible: 聚合组未初始化')
  //     return false
  //   }
  //
  //   try {
  //     // 检查 clusters 对象是否有 getVisible 方法
  //     if (typeof this.clusters.getVisible === 'function') {
  //       return this.clusters.getVisible()
  //     }
  //   } catch (error) {
  //     console.error('Clusters.getVisible: 获取聚合可见性时出错:', error)
  //     return false
  //   }
  // }
  //
  // /**
  //  * 获取所有几何数据
  //  * @returns {Array} 几何数据数组
  //  */
  // getGeometries() {
  //   if (!this.clusters) {
  //     console.warn('Clusters.getGeometries: 聚合组未初始化')
  //     return []
  //   }
  //
  //   try {
  //     // 直接调用底层地图厂商的getGeometries方法
  //     return this.clusters.getGeometries()
  //   } catch (error) {
  //     console.error('Clusters.getGeometries: 获取几何数据失败:', error)
  //     return []
  //   }
  // }
  //
  // /**
  //  * 添加新的几何数据
  //  * @param {Array} newGeometries - 要添加的几何数据数组
  //  */
  // addGeometries(newGeometries) {
  //   if (!Array.isArray(newGeometries)) {
  //     console.warn('Clusters.addGeometries: 参数必须是数组')
  //     return
  //   }
  //   if (newGeometries.length === 0) {
  //     console.warn('Clusters.addGeometries: 没有要添加的数据')
  //     return
  //   }
  //
  //   // 验证和标准化新数据（支持自定义styleId）
  //   const validatedGeometries = this._validateAndNormalizeGeometries(newGeometries)
  //
  //   if (validatedGeometries.length === 0) {
  //     console.warn('Clusters.addGeometries: 没有有效的数据可以添加')
  //     return
  //   }
  //
  //   // 如果聚合已经添加到地图，需要更新地图上的聚合
  //   if (this.clusters) {
  //     try {
  //       // 检查地图聚合对象是否有 addGeometries 方法
  //       if (typeof this.clusters.addGeometries === 'function') {
  //         // 先调用地图厂商的addGeometries方法
  //         this.clusters.addGeometries(validatedGeometries)
  //         // 添加成功后再更新本地数据
  //         this.geometries.push(...validatedGeometries)
  //         console.log(`Clusters.addGeometries: 成功添加 ${validatedGeometries.length} 个聚合点`)
  //       } else {
  //         // 如果没有addGeometries方法，先更新本地数据，然后重新添加所有聚合到地图
  //         this.geometries.push(...validatedGeometries)
  //         this.remove()
  //         this.addToMap()
  //       }
  //     } catch (error) {
  //       console.error('Clusters.addGeometries: 添加聚合点到地图失败:', error)
  //       // 如果地图操作失败，不更新本地数据
  //     }
  //   } else {
  //     // 如果聚合还没有添加到地图，直接添加到地图
  //     this.addToMap()
  //   }
  // }
  //
  // /**
  //  * 删除指定的几何数据
  //  * @param {Array} idsToDelete - 要删除的ID数组
  //  */
  // removeGeometries(idsToDelete) {
  //   if (!Array.isArray(idsToDelete)) {
  //     console.warn('Clusters.removeGeometries: 参数必须是数组')
  //     return
  //   }
  //
  //   if (idsToDelete.length === 0) {
  //     console.warn('Clusters.removeGeometries: 没有要删除的数据')
  //     return
  //   }
  //
  //   if (!this.clusters) {
  //     console.warn('Clusters.removeGeometries: 聚合组未初始化')
  //     return
  //   }
  //
  //   try {
  //     // 直接调用底层地图厂商的removeGeometries方法
  //     this.clusters.removeGeometries(idsToDelete)
  //
  //     // 从本地数据中移除对应的数据
  //     this.geometries = this.geometries.filter(geometry => !idsToDelete.includes(geometry.id))
  //
  //     console.log(`Clusters.removeGeometries: 成功删除 ${idsToDelete.length} 个聚合点`)
  //   } catch (error) {
  //     console.error('Clusters.removeGeometries: 删除聚合点失败:', error)
  //   }
  // }

  // /**
  //  * 批量更新几何数据
  //  * @param {Array} updatedGeometries - 要更新的几何数据数组，每个对象包含id和要更新的属性
  //  */
  // updateGeometries(updatedGeometries) {
  //   if (!Array.isArray(updatedGeometries)) {
  //     console.warn('Clusters.updateGeometries: 参数必须是数组')
  //     return
  //   }
  //
  //   if (updatedGeometries.length === 0) {
  //     console.warn('Clusters.updateGeometries: 没有要更新的数据')
  //     return
  //   }
  //
  //   if (!this.clusters) {
  //     console.warn('Clusters.updateGeometries: 聚合组未初始化')
  //     return
  //   }
  //
  //   try {
  //     // 检查地图聚合对象是否有 updateGeometries 方法
  //     if (typeof this.clusters.updateGeometries === 'function') {
  //       // 直接调用地图厂商的批量更新方法
  //       this.clusters.updateGeometries(updatedGeometries)
  //
  //       // 更新本地数据
  //       updatedGeometries.forEach(updatedGeo => {
  //         const geometryIndex = this.geometries.findIndex(geo => geo.id === updatedGeo.id)
  //         if (geometryIndex !== -1) {
  //           // 合并更新数据
  //           this.geometries[geometryIndex] = {
  //             ...this.geometries[geometryIndex],
  //             ...updatedGeo
  //           }
  //         }
  //       })
  //
  //       console.log(`Clusters.updateGeometries: 成功更新 ${updatedGeometries.length} 个聚合点`)
  //     }
  //   } catch (error) {
  //     console.error('Clusters.updateGeometries: 批量更新聚合点失败:', error)
  //   }
  // }
  //
  // /**
  //  * 更新聚合配置
  //  * @param {Object} newConfig - 新的聚合配置
  //  */
  // updateClusterConfig(newConfig) {
  //   if (!newConfig || typeof newConfig !== 'object') {
  //     console.warn('Clusters.updateClusterConfig: 需要提供有效的配置对象')
  //     return
  //   }
  //
  //   // 更新本地配置
  //   this.clusterConfig = {
  //     ...this.clusterConfig,
  //     ...newConfig
  //   }
  //
  //   if (!this.clusters) {
  //     console.warn('Clusters.updateClusterConfig: 聚合组未初始化')
  //     return
  //   }
  //
  //   try {
  //     // 检查地图聚合对象是否有 updateClusterConfig 方法
  //     if (typeof this.clusters.updateClusterConfig === 'function') {
  //       this.clusters.updateClusterConfig(this.clusterConfig)
  //       console.log('Clusters.updateClusterConfig: 成功更新聚合配置')
  //     } else {
  //       // 如果没有updateClusterConfig方法，重新创建聚合
  //       this.remove()
  //       this.addToMap()
  //       console.log('Clusters.updateClusterConfig: 通过重新创建更新聚合配置')
  //     }
  //   } catch (error) {
  //     console.error('Clusters.updateClusterConfig: 更新聚合配置失败:', error)
  //   }
  // }
  //
  // /**
  //  * 获取聚合统计信息
  //  * @returns {Object} 聚合统计信息
  //  */
  // getClusterStats() {
  //   if (!this.clusters) {
  //     console.warn('Clusters.getClusterStats: 聚合组未初始化')
  //     return null
  //   }
  //
  //   try {
  //     // 检查地图聚合对象是否有 getClusterStats 方法
  //     if (typeof this.clusters.getClusterStats === 'function') {
  //       return this.clusters.getClusterStats()
  //     } else {
  //       // 如果没有内置方法，返回基本统计信息
  //       return {
  //         totalPoints: this.geometries.length,
  //         clusterConfig: this.clusterConfig,
  //         visible: this.getVisible()
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Clusters.getClusterStats: 获取聚合统计信息失败:', error)
  //     return null
  //   }
  // }
}
