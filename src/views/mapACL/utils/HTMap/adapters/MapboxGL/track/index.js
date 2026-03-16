/**
 * 轨迹图层 - 对接 HTMap.Tracks
 * 使用 HTMap.Marker 自定义 DOM 加载车辆图标与车牌、车速信息；轨迹线为 line 图层。
 * 针对 MapboxGL 适配
 */
import defaultCarIcon from '../img/car.png'

const DEFAULT_BEARING_OFFSET = -90
const ICON_BASE_SIZE_PX = 24
const ICON_SIZE_MIN = 16
const ICON_SIZE_MAX = 56
const LABEL_FONT_SIZE_BASE = 12
const LABEL_FONT_SIZE_MIN = 10
const LABEL_FONT_SIZE_MAX = 16

const DEFAULT_STYLE = {
  id: 'default',
  width: 8,
  height: 8,
  src: defaultCarIcon,
  carScale: true,
  contentScale: false,
  direction: 'top',
  offset: { x: 0, y: 0 },
  showLine: true,
  lineColor: '#4b98fa',
  lineWidth: 4
}

function getBearing(from, to) {
  const [lng1, lat1] = from
  const [lng2, lat2] = to
  const dLon = (lng2 - lng1) * Math.PI / 180
  const lat1Rad = lat1 * Math.PI / 180
  const lat2Rad = lat2 * Math.PI / 180
  const y = Math.sin(dLon) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

function iconRotation(bearing, offset = 0) {
  return (bearing + offset  + 360) % 360
}

function formatContentDom(contentDom) {
  if (contentDom == null) return ''
  if (typeof contentDom === 'string') return contentDom
  if (contentDom instanceof HTMLElement) return contentDom.textContent || ''
  return String(contentDom)
}

function lineGeoJSON(path) {
  const coords = path.length >= 2 ? path : [path[0] || [0, 0], path[0] || [0, 0]]
  return { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} }
}

function getIconUrl(src) {
  if (!src) return ''
  return typeof src === 'string' ? src : (src?.default ?? src?.src ?? '')
}

