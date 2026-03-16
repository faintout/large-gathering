/**
 * 腾讯地图 - 多边形（Polygons）
 */
import { validatePolygonStyle, validateAndTransformPolygonGeometries } from '../utils/index.js'

export default class PolygonsManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance
    this.map = mapInstance.map
  }

  addPolygons(options) {
    if (!this.map) return null
    if (!options.geometries?.length || !options.styles?.length) {
      console.error('addPolygons: geometries 或 styles 不能为空')
      return null
    }

    const styleMap = {}
    options.styles.forEach(style => {
      if (style.id) {
        styleMap[style.id] = new TMap.PolygonStyle(validatePolygonStyle(style))
      }
    })
    if (Object.keys(styleMap).length === 0) {
      console.error('addPolygons: 没有有效的样式配置')
      return null
    }

    const geometries = validateAndTransformPolygonGeometries(
      options.geometries,
      styleMap,
      options.styles,
      'addPolygons'
    )
    if (geometries.length === 0) {
      console.error('addPolygons: 没有有效的几何数据')
      return null
    }

    const nativePolygon = new TMap.MultiPolygon({
      map: this.map,
      id: options.id,
      styles: styleMap,
      minZoom: options.minZoom ?? 3,
      maxZoom: options.maxZoom ?? 20,
      geometries
    })

    const polygonGroup = {
      id: options.id,
      polygon: nativePolygon,
      styleMap,
      styles: options.styles,
      eventListeners: new Map()
    }

    polygonGroup.addGeometries = (newGeometries) => {
      const validated = validateAndTransformPolygonGeometries(
        newGeometries,
        styleMap,
        polygonGroup.styles,
        'addGeometries'
      )
      if (validated.length > 0) polygonGroup.polygon.add(validated)
    }

    polygonGroup.updatePolygonsGeometries = (updatedGeometries) => {
      const validated = validateAndTransformPolygonGeometries(
        updatedGeometries,
        styleMap,
        polygonGroup.styles,
        'updateGeometries'
      )
      if (validated.length > 0) polygonGroup.polygon.updateGeometries(validated)
    }

    polygonGroup.removePolygons = () => { polygonGroup.polygon.setMap(null) }
    polygonGroup.removeGeometries = (ids) => { polygonGroup.polygon.remove(ids) }
    polygonGroup.getGeometries = () => polygonGroup.polygon.getGeometries()
    polygonGroup.setVisible = (v) => polygonGroup.polygon.setVisible(v)
    polygonGroup.getVisible = () => polygonGroup.polygon.getVisible()
    polygonGroup.on = (eventType, callback) => {
      if (!polygonGroup.eventListeners.has(eventType)) polygonGroup.eventListeners.set(eventType, [])
      polygonGroup.eventListeners.get(eventType).push(callback)
      polygonGroup.polygon.on(eventType, callback)
    }
    polygonGroup.off = (eventType, callback) => {
      if (!polygonGroup.eventListeners.has(eventType)) return
      if (callback) {
        const list = polygonGroup.eventListeners.get(eventType)
        const idx = list.indexOf(callback)
        if (idx > -1) list.splice(idx, 1)
      } else polygonGroup.eventListeners.delete(eventType)
      polygonGroup.polygon.off(eventType, callback)
    }

    return polygonGroup
  }
}
