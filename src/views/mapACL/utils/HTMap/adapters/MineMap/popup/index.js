import { parseCoordinates, transformCoordinates } from '../utils/index.js'

/**
 * 气泡管理器
 * 负责管理所有气泡相关的功能
 */
export default class PopupManager {
  constructor(mapInstance) {
    this.map = mapInstance.map
    this.popups = new Map()
  }

  /**
   * 添加自定义气泡 - 参照MineMap.js实现，兼容HTMap接口
   * @param {object} options - 气泡配置参数
   * @param {string} [options.id] - 气泡ID，不传则自动生成
   * @param {Array} options.lngLat - 坐标 [lng, lat]
   * @param {string|HTMLElement|object} options.content - 气泡内容（文字、div、Vue组件等）
   * @param {object} [options.offset={x:0, y:0}] - 偏移量，x方向向右偏移为正值，y方向向下偏移为正值
   * @param {boolean} [options.showCloseBtn=false] - 是否显示关闭按钮
   * @param {boolean} [options.enableCustom=false] - 是否启用自定义窗体
   * @param {string|number} [options.width] - 宽度
   * @param {string|number} [options.height] - 高度
   * @param {string|number} [options.minWidth] - 最小宽度
   * @param {string|number} [options.minHeight] - 最小高度
   * @param {string|number} [options.maxWidth] - 最大宽度
   * @param {string|number} [options.maxHeight] - 最大高度
   * @param {string} [options.backgroundColor] - 背景颜色
   * @param {string} [options.color] - 文字颜色
   * @param {string} [options.fontSize] - 字体大小
   * @param {string} [options.borderRadius] - 圆角
   * @param {string} [options.padding] - 内边距
   * @param {string} [options.border] - 边框
   * @param {string} [options.boxShadow] - 阴影
   * @param {string} [options.className] - CSS类名
   * @param {function} [options.onClick] - 点击回调
   * @param {function} [options.onClose] - 关闭回调
   * @param {function} [options.onOpen] - 打开回调
   * @returns {object} 气泡实例
   */
  addPopup(options) {
    console.log('addPopup', options);
    
    if (!this.map) {
      console.warn('PopupManager.addPopup: 地图未初始化')
      return null
    }

    // 验证必要参数 - 参照MineMap.js的验证逻辑
    if (!options.lngLat && (!options.lng || !options.lat) && !options.position) {
      console.warn('PopupManager.addPopup: 缺少位置参数 (lngLat、lng/lat 或 position)')
      return null
    }

    if (!options.content) {
      console.warn('PopupManager.addPopup: 缺少内容参数 (content)')
      return null
    }

    try {
      // 处理坐标格式 - 支持多种坐标格式
      const coordinates = parseCoordinates(options)
      
      // 生成唯一ID
      const popupId = options.id || `popup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 处理偏移量 - 支持对象和数组格式
      const offset = options.offset || { x: 0, y: 0 }
      const offsetArray = Array.isArray(options.offset) 
        ? options.offset 
        : [offset.x || 0, offset.y || 0]

      // 创建气泡内容 - 支持多种内容类型
      const popupContent = this._createPopupContent(options, popupId)

      // 应用样式到内容元素
      this._applyPopupStyle(popupContent, options)

      // 创建 MineMap Popup 实例 - 参照MineMap.js的配置
      const popupOptions = {
        closeButton: options.showCloseBtn || false,
        closeOnClick: options.closeOnClick || false,
        closeOnMove: false,
        focusAfterOpen: true,
        offset: offsetArray,
        maxWidth: options.maxWidth || 'none',
        className: options.className || 'ht-map-popup'
      }

      const popup = new minemap.Popup(popupOptions)
        .setLngLat(coordinates)
        .setDOMContent(popupContent)
        .addTo(this.map)

      // 绑定事件 - 参照MineMap.js的事件处理
      this._bindPopupEvents(popup, popupContent, coordinates, options)

      // 创建气泡实例对象 - 参照MineMap.js的返回格式
      const popupInstance = {
        id: popupId,
        popup: popup,
        element: popupContent,
        lngLat: coordinates,
        lng: coordinates[0],
        lat: coordinates[1],
        content: options.content,
        params: options,
        offset: offset
      }

      // 添加MineMap风格的方法 - 参照MineMap.js的实现
      popupInstance.removePopup = () => {
        if (popup) {
          popup.remove()
          this.popups.delete(popupId)
        }
        return popupInstance
      }

      // 保持HTMap兼容的方法
      popupInstance.remove = popupInstance.removePopup

      // 位置相关方法 - 参照MineMap.js
      popupInstance.setLngLat = (lngLat) => {
        const coords = Array.isArray(lngLat) ? lngLat : [lngLat, arguments[1]]
        popup.setLngLat(coords)
        popupInstance.lngLat = coords
        popupInstance.lng = coords[0]
        popupInstance.lat = coords[1]
        return popupInstance
      }

      popupInstance.setPosition = popupInstance.setLngLat

      popupInstance.getLngLat = () => popupInstance.lngLat

      popupInstance.getPosition = () => ({
        lng: popupInstance.lng,
        lat: popupInstance.lat
      })

      // 内容相关方法 - 参照MineMap.js
      popupInstance.setContent = (content) => {
        const newContent = this._createPopupContent({ content }, popupId)
        this._applyPopupStyle(newContent, { ...options, content })
        popup.setDOMContent(newContent)
        popupInstance.content = content
        popupInstance.element = newContent
        return popupInstance
      }

      popupInstance.getContent = () => popupInstance.content

      // 样式相关方法 - 参照MineMap.js
      popupInstance.setStyle = (property, value) => {
        if (popupContent && popupContent.style) {
          popupContent.style[property] = value
        }
        return popupInstance
      }

      popupInstance.getStyle = (property) => {
        if (popupContent && popupContent.style) {
          return popupContent.style[property]
        }
        return null
      }

      popupInstance.updateStyle = (styleObj) => {
        if (popupContent && styleObj) {
          this._applyPopupStyle(popupContent, styleObj)
        }
        return popupInstance
      }

      // 显示/隐藏方法 - 参照MineMap.js
      popupInstance.show = () => {
        if (popup) {
          popup.addTo(this.map)
        }
        return popupInstance
      }

      popupInstance.hide = () => {
        if (popup) {
          popup.remove()
        }
        return popupInstance
      }

      // 获取DOM元素方法 - 参照MineMap.js
      popupInstance.getElement = () => popupContent

      // 事件相关方法 - 参照MineMap.js
      popupInstance.on = (eventType, handler) => {
        if (popupContent && typeof handler === 'function') {
          popupContent.addEventListener(eventType, handler)
        }
        return popupInstance
      }

      popupInstance.off = (eventType, handler) => {
        if (popupContent && typeof handler === 'function') {
          popupContent.removeEventListener(eventType, handler)
        }
        return popupInstance
      }

      // 存储气泡实例
      this.popups.set(popupId, popupInstance)

      return popupInstance
    } catch (error) {
      console.error('PopupManager.addPopup: 添加气泡失败:', error)
      return null
    }
  }

  /**
   * 移除气泡 - 仿照TencentMap风格，兼容HTMap接口
   * @param {string|object} popup - 气泡ID或气泡实例
   */
  removePopup(popup) {
    if (!popup) return

    if (typeof popup === 'string') {
      // 传入的是气泡ID
      const popupInstance = this.popups.get(popup)
      if (popupInstance && popupInstance.removePopup) {
        popupInstance.removePopup()
      }
    } else if (popup && popup.removePopup) {
      // 传入的是气泡对象，直接调用其removePopup方法
      popup.removePopup()
    } else if (popup && popup.remove) {
      // 传入的是气泡对象，直接调用其remove方法
      popup.remove()
    } else {
      console.warn('PopupManager.removePopup: 无效的气泡参数')
    }
  }

  /**
   * 创建气泡内容 - 参照MineMap.js实现，支持多种内容类型
   * @param {object} params - 气泡参数
   * @param {string} popupId - 气泡ID
   * @returns {HTMLElement} 气泡内容元素
   * @private
   */
  _createPopupContent(params, popupId) {
    const content = params.content

    if (!content) {
      const div = document.createElement('div')
      div.className = 'ht-map-popup-content'
      return div
    }

    // 处理不同类型的内容 - 参照MineMap.js的实现
    if (typeof content === 'string') {
      // 字符串内容
      const div = document.createElement('div')
      div.innerHTML = content
      div.className = 'ht-map-popup-content'
      return div
    } else if (content instanceof HTMLElement) {
      // DOM元素
      const clonedElement = content
      if (!clonedElement.className || !clonedElement.className.includes('ht-map-popup-content')) {
        clonedElement.className = clonedElement.className 
          ? `${clonedElement.className} ht-map-popup-content` 
          : 'ht-map-popup-content'
      }
      return clonedElement
    } else if (typeof content === 'object' && content.template) {
      // 模板对象
      return this._createTemplateContent(content, popupId)
    } else if (typeof content === 'object' && content.component) {
      // Vue组件
      return this._createVueComponentContent(content, popupId)
    } else if (typeof content === 'function') {
      // 函数内容
      try {
        const result = content(params)
        if (result instanceof HTMLElement) {
          result.className = result.className 
            ? `${result.className} ht-map-popup-content` 
            : 'ht-map-popup-content'
          return result
        } else {
          const div = document.createElement('div')
          div.innerHTML = String(result)
          div.className = 'ht-map-popup-content'
          return div
        }
      } catch (error) {
        console.error('PopupManager._createPopupContent: 函数内容执行失败:', error)
        const div = document.createElement('div')
        div.innerHTML = '内容渲染失败'
        div.className = 'ht-map-popup-content'
        return div
      }
    } else {
      // 默认处理
      const div = document.createElement('div')
      div.innerHTML = String(content)
      div.className = 'ht-map-popup-content'
      return div
    }
  }

  /**
   * 创建模板内容 - 参照MineMap.js实现
   * @param {object} templateObj - 模板对象
   * @param {string} popupId - 气泡ID
   * @returns {HTMLElement} 模板内容元素
   * @private
   */
  _createTemplateContent(templateObj, popupId) {
    const { template, data = {}, style = {} } = templateObj
    
    if (!template) {
      console.warn('PopupManager._createTemplateContent: 缺少template属性')
      return document.createElement('div')
    }

    try {
      // 创建容器元素
      const container = document.createElement('div')
      container.className = 'ht-map-popup-content ht-map-popup-template'
      container.setAttribute('data-popup-id', popupId)

      // 处理模板字符串
      let htmlContent = template
      
      // 简单的模板变量替换
      if (typeof data === 'object') {
        Object.keys(data).forEach(key => {
          const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
          htmlContent = htmlContent.replace(placeholder, String(data[key] || ''))
        })
      }

      // 设置HTML内容
      container.innerHTML = htmlContent

      // 应用样式
      if (typeof style === 'object') {
        Object.keys(style).forEach(property => {
          container.style[property] = style[property]
        })
      }

      return container
    } catch (error) {
      console.error('PopupManager._createTemplateContent: 模板创建失败:', error)
      const div = document.createElement('div')
      div.innerHTML = '模板渲染失败'
      div.className = 'ht-map-popup-content'
      return div
    }
  }

  /**
   * 创建Vue组件内容 - 参照MineMap.js实现
   * @param {object} componentObj - 组件对象
   * @param {string} popupId - 气泡ID
   * @returns {HTMLElement} Vue组件内容元素
   * @private
   */
  _createVueComponentContent(componentObj, popupId) {
    const { component, props = {}, style = {} } = componentObj
    
    if (!component) {
      console.warn('PopupManager._createVueComponentContent: 缺少component属性')
      return document.createElement('div')
    }

    try {
      // 创建容器元素
      const container = document.createElement('div')
      container.className = 'ht-map-popup-content ht-map-popup-vue-component'
      container.setAttribute('data-popup-id', popupId)

      // 检查Vue是否可用
      if (typeof Vue === 'undefined' && typeof window.Vue === 'undefined') {
        console.warn('PopupManager._createVueComponentContent: Vue未加载，使用降级方案')
        container.innerHTML = '<div>Vue组件需要Vue环境</div>'
        return container
      }

      // 获取Vue实例
      const VueConstructor = Vue || window.Vue
      
      // 创建Vue实例
      const vueInstance = new VueConstructor({
        render: h => h(component, { props }),
        mounted() {
          // 将Vue实例挂载到容器
          this.$mount()
          container.appendChild(this.$el)
        }
      })

      // 存储Vue实例引用，便于后续清理
      container._vueInstance = vueInstance

      // 应用样式
      if (typeof style === 'object') {
        Object.keys(style).forEach(property => {
          container.style[property] = style[property]
        })
      }

      return container
    } catch (error) {
      console.error('PopupManager._createVueComponentContent: Vue组件创建失败:', error)
      const div = document.createElement('div')
      div.innerHTML = 'Vue组件渲染失败'
      div.className = 'ht-map-popup-content'
      return div
    }
  }

  /**
   * 处理内容自适应尺寸
   * @param {HTMLElement} contentElement - 内容元素
   * @param {object} params - 参数
   * @private
   */
  _handleContentAutoSize(contentElement, params) {
    if (!contentElement) return

    // 设置最大宽度
    const maxWidth = params.maxWidth || '300px'
    if (maxWidth !== 'none') {
      contentElement.style.maxWidth = maxWidth
    }

    // 设置最大高度
    const maxHeight = params.maxHeight || '200px'
    if (maxHeight !== 'none') {
      contentElement.style.maxHeight = maxHeight
      contentElement.style.overflowY = 'auto'
    }

    // 自适应宽度
    if (params.autoWidth) {
      contentElement.style.width = 'auto'
      contentElement.style.minWidth = '100px'
    }

    // 自适应高度
    if (params.autoHeight) {
      contentElement.style.height = 'auto'
      contentElement.style.minHeight = '50px'
    }
  }

  /**
   * 应用气泡样式 - 参照MineMap.js实现，支持更多样式属性
   * @param {HTMLElement} element - 气泡元素
   * @param {object} style - 样式配置
   * @private
   */
  _applyPopupStyle(element, style) {
    if (!element || !style) return

    // 基础样式
    const basicStyles = {
      backgroundColor: style.backgroundColor || style.background,
      color: style.color || style.textColor,
      border: style.border,
      borderRadius: style.borderRadius,
      padding: style.padding,
      margin: style.margin,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily,
      lineHeight: style.lineHeight,
      textAlign: style.textAlign,
      textDecoration: style.textDecoration,
      textTransform: style.textTransform,
      letterSpacing: style.letterSpacing,
      wordSpacing: style.wordSpacing
    }

    // 应用基础样式
    Object.keys(basicStyles).forEach(property => {
      if (basicStyles[property] !== undefined) {
        element.style[property] = basicStyles[property]
      }
    })

    // 背景相关样式
    if (style.backgroundImage) {
      element.style.backgroundImage = style.backgroundImage
    }
    if (style.backgroundSize) {
      element.style.backgroundSize = style.backgroundSize
    }
    if (style.backgroundPosition) {
      element.style.backgroundPosition = style.backgroundPosition
    }
    if (style.backgroundRepeat) {
      element.style.backgroundRepeat = style.backgroundRepeat
    }

    // 边框相关样式
    if (style.borderColor) {
      element.style.borderColor = style.borderColor
    }
    if (style.borderWidth) {
      element.style.borderWidth = this._validateSize(style.borderWidth, '1px')
    }
    if (style.borderStyle) {
      element.style.borderStyle = style.borderStyle
    }
    if (style.borderTop) {
      element.style.borderTop = style.borderTop
    }
    if (style.borderRight) {
      element.style.borderRight = style.borderRight
    }
    if (style.borderBottom) {
      element.style.borderBottom = style.borderBottom
    }
    if (style.borderLeft) {
      element.style.borderLeft = style.borderLeft
    }

    // 尺寸样式
    const sizeStyles = {
      width: style.width,
      height: style.height,
      minWidth: style.minWidth,
      minHeight: style.minHeight,
      maxWidth: style.maxWidth,
      maxHeight: style.maxHeight
    }

    Object.keys(sizeStyles).forEach(property => {
      if (sizeStyles[property] !== undefined) {
        element.style[property] = this._validateSize(sizeStyles[property], this._getDefaultSize(property))
      }
    })

    // 阴影和效果样式
    if (style.boxShadow) {
      element.style.boxShadow = style.boxShadow
    }
    if (style.opacity !== undefined) {
      element.style.opacity = style.opacity
    }
    if (style.transform) {
      element.style.transform = style.transform
    }
    if (style.transition) {
      element.style.transition = style.transition
    }
    if (style.animation) {
      element.style.animation = style.animation
    }

    // 定位和布局样式
    if (style.position) {
      element.style.position = style.position
    }
    if (style.zIndex !== undefined) {
      element.style.zIndex = style.zIndex
    }
    if (style.display) {
      element.style.display = style.display
    }
    if (style.overflow) {
      element.style.overflow = style.overflow
    }
    if (style.overflowX) {
      element.style.overflowX = style.overflowX
    }
    if (style.overflowY) {
      element.style.overflowY = style.overflowY
    }

    // 文字相关样式
    if (style.wordWrap) {
      element.style.wordWrap = style.wordWrap
    }
    if (style.whiteSpace) {
      element.style.whiteSpace = style.whiteSpace
    }
    if (style.wordBreak) {
      element.style.wordBreak = style.wordBreak
    }
    if (style.textOverflow) {
      element.style.textOverflow = style.textOverflow
    }

    // 弹性布局样式
    if (style.flexDirection) {
      element.style.flexDirection = style.flexDirection
    }
    if (style.justifyContent) {
      element.style.justifyContent = style.justifyContent
    }
    if (style.alignItems) {
      element.style.alignItems = style.alignItems
    }
    if (style.flexWrap) {
      element.style.flexWrap = style.flexWrap
    }

    // 处理自定义样式对象
    if (style.styles && typeof style.styles === 'object') {
      Object.keys(style.styles).forEach(property => {
        element.style[property] = style.styles[property]
      })
    }

    // 处理CSS类名
    if (style.className) {
      const existingClasses = element.className.split(' ').filter(cls => cls.trim())
      const newClasses = style.className.split(' ').filter(cls => cls.trim())
      const allClasses = [...new Set([...existingClasses, ...newClasses])]
      element.className = allClasses.join(' ')
    }

    // 处理内联样式字符串
    if (style.style && typeof style.style === 'string') {
      element.setAttribute('style', element.getAttribute('style') + ';' + style.style)
    }
  }

  /**
   * 获取默认尺寸值
   * @param {string} property - 样式属性名
   * @returns {string} 默认值
   * @private
   */
  _getDefaultSize(property) {
    const defaults = {
      width: '200px',
      height: 'auto',
      minWidth: '100px',
      minHeight: '50px',
      maxWidth: '300px',
      maxHeight: '200px'
    }
    return defaults[property] || 'auto'
  }

  // 样式验证辅助方法
  _validateSize(value, defaultValue) {
    if (typeof value === 'number') {
      return `${value}px`
    } else if (typeof value === 'string') {
      return value
    } else {
      return defaultValue
    }
  }

  /**
   * 获取所有气泡实例
   * @returns {Map} 气泡实例Map
   */
  getAllPopups() {
    return this.popups
  }

  /**
   * 根据ID获取气泡实例
   * @param {string} popupId - 气泡ID
   * @returns {object|null} 气泡实例
   */
  getPopup(popupId) {
    return this.popups.get(popupId) || null
  }

  /**
   * 清除所有气泡
   */
  clearAllPopups() {
    this.popups.forEach((popupInstance) => {
      if (popupInstance && popupInstance.removePopup) {
        popupInstance.removePopup()
      }
    })
    this.popups.clear()
  }

  /**
   * 批量移除气泡
   * @param {Array} popupIds - 气泡ID数组
   */
  removePopups(popupIds) {
    if (!Array.isArray(popupIds)) {
      console.warn('PopupManager.removePopups: 参数必须是数组')
      return
    }

    popupIds.forEach(popupId => {
      this.removePopup(popupId)
    })
  }

  /**
   * 更新气泡位置
   * @param {string} popupId - 气泡ID
   * @param {Array} lngLat - 新坐标
   */
  updatePopupPosition(popupId, lngLat) {
    const popupInstance = this.popups.get(popupId)
    if (popupInstance && popupInstance.setLngLat) {
      popupInstance.setLngLat(lngLat)
    } else {
      console.warn(`PopupManager.updatePopupPosition: 未找到气泡 ${popupId}`)
    }
  }

  /**
   * 更新气泡内容
   * @param {string} popupId - 气泡ID
   * @param {string|HTMLElement|object} content - 新内容
   */
  updatePopupContent(popupId, content) {
    const popupInstance = this.popups.get(popupId)
    if (popupInstance && popupInstance.setContent) {
      popupInstance.setContent(content)
    } else {
      console.warn(`PopupManager.updatePopupContent: 未找到气泡 ${popupId}`)
    }
  }

  /**
   * 更新气泡样式
   * @param {string} popupId - 气泡ID
   * @param {object} style - 新样式
   */
  updatePopupStyle(popupId, style) {
    const popupInstance = this.popups.get(popupId)
    if (popupInstance && popupInstance.updateStyle) {
      popupInstance.updateStyle(style)
    } else {
      console.warn(`PopupManager.updatePopupStyle: 未找到气泡 ${popupId}`)
    }
  }

  /**
   * 绑定气泡事件 - 参照MineMap.js实现
   * @param {object} popup - MineMap Popup实例
   * @param {HTMLElement} popupContent - 气泡内容元素
   * @param {Array} coordinates - 坐标
   * @param {object} params - 气泡参数
   * @private
   */
  _bindPopupEvents(popup, popupContent, coordinates, params) {
    if (!popup || !popupContent) return

    // 绑定MineMap Popup原生事件
    if (params.onOpen && typeof params.onOpen === 'function') {
      popup.on('open', () => {
        try {
          params.onOpen({
            popup: popup,
            element: popupContent,
            lngLat: coordinates,
            lng: coordinates[0],
            lat: coordinates[1]
          })
        } catch (error) {
          console.error('PopupManager._bindPopupEvents: onOpen回调执行失败:', error)
        }
      })
    }

    if (params.onClose && typeof params.onClose === 'function') {
      popup.on('close', () => {
        try {
          params.onClose({
            popup: popup,
            element: popupContent,
            lngLat: coordinates,
            lng: coordinates[0],
            lat: coordinates[1]
          })
        } catch (error) {
          console.error('PopupManager._bindPopupEvents: onClose回调执行失败:', error)
        }
      })
    }

    // 绑定内容元素事件
    if (params.onClick && typeof params.onClick === 'function') {
      popupContent.addEventListener('click', (event) => {
        try {
          params.onClick({
            event: event,
            popup: popup,
            element: popupContent,
            lngLat: coordinates,
            lng: coordinates[0],
            lat: coordinates[1]
          })
        } catch (error) {
          console.error('PopupManager._bindPopupEvents: onClick回调执行失败:', error)
        }
      })
    }

    // 绑定其他常用事件
    const eventMappings = {
      onMouseEnter: 'mouseenter',
      onMouseLeave: 'mouseleave',
      onMouseOver: 'mouseover',
      onMouseOut: 'mouseout',
      onFocus: 'focus',
      onBlur: 'blur'
    }

    Object.keys(eventMappings).forEach(eventKey => {
      if (params[eventKey] && typeof params[eventKey] === 'function') {
        const eventType = eventMappings[eventKey]
        popupContent.addEventListener(eventType, (event) => {
          try {
            params[eventKey]({
              event: event,
              popup: popup,
              element: popupContent,
              lngLat: coordinates,
              lng: coordinates[0],
              lat: coordinates[1]
            })
          } catch (error) {
            console.error(`PopupManager._bindPopupEvents: ${eventKey}回调执行失败:`, error)
          }
        })
      }
    })

    // 绑定键盘事件
    if (params.onKeyDown && typeof params.onKeyDown === 'function') {
      popupContent.addEventListener('keydown', (event) => {
        try {
          params.onKeyDown({
            event: event,
            popup: popup,
            element: popupContent,
            lngLat: coordinates,
            lng: coordinates[0],
            lat: coordinates[1]
          })
        } catch (error) {
          console.error('PopupManager._bindPopupEvents: onKeyDown回调执行失败:', error)
        }
      })
    }

    // 设置可聚焦，以便接收键盘事件
    if (params.onKeyDown || params.onFocus || params.onBlur) {
      popupContent.setAttribute('tabindex', '0')
    }
  }
}

