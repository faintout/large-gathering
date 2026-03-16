/**
 * Popup 类 - 用于管理单个弹窗
 * 提供弹窗的创建、显示、隐藏、更新等功能
 */
export default class Popup {
  constructor(options = {}) {
    // 数据校验
    if (!options.map) {
      throw new Error('Popup: map instance is required')
    }

    this.popup = null // 单个popup对象
    this.map = options.map
    this.id = options.id || `popup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 验证lngLat数据
    if (!this._validateLngLat(options.lngLat)) {
      throw new Error('Popup: lngLat is required and must be an array with 2 valid numbers [lng, lat]')
    }
    this.lngLat = options.lngLat
    this.content = options.content || '默认Popup内容'
    this.offset = options.offset || { x: 0, y: 0 }
    this.showCloseBtn = options.showCloseBtn !== undefined ? options.showCloseBtn : false
    this.closeOnClick = options.closeOnClick !== undefined ? options.closeOnClick : false
    this.enableCustom = options.enableCustom || false, // 是否自定义信息窗体
    
    // 立即添加到地图
    this.addToMap()
  }

  // 验证lngLat数据
  _validateLngLat(lngLat) {
    // 检查是否存在
    if (!lngLat) {
      return false
    }
    // 检查是否为数组
    if (!Array.isArray(lngLat)) {
      return false
    }
    // 检查数组长度
    if (lngLat.length !== 2) {
      return false
    }
    
    // 检查经纬度是否可以转换为有效数字
    const lng = Number(lngLat[0])
    const lat = Number(lngLat[1])
    
    if (isNaN(lng) || isNaN(lat)) {
      return false
    }
    // 检查经纬度范围
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return false
    }
    return true
  }

  // 添加弹窗到地图
  addToMap() {
    if (!this.map) return
    
    // 准备传递给地图的参数
    const params = {
      map: this.map,
      id: this.id,
      lngLat: this.lngLat,
      content: this.content,
      offset: this.offset,
      showCloseBtn: this.showCloseBtn,
      enableCustom: this.enableCustom,
      closeOnClick: this.closeOnClick,
    }
    
    // 调用地图的单个添加方法
    this.popup = this.map.addPopup(params)
    
    // 验证返回结果
    if (!this.popup) {
      console.warn('Popup: addPopup 返回的结果为空')
    }
  }

  // 从地图移除弹窗
  removePopup() {
    if (!this.map) return
    if (this.popup && typeof this.popup.removePopup === 'function') {
      this.popup.removePopup()
    }
    this.popup = null
  }

  // 获取popup内容
  getElement() {
    if (!this.map) return
    if (this.popup && typeof this.popup.getElement === 'function') {
      return this.popup.getElement()
    }
  }

  /**
   * 更新弹窗位置
   * @param {Array} newLngLat - 新的坐标 [lng, lat]
   */
  setLngLat(newLngLat) {
    // 验证新坐标
    if (!this._validateLngLat(newLngLat)) {
      console.warn('Popup.setLngLat: 无效的坐标格式')
      return
    }

    if (!this.popup) {
      console.warn('Popup.setLngLat: 弹窗未初始化')
      return
    }

    try {
      // 检查地图弹窗对象是否有 setLngLat 方法
      if (typeof this.popup.setLngLat === 'function') {
        this.popup.setLngLat(newLngLat)

        // 更新本地数据
        this.lngLat = newLngLat
      } else {
        console.warn('Popup.setLngLat: 地图不支持动态更新弹窗位置')
      }
    } catch (error) {
      console.error('Popup.setLngLat: 更新弹窗位置失败:', error)
    }
  }

  /**
   * 更新弹窗内容
   * @param {string} newContent - 新的内容
   */
  setContent(newContent) {
    if (!newContent) {
      console.warn('Popup.setContent: 需要提供有效的内容')
      return
    }

    if (!this.popup) {
      console.warn('Popup.setContent: 弹窗未初始化')
      return
    }

    try {
      // 检查地图弹窗对象是否有 setContent 方法
      if (typeof this.popup.setContent === 'function') {
        this.popup.setContent(newContent)

        // 更新本地数据
        this.content = newContent
      } else {
        console.warn('Popup.setContent: 地图不支持动态更新弹窗内容')
      }
    } catch (error) {
      console.error('Popup.setContent: 更新弹窗内容失败:', error)
    }
  }


  // 为popup绑定事件
  on(eventType, callback) {
    if (!eventType || typeof callback !== 'function') {
      console.warn('Popup.on: 需要提供有效的事件类型和回调函数')
      return this
    }

    // 使用递归检查确保弹窗已创建
    const checkAndBindEvents = (retryCount = 0) => {
      // 检查this.popup是否存在且为对象
      if (!this.popup || typeof this.popup !== 'object') {
        if (retryCount < 20) {
          // 如果弹窗还没创建完成，等待50ms后重试
          setTimeout(() => checkAndBindEvents(retryCount + 1), 50)
          return
        } else {
          console.warn('Popup.on: 弹窗创建失败，无法绑定事件')
          return
        }
      }

      // 直接调用this.popup的on方法
      if (typeof this.popup.on === 'function') {
        this.popup.on(eventType, callback)
      }
    }

    checkAndBindEvents()
    return this
  }

  // 为popup解绑事件
  off(eventType, callback) {
    if (!eventType) {
      console.warn('Popup.off: 需要提供有效的事件类型')
      return this
    }

    // 使用递归检查确保弹窗已创建
    const checkAndUnbindEvents = (retryCount = 0) => {
      // 检查this.popup是否存在且为对象
      if (!this.popup || typeof this.popup !== 'object') {
        if (retryCount < 20) {
          // 如果弹窗还没创建完成，等待50ms后重试
          setTimeout(() => checkAndUnbindEvents(retryCount + 1), 50)
          return
        } else {
          console.warn('Popup.off: 弹窗创建失败，无法解绑事件')
          return
        }
      }

      // 直接调用this.popup的off方法
      if (typeof this.popup.off === 'function') {
        this.popup.off(eventType, callback)
      }
    }

    checkAndUnbindEvents()
    return this
  }
}
