
// 地图配置 - 使用占位符，会被nginx自动替换
const mapConfig = {
  // tencent  minemap  mapbox
  // 地图类型
  mapType: 'tencent' || 'VITE_MAP_TYPE_PLACEHOLDER',
  // 腾讯地图配置
  tencent: {
    url: 'https://map.qq.com/api/gljs?v=1.exp&key=WLKBZ-XD263-MSX3P-3OGLB-ZE57S-44FGV&libraries=model,tools,scenario' || 'VITE_TXMAP_URL_PLACEHOLDER',
    drivingUrl: '/txDriving' || 'VITE_TXMAP_DRIVING_URL_PLACEHOLDER',
  },
  // MineMap配置
  minemap: {
    url: 'https://minemap.minedata.cn/' || 'VITE_MINEMAP_URL_PLACEHOLDER',
    pluginsUrl: 'https://minedata.cn/' || 'VITE_MINEMAP_PLUGINS_URL_PLACEHOLDER',
    serverUrl : 'https://sd-data.minedata.cn/' || 'VITE_MINEMAP_SERVER_URL_PLACEHOLDER',
    serviceUrl : 'https://service.minedata.cn/' || 'VITE_MINEMAP_SERVICE_URL_PLACEHOLDER',
  },
  // MapBox配置
  mapbox: 'https://api.mapbox.com/mapbox-gl-js/' || 'VITE_MAPBOXGL_URL_PLACEHOLDER'
}

export default mapConfig;
// window.mapConfig = mapConfig;