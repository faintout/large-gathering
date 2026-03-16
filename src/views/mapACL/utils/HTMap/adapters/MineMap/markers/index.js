import { parseCoordinates, transformCoordinates, convertOffset, normalizeGeometries, generateMarkerId, validateMarkerOptions } from '../utils/index.js'

/**
 * 标记点管理器 - 兼容 HTMap 接口
 * 支持单个和批量标记点管理
 */
export default class MarkerManager {
  constructor(mapInstance) {
    this.map = mapInstance.map
    this.markers = new Map()
    this.draggableMarkers = new Map()
    // 缓存图片尺寸信息，避免重复加载
    this.imageSizeCache = new Map()
  }

  /**
   * 批量添加标记点 - 使用 GeoJSON 数据源方式
   * @param {object} options - 标记点配置
   * @returns {object} 标记点组对象
   */
  addMarkers(options) {
    if (!this.map) return null
    
    // 验证必需参数
    if (!options.geometries || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      return null
    }

    const sourceId = `${options.id}-source`
    const layerId = `${options.id}-layer`
    const styles = options.styles || []

    try {
      // 标准化几何数据 - 支持多种坐标格式
      const normalizedGeometries = this._normalizeGeometries(options.geometries, options.styles)

      // 构建 GeoJSON 数据
      const geojsonData = {
        type: 'FeatureCollection',
        features: options.geometries.map(geometry => ({
          type: 'Feature',
          id: geometry.id,
          geometry: {
            type: 'Point',
            coordinates: this._transformCoordinates(geometry.lngLat, 'addMarkers-GeoJSON')
          },
          properties: {
            ...geometry.properties,
            id: geometry.id,
            styleId: geometry.styleId
          }
        }))
      }

      // 添加数据源
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData
      })

