import { transformCoordinates } from '../utils/index.js'

/**
 * 聚合管理器
 * 负责管理所有聚合相关的功能
 */
export default class ClusterManager {
  constructor(mapInstance) {
    this.map = mapInstance.map
    this.clusters = new Map()
  }

  /**
   * 添加聚合功能 - 兼容 HTMap 接口
   * @param {object} options - 聚合配置
   * @returns {object} 聚合实例
   */
  addClusters(options) {
    if (!this.map) {
      console.warn('ClusterManager.addClusters: 地图未初始化')
      return null
    }

    // 验证必需参数
    if (!options.geometries || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      console.warn('ClusterManager.addClusters: geometries 参数无效或为空')
      return null
    }

    const clusterId = options.id || `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sourceId = `${clusterId}-source`

    try {
      const self = this // 保存 ClusterManager 实例引用
      
      // 标准化配置
      const config = this._normalizeClusterConfig(options)
      
      // 标准化几何数据
      const normalizedGeometries = this._normalizeGeometries(options.geometries, config.nonClustersStyle)
      
      // 创建GeoJSON数据
      const geojsonData = this._createClusterGeoJSON(normalizedGeometries)

      // 添加数据源
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: config.clusterConfig.maxZoom,
        clusterRadius: config.clusterConfig.radius,
        clusterMinPoints: config.clusterConfig.minCount,
        promoteId: 'id'
      })

      console.log(`ClusterManager.addClusters: 数据源 ${sourceId} 已添加，包含 ${geojsonData.features.length} 个要素`)

      // 添加图层
      this._addClusterLayers(clusterId, sourceId, config)
      
      // 创建聚合实例
      const clusterInstance = this._createClusterInstance(clusterId, sourceId, config, normalizedGeometries, self)

      // 存储聚合实例
      this.clusters.set(clusterId, clusterInstance)

      // 自动绑定聚合点击事件 - 参照 MineMap.js 的实现
      setTimeout(() => {
        console.log(`ClusterManager: 开始绑定聚合 ${clusterId} 的点击事件`)
        this._bindClusterEvents(clusterId, sourceId, normalizedGeometries, 'click', (eventData) => {
          console.log('ClusterManager: 聚合点击事件回调:', eventData)
        })
      }, 200)

      return clusterInstance

    } catch (error) {
      console.error('ClusterManager.addClusters: 添加聚合失败:', error)
      return null
    }
  }

  /**
   * 标准化聚合配置
   * @param {object} options - 原始配置
   * @returns {object} 标准化后的配置
   * @private
   */
  _normalizeClusterConfig(options) {
    return {
      id: options.id,
      clusterConfig: {
        maxZoom: options.clusterConfig?.maxZoom || 17,
        radius: options.clusterConfig?.radius || 60,
        minCount: options.clusterConfig?.minCount || 2,
        zoomOnClick: options.clusterConfig?.zoomOnClick !== false
      },
      clusterStyle: this._normalizeClusterStyle(options.clusterStyle),
      nonClustersStyle: this._normalizeNonClustersStyle(options.nonClustersStyle || []),
      nonClustersDom: options.nonClustersDom || null
    }
  }

  /**
   * 标准化聚合样式配置
   * @param {object} clusterStyle - 聚合样式配置
   * @returns {object} 标准化后的聚合样式
   * @private
   */
  _normalizeClusterStyle(clusterStyle) {
    if (!clusterStyle) {
      return {
        circleColor: 'rgba(80, 160, 255, 1)',
        circleRadius: 20,
        strokeColor: 'rgba(80, 160, 255, 1)',
        strokeWidth: 4,
        textColor: 'rgba(0,0,0,.75)',
        textSize: 10
      }
    }

    return {
      circleColor: clusterStyle.circleColor || 'rgba(80, 160, 255, 1)',
      circleRadius: clusterStyle.circleRadius || 20,
      strokeColor: clusterStyle.strokeColor || 'rgba(80, 160, 255, 1)',
      strokeWidth: clusterStyle.strokeWidth || 4,
      textColor: clusterStyle.textColor || 'rgba(0,0,0,.75)',
      textSize: clusterStyle.textSize || 10
    }
  }

  /**
   * 标准化非聚合点样式配置
   * @param {Array} nonClustersStyle - 非聚合点样式配置
   * @returns {Array} 标准化后的非聚合点样式
   * @private
   */
  _normalizeNonClustersStyle(nonClustersStyle) {
    if (!Array.isArray(nonClustersStyle) || nonClustersStyle.length === 0) {
      return [{
        id: 'default',
        src: '/src/utils/HTMap/assets/img/defaultPin.png',
        width: 32,
        height: 40,
        anchor: 'bottom'
      }]
    }

    return nonClustersStyle.map(style => ({
      id: style.id || 'default',
      src: style.src || '/src/utils/HTMap/assets/img/defaultPin.png',
      width: style.width || 32,
      height: style.height || 40,
      anchor: style.anchor || 'bottom',
      offset: style.offset || [0, 0]
    }))
  }

  /**
   * 标准化几何数据
   * @param {Array} geometries - 几何数据
   * @param {Array} nonClustersStyle - 非聚合点样式
   * @returns {Array} 标准化后的几何数据
   * @private
   */
  _normalizeGeometries(geometries, nonClustersStyle) {
    return geometries.map(geometry => {
      const normalized = {
        id: geometry.id || `geometry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lngLat: transformCoordinates(geometry.lngLat || geometry.coordinates, 'normalizeGeometries'),
        properties: geometry.properties || {},
        styleId: geometry.styleId || (nonClustersStyle && nonClustersStyle.length > 0 ? nonClustersStyle[0].id : 'default')
      }