export default class TrackManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance
    this.map = mapInstance?.map
    this.tracks = new Map()
    this.styles = new Map()
    this._infoWindowVisible = true
    this._currentZoom = this.map?.getZoom?.() ?? 10
    this._smoothAnimations = new Map()
    this.minZoom = undefined
    this.maxZoom = undefined
    this._mapLoaded = !!this.map?.loaded?.()
    this._onTrackClick = null
    if (this.map) {
      if (!this._mapLoaded) this.map.once('load', () => { this._mapLoaded = true })
      this.map.on('zoom', () => {
        this._currentZoom = this.map.getZoom()
        this._updateScaleStyles()
      })
    }
  }

  setStyles(styles) {
    if (!Array.isArray(styles)) return
    this.styles.clear()
    styles.forEach(style => { if (style?.id) this.styles.set(style.id, style) })
    this.tracks.forEach(track => {
      if (track.styleId) track.style = this._getStyle(track.styleId)
      if (track.markerInstance) this._updateMarkerLabel(track)
    })
  }

  setZoomRange(minZoom, maxZoom) {
    this.minZoom = minZoom
    this.maxZoom = maxZoom
    this._updateLayerVisibility()
  }

  /** 设置车辆轨迹点击回调，与 marker 事件格式对齐 */
  setOnTrackClick(callback) {
    this._onTrackClick = typeof callback === 'function' ? callback : null
  }

  updateTracks(payload) {
    if (!payload?.itemsData?.length || !this.map) return
    const opts = payload.options || {}
    const smoothTime = Number(opts.smoothTime) || 1000
    const calculateAngle = !!opts.calculateAngle

    payload.itemsData.forEach(item => {
      if (!item?.id) return
      const id = String(item.id)
      const lngLat = Array.isArray(item.lngLat) && item.lngLat.length >= 2
        ? [Number(item.lngLat[0]), Number(item.lngLat[1])] : null
      if (!lngLat || Number.isNaN(lngLat[0]) || Number.isNaN(lngLat[1])) return

      const styleId = item.styleId != null && item.styleId !== '' ? String(item.styleId) : null
      const contentDom = item.contentDom !== undefined ? item.contentDom : ''
      let heading = item.heading != null ? Number(item.heading) : null

      let track = this.tracks.get(id)
      if (!track) {
        track = {
          id,
          styleId,
          contentDom,
          lngLat,
          heading: (heading != null && !Number.isNaN(heading)) ? heading : 0,
          path: [this.mapInstance._transformCoordinates(lngLat, `track-${id}-init`)],
          markerInstance: null,
          lineSourceId: null,
          lineLayerId: null,
          style: this._getStyle(styleId)
        }
        this.tracks.set(id, track)
        this._createTrackLayer(track).catch(() => {})
        return
      }

      const oldLngLat = track.lngLat
      track.lngLat = lngLat
      track.contentDom = contentDom
      if (styleId != null) {
        track.styleId = styleId
        track.style = this._getStyle(styleId)
      }
      if (calculateAngle && oldLngLat?.length >= 2) heading = getBearing(oldLngLat, lngLat)
      if (heading != null && !Number.isNaN(heading)) track.heading = heading
      track.path.push(this.mapInstance._transformCoordinates(lngLat, `track-${id}-update`))

      if (track.markerInstance) {
        this._updateMarkerLabel(track)
        smoothTime > 0 ? this._smoothUpdateTrack(track, smoothTime) : this._updateTrackPosition(track)
      } else {
        this._createTrackLayer(track).catch(() => {})
      }
    })
  }

  _getStyle(styleId) {
    return (styleId && this.styles.get(styleId)) || DEFAULT_STYLE
  }

  /** 计算车辆图标像素尺寸（支持 carScale 随 zoom 变化） */
  _calculateIconSizePx(style) {
    const base = ICON_BASE_SIZE_PX * ((style.width || 8) / 8)
    if (style.carScale !== false) {
      const zoomFactor = Math.pow(1.08, this._currentZoom - 10)
      return Math.max(ICON_SIZE_MIN, Math.min(ICON_SIZE_MAX, Math.round(base * zoomFactor)))
    }
    return Math.max(ICON_SIZE_MIN, Math.min(ICON_SIZE_MAX, Math.round(base)))
  }

  /** 创建车辆 Marker 的自定义 DOM：车辆图标 + 车牌/车速信息（分行） */
  _createVehicleElement(track) {
    const style = track.style
    const url = getIconUrl(style.src) || getIconUrl(defaultCarIcon)
    const iconPx = this._calculateIconSizePx(style)
    const wrap = document.createElement('div')
    wrap.className = 'ht-map-track-vehicle'
    wrap.style.display = 'flex'
    wrap.style.flexDirection = 'column'
    wrap.style.alignItems = 'center'
    wrap.style.pointerEvents = 'auto'
    wrap.style.cursor = 'pointer'
    wrap.style.gap = '2px'
    wrap.style.position = 'reactive'
    const label = document.createElement('div')
    label.className = 'ht-map-track-label'
    Object.assign(label.style, {
      color: '#fff',
      fontSize: `${this._calculateTextSize(style)}px`,
      lineHeight: 1.35,
      whiteSpace: 'pre',
      textAlign: 'center',
      padding: '3px 6px',
      borderRadius: '4px',
      background: 'rgba(0,0,0,0.65)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box'
    })
    label.textContent = formatContentDom(track.contentDom)
    label.style.display = this._infoWindowVisible && track.contentDom ? 'block' : 'none'
    label.style.position = 'absolute'
    label.style.bottom = `${iconPx + 8}px`
    label.style.left = '50%'
    label.style.transform = 'translateX(-50%)'
    wrap.appendChild(label)

    const iconWrap = document.createElement('div')
    iconWrap.className = 'ht-map-track-icon-wrap'
    iconWrap.style.display = 'flex'
    iconWrap.style.justifyContent = 'center'
    iconWrap.style.alignItems = 'center'
    const img = document.createElement('img')
    img.className = 'ht-map-track-icon'
    img.src = url
    img.alt = ''
    img.style.width = `${iconPx}px`
    img.style.height = `${iconPx}px`
    img.style.display = 'block'
    img.style.objectFit = 'contain'
    img.style.flexShrink = '0'
    iconWrap.appendChild(img)
    wrap.appendChild(iconWrap)

    return wrap
  }

  /** 仅旋转车辆图标，信息窗口不旋转，始终在车头正上方 */
  _updateIconRotation(track, rotationDeg) {
    if (!track.markerInstance) return
    const el = track.markerInstance.getElement?.() || track.markerInstance.element
    const iconWrap = el?.querySelector?.('.ht-map-track-icon-wrap')
    if (iconWrap) iconWrap.style.transform = `rotate(${rotationDeg}deg)`
  }

  async _createTrackLayer(track) {
    if (!this.map || !this.mapInstance?.addDomMarker) return
    if (!this._mapLoaded) {
      await new Promise(resolve => {
        if (this.map.loaded()) { this._mapLoaded = true; resolve(); return }
        this.map.once('load', () => { this._mapLoaded = true; resolve() })
      })
    }
    if (track.style.showLine !== false) this._createLineLayer(track)

    const pos = track.lngLat && track.lngLat.length >= 2 ? [track.lngLat[0], track.lngLat[1]] : track.path[track.path.length - 1]
    const element = this._createVehicleElement(track)

    const markerInstance = this.mapInstance.addDomMarker({
      id: `track-${track.id}-marker`,
      lngLat: pos,
      element,
      anchor: 'center',
      rotation: 0,
      rotationAlignment: 'map',
      pitchAlignment: 'map',
      minZoom: this.minZoom,
      maxZoom: this.maxZoom
    })
    if (markerInstance) {
      track.markerInstance = markerInstance
      this._updateIconRotation(track, iconRotation(track.heading, DEFAULT_BEARING_OFFSET))
      const el = markerInstance.getElement?.() || markerInstance.element || element
      if (el) {
        el.style.pointerEvents = 'auto'
        el.style.cursor = 'pointer'
        if (el.parentElement) el.parentElement.style.pointerEvents = 'auto'
        const fireTrackClick = (e) => {
          e.stopPropagation()
          e.preventDefault()
          if (!this._onTrackClick) return
          const coords = track.lngLat && track.lngLat.length >= 2 ? track.lngLat : track.path[track.path.length - 1]
          this._onTrackClick({
            type: 'click',
            target: el,
            lngLat: coords ? { lng: coords[0], lat: coords[1] } : null,
            latLng: coords ? { lng: coords[0], lat: coords[1] } : null,
            point: { x: e.clientX || 0, y: e.clientY || 0 },
            originalEvent: e,
            trackId: track.id,
            track,
            geometry: { type: 'Point', coordinates: coords || [], properties: {} },
            timestamp: Date.now()
          })
        }
        el.addEventListener('click', fireTrackClick)
      }
    }
  }

  _createLineLayer(track) {
    const style = track.style
    const lineSrcId = `track-${track.id}-line-source`
    const lineLayerId = `track-${track.id}-line-layer`
    const data = lineGeoJSON(track.path)
    try {
      if (!this.map.getSource(lineSrcId)) this.map.addSource(lineSrcId, { type: 'geojson', data })
      else this.map.getSource(lineSrcId).setData(data)
    } catch (_) { return }
    if (this.map.getLayer(lineLayerId)) {
      track.lineSourceId = lineSrcId
      track.lineLayerId = lineLayerId
      this._updateLineData(track)
      return
    }
    try {
      this.map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: lineSrcId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': style.lineColor || '#4b98fa',
          'line-width': Number(style.lineWidth) || 4,
          'line-opacity': 0.9
        }
      })
      if (this.minZoom != null || this.maxZoom != null) {
        this.map.setLayerZoomRange(lineLayerId, this.minZoom ?? 0, this.maxZoom ?? 24)
      }
      track.lineSourceId = lineSrcId
      track.lineLayerId = lineLayerId
    } catch (_) {}
  }

  _updateLineData(track, pathOverride) {
    if (!track.lineSourceId || !this.map?.getSource(track.lineSourceId)) return
    const path = pathOverride ?? track.path
    this.map.getSource(track.lineSourceId).setData(lineGeoJSON(path))
  }

  _updateMarkerLabel(track) {
    if (!track.markerInstance) return
    const el = track.markerInstance.getElement?.() || track.markerInstance.element
    if (!el) return
    const label = el.querySelector?.('.ht-map-track-label')
    const img = el.querySelector?.('.ht-map-track-icon')
    if (label) {
      label.textContent = formatContentDom(track.contentDom)
      label.style.display = this._infoWindowVisible && track.contentDom ? 'block' : 'none'
      label.style.fontSize = `${this._calculateTextSize(track.style)}px`

      // --- 关键修改：抵消 map pitch & bearing 的文字逆向形变 ---
      if (this.map) {
        const pitch = this.map.getPitch()
        const bearing = this.map.getBearing()
        // 先还原俯视，再还原旋转（注意平移 translateX 要前置保留原来居中的偏移）
        label.style.transform = `translateX(-50%) rotateX(-${pitch}deg) rotateZ(-${bearing}deg)`
        label.style.transformOrigin = 'bottom center'  // 让旋转中心位于文字底部边缘
      }
    }
    if (img && track.style.carScale !== false) {
      const px = this._calculateIconSizePx(track.style)
      img.style.width = `${px}px`
      img.style.height = `${px}px`
    }
  }

  _updateTrackPosition(track) {
    if (!track.markerInstance) return
    const pos = track.lngLat && track.lngLat.length >= 2 ? [track.lngLat[0], track.lngLat[1]] : track.path[track.path.length - 1]
    track.markerInstance.setLngLat(pos)
    this._updateIconRotation(track, iconRotation(track.heading, DEFAULT_BEARING_OFFSET))
    this._updateMarkerLabel(track)
    this._updateLineData(track)
  }

  _smoothUpdateTrack(track, duration) {
    const currentPos = track.path[track.path.length - 1]
    const anim = this._smoothAnimations.get(track.id)
    const startPos = anim?.currentPos ?? anim?.endPos ?? (track.path.length >= 2 ? track.path[track.path.length - 2] : currentPos)
    this._smoothAnimations.set(track.id, { startPos, endPos: currentPos, startTime: Date.now(), duration, currentPos: startPos })
    this._animateTrack(track.id)
  }

  _animateTrack(trackId) {
    const track = this.tracks.get(trackId)
    if (!track) { this._smoothAnimations.delete(trackId); return }
    const anim = this._smoothAnimations.get(trackId)
    if (!anim) return
    const progress = Math.min((Date.now() - anim.startTime) / anim.duration, 1)
    const [sLng, sLat] = anim.startPos
    const [eLng, eLat] = anim.endPos
    anim.currentPos = [sLng + (eLng - sLng) * progress, sLat + (eLat - sLat) * progress]
    if (track.markerInstance) {
      track.markerInstance.setLngLat(anim.currentPos)
      const moveHeading = getBearing(anim.startPos, anim.endPos)
      this._updateIconRotation(track, iconRotation(moveHeading, DEFAULT_BEARING_OFFSET))
    }
    this._updateLineData(track, track.path.slice(0, -1).concat([anim.currentPos]))
    if (progress < 1) requestAnimationFrame(() => this._animateTrack(trackId))
    else { this._smoothAnimations.delete(trackId); this._updateTrackPosition(track) }
  }

  _calculateTextSize(style) {
    const base = LABEL_FONT_SIZE_BASE
    return style.contentScale === true
      ? Math.max(LABEL_FONT_SIZE_MIN, Math.min(LABEL_FONT_SIZE_MAX, Math.round(base * Math.pow(1.1, this._currentZoom - 10))))
      : base
  }

  _updateScaleStyles() {
    this.tracks.forEach(t => this._updateMarkerLabel(t))
  }

  _updateLayerVisibility() {
    const min = this.minZoom ?? 0
    const max = this.maxZoom ?? 24
    this.tracks.forEach(t => {
      if (t.lineLayerId && this.map?.getLayer(t.lineLayerId)) this.map.setLayerZoomRange(t.lineLayerId, min, max)
    })
  }

  stopTracks() {
    this._smoothAnimations.clear()
    this.tracks.forEach(t => this._removeTrackLayer(t))
    this.tracks.clear()
  }

  removeTracks() {
    this.stopTracks()
    this.styles.clear()
  }

  _removeTrackLayer(track) {
    if (!track) return
    try {
      if (track.markerInstance && typeof track.markerInstance.remove === 'function') track.markerInstance.remove()
      if (track.lineLayerId && this.map?.getLayer(track.lineLayerId)) this.map.removeLayer(track.lineLayerId)
      if (track.lineSourceId && this.map?.getSource(track.lineSourceId)) this.map.removeSource(track.lineSourceId)
    } catch (_) {}
  }

  setInfoWindowVisible(visible) {
    this._infoWindowVisible = !!visible
    this.tracks.forEach(track => this._updateMarkerLabel(track))
  }
}