      // 根据配置选择不同的渲染方式
      if (options.contentDom) {
        // 使用自定义DOM方式
        return this._addMarkersWithContentDom(options, sourceId, layerId, geojsonData, normalizedGeometries)
      } else if (options.styles && options.styles.length > 0) {
        // 使用样式图标方式
        return this._addMarkersWithStyles(options, sourceId, layerId, geojsonData, normalizedGeometries)
      } else {
        // 使用默认标记点方式
        return this._addMarkersWithDefault(options, sourceId, layerId, geojsonData, normalizedGeometries)
      }
    } catch (error) {
      return null
    }
  }

  /**
   * 使用样式图标方式添加标记点
   * @param {object} options - 标记点配置
   * @param {string} sourceId - 数据源ID
   * @param {string} layerId - 图层ID
   * @param {object} geojsonData - GeoJSON数据
   * @param {Array} normalizedGeometries - 标准化后的几何数据
   * @returns {object} 标记点实例
   * @private
   */
  _addMarkersWithStyles(options, sourceId, layerId, geojsonData, normalizedGeometries) {
    const self = this
    const styles = options.styles || []
    const createdLayers = []

    // 为每个样式创建图标加载Promise
    const iconLoadPromises = styles.map((style, index) => {
      return new Promise((resolve, reject) => {
        const styleLayerId = `${layerId}-style-${style.id || index}`
        const iconId = `${options.id}-icon-${style.id || index}`

        // 检查图标是否已经存在
        if (self.map.hasImage(iconId)) {
          // 如果图标已存在，从缓存中获取真实尺寸
          const imageSrc = style.src || '/src/utils/HTMap/assets/img/defaultPin.png'
          const cachedSize = self.imageSizeCache.get(imageSrc)
          
          if (cachedSize) {
            // 使用缓存的尺寸
            resolve({ 
              style, 
              index, 
              styleLayerId, 
              iconId, 
              width: cachedSize.width, 
              height: cachedSize.height 
            })
            return
          }
          
          // 如果缓存中没有，创建一个临时图片来获取真实尺寸
          const tempImg = new Image()
          tempImg.onload = () => {
            // 缓存尺寸信息
            self.imageSizeCache.set(imageSrc, {
              width: tempImg.width,
              height: tempImg.height
            })
            
            resolve({ 
              style, 
              index, 
              styleLayerId, 
              iconId, 
              width: tempImg.width, 
              height: tempImg.height 
            })
          }
          tempImg.onerror = () => {
            // 如果无法获取真实尺寸，使用默认值并缓存
            const defaultSize = {
              width: style.width || 32,
              height: style.height || 40
            }
            self.imageSizeCache.set(imageSrc, defaultSize)
            
            resolve({ 
              style, 
              index, 
              styleLayerId, 
              iconId, 
              width: defaultSize.width, 
              height: defaultSize.height 
            })
          }
          tempImg.src = imageSrc
          return
        }

        // 加载图标
        const img = new Image()
        img.onload = () => {
          try {
            if (!self.map.hasImage(iconId)) {
              self.map.addImage(iconId, img)
            }
            
            // 缓存图片尺寸信息
            const imageSrc = style.src || '/src/utils/HTMap/assets/img/defaultPin.png'
            self.imageSizeCache.set(imageSrc, {
              width: img.width,
              height: img.height
            })
            
            // 返回图标信息，包括实际尺寸
            resolve({ 
              style, 
              index, 
              styleLayerId, 
              iconId, 
              width: img.width, 
              height: img.height 
            })
          } catch (error) {
            reject(error)
          }
        }
        img.onerror = () => {
          reject(new Error(`图标加载失败: ${style.src}`))
        }
        img.src = style.src || '/src/utils/HTMap/assets/img/defaultPin.png'
      })
    })

      // 等待所有图标加载完成后再创建图层
      return Promise.all(iconLoadPromises).then(iconData => {
        // 声明事件管理器变量，在 if-else 块外可访问
        let eventManager = null
        
        // 如果启用拖拽功能，添加拖拽支持
        if (options.draggable) {
          // 在拖拽模式下，隐藏图层标记点以避免重复显示
          iconData.forEach(({ style, index, styleLayerId, iconId, width, height }) => {
            // 计算正确的 icon-size，参照 MineMap.js 的实现
            const iconSize = (style.width / width) || 1
            // 优化偏移量计算，确保偏移量按图标缩放比例调整
            const originalOffset = style.offset || [0, 0]
            style.offset = [originalOffset[0] / iconSize, originalOffset[1] / iconSize]
            
    self.map.addLayer({
              id: styleLayerId,
      type: 'symbol',
      source: sourceId,
              filter: ['==', ['get', 'styleId'], style.id || `style_${index}`],
      layout: {
                'icon-image': iconId,
                'icon-size': iconSize, // 使用动态计算的正确大小
                'icon-anchor': options.anchor || style.anchor || 'bottom',
        'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-rotation-alignment': style.faceForward === 'lieFlat' ? 'map' : 'viewport',
                'icon-rotate': ['case',
                  ['has', 'rotation'],
                  ['get', 'rotation'],
                  style.rotation || 0
                ],
                'icon-offset': self._convertOffset(options.offset || style.offset || [0, 0]),
                'visibility': 'none' // 隐藏图层标记点
              },
              paint: {
                'icon-opacity': style.opacity || 1
              },
              minzoom: options.minZoom || style.minZoom || 0,
              maxzoom: options.maxZoom || style.maxZoom || 24
            })
            createdLayers.push(styleLayerId)
          })
          
          // 存储拖拽标记点信息，用于事件管理器绑定DOM事件
          const draggableMarkerInfos = []
          
          // 为每个标记点创建可拖拽的 Marker 实例
          normalizedGeometries.forEach(geometry => {
            // 获取对应的样式配置
            const geometryStyle = styles.find(style => style.id === geometry.styleId) || styles[0] || {}

            const markerElement = document.createElement('div')
            markerElement.style.width = `${geometryStyle.width || 40}px`
            markerElement.style.height = `${geometryStyle.height || 40}px`
            markerElement.style.backgroundImage = `url(${geometryStyle.src || '/src/utils/HTMap/assets/img/defaultPin.png'})`
            markerElement.style.backgroundSize = '100% 100%'  // 完全填充容器，确保图片显示完整
            markerElement.style.backgroundRepeat = 'no-repeat'
            markerElement.style.cursor = 'grab'
            markerElement.style.pointerEvents = 'auto'
            markerElement.className = 'ht-map-marker ht-map-marker-draggable'

            // 应用偏移量 - 优先使用options.offset，然后是geometryStyle.offset，默认为[0,0]
            const offset = self._convertOffset(options.offset || geometryStyle.offset || [0, 0])

            const draggableMarker = new minemap.Marker({
              element: markerElement,
              draggable: true,
              anchor: options.anchor || geometryStyle.anchor || 'bottom',
              offset: offset
      })
              .setLngLat(geometry.coordinates)
        .addTo(self.map)

            // 存储拖拽标记点引用
            if (!self.draggableMarkers) {
              self.draggableMarkers = new Map()
            }
            self.draggableMarkers.set(geometry.id, draggableMarker)
            
            // 存储标记点信息，用于事件管理器
            draggableMarkerInfos.push({
              id: geometry.id,
              element: markerElement,
              coordinates: geometry.coordinates,
              properties: geometry.properties || {},
              styleId: geometry.styleId,
              marker: draggableMarker,
              isDraggable: true,  // 标识为拖拽标记点
              geometry: geometry  // 存储原始几何数据，用于事件回调
            })
          })
          
          // 创建事件管理器（样式图标方式 - 拖拽模式）
          // 传入 draggableMarkerInfos 以便绑定 DOM 事件
          eventManager = self._createMarkerEventManager(createdLayers, sourceId, normalizedGeometries, draggableMarkerInfos)
          
          // 在事件管理器创建后，绑定拖拽事件，使其能够通过事件管理器触发
          draggableMarkerInfos.forEach(markerInfo => {
            const draggableMarker = markerInfo.marker
            const markerElement = markerInfo.element
            const geometry = markerInfo.geometry
            
            // 绑定 dragstart 事件
            draggableMarker.on('dragstart', () => {
              markerElement.style.cursor = 'grabbing'
              const lngLat = draggableMarker.getLngLat()
              
              // 创建标准格式的事件数据
              const eventData = {
                type: 'dragstart',
                target: markerElement,
                lngLat: lngLat,
                latLng: { lng: lngLat.lng, lat: lngLat.lat },
                point: { x: 0, y: 0 },
                originalEvent: null,
                marker: geometry,
                markerInstance: geometry,
                geometry: {
                  id: geometry.id,
                  properties: geometry.properties || {},
                  coordinates: [lngLat.lng, lngLat.lat],
                  styleId: geometry.styleId
                },
                properties: geometry.properties || {},
                id: geometry.id,
                coordinates: [lngLat.lng, lngLat.lat],
                layerId: null,
                sourceId: sourceId,
                timestamp: Date.now()
              }
              
              // 通过事件管理器触发事件
              if (eventManager && typeof eventManager._triggerEvent === 'function') {
                eventManager._triggerEvent('dragstart', eventData)
              }
              
              // 向后兼容：支持 options 回调
              if (options.onDragStart) {
                options.onDragStart({
                  geometry: geometry,
                  lngLat: lngLat
                })
              }
            })

            // 绑定 drag 事件
            draggableMarker.on('drag', () => {
              const lngLat = draggableMarker.getLngLat()
              
              // 创建标准格式的事件数据
              const eventData = {
                type: 'drag',
                target: markerElement,
                lngLat: lngLat,
                latLng: { lng: lngLat.lng, lat: lngLat.lat },
                point: { x: 0, y: 0 },
                originalEvent: null,
                marker: geometry,
                markerInstance: geometry,
                geometry: {
                  id: geometry.id,
                  properties: geometry.properties || {},
                  coordinates: [lngLat.lng, lngLat.lat],
                  styleId: geometry.styleId
                },
                properties: geometry.properties || {},
                id: geometry.id,
                coordinates: [lngLat.lng, lngLat.lat],
                layerId: null,
                sourceId: sourceId,
                timestamp: Date.now()
              }
              
              // 通过事件管理器触发事件
              if (eventManager && typeof eventManager._triggerEvent === 'function') {
                eventManager._triggerEvent('drag', eventData)
              }
              
              // 向后兼容：支持 options 回调
              if (options.onDrag) {
                options.onDrag({
                  geometry: geometry,
                  lngLat: lngLat
                })
              }
            })

            // 绑定 dragend 事件
            draggableMarker.on('dragend', () => {
              markerElement.style.cursor = 'grab'
              const lngLat = draggableMarker.getLngLat()
              
              // 创建标准格式的事件数据
              const eventData = {
                type: 'dragend',
                target: markerElement,
                lngLat: lngLat,
                latLng: { lng: lngLat.lng, lat: lngLat.lat },
                point: { x: 0, y: 0 },
                originalEvent: null,
                marker: geometry,
                markerInstance: geometry,
                geometry: {
                  id: geometry.id,
                  properties: geometry.properties || {},
                  coordinates: [lngLat.lng, lngLat.lat],
                  styleId: geometry.styleId
                },
                properties: geometry.properties || {},
                id: geometry.id,
                coordinates: [lngLat.lng, lngLat.lat],
                layerId: null,
                sourceId: sourceId,
                timestamp: Date.now()
              }
              
              // 通过事件管理器触发事件
              if (eventManager && typeof eventManager._triggerEvent === 'function') {
                eventManager._triggerEvent('dragend', eventData)
              }
              
              // 向后兼容：支持 options 回调
              if (options.onDragEnd) {
                options.onDragEnd({
                  geometry: geometry,
                  lngLat: lngLat
                })
              }
            })
          })
        } else {
          // 为每个样式创建单独的图层
          iconData.forEach(({ style, index, styleLayerId, iconId, width, height }) => {
            try {
              // 计算正确的 icon-size
              const iconSize = (style.width / width) || 1
              // 优化偏移量计算，确保偏移量按图标缩放比例调整
              const originalOffset = style.offset || [0, 0]
              style.offset = [originalOffset[0] / iconSize, originalOffset[1] / iconSize]
              self.map.addLayer({
                id: styleLayerId,
                type: 'symbol',
                source: sourceId,
                filter: ['==', ['get', 'styleId'], style.id || `style_${index}`],
                layout: {
                  'icon-image': iconId,
                  'icon-size': iconSize,
                  'icon-anchor': options.anchor || style.anchor || 'bottom',
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                  'icon-rotation-alignment': style.faceForward === 'lieFlat' ? 'map' : 'viewport',
                  'icon-rotate': ['case',
                    ['has', 'rotation'],
                    ['get', 'rotation'],
                    style.rotation || 0
                  ],
                  'icon-offset': self._convertOffset(options.offset || style.offset || [0, 0])
                },
                paint: {
                  'icon-opacity': style.opacity || 1
                },
                minzoom: options.minZoom || style.minZoom || 0,
                maxzoom: options.maxZoom || style.maxZoom || 24
              })

              createdLayers.push(styleLayerId)
            } catch (error) {
            }
          })
          
          // 创建事件管理器（样式图标方式 - 非拖拽模式）
          // 非拖拽模式下，标记点通过地图图层显示，所以传入 null 作为 markers 参数
          eventManager = self._createMarkerEventManager(createdLayers, sourceId, normalizedGeometries, null)
        }

      // 创建标记组对象
    const markerGroup = {
      id: options.id,
        sourceId: sourceId,
        layerIds: createdLayers,
        geometries: normalizedGeometries,
        styles: styles,
        
        // 移除标记组
        remove: () => {
          try {
            // 如果是拖拽模式，先移除所有拖拽标记点
            if (options.draggable && self.draggableMarkers) {
              normalizedGeometries.forEach(geometry => {
                const draggableMarker = self.draggableMarkers.get(geometry.id)
                if (draggableMarker && typeof draggableMarker.remove === 'function') {
                  draggableMarker.remove()
                }
                self.draggableMarkers.delete(geometry.id)
              })
            }
            
            // 移除所有图层
            createdLayers.forEach(layerId => {
              if (self.map.getLayer(layerId)) {
                self.map.removeLayer(layerId)
              }
            })
            
            // 移除数据源
            if (self.map.getSource(sourceId)) {
              self.map.removeSource(sourceId)
            }
            
          return true
          } catch (error) {
        return false
          }
        },
        
        // HTMap兼容的移除方法
        removeMarkers: () => {
          try {
            // 如果是拖拽模式，先移除所有拖拽标记点
            if (options.draggable && self.draggableMarkers) {
              normalizedGeometries.forEach(geometry => {
                const draggableMarker = self.draggableMarkers.get(geometry.id)
                if (draggableMarker && typeof draggableMarker.remove === 'function') {
                  draggableMarker.remove()
                }
                self.draggableMarkers.delete(geometry.id)
              })
            }
            
            // 移除所有图层
            createdLayers.forEach(layerId => {
              if (self.map.getLayer(layerId)) {
                self.map.removeLayer(layerId)
              }
            })
            
            // 移除数据源
            if (self.map.getSource(sourceId)) {
              self.map.removeSource(sourceId)
            }
            
            return true
          } catch (error) {
            return false
          }
        },
        
        // 更新标记组数据
        updateData: (newGeometries) => {
          try {
            const newGeojsonData = {
            type: 'FeatureCollection',
              features: newGeometries.map(geometry => ({
              type: 'Feature',
              id: geometry.id,
              geometry: {
                type: 'Point',
                  coordinates: self._transformCoordinates(geometry.lngLat || geometry.coordinates, 'updateData-GeoJSON')
              },
              properties: {
                ...geometry.properties,
                  id: geometry.id,
                  styleId: geometry.styleId
              }
            }))
          }

            const source = self.map.getSource(sourceId)
            if (source && source.setData) {
              source.setData(newGeojsonData)
          return true
        }
        return false
          } catch (error) {
            return false
          }
        },
        
        // 获取标记组信息
        getInfo: () => {
          return {
            id: options.id,
            sourceId: sourceId,
            layerIds: createdLayers,
            geometryCount: normalizedGeometries.length,
            styleCount: styles.length
          }
      },
      
      // 设置可见性
      setVisible: (visible) => {
          if (options.draggable && self.draggableMarkers) {
            // 拖拽模式下，控制拖拽标记点的可见性
            normalizedGeometries.forEach(geometry => {
              const draggableMarker = self.draggableMarkers.get(geometry.id)
              if (draggableMarker && draggableMarker.getElement) {
                const element = draggableMarker.getElement()
                if (element) {
                  element.style.display = visible ? 'block' : 'none'
                }
              }
            })
          } else {
            // 非拖拽模式下，控制图层可见性
        const visibility = visible ? 'visible' : 'none'
            createdLayers.forEach(layerId => {
        if (self.map.getLayer(layerId)) {
                self.map.setLayoutProperty(layerId, 'visibility', visibility)
              }
            })
          }
      },

      // 获取可见性
      getVisible: () => {
          if (options.draggable && self.draggableMarkers) {
            // 拖拽模式下，检查第一个拖拽标记点的可见性
            const firstGeometry = normalizedGeometries[0]
            if (firstGeometry) {
              const draggableMarker = self.draggableMarkers.get(firstGeometry.id)
              if (draggableMarker && draggableMarker.getElement) {
                const element = draggableMarker.getElement()
                return element ? element.style.display !== 'none' : true
              }
        }
        return true
          } else {
            // 非拖拽模式下，检查图层可见性
            if (createdLayers.length > 0) {
              const firstLayer = self.map.getLayer(createdLayers[0])
              return firstLayer ? self.map.getLayoutProperty(createdLayers[0], 'visibility') !== 'none' : true
        }
        return true
          }
        },
        
        // 获取拖拽标记点
        getDraggableMarkers: () => {
          if (!options.draggable || !self.draggableMarkers) {
            return new Map()
          }
          return self.draggableMarkers
        },
        
        // 事件绑定方法 - 仿照 MineMap.js 实现
        bindEvents: (eventHandlers) => {
          if (eventManager) {
            eventManager.bindEvents(eventHandlers)
          }
        },
        
        // 事件监听器方法 - 支持 markers.on('click', fun) 方式调用
        on: (event, callback) => {
          if (eventManager) {
            eventManager.on(event, callback)
          }
        },
        
        off: (event, callback) => {
          if (eventManager) {
            eventManager.off(event, callback)
          }
        },
        
        once: (event, callback) => {
          if (eventManager) {
            eventManager.once(event, callback)
          }
      },
      
      // 事件管理器引用
        eventManager: eventManager
    }

    return markerGroup
    }).catch(error => {
            return null
    })
  }

  /**
   * 使用默认标记点方式添加标记点
   * @param {object} options - 标记点配置
   * @param {string} sourceId - 数据源ID
   * @param {string} layerId - 图层ID
   * @param {object} geojsonData - GeoJSON数据
   * @param {Array} normalizedGeometries - 标准化后的几何数据
   * @returns {object} 标记点实例
   * @private
   */
  _addMarkersWithDefault(options, sourceId, layerId, geojsonData, normalizedGeometries) {
    const self = this
    
    try {
      // 如果启用拖拽功能，添加拖拽支持
      if (options.draggable) {
        // 在拖拽模式下，隐藏图层标记点以避免重复显示
        self.map.addLayer({
          id: layerId,
          type: 'symbol',
          source: sourceId,
          layout: {
            'icon-image': 'default-pin',
            'icon-size': 1.0,
            'icon-anchor': options.anchor || 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-offset': self._convertOffset(options.offset || [0, 0]),
            'visibility': 'none' // 隐藏图层标记点
          },
          paint: {
            'icon-opacity': 1
          },
          minzoom: options.minZoom || style.minZoom || 0,
          maxzoom: options.maxZoom || style.maxZoom || 24
        })
        
        // 存储拖拽标记点信息，用于事件管理器绑定DOM事件
        const draggableMarkerInfos = []
        
        // 为每个标记点创建可拖拽的 Marker 实例
        normalizedGeometries.forEach(geometry => {
          const markerElement = document.createElement('div')
          // 使用 options 中的 width 和 height，如果没有则使用默认值
          const width = options.width || 32
          const height = options.height || 40
          markerElement.style.width = `${width}px`
          markerElement.style.height = `${height}px`
          markerElement.style.backgroundImage = `url('data:image/svg+xml;base64,${self._getDefaultPinBase64()}')`
          markerElement.style.backgroundSize = '100% 100%'
          markerElement.style.backgroundRepeat = 'no-repeat'
          markerElement.style.cursor = 'grab'
          markerElement.style.pointerEvents = 'auto'
          markerElement.className = 'ht-map-marker ht-map-marker-draggable'

          // 应用偏移量，默认为[0,0]
          const offset = self._convertOffset(options.offset || [0, 0])

          const draggableMarker = new minemap.Marker({
              element: markerElement,
            draggable: true,
              anchor: options.anchor || 'bottom',
            offset: offset
            })
            .setLngLat(geometry.coordinates)
              .addTo(self.map)

          // 存储拖拽标记点引用
          if (!self.draggableMarkers) {
            self.draggableMarkers = new Map()
          }
          self.draggableMarkers.set(geometry.id, draggableMarker)
          
          // 存储标记点信息，用于事件管理器
          draggableMarkerInfos.push({
            id: geometry.id,
            element: markerElement,
            coordinates: geometry.coordinates,
            properties: geometry.properties || {},
            styleId: null,
            marker: draggableMarker,
            isDraggable: true,  // 标识为拖拽标记点
            geometry: geometry  // 存储原始几何数据，用于事件回调
          })
        })
        
        // 创建事件管理器（默认标记点方式 - 拖拽模式）
        // 传入 draggableMarkerInfos 以便绑定 DOM 事件
        const eventManager = self._createMarkerEventManager([layerId], sourceId, normalizedGeometries, draggableMarkerInfos)
        
        // 在事件管理器创建后，绑定拖拽事件，使其能够通过事件管理器触发
        draggableMarkerInfos.forEach(markerInfo => {
          const draggableMarker = markerInfo.marker
          const markerElement = markerInfo.element
          const geometry = markerInfo.geometry
          
          // 绑定 dragstart 事件
          draggableMarker.on('dragstart', () => {
            markerElement.style.cursor = 'grabbing'
            const lngLat = draggableMarker.getLngLat()
            
            // 创建标准格式的事件数据
            const eventData = {
              type: 'dragstart',
              target: markerElement,
              lngLat: lngLat,
              latLng: { lng: lngLat.lng, lat: lngLat.lat },
              point: { x: 0, y: 0 },
              originalEvent: null,
              marker: geometry,
              markerInstance: geometry,
              geometry: {
                id: geometry.id,
                properties: geometry.properties || {},
                coordinates: [lngLat.lng, lngLat.lat],
                styleId: geometry.styleId
              },
              properties: geometry.properties || {},
              id: geometry.id,
              coordinates: [lngLat.lng, lngLat.lat],
              layerId: layerId,
              sourceId: sourceId,
              timestamp: Date.now()
            }
            
            // 通过事件管理器触发事件
            if (eventManager && typeof eventManager._triggerEvent === 'function') {
              eventManager._triggerEvent('dragstart', eventData)
            }
            
            // 向后兼容：支持 options 回调
            if (options.onDragStart) {
              options.onDragStart({
                geometry: geometry,
                lngLat: lngLat
              })
            }
          })

          // 绑定 drag 事件
          draggableMarker.on('drag', () => {
            const lngLat = draggableMarker.getLngLat()
            
            // 创建标准格式的事件数据
            const eventData = {
              type: 'drag',
              target: markerElement,
              lngLat: lngLat,
              latLng: { lng: lngLat.lng, lat: lngLat.lat },
              point: { x: 0, y: 0 },
              originalEvent: null,
              marker: geometry,
              markerInstance: geometry,
              geometry: {
                id: geometry.id,
                properties: geometry.properties || {},
                coordinates: [lngLat.lng, lngLat.lat],
                styleId: geometry.styleId
              },
              properties: geometry.properties || {},
              id: geometry.id,
              coordinates: [lngLat.lng, lngLat.lat],
              layerId: layerId,
              sourceId: sourceId,
              timestamp: Date.now()
            }
            
            // 通过事件管理器触发事件
            if (eventManager && typeof eventManager._triggerEvent === 'function') {
              eventManager._triggerEvent('drag', eventData)
            }
            
            // 向后兼容：支持 options 回调
            if (options.onDrag) {
              options.onDrag({
                geometry: geometry,
                lngLat: lngLat
              })
            }
          })

          // 绑定 dragend 事件
          draggableMarker.on('dragend', () => {
            markerElement.style.cursor = 'grab'
            const lngLat = draggableMarker.getLngLat()
            
            // 创建标准格式的事件数据
            const eventData = {
              type: 'dragend',
              target: markerElement,
              lngLat: lngLat,
              latLng: { lng: lngLat.lng, lat: lngLat.lat },
              point: { x: 0, y: 0 },
              originalEvent: null,
              marker: geometry,
              markerInstance: geometry,
              geometry: {
                id: geometry.id,
                properties: geometry.properties || {},
                coordinates: [lngLat.lng, lngLat.lat],
                styleId: geometry.styleId
              },
              properties: geometry.properties || {},
              id: geometry.id,
              coordinates: [lngLat.lng, lngLat.lat],
              layerId: layerId,
              sourceId: sourceId,
              timestamp: Date.now()
            }
            
            // 通过事件管理器触发事件
            if (eventManager && typeof eventManager._triggerEvent === 'function') {
              eventManager._triggerEvent('dragend', eventData)
            }
            
            // 向后兼容：支持 options 回调
            if (options.onDragEnd) {
              options.onDragEnd({
                geometry: geometry,
                lngLat: lngLat
              })
            }
          })
        })
      } else {
        // 创建默认标记点图层
        // 计算 icon-size，参照 MineMap.js 的实现
        const defaultWidth = 32  // 默认pin的实际宽度
        const defaultHeight = 40  // 默认pin的实际高度
        const targetWidth = options.width || defaultWidth
        const targetHeight = options.height || defaultHeight
        const iconSize = Math.max(targetWidth / defaultWidth, targetHeight / defaultHeight)
        // 优化偏移量计算，确保偏移量按图标缩放比例调整
        const originalOffset = options.offset || [0, 0]
        style.offset = [originalOffset[0] / iconSize, originalOffset[1] / iconSize]
        
        self.map.addLayer({
          id: layerId,
          type: 'symbol',
          source: sourceId,
          layout: {
            'icon-image': 'default-pin',
            'icon-size': iconSize, // 使用动态计算的正确大小
            'icon-anchor': options.anchor || 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-offset': self._convertOffset(options.offset || [0, 0])
          },
          paint: {
            'icon-opacity': 1
          },
          minzoom: options.minZoom || style.minZoom || 0,
          maxzoom: options.maxZoom || style.maxZoom || 24
        })
      }

      // 创建事件管理器（默认标记点方式）
      const eventManager = self._createMarkerEventManager([layerId], sourceId, normalizedGeometries, null)

      // 创建标记组对象
      const markerGroup = {
        id: options.id,
        sourceId: sourceId,
        layerIds: [layerId],
        geometries: normalizedGeometries,
        styles: [],
        
      remove: () => {
          try {
            // 如果是拖拽模式，先移除所有拖拽标记点
            if (options.draggable && self.draggableMarkers) {
              normalizedGeometries.forEach(geometry => {
                const draggableMarker = self.draggableMarkers.get(geometry.id)
                if (draggableMarker && typeof draggableMarker.remove === 'function') {
                  draggableMarker.remove()
                }
                self.draggableMarkers.delete(geometry.id)
              })
            }
            
        if (self.map.getLayer(layerId)) {
          self.map.removeLayer(layerId)
        }
        if (self.map.getSource(sourceId)) {
          self.map.removeSource(sourceId)
        }
            return true
          } catch (error) {
            return false
          }
        },
        
        // HTMap兼容的移除方法
      removeMarkers: () => {
          try {
            // 如果是拖拽模式，先移除所有拖拽标记点
            if (options.draggable && self.draggableMarkers) {
              normalizedGeometries.forEach(geometry => {
                const draggableMarker = self.draggableMarkers.get(geometry.id)
                if (draggableMarker && typeof draggableMarker.remove === 'function') {
                  draggableMarker.remove()
                }
                self.draggableMarkers.delete(geometry.id)
              })
            }
            
        if (self.map.getLayer(layerId)) {
          self.map.removeLayer(layerId)
        }
        if (self.map.getSource(sourceId)) {
          self.map.removeSource(sourceId)
        }
            return true
          } catch (error) {
            return false
          }
        },
        
        updateData: (newGeometries) => {
          try {
            const newGeojsonData = {
          type: 'FeatureCollection',
              features: newGeometries.map(geometry => ({
            type: 'Feature',
            id: geometry.id,
            geometry: {
              type: 'Point',
                  coordinates: self._transformCoordinates(geometry.lngLat || geometry.coordinates, 'updateData-GeoJSON')
            },
            properties: {
              ...geometry.properties,
              id: geometry.id
            }
          }))
        }

            const source = self.map.getSource(sourceId)
            if (source && source.setData) {
              source.setData(newGeojsonData)
              return true
            }
            return false
          } catch (error) {
            return false
          }
        },
        
        getInfo: () => {
          return {
            id: options.id,
            sourceId: sourceId,
            layerIds: [layerId],
            geometryCount: normalizedGeometries.length,
            styleCount: 0
          }
      },
      
      // 设置可见性
      setVisible: (visible) => {
          if (options.draggable && self.draggableMarkers) {
            // 拖拽模式下，控制拖拽标记点的可见性
            normalizedGeometries.forEach(geometry => {
              const draggableMarker = self.draggableMarkers.get(geometry.id)
              if (draggableMarker && draggableMarker.getElement) {
                const element = draggableMarker.getElement()
                if (element) {
        element.style.display = visible ? 'block' : 'none'
                }
              }
            })
          } else {
            // 非拖拽模式下，控制图层可见性
            const visibility = visible ? 'visible' : 'none'
            if (self.map.getLayer(layerId)) {
              self.map.setLayoutProperty(layerId, 'visibility', visibility)
            }
          }
      },

      // 获取可见性
      getVisible: () => {
          if (options.draggable && self.draggableMarkers) {
            // 拖拽模式下，检查第一个拖拽标记点的可见性
            const firstGeometry = normalizedGeometries[0]
            if (firstGeometry) {
              const draggableMarker = self.draggableMarkers.get(firstGeometry.id)
              if (draggableMarker && draggableMarker.getElement) {
                const element = draggableMarker.getElement()
                return element ? element.style.display !== 'none' : true
              }
        }
        return true
          } else {
            // 非拖拽模式下，检查图层可见性
            const layer = self.map.getLayer(layerId)
            return layer ? self.map.getLayoutProperty(layerId, 'visibility') !== 'none' : true
          }
        },
        
        // 获取拖拽标记点
        getDraggableMarkers: () => {
          if (!options.draggable || !self.draggableMarkers) {
            return new Map()
          }
          return self.draggableMarkers
        },
        
        // 事件绑定方法 - 仿照 MineMap.js 实现
        bindEvents: (eventHandlers) => {
          if (eventManager) {
            eventManager.bindEvents(eventHandlers)
          }
        },
        
        // 事件监听器方法 - 支持 markers.on('click', fun) 方式调用
        on: (event, callback) => {
          if (eventManager) {
            eventManager.on(event, callback)
          }
        },
        
        off: (event, callback) => {
          if (eventManager) {
            eventManager.off(event, callback)
          }
        },
        
        once: (event, callback) => {
          if (eventManager) {
            eventManager.once(event, callback)
          }
        },
        
        // 事件管理器引用
        eventManager: eventManager
      }

      return markerGroup
              } catch (error) {
      return null
    }
  }

  /**
   * 使用自定义DOM方式添加标记点
   * @param {object} options - 标记点配置
   * @param {string} sourceId - 数据源ID
   * @param {string} layerId - 图层ID
   * @param {object} geojsonData - GeoJSON数据
   * @param {Array} normalizedGeometries - 标准化后的几何数据
   * @returns {object} 标记点实例
   * @private
   */
  _addMarkersWithContentDom(options, sourceId, layerId, geojsonData, normalizedGeometries) {
    const self = this
    const createdMarkers = []

    try {
      // 获取缩放范围参数
      const minZoom = options.minZoom !== undefined ? Number(options.minZoom) : 0
      const maxZoom = options.maxZoom !== undefined ? Number(options.maxZoom) : 24
      
      // 获取当前缩放级别
      const currentZoom = self.map.getZoom ? self.map.getZoom() : 0
      
      // 缩放可见性控制函数
      const updateMarkersVisibility = () => {
        if (!self.map) return
        
        const zoom = self.map.getZoom ? self.map.getZoom() : 0
        const shouldShow = zoom >= minZoom && zoom <= maxZoom
        
        createdMarkers.forEach(markerInfo => {
          if (markerInfo.element) {
            markerInfo.element.style.display = shouldShow ? 'block' : 'none'
          }
        })
      }
      
      // 为每个几何数据创建自定义DOM标记点
      normalizedGeometries.forEach(geometry => {
        const markerElement = options.contentDom.cloneNode(true)
        // markerElement.style.width = `${options.width || 40}px`
        // markerElement.style.height = `${options.height || 40}px`
        markerElement.style.cursor = 'pointer'
        markerElement.classList.add('ht-map-marker', 'ht-map-marker-custom')
        
        // 根据当前缩放级别设置初始可见性
        const shouldShow = currentZoom >= minZoom && currentZoom <= maxZoom
        markerElement.style.display = shouldShow ? 'block' : 'none'

        const marker = new minemap.Marker({
          element: markerElement,
          draggable: options.draggable || false,
          anchor: options.anchor || 'bottom',
          offset: self._convertOffset(options.domOffset || [0, 0])
        })
          .setLngLat(geometry.coordinates)
          .addTo(self.map)

        createdMarkers.push({
          id: geometry.id,
          marker: marker,
          element: markerElement,
          coordinates: geometry.coordinates,
          properties: geometry.properties
        })
      })
      
      // 监听地图缩放事件，控制标记点显示/隐藏
      const zoomHandler = () => {
        updateMarkersVisibility()
      }
      const moveEndHandler = () => {
        updateMarkersVisibility()
      }
      
      if (self.map && self.map.on) {
        self.map.on('zoom', zoomHandler)
        self.map.on('moveend', moveEndHandler)
      }

      // 创建事件管理器（自定义DOM方式）
      const eventManager = self._createMarkerEventManager([], sourceId, normalizedGeometries, createdMarkers)

      // 创建标记组对象
      const markerGroup = {
        id: options.id,
        sourceId: sourceId,
        layerIds: [],
        geometries: normalizedGeometries,
        styles: [],
        markers: createdMarkers,
        
        remove: () => {
          try {
            // 清理缩放事件监听器
            if (self.map && self.map.off) {
              self.map.off('zoom', zoomHandler)
              self.map.off('moveend', moveEndHandler)
            }
            
            // 移除所有自定义DOM标记点
            createdMarkers.forEach(markerInfo => {
              markerInfo.marker.remove()
            })
            
            // 移除数据源
            if (self.map.getSource(sourceId)) {
              self.map.removeSource(sourceId)
            }
            
            return true
              } catch (error) {
            return false
          }
        },
        
        // HTMap兼容的移除方法
        removeMarkers: () => {
          try {
            // 清理缩放事件监听器
            if (self.map && self.map.off) {
              self.map.off('zoom', zoomHandler)
              self.map.off('moveend', moveEndHandler)
            }
            
            // 移除所有自定义DOM标记点
            createdMarkers.forEach(markerInfo => {
              markerInfo.marker.remove()
            })
        
        // 移除数据源
        if (self.map.getSource(sourceId)) {
          self.map.removeSource(sourceId)
        }
        
            return true
              } catch (error) {
            return false
          }
        },
        
        updateData: (newGeometries) => {
          try {
            // 更新每个标记点的位置
            newGeometries.forEach((geometry, index) => {
              if (createdMarkers[index]) {
                const newCoords = self._transformCoordinates(geometry.lngLat || geometry.coordinates, 'updateData-Coordinates')
                createdMarkers[index].marker.setLngLat(newCoords)
                createdMarkers[index].coordinates = newCoords
              }
            })
            
            return true
          } catch (error) {
            return false
          }
        },
        
        getInfo: () => {
    return {
            id: options.id,
            sourceId: sourceId,
            layerIds: [],
            geometryCount: normalizedGeometries.length,
            styleCount: 0,
            markerCount: createdMarkers.length
          }
      },
      
      // 设置可见性
      setVisible: (visible) => {
          // 控制自定义DOM标记点的可见性
          createdMarkers.forEach(markerInfo => {
            if (markerInfo.element) {
              markerInfo.element.style.display = visible ? 'block' : 'none'
          }
        })
      },

      // 获取可见性
      getVisible: () => {
          // 检查第一个标记点的可见性
          if (createdMarkers.length > 0 && createdMarkers[0].element) {
            return createdMarkers[0].element.style.display !== 'none'
        }
        return true
      },
      
        // 事件绑定方法 - 仿照 MineMap.js 实现
        bindEvents: (eventHandlers) => {
          if (eventManager) {
            eventManager.bindEvents(eventHandlers)
          }
        },
        
        // 事件监听器方法 - 支持 markers.on('click', fun) 方式调用
        on: (event, callback) => {
          if (eventManager) {
            eventManager.on(event, callback)
          }
        },
        
        off: (event, callback) => {
          if (eventManager) {
            eventManager.off(event, callback)
          }
        },
        
        once: (event, callback) => {
          if (eventManager) {
            eventManager.once(event, callback)
          }
        },
        
        // 事件管理器引用
        eventManager: eventManager
      }

      return markerGroup
    } catch (error) {
      return null
    }
  }

  /**
   * 标准化几何数据 - 支持多种坐标格式
   * @param {Array} geometries - 几何数据数组
   * @param {Array} styles - 样式数组
   * @returns {Array} 标准化后的几何数据
   * @private
   */
  _normalizeGeometries(geometries, styles) {
    return geometries.map(geometry => {
      const normalized = {
        id: geometry.id || generateMarkerId(),
        coordinates: this._transformCoordinates(geometry.lngLat, 'normalizeGeometries'),
        properties: geometry.properties || {},
        styleId: geometry.styleId || (styles.length > 0 ? styles[0].id : null)
      }
      return normalized
    })
  }

  /**
   * 转换坐标格式
   * @param {Array|Object} coordinates - 坐标
   * @param {string} context - 上下文
   * @returns {Array} 转换后的坐标
   * @private
   */
  _transformCoordinates(coordinates, context) {
    return transformCoordinates(coordinates, context)
  }

  /**
   * 转换偏移量格式
   * @param {Array|number|string} offset - 偏移量
   * @returns {Array} 转换后的偏移量
   * @private
   */
  _convertOffset(offset) {
    return convertOffset(offset)
  }

  /**
   * 获取默认pin的Base64编码
   * @returns {string} Base64编码的SVG
   * @private
   */
  _getDefaultPinBase64() {
    const svg = `
      <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 8 16 24 16 24s16-16 16-24C32 7.163 24.837 0 16 0z" fill="#ff4444"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `
    return btoa(unescape(encodeURIComponent(svg)))
  }

  /**
   * 创建标记点事件管理器 - 参照 MineMap.js 实现
   * @param {Array} layerIds - 图层ID数组
   * @param {string} sourceId - 数据源ID
   * @param {Array} markersData - 标记点数据
   * @param {Array} markers - 标记点实例数组（可选）
   * @returns {object} 事件管理器对象
   * @private
   */
  _createMarkerEventManager(layerIds, sourceId, markersData, markers = null) {
    if (!this.map) return null

    // 事件监听器存储
    const eventListeners = new Map()
    const boundEventHandlers = new Map() // 存储绑定的事件处理器，用于清理

    // 支持的事件类型
    const supportedEvents = [
      'click', 'dblclick', 'contextmenu', 'rightClick',
      'mouseenter', 'mouseleave', 'mousemove',
      'mousedown', 'mouseup', 'mouseover', 'mouseout',
      'dragstart', 'drag', 'dragend'  // 拖拽事件
    ]

    // 创建事件数据 - 兼容 HTMap 接口
    const createEventData = (evt, eventType, feature, markerData) => {
      // 获取坐标信息，优先使用 feature.geometry.coordinates，然后是 evt.lngLat
      let lngLat = null
      let latLng = null
      let coordinates = null
      
      if (feature && feature.geometry && feature.geometry.coordinates) {
        coordinates = feature.geometry.coordinates
        lngLat = {
          lng: coordinates[0],
          lat: coordinates[1]
        }
        latLng = {
          lng: coordinates[0],
          lat: coordinates[1]
        }
      } else if (evt.lngLat) {
        lngLat = evt.lngLat
        latLng = {
          lng: evt.lngLat.lng,
          lat: evt.lngLat.lat
        }
        coordinates = [evt.lngLat.lng, evt.lngLat.lat]
      } else if (markerData && markerData.coordinates) {
        coordinates = markerData.coordinates
        lngLat = {
          lng: coordinates[0],
          lat: coordinates[1]
        }
        latLng = {
          lng: coordinates[0],
          lat: coordinates[1]
        }
      }

      return {
        // HTMap 标准格式
        type: eventType,
        target: this.map,
        lngLat: lngLat,
        latLng: latLng,
        point: evt.point || { x: 0, y: 0 },
        originalEvent: evt.originalEvent || evt,
        
        // 标记点相关数据
        marker: markerData,
        markerInstance: markerData,
        feature: feature,
        // 参照 MapboxGL.js 的实现，geometry 对象包含 properties
        geometry: {
          id: markerData ? markerData.id : null,
          properties: markerData ? (markerData.properties || {}) : (feature ? feature.properties : {}),
          coordinates: coordinates,
          styleId: markerData ? markerData.styleId : null
        },
        properties: feature ? feature.properties : (markerData ? markerData.properties : {}),
        id: markerData ? markerData.id : null,
        coordinates: coordinates,
        
        // 图层信息
        layerId: layerIds.length > 0 ? layerIds[0] : null,
        sourceId: sourceId,
        
        // 事件状态
        hasListeners: eventListeners.has(eventType),
        listenerCount: eventListeners.has(eventType) ? eventListeners.get(eventType).length : 0,
        timestamp: Date.now()
      }
    }

    // 存储当前鼠标悬停的标记点
    let currentHoveredMarker = null

    // 事件处理函数
    const handleMapEvent = (evt, eventType) => {
      // 对于右键事件（contextmenu），阻止默认的浏览器上下文菜单
      if (eventType === 'rightClick' || eventType === 'contextmenu') {
        if (evt.originalEvent && typeof evt.originalEvent.preventDefault === 'function') {
          evt.originalEvent.preventDefault()
        }
      }
      
      // 检查是否有特征数据
      if (evt.features && evt.features.length > 0) {
        const feature = evt.features[0]

        // 改进的标记点数据匹配逻辑
        const markerData = markersData.find(marker =>
          marker.id === feature.properties.id ||
          (marker.coordinates && marker.coordinates[0] === feature.geometry.coordinates[0] && marker.coordinates[1] === feature.geometry.coordinates[1])
        )
        
        if (markerData) {
          // 特殊处理鼠标样式和 mouseleave 事件
          if (eventType === 'mouseenter') {
            if (this.map.getCanvas()) {
              this.map.getCanvas().style.cursor = 'pointer'
            }
            currentHoveredMarker = markerData
          } else if (eventType === 'mouseleave' || eventType === 'mouseout') {
            if (this.map.getCanvas()) {
              this.map.getCanvas().style.cursor = ''
            }
            // 只有当确实离开当前悬停的标记点时才触发 mouseleave 事件
            if (currentHoveredMarker && currentHoveredMarker.id === markerData.id) {
              currentHoveredMarker = null
            } else {
              // 如果不是当前悬停的标记点，则不触发 mouseleave 事件
              return
            }
          }

          const eventData = createEventData(evt, eventType, feature, markerData)

          // 调用所有注册的监听器
          if (eventListeners.has(eventType)) {
            eventListeners.get(eventType).forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
              }
            })
          }
        }
      } else {
        // 当没有特征数据时，可能是鼠标离开了所有标记点
        if ((eventType === 'mouseleave' || eventType === 'mouseout') && currentHoveredMarker) {
          if (this.map.getCanvas()) {
            this.map.getCanvas().style.cursor = ''
          }
          
          // 创建一个模拟的 feature 对象
          const mockFeature = {
            geometry: {
              coordinates: currentHoveredMarker.coordinates || [0, 0]
            },
            properties: {
              id: currentHoveredMarker.id,
              ...(currentHoveredMarker.properties || {})
            }
          }
          
          // 使用 createEventData 函数创建标准格式的事件数据
          const eventData = createEventData(evt, 'mouseleave', mockFeature, currentHoveredMarker)
          
          // 调用所有注册的 mouseleave 监听器
          if (eventListeners.has('mouseleave')) {
            eventListeners.get('mouseleave').forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
              }
            })
          }
          
          currentHoveredMarker = null
        }
      }
    }

    // 绑定地图事件
    const bindMapEvents = () => {
      layerIds.forEach(layerId => {
        supportedEvents.forEach(eventType => {
          const mapEventType = eventType === 'rightClick' ? 'contextmenu' : eventType
          
          const eventHandler = (evt) => {
            handleMapEvent(evt, eventType)
          }

          // 存储事件处理器用于清理
          boundEventHandlers.set(`${layerId}-${eventType}`, eventHandler)

          try {
            // 方式1: 尝试使用图层ID绑定事件
            this.map.on(mapEventType, layerId, eventHandler)
          } catch (error) {

            try {
              // 方式2: 尝试直接绑定到地图
              this.map.on(mapEventType, eventHandler)
            } catch (error2) {
              
              // 方式3: 对于 mouseleave 事件，使用多种替代方案
              if (eventType === 'mouseleave') {
                try {
                  this.map.on('mouseout', layerId, eventHandler)
                } catch (error3) {
                  try {
                    this.map.on('mouseout', eventHandler)
                  } catch (error4) {
                    
                    // 方式4: 使用 mousemove 事件来模拟 mouseleave
                    try {
                      const mouseMoveHandler = (evt) => {
                        // 检查鼠标是否离开了所有标记点
                        if (!evt.features || evt.features.length === 0) {
                          if (currentHoveredMarker) {
                            // 创建一个模拟的 feature 对象
                            const mockFeature = {
                              geometry: {
                                coordinates: currentHoveredMarker.coordinates || [0, 0]
                              },
                              properties: {
                                id: currentHoveredMarker.id,
                                ...(currentHoveredMarker.properties || {})
                              }
                            }
                            
                            // 使用 createEventData 函数创建标准格式的事件数据
                            const eventData = createEventData(evt, 'mouseleave', mockFeature, currentHoveredMarker)
                            
                            // 调用所有注册的 mouseleave 监听器
                            if (eventListeners.has('mouseleave')) {
                              eventListeners.get('mouseleave').forEach(callback => {
                                try {
                                  callback(eventData)
                                } catch (error) {
                                }
                              })
                            }
                            
                            // 重置鼠标样式和悬停状态
                            if (this.map.getCanvas()) {
                              this.map.getCanvas().style.cursor = ''
                            }
                            currentHoveredMarker = null
                          }
                        }
                      }
                      
                      this.map.on('mousemove', mouseMoveHandler)
                      boundEventHandlers.set('mousemove-mouseleave', mouseMoveHandler)
                    } catch (error5) {
                    }
                  }
                }
              }
            }
          }
        })
      })
    }

    // 绑定DOM事件（用于自定义DOM标记点）
    const bindDOMEvents = () => {
      if (!markers || markers.length === 0) return

      // 定义拖拽相关事件类型，这些事件不应该被阻止，以免影响拖拽功能
      const dragRelatedEvents = ['mousedown', 'mousemove', 'mouseup', 'mouseover', 'mouseout']
      
      markers.forEach(markerInfo => {
        const element = markerInfo.element
        if (!element || !element.addEventListener) return
        
        // 判断是否为拖拽标记点
        const isDraggable = markerInfo.isDraggable === true

        supportedEvents.forEach(eventType => {
          const domEventType = eventType === 'rightClick' ? 'contextmenu' : eventType
          
          // 对于拖拽标记点，跳过拖拽相关事件，避免干扰拖拽功能
          if (isDraggable && dragRelatedEvents.includes(domEventType)) {
            return
          }
          
          const eventHandler = (event) => {
            // 获取坐标信息 - 兼容 HTMap 接口
            let lngLat = null
            let latLng = null
            let coordinates = markerInfo.coordinates
            
            // 对于拖拽标记点，尝试从 marker 实例获取最新坐标
            if (isDraggable && markerInfo.marker) {
              try {
                const currentLngLat = markerInfo.marker.getLngLat()
                if (currentLngLat) {
                  coordinates = [currentLngLat.lng, currentLngLat.lat]
                  lngLat = {
                    lng: currentLngLat.lng,
                    lat: currentLngLat.lat
                  }
                  latLng = {
                    lng: currentLngLat.lng,
                    lat: currentLngLat.lat
                  }
                }
              } catch (error) {
                // 如果获取失败，使用存储的坐标
                if (coordinates) {
                  lngLat = {
                    lng: coordinates[0],
                    lat: coordinates[1]
                  }
                  latLng = {
                    lng: coordinates[0],
                    lat: coordinates[1]
                  }
                }
              }
            } else if (coordinates) {
              lngLat = {
                lng: coordinates[0],
                lat: coordinates[1]
              }
              latLng = {
                lng: coordinates[0],
                lat: coordinates[1]
              }
            }

            const eventData = {
              // HTMap 标准格式
              type: eventType,
              target: element,
              lngLat: lngLat,
              latLng: latLng,
              point: {
                x: event.clientX || 0,
                y: event.clientY || 0
              },
              originalEvent: event,
              
              // 标记点相关数据
              marker: markerInfo,
              markerInstance: markerInfo,
              // 参照 MapboxGL.js 的实现，geometry 对象包含 properties
              geometry: {
                id: markerInfo.id,
                properties: markerInfo.properties || {},
                coordinates: coordinates,
                styleId: markerInfo.styleId || null
              },
              properties: markerInfo.properties || {},
              id: markerInfo.id,
              coordinates: coordinates,
              
              // 图层信息
              layerId: null, // DOM事件没有图层ID
              sourceId: sourceId,
              
              // 事件状态
              hasListeners: eventListeners.has(eventType),
              listenerCount: eventListeners.has(eventType) ? eventListeners.get(eventType).length : 0,
              timestamp: Date.now()
            }
            
            // 调用所有注册的监听器
            if (eventListeners.has(eventType)) {
              eventListeners.get(eventType).forEach(callback => {
              try {
                callback(eventData)
              } catch (error) {
                }
              })
            }

            // 对于右键事件（contextmenu），阻止默认的浏览器上下文菜单
            if (domEventType === 'contextmenu' || eventType === 'rightClick') {
              event.preventDefault()
            }
            
            // 对于拖拽标记点，只阻止某些事件的冒泡，避免影响拖拽
            // 对于 click、dblclick、contextmenu 等事件，可以阻止冒泡
            // 但对于 mouseenter、mouseleave，不应该阻止，以免影响拖拽
            if (isDraggable) {
              // 只对点击相关事件阻止冒泡
              if (['click', 'dblclick', 'contextmenu'].includes(domEventType)) {
                event.stopPropagation()
              }
            } else {
              // 非拖拽标记点，可以阻止所有事件的冒泡
              event.stopPropagation()
            }
          }

          // 存储事件处理器用于清理
          boundEventHandlers.set(`${markerInfo.id}-${eventType}`, eventHandler)

          element.addEventListener(domEventType, eventHandler)
        })
      })
    }

    // 清理事件监听器
    const cleanup = () => {
      // 清理地图事件
      layerIds.forEach(layerId => {
        supportedEvents.forEach(eventType => {
          const mapEventType = eventType === 'rightClick' ? 'contextmenu' : eventType
          const handlerKey = `${layerId}-${eventType}`
          const handler = boundEventHandlers.get(handlerKey)
          
          if (handler) {
            try {
              this.map.off(mapEventType, layerId, handler)
            } catch (error) {
            }
            boundEventHandlers.delete(handlerKey)
          }
        })
      })

      // 清理特殊的事件处理器
      const specialHandlers = ['mousemove-mouseleave']
      specialHandlers.forEach(handlerKey => {
        const handler = boundEventHandlers.get(handlerKey)
        if (handler) {
          try {
            if (handlerKey === 'mousemove-mouseleave') {
              this.map.off('mousemove', handler)
            }
          } catch (error) {
          }
          boundEventHandlers.delete(handlerKey)
        }
      })

      // 清理DOM事件
      if (markers) {
        markers.forEach(markerInfo => {
          const element = markerInfo.element
          if (!element || !element.removeEventListener) return

          supportedEvents.forEach(eventType => {
        const domEventType = eventType === 'rightClick' ? 'contextmenu' : eventType
            const handlerKey = `${markerInfo.id}-${eventType}`
            const handler = boundEventHandlers.get(handlerKey)
            
            if (handler) {
          element.removeEventListener(domEventType, handler)
              boundEventHandlers.delete(handlerKey)
            }
          })
        })
      }

      eventListeners.clear()
    }

    // 初始化事件绑定
    bindMapEvents()
    bindDOMEvents()

    // 返回事件管理器
    return {
      on(event, callback) {
        if (!supportedEvents.includes(event)) {
          return this
        }

        if (!eventListeners.has(event)) {
          eventListeners.set(event, [])
        }
        eventListeners.get(event).push(callback)
        return this
      },

      off(event, callback) {
        if (!eventListeners.has(event)) return this

        if (callback) {
          const listeners = eventListeners.get(event)
          const index = listeners.indexOf(callback)
          if (index > -1) {
            listeners.splice(index, 1)
          }
          if (listeners.length === 0) {
            eventListeners.delete(event)
          }
        } else {
          eventListeners.delete(event)
        }
        return this
      },

      once(event, callback) {
        const onceCallback = (data) => {
          callback(data)
          this.off(event, onceCallback)
        }
        this.on(event, onceCallback)
        return this
      },

      bindEvents(eventHandlers) {
        Object.entries(eventHandlers).forEach(([event, callback]) => {
          this.on(event, callback)
        })
        return this
      },

      getEventListenersCount(event) {
        if (event) {
          return eventListeners.has(event) ? eventListeners.get(event).length : 0
        }
        return Array.from(eventListeners.values()).reduce((total, listeners) => total + listeners.length, 0)
      },

      hasEventListeners(event) {
        return eventListeners.has(event) && eventListeners.get(event).length > 0
      },

      removeAllListeners() {
        cleanup()
        return this
      },

      // 内部方法：用于从外部触发事件（如拖拽标记点的事件）
      _triggerEvent(eventType, eventData) {
        // 检查事件类型是否支持
        if (!supportedEvents.includes(eventType)) {
          return
        }
        
        // 检查是否有监听器
        if (!eventListeners.has(eventType)) {
          return
        }
        
        const listeners = eventListeners.get(eventType)
        if (listeners && listeners.length > 0) {
          listeners.forEach(callback => {
            try {
              callback(eventData)
            } catch (error) {
              // 静默处理错误，避免影响其他回调的执行
            }
          })
        }
      }
    }
  }

  /**
   * 清除所有标记点
   */
  clearAllMarkers() {
    this.markers.forEach(marker => {
      if (marker && typeof marker.remove === 'function') {
        marker.remove()
      }
    })
    this.markers.clear()
    
    // 清理拖拽标记点
    if (this.draggableMarkers) {
      this.draggableMarkers.forEach(marker => {
        if (marker && typeof marker.remove === 'function') {
          marker.remove()
        }
      })
      this.draggableMarkers.clear()
    }
    
    // 清理图片尺寸缓存
    this.imageSizeCache.clear()
    
  }
}


