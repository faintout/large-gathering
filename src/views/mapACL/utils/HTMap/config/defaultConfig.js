/**
 * HTMap 默认配置，如果用户没传递，则直接用这里面的
 */
export const defaultConfig = {
  // 地图引擎类型：指定使用的地图服务提供商 可选值：'tencent'（腾讯地图）| 'mapbox'（Mapbox地图）
  engine: 'tencent',
  // 地图中心点坐标：地图初始化时显示的中心位置
  center: [114.884094, 40.8119],
  // 地图缩放级别：控制地图的显示比例
  zoom: 15,
  // 最小缩放级别
  minZoom: 3,
  // 最大缩放级别
  maxZoom: 24,
  // 地图倾斜角度：控制地图的3D倾斜效果
  pitch: 0,
  // 地图旋转角度：控制地图的旋转方向
  rotation: 0,
  // 视图模式：控制地图的显示模式 可选值：'2D'（平面视图）| '3D'（三维视图）
  viewMode: '3D',
  // 地图样式类型：控制地图的整体视觉风格 可选值：'black'（暗色主题）| 'white'（亮色主题），后续有新增后续再说
  styleType: 'black',
}

// 腾讯地图特定配置，在自己的js 里面使用，如果有需要
export const tencentConfig = {
  minZoom: 3,
  maxZoom: 22,
  pitchRange: [0, 80],

  // 地图样式
  style: 'normal', // 'normal' | 'satellite' | 'hybrid'
  // 是否显示控件
  showControl: true,
  // 是否支持拖拽
  draggable: true,
  // 是否支持滚轮缩放
  scrollWheel: true,
  // 是否支持双击缩放
  doubleClickZoom: true,
  // 是否支持键盘操作
  keyboard: true,
  // 是否支持触摸操作
  touchZoom: true,
  // 是否支持惯性拖拽
  inertia: true,
  // 是否显示比例尺
  showScale: true,
  // 是否显示缩放控件
  showZoom: true,
  // 是否显示比例尺控件
  showScaleControl: true,
  // 是否显示全屏控件
  showFullscreenControl: true,
  // 是否显示定位控件
  showLocationControl: true,
  // 是否显示指南针控件
  showCompassControl: true,
  // 是否显示3D控件
  show3DControl: true
}


export const mineMapConfig = {
  minZoom: 3,
  maxZoom: 20,
  pitchRange: [0,60],
}


export const mapboxConfig = {
  minZoom: 0,
  maxZoom: 22,
  pitchRange: [0, 85],
}