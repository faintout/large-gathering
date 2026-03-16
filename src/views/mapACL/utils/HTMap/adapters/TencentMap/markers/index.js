/**
 * 腾讯地图适配器 - 点标记模块（单个/批量 DOM 与 MultiMarker）
 */
import { validateMarkerStyle, validateAndTransformMarkerGeometries } from '../utils/index.js'

export default class MarkerManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance
  }

  getMarkers() {
    if (!this.mapInstance.map) return []

    // 返回所有标记点实例
    return Array.from(this.mapInstance.markers.values())
  }
  /**
   * 添加单个标记点
   * @param {object} options - 标记点配置
   * @returns {object} 标记点实例
   */
  addDomMarker(options) {
    if (!this.mapInstance.map) {
      console.error('Marker.addDomMarker: 地图实例不存在')
      return null
    }
    // 验证必需参数
    if (!options.lngLat) {
      console.warn('Marker.addDomMarker: 缺少必需的 lngLat 参数')
      return null
    }
    // 检查是否为dom标记模式
    if (options.contentDom) {
      let marker = this._createDOMMarker(options);
      marker.remove = () => {
        marker.removeDomMarker();
      }
      marker.setVisible = (visible) => {
        marker.setDomMarkerVisible(visible);
      }
      marker.getVisible = () => {
        return marker.getDomMarkerVisible();
      }
      return marker;

    }


  }
  /**
   * 批量添加标记点
   * @param {object} options - 标记点配置，包含geometries和styles数组，或contentDom用于DOM标记
   * @returns {object} 标记点实例
   */
  addMarkers(options) {
    if (!this.mapInstance.map) return null
    // 检查是否为DOM标记模式
    if (options.contentDom) {
      return this._createDOMMarkers(options)
    }

    // 验证必要参数
    if (!options.geometries || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      console.error('addMarkers: geometries数组不能为空')
      return null
    }

    // 构建样式映射
    const styleMap = {}
    options.styles.forEach(style => {
      if (style.id && style.src) {
        // 验证和清理样式对象
        const validatedStyle = validateMarkerStyle(style)
        styleMap[style.id] = new TMap.MarkerStyle(validatedStyle)
      }
    })
    if (Object.keys(styleMap).length === 0) {
      console.error('addMarkers: 没有有效的样式配置')
      return null
    }

    // 构建几何数据
    const geometries = validateAndTransformMarkerGeometries(options.geometries, styleMap, 'addMarkers')

    if (geometries.length === 0) {
      console.error('addMarkers: 没有有效的几何数据')
      return null
    }
    // 创建MultiMarker实例
    const markerOptions = {
      map: this.mapInstance.map,
      id: options.id,
      styles: styleMap,
      minZoom: options.minZoom,
      maxZoom: options.maxZoom,
      geometries: geometries
    }
    const nativeMarker = new TMap.MultiMarker(markerOptions)

    // 创建包装器对象
    const markerGroup = {
      id: options.id,
      marker: nativeMarker, // 存储原生MultiMarker实例
      styleMap: styleMap,
      eventListeners: new Map(), // 存储自定义事件监听器
      _dragEnabled: options.draggable,
      _editor: null,
      _rightClickHandler: null // 右键事件处理器
    }

    // 创建编辑器
    const editor = new TMap.tools.GeometryEditor({
      map: this.mapInstance.map, // 编辑器绑定的地图对象
      overlayList: [{
        overlay: markerGroup.marker, // 可编辑图层
        id: "markerGroup",
      }],
      actionMode: TMap.tools.constants.EDITOR_ACTION.INTERACT, // 编辑器的工作模式
      activeOverlayId: "markerGroup", // 激活图层
      selectable: true,
    })
    markerGroup._editor = editor
    markerGroup._dragEnabled = true;
    // 添加动态拖动绑定方法
    markerGroup.enableDrag = () => {
      if (markerGroup._dragEnabled) return
      if (markerGroup._editor) {
        markerGroup._editor.enable()
        markerGroup._dragEnabled = true
      }
    }
    // 添加禁用拖动方法
    markerGroup.disableDrag = () => {
      if (!markerGroup._dragEnabled) return
      if (markerGroup._editor) {
        // 先尝试从编辑器中移除覆盖物
        try {
          markerGroup._editor.disable()
        } catch (error) {
          console.warn('移除编辑器覆盖物失败:', error)
        }
      }
      markerGroup._dragEnabled = false
    }
    if (!options.draggable) {
      markerGroup.disableDrag()
    }
    // 添加自定义事件方法
    markerGroup.on = (event, callback) => {
      if (!markerGroup.eventListeners.has(event)) {
        markerGroup.eventListeners.set(event, [])
      }
      markerGroup.eventListeners.get(event).push(callback)

      switch (event) {
        case 'click':
        case 'dblclick':
          // 直接绑定原生事件
          markerGroup.marker.on(event, callback)
          break
        case 'mouseenter':
          // 使用hover事件实现mouseenter
          markerGroup.marker.on('hover', (e) => {
            if (e && e.geometry) {
              // 有几何对象时触发mouseenter
              const listeners = markerGroup.eventListeners.get('mouseenter')
              listeners.forEach(listener => {
                try {
                  const event = {
                    ...e,
                    type: 'mouseenter'
                  }
                  listener(event)
                } catch (error) {
                  console.error(`事件 mouseenter 回调执行错误:`, error)
                }
              })
            }
          })
          break
        case 'mouseleave':
          // 使用hover事件实现mouseleave
          markerGroup.marker.on('hover', (e) => {
            if (!e || !e.geometry) {
              // 没有几何对象时触发mouseleave
              const listeners = markerGroup.eventListeners.get('mouseleave')
              listeners.forEach(listener => {
                try {
                  const event = {
                    ...e,
                    type: 'mouseleave'
                  }
                  listener(event)
                } catch (error) {
                  console.error(`事件 mouseleave 回调执行错误:`, error)
                }
              })
            }
          })
          break
        case 'dragstart':
          markerGroup.enableDrag();
          markerGroup._editor.on('select', async function () {
            // 转换事件数据结构
            const formattedEvent = {
              geometry: markerGroup.marker.geometries[0],
              lngLat: markerGroup.marker.geometries[0].position,
              point: {
                x: 0,
                y: 0
              },
              type: 'dragstart'
            }

            // 触发所有drag事件监听器
            const listeners = markerGroup.eventListeners.get('dragstart')
            if (listeners) {
              listeners.forEach(listener => {
                try {
                  listener(formattedEvent)
                } catch (error) {
                  console.error(`事件 dragstart 回调执行错误:`, error)
                }
              })
            }
          })
          break
        case 'drag':
          markerGroup.enableDrag();
          markerGroup._editor.on('adjusting', async function (e) {
            // 转换事件数据结构
            const formattedEvent = {
              geometry: {
                id: e.id,
                styleId: e.styleId,
                position: {
                  lat: e.position.lat,
                  lng: e.position.lng,
                  height: e.position.height || 0
                },
                properties: e.properties || {},
                rank: e.rank || 0
              },
              lngLat: {
                lat: e.position.lat,
                lng: e.position.lng,
                height: e.position.height || 0
              },
              point: {
                x: e.point ? e.point.x : 0,
                y: e.point ? e.point.y : 0
              },
              type: 'drag'
            }

            // 触发所有drag事件监听器
            const listeners = markerGroup.eventListeners.get('drag')
            if (listeners) {
              listeners.forEach(listener => {
                try {
                  listener(formattedEvent)
                } catch (error) {
                  console.error(`事件 drag 回调执行错误:`, error)
                }
              })
            }
          })
          break
        case 'dragend':
          markerGroup.enableDrag();
          markerGroup._editor.on('adjust_complete', async function (e) {
            // 转换事件数据结构
            const formattedEvent = {
              geometry: {
                id: e.id,
                styleId: e.styleId,
                position: {
                  lat: e.position.lat,
                  lng: e.position.lng,
                  height: e.position.height || 0
                },
                properties: e.properties || {},
                rank: e.rank || 0
              },
              lngLat: {
                lat: e.position.lat,
                lng: e.position.lng,
                height: e.position.height || 0
              },
              point: {
                x: e.point ? e.point.x : 0,
                y: e.point ? e.point.y : 0
              },
              type: 'dragend'
            }

            // 触发所有dragend事件监听器
            const listeners = markerGroup.eventListeners.get('dragend')
            if (listeners) {
              listeners.forEach(listener => {
                try {
                  listener(formattedEvent)
                } catch (error) {
                  console.error(`事件 dragend 回调执行错误:`, error)
                }
              })
            }
          })
        case 'rightClick':
          // 腾讯地图MultiMarker不支持右键事件，需要通过地图右键事件+点击检测来实现
          if (!markerGroup._rightClickHandler) {
            markerGroup._rightClickHandler = (e) => {
              // 检查右键点击是否在marker区域内
              const geometries = markerGroup.marker.getGeometries()
              for (let geo of geometries) {
                // 将地理坐标转换为屏幕坐标
                const markerPixel = this.mapInstance.map.projectToContainer(geo.position)
                const clickPixel = e.pixel || e.point

                // 动态获取marker大小（腾讯地图的offset和anchor参数有问题，暂时不使用）
                const styleId = geo.styleId
                const style = markerGroup.styleMap[styleId]
                let markerWidth = 40  // 默认宽度
                let markerHeight = 46 // 默认高度
                if (style) {
                  // 从样式对象中获取实际大小
                  markerWidth = style.width || 40
                  markerHeight = style.height || 46
                }

                // 计算marker的实际点击区域
                // 由于腾讯地图默认anchor是底部中间，需要调整点击检测区域
                const toleranceX = Math.abs(markerWidth) / 2
                const toleranceY = Math.abs(markerHeight) / 2

                if (markerPixel && clickPixel) {
                  // 获取marker的屏幕坐标
                  const markerX = markerPixel.getX()
                  const markerY = markerPixel.getY()

                  // 由于anchor默认是底部中间，marker的视觉中心需要向上偏移
                  // 计算marker的视觉中心位置（图片中心，而不是底部中间）
                  const visualCenterX = markerX
                  const visualCenterY = markerY - (markerHeight / 2) // 向上偏移半个高度

                  // 计算点击位置与marker视觉中心的距离
                  const deltaX = Math.abs(clickPixel.x - visualCenterX)
                  const deltaY = Math.abs(clickPixel.y - visualCenterY)

                  // 检查是否在marker的矩形区域内
                  if (deltaX <= toleranceX && deltaY <= toleranceY) {
                    // 右键点击在marker区域内，触发rightClick事件
                    const formattedEvent = {
                      geometry: geo,
                      lngLat: geo.position,
                      point: clickPixel,
                      type: 'rightClick',
                      timestamp: Date.now()
                    }

                    const listeners = markerGroup.eventListeners.get('rightClick')
                    if (listeners) {
                      listeners.forEach(listener => {
                        try {
                          listener(formattedEvent)
                        } catch (error) {
                          console.error(`事件 rightClick 回调执行错误:`, error)
                        }
                      })
                    }
                    break
                  }
                }
              }
            }

            // 绑定地图右键事件
            this.mapInstance.map.on('rightclick', markerGroup._rightClickHandler)
          }
          break
        default:
          console.warn(`不支持的事件类型: ${event}`)
          break
      }
    }

    markerGroup.off = (event, callback) => {
      if (!markerGroup.eventListeners.has(event)) {
        return
      }

      if (callback) {
        // 移除特定的回调函数
        const listeners = markerGroup.eventListeners.get(event)
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      } else {
        // 移除该事件的所有监听器
        markerGroup.eventListeners.delete(event)
      }

      switch (event) {
        case 'click':
        case 'dblclick':
          // 直接解绑原生事件
          markerGroup.marker.off(event, callback)
          break
        case 'mouseenter':
        case 'mouseleave':
          // 对于hover相关事件，需要特殊处理
          // 检查是否还有其他hover相关事件的监听器
          const hasMouseenterListeners = markerGroup.eventListeners.has('mouseenter') && markerGroup.eventListeners.get('mouseenter').length > 0
          const hasMouseleaveListeners = markerGroup.eventListeners.has('mouseleave') && markerGroup.eventListeners.get('mouseleave').length > 0

          // 如果没有任何hover相关事件的监听器了，则解绑hover事件
          if (!hasMouseenterListeners && !hasMouseleaveListeners) {
            markerGroup.marker.off('hover', callback)
          }
          break
        case 'dragstart':
          markerGroup.disableDrag();
          markerGroup._editor.off('select', callback)
        case 'drag':
          markerGroup.disableDrag();
          markerGroup._editor.off('adjusting', callback)
          break
        case 'dragend':
          markerGroup.disableDrag();
          markerGroup._editor.off('adjust_complete', callback)
          break
        case 'rightClick':
          // 解绑地图右键事件
          if (markerGroup._rightClickHandler) {
            this.mapInstance.map.off('rightclick', markerGroup._rightClickHandler)
            markerGroup._rightClickHandler = null
          }
          break
        default:
          break
      }
    }

    // 添加更新样式的方法
    markerGroup.updateStyles = (newStyles) => {
      if (!Array.isArray(newStyles)) return false

      const updatedStyleMap = {}
      newStyles.forEach(style => {
        if (style.id && style.src) {
          const validatedStyle = validateMarkerStyle(style)
          updatedStyleMap[style.id] = new TMap.MarkerStyle(validatedStyle)
        }
      })

      if (Object.keys(updatedStyleMap).length > 0) {
        markerGroup.marker.setStyles(updatedStyleMap)
        markerGroup.styleMap = updatedStyleMap
        return true
      }
      return false
    }

    // 添加点标记
    markerGroup.addGeometries = (newGeometries) => {
      if (newGeometries.length === 0) {
        console.error('addMarkers: 没有有效的几何数据')
        return null
      }
      // 构建几何数据
      const geometries = validateAndTransformMarkerGeometries(newGeometries, markerGroup.styleMap, 'addMarkers')
      if (geometries.length === 0) {
        console.error('addMarkers: 没有有效的几何数据')
        return null
      }
      markerGroup.marker.add(geometries)
    }

    // 更新点标记数据
    markerGroup.updateMarkersGeometries = (newGeometries) => {
      // 构建几何数据
      const geometries = validateAndTransformMarkerGeometries(newGeometries, markerGroup.styleMap, 'updateMarkersGeometries')

      if (geometries.length === 0) {
        console.error('addMarkers: 没有有效的几何数据')
        return null
      }
      markerGroup.marker.updateGeometries(geometries)
    }

    markerGroup.removeGeometries = (idsToDelete) => {
      markerGroup.marker.remove(idsToDelete)
    }

    markerGroup.getGeometries = () => {
      return markerGroup.marker.getGeometries()
    }

    // 添加移除标记点的方法
    markerGroup.removeMarkers = () => {
      // 需要先禁用编辑，否则删不掉
      markerGroup.disableDrag()
      markerGroup.marker.setMap(null)
      // 从标记点列表中移除
      this.mapInstance.markers.delete(options.id)
    }

    // 设置可见性
    markerGroup.setVisible = (visible) => {
      markerGroup.marker.setVisible(visible)
    }
    // 获取可见性
    markerGroup.getVisible = () => {
      return markerGroup.marker.getVisible()
    }

    // 将标记组添加到列表中
    this.mapInstance.markers.set(options.id, markerGroup)
    return markerGroup

  }

  /**
   * 创建DOM标记点
   * @param {object} options - DOM标记配置
   * @returns {object} DOM标记组实例
   */
  _createDOMMarkers(options) {
    if (!options.geometries || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      console.error('_createDOMMarkers: geometries数组不能为空')
      return null
    }

    // 创建DOM标记组
    const domMarkerGroup = {
      id: options.id,
      type: 'dom-markers',
      markers: [],
      map: this.mapInstance.map,
      minZoom: options.minZoom,
      maxZoom: options.maxZoom
    }

    // 为每个几何数据创建DOM标记
    options.geometries.forEach((geo, index) => {
      if (!geo.lngLat || !Array.isArray(geo.lngLat) || geo.lngLat.length < 2) {
        console.warn(`_createDOMMarkers: 几何数据 ${geo.id} 坐标无效，跳过`)
        return
      }
      // 为每个标记创建独立的DOM元素
      const clonedElement = options.contentDom.cloneNode(true)

      // 为克隆的元素添加唯一标识
      clonedElement.setAttribute('data-marker-id', geo.id)
      clonedElement.setAttribute('data-marker-index', index)

      // 如果元素有ID，确保唯一性
      if (clonedElement.id) {
        clonedElement.id = `${clonedElement.id}_${geo.id}_${index}`
      }

      // 创建自定义DOM覆盖层
      const CustomDOMOverlay = this._createCustomDOMOverlay({
        element: clonedElement,
        ...options
      })

      const markerOptions = {
        map: this.mapInstance.map,
        position: new TMap.LatLng(geo.lngLat[1], geo.lngLat[0]),
        properties: {
          id: geo.id,
          index: index,
          ...geo.properties
        }
      }

      const domMarker = new CustomDOMOverlay(markerOptions)

      // 为DOM标记添加自定义方法
      domMarker.id = geo.id
      domMarker.type = 'dom-marker'
      domMarker.position = markerOptions.position
      domMarker.properties = markerOptions.properties
      domMarker.element = clonedElement // 保存元素引用

      // 添加位置更新方法
      domMarker.setPosition = (lat, lng) => {
        if (domMarker && domMarker.position) {
          domMarker.position = new TMap.LatLng(lat, lng)
          if (domMarker.updateDOM) {
            domMarker.updateDOM()
          }
        }
      }

      // 添加获取位置方法
      domMarker.getPosition = () => {
        if (domMarker && domMarker.position) {
          return [domMarker.position.lng, domMarker.position.lat]
        }
        return null
      }

      // 添加移除方法
      domMarker.remove = () => {
        if (domMarker && domMarker.setMap) {
          domMarker.setMap(null)
        }
      }
      domMarkerGroup.markers.push(domMarker)
    })

    // 为DOM标记组添加事件管理方法
    domMarkerGroup.on = (event, callback) => {
      // 为每个DOM标记绑定事件
      domMarkerGroup.markers.forEach(marker => {
        if (marker.on) {
          marker.on(event, callback)
        }
      })
    }

    domMarkerGroup.off = (event, callback) => {
      // 为每个DOM标记解绑事件
      domMarkerGroup.markers.forEach(marker => {
        if (marker.off) {
          marker.off(event, callback)
        }
      })
    }

    // 为DOM标记组添加管理方法
    domMarkerGroup.getMarker = (markerId) => {
      return domMarkerGroup.markers.find(marker => marker.id === markerId)
    }

    domMarkerGroup.updateMarker = (markerId, newOptions) => {
      const marker = domMarkerGroup.getMarker(markerId)
      if (marker && newOptions.lngLat) {
        marker.setPosition(newOptions.lngLat[1], newOptions.lngLat[0])
        return true
      }
      return false
    }
    domMarkerGroup.removeMarkers = () => {
      domMarkerGroup.markers.forEach(marker => marker.remove())
      domMarkerGroup.markers = []
      // 从标记点列表中移除
      this.mapInstance.markers.delete(options.id)
    }
    // 将DOM标记组添加到列表中
    this.mapInstance.markers.set(options.id, domMarkerGroup)

    return domMarkerGroup
  }

  /**
   * 创建单个DOM标记点
   * @param {object} options - DOM标记配置
   * @returns {object} DOM标记实例
   */
  _createDOMMarker(options) {
    if (!this.mapInstance.map) {
      console.error('_createDOMMarker: map未初始化')
      return null
    }

    // 验证必要参数
    if (!options.contentDom) {
      console.error('_createDOMMarker: contentDom不能为空')
      return null
    }

    if (!options.lngLat || !Array.isArray(options.lngLat) || options.lngLat.length < 2) {
      console.error('_createDOMMarker: lngLat坐标无效')
      return null
    }

    // 克隆DOM元素
    const clonedElement = options.contentDom.cloneNode(true)

    // 为克隆的元素添加唯一标识
    const markerId = options.id || `dom-marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    clonedElement.setAttribute('data-marker-id', markerId)

    // 如果元素有ID，确保唯一性
    if (clonedElement.id) {
      clonedElement.id = `${clonedElement.id}_${markerId}`
    }

    // 创建自定义DOM覆盖层
    const CustomDOMOverlay = this._createCustomDOMOverlay({
      element: clonedElement,
      draggable: options.draggable,
      offset: options.offset,
      anchor: options.anchor,
      minZoom: options.minZoom,
      maxZoom: options.maxZoom
    })

    const markerOptions = {
      map: this.mapInstance.map,
      position: new TMap.LatLng(options.lngLat[1], options.lngLat[0]),
      properties: {
        id: markerId,
        ...options.properties
      }
    }

    const domMarker = new CustomDOMOverlay(markerOptions)

    // 为DOM标记添加自定义属性
    domMarker.id = markerId
    domMarker.type = 'dom-marker'
    domMarker.position = markerOptions.position
    domMarker.properties = markerOptions.properties
    domMarker.element = clonedElement // 保存元素引用

    // 添加位置更新方法
    domMarker.setPosition = (lat, lng) => {
      if (domMarker && domMarker.position) {
        domMarker.position = new TMap.LatLng(lat, lng)
        if (domMarker.updateDOM) {
          domMarker.updateDOM()
        }
      }
    }

    // 添加获取位置方法
    domMarker.getPosition = () => {
      if (domMarker && domMarker.position) {
        return [domMarker.position.lng, domMarker.position.lat]
      }
      return null
    }

    // 添加移除方法
    domMarker.removeDomMarker = () => {
      if (domMarker && domMarker.setMap) {
        domMarker.setMap(null)
      }
      // 从标记点列表中移除
      if (this.mapInstance.markers && this.mapInstance.markers.has(markerId)) {
        this.mapInstance.markers.delete(markerId)
      }
    }
    // 设置可见性
    domMarker.setDomMarkerVisible = (visible) => {
      if (domMarker && domMarker.element) {
        domMarker.element.style.visibility = visible ? 'visible' : 'hidden';
      }
    }
    // 获取可见性
    domMarker.getDomMarkerVisible = () => {
      if (domMarker && domMarker.element) {
        return domMarker.element.style.visibility !== 'hidden';
      }
      return false;
    }
    // 
    domMarker.setLngLat = (lngLat) => {
      if (domMarker && domMarker.position) {
        domMarker.position = new TMap.LatLng(lngLat[1], lngLat[0])
        if (domMarker.updateDOM) {
          domMarker.updateDOM()
        }
      }
    }
    // 获取坐标
    domMarker.getLngLat = () => {
      if (domMarker && domMarker.position) {
        return [domMarker.position.lng, domMarker.position.lat]
      }
      return null;
    }
    // 更新dom元素
    domMarker.update = (newContentDom) => {
      if (!domMarker || !newContentDom) {
        console.warn('_createDOMMarker.update: 参数不完整')
        return domMarker
      }

      // 获取新元素（支持多种格式）
      let newElement = null

      // 1. 如果是包含element属性的对象
      if (typeof newContentDom === 'object' && newContentDom !== null && newContentDom.element) {
        newElement = newContentDom.element
      }
      // 2. 如果是DOM元素
      else if (newContentDom && typeof newContentDom.cloneNode === 'function') {
        newElement = newContentDom
      }
      // 3. 如果是HTML字符串
      else if (typeof newContentDom === 'string') {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = newContentDom.trim()
        newElement = tempDiv.firstChild || tempDiv
      }
      // 4. 其他情况，尝试直接使用
      else {
        newElement = newContentDom
      }

      if (!newElement) {
        console.warn('_createDOMMarker.update: 无法解析newContentDom')
        return domMarker
      }

      // 克隆元素，避免引用问题
      if (typeof newElement.cloneNode === 'function') {
        newElement = newElement.cloneNode(true)
      }

      const oldElement = domMarker.element
      const oldDom = domMarker.dom || oldElement // 获取已添加到地图的DOM元素

      // 保留原有元素的标识符和重要属性
      if (oldElement) {
        // 保留 data-marker-id
        const preservedMarkerId = oldElement.getAttribute('data-marker-id') || domMarker.id
        if (preservedMarkerId) {
          newElement.setAttribute('data-marker-id', preservedMarkerId)
        }

        // 保留原有元素的ID（如果有）
        if (oldElement.id) {
          newElement.id = oldElement.id
        }

        // 保留可见性状态
        const currentVisibility = oldElement.style.visibility || 'visible'
        if (newElement.style) {
          newElement.style.visibility = currentVisibility
        }

        // 保留显示状态
        const currentDisplay = oldElement.style.display || 'block'
        if (newElement.style) {
          newElement.style.display = currentDisplay
        }
      }

      // 确保新元素有必要的样式
      if (newElement.style) {
        if (!newElement.style.position || newElement.style.position === 'static') {
          newElement.style.position = 'absolute'
        }
        if (!newElement.style.cursor) {
          newElement.style.cursor = 'pointer'
        }
      }

      // 获取已添加到地图的DOM元素（优先使用this.dom，如果没有则使用this.element）
      const actualDomElement = domMarker.dom || oldElement

      // 方法1: 如果元素已添加到地图容器，直接更新其内容（更可靠）
      if (actualDomElement && actualDomElement.parentNode) {
        try {
          // 更新元素内容
          actualDomElement.innerHTML = newElement.innerHTML

          // 复制所有属性（除了已存在的data-marker-id和id）
          Array.from(newElement.attributes).forEach(attr => {
            if (attr.name !== 'data-marker-id' && attr.name !== 'id') {
              actualDomElement.setAttribute(attr.name, attr.value)
            }
          })

          // 复制样式（保留位置相关的transform样式）
          if (newElement.style && actualDomElement.style) {
            // 保存需要保留的样式（由地图控制的样式）
            const preservedStyles = {
              transform: actualDomElement.style.transform,
              visibility: actualDomElement.style.visibility,
              position: actualDomElement.style.position || 'absolute'
            }

            // 复制新元素的所有样式
            if (newElement.style.cssText) {
              actualDomElement.style.cssText = newElement.style.cssText
            } else {
              // 如果没有cssText，逐个复制
              for (let i = 0; i < newElement.style.length; i++) {
                const prop = newElement.style[i]
                actualDomElement.style[prop] = newElement.style[prop]
              }
            }

            // 恢复需要保留的样式
            if (preservedStyles.transform) {
              actualDomElement.style.transform = preservedStyles.transform
            }
            if (preservedStyles.visibility) {
              actualDomElement.style.visibility = preservedStyles.visibility
            }
            if (preservedStyles.position) {
              actualDomElement.style.position = preservedStyles.position
            }
          }

          // 更新类名
          if (newElement.className) {
            actualDomElement.className = newElement.className
          }

          // 更新element引用为实际使用的元素
          domMarker.element = actualDomElement
        } catch (error) {
          console.warn('_createDOMMarker.update: 更新元素内容失败，尝试替换元素', error)
          // 如果更新失败，尝试替换整个元素
          try {
            if (actualDomElement && actualDomElement.parentNode) {
              actualDomElement.parentNode.replaceChild(newElement, actualDomElement)
              // 更新引用
              domMarker.element = newElement
              if (domMarker.dom !== undefined) {
                domMarker.dom = newElement
              }
            }
          } catch (replaceError) {
            console.error('_createDOMMarker.update: 替换元素也失败', replaceError)
          }
        }
      } else {
        // 如果元素还没有添加到地图，直接更新引用
        domMarker.element = newElement
      }

      // 调用updateDOM更新位置和样式
      if (domMarker.updateDOM) {
        domMarker.updateDOM()
      }
      return domMarker
    }
    return domMarker
  }
  /**
   * 创建自定义DOM覆盖物类
   * @param {object} options - 配置选项
   * @returns {class} 自定义DOM覆盖物类
   */
  _createCustomDOMOverlay(options) {
    // 自定义DOM覆盖物类
    function CustomDOMOverlay(overlayOptions) {
      TMap.DOMOverlay.call(this, overlayOptions);
    }

    CustomDOMOverlay.prototype = new TMap.DOMOverlay();

    // 初始化
    CustomDOMOverlay.prototype.onInit = function (overlayOptions) {
      this.position = overlayOptions.position;
      this.draggable = options.draggable;
      this.offset = options.offset;
      this.anchor = options.anchor;
      this.element = options.element;
      // 存储minZoom和maxZoom配置
      this.minZoom = options.minZoom;
      this.maxZoom = options.maxZoom;
      this.geometries = options.geometries || [];
      this.eventListeners = new Map()
    };
    // 销毁时需解绑事件监听
    CustomDOMOverlay.prototype.onDestroy = function () {
      if (this.onClick) {
        this.element.removeEventListener('click', this.onClick);
      }
      if (this.onRightClick) {
        this.element.removeEventListener('contextmenu', this.onRightClick);
      }
    };

    // 创建DOM元素，返回一个DOMElement，使用this.dom可以获取到这个元素
    CustomDOMOverlay.prototype.createDOM = function () {
      // 直接返回传入的DOM元素
      let domElement = this.element;

      // 智能处理DOM元素样式，确保兼容性
      this._ensureElementStyles(domElement);
      return domElement;
    };

    // 智能处理DOM元素样式
    CustomDOMOverlay.prototype._ensureElementStyles = function (element) {
      // 如果元素没有position样式，设置为absolute
      if (!element.style.position || element.style.position === 'static') {
        element.style.position = 'absolute';
      }

      // 如果元素没有top和left，设置为0
      if (!element.style.top && !element.style.left) {
        element.style.top = '0px';
        element.style.left = '0px';
      }

      // 确保元素可以响应事件
      if (element.style.pointerEvents === 'none') {
        element.style.pointerEvents = 'auto';
      }

      // 设置合适的z-index
      if (!element.style.zIndex || element.style.zIndex === 'auto') {
        element.style.zIndex = '1000';
      }
    };

    // 更新DOM元素，在地图移动/缩放后执行（此处 this 为 overlay 实例，TMap 会挂载 this.map）
    CustomDOMOverlay.prototype.updateDOM = function () {
      if (!this.map) {
        return;
      }
      // 获取当前缩放级别
      const currentZoom = this.map.getZoom();
      // 经纬度坐标转容器像素坐标
      let pixel = this.map.projectToContainer(this.position);
      // 使DOM元素中心点对齐经纬度坐标点
      let left = pixel.getX() - this.element.clientWidth / 2 + 'px';
      let top = pixel.getY() - this.element.clientHeight / 2 + 'px';
      this.element.style.transform = `translate(${left}, ${top})`;
      const maxZoom = this.maxZoom != null ? this.maxZoom : Infinity;
      const minZoom = this.minZoom != null ? this.minZoom : -Infinity;
      if (currentZoom > maxZoom || currentZoom < minZoom) {
        this.element.style.visibility = 'hidden';
      } else {
        this.element.style.visibility = 'visible';
      }
    };
    // 设置可见性
    CustomDOMOverlay.prototype.setDomMarkerVisible = function (visible) {
      if (!this.element) return;
      if (visible) {
        this.element.style.visibility = 'visible';
      } else {
        this.element.style.visibility = 'hidden';
      }
    }
    // 获取可见性
    CustomDOMOverlay.prototype.getDomMarkerVisible = function () {
      if (!this.element) return false;
      return this.element.style.visibility !== 'hidden';
    }
    CustomDOMOverlay.prototype.on = function (event, callback) {
      if (this.element) {
        // 转换事件名称（rightClick -> contextmenu）
        const domEventType = event === 'rightClick' ? 'contextmenu' : event

        // 创建事件包装器，生成标准格式的事件数据
        const wrappedCallback = (e) => {
          const eventData = {
            // HTMap 标准格式
            type: event,
            target: this.element,
            lngLat: this.position ? {
              lng: this.position.lng,
              lat: this.position.lat
            } : null,
            point: {
              x: e.clientX || 0,
              y: e.clientY || 0
            },
            originalEvent: e,
            // 标记点相关数据
            marker: {
              id: this.properties.id,
              coordinates: [this.position.lng, this.position.lat],
              properties: this.properties
            },
            markerInstance: this,
            geometry: {
              id: this.properties.id,
              coordinates: [this.position.lng, this.position.lat],
              properties: this.properties
            },
            properties: this.properties,
            id: this.properties.id,
            coordinates: [this.position.lng, this.position.lat],
            // 事件状态
            timestamp: Date.now()
          }

          // 调用原始回调，传入标准格式的事件数据
          callback(eventData)
        }

        if (!this.eventListeners.has(event)) {
          this.eventListeners.set(event, [])
        }
        // 存储原始回调，用于解绑
        this.eventListeners.get(event).push({ original: callback, wrapped: wrappedCallback })

        // 创建最终的事件处理函数
        const finalHandler = (e) => {
          // 阻止右键菜单（如果是 rightClick）
          if (event === 'rightClick' && e.preventDefault) {
            e.preventDefault()
          }
          wrappedCallback(e)
        }

        this.element.addEventListener(domEventType, finalHandler)

        // 更新存储，包含最终处理函数用于解绑
        const lastItem = this.eventListeners.get(event)[this.eventListeners.get(event).length - 1]
        lastItem.finalHandler = finalHandler

        return this
      }
      return null
    }
    CustomDOMOverlay.prototype.off = function (event, callback) {
      if (this.element && this.eventListeners.has(event)) {
        const list = this.eventListeners.get(event)
        if (list) {
          // 查找匹配的原始回调
          const idx = list.findIndex(item => item.original === callback)
          if (idx > -1) {
            const domEventType = event === 'rightClick' ? 'contextmenu' : event
            const item = list[idx]
            // 使用 finalHandler 进行解绑（如果有）
            const handlerToRemove = item.finalHandler || item.wrapped
            this.element.removeEventListener(domEventType, handlerToRemove)
            list.splice(idx, 1)
            if (list.length === 0) {
              this.eventListeners.delete(event)
            }
          }
        }
        return this
      }
      return null
    }
    return CustomDOMOverlay;
  }
  /**
   * 更新DOM标记位置
   * @param {object} marker - 标记点实例
   * @param {number} lat - 纬度
   * @param {number} lng - 经度
   */
  updateDOMMarkerPosition(marker, lat, lng) {
    if (marker && marker.position) {
      // 更新位置
      marker.position = new TMap.LatLng(lat, lng);

      // 强制更新DOM位置
      if (marker.updateDOM) {
        marker.updateDOM();
      }
    }
  }

  /**
   * 获取DOM标记位置
   * @param {object} marker - 标记点实例
   * @returns {object} 位置信息 {lat, lng}
   */
  getDOMMarkerPosition(marker) {
    if (marker && marker.position) {
      return {
        lat: marker.position.lat,
        lng: marker.position.lng
      };
    }
    return null;
  }
}
