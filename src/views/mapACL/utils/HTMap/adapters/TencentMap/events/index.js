/**
 * 腾讯地图事件管理器
 * 负责 on/off/triggerEvent 及原生事件桥接
 */
export default class EventManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance
    this.map = mapInstance.map
    this.eventListeners = new Map()
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
      this._bindNativeEvent(event)
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (!this.eventListeners.has(event)) return
    if (callback) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) listeners.splice(index, 1)
    } else {
      this.eventListeners.delete(event)
    }
  }

  triggerEvent(event, data) {
    if (!this.eventListeners.has(event)) return
    const listeners = this.eventListeners.get(event)
    listeners.forEach(callback => {
      try { callback(data) } catch (error) {
        console.error(`事件 ${event} 回调执行错误:`, error)
      }
    })
  }

  _bindNativeEvent(event) {
    if (!this.map) return
    const trigger = (data) => this.triggerEvent(event, data)
    switch (event) {
      case 'click':
        this.map.on('click', (evt) => {
          trigger({ lngLat: evt.latLng, point: evt.point, target: evt.target, originalEvent: evt.originalEvent, type: 'click', timestamp: Date.now() })
        })
        break
      case 'dblclick':
        this.map.on('dblclick', (evt) => {
          trigger({ lngLat: evt.latLng, pixel: evt.pixel, type: 'dblclick', timestamp: Date.now() })
        })
        break
      case 'contextmenu':
        this.map.on('rightclick', (evt) => {
          trigger({ lngLat: evt.latLng, pixel: evt.pixel, type: 'contextmenu', timestamp: Date.now() })
        })
        break
      case 'movestart':
        this.map.on('panstart', (evt) => {
          trigger({ lngLat: evt.latLng, type: 'movestart', timestamp: Date.now() })
        })
        break
      case 'move':
        this.map.on('pan', (evt) => {
          trigger({ lngLat: evt.latLng, type: 'move', timestamp: Date.now() })
        })
        break
      case 'moveend':
        this.map.on('panend', (evt) => {
          trigger({ center: evt.center, type: 'moveend', timestamp: Date.now() })
        })
        break
      case 'zoom':
        this.map.on('zoom', (evt) => {
          trigger({ zoom: evt.zoom, type: 'zoom', timestamp: Date.now() })
          this.triggerEvent('viewport', {
            center: this.map.getCenter(),
            zoom: evt.zoom,
            pitch: this.map.getPitch(),
            rotation: this.map.getRotation(),
            type: 'viewport',
            timestamp: Date.now()
          })
        })
        break
      case 'dragstart':
        this.map.on('dragstart', () => trigger({ type: 'drag_start', timestamp: Date.now() }))
        break
      case 'drag':
        this.map.on('drag', () => trigger({ type: 'drag', timestamp: Date.now() }))
        break
      case 'dragend':
        this.map.on('dragend', () => trigger({ type: 'drag_end', timestamp: Date.now() }))
        break
      case 'zoomstart':
        this.map.on('zoomstart', () => trigger({ type: 'zoom_start', timestamp: Date.now() }))
        break
      case 'zoomend':
        this.map.on('zoomend', () => trigger({ type: 'zoom_end', timestamp: Date.now() }))
        break
      case 'load': {
        const fireLoadOnce = () => {
          this.triggerEvent('load', { map: this.map, type: 'basic' })
          if (typeof this.map.off === 'function') {
            this.map.off('tilesloaded', fireLoadOnce)
          }
        }
        if (typeof this.map.once === 'function') {
          this.map.once('tilesloaded', fireLoadOnce)
        } else {
          this.map.on('tilesloaded', fireLoadOnce)
        }
        break
      }
      case 'render':
        this.map.on('render', () => trigger({ type: 'render', timestamp: Date.now() }))
        break
      case 'resize':
        this.map.on('resize', () => trigger({ type: 'resize', timestamp: Date.now() }))
        break
      case 'viewreset':
        this.map.on('viewreset', () => trigger({ type: 'view_reset', timestamp: Date.now() }))
        break
      case 'tilesloaded':
        this.map.on('tilesloaded', (evt) => {
          trigger({ tile: evt.tile, type: 'tile', timestamp: Date.now() })
        })
        break
      case 'tileloadstart':
        this.map.on('tileloadstart', (evt) => {
          trigger({ tile: evt.tile, type: 'tile_start', timestamp: Date.now() })
        })
        break
      case 'tileerror':
        this.map.on('tileerror', (evt) => {
          trigger({ tile: evt.tile, error: evt.error, type: 'tile_error', timestamp: Date.now() })
        })
        break
      default:
        break
    }
  }
}
