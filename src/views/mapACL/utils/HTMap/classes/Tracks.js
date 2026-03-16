/**
 * Tracks 类 - 实时车辆轨迹管理
 *
 * 使用方式（以协议为准，底层按此协议实现）：
 *   // 基础
 *   state.tracksObject = new HTMap.Tracks({ map: state.map })
 *   // 完整（含 id、minZoom、maxZoom、styles）
 *   state.tracksObject = new HTMap.Tracks({ id: '', map: state.map, minZoom: 3, maxZoom: 24, styles: [style, ...] })
 *   state.tracksObject.updateTracks({ itemsData: [...], options: { smoothTime, calculateAngle } })  // 更新轨迹数据
 *   state.tracksObject.stopTracks()           // 停止并移除所有轨迹
 *   state.tracksObject.removeTracks()           // 移除轨迹对象（包含停止所有轨迹）
 *   state.tracksObject.setInfoWindowVisible(true)   // 显示信息窗
 *   state.tracksObject.setInfoWindowVisible(false)  // 关闭信息窗
 *   state.tracksObject.updateTracks({ itemsData: [...], options: { smoothTime, calculateAngle } })  // 更新轨迹数据
 *
 * style 协议：{ id, width, height, src, carScale, contentScale, direction, offset }
 */
import defaultCarImage from '../assets/img/defaultCar.png'

export default class Tracks {
  /**
   * @param {object} options - 配置项
   * @param {object} options.map - 必填，传入的适配器，仅用于构造时解析底层 tracks 实例（与 Markers 的 this.markers 一致，存为 this.tracks）
   * @param {string} [options.id=''] - 可选，本 Tracks 实例 id，为空时自动生成
   * @param {number} [options.minZoom] - 可选，最小展示等级（传入后 addTrack 时作为默认值透传底层）
   * @param {number} [options.maxZoom] - 可选，最大展示等级（传入后 addTrack 时作为默认值透传底层）
   * @param {Array<object>} [options.styles] - 可选，样式数组；缺失或空时使用默认样式。每项见 style 协议
   */
  constructor(options = {}) {
    if (!options.map) {
      throw new Error('Tracks: map instance is required')
    }
    this.map = options.map
    this.id = options.id != null && options.id !== '' ? String(options.id) : `tracks_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.minZoom = options.minZoom !== undefined && options.minZoom !== null ? Number(options.minZoom) : undefined
    this.maxZoom = options.maxZoom !== undefined && options.maxZoom !== null ? Number(options.maxZoom) : undefined
    const defaultStyle = this._getDefaultTrackStyle(options)
    this._defaultStyleId = defaultStyle.id
    const hasStyles = Array.isArray(options.styles) && options.styles.length > 0
    this.styles = hasStyles
      ? [defaultStyle, ...this._validateAndNormalizeStyles(options.styles, options)]
      : [defaultStyle]
    
    // 底层 tracks 实例，由 addToMap() 异步赋值
    this.tracks = null
    
    // 参考 Markers：通过 addToMap 一次性把参数塞进去
    this.addToMap()
  }

  /**
   * 将轨迹层添加到地图（一次性传入 styles、minZoom、maxZoom 等配置）
   * 参考 Markers.addToMap：统一参数传入，支持异步返回
   */
  addToMap() {
    if (!this.map) return

    const tracksConfig = {
      map: this.map,
      id: this.id,
      styles: this.styles
    }
    if (this.minZoom !== undefined && this.minZoom !== null) {
      tracksConfig.minZoom = this.minZoom
    }
    if (this.maxZoom !== undefined && this.maxZoom !== null) {
      tracksConfig.maxZoom = this.maxZoom
    }

    const result = this.map.addTracks(tracksConfig)

    if (result && typeof result.then === 'function') {
      result.then(tracks => {
        this.tracks = tracks
        this._validateTracksResult()
      }).catch(() => {
        this.tracks = null
        console.error('Tracks.addToMap: 添加轨迹层失败')
      })
    } else {
      this.tracks = result
      this._validateTracksResult()
    }
  }

  _validateTracksResult() {
    if (!this.tracks || typeof this.tracks !== 'object') {
      this.tracks = null
    }
  }

  /**
   * 验证并标准化 styles：仅在有传入时使用，对每项补全缺省字段；不处理“未传入”情况（由 constructor 用默认样式）。
   * @param {Array<object>} styles - 样式数组（调用方保证非空）
   * @param {object} [options] - 构造选项（用于生成默认 id 等）
   * @returns {Array<object>} 标准化后的样式数组
   */
  _validateAndNormalizeStyles(styles, options = {}) {
    if (!Array.isArray(styles) || styles.length === 0) {
      return []
    }
    return styles.map((style, index) => {
      if (!style || typeof style !== 'object') {
        const baseId = this.id || options.id || 'temp'
        return {
          id: `track_style_${baseId}_${index}`,
          width: 8,
          height: 8,
          src: defaultCarImage,
          carScale: true,
          contentScale: true,
          direction: 'top',
          offset: { x: 0, y: 0 }
        }
      }
      const baseId = this.id || options.id || 'temp'
      return {
        id: style.id != null && style.id !== '' ? String(style.id) : `track_style_${baseId}_${index}`,
        width: Number(style.width) || 8,
        height: Number(style.height) || 8,
        src: style.src ?? defaultCarImage,
        carScale: style.carScale !== undefined ? Boolean(style.carScale) : true,
        contentScale: style.contentScale !== undefined ? Boolean(style.contentScale) : true,
        direction: style.direction || 'top',
        offset: style.offset && typeof style.offset === 'object'
          ? { x: Number(style.offset.x) || 0, y: Number(style.offset.y) || 0 }
          : { x: 0, y: 0 }
      }
    })
  }

  /**
   * 获取默认轨迹样式（样式缺失时的兜底）
   * @param {object} [options] - 构造选项
   * @returns {object}
   */
  _getDefaultTrackStyle(options = {}) {
    const baseId = this.id || options.id || 'temp'
    return {
      id: `default_track_style_${baseId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      width: 8,
      height: 8,
      src: defaultCarImage,
      carScale: true,
      contentScale: true,
      direction: 'top',
      offset: { x: 0, y: 0 }
    }
  }

