import { transformCoordinates } from '../utils/index.js'
import { generateConvexPolygon } from '../../../utils/toolUtils.js'

/**
 * 多边形管理器
 * 负责管理所有多边形相关的功能
 */
export default class PolygonsManager {
  constructor(mapInstance) {
    this.map = mapInstance.map
    this.polygons = new Map()
  }

  /**
   * 批量添加多边形 - 支持 HTMap 标准参数格式，参照 MapboxGL.js 实现
   * @param {object} options - 多边形配置对象 {id, geometries, styles}
   * @returns {object} 多边形组对象
   */
  addPolygons(options) {
    if (!this.map) return null

    // 验证必要参数 - 参照 MapboxGL.js 的实现
    if (!options || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      return null
    }

    const groupId = options.id || `polygons_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sourceId = `${groupId}-source`

    try {
      // 验证与标准化样式
      const styles = this._validatePolygonStyles(options.styles)
      // 验证与标准化几何
      const geometries = this._validatePolygonGeometries(options.geometries, styles)

      const isConvexByStyleId = (id) => styles.find(style => style.id === id)?.isConvex

      if (geometries.length === 0) {
        return null
      }

      // 创建图层（每个样式使用独立的数据源，保持 MineMap 架构）
      const layerId = `${groupId}-layer`
      const layerResult = this._createPolygonLayers(layerId, sourceId, styles, geometries)
      const createdLayers = layerResult.layers
      const createdSources = layerResult.sources

      // 构建多边形组对象 - 参照 MapboxGL.js 的结构，兼容 HTMap 接口
      const self = this
      const polygonGroup = {
        id: groupId,
        sourceId: createdSources.length > 0 ? createdSources[0] : sourceId, // 兼容 MapboxGL 的单一 sourceId
        layerId: createdLayers, // 兼容命名
        layers: createdLayers,
        geometries,
        styles,

        // 事件绑定（为所有样式图层绑定）- 参照 MapboxGL.js 的实现
        on: (eventType, callback) => {
          (createdLayers || []).forEach(layerId => {
            if (!self.map.getLayer(layerId)) return
            self.map.on(eventType, layerId, (evt) => {
              if (evt.features && evt.features.length > 0) {
                const feature = evt.features[0]
                const geom = geometries.find(g => g.id === feature.properties?.id)
                if (geom) {
                  callback({
                    geometry: geom,
                    properties: geom.properties,
                    latLng: evt.lngLat,
                    point: evt.point,
                    feature: feature,
                    layerId,
                    sourceId: createdSources.find(s => self.map.getSource(s)) || sourceId,
                    type: eventType,
                    timestamp: Date.now()
                  })
                }
              }
            })
          })
        },
        off: (eventType, callback) => {
          (createdLayers || []).forEach(layerId => {
            if (!self.map.getLayer(layerId)) return
            if (callback) {
              self.map.off(eventType, layerId, callback)
            }
          })
        },

        // 添加几何 - 参照 MapboxGL.js 的实现
        addGeometries: (newGeometries) => {
          const validated = self._validatePolygonGeometries(newGeometries, styles)
          if (validated.length === 0) return false
          polygonGroup.geometries.push(...validated)
          
          // 为每个样式更新对应的数据源
          styles.forEach((style, index) => {
            const styleId = style.id || `style_${index}`
            const styleSourceId = `${groupId}-source-${styleId}`
            
            // 筛选出使用当前样式的几何数据
            const styleGeometries = polygonGroup.geometries.filter(geo => {
              if (geo.styleId) {
                return geo.styleId === styleId
              } else {
                const geoIndex = polygonGroup.geometries.indexOf(geo)
                return geoIndex % styles.length === index
              }
            })
            
            if (styleGeometries.length > 0 && self.map.getSource(styleSourceId)) {
              const styleGeoJSON = self._buildPolygonGeoJSON(styleGeometries, styles)
              self.map.getSource(styleSourceId).setData(styleGeoJSON)
            }
          })
          return true
        },

        // 删除几何 - 参照 MapboxGL.js 的实现
        removeGeometries: (idsToDelete) => {
          if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) return false
          polygonGroup.geometries = polygonGroup.geometries.filter(g => !idsToDelete.includes(g.id))
          
          // 为每个样式更新对应的数据源
          styles.forEach((style, index) => {
            const styleId = style.id || `style_${index}`
            const styleSourceId = `${groupId}-source-${styleId}`
            
            // 筛选出使用当前样式的几何数据
            const styleGeometries = polygonGroup.geometries.filter(geo => {
              if (geo.styleId) {
                return geo.styleId === styleId
              } else {
                const geoIndex = polygonGroup.geometries.indexOf(geo)
                return geoIndex % styles.length === index
              }
            })
            
            if (self.map.getSource(styleSourceId)) {
              if (styleGeometries.length > 0) {
                const styleGeoJSON = self._buildPolygonGeoJSON(styleGeometries, styles)
                self.map.getSource(styleSourceId).setData(styleGeoJSON)
              } else {
                // 如果没有几何数据了，设置空的数据源
                const emptyGeoJSON = {
                  type: 'FeatureCollection',
                  features: []
                }
                self.map.getSource(styleSourceId).setData(emptyGeoJSON)
              }
            }
          })
          return true
        },

        // 更新几何 - 参照 MapboxGL.js 的实现
        updatePolygonsGeometries: (updatedGeometries) => {
          // 记录原有的 styleId 映射，用于在更新时保留（如果传入的数据没有 styleId）
          const existingStyleIdMap = new Map()
          polygonGroup.geometries.forEach(g => {
            if (g && g.id) {
              existingStyleIdMap.set(g.id, g.styleId)
            }
          })
          
          // 记录传入的原始数据中的 styleId（在验证之前）
          const originalStyleIdMap = new Map()
          updatedGeometries.forEach(geo => {
            if (geo && geo.id) {
              originalStyleIdMap.set(geo.id, geo.styleId)
            }
          })
          
          // 验证传入的几何数据
          const validated = self._validatePolygonGeometries(updatedGeometries, styles)
          
          // 如果传入的数据没有 styleId，但原有数据有，则保留原有的 styleId
          validated.forEach(validatedGeo => {
            const originalStyleId = originalStyleIdMap.get(validatedGeo.id)
            const existingStyleId = existingStyleIdMap.get(validatedGeo.id)
            
            // 如果传入的原始数据没有 styleId（undefined 或 null），但原有数据有，则保留原有的 styleId
            if ((originalStyleId === undefined || originalStyleId === null) && 
                existingStyleId !== undefined && existingStyleId !== null) {
              validatedGeo.styleId = existingStyleId
            }
            // 如果传入的原始数据明确指定了 styleId，则使用传入的 styleId（已验证后的值）
          })
          
          const mapById = new Map(validated.map(g => [g.id, g]))
          // 更新几何数据：如果 mapById 中有对应的更新数据，完全替换（包括新的 styleId）；否则保持原样
          polygonGroup.geometries = (polygonGroup.geometries || []).map(g => mapById.get(g.id) || g)
          
          // 为每个样式更新对应的数据源（MineMap 使用多数据源架构）
          // 当 styleId 改变时，几何数据会从旧的数据源移除，添加到新的数据源
          // 需要确保所有数据源都被更新，包括旧的和新的
          styles.forEach((style, index) => {
            const styleId = style.id || `style_${index}`
            const styleSourceId = `${groupId}-source-${styleId}`
            const currentLayerId = `${groupId}-layer-${styleId}`
            const borderLayerId = `${currentLayerId}-border`
            
            // 筛选出使用当前样式的几何数据
            const styleGeometries = polygonGroup.geometries.filter(geo => {
              if (geo.styleId) {
                return geo.styleId === styleId
              } else {
                const geoIndex = polygonGroup.geometries.indexOf(geo)
                return geoIndex % styles.length === index
              }
            })
            
            let src = self.map.getSource(styleSourceId)
            
            // 如果数据源不存在，需要创建它和对应的图层（当 styleId 改变时，新的样式可能没有数据源）
            if (!src && styleGeometries.length > 0) {
              try {
                // 构建 GeoJSON 数据
                const styleGeoJSON = self._buildPolygonGeoJSON(styleGeometries, styles)
                
                // 创建数据源
                self.map.addSource(styleSourceId, {
                  type: 'geojson',
                  data: styleGeoJSON
                })
                src = self.map.getSource(styleSourceId)
                
                // 创建填充图层
                if (!self.map.getLayer(currentLayerId)) {
                  self.map.addLayer({
                    id: currentLayerId,
                    type: 'fill',
                    source: styleSourceId,
                    paint: {
                      'fill-color': style.color,
                      'fill-opacity': style.opacity || 1
                    }
                  })
                  // 更新 createdLayers 数组
                  if (!createdLayers.includes(currentLayerId)) {
                    createdLayers.push(currentLayerId)
                  }
                }
                
                // 创建边框图层
                if (!self.map.getLayer(borderLayerId)) {
                  const borderPaint = {
                    'line-color': style.borderColor,
                    'line-width': style.borderWidth,
                    'line-opacity': 1
                  }
                  
                  if (style.borderDashArray) {
                    borderPaint['line-dasharray'] = style.borderDashArray
                  }
                  
                  self.map.addLayer({
                    id: borderLayerId,
                    type: 'line',
                    source: styleSourceId,
                    paint: borderPaint
                  })
                  // 更新 createdLayers 数组
                  if (!createdLayers.includes(borderLayerId)) {
                    createdLayers.push(borderLayerId)
                  }
                }
                
                // 更新 createdSources 数组
                if (!createdSources.includes(styleSourceId)) {
                  createdSources.push(styleSourceId)
                }
              } catch (error) {
                // 创建数据源失败，静默处理
              }
            }
            
            // 更新数据源
            if (src) {
              try {
                if (styleGeometries.length > 0) {
                  // 使用 _buildPolygonGeoJSON 方法构建 GeoJSON，确保格式正确
                  const styleGeoJSON = self._buildPolygonGeoJSON(styleGeometries, styles)
                  // 确保 styleGeoJSON 包含正确的 features
                  if (styleGeoJSON && styleGeoJSON.features && styleGeoJSON.features.length > 0) {
                    src.setData(styleGeoJSON)
                  } else {
                    // 如果构建的 GeoJSON 为空，设置空的数据源
                    src.setData({
                      type: 'FeatureCollection',
                      features: []
                    })
                  }
                } else {
                  // 如果没有几何数据了，设置空的数据源（当 styleId 改变时，旧数据源需要清空）
                  const emptyGeoJSON = {
                    type: 'FeatureCollection',
                    features: []
                  }
                  src.setData(emptyGeoJSON)
                }
              } catch (error) {
                // 更新数据源失败，静默处理
              }
            }
          })
        },

        // 可见性控制 - 参照 MapboxGL.js 的实现
        setVisible: (visible) => {
          const visibility = visible ? 'visible' : 'none'
          createdLayers.forEach(layerId => {
            if (self.map.getLayer(layerId)) {
              self.map.setLayoutProperty(layerId, 'visibility', visibility)
            }
          })
        },
        getVisible: () => {
          if (createdLayers.length > 0 && self.map.getLayer(createdLayers[0])) {
            return self.map.getLayoutProperty(createdLayers[0], 'visibility') !== 'none'
          }
          return false
        },

        // 数据获取 - 参照 MapboxGL.js 的实现
        getGeometries: () => {
          return polygonGroup.geometries.map(geo => ({
            ...geo,
            paths: geo.properties?.originPaths || geo.paths  // 优先返回原始坐标
          }))
        },

        // 移除 - 参照 MapboxGL.js 的实现
        removePolygons: () => {
          [...createdLayers].reverse().forEach(layerId => {
            if (self.map?.getLayer(layerId)) {
              self.map.removeLayer(layerId)
            }
          })
          createdSources.forEach(sourceId => {
            if (self.map?.getSource(sourceId)) {
              self.map.removeSource(sourceId)
            }
          })
        },

        // 兼容方法
        remove: function() {
          return this.removePolygons()
        }
      }

      // 绑定事件（如果提供了回调函数）
      if (options.onClick) {
        polygonGroup.on('click', options.onClick)
      }
      if (options.onMouseEnter) {
        polygonGroup.on('mouseenter', options.onMouseEnter)
      }
      if (options.onMouseLeave) {
        polygonGroup.on('mouseleave', options.onMouseLeave)
      }

      // 存储多边形组实例
      this.polygons.set(groupId, polygonGroup)

      return polygonGroup

    } catch (error) {
      return null
    }
  }

  /**
   * 添加圆形 - 参照MineMap.js实现，兼容HTMap接口
   * @param {object} options - 圆形配置对象
   * @param {string} [options.id] - 圆形ID，不传则自动生成
   * @param {Array} options.center - 中心点坐标 [lng, lat]
   * @param {number} options.radius - 半径（米）
   * @param {number} [options.segments=64] - 分段数
   * @param {Array} [options.styles] - 样式配置数组
   * @param {number} [options.minZoom] - 最小缩放级别
   * @param {number} [options.maxZoom] - 最大缩放级别
   * @param {boolean} [options.clickable] - 是否可点击
   * @param {boolean} [options.hoverable] - 是否可悬停
   * @param {function} [options.onClick] - 点击回调
   * @param {function} [options.onMouseEnter] - 鼠标进入回调
   * @param {function} [options.onMouseLeave] - 鼠标离开回调
   * @returns {object} 圆形对象
   */
  addCircle(options) {
    if (!this.map) {
      return null
    }

    // 验证必要参数 - 参照MineMap.js的验证逻辑
    if (!options.center || !Array.isArray(options.center) || options.center.length < 2) {
      return null
    }

    if (!options.radius || typeof options.radius !== 'number' || options.radius <= 0) {
      return null
    }

    try {
      const self = this
      const circleId = options.id || `circle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const sourceId = `${circleId}-source`
      const layerId = `${circleId}-layer`

      // 创建圆形几何数据
      const circleGeometry = this._createCircleGeometry(options.center, options.radius, options.segments || 64)

      // 验证和标准化样式
      const validatedStyles = this._validatePolygonStyles(options.styles || [this._getDefaultPolygonStyle()])

      // 创建图层
      const layerResult = this._createPolygonLayers(layerId, sourceId, validatedStyles, [circleGeometry])
      const createdLayers = layerResult.layers
      const createdSources = layerResult.sources

      // 创建圆形组对象
      const circleGroup = this._createPolygonGroup(circleId, createdSources, createdLayers, [circleGeometry], validatedStyles, options)

      // 存储圆形实例
      this.polygons.set(circleId, circleGroup)

      // 绑定事件
      this._bindPolygonEvents(circleGroup, options)

      return circleGroup

    } catch (error) {
      return null
    }
  }

  /**
   * 验证多边形样式 - 完全参照MineMap.js实现
   * @param {Array} styles - 样式数组
   * @returns {Array} 验证后的样式数组
   * @private
   */
  _validatePolygonStyles(styles) {
    if (!Array.isArray(styles) || styles.length === 0) {
      return [this._getDefaultPolygonStyle()]
    }

    return styles.map((style, index) => {
      if (!style || typeof style !== 'object') {
        return this._getDefaultPolygonStyle()
      }

      return {
        id: style.id || `polygon_style_${index}`,
        color: style.color || style.fillColor || 'rgba(75,152,250,0.3)',
        borderColor: style.borderColor || style.strokeColor || 'rgba(75, 152, 250, 1)',
        borderWidth: Number(style.borderWidth || style.strokeWidth) || 2,
        borderDashArray: style.borderDashArray || style.strokeDashArray || null,
        // 扩展属性，保持向后兼容
        opacity: style.opacity || style.fillOpacity || 0.3,
        fillPattern: style.fillPattern || null,
        strokeLineCap: style.strokeLineCap || style.lineCap || 'round',
        strokeLineJoin: style.strokeLineJoin || style.lineJoin || 'round',
        zIndex: this._validateNumber(style.zIndex || style.z, 0),
        visible: style.visible !== false,
        interactive: style.interactive !== false,
        // 支持凸多边形参数，参照 MapboxGL.js 的实现
        isConvex: style.isConvex === true
      }
    })
  }

  /**
   * 验证透明度值
   * @param {number|string} value - 透明度值
   * @param {number} defaultValue - 默认值
   * @returns {number} 验证后的透明度值
   * @private
   */
  _validateOpacity(value, defaultValue) {
    const num = Number(value)
    if (isNaN(num) || num < 0 || num > 1) {
      return defaultValue
    }
    return num
  }

  /**
   * 验证数值
   * @param {number|string} value - 数值
   * @param {number} defaultValue - 默认值
   * @returns {number} 验证后的数值
   * @private
   */
  _validateNumber(value, defaultValue) {
    const num = Number(value)
    if (isNaN(num) || num < 0) {
      return defaultValue
    }
    return num
  }

  /**
   * 验证多边形几何数据 - 完全参照MapboxGL.js实现，支持样式参数
   * @param {Array} geometries - 几何数据数组
   * @param {Array} styles - 样式数组，用于自动分配 styleId
   * @returns {Array} 验证后的几何数据数组
   * @private
   */
  _validatePolygonGeometries(geometries, styles = []) {
    if (!Array.isArray(geometries)) {
      return []
    }

    return geometries.map((geometry, index) => {
      if (!geometry || typeof geometry !== 'object') {
        return null
      }

      // 获取路径数据
      let paths = geometry.paths || geometry.coordinates
      if (!Array.isArray(paths) || paths.length < 3) {
        return null
      }

      // 验证坐标点
      const validatedPaths = paths.map((coord, coordIndex) => {
        if (!Array.isArray(coord) || coord.length < 2) {
          return null
        }

        const lng = Number(coord[0])
        const lat = Number(coord[1])

        if (isNaN(lng) || isNaN(lat)) {
          return null
        }

        return [lng, lat]
      }).filter(coord => coord !== null)

      if (validatedPaths.length < 3) {
        return null
      }

      // 统一坐标转换
      const transformedPaths = validatedPaths.map((coord, coordIndex) => {
        return transformCoordinates(coord, `多边形几何验证-${index}-坐标点-${coordIndex}`)
      })

      // 自动闭合 ring（MapboxGL Polygon 需要闭合环），参照 MapboxGL.js 的实现
      const first = transformedPaths[0]
      const last = transformedPaths[transformedPaths.length - 1]
      if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
        transformedPaths.push([first[0], first[1]])
      }

      // styleId 兜底到第一个样式，参照 MapboxGL.js 的实现
      let styleId = geometry.styleId
      if (!styleId && styles.length > 0) {
        styleId = styles[0].id || `polygon_style_0`
      }

      return {
        id: geometry.id || `polygon_${index}`,
        paths: transformedPaths,
        properties: geometry.properties || {},
        styleId: styleId || null
      }
    }).filter(geometry => geometry !== null)
  }

  /**
   * 获取默认多边形样式 - 完全参照MineMap.js实现
   * @returns {object} 默认样式对象
   * @private
   */
  _getDefaultPolygonStyle() {
    return {
      id: 'default_polygon_style',
      color: 'rgba(75,152,250,0.3)',
      borderColor: 'rgba(75, 152, 250, 1)',
      borderWidth: 2,
      borderDashArray: null
    }
  }

  /**
   * 构建多边形 GeoJSON 数据 - 完全参照MapboxGL.js实现，支持凸多边形
   * @param {Array} geometries - 几何数据数组
   * @param {Array} styles - 样式数组，用于判断是否使用凸多边形
   * @returns {object} GeoJSON 数据
   * @private
   */
  _buildPolygonGeoJSON(geometries, styles = []) {
    // 创建样式查找函数，完全参照 MapboxGL.js 的实现
    const isConvexByStyleId = (id) => {
      return styles.find(style => style.id === id)?.isConvex
    }

    return {
      type: 'FeatureCollection',
      features: geometries.map(geometry => {
        // 完全参照 MapboxGL.js 的实现: coordinates: isConvexByStyleId(geometry.styleId) ? generateConvexPolygon(geometry.paths) : [geometry.paths]
        const coordinates = isConvexByStyleId(geometry.styleId) 
          ? generateConvexPolygon(geometry.paths) 
          : [geometry.paths]

        return {
          type: 'Feature',
          id: geometry.id,
          geometry: {
            type: 'Polygon',
            coordinates: coordinates
          },
          properties: {
            ...geometry.properties,
            id: geometry.id,
            styleId: geometry.styleId
          }
        }
      })
    }
  }

  /**
   * 创建圆形几何数据
   * @param {Array} center - 中心点坐标 [lng, lat]
   * @param {number} radius - 半径（米）
   * @param {number} segments - 分段数
   * @returns {object} 圆形几何数据
   * @private
   */
  _createCircleGeometry(center, radius, segments) {
    const [centerLng, centerLat] = transformCoordinates(center, 'createCircleGeometry')
    const points = []

    for (let i = 0; i < segments; i++) {
      const angle = (i * 360) / segments
      const radians = (angle * Math.PI) / 180
      
      // 简化的圆形计算（实际应用中可能需要更精确的地理计算）
      const offsetLng = (radius / 111320) * Math.cos(radians) // 粗略的经度偏移
      const offsetLat = (radius / 110540) * Math.sin(radians) // 粗略的纬度偏移
      
      points.push([centerLng + offsetLng, centerLat + offsetLat])
    }

    // 闭合多边形
    points.push(points[0])

    return {
      id: `circle_${Date.now()}`,
      paths: points,
      properties: { type: 'circle' },
      styleId: null
    }
  }

  /**
   * 创建多边形图层 - 完全参照MineMap.js实现
   * @param {string} layerId - 图层ID
   * @param {string} sourceId - 数据源ID
   * @param {Array} styles - 样式数组
   * @param {Array} geometries - 几何数据数组
   * @returns {object} 创建的图层信息
   * @private
   */
  _createPolygonLayers(layerId, sourceId, styles, geometries) {
    const createdLayers = []
    const createdSources = []

    // 为每个样式创建独立的数据源和图层
    styles.forEach((style, index) => {
      const styleId = style.id || `style_${index}`
      const styleSourceId = `${sourceId}-${styleId}`
      const currentLayerId = `${layerId}-${styleId}`

      // 筛选出使用当前样式的几何数据
      const styleGeometries = geometries.filter(geo => {
        if (geo.styleId) {
          return geo.styleId === styleId
        } else {
          // 如果没有指定styleId，按索引循环分配
          const geoIndex = geometries.indexOf(geo)
          return geoIndex % styles.length === index
        }
      })

      if (styleGeometries.length === 0) {
        return
      }

      // 为当前样式创建GeoJSON数据，传递样式数组以支持凸多边形
      const styleGeoJSON = this._buildPolygonGeoJSON(styleGeometries, styles)

      // 添加样式专用的数据源
      this.map.addSource(styleSourceId, {
        type: 'geojson',
        data: styleGeoJSON
      })
      createdSources.push(styleSourceId)

      // 填充图层
      this.map.addLayer({
        id: currentLayerId,
        type: 'fill',
        source: styleSourceId,
        paint: {
          'fill-color': style.color,
          'fill-opacity': style.opacity || 1
        }
      })
      createdLayers.push(currentLayerId)

      // 边框图层
      const borderLayerId = `${currentLayerId}-border`
      const borderPaint = {
        'line-color': style.borderColor,
        'line-width': style.borderWidth,
        'line-opacity': 1
      }

      // 如果有虚线样式，添加到配置中
      if (style.borderDashArray) {
        borderPaint['line-dasharray'] = style.borderDashArray
      }

      this.map.addLayer({
        id: borderLayerId,
        type: 'line',
        source: styleSourceId,
        paint: borderPaint
      })
      createdLayers.push(borderLayerId)
    })

    return {
      layers: createdLayers,
      sources: createdSources
    }
  }

  /**
   * 创建多边形组对象 - 参照MineMap.js实现
   * @param {string} id - 多边形组ID
   * @param {Array} createdSources - 创建的数据源数组
   * @param {Array} createdLayers - 创建的图层数组
   * @param {Array} geometries - 几何数据数组
   * @param {Array} styles - 样式数组
   * @param {object} options - 原始配置选项
   * @returns {object} 多边形组对象
   * @private
   */
  _createPolygonGroup(id, createdSources, createdLayers, geometries, styles, options) {
    const self = this

    return {
      id: id,
      sourceId: createdSources,
      layerId: createdLayers,
      geometries: geometries,
      styles: styles,
      options: options,

      // 事件绑定方法 - 参照MineMap.js实现
      on: function(eventType, callback) {
        if (typeof callback !== 'function') {
          return this
        }

        createdLayers.forEach(layerId => {
          if (self.map.on) {
            self.map.on(eventType, layerId, (event) => {
              try {
                // 构建事件数据
                const eventData = {
                  type: eventType,
                  target: this,
                  lngLat: event.lngLat,
                  point: event.point,
                  features: event.features,
                  originalEvent: event.originalEvent,
                  timestamp: Date.now()
                }
                callback(eventData)
              } catch (error) {
                // 事件回调执行失败，静默处理
              }
            })
          }
        })
        return this
      },

      // 解绑事件方法
      off: function(eventType, callback) {
        createdLayers.forEach(layerId => {
          if (self.map.off) {
            if (callback) {
              self.map.off(eventType, layerId, callback)
            } else {
              self.map.off(eventType, layerId)
            }
          }
        })
        return this
      },

      // 添加几何数据方法 - 参照MineMap.js实现
      addGeometries: (newGeometries) => {
        if (!Array.isArray(newGeometries)) return false

        const validatedGeometries = self._validatePolygonGeometries(newGeometries, styles)

        if (validatedGeometries.length > 0) {
          // 更新几何数据
          geometries.push(...validatedGeometries)

          // 为每个样式更新对应的数据源 - 参照MineMap.js的实现
          styles.forEach((style, index) => {
            const styleId = style.id || `style_${index}`
            const styleSourceId = `${id}-source-${styleId}`

            // 筛选出使用当前样式的几何数据
            const styleGeometries = geometries.filter(geo => {
              if (geo.styleId) {
                return geo.styleId === styleId
              } else {
                // 如果没有指定styleId，按索引循环分配
                const geoIndex = geometries.indexOf(geo)
                return geoIndex % styles.length === index
              }
            })

            if (styleGeometries.length > 0 && self.map.getSource(styleSourceId)) {
              const styleGeoJSON = self._buildPolygonGeoJSON(styleGeometries, styles)
              self.map.getSource(styleSourceId).setData(styleGeoJSON)
            }
          })

          return true
        }
        return false
      },

      // 删除几何数据方法 - 参照MineMap.js实现
      removeGeometries: (idsToDelete) => {
        if (!Array.isArray(idsToDelete)) return false

        // 过滤掉要删除的几何数据
        const originalLength = geometries.length
        geometries = geometries.filter(geo => !idsToDelete.includes(geo.id))

        if (geometries.length < originalLength) {
          // 为每个样式更新对应的数据源 - 参照MineMap.js的实现
          styles.forEach((style, index) => {
            const styleId = style.id || `style_${index}`
            const styleSourceId = `${id}-source-${styleId}`

            // 筛选出使用当前样式的几何数据
            const styleGeometries = geometries.filter(geo => {
              if (geo.styleId) {
                return geo.styleId === styleId
              } else {
                // 如果没有指定styleId，按索引循环分配
                const geoIndex = geometries.indexOf(geo)
                return geoIndex % styles.length === index
              }
            })

            if (self.map.getSource(styleSourceId)) {
              if (styleGeometries.length > 0) {
                const styleGeoJSON = self._buildPolygonGeoJSON(styleGeometries, styles)
                self.map.getSource(styleSourceId).setData(styleGeoJSON)
              } else {
                // 如果没有几何数据了，设置空的数据源
                const emptyGeoJSON = {
                  type: 'FeatureCollection',
                  features: []
                }
                self.map.getSource(styleSourceId).setData(emptyGeoJSON)
              }
            }
          })

          return true
        }
        return false
      },

      // 更新样式方法 - 参照MineMap.js实现
      updateStyles: (newStyles) => {
        if (!Array.isArray(newStyles) || newStyles.length === 0) {
          return false
        }

        // 验证新样式
        const validatedStyles = self._validatePolygonStyles(newStyles)
        
        // 更新样式引用
        styles.splice(0, styles.length, ...validatedStyles)

        // 为每个样式更新对应的数据源 - 参照MineMap.js的实现
        styles.forEach((style, index) => {
          const styleId = style.id || `style_${index}`
          const styleSourceId = `${id}-source-${styleId}`

          // 筛选出使用当前样式的几何数据
          const styleGeometries = geometries.filter(geo => {
            if (geo.styleId) {
              return geo.styleId === styleId
            } else {
              // 如果没有指定styleId，按索引循环分配
              const geoIndex = geometries.indexOf(geo)
              return geoIndex % styles.length === index
            }
          })

          if (styleGeometries.length > 0 && self.map.getSource(styleSourceId)) {
            const styleGeoJSON = self._buildPolygonGeoJSON(styleGeometries, styles)
            self.map.getSource(styleSourceId).setData(styleGeoJSON)
          }
        })

        return true
      },

      // 更新几何数据方法 - 参照MineMap.js实现
      updateGeometries: (newGeometries) => {
        if (!Array.isArray(newGeometries)) {
          return false
        }

        // 验证新几何数据
        const validatedGeometries = self._validatePolygonGeometries(newGeometries, styles)
        
        if (validatedGeometries.length === 0) {
          return false
        }

        // 更新几何数据引用
        geometries.splice(0, geometries.length, ...validatedGeometries)

        // 为每个样式更新对应的数据源 - 参照MineMap.js的实现
        styles.forEach((style, index) => {
          const styleId = style.id || `style_${index}`
          const styleSourceId = `${id}-source-${styleId}`

          // 筛选出使用当前样式的几何数据
          const styleGeometries = geometries.filter(geo => {
            if (geo.styleId) {
              return geo.styleId === styleId
            } else {
              // 如果没有指定styleId，按索引循环分配
              const geoIndex = geometries.indexOf(geo)
              return geoIndex % styles.length === index
            }
          })

          if (styleGeometries.length > 0 && self.map.getSource(styleSourceId)) {
            const styleGeoJSON = self._buildPolygonGeoJSON(styleGeometries, styles)
            self.map.getSource(styleSourceId).setData(styleGeoJSON)
          }
        })

        return true
      },

      // 设置可见性方法 - 与MineMap.js保持一致
      setVisible: function(visible) {
        try {
          const visibility = visible ? 'visible' : 'none'
          
          createdLayers.forEach(layerId => {
            try {
              if (self.map.getLayer(layerId)) {
                if (self.map.setLayoutProperty) {
                  self.map.setLayoutProperty(layerId, 'visibility', visibility)
                }
              }
            } catch (layerError) {
              // 设置图层可见性失败，静默处理
            }
          })
          
          return this
        } catch (error) {
          return this
        }
      },

      // 兼容性方法 - 保持向后兼容
      setVisibility: function(visible) {
        return this.setVisible(visible)
      },

      // 获取可见性方法 - 与MineMap.js保持一致
      getVisible: function() {
        if (!self.map) {
          return true
        }
        if (createdLayers.length > 0) {
          const layer = self.map.getLayer(createdLayers[0])
          return layer ? self.map.getLayoutProperty(createdLayers[0], 'visibility') === 'visible' : false
        }
        return true
      },

      // 兼容性方法 - 保持向后兼容
      getVisibility: function() {
        return this.getVisible()
      },

      // 获取几何数据方法 - 与MineMap.js保持一致
      getGeometries: function() {
        return geometries
      },

      // 移除方法
      remove: () => {
        try {
          // 移除所有图层
          createdLayers.forEach(layerId => {
            try {
              if (self.map.getLayer(layerId)) {
                self.map.removeLayer(layerId)
              }
            } catch (layerError) {
              // 移除图层失败，静默处理
            }
          })

          // 移除所有数据源
          createdSources.forEach(sourceId => {
            try {
              if (self.map.getSource(sourceId)) {
                self.map.removeSource(sourceId)
              }
            } catch (sourceError) {
              // 移除数据源失败，静默处理
            }
          })

          // 从图层管理中移除
          self.polygons.delete(id)

          return true
        } catch (error) {
          return false
        }
      },

      // HTMap.Polygons 兼容方法
      removePolygons: function() {
        return this.remove()
      }
    }
  }

  /**
   * 绑定多边形事件 - 参照MineMap.js实现
   * @param {object} polygonGroup - 多边形组对象
   * @param {object} options - 配置选项
   * @private
   */
  _bindPolygonEvents(polygonGroup, options) {
    if (!polygonGroup || !options) return

    // 绑定点击事件
    if (options.onClick && typeof options.onClick === 'function') {
      polygonGroup.on('click', (eventData) => {
        try {
          options.onClick(eventData)
        } catch (error) {
          // onClick回调执行失败，静默处理
        }
      })
    }

    // 绑定鼠标进入事件
    if (options.onMouseEnter && typeof options.onMouseEnter === 'function') {
      polygonGroup.on('mouseenter', (eventData) => {
        try {
          options.onMouseEnter(eventData)
        } catch (error) {
          // onMouseEnter回调执行失败，静默处理
        }
      })
    }

    // 绑定鼠标离开事件
    if (options.onMouseLeave && typeof options.onMouseLeave === 'function') {
      polygonGroup.on('mouseleave', (eventData) => {
        try {
          options.onMouseLeave(eventData)
        } catch (error) {
          // onMouseLeave回调执行失败，静默处理
        }
      })
    }

    // 绑定其他事件
    const eventMappings = {
      onMouseOver: 'mouseover',
      onMouseOut: 'mouseout',
      onContextMenu: 'contextmenu',
      onTouchStart: 'touchstart',
      onTouchEnd: 'touchend'
    }

    Object.keys(eventMappings).forEach(eventKey => {
      if (options[eventKey] && typeof options[eventKey] === 'function') {
        const eventType = eventMappings[eventKey]
        polygonGroup.on(eventType, (eventData) => {
          try {
            options[eventKey](eventData)
          } catch (error) {
            // 事件回调执行失败，静默处理
          }
        })
      }
    })
  }

  /**
   * 获取所有多边形
   * @returns {Array} 多边形列表
   */
  getAllPolygons() {
    return Array.from(this.polygons.values())
  }

  /**
   * 根据ID获取多边形
   * @param {string} id - 多边形ID
   * @returns {object} 多边形对象
   */
  getPolygon(id) {
    return this.polygons.get(id)
  }

  /**
   * 移除指定多边形
   * @param {string} id - 多边形ID
   * @returns {boolean} 是否成功移除
   */
  removePolygon(id) {
    if (!id) {
      return false
    }

    const polygon = this.polygons.get(id)
    if (polygon) {
      const result = polygon.remove()
      return result
    } else {
      return false
    }
  }

  /**
   * 清除所有多边形
   * @returns {boolean} 是否成功清除
   */
  clearAllPolygons() {
    if (this.polygons.size === 0) {
      return true
    }

    let successCount = 0
    let totalCount = this.polygons.size

    this.polygons.forEach((polygon, id) => {
      try {
        const result = polygon.remove()
        if (result) {
          successCount++
        }
        } catch (error) {
          // 清除多边形失败，静默处理
        }
    })

    this.polygons.clear()
    return successCount === totalCount
  }

  /**
   * 批量移除多边形
   * @param {Array} polygonIds - 多边形ID数组
   * @returns {boolean} 是否成功移除
   */
  removePolygons(polygonIds) {
    if (!Array.isArray(polygonIds) || polygonIds.length === 0) {
      return false
    }

    let successCount = 0
    let totalCount = polygonIds.length

    polygonIds.forEach(polygonId => {
      if (this.removePolygon(polygonId)) {
        successCount++
      }
    })

    return successCount === totalCount
  }

  /**
   * 更新多边形样式
   * @param {string} polygonId - 多边形ID
   * @param {Array} newStyles - 新样式数组
   */
  updatePolygonStyles(polygonId, newStyles) {
    const polygon = this.polygons.get(polygonId)
    if (polygon && polygon.updateStyles) {
      polygon.updateStyles(newStyles)
    }
  }

  /**
   * 更新多边形几何数据
   * @param {string} polygonId - 多边形ID
   * @param {Array} newGeometries - 新几何数据数组
   */
  updatePolygonGeometries(polygonId, newGeometries) {
    const polygon = this.polygons.get(polygonId)
    if (polygon && polygon.updateGeometries) {
      polygon.updateGeometries(newGeometries)
    }
  }

  /**
   * 显示/隐藏多边形
   * @param {string} polygonId - 多边形ID
   * @param {boolean} visible - 是否显示
   * @returns {boolean} 是否成功设置
   */
  setPolygonVisibility(polygonId, visible) {
    if (!polygonId) {
      return false
    }

    const polygon = this.polygons.get(polygonId)
    if (polygon && polygon.setVisible) {
      try {
        polygon.setVisible(visible)
        return true
      } catch (error) {
        return false
      }
    } else {
      return false
    }
  }

  /**
   * 获取多边形信息
   * @param {string} polygonId - 多边形ID
   * @returns {object|null} 多边形信息
   */
  getPolygonInfo(polygonId) {
    const polygon = this.polygons.get(polygonId)
    if (polygon) {
      return {
        id: polygon.id,
        geometriesCount: polygon.geometries.length,
        stylesCount: polygon.styles.length,
        layersCount: polygon.layerId.length,
        sourcesCount: polygon.sourceId.length
      }
    }
    return null
  }

  /**
   * 检查多边形是否存在
   * @param {string} polygonId - 多边形ID
   * @returns {boolean} 是否存在
   */
  hasPolygon(polygonId) {
    return this.polygons.has(polygonId)
  }

  /**
   * 获取多边形数量
   * @returns {number} 多边形数量
   */
  getPolygonCount() {
    return this.polygons.size
  }

  /**
   * 调试方法：检查地图状态
   * @param {string} polygonId - 多边形ID
   */
  debugPolygon(polygonId) {
    const polygon = this.polygons.get(polygonId)
    if (!polygon) {
      return
    }
  }

  /**
   * 强制刷新多边形显示
   * @param {string} polygonId - 多边形ID
   */
  refreshPolygon(polygonId) {
    const polygon = this.polygons.get(polygonId)
    if (!polygon) {
      return false
    }

    try {
      // 重新创建图层
      const layerResult = this._createPolygonLayers(
        `${polygonId}-layer`, 
        `${polygonId}-source`, 
        polygon.styles, 
        polygon.geometries
      )
      
      // 更新引用
      polygon.layerId.splice(0, polygon.layerId.length, ...layerResult.layers)
      polygon.sourceId.splice(0, polygon.sourceId.length, ...layerResult.sources)
      
      return true
    } catch (error) {
      return false
    }
  }
}
