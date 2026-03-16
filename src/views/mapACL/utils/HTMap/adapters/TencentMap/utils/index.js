/**
 * 腾讯地图适配器 - 公共工具与校验
 * 供 marker、markers、lines、polygons、cluster、popup、route 等模块使用
 */
import { calculateDistance, calculateControlPoint, generateCurvePoints, generateConvexPolygon } from '../../../utils/toolUtils.js'

export function generateUniqueId() {
  return `popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/** 路径转 [[lng,lat],...] 格式 */
export function coverToTMapPolylineArr(polyline = []) {
  const originPolyline = [...polyline]
  for (let i = 2; i < originPolyline.length; i++) {
    originPolyline[i] = originPolyline[i - 2] + originPolyline[i] / 1000000
  }
  const polylineArr = []
  for (let i = 0; i < originPolyline.length; i += 2) {
    polylineArr.push([originPolyline[i + 1], originPolyline[i]])
  }
  return polylineArr
}

export function validateMarkerStyle(style) {
  if (!style || typeof style !== 'object') {
    return { width: 20, height: 30, src: '', draggable: false }
  }
  const toNumber = (val, defaultValue = 0) => {
    const num = Number(val)
    return isNaN(num) ? defaultValue : num
  }
  const toBoolean = (val) => Boolean(val)
  const toString = (val, defaultValue = '') => (val != null ? String(val) : defaultValue)
  const width = toNumber(style.width, 20)
  const height = toNumber(style.height, 30)
  const src = toString(style.src, '')
  const draggable = toBoolean(style.draggable)
  const result = { width, height, src, draggable }
  if (style.zIndex !== undefined) result.zIndex = toNumber(style.zIndex)
  if (style.opacity !== undefined) result.opacity = toNumber(style.opacity)
  if (style.scale !== undefined) result.scale = toNumber(style.scale)
  if (style.faceTo !== undefined) result.faceTo = toString(style.faceTo)
  if (style.direction !== undefined) result.direction = toString(style.direction)
  if (style.enableRelativeScale !== undefined) result.enableRelativeScale = toBoolean(style.enableRelativeScale)
  if (style.offset) {
    let offsetX = 0, offsetY = 0
    if (Array.isArray(style.offset)) {
      offsetX = toNumber(style.offset[0])
      offsetY = toNumber(style.offset[1])
    } else if (typeof style.offset === 'object') {
      offsetX = toNumber(style.offset.x)
      offsetY = toNumber(style.offset.y)
    }
    result.anchor = { x: width / 2 - offsetX, y: height - offsetY }
  }
  return result
}

export function validateLineStyle(style) {
  return {
    color: style.color || '#4b98fa',
    width: style.width || 3,
    borderColor: style.borderColor || style.color || '#4b98fa',
    borderWidth: style.borderWidth || 0,
    lineCap: style.lineCap || 'round',
    eraseColor: style.eraseColor || '#3777FF',
    enableBloom: style.emitLight || false,
    lineJoin: style.lineJoin || 'round',
    dashArray: style.dashArray || [0, 0],
    opacity: style.opacity || 1,
    showArrow: style.dirArrows || false,
    arrowOptions: style.arrowOptions || {},
    isCurve: style.isCurve || false
  }
}

export function validatePolygonStyle(style) {
  return {
    color: style.color || 'rgba(75,152,250,0.3)',
    borderColor: style.borderColor || 'rgba(75, 152, 250, 1)',
    borderWidth: style.borderWidth || 2,
    borderDashArray: style.borderDashArray || [0, 0],
    opacity: style.opacity || 1,
    dashArray: style.dashArray || [0, 0],
    isConvex: style.isConvex || false
  }
}

export function generateCurveFeatures(geometries) {
  const features = []
  for (let i = 0; i < geometries.length - 1; i++) {
    const startPoint = geometries[i]
    const endPoint = geometries[i + 1]
    const distance = calculateDistance(startPoint, endPoint)
    const controlPoint = calculateControlPoint(startPoint, endPoint, distance)
    const curvePoints = generateCurvePoints(startPoint, endPoint, controlPoint)
    features.push(...curvePoints)
  }
  return features
}

export function validateAndTransformLineGeometries(geometries, styleMap, styles, operationName, generateCurveFeaturesFn) {
  if (!Array.isArray(geometries) || geometries.length === 0) {
    console.warn(`${operationName}: 传入的几何数据为空或无效`)
    return []
  }
  const isCurveByStyleId = (id) => styles.find(s => s.id === id)?.isCurve || false
  return geometries.map(geo => {
    if (!geo || typeof geo !== 'object') return null
    if (!geo.id) return null
    if (!geo.paths || !Array.isArray(geo.paths) || geo.paths.length < 2) return null
    let styleId = geo.styleId
    if (!styleId || !styleMap[styleId]) styleId = Object.keys(styleMap)[0]
    if (!styleId || !styleMap[styleId]) return null
    let path
    if (isCurveByStyleId(styleId)) {
      const geoPath = generateCurveFeaturesFn(geo.paths)
      path = geoPath.map(coord => {
        if (coord instanceof TMap.LatLng) return coord
        if (!Array.isArray(coord) || coord.length < 2) return null
        return new TMap.LatLng(coord[1], coord[0])
      }).filter(Boolean)
    } else {
      path = geo.paths.map(coord => {
        if (coord instanceof TMap.LatLng) return coord
        if (!Array.isArray(coord) || coord.length < 2) return null
        return new TMap.LatLng(coord[1], coord[0])
      }).filter(Boolean)
    }
    return { id: geo.id, styleId, paths: path, properties: geo.properties || {} }
  }).filter(Boolean)
}

export function validateAndTransformPolygonGeometries(geometries, styleMap, styles, operationName) {
  if (!Array.isArray(geometries) || geometries.length === 0) {
    console.warn(`${operationName}: 传入的几何数据为空或无效`)
    return []
  }
  const isConvexByStyleId = (id) => styles.find(s => s.id === id)?.isConvex || false
  return geometries.map(geo => {
    if (!geo || typeof geo !== 'object') return null
    if (!geo.id) return null
    if (!geo.paths || !Array.isArray(geo.paths) || geo.paths.length < 3) return null
    let styleId = geo.styleId
    if (!styleId || !styleMap[styleId]) styleId = Object.keys(styleMap)[0]
    if (!styleId || !styleMap[styleId]) return null
    let path
    if (isConvexByStyleId(styleId)) {
      const geoPath = generateConvexPolygon(geo.paths)[0]
      path = (geoPath || []).map(coord => {
        if (coord instanceof TMap.LatLng) return coord
        if (!Array.isArray(coord) || coord.length < 2) return null
        return new TMap.LatLng(coord[1], coord[0])
      }).filter(Boolean)
    } else {
      path = geo.paths.map(coord => {
        if (coord instanceof TMap.LatLng) return coord
        if (!Array.isArray(coord) || coord.length < 2) return null
        return new TMap.LatLng(coord[1], coord[0])
      }).filter(Boolean)
    }
    return { id: geo.id, styleId, paths: path, properties: geo.properties || {} }
  }).filter(Boolean)
}

export function validateAndTransformMarkerGeometries(geometries, styleMap, operationName) {
  if (!Array.isArray(geometries) || geometries.length === 0) {
    console.warn(`${operationName}: 传入的几何数据为空或无效`)
    return []
  }
  return geometries.map(geo => {
    if (!geo.lngLat || !Array.isArray(geo.lngLat) || geo.lngLat.length < 2) return null
    if (!geo.styleId || !styleMap[geo.styleId]) geo.styleId = Object.keys(styleMap)[0]
    return {
      id: geo.id,
      styleId: geo.styleId,
      position: new TMap.LatLng(geo.lngLat[1], geo.lngLat[0]),
      properties: geo.properties || {}
    }
  }).filter(Boolean)
}