  /**
   * 更新轨迹数据：按 itemsData 更新每条轨迹的位置、角度、信息窗等；options 控制平滑与角度计算。
   *
   * @param {object} payload - 更新数据
   * @param {Array<object>} payload.itemsData - 必填，数据数组。每项：id（必填）、styleId、contentDom（不传/字符串/div）、lngLat、heading
   * @param {object} [payload.options] - 可选。smoothTime 默认 1000ms；calculateAngle 默认 false（根据前后经纬度自动计算角度）
   */
  updateTracks(payload) {
    if (!this.tracks || typeof this.tracks.updateTracks !== 'function') {
      console.warn('Tracks.updateTracks: tracks 实例不可用')
      return
    }
    
    const normalized = this._normalizeUpdateTracksPayload(payload)
    if (!normalized) {
      console.warn('Tracks.updateTracks: 数据标准化失败', payload)
      return
    }
    
    try {
      this.tracks.updateTracks(normalized)
    } catch (error) {
      console.error('Tracks.updateTracks 执行错误', error)
    }
  }

  /**
   * 标准化 updateTracks 入参：校验 itemsData，补全 options 默认值。
   * @param {object} payload - { itemsData, options }
   * @returns {object|null} 标准化后的 payload，无效时返回 null
   * @private
   */
  _normalizeUpdateTracksPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      console.warn('Tracks._normalizeUpdateTracksPayload: payload 无效', payload)
      return null
    }
    
    const rawItems = payload.itemsData
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      console.warn('Tracks._normalizeUpdateTracksPayload: itemsData 无效', rawItems)
      return null
    }

    // 剔除没有 id 的数据（id 缺失、null、空字符串均剔除）
    const rawItemsWithId = rawItems.filter(
      item => item && typeof item === 'object' && item.id != null && item.id !== undefined
    )

    const itemsData = rawItemsWithId.map((item) => {
      const id = String(item.id)
      const lngLat = Array.isArray(item.lngLat) && item.lngLat.length >= 2
        ? [Number(item.lngLat[0]), Number(item.lngLat[1])]
        : null
      if (lngLat === null || (isNaN(lngLat[0]) || isNaN(lngLat[1]))) return null
      const styleId = item.styleId != null && item.styleId !== '' ? String(item.styleId) : (this._defaultStyleId || '')
      const heading = item.heading !== undefined && item.heading !== null ? Number(item.heading) : 0
      const contentDom = item.contentDom !== undefined ? item.contentDom : ''
      return {
        id,
        styleId,
        contentDom,
        lngLat,
        heading: isNaN(heading) ? 0 : heading
      }
    }).filter(Boolean)

    if (itemsData.length === 0) return null

    const rawOptions = payload.options && typeof payload.options === 'object' ? payload.options : {}
    const options = {
      smoothTime: rawOptions.smoothTime !== undefined && rawOptions.smoothTime !== null ? Number(rawOptions.smoothTime) : 1000,
      calculateAngle: rawOptions.calculateAngle !== undefined ? Boolean(rawOptions.calculateAngle) : false
    }
    if (isNaN(options.smoothTime) || options.smoothTime < 0) options.smoothTime = 1000

    return { itemsData, options }
  }

  /**
   * 停止并移除所有轨迹（先调用底层 stopTracks 停止动画/更新） 但不移除对象。
   */
  stopTracks() {
    if (!this.map) return
    if (!this.tracks) return
    try {
      if (typeof this.tracks.stopTracks === 'function') {
        this.tracks.stopTracks()
      }
    } catch (error) {
      // 静默处理错误
    } finally {

    }
  }

  /**
   * 移除轨迹对象，直接调用底层 tracks 实例的 removeTracks，同时停止并移除所有轨迹 ，不用和stopTracks 方法同时调用 。
   */
  removeTracks() {
    if (!this.map)  return
    if (!this.tracks) return
    if (typeof this.tracks.removeTracks !== 'function') return
    try {
      this.tracks.removeTracks()
    } catch (error) {
      // 静默处理错误
    } finally {
      this.tracks = null
    }
  }

  /**
   * 设置信息窗的可见性，直接调用底层 tracks 实例的 setInfoWindowVisible。
   * @param {boolean} visible - true 为显示，false 为关闭
   */
  setInfoWindowVisible(visible) {
    if (!this.tracks) {
      return
    }

    try {
      // 检查 markers 对象是否有 setVisible 方法
      if (typeof this.tracks.setInfoWindowVisible === 'function') {
        this.tracks.setInfoWindowVisible(visible)
        return
      }
    } catch (error) {
      // 静默处理错误
    }
  }

  /**
   * 设置车辆轨迹（车辆图标）点击回调，与 marker 点击事件格式对齐。
   * @param {(e: { type: string, lngLat: { lng: number, lat: number }, point: { x: number, y: number }, trackId: string, track: object }) => void} callback
   */
  setOnTrackClick(callback) {
    if (this.tracks && typeof this.tracks.setOnTrackClick === 'function') {
      this.tracks.setOnTrackClick(callback)
    }
  }
}
