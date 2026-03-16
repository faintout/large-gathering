import { transformCoordinates } from '../utils/index.js'
import { calculateDistance, calculateControlPoint, generateCurvePoints } from '../../../utils/toolUtils.js'

/**
 * 线条管理器
 * 负责管理所有线条相关的功能
 * 参照MineMap.js实现，兼容HTMap接口
 */
export default class LinesManager {
  constructor(mapInstance) {
    this.map = mapInstance.map
    this.lines = new Map()
  }

  /**
   * 添加线段组 - 参照MineMap.js实现，支持箭头功能，兼容HTMap.js
   * @param {object} options - 线段配置
   * @returns {object} 线段组实例
   */
  addLines(options) {
    if (!this.map) {
      console.warn('LinesManager.addLines: 地图未初始化')
      return null
    }

    // 验证必要参数 - 参照 MapboxGL.js 的实现，允许空样式数组（使用默认样式）
    if (!options.geometries || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      return null
    }

    const sourceId = `${options.id}-source`
    const layerId = `${options.id}-layer`

    try {
      // 验证和标准化样式数据 - 参照MineMap.js实现
      const validatedStyles = this._validateLineStyles(options.styles)
      
      // 验证和标准化几何数据 - 参照MineMap.js实现
      const validatedGeometries = this._validateLineGeometries(options.geometries)

      // 判断是否绘制曲线的辅助函数 - 参照 MapboxGL.js 的实现
      const isCurveByStyleId = (id) => validatedStyles.find(style => style.id === id)?.isCurve === true

      if (validatedGeometries.length === 0) {
        console.error('LinesManager.addLines: 没有有效的几何数据')
        return null
      }

      // 为没有指定styleId的几何数据分配样式ID - 参照MineMap.js实现
      validatedGeometries.forEach((geometry, index) => {
        if (!geometry.styleId) {
          const styleIndex = index % validatedStyles.length
          geometry.styleId = validatedStyles[styleIndex].id || `line_style_${styleIndex}`
        }
        // 确保 styleId 与样式数组中的 id 匹配
        const matchedStyle = validatedStyles.find(s => s.id === geometry.styleId)
        if (!matchedStyle) {
          // 如果找不到匹配的样式，使用第一个样式
          geometry.styleId = validatedStyles[0].id || 'default_line_style'
        }
      })

      // 构建 GeoJSON 数据 - 支持曲线绘制，参照 MapboxGL.js 的实现
      const geojsonData = {
        type: 'FeatureCollection',
        features: validatedGeometries.map(geometry => {
          // 确保 styleId 存在且有效
          const finalStyleId = geometry.styleId || validatedStyles[0].id || 'default_line_style'
          return {
            type: 'Feature',
            id: geometry.id,
            geometry: {
              type: 'LineString',
              // 根据参数判断是否绘制曲线
              coordinates: isCurveByStyleId(finalStyleId) ? this._generateCurveFeatures(geometry.paths) : geometry.paths
            },
            properties: {
              ...geometry.properties,
              id: geometry.id,
              styleId: finalStyleId
            }
          }
        })
      }

      // 添加数据源 - 参照 MapboxGL.js 的实现
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId)
      }
      // MineMap 可能不支持 dynamic 属性，先尝试不添加
      try {
        this.map.addSource(sourceId, {
          type: 'geojson',
          data: geojsonData
        })
      } catch (error) {
        // 如果失败，尝试添加 dynamic 属性
        try {
          this.map.addSource(sourceId, {
            type: 'geojson',
            data: geojsonData,
            dynamic: true
          })
        } catch (error2) {
          console.error('LinesManager.addLines: 添加数据源失败:', error2)
          return null
        }
      }

      // 确保数据源已添加
      if (!this.map.getSource(sourceId)) {
        console.error('LinesManager.addLines: 数据源添加失败', sourceId)
        return null
      }

      // 创建图层 - 参照MineMap.js实现
      const createdLayers = this._createLineLayers(layerId, sourceId, validatedStyles, validatedGeometries)
      
      // 确保至少创建了一个图层
      if (!createdLayers || createdLayers.length === 0) {
        console.error('LinesManager.addLines: 未创建任何图层')
        return null
      }

      // 创建线段组对象 - 参照MineMap.js实现
      const lineGroup = this._createLineGroup(options.id, sourceId, createdLayers, validatedGeometries, validatedStyles, geojsonData, options)

