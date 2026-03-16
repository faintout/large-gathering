import BaseAdapter from '../../BaseAdapter.js'
import txBlackMapData from '../styles/blackStyle.js'
import txWhiteMapData from '../styles/whiteStyle.js'

/**
 * 腾讯地图核心
 * 只负责地图初始化、样式、视图模式与销毁
 */
export default class TencentMapCore extends BaseAdapter {
  constructor(containerId, options) {
    super(containerId, options)
    this.markers = new Map()
    this.tracks = new Map()
    this.eventListeners = new Map()
    this.init()
  }

  /**
   * 初始化腾讯地图
   */
  init() {
    if (typeof TMap === 'undefined') {
      throw new Error('腾讯地图SDK未加载，请先引入腾讯地图JavaScript API')
    }

    try {
      this.map = new TMap.Map(this.container, {
        center: new TMap.LatLng(this.options.center[1], this.options.center[0]) || new TMap.LatLng(40.8119, 114.884094),
        zoom: this.options.zoom || 15,
        pitch: this.options.viewMode === '2D' ? 0 : (this.options.pitch || 0),
        rotation: this.options.rotation || 0,
        viewMode: '3D',
        showControl: this.options.showControl || false,
        renderOptions: this.options.renderOptions,
      })

      if (this.options.viewMode === '2D') {
        this.map.setPitchable(false)
      }
      if (this.options.styleType == 'black') {
        this.map.setMapStyleConfig({ style: txBlackMapData })
      } else {
        this.map.setMapStyleConfig({ style: txWhiteMapData })
      }
    } catch (error) {
      console.error('腾讯地图初始化失败:', error)
      throw error
    }
  }

  /**
   * 设置视图模式 (2D/3D)
   */
  setViewMode(mode, options = {}) {
    if (!this.map) return
    if (mode === '3D') {
      this.map.setPitchable(true)
      const pitch = options.pitch || 45
      this.map.setPitch(pitch)
    } else {
      this.map.setPitchable(false)
      this.map.setPitch(0)
    }
  }

  /**
   * 设置样式类型
   */
  setStyleType(styleType) {
    if (!this.map) return
    if (styleType === 'black') {
      this.map.setMapStyleConfig({ style: txBlackMapData })
    } else {
      this.map.setMapStyleConfig({ style: txWhiteMapData })
    }
  }

  /**
   * 获取当前视图模式
   */
  getViewMode() {
    const pitch = this.map ? (this.map.getPitch ? this.map.getPitch() : (this.map.getTilt ? this.map.getTilt() : 0)) : 0
    return pitch > 0 ? '3D' : '2D'
  }

  /**
   * 获取当前样式类型
   */
  getStyleType() {
    if (!this.map) return this.options.styleType || 'default'
    if (this.map.getMapStyle) return this.map.getMapStyle()
    if (this.map.getStyle) return this.map.getStyle()
    return this.options.styleType || 'default'
  }

  /**
   * 获取原生地图实例
   */
  getNativeMap() {
    return this.map
  }

  /**
   * 销毁地图
   */
  destroy() {
    if (this.map) {
      this.map.destroy()
      this.map = null
    }
    super.destroy()
  }
}
