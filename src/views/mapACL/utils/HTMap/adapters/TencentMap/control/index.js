/**
 * 腾讯地图 - 视图与视野控制
 * setView / setCenter / setZoom / getBounds / fitBounds / easeTo 等
 */
export default class ControlManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance
    this.map = mapInstance.map
  }

  setView(center, zoom) {
    if (!this.map) return
    const latlng = new TMap.LatLng(center[1], center[0])
    this.map.setCenter(latlng)
    if (zoom !== undefined) this.map.setZoom(zoom)
  }

  setCenter(center, options = {}) {
    if (!this.map) return
    const latlng = new TMap.LatLng(center[1], center[0])
    if (options.animate !== false) {
      this.map.panTo(latlng, { duration: options.duration || 1000, ...options })
    } else {
      this.map.setCenter(latlng)
    }
  }

  setZoom(zoom, options = {}) {
    if (!this.map) return
    const validZoom = Math.max(0, Math.min(22, zoom))
    if (options.animate !== false) {
      this.map.zoomTo(validZoom, { duration: options.duration || 1000, ...options })
    } else {
      this.map.setZoom(validZoom)
    }
  }

  setPitch(pitch) {
    if (!this.map) return
    const validPitch = Math.max(0, Math.min(60, pitch))
    if (this.map.setPitch) this.map.setPitch(validPitch)
    else if (this.map.setTilt) this.map.setTilt(validPitch)
  }

  setBearing(rotation) {
    if (!this.map) return
    const validRotation = ((rotation % 360) + 360) % 360
    this.map.setRotation(validRotation)
  }

  getBearing() {
    if (!this.map) return 0
    return this.map.getRotation()
  }

  getPitch() {
    if (!this.map) return 0
    if (this.map.getPitch) return this.map.getPitch()
    if (this.map.getTilt) return this.map.getTilt()
    return this.mapInstance.options?.pitch || 0
  }

  getRotation() {
    if (!this.map) return 0
    if (this.map.getRotation) return this.map.getRotation()
    if (this.map.getBearing) return this.map.getBearing()
    return this.mapInstance.options?.rotation || 0
  }

  async getCenter() {
    if (!this.map) return [0, 0]
    const center = await this.map.getCenter()
    return [center.lng, center.lat]
  }

  getZoom() {
    if (!this.map) return 0
    return this.map.getZoom()
  }

  getBounds() {
    if (!this.map) return null
    try {
      const center = this.map.getCenter()
      const zoom = this.map.getZoom()
      const offset = Math.pow(2, 15 - zoom) * 0.01
      return {
        sw: [center.lng - offset, center.lat - offset],
        ne: [center.lng + offset, center.lat + offset]
      }
    } catch (error) {
      console.error('TencentMap getBounds error:', error)
      return null
    }
  }

  _normalizeBoundsOptions(options) {
    const normalizedOptions = {}
    if (options.padding !== undefined) {
      if (typeof options.padding === 'number' || typeof options.padding === 'string') {
        normalizedOptions.padding = { top: options.padding, right: options.padding, bottom: options.padding, left: options.padding }
      } else if (Array.isArray(options.padding) && options.padding.length === 4) {
        normalizedOptions.padding = { top: options.padding[0] || 0, right: options.padding[1] || 0, bottom: options.padding[2] || 0, left: options.padding[3] || 0 }
      } else {
        normalizedOptions.padding = { top: 0, right: 0, bottom: 0, left: 0 }
      }
    } else {
      normalizedOptions.padding = { top: 0, right: 0, bottom: 0, left: 0 }
    }
    normalizedOptions.duration = Number(options.duration) || 1000
    normalizedOptions.minZoom = Number(options.minZoom) || 10
    normalizedOptions.maxZoom = Number(options.maxZoom) || 20
    if (options.duration) normalizedOptions.ease = { duration: options.duration }
    let bound = null
    if (options.sw && options.ne) {
      bound = new TMap.LatLngBounds(new TMap.LatLng(options.sw[1], options.sw[0]), new TMap.LatLng(options.ne[1], options.ne[0]))
    }
    return { bound, normalizedOptions }
  }

  limitBounds(bounds) {
    if (!this.map) return false
    try {
      const { bound } = this._normalizeBoundsOptions(bounds)
      this.map.setBoundary(bound)
      return true
    } catch (error) {
      console.error('TencentMap limitBounds error:', error)
      return false
    }
  }

  setBounds(bounds) {
    if (!this.map) return false
    try {
      const { bound, normalizedOptions } = this._normalizeBoundsOptions(bounds)
      this.map.fitBounds(bound, normalizedOptions)
      return true
    } catch (error) {
      console.error('TencentMap setBounds error:', error)
      return false
    }
  }

  easeTo(options) {
    if (!this.map) return false
    try {
      this.map.easeTo({
        center: new TMap.LatLng(options.center[1], options.center[0]),
        zoom: options.zoom,
        pitch: options.pitch,
        rotation: options.bearing
      }, { duration: options.duration || 1000 })
      return true
    } catch (error) {
      console.error('TencentMap easeTo error:', error)
      return false
    }
  }

  fitBounds(options) {
    if (!this.map) return false
    try {
      const { bound, normalizedOptions } = this._normalizeBoundsOptions(options)
      if (!bound) {
        console.error('fitBounds: 缺少边界坐标')
        return false
      }
      this.map.fitBounds(bound, normalizedOptions)
      return { success: true }
    } catch (error) {
      console.error('TencentMap fitBounds error:', error)
      return false
    }
  }
}