      // 添加到图层管理
      this.lines.set(options.id, lineGroup)

      return lineGroup

    } catch (error) {
      console.error('LinesManager.addLines: 添加线段失败:', error)
      return null
    }
  }

  /**
   * 验证和标准化线段样式数据 - 参照MineMap.js实现
   * @param {Array} styles - 样式数组
   * @returns {Array} 验证后的样式数组
   * @private
   */
  _validateLineStyles(styles) {
    // 参照 MapboxGL.js 的实现，静默处理空样式数组，不输出警告
    if (!Array.isArray(styles) || styles.length === 0) {
      return [this._getDefaultLineStyle()]
    }

    return styles.map((style, index) => {
      const validated = {
        id: style.id || `line_style_${index}`,
        color: style.color || '#4b98fa',
        width: Number(style.width) || 6,
        opacity: Number(style.opacity) || 1,
        borderColor: style.borderColor || null,
        borderWidth: Number(style.borderWidth) || 0,
        lineJoin: style.lineJoin || 'round',
        lineCap: style.lineCap || 'round',
        dashArray: style.dashArray || [0, 0],
        emitLight: style.emitLight || false,
        dirArrows: style.dirArrows || false,
        dirAnimate: style.dirAnimate || null,
        arrowColor: style.arrowColor || style.color || '#4b98fa',
        arrowSize: Number(style.arrowSize) || 0.7,
        // 支持曲线参数，参照 MapboxGL.js 的实现
        isCurve: style.isCurve === true
      }

      // 数据逻辑判断：检查是否使用了虚线（非实线）
      const isDashArray = Array.isArray(validated.dashArray) && 
        !((validated.dashArray.length === 2 && validated.dashArray[0] === 0 && validated.dashArray[1] === 0))
      
      // 处理 dashArray 和 dirAnimate 的冲突：dirAnimate 优先级更高
      if (validated.dirAnimate && isDashArray) {
        validated.dashArray = [0, 0] // 设为实线
      }

      return validated
    })
  }

  /**
   * 验证和标准化线段几何数据 - 参照MineMap.js实现
   * @param {Array} geometries - 几何数据数组
   * @returns {Array} 验证后的几何数据数组
   * @private
   */
  _validateLineGeometries(geometries) {
    if (!Array.isArray(geometries)) {
      return []
    }

    return geometries.map((geometry, index) => {
      if (!geometry.paths || !Array.isArray(geometry.paths) || geometry.paths.length < 2) {
        return null
      }

      // 统一坐标转换 - 为每个坐标点单独转换
      const transformedPaths = geometry.paths.map((coord, coordIndex) => {
        return transformCoordinates(coord, `线段几何验证-${index}-坐标点-${coordIndex}`)
      })

      return {
        id: geometry.id || `line_${index}`,
        paths: transformedPaths,
        properties: geometry.properties || {},
        styleId: geometry.styleId || null
      }
    }).filter(Boolean)
  }

  /**
   * 获取默认线段样式 - 参照MineMap.js实现
   * @returns {object} 默认样式
   * @private
   */
  _getDefaultLineStyle() {
    return {
      id: 'default_line_style',
      color: '#4b98fa',
      width: 6,
      opacity: 1,
      borderColor: null,
      borderWidth: 0,
      lineJoin: 'round',
      lineCap: 'round',
      dashArray: [0, 0],
      emitLight: false,
      dirArrows: false,
      dirAnimate: null,
      // 支持曲线参数，参照 MapboxGL.js 的实现
      isCurve: false
    }
  }

  /**
   * 创建线段图层 - 参照MineMap.js实现
   * @param {string} layerId - 图层ID
   * @param {string} sourceId - 数据源ID
   * @param {Array} styles - 样式数组
   * @param {Array} geometries - 几何数据数组
   * @returns {Array} 创建的图层ID数组
   * @private
   */
  _createLineLayers(layerId, sourceId, styles, geometries) {
    // 参照 MapboxGL.js 的实现，不创建基础图层，直接为每个样式创建图层
    const createdLayers = []
    styles.forEach((style, idx) => {
      const styleLayerIdBase = `${layerId}-${style.id || idx}`

      // 可选描边层（置于主线层下方）
      if (style.borderColor && Number(style.borderWidth) > 0) {
        const outlineId = `${styleLayerIdBase}-outline`
        this.map.addLayer({
          id: outlineId,
          type: 'line',
          source: sourceId,
          filter: ['==', ['get', 'styleId'], style.id || `line_style_${idx}`],
          layout: {
            'line-join': style.lineJoin || 'round',
            'line-cap': style.lineCap || 'round'
          },
          paint: {
            'line-color': style.borderColor,
            // 外轮廓宽度 = 主线宽度 + 边框宽度（避免过厚）
            'line-width': (Number(style.width) || 6) + (Number(style.borderWidth) || 0),
            'line-opacity': style.opacity != null ? Number(style.opacity) : 1,
            ...(style.emitLight ? { 'line-blur': 1.5 } : {})
          }
        })
        createdLayers.push(outlineId)
      }

      // 主线层
      const mainId = `${styleLayerIdBase}`
      const paint = {
        'line-color': style.color,
        'line-width': Number(style.width) || 6,
        'line-opacity': style.opacity != null ? Number(style.opacity) : 1,
        ...(style.emitLight ? { 'line-blur': 1 } : {})
      }
      // 仅当 dashArray 合法且不全为 0 时设置
      if (Array.isArray(style.dashArray) && style.dashArray.length === 2 &&
        (Number(style.dashArray[0]) !== 0 || Number(style.dashArray[1]) !== 0)) {
        paint['line-dasharray'] = [Number(style.dashArray[0]), Number(style.dashArray[1])]
      }

      this.map.addLayer({
        id: mainId,
        type: 'line',
        source: sourceId,
        filter: ['==', ['get', 'styleId'], style.id || `line_style_${idx}`],
        layout: {
          'line-join': style.lineJoin || 'round',
          'line-cap': style.lineCap || 'round'
        },
        paint
      })
      createdLayers.push(mainId)

      // 如果启用了方向箭头，添加符号图层
      if (style.dirArrows) {
        const arrowId = `${styleLayerIdBase}-arrows`

        // 确保箭头图标已加载
        this._ensureArrowIcon().then(() => {
          this.map.addLayer({
            id: arrowId,
            type: 'symbol',
            source: sourceId,
            filter: ['==', ['get', 'styleId'], style.id || `line_style_${idx}`],
            layout: {
              'icon-allow-overlap': true,
              'icon-image': 'arrow',  // 使用箭头图标
              'symbol-placement': 'line',
              'icon-size': 0.7,
              'symbol-spacing': style.dirAnimate?.space || 100,
              'icon-rotation-alignment': 'map'
            },
            paint: {
              'icon-color': style.color || '#4b98fa'
            }
          })
          createdLayers.push(arrowId)
        }).catch(error => {
          console.warn('LinesManager._createLineLayers: 加载箭头图标失败:', error)
        })
      }
    })

    return createdLayers
  }

  /**
   * 生成曲线坐标点 - 参照 MapboxGL.js 的实现
   * @param {Array} geometries - 几何数据数组（坐标点数组）
   * @returns {Array} 曲线坐标点数组
   * @private
   */
  _generateCurveFeatures(geometries) {
    const features = []
    // 为每个坐标数组生成线段
    for (let i = 0; i < geometries.length - 1; i++) {
      const startPoint = geometries[i]
      const endPoint = geometries[i + 1]
      
      // 计算两点之间的距离
      const distance = calculateDistance(startPoint, endPoint)
      
      // 计算控制点（曲线最高点）
      const controlPoint = calculateControlPoint(startPoint, endPoint, distance)
      
      // 生成曲线坐标点
      const curvePoints = generateCurvePoints(startPoint, endPoint, controlPoint)
      
      // 合并曲线点（移除重复的中间点）
      if (i === 0) {
        features.push(...curvePoints)
      } else {
        // 跳过第一个点（与上一段的最后一个点重复）
        features.push(...curvePoints.slice(1))
      }
    }
    return features
  }

  /**
   * 确保箭头图标已加载到地图中 - 参照MineMap.js实现
   * @returns {Promise} 加载Promise
   * @private
   */
  _ensureArrowIcon() {
    return new Promise((resolve, reject) => {
      // 检查图标是否已经存在
      if (this.map.hasImage('arrow')) {
        resolve()
        return
      }

      try {
        // 创建简单的箭头图标
        const canvas = document.createElement('canvas')
        canvas.width = 20
        canvas.height = 20
        const ctx = canvas.getContext('2d')

        // 绘制类似 > 的简单箭头
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // 绘制 > 形状的箭头
        ctx.beginPath()
        ctx.moveTo(6, 5)    // 左上角起点
        ctx.lineTo(14, 10)  // 箭头尖端（中心右侧）
        ctx.lineTo(6, 15)   // 左下角终点
        ctx.stroke()

        // 添加图标到地图
        const imageData = ctx.getImageData(0, 0, 20, 20)
        this.map.addImage('arrow', imageData)
        resolve()
      } catch (error) {
        console.error('LinesManager._ensureArrowIcon: 创建箭头图标失败:', error)
        reject(error)
      }
    })
  }

  /**
   * 创建线段组对象 - 参照MineMap.js实现
   * @param {string} id - 线段组ID
   * @param {string} sourceId - 数据源ID
   * @param {Array} createdLayers - 创建的图层数组
   * @param {Array} geometries - 几何数据数组
   * @param {Array} styles - 样式数组
   * @param {object} geojsonData - GeoJSON数据
   * @param {object} options - 选项
   * @returns {object} 线段组对象
   * @private
   */
  _createLineGroup(id, sourceId, createdLayers, geometries, styles, geojsonData, options) {
    const self = this
    // 判断是否绘制曲线的辅助函数 - 参照 MapboxGL.js 的实现
    const isCurveByStyleId = (styleId) => styles.find(style => style.id === styleId)?.isCurve === true

    return {
      id: id,
      sourceId: sourceId,
      layerId: createdLayers,
      geometries: geometries,
      styles: styles,
      geojsonData: geojsonData,

      // 事件绑定方法（为每个样式图层绑定） - 参照MineMap.js实现
      on: (eventType, callback) => {
        if (Array.isArray(createdLayers)) {
          createdLayers.forEach(lid => {
            self._bindLineEvents(lid, sourceId, geometries, eventType, callback)
          })
        } else {
          self._bindLineEvents(createdLayers, sourceId, geometries, eventType, callback)
        }
      },

      // 解绑事件方法 - 参照MineMap.js实现
      off: (eventType) => {
        if (Array.isArray(createdLayers)) {
          createdLayers.forEach(layerId => {
            if (self.map.off) {
              self.map.off(eventType, layerId)
            }
          })
        } else {
          if (self.map.off) {
            self.map.off(eventType, createdLayers)
          }
        }
      },

      // 添加几何数据方法 - 参照MineMap.js实现，支持曲线绘制
      addGeometries: (newGeometries) => {
        const validatedNewGeometries = self._validateLineGeometries(newGeometries)
        if (validatedNewGeometries.length > 0) {
          const updatedGeometries = [...(geometries || []), ...validatedNewGeometries]
          const updatedGeojsonData = {
            type: 'FeatureCollection',
            features: updatedGeometries.map(geometry => ({
              type: 'Feature',
              id: geometry.id,
              geometry: {
                type: 'LineString',
                // 根据参数判断是否绘制曲线
                coordinates: isCurveByStyleId(geometry.styleId) ? self._generateCurveFeatures(geometry.paths) : geometry.paths
              },
              properties: {
                ...geometry.properties,
                styleId: geometry.styleId
              }
            }))
          }
          if (self.map.getSource(sourceId)) {
            self.map.getSource(sourceId).setData(updatedGeojsonData)
            geometries = updatedGeometries
          }
        }
      },

      // 删除几何数据方法 - 参照MineMap.js实现，支持曲线绘制
      removeGeometries: (idsToDelete) => {
        if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) {
          return false
        }
        const prev = geometries || []
        const filtered = prev.filter(geo => !idsToDelete.includes(geo.id))
        if (filtered.length !== prev.length) {
          const updatedGeojsonData = {
            type: 'FeatureCollection',
            features: filtered.map(geometry => ({
              type: 'Feature',
              id: geometry.id,
              geometry: {
                type: 'LineString',
                // 根据参数判断是否绘制曲线
                coordinates: isCurveByStyleId(geometry.styleId) ? self._generateCurveFeatures(geometry.paths) : geometry.paths
              },
              properties: {
                ...geometry.properties,
                styleId: geometry.styleId
              }
            }))
          }
          if (self.map.getSource(sourceId)) {
            self.map.getSource(sourceId).setData(updatedGeojsonData)
            geometries = filtered
          }
          return true
        }
        return false
      },

      // 更新几何数据方法 - 参照MineMap.js实现，支持曲线绘制
      updateLinesGeometries: (updatedGeometries) => {
        const validatedUpdatedGeometries = self._validateLineGeometries(updatedGeometries)
        const updatedGeometriesMap = new Map()
        validatedUpdatedGeometries.forEach(geo => {
          updatedGeometriesMap.set(geo.id, geo)
        })
        const baseGeometries = geometries || []
        // 更新几何数据，如果 styleId 为空则保留原有的 styleId - 参照 MapboxGL.js 的实现
        const finalGeometries = baseGeometries.map(geo => {
          const updated = updatedGeometriesMap.get(geo.id)
          if (updated) {
            // 如果更新数据没有传 styleId 或者为空，则使用原来的 styleId
            return {
              ...updated,
              styleId: updated.styleId || geo.styleId
            }
          }
          return geo
        })
        const updatedGeojsonData = {
          type: 'FeatureCollection',
          features: finalGeometries.map(geometry => ({
            type: 'Feature',
            id: geometry.id,
            geometry: {
              type: 'LineString',
              // 根据参数判断是否绘制曲线
              coordinates: isCurveByStyleId(geometry.styleId) ? self._generateCurveFeatures(geometry.paths) : geometry.paths
            },
            properties: {
              ...geometry.properties,
              styleId: geometry.styleId
            }
          }))
        }
        if (self.map.getSource(sourceId)) {
          self.map.getSource(sourceId).setData(updatedGeojsonData)
          geometries = finalGeometries
        }
      },

      // 设置可见性（作用于所有样式图层） - 参照MineMap.js实现
      setVisible: (visible) => {
        const visibility = visible ? 'visible' : 'none'
        if (Array.isArray(createdLayers)) {
          createdLayers.forEach(layerId => {
            if (self.map.getLayer(layerId)) {
              self.map.setLayoutProperty(layerId, 'visibility', visibility)
            }
          })
        }
      },

      // 获取可见性 - 参照MineMap.js实现
      getVisible: () => {
        if (Array.isArray(createdLayers) && createdLayers.length > 0) {
          const firstLayer = self.map.getLayer(createdLayers[0])
          return firstLayer ? self.map.getLayoutProperty(createdLayers[0], 'visibility') !== 'none' : true
        }
        return true
      },

      // 获取所有几何数据的方法 - 参照MineMap.js实现
      getGeometries: () => {
        return geometries || []
      },

      // 移除方法 - 参照MineMap.js实现
      remove: () => {
        try {
          // 移除所有图层
          if (Array.isArray(createdLayers)) {
            createdLayers.forEach(layerId => {
              try {
                if (self.map.getLayer(layerId)) {
                  self.map.removeLayer(layerId)
                }
              } catch (error) {
                console.warn(`LinesManager.remove: 移除图层 ${layerId} 失败:`, error)
              }
            })
          }
          
          // 移除数据源
          if (self.map.getSource(sourceId)) {
            self.map.removeSource(sourceId)
          }
          
          // 清理图标资源
          styles.forEach((style, index) => {
            if (style.dirArrows) {
              const arrowId = `${id}-layer-${style.id || index}-arrows`
              try {
                if (self.map.hasImage && self.map.hasImage('arrow')) {
                  // 注意：这里不移除全局的arrow图标，因为可能被其他线段使用
                }
              } catch (error) {
                console.warn(`LinesManager.remove: 清理箭头图标失败:`, error)
              }
            }
          })
          
          // 从图层管理中移除
          self.lines.delete(id)
          
        } catch (error) {
          console.error('LinesManager.remove: 移除线段失败:', error)
        }
      },

      // HTMap.Lines 兼容方法 - 移除所有线段 - 参照MineMap.js实现
      removeLines: () => {
        try {
          // 移除所有图层
          if (Array.isArray(createdLayers)) {
            createdLayers.forEach(layerId => {
              try {
                if (self.map.getLayer(layerId)) {
                  self.map.removeLayer(layerId)
                }
              } catch (error) {
                console.warn(`LinesManager.removeLines: 移除图层 ${layerId} 失败:`, error)
              }
            })
          }

          // 移除数据源
          if (self.map.getSource(sourceId)) {
            self.map.removeSource(sourceId)
          }

          // 清理图标资源
          styles.forEach((style, index) => {
            if (style.dirArrows) {
              const arrowId = `${createdLayers[0]}-${style.id || index}-arrows`
              try {
                if (self.map.hasImage && self.map.hasImage('arrow')) {
                  // 注意：这里不移除全局的arrow图标，因为可能被其他线段使用
                }
              } catch (error) {
                console.warn(`LinesManager.removeLines: 清理箭头图标失败:`, error)
              }
            }
          })
          
          // 从图层管理中移除
          self.lines.delete(id)
          
        } catch (error) {
          console.error('LinesManager.removeLines: 移除线段失败:', error)
        }
      }
    }
  }

  /**
   * 绑定线段事件 - 参照MineMap.js实现
   * @param {string} layerId - 图层ID
   * @param {string} sourceId - 数据源ID
   * @param {Array} geometries - 几何数据数组
   * @param {string} eventType - 事件类型
   * @param {Function} callback - 回调函数
   * @private
   */
  _bindLineEvents(layerId, sourceId, geometries, eventType, callback) {
    if (!this.map || !this.map.on) {
      console.warn('LinesManager._bindLineEvents: 地图实例不支持事件绑定')
      return
    }

    this.map.on(eventType, layerId, (e) => {
      if (e && e.features && e.features.length > 0) {
        const feature = e.features[0]
        const geometryId = feature.properties.id
        const geometry = geometries.find(geo => geo.id === geometryId)
        
        if (geometry) {
          // 构造事件数据
          const eventData = {
            type: eventType,
            geometry: geometry,
            feature: feature,
            lngLat: e.lngLat,
            point: e.point,
            originalEvent: e.originalEvent
          }
          
          callback(eventData)
        }
      }
    })
  }

  /**
   * 获取所有线段
   * @returns {Array} 线段列表
   */
  getAllLines() {
    return Array.from(this.lines.values())
  }

  /**
   * 根据ID获取线段
   * @param {string} id - 线段ID
   * @returns {object} 线段对象
   */
  getLine(id) {
    return this.lines.get(id)
  }

  /**
   * 移除指定线段
   * @param {string} id - 线段ID
   */
  removeLine(id) {
    const line = this.lines.get(id)
    if (line) {
      line.remove()
    }
  }

  /**
   * 清除所有线段
   */
  clearAllLines() {
    this.lines.forEach((line, id) => {
      line.remove()
    })
    this.lines.clear()
  }

  /**
   * 设置线段可见性
   * @param {string} id - 线段ID
   * @param {boolean} visible - 是否可见
   */
  setLineVisibility(id, visible) {
    const line = this.lines.get(id)
    if (line && typeof line.setVisible === 'function') {
      line.setVisible(visible)
    }
  }

  /**
   * 隐藏线段
   * @param {string} id - 线段ID
   */
  hideLine(id) {
    this.setLineVisibility(id, false)
  }

  /**
   * 显示线段
   * @param {string} id - 线段ID
   */
  showLine(id) {
    this.setLineVisibility(id, true)
  }

  /**
   * 更新线段样式
   * @param {string} id - 线段ID
   * @param {Array} styles - 新样式数组
   */
  updateLineStyles(id, styles) {
    const line = this.lines.get(id)
    if (line && typeof line.updateStyles === 'function') {
      line.updateStyles(styles)
    }
  }

  /**
   * 获取线段信息
   * @param {string} id - 线段ID
   * @returns {object} 线段信息
   */
  getLineInfo(id) {
    const line = this.lines.get(id)
    if (line) {
      return {
        id: line.id,
        geometries: line.getGeometries ? line.getGeometries() : [],
        visible: line.getVisible ? line.getVisible() : true,
        styles: line.styles || []
      }
    }
    return null
  }

  /**
   * 检查线段是否存在
   * @param {string} id - 线段ID
   * @returns {boolean} 是否存在
   */
  hasLine(id) {
    return this.lines.has(id)
  }

  /**
   * 获取线段数量
   * @returns {number} 线段数量
   */
  getLineCount() {
    return this.lines.size
  }
}