      return normalized
    })
  }

  /**
   * 创建聚合GeoJSON数据
   * @param {Array} geometries - 几何数据
   * @returns {object} GeoJSON数据
   * @private
   */
  _createClusterGeoJSON(geometries) {
    const geojson = {
      type: 'FeatureCollection',
      features: geometries.map(geometry => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: geometry.lngLat
        },
        properties: {
          id: geometry.id,
          styleId: geometry.styleId,
          ...geometry.properties
        }
      }))
    }

    console.log('ClusterManager._createClusterGeoJSON: 创建聚合GeoJSON数据', {
      featuresCount: geojson.features.length,
      sampleFeature: geojson.features[0] ? {
        id: geojson.features[0].properties.id,
        styleId: geojson.features[0].properties.styleId,
        coordinates: geojson.features[0].geometry.coordinates
      } : null
    })

    return geojson
  }

  /**
   * 添加聚合图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} config - 聚合配置
   * @private
   */
  _addClusterLayers(clusterId, sourceId, config) {
    const clusterStyle = config.clusterStyle
    const nonClustersStyle = config.nonClustersStyle
    const nonClustersDom = config.nonClustersDom

    // 添加未聚合点图层
    if (nonClustersDom) {
      // 使用自定义DOM方式
      this._addUnclusteredDomLayer(clusterId, sourceId, nonClustersDom)
    } else {
      // 使用样式图标方式
      this._addUnclusteredLayer(clusterId, sourceId, clusterStyle, nonClustersStyle)
    }
    
    // 添加聚合圆圈图层
    this._addClusterCircleLayers(clusterId, sourceId, clusterStyle)
    
    // 添加聚合数量文字图层
    this._addClusterTextLayer(clusterId, sourceId, clusterStyle)
  }

  /**
   * 添加默认未聚合点图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @private
   */
  _addDefaultUnclusteredLayer(clusterId, sourceId) {
    // 检查数据源是否存在
    if (!this.map.getSource(sourceId)) {
      console.error(`ClusterManager._addDefaultUnclusteredLayer: 数据源 ${sourceId} 不存在`)
      return
    }

    // 检查图层是否已存在
    if (this.map.getLayer(`${clusterId}-unclustered`)) {
      console.log(`ClusterManager._addDefaultUnclusteredLayer: 图层 ${clusterId}-unclustered 已存在`)
      return
    }

    console.log(`ClusterManager._addDefaultUnclusteredLayer: 开始添加默认未聚合图层 ${clusterId}-unclustered`)

    // 直接使用symbol类型，因为MineMap可能不支持circle类型
    const layerConfig = {
      id: `${clusterId}-unclustered`,
      type: 'symbol',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-size': 0.5,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      },
      paint: {
        'icon-color': '#ff0000'
      }
    }

    // 添加图层
    try {
      this.map.addLayer(layerConfig)
      console.log(`ClusterManager._addDefaultUnclusteredLayer: 成功添加默认未聚合图层 ${clusterId}-unclustered`)
    } catch (addLayerError) {
      console.error(`ClusterManager._addDefaultUnclusteredLayer: 添加默认图层失败:`, addLayerError)
      throw addLayerError
    }
  }

  /**
   * 添加未聚合点图层（样式图标方式）
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} clusterStyle - 聚合样式
   * @param {Array} nonClustersStyle - 非聚合点样式
   * @private
   */
  _addUnclusteredLayer(clusterId, sourceId, clusterStyle, nonClustersStyle) {
    // 首先添加默认未聚合图层
    this._addDefaultUnclusteredLayer(clusterId, sourceId)
    
    // 为每个样式创建图层
    nonClustersStyle.forEach((style, index) => {
      const styleLayerId = `${clusterId}-unclustered-${style.id || index}`
      const iconId = `${clusterId}-icon-${style.id || index}`

      // 加载图标
      this._safeLoadImage(style.src).then(img => {
        if (!this.map.hasImage(iconId)) {
          this.map.addImage(iconId, img)
        }

        // 添加图层
        this.map.addLayer({
          id: styleLayerId,
          type: 'symbol',
          source: sourceId,
          filter: [
            'all',
            ['!', ['has', 'point_count']],
            ['==', ['get', 'styleId'], style.id || `style_${index}`]
          ],
          layout: {
            'icon-image': iconId,
            'icon-size': (style.width / img.width) || 1,
            'icon-anchor': style.anchor || 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-offset': this._convertOffset(style.offset)
          }
        })

        console.log(`ClusterManager: 成功添加未聚合点图层 ${styleLayerId}`)
      }).catch(error => {
        console.error(`ClusterManager: 加载图标失败:`, error)
      })
    })
  }

  /**
   * 添加未聚合点图层（自定义DOM方式）
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {HTMLElement} nonClustersDom - 自定义DOM元素
   * @private
   */
  _addUnclusteredDomLayer(clusterId, sourceId, nonClustersDom) {
    const layerId = `${clusterId}-unclustered-dom`
    
    this.map.addLayer({
      id: layerId,
      type: 'symbol',
      source: sourceId,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'default-pin',
        'icon-size': 0.5,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    })

    console.log(`ClusterManager: 成功添加未聚合点DOM图层 ${layerId}`)
  }

  /**
   * 添加聚合圆圈图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} clusterStyle - 聚合样式
   * @private
   */
  _addClusterCircleLayers(clusterId, sourceId, clusterStyle) {
    // 创建与 MineMap.js 一致的聚合圆圈图层
    const layerId = `${clusterId}-cluster-circle`
    
    // 创建圆圈颜色表达式
    const circleColor = this._createClusterColorExpression(clusterStyle.circleColor)
    
    // 创建圆圈半径表达式
    const circleRadius = this._createClusterRadiusExpression(clusterStyle.circleRadius)
    
    // 创建边框颜色表达式
    const strokeColor = this._createClusterColorExpression(clusterStyle.strokeColor)
    
    // 创建边框宽度表达式
    const strokeWidth = this._createClusterStrokeWidthExpression(clusterStyle.strokeWidth)

    this.map.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': circleColor,
        'circle-radius': circleRadius,
        'circle-stroke-color': strokeColor,
        'circle-stroke-width': strokeWidth
      }
    })

    console.log(`ClusterManager: 成功添加聚合圆圈图层 ${layerId}`)
  }

  /**
   * 添加聚合数量文字图层
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} clusterStyle - 聚合样式
   * @private
   */
  _addClusterTextLayer(clusterId, sourceId, clusterStyle) {
    const layerId = `${clusterId}-count`
    
    this.map.addLayer({
      id: layerId,
      type: 'symbol',
      source: sourceId,
      layout: {
        'text-field': '{point_count}',
        'text-size': clusterStyle.textSize
      },
      paint: {
        'text-color': clusterStyle.textColor
      },
      filter: ['has', 'point_count']
    })

    console.log(`ClusterManager: 成功添加聚合数量文字图层 ${layerId}`)
  }

  /**
   * 创建聚合实例
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {object} config - 配置
   * @param {Array} geometries - 几何数据
   * @param {object} self - ClusterManager实例引用
   * @returns {object} 聚合实例
   * @private
   */
  _createClusterInstance(clusterId, sourceId, config, geometries, self) {
    return {
      id: clusterId,
      sourceId: sourceId,
      geometries: geometries,
      config: config,
      map: this.map,

      // 事件监听器存储
      _eventListeners: new Map(),
      
      // 绑定事件
      on(eventType, callback) {
        if (!this._eventListeners.has(eventType)) {
          this._eventListeners.set(eventType, [])
        }
        this._eventListeners.get(eventType).push(callback)

        // 绑定地图事件
        self._bindClusterEvents(clusterId, sourceId, geometries, eventType, (eventData) => {
          // 触发所有注册的监听器
          if (this._eventListeners.has(eventType)) {
            this._eventListeners.get(eventType).forEach(listener => {
              try {
                listener(eventData)
              } catch (error) {
                console.error(`ClusterManager.on: ${eventType}事件回调执行错误:`, error)
              }
            })
          }
        })

        return this
      },

      // 移除事件
      off(eventType, callback) {
        if (this._eventListeners.has(eventType)) {
          if (callback) {
            const listeners = this._eventListeners.get(eventType)
            const index = listeners.indexOf(callback)
            if (index > -1) {
              listeners.splice(index, 1)
            }
          } else {
            this._eventListeners.delete(eventType)
          }
        }
        return this
      },

      // 一次性事件
      once(eventType, callback) {
        const onceCallback = (data) => {
          callback(data)
          this.off(eventType, onceCallback)
        }
        this.on(eventType, onceCallback)
        return this
      },

      // 移除聚合
      removeCluster() {
        try {
          // 清理事件监听器
          this._eventListeners.clear()

          // 移除图层和数据源
          self._removeClusterLayers(clusterId)
          
          if (this.map.getSource(sourceId)) {
            this.map.removeSource(sourceId)
          }
          
          self.clusters.delete(clusterId)

          console.log(`ClusterManager.removeCluster: 成功移除聚合 ${clusterId}`)
          return this
        } catch (error) {
          console.error('ClusterManager.removeCluster: 移除聚合失败:', error)
          return this
        }
      },

      // 更新数据
      updateData(newGeometries) {
        try {
          const normalizedGeometries = self._normalizeGeometries(newGeometries, this.config.nonClustersStyle)
          const geojsonData = self._createClusterGeoJSON(normalizedGeometries)
          this.map.getSource(sourceId).setData(geojsonData)
          this.geometries = normalizedGeometries
        } catch (error) {
          console.error('ClusterManager.updateData: 更新聚合数据失败:', error)
        }
        return this
      },

      // 更新样式
      updateStyle(newStyle) {
        try {
          // 移除现有图层
          this.remove()
          
          // 更新配置
          this.config.clusterStyle = { ...this.config.clusterStyle, ...newStyle }
          
          // 重新添加图层
          self._addClusterLayers(clusterId, sourceId, this.config)
          
        } catch (error) {
          console.error('ClusterManager.updateStyle: 更新聚合样式失败:', error)
        }
        return this
      },

      // 便捷的事件绑定方法
      onClusterClick(callback) {
        return this.on('click', callback)
      },

      onClusterDblClick(callback) {
        return this.on('dblclick', callback)
      },

      onClusterContextMenu(callback) {
        return this.on('contextmenu', callback)
      },

      // 获取聚合信息
      getInfo() {
        return {
          id: clusterId,
          sourceId: sourceId,
          geometryCount: geometries.length,
          config: config
        }
      }
    }
  }

  /**
   * 安全加载图片
   * @param {string} src - 图片源
   * @returns {Promise} 图片加载Promise
   * @private
   */
  _safeLoadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`图片加载失败: ${src}`))
      img.src = src
    })
  }

  /**
   * 转换偏移量
   * @param {Array|object} offset - 偏移量
   * @returns {Array} 转换后的偏移量
   * @private
   */
  _convertOffset(offset) {
    if (!offset) return [0, 0]
    if (Array.isArray(offset)) return offset
    if (typeof offset === 'object' && offset.x !== undefined && offset.y !== undefined) {
      return [offset.x, offset.y]
    }
    return [0, 0]
  }

  /**
   * 移除聚合
   * @param {string} clusterId - 聚合ID
   * @returns {boolean} 是否成功移除
   */
  removeCluster(clusterId) {
    console.log(`ClusterManager.removeCluster: 开始移除聚合 ${clusterId}`)
    console.log(`ClusterManager.removeCluster: 当前聚合数量: ${this.clusters.size}`)
    console.log(`ClusterManager.removeCluster: 聚合ID列表:`, Array.from(this.clusters.keys()))
    
    const cluster = this.clusters.get(clusterId)
    if (cluster && typeof cluster.removeCluster === 'function') {
      console.log(`ClusterManager.removeCluster: 找到聚合实例 ${clusterId}`)
      cluster.removeCluster()
      console.log(`ClusterManager.removeCluster: 成功移除聚合 ${clusterId}`)
    } else {
      console.warn(`ClusterManager.removeCluster: 未找到聚合实例 ${clusterId}`)
    }
  }

  /**
   * 移除聚合 - 兼容方法名
   * @param {string} clusterId - 聚合ID
   * @returns {boolean} 是否成功移除
   */
  removeClusters(clusterId) {
    this.removeCluster(clusterId)
  }

  /**
   * 获取聚合实例
   * @param {string} clusterId - 聚合ID
   * @returns {object|null} 聚合实例
   */
  getCluster(clusterId) {
    return this.clusters.get(clusterId) || null
  }

  /**
   * 移除聚合图层
   * @param {string} clusterId - 聚合ID
   * @private
   */
  _removeClusterLayers(clusterId) {
    // 获取聚合实例以获取原始配置
    const cluster = this.clusters.get(clusterId)
    const clusterStyle = cluster?.config?.clusterStyle || {}
    const nonClustersStyle = cluster?.config?.nonClustersStyle || []
    
    const layerIds = [
      `${clusterId}-unclustered`,
      `${clusterId}-count`
    ]

    // 根据实际配置移除外圈和内圈图层
    if (clusterStyle.outerColors) {
      clusterStyle.outerColors.forEach((color, i) => {
        layerIds.push(`${clusterId}-outer-${i}`)
      })
    }
    
    if (clusterStyle.innerColors) {
      clusterStyle.innerColors.forEach((color, i) => {
        layerIds.push(`${clusterId}-inner-${i}`)
      })
    }

    // 移除多个非聚合样式图层
    nonClustersStyle.forEach((style, styleIndex) => {
      if (style && style.id) {
        const layerId = `${clusterId}-unclustered-${style.id}`
        layerIds.push(layerId)

        // 移除对应的图标资源
        const iconId = `${clusterId}-icon-${style.id}`
        if (this.map.hasImage && this.map.hasImage(iconId)) {
          this.map.removeImage(iconId)
          console.log(`ClusterManager._removeClusterLayers: 已移除图标 ${iconId}`)
        }
      } else {
        // 如果没有id，使用索引
        const layerId = `${clusterId}-unclustered-${styleIndex}`
        layerIds.push(layerId)

        const iconId = `${clusterId}-icon-${styleIndex}`
        if (this.map.hasImage && this.map.hasImage(iconId)) {
          this.map.removeImage(iconId)
          console.log(`ClusterManager._removeClusterLayers: 已移除图标 ${iconId}`)
        }
      }
    })

    // 额外清理：移除所有以 clusterId 开头的图层（防止遗漏）
    const allLayers = this.map.getStyle().layers || []
    allLayers.forEach(layer => {
      if (layer.id && layer.id.startsWith(clusterId)) {
        layerIds.push(layer.id)
      }
    })

    // 去重
    const uniqueLayerIds = [...new Set(layerIds)]

    uniqueLayerIds.forEach(layerId => {
      // 先移除事件监听器
      try {
        this.map.off('click', layerId)
      } catch (error) {
        // 忽略移除事件监听器时的错误
      }
      
      // 再移除图层
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId)
        console.log(`ClusterManager._removeClusterLayers: 已移除图层 ${layerId}`)
      }
    })

    // 移除默认图标资源
    const iconId = `${clusterId}-icon`
    if (this.map.hasImage && this.map.hasImage(iconId)) {
      this.map.removeImage(iconId)
      console.log(`ClusterManager._removeClusterLayers: 已移除图标 ${iconId}`)
    }
  }

  /**
   * 清除所有聚合
   */
  clearAllClusters() {
    try {
      this.clusters.forEach((cluster, id) => {
        if (cluster && typeof cluster.removeCluster === 'function') {
          cluster.removeCluster()
        }
      })
      console.log('ClusterManager.clearAllClusters: 成功清理所有聚合资源')
    } catch (error) {
      console.error('ClusterManager.clearAllClusters: 清理聚合资源时出错:', error)
    }
  }

  /**
   * 绑定聚合事件 - 参照 MineMap.js 的实现
   * @param {string} clusterId - 聚合ID
   * @param {string} sourceId - 数据源ID
   * @param {Array} geometries - 几何数据
   * @param {string} eventType - 事件类型
   * @param {function} callback - 回调函数
   * @private
   */
  _bindClusterEvents(clusterId, sourceId, geometries, eventType, callback) {
    const supportedEvents = ['click', 'dblclick', 'contextmenu', 'mouseenter', 'mouseleave']

    if (!supportedEvents.includes(eventType)) {
      console.warn(`ClusterManager._bindClusterEvents: 不支持的事件类型: ${eventType}`)
      return
    }

    try {
      // 绑定聚合点事件 - 使用与 MineMap.js 一致的图层ID
      const clusterLayerId = `${clusterId}-cluster-circle`
      
      // 检查图层是否存在
      if (!this.map.getLayer(clusterLayerId)) {
        console.warn(`ClusterManager._bindClusterEvents: 图层 ${clusterLayerId} 不存在`)
        // 列出所有图层以帮助调试
        const allLayers = this.map.getStyle().layers || []
        const clusterLayers = allLayers.filter(layer => layer.id.includes(clusterId))
        console.log(`ClusterManager._bindClusterEvents: 聚合 ${clusterId} 相关图层:`, clusterLayers.map(l => l.id))
        return
      }
      
      console.log(`ClusterManager._bindClusterEvents: 成功找到图层 ${clusterLayerId}`)

      this.map.on(eventType, clusterLayerId, (evt) => {
        console.log(`ClusterManager._bindClusterEvents: 收到 ${eventType} 事件`, {
          layerId: clusterLayerId,
          featuresCount: evt.features ? evt.features.length : 0
        })
        
        if (evt.features && evt.features.length > 0) {
          const feature = evt.features[0]
          const clusterIdValue = feature.properties.cluster_id
          const pointCount = feature.properties.point_count
          
          console.log(`ClusterManager._bindClusterEvents: 聚合点击详情`, {
            clusterIdValue,
            pointCount,
            properties: feature.properties
          })

          // 如果是点击事件且启用了 zoomOnClick，则放大到聚合
          if (eventType === 'click') {
            const cluster = this.clusters.get(clusterId)
            if (cluster && cluster.config && cluster.config.clusterConfig && cluster.config.clusterConfig.zoomOnClick && pointCount > 1) {
              this.map.getSource(sourceId).getClusterExpansionZoom(clusterIdValue, (error, zoom) => {
                if (error) {
                  console.error('ClusterManager._bindClusterEvents: 获取聚合放大层级失败:', error)
                  return
                }

                this.map.easeTo({
                  center: feature.geometry.coordinates,
                  zoom: zoom,
                  duration: 1000,
                  easing: (t) => t * (2 - t) // easeOutQuad
                })

                console.log(`ClusterManager._bindClusterEvents: 聚合下探，从缩放级别 ${this.map.getZoom()} 到 ${zoom}`)
              })
            }
          }

          // 获取聚合内的点
          this.map.getSource(sourceId).getClusterLeaves(clusterIdValue, Infinity, 0, (error, leaves) => {
            if (error) {
              console.error('ClusterManager._bindClusterEvents: 获取聚合点失败:', error)
              return
            }

            const eventData = {
              clusterId: clusterIdValue,
              geometries: leaves,
              lngLat: evt.lngLat,
              point: evt.point,
              bounds: this._calculateClusterBounds(leaves),
              latLng: {
                lng: evt.lngLat.lng,
                lat: evt.lngLat.lat
              },
              type: eventType,
              timestamp: Date.now(),
              pointCount: pointCount,
              feature: feature
            }

            if (callback && typeof callback === 'function') {
              callback(eventData)
            }

            console.log(`ClusterManager._bindClusterEvents: 聚合${eventType}事件触发`, {
              clusterId: clusterIdValue,
              pointCount: pointCount,
              leavesCount: leaves.length
            })
          })
        }
      })

      // 绑定未聚合点事件 - 支持多个样式图层
      this._bindUnclusteredEvents(clusterId, eventType, geometries, callback)

      console.log(`ClusterManager._bindClusterEvents: 成功绑定${eventType}事件到聚合 ${clusterId}`)
    } catch (error) {
      console.error(`ClusterManager._bindClusterEvents: 绑定${eventType}事件失败:`, error)
    }
  }

  /**
   * 绑定未聚合点事件 - 支持多个样式图层
   * @param {string} clusterId - 聚合ID
   * @param {string} eventType - 事件类型
   * @param {Array} geometries - 几何数据
   * @param {function} callback - 回调函数
   * @private
   */
  _bindUnclusteredEvents(clusterId, eventType, geometries, callback) {
    try {
      // 获取聚合实例以获取配置
      const cluster = this.clusters.get(clusterId)
      const nonClustersStyle = cluster?.config?.nonClustersStyle || []

      console.log(`ClusterManager._bindUnclusteredEvents: 开始绑定未聚合点事件`, {
        clusterId,
        eventType,
        nonClustersStyleCount: nonClustersStyle.length,
        clusterExists: !!cluster
      })

      // 绑定默认未聚合图层事件
      const defaultUnclusteredLayerId = `${clusterId}-unclustered`
      if (this.map.getLayer(defaultUnclusteredLayerId)) {
        console.log(`ClusterManager._bindUnclusteredEvents: 绑定默认未聚合图层事件 ${defaultUnclusteredLayerId}`)
        this._bindSingleUnclusteredLayerEvent(defaultUnclusteredLayerId, eventType, geometries, callback)
      }

      // 绑定样式未聚合图层事件
      nonClustersStyle.forEach((style, styleIndex) => {
        if (style && style.id) {
          const styleLayerId = `${clusterId}-unclustered-${style.id}`
          if (this.map.getLayer(styleLayerId)) {
            console.log(`ClusterManager._bindUnclusteredEvents: 绑定样式未聚合图层事件 ${styleLayerId}`)
            this._bindSingleUnclusteredLayerEvent(styleLayerId, eventType, geometries, callback)
          }
        } else {
          // 如果没有id，使用索引
          const styleLayerId = `${clusterId}-unclustered-${styleIndex}`
          if (this.map.getLayer(styleLayerId)) {
            console.log(`ClusterManager._bindUnclusteredEvents: 绑定样式未聚合图层事件 ${styleLayerId}`)
            this._bindSingleUnclusteredLayerEvent(styleLayerId, eventType, geometries, callback)
          }
        }
      })

      console.log(`ClusterManager._bindUnclusteredEvents: 完成未聚合点事件绑定`)
    } catch (error) {
      console.error('ClusterManager._bindUnclusteredEvents: 绑定未聚合点事件失败:', error)
    }
  }

  /**
   * 绑定单个未聚合图层事件
   * @param {string} layerId - 图层ID
   * @param {string} eventType - 事件类型
   * @param {Array} geometries - 几何数据
   * @param {function} callback - 回调函数
   * @private
   */
  _bindSingleUnclusteredLayerEvent(layerId, eventType, geometries, callback) {
    this.map.on(eventType, layerId, (evt) => {
      if (evt.features && evt.features.length > 0) {
        const feature = evt.features[0]
        const geometry = geometries.find(geo => geo.id === feature.properties.id)

        if (geometry) {
          const eventData = {
            geometry: geometry,
            latLng: {
              lng: evt.lngLat.lng,
              lat: evt.lngLat.lat
            },
            point: evt.point,
            target: {
              properties: geometry.properties
            },
            type: `unclustered-${eventType}`,
            timestamp: Date.now(),
            feature: feature,
            properties: feature.properties,
            layerId: layerId
          }

          if (callback && typeof callback === 'function') {
            callback(eventData)
          }

          console.log(`ClusterManager._bindSingleUnclusteredLayerEvent: 非聚合${eventType}事件触发`, {
            geometryId: geometry.id,
            layerId: layerId
          })
        }
      }
    })
  }

  /**
   * 计算聚合边界 - 参照 MineMap.js 的实现
   * @param {Array} leaves - 聚合内的点
   * @returns {object} 边界信息
   * @private
   */
  _calculateClusterBounds(leaves) {
    if (!leaves || leaves.length === 0) return null

    let minLng = Infinity, minLat = Infinity
    let maxLng = -Infinity, maxLat = -Infinity

    leaves.forEach(leaf => {
      const [lng, lat] = leaf.geometry.coordinates
      minLng = Math.min(minLng, lng)
      minLat = Math.min(minLat, lat)
      maxLng = Math.max(maxLng, lng)
      maxLat = Math.max(maxLat, lat)
    })

    return {
      sw: [minLng, minLat],
      ne: [maxLng, maxLat],
      center: {
        lng: (minLng + maxLng) / 2,
        lat: (minLat + maxLat) / 2
      }
    }
  }

  /**
   * 安全加载图片
   * @param {string} src - 图片源
   * @returns {Promise} 加载结果
   * @private
   */
  _safeLoadImage(src) {
    // 始终返回一个 Promise
    return new Promise((resolve, reject) => {
      try {
        // 检查地图是否支持 loadImage
        if (!this.map.loadImage || typeof this.map.loadImage !== 'function') {
          console.warn('ClusterManager._safeLoadImage: 地图不支持 loadImage 方法')
          const error = new Error('loadImage not supported')
          reject(error)
          return
        }

        // 检查图标路径
        if (!src || typeof src !== 'string' || src.trim() === '') {
          console.warn('ClusterManager._safeLoadImage: 图标路径无效:', src)
          const error = new Error('Invalid image source')
          reject(error)
          return
        }

        const loadResult = this.map.loadImage(src)
        
        // 检查是否返回 Promise
        if (loadResult && typeof loadResult.then === 'function') {
          loadResult
            .then((image) => {
              try {
                console.log(`ClusterManager._safeLoadImage: 成功加载图标`)
                resolve(image)
              } catch (error) {
                console.warn('ClusterManager._safeLoadImage: 处理图片失败:', error)
                reject(error)
              }
            })
            .catch(error => {
              console.warn('ClusterManager._safeLoadImage: 图标加载失败:', error)
              reject(error)
            })
        } else {
          // 同步方式尝试 - 使用 Image 对象
          try {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              try {
                console.log(`ClusterManager._safeLoadImage: 同步加载图标`)
                resolve(img)
              } catch (error) {
                console.warn('ClusterManager._safeLoadImage: 同步处理图片失败:', error)
                reject(error)
              }
            }
            img.onerror = (error) => {
              console.warn('ClusterManager._safeLoadImage: 图片加载失败:', error)
              reject(error)
            }
            img.src = src
          } catch (error) {
            console.warn('ClusterManager._safeLoadImage: 创建图片对象失败:', error)
            reject(error)
          }
        }
      } catch (error) {
        console.warn('ClusterManager._safeLoadImage: 加载图标时发生错误:', error)
        reject(error)
      }
    })
  }

  /**
   * 转换偏移量格式
   * @param {Array|string|number} offset - 偏移量
   * @returns {Array} 转换后的偏移量数组
   * @private
   */
  _convertOffset(offset) {
    if (!offset) return [0, 0]
    
    // 如果已经是数组，转换数组中的数值字符串
    if (Array.isArray(offset)) {
      return offset.map(val => {
        if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
          return Number(val)
        }
        return typeof val === 'number' ? val : 0
      })
    }
    
    // 如果是单个数值或数值字符串，转换为数组
    if (typeof offset === 'string' && !isNaN(offset) && offset.trim() !== '') {
      const numVal = Number(offset)
      return [numVal, numVal]
    }
    
    if (typeof offset === 'number') {
      return [offset, offset]
    }
    
    return [0, 0]
  }

  /**
   * 创建聚合颜色表达式
   * @param {string|Array} colorConfig - 颜色配置
   * @returns {string|Array} 颜色表达式
   * @private
   */
  _createClusterColorExpression(colorConfig) {
    if (typeof colorConfig === 'string') {
      return colorConfig
    }

    if (Array.isArray(colorConfig)) {
      // 处理数组格式: ['#E26805', 50, '#FFFFFF', 80, '#rgba(80, 160, 255, 1)', 100]
      const steps = []
      for (let i = 0; i < colorConfig.length; i += 2) {
        if (i + 1 < colorConfig.length) {
          steps.push(colorConfig[i + 1], colorConfig[i])
        }
      }

      if (steps.length > 0) {
        return [
          'interpolate',
          ['linear'],
          ['get', 'point_count'],
          ...steps
        ]
      }
    }

    return 'rgba(80, 160, 255, 1)'
  }

  /**
   * 创建聚合半径表达式
   * @param {number|Array} radiusConfig - 半径配置
   * @returns {number|Array} 半径表达式
   * @private
   */
  _createClusterRadiusExpression(radiusConfig) {
    if (typeof radiusConfig === 'number') {
      return radiusConfig
    }

    if (Array.isArray(radiusConfig)) {
      // 处理数组格式: [20, 50, 24, 80, 30, 100]
      const steps = []
      for (let i = 0; i < radiusConfig.length; i += 2) {
        if (i + 1 < radiusConfig.length) {
          steps.push(radiusConfig[i + 1], radiusConfig[i])
        }
      }

      if (steps.length > 0) {
        return [
          'interpolate',
          ['linear'],
          ['get', 'point_count'],
          ...steps
        ]
      }
    }

    return 20
  }

  /**
   * 创建聚合边框宽度表达式
   * @param {number|Array} strokeWidthConfig - 边框宽度配置
   * @returns {number|Array} 边框宽度表达式
   * @private
   */
  _createClusterStrokeWidthExpression(strokeWidthConfig) {
    if (typeof strokeWidthConfig === 'number') {
      return strokeWidthConfig
    }

    if (Array.isArray(strokeWidthConfig)) {
      // 处理数组格式: [4, 100, 6]
      const steps = []
      for (let i = 0; i < strokeWidthConfig.length; i += 2) {
        if (i + 1 < strokeWidthConfig.length) {
          steps.push(strokeWidthConfig[i + 1], strokeWidthConfig[i])
        }
      }

      if (steps.length > 0) {
        return [
          'interpolate',
          ['linear'],
          ['get', 'point_count'],
          ...steps
        ]
      }
    }

    return 4
  }

}
