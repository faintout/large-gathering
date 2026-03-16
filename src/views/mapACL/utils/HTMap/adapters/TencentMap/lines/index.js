/**
 * 腾讯地图 - 折线（Lines）
 */
import {
  validateLineStyle,
  generateCurveFeatures,
  validateAndTransformLineGeometries
} from '../utils/index.js'

export default class LinesManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance
    this.map = mapInstance.map
  }

  addLines(options) {
    if (!this.map) return null
    if (!options.geometries?.length || !options.styles?.length) {
      console.error('addLines: geometries 或 styles 不能为空')
      return null
    }

    const styleMap = {}
    options.styles.forEach(style => {
      if (style.id) {
        styleMap[style.id] = new TMap.PolylineStyle(validateLineStyle(style))
      }
    })
    if (Object.keys(styleMap).length === 0) {
      console.error('addLines: 没有有效的样式配置')
      return null
    }

    const geometries = validateAndTransformLineGeometries(
      options.geometries,
      styleMap,
      options.styles,
      'addLines',
      (paths) => generateCurveFeatures(paths)
    )
    if (geometries.length === 0) {
      console.error('addLines: 没有有效的几何数据')
      return null
    }

    const nativePolyline = new TMap.MultiPolyline({
      map: this.map,
      id: options.id,
      styles: styleMap,
      minZoom: options.minZoom ?? 3,
      maxZoom: options.maxZoom ?? 20,
      geometries
    })

    const polylineGroup = {
      id: options.id,
      polyline: nativePolyline,
      styleMap,
      styles: options.styles,
      eventListeners: new Map()
    }

    polylineGroup.addGeometries = (newGeometries) => {
      const validated = validateAndTransformLineGeometries(
        newGeometries,
        styleMap,
        polylineGroup.styles,
        'addGeometries',
        (paths) => generateCurveFeatures(paths)
      )
      if (validated.length > 0) polylineGroup.polyline.add(validated)
    }

    polylineGroup.updateLinesGeometries = (newGeometries) => {
      const validated = validateAndTransformLineGeometries(
        newGeometries,
        styleMap,
        polylineGroup.styles,
        'updateGeometries',
        (paths) => generateCurveFeatures(paths)
      )
      if (validated.length > 0) polylineGroup.polyline.updateGeometries(validated)
    }

    polylineGroup.removeLines = () => { polylineGroup.polyline.setMap(null) }
    polylineGroup.removeGeometries = (ids) => { polylineGroup.polyline.remove(ids) }
    polylineGroup.getGeometries = () => polylineGroup.polyline.getGeometries()
    polylineGroup.setVisible = (v) => polylineGroup.polyline.setVisible(v)
    polylineGroup.getVisible = () => polylineGroup.polyline.getVisible()
    polylineGroup.on = (eventType, callback) => {
      if (!polylineGroup.eventListeners.has(eventType)) polylineGroup.eventListeners.set(eventType, [])
      polylineGroup.eventListeners.get(eventType).push(callback)
      polylineGroup.polyline.on(eventType, callback)
    }
    polylineGroup.off = (eventType, callback) => {
      if (!polylineGroup.eventListeners.has(eventType)) return
      if (callback) {
        const list = polylineGroup.eventListeners.get(eventType)
        const idx = list.indexOf(callback)
        if (idx > -1) list.splice(idx, 1)
      } else polylineGroup.eventListeners.delete(eventType)
      polylineGroup.polyline.off(eventType, callback)
    }

    return polylineGroup
  }
}
