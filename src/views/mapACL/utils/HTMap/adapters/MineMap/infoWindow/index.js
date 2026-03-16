import { parseCoordinates, transformCoordinates } from '../utils/index.js'

/**
 * 信息窗口管理器
 * 负责管理所有信息窗口相关的功能
 */
export default class InfoWindowManager {
  constructor(mapInstance) {
    this.map = mapInstance.map
    this.infoWindows = new Map()
  }

  /**
   * 添加信息窗口 - 对接 HTMap 标准接口
   * @param {object} options - 信息窗口配置
   * @returns {object} 信息窗口实例
   */
  addInfoWindow(options) {
    if (!this.map) return null

    // 验证必要参数
    if (!options.lngLat && (!options.lng || !options.lat) && !options.position) {
      console.warn('InfoWindowManager.addInfoWindow: 缺少位置参数 (lngLat、lng/lat 或 position)')
      return null
    }

    try {
      // 处理坐标格式
      const coordinates = parseCoordinates(options)
      
      // 生成唯一ID
      const infoWindowId = options.id || `infowindow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 创建信息窗口内容
      const content = this._createInfoWindowContent(options, infoWindowId)

      // 创建 MineMap Popup 实例
      const infoWindow = new minemap.Popup({
        closeButton: options.closeButton !== false, // 默认显示关闭按钮
        closeOnClick: options.closeOnClick !== false, // 默认点击地图关闭
        closeOnMove: options.closeOnMove || false, // 默认不随地图移动关闭
        focusAfterOpen: options.focusAfterOpen !== false, // 默认打开后聚焦
        offset: options.offset || [0, 0], // 偏移量
        maxWidth: options.maxWidth || '300px', // 最大宽度
        className: options.className || 'ht-map-infowindow', // CSS 类名
        draggable: options.draggable || false // 是否可拖拽
      })
        .setLngLat(coordinates)
        .setDOMContent(content)
        .addTo(this.map)

      // 创建信息窗口实例对象
      const infoWindowInstance = {
        id: infoWindowId,
        infoWindow: infoWindow,
        lngLat: coordinates,
        lng: coordinates[0],
        lat: coordinates[1],
        content: options.content,
        params: options,
        
        // 基础方法
        remove: () => this.removeInfoWindow(infoWindowId),
        
        // 位置和内容方法
        setPosition: (lng, lat) => {
          const coords = Array.isArray(lng) ? lng : [lng, lat]
          infoWindow.setLngLat(coords)
          infoWindowInstance.lngLat = coords
          infoWindowInstance.lng = coords[0]
          infoWindowInstance.lat = coords[1]
        },

        getPosition: () => ({
          lng: infoWindowInstance.lng,
          lat: infoWindowInstance.lat
        }),

        setContent: (content) => {
          const newContent = this._createInfoWindowContent({ content }, infoWindowId)
          infoWindow.setDOMContent(newContent)
          infoWindowInstance.content = content
        },

        getContent: () => infoWindowInstance.content,

        // 显示/隐藏方法
        show: () => {
          if (infoWindow) {
            infoWindow.addTo(this.map)
          }
        },

        hide: () => {
          if (infoWindow) {
            infoWindow.remove()
          }
        },

        // 拖拽相关方法
        setDraggable: (draggable) => {
          if (infoWindow.setDraggable) {
            infoWindow.setDraggable(draggable)
          }
        },

        isDraggable: () => {
          return infoWindow.isDraggable ? infoWindow.isDraggable() : false
        }
      }

      // 绑定事件
      this._bindInfoWindowEvents(infoWindowInstance, options)

      // 存储信息窗口实例
      this.infoWindows.set(infoWindowId, infoWindowInstance)

      console.log(`✅ 成功添加信息窗口 ${infoWindowId}`)
      return infoWindowInstance
    } catch (error) {
      console.error('InfoWindowManager.addInfoWindow: 添加信息窗口失败:', error)
      return null
    }
  }

  /**
   * 移除信息窗口
   * @param {string} infoWindowId - 信息窗口ID
   */
  removeInfoWindow(infoWindowId) {
    if (!infoWindowId) return

    const infoWindowInstance = this.infoWindows.get(infoWindowId)
    if (infoWindowInstance && infoWindowInstance.infoWindow) {
      infoWindowInstance.infoWindow.remove()
      this.infoWindows.delete(infoWindowId)
      console.log(`✅ 成功移除信息窗口 ${infoWindowId}`)
    }
  }

  /**
   * 显示信息窗口
   * @param {string} infoWindowId - 信息窗口ID
   */
  showInfoWindow(infoWindowId) {
    const infoWindowInstance = this.infoWindows.get(infoWindowId)
    if (infoWindowInstance) {
      infoWindowInstance.show()
    }
  }

  /**
   * 隐藏信息窗口
   * @param {string} infoWindowId - 信息窗口ID
   */
  hideInfoWindow(infoWindowId) {
    const infoWindowInstance = this.infoWindows.get(infoWindowId)
    if (infoWindowInstance) {
      infoWindowInstance.hide()
    }
  }

  /**
   * 获取所有信息窗口
   * @returns {Array} 信息窗口列表
   */
  getAllInfoWindows() {
    return Array.from(this.infoWindows.values())
  }

  /**
   * 创建信息窗口内容
   * @param {object} options - 信息窗口配置
   * @param {string} infoWindowId - 信息窗口ID
   * @returns {HTMLElement} 内容元素
   * @private
   */
  _createInfoWindowContent(options, infoWindowId) {
    const content = options.content

    if (!content) {
      return document.createElement('div')
    }

    // 处理不同类型的内容
    if (typeof content === 'string') {
      // 字符串内容
      const div = document.createElement('div')
      div.innerHTML = content
      div.className = 'ht-map-infowindow-content'
      return div
    } else if (content instanceof HTMLElement) {
      // DOM元素
      content.className = content.className ? `${content.className} ht-map-infowindow-content` : 'ht-map-infowindow-content'
      return content
    } else if (typeof content === 'object' && content.template) {
      // 模板对象
      return this._createTemplateContent(content, infoWindowId)
    } else if (typeof content === 'object' && content.component) {
      // Vue组件
      return this._createVueComponentContent(content, infoWindowId)
    } else {
      // 默认处理
      const div = document.createElement('div')
      div.innerHTML = String(content)
      div.className = 'ht-map-infowindow-content'
      return div
    }
  }

  /**
   * 创建结构化内容
   * @param {object} template - 模板配置
   * @param {string} infoWindowId - 信息窗口ID
   * @returns {HTMLElement} 内容元素
   * @private
   */
  _createTemplateContent(template, infoWindowId) {
    const container = document.createElement('div')
    container.className = 'ht-map-infowindow-template'
    container.id = `infowindow-template-${infoWindowId}`

    // 添加标题
    if (template.title) {
      const title = this._addTitle(container, template.title)
    }

    // 添加内容
    if (template.content) {
      const contentDiv = document.createElement('div')
      contentDiv.className = 'ht-map-infowindow-body'
      contentDiv.innerHTML = template.content
      container.appendChild(contentDiv)
    }

    // 添加拖拽手柄
    if (template.draggable) {
      this._addDragHandle(container)
    }

    return container
  }

  /**
   * 添加拖拽手柄
   * @param {HTMLElement} container - 容器元素
   * @private
   */
  _addDragHandle(container) {
    const dragHandle = document.createElement('div')
    dragHandle.className = 'ht-map-infowindow-drag-handle'
    dragHandle.innerHTML = '⋮⋮'
    dragHandle.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      width: 20px;
      height: 20px;
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #666;
      user-select: none;
    `
    container.appendChild(dragHandle)
  }

  /**
   * 添加标题
   * @param {HTMLElement} container - 容器元素
   * @param {string|object} title - 标题内容
   * @returns {HTMLElement} 标题元素
   * @private
   */
  _addTitle(container, title) {
    const titleDiv = document.createElement('div')
    titleDiv.className = 'ht-map-infowindow-title'

    if (typeof title === 'string') {
      titleDiv.innerHTML = title
    } else if (typeof title === 'object') {
      titleDiv.innerHTML = title.text || ''
      if (title.style) {
        Object.assign(titleDiv.style, title.style)
      }
    }

    container.appendChild(titleDiv)
    return titleDiv
  }

  /**
   * 绑定信息窗口事件
   * @param {object} infoWindowInstance - 信息窗口实例
   * @param {object} options - 配置选项
   * @private
   */
  _bindInfoWindowEvents(infoWindowInstance, options) {
    if (!infoWindowInstance || !options) return

    // 如果启用拖拽，添加拖拽功能
    if (options.draggable) {
      this._enableInfoWindowDrag(infoWindowInstance)
    }

    // 绑定其他事件
    if (options.onOpen) {
      infoWindowInstance.onOpen = options.onOpen
    }

    if (options.onClose) {
      infoWindowInstance.onClose = options.onClose
    }

    if (options.onClick) {
      infoWindowInstance.onClick = options.onClick
    }
  }

  /**
   * 启用信息窗口拖拽功能
   * @param {object} infoWindowInstance - 信息窗口实例
   * @private
   */
  _enableInfoWindowDrag(infoWindowInstance) {
    const infoWindow = infoWindowInstance.infoWindow
    if (!infoWindow) return

    // 获取信息窗口元素
    const element = infoWindow.getElement()
    if (!element) return

    // 添加拖拽样式
    element.style.cursor = 'move'
    element.style.userSelect = 'none'

    // 实现拖拽逻辑
    let isDragging = false
    let startX = 0
    let startY = 0
    let startLng = 0
    let startLat = 0

    const handleMouseDown = (e) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      startLng = infoWindowInstance.lng
      startLat = infoWindowInstance.lat

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      e.preventDefault()
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      // 计算新的坐标（这里需要根据地图的像素到经纬度转换）
      // 这是一个简化的实现，实际应用中需要更精确的转换
      const newLng = startLng + (deltaX * 0.0001)
      const newLat = startLat - (deltaY * 0.0001)

      infoWindowInstance.setPosition(newLng, newLat)
    }

    const handleMouseUp = () => {
      isDragging = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    element.addEventListener('mousedown', handleMouseDown)
  }

  /**
   * 禁用信息窗口拖拽功能
   * @param {object} infoWindowInstance - 信息窗口实例
   * @private
   */
  _disableInfoWindowDrag(infoWindowInstance) {
    const infoWindow = infoWindowInstance.infoWindow
    if (!infoWindow) return

    const element = infoWindow.getElement()
    if (!element) return

    element.style.cursor = 'default'
    element.style.userSelect = 'auto'

    // 移除拖拽事件监听器
    // 这里需要保存事件监听器的引用以便移除
    // 简化实现，实际应用中需要更完善的事件管理
  }
}
