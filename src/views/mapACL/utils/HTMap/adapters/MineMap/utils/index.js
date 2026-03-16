/**
 * 坐标转换工具函数
 */

/**
 * 解析坐标格式 - 支持多种坐标格式
 * @param {object} options - 坐标选项
 * @returns {Array} 坐标数组 [lng, lat]
 */
export function parseCoordinates(options) {
  // 支持多种坐标格式
  if (options.lngLat && Array.isArray(options.lngLat) && options.lngLat.length >= 2) {
    return [options.lngLat[0], options.lngLat[1]]
  }
  
  if (options.lng !== undefined && options.lat !== undefined) {
    return [options.lng, options.lat]
  }
  
  if (options.position && Array.isArray(options.position) && options.position.length >= 2) {
    return [options.position[0], options.position[1]]
  }
  
  if (options.coordinates && Array.isArray(options.coordinates) && options.coordinates.length >= 2) {
    return [options.coordinates[0], options.coordinates[1]]
  }
  
  console.warn('parseCoordinates: 无法解析坐标格式', options)
  return [0, 0]
}

/**
 * 坐标转换方法 - 兼容性方法
 * @param {Array} coordinates - 坐标数组 [lng, lat]
 * @param {string} context - 上下文信息
 * @returns {Array} 转换后的坐标数组
 */
export function transformCoordinates(coordinates, context = '') {
  // MineMap不需要特殊的坐标转换，直接返回原坐标
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    console.warn(`transformCoordinates: 无效的坐标格式 [${context}]`, coordinates)
    return [0, 0]
  }

  // 确保坐标格式正确 [lng, lat]
  const [lng, lat] = coordinates
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    console.warn(`transformCoordinates: 坐标必须是数字 [${context}]`, coordinates)
    return [0, 0]
  }

  return [lng, lat]
}

/**
 * 转换offset参数 - 将数值字符串转换为数字
 * @param {Array|string|number} offset - 偏移量参数
 * @returns {Array} 转换后的偏移量数组
 */
export function convertOffset(offset) {
  if (!offset) return [0, 0]
  
  // 如果已经是数组，转换数组中的数值字符串
  if (Array.isArray(offset)) {
    return offset.map(val => {
      if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
        return Number(val)
      }
      return typeof val === 'number' ? val : 0
    })
  }
  
  // 如果是单个数值或数值字符串，转换为数组
  if (typeof offset === 'string' && !isNaN(offset) && offset.trim() !== '') {
    const numVal = Number(offset)
    return [numVal, numVal] // 默认x和y使用相同值
  }
  
  if (typeof offset === 'number') {
    return [offset, offset] // 默认x和y使用相同值
  }
  
  return [0, 0]
}

/**
 * 标准化几何数据 - 支持多种坐标格式
 * @param {Array} geometries - 几何数据数组
 * @param {Array} styles - 样式数组（可选）
 * @returns {Array} 标准化后的几何数据
 */
export function normalizeGeometries(geometries, styles = []) {
  if (!Array.isArray(geometries)) {
    console.warn('normalizeGeometries: geometries 必须是数组')
    return []
  }

  return geometries.map(geo => {
    if (!geo.lngLat || !Array.isArray(geo.lngLat) || geo.lngLat.length < 2) {
      console.warn(`normalizeGeometries: 几何数据 ${geo.id} 坐标无效，跳过`)
      return null
    }

    return {
      id: geo.id,
      lngLat: geo.lngLat,
      properties: geo.properties || {},
      styleId: geo.styleId || (styles.length > 0 ? styles[0].id : null)
    }
  }).filter(Boolean)
}

/**
 * 生成唯一标记点ID
 * @returns {string} 唯一ID
 */
export function generateMarkerId() {
  return `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证标记点参数
 * @param {object} options - 标记点选项
 * @returns {boolean} 是否有效
 */
export function validateMarkerOptions(options) {
  if (!options) return false
  
  // 检查坐标
  const coordinates = parseCoordinates(options)
  if (coordinates[0] === 0 && coordinates[1] === 0) {
    console.warn('validateMarkerOptions: 无效的坐标')
    return false
  }
  
  return true
}