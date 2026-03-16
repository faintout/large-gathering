/**
 * 地图引擎SDK配置文件
 * 在不同项目或环境下，可以修改此文件来自定义SDK加载地址
 */
// 动态获取基础路径
const getBasePath = () => {
  // 开发环境
  if (import.meta.env.DEV) {
    return ''
  }
  // 生产环境
  return import.meta.env.BASE_URL || '/mapACL'
}
// 腾讯地图SDK配置
export const tencentSDKConfig = {
  js: [
    'https://map.qq.com/api/gljs?v=1.exp&key=WLKBZ-XD263-MSX3P-3OGLB-ZE57S-44FGV&libraries=service,model,traffic,tools',
    // `${getBasePath()}/TX/blackStyle.js`,
    // `${getBasePath()}/TX/whiteStyle.js`,
  ],
  css: null, // 腾讯地图不需要额外CSS
  version: '1.exp',
  required: ['TMap'],
  // 腾讯地图特有配置
  maxZoom: 22,
  features: ['基础地图', '标记点', '线条', '聚合', '3D', '卫星图']
}

// 四维图新MineMap SDK配置
export const minemapSDKConfig = {
  css: [
    'https://minedata.cn/nce-static/support/demo/js-api/zh/css/demo.css',
    'https://minemap.minedata.cn/minemapapi/v2.1.1/minemap.css',
    'https://minemap.minedata.cn/minemapapi/v2.1.1/minemap-dark.css'
  ],
  js: [
    'https://minemap.minedata.cn/minemapapi/v2.1.1/minemap.js',
    'https://minemap.minedata.cn/minemapapi/minemap-plugins/2d-util/minemap-util.js',
    'https://minedata.cn/minemapapi/minemap-plugins/template/template.js'
  ],
  version: '2.1.1',
  // 仅检测 minemap 主对象，避免等待不存在的全局变量导致初始化卡住
  required: ['minemap'],
  // 四维图新特有配置
  maxZoom: 22,
  features: ['基础地图', '标记点', '线条', '聚合', '3D', '卫星图', '地形图', '矢量瓦片']
}

// MapboxGL SDK配置
export const mapboxSDKConfig = {
  js: 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js',
  css: 'https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css',
  // js: '../../../../public/mapbox/3.14.0/mapbox-gl.js',
  // css: '../../../../public/mapbox/3.14.0/mapbox-gl.css',
  version: '2.15.0',
  required: ['mapboxgl'],
  // MapboxGL特有配置
  maxZoom: 24,
  features: ['矢量地图', '自定义样式', '3D建筑', '热力图', '聚合'],
  // Mapbox访问令牌
  accessToken: 'pk.eyJ1IjoiYXR5c2hrYSIsImEiOiJjazkyeGhxOXAwMGU2M3FyMnNzNHVzZjRmIn0.w7s02NGEXlwVerC4WxEvvw'
}

// 高德地图SDK配置
export const amapSDKConfig = {
  js: 'https://webapi.amap.com/maps?v=2.0&key=YOUR_AMAP_KEY',
  css: null,
  version: '2.0',
  required: ['AMap'],
  // 高德地图特有配置
  maxZoom: 20,
  features: ['基础地图', '标记点', '线条', '聚合', '3D', '卫星图']
}

// 百度地图SDK配置
export const baiduSDKConfig = {
  js: 'https://api.map.baidu.com/api?v=3.0&ak=YOUR_BAIDU_MAP_KEY',
  css: null,
  version: '3.0',
  required: ['BMap'],
  // 百度地图特有配置
  maxZoom: 19,
  features: ['基础地图', '标记点', '线条', '聚合', '3D', '卫星图']
}

// 默认SDK配置
export const defaultSDKConfig = {
  tencent: tencentSDKConfig,
  minemap: minemapSDKConfig,
  mapbox: mapboxSDKConfig,
  amap: amapSDKConfig,
  baidu: baiduSDKConfig
}

// 获取指定引擎的SDK配置
export const getEngineSDKConfig = (engineId) => {
  return defaultSDKConfig[engineId] || null
}

// 检查引擎SDK是否已加载
export const isSDKLoaded = (engineId) => {
  const config = getEngineSDKConfig(engineId)
  if (!config || !config.required) return false

  // 检查所有必需的全局变量是否存在
  return config.required.every(globalVar => typeof window[globalVar] !== 'undefined')
}

/**
 * 动态加载地图引擎SDK
 * @param {string} engineId - 引擎ID
 * @param {string} engineName - 引擎名称（可选，用于日志输出）
 * @returns {Promise} 加载完成的Promise
 */
export const loadEngineSDK = async (engineId, engineName = null) => {
  const sdkConfig = getEngineSDKConfig(engineId)
  if (!sdkConfig) {
    throw new Error(`引擎 ${engineId} 的SDK配置不存在`)
  }

  // 如果已经加载，直接返回
  if (isSDKLoaded(engineId)) {
    return Promise.resolve()
  }

  const { js, css } = sdkConfig

  try {
    // 加载CSS文件（支持单个文件或文件数组）
    if (css) {
      if (Array.isArray(css)) {
        // 并行加载多个CSS文件
        await Promise.all(css.map(cssFile => loadCSS(cssFile)))
      } else {
        await loadCSS(css)
      }
    }

    // 加载JS文件（支持单个文件或文件数组）
    if (js) {
      if (Array.isArray(js)) {
        // 按顺序加载多个JS文件，确保依赖关系
        for (const jsFile of js) {
          await loadJS(jsFile)
        }
      } else {
        await loadJS(js)
      }
    }

    // 等待必需的全局变量加载完成
    await waitForGlobalVariables(sdkConfig.required)

    const displayName = engineName || engineId
    console.log(`${displayName} SDK 加载完成`)
    return Promise.resolve()
  } catch (error) {
    const displayName = engineName || engineId
    console.error(`${displayName} SDK 加载失败:`, error)
    throw error
  }
}

/**
 * 加载CSS文件
 * @param {string} href - CSS文件URL
 * @returns {Promise} 加载完成的Promise
 */
const loadCSS = (href) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve()
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`CSS加载失败: ${href}`))

    // 设置超时处理
    const timeout = setTimeout(() => {
      reject(new Error(`CSS加载超时: ${href}`))
    }, 10000) // 10秒超时

    link.onload = () => {
      clearTimeout(timeout)
      resolve()
    }

    link.onerror = () => {
      clearTimeout(timeout)
      reject(new Error(`CSS加载失败: ${href}`))
    }

    document.head.appendChild(link)
  })
}

/**
 * 加载JS文件
 * @param {string} src - JS文件URL
 * @returns {Promise} 加载完成的Promise
 */
const loadJS = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.type = 'text/javascript'
    script.async = true

    // 设置超时处理
    const timeout = setTimeout(() => {
      reject(new Error(`JS加载超时: ${src}`))
    }, 15000) // 15秒超时

    script.onload = () => {
      clearTimeout(timeout)
      resolve()
    }

    script.onerror = () => {
      clearTimeout(timeout)
      reject(new Error(`JS加载失败: ${src}`))
    }

    document.head.appendChild(script)
  })
}

/**
 * 等待全局变量加载完成
 * @param {Array} globalVars - 全局变量名数组
 * @returns {Promise} 等待完成的Promise
 */
const waitForGlobalVariables = (globalVars) => {
  return new Promise((resolve) => {
    const check = () => {
      if (globalVars.every(varName => typeof window[varName] !== 'undefined')) {
        resolve()
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

export default {
  defaultSDKConfig,
  getEngineSDKConfig,
  isSDKLoaded,
  loadEngineSDK
} 