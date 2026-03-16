import BaseAdapter from '../../BaseAdapter.js'
import { buildMineMapConfig } from '../../../config/minemapStyleConfig.js'
import { mineMapConfig } from '../../../config/defaultConfig.js'
/**
 * 四维图新MineMap核心功能
 * 只负责地图初始化和基础配置
 */
export default class MineMapCore extends BaseAdapter {
  constructor(containerId, options) {
    super(containerId, options)
    // 初始化标记点列表 - 参照腾讯地图实现
    this.markers = new Map()
    this.init()
  }

  /**
   * 初始化MineMap地图
   */
  init() {
    // 检查minemap是否已加载
    if (typeof minemap === 'undefined') {
      throw new Error('四维图新MineMap未加载，请先引入MineMap JavaScript API')
    }
    try {
      // 设置四维地图全局配置参数
      let environment = import.meta.env.VITE_ENV; // 张家口不同环境下面的配置
      const mapStyle = buildMineMapConfig(this.options.styleType || 'black')
      for (let key in mapStyle) {
        minemap[key] = mapStyle[key]
      }
      
      // 基础地图配置
      const mapOptions = {
        style: minemap.mapStyle, // 需要处理
        container: this.container,
        center: this.options.center || [114.884094, 40.8119],
        zoom: this.options.zoom || 15,
        pitch: this.options.pitch || 0,
        // bearing: this.options.bearing || 0,  //todo 这个参数需要确认
        minZoom: this.options.minZoom || 3,
        maxZoom: this.options.maxZoom || 24,
        showControl: this.options.showControl || false,
        enableExtendZoom: false,
        viewMode: this.options.viewMode,
      }

      // 创建地图实例
      this.map = new minemap.Map(mapOptions)
      // 如果是2D模式，则设置最大pitch为0，禁用倾斜功能
      if (this.options.viewMode === '2D') {
        this.map.setMaxPitch(0)
      } else {
        this.map.setMaxPitch(mineMapConfig.pitchRange[1])
      }
      console.log('MineMap 初始化成功')
    } catch (error) {
      console.error('MineMap 初始化失败:', error)
      throw error
    }
  }

  /**
   * 设置样式类型
   * @param {string} styleType - 样式类型
   */
  setStyleType(styleType) {
    if (!this.map) return

    try {
      let environment = import.meta.env.VITE_ENV
      const mapStyle = buildMineMapConfig(styleType)
      
      // 更新全局配置
      for (let key in mapStyle) {
        minemap[key] = mapStyle[key]
      }
      
      // 设置地图样式
      this.map.setStyle(minemap.mapStyle)
    } catch (error) {
      console.error('MineMap.setStyleType: 设置失败:', error)
    }
  }

  /**
   * 获取当前样式类型
   * @returns {string} 样式类型
   */
  getStyleType() {
    return this.options.styleType || 'black'
  }
  /**
   * 获取MineMap支持的最大倾斜角度
   * 根据当前视图模式返回不同的值
   * @returns {number} 最大倾斜角度
   */
  getMaxPitch() {
    // 如果是2D模式，最大pitch为0
    if (this.options.viewMode === '2D') {
      return 0
    }
    // 3D模式返回配置的最大值
    return mineMapConfig.pitchRange[1]
  }
  /**
   * 销毁地图
   */
  destroy() {
    try {
      // 清除所有标记点
      this.markers.clear()
      
      // 销毁地图实例
      if (this.map) {
        this.map.remove()
        this.map = null
      }
      
      console.log('MineMap 销毁成功')
    } catch (error) {
      console.error('MineMap.destroy: 销毁失败:', error)
    }
  }
}