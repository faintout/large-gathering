/**
 * @file useCommonHTMap.js
 * @description 腾讯地图相关功能的 Vue3 Composition API Hook
 * 
 * 主要功能:
 * 1. 地图初始化与配置
 * - 初始化地图实例
 * - 初始化地图控件(折线图层、标记点图层、信息窗口等)
 * 
 * 2. 地图标记点管理
 * - 创建/更新/删除普通标记点
 * - 创建/更新/删除线路起终点标记
 * - 创建/更新/删除相位车道标记
 * - 创建/更新/删除可编辑标记点
 * - 创建/更新/删除选中标记点
 * 
 * 3. 地图线路管理
 * - 创建/更新/删除折线
 * - 高亮/取消高亮选中线路
 * - 路径规划与绘制
 * 
 * 4. 地图信息窗口管理
 * - 显示/隐藏点位信息窗口
 * - 显示/隐藏车站(路口)详情窗口
 * - 显示/隐藏路口详情控制窗口
 * 
 * 5. 地图视角控制
 * - 设置地图视角范围
 * - 地图缩放与平移
 * 
 * @param {String} mapId 地图容器id
 * @returns {Object} 地图相关方法和数据
 */
import {
    reactive,
    onMounted,
    onBeforeUnmount,
    toRefs,
    ref,
    computed,
    shallowRef,
    nextTick
} from 'vue';

import HTMap from '@/utils/HTMap'
import {
    guid
} from '@/utils/toolUtils.js'
// import {
//     PhaseLaneDOMOverlay
// } from '@/utils/HTMap/utils/toolUtils.js'



import pointIcon from '@/assets/img/map/point.png'
import point1Icon from '@/assets/img/map/point-bak.png'
import startStationEn from '@/assets/img/map/start-icon-en.png'
import endStationEn from '@/assets/img/map/end-icon-en.png'
import startStation from '@/assets/img/map/start-icon.png'
import endStation from '@/assets/img/map/end-icon.png'
import startIcon from '@/assets/img/map/start-point.png'
import endIcon from '@/assets/img/map/end-point.png'
import markerMove from '@/assets/img/map/marker-move.png'
import selectMarkerIcon from '@/assets/img/map/select_marker.png'
import upBusIcon from '@/assets/img/map/up-bus.png'
import downBusIcon from '@/assets/img/map/down-bus.png'
import store from '@/store';
import useLLocaleLang from '@/store/localeLang';
// 地图是否可见
const mapVisible =
    import.meta.env.VITE_MAP_VISIBLE === 'true'

/**
 * @description 检查地图是否可用
 * @returns {Boolean} 地图是否可用
 */
const checkMapAvailability = () => {
    return mapVisible
}
const localeStore = useLLocaleLang()
const isEnglish = computed(() => localeStore.language === 'en')
const isTencentMap = computed(() => window?.mapConfig?.mapType === 'tencent')
// default marker style
const defaultMarkerStyleList =[
    {
        faceForward: "standUp",
        height: 14,
        id: "point_marker_style",
        offset: [0, 0],
        rotation: 0,
        src: pointIcon,
        width: 14,
    },
    {
        faceForward: "standUp",
        height: 40,
        id: "point_marker_style_1",
        offset: [0, 0],
        rotation: 0,
        src: point1Icon,
        width: 40,
    },
    {
        faceForward: "standUp",
        height: 14,
        id: "start_marker_style",
        offset: [0, 0],
        rotation: 0,
        src: startIcon,
        width: 14,
    },
    {
        faceForward: "standUp",
        height: 14,
        id: "end_marker_style",
        offset: [0, 0],
        rotation: 0,
        src: endIcon,
        width: 14,
    },
    {
        faceForward: "standUp",
        height: 47,
        id: "start_station_marker_style",
        offset: [0, 0],
        rotation: 0,
        src:  isEnglish.value ? startStationEn : startStation,
        width: 26,
    },
    {
        faceForward: "standUp",
        height: 47,
        id: "end_station_marker_style",
        offset: [0, 0],
        rotation: 0,
        src:  isEnglish.value ? endStationEn : endStation, // 图片地址
        width: 26,
    },
    {
        faceForward: "standUp",
        height: 41,
        id: "up_bus_marker_style",
        offset: [0, 0],
        rotation: 0,
        src: upBusIcon,
        width: 41,
    },
    {
        faceForward: "standUp",
        height: 41,
        id: "down_bus_marker_style",
        offset: [0, 0],
        rotation: 0,
        src: downBusIcon,
        width: 41,
    },
    {
        faceForward: "standUp",
        height: 40,
        id: "select_marker_style",
        // 腾讯地图为anchor
        offset: [0, 12],
        rotation: 0,
        src: selectMarkerIcon,
        width: 40,
    },
    {
        faceForward: "standUp",
        height: 75,
        id: "move_marker_style",
        offset: [0, 0],
        rotation: 0,
        src: markerMove,
        width: 34,
    },
]
const defaultLineStyleList = [
    {
        id: 'up-line',
        color: '#4fc46a',
        'borderWidth': 0, //边线宽度
        'lineCap': 'round', //线端头方式
        emitLight: true,
        'width': 6, //折线宽度
        dirArrows: true,
        isCurve: !isTencentMap.value,
    },
    {
        id: 'down-line',
        color: '#4b98fa',
        'borderWidth': 0, //边线宽度
        'lineCap': 'round', //线端头方式
        emitLight: true,
        'width': 6, //折线宽度
        dirArrows: true,
        isCurve: !isTencentMap.value,
    },
    {
        id: 'up-line-highlight',
        color: '#4fc46a',
        'borderWidth': 4, //边线宽度
        'borderColor': '#FFF', //边线颜色
        'lineCap': 'round', //线端头方式
        emitLight: true,
        'width': 6, //折线宽度
        dirArrows: true,
        isCurve: !isTencentMap.value,
    },
    {
        id: 'down-line-highlight',
        color: '#4b98fa',
        'borderWidth': 4, //边线宽度
        'borderColor': '#FFF', //边线颜色
        'lineCap': 'round', //线端头方式
        emitLight: true,
        'width': 6, //折线宽度
        dirArrows: true,
        isCurve: !isTencentMap.value,
    },
    {
        id: 'line-highlight',
        color: '#3777FF',
        'borderWidth': 4, //边线宽度
        'borderColor': '#FFF', //边线颜色
        'lineCap': 'round', //线端头方式
        emitLight: true,
        'width': 6, //折线宽度
        dirArrows: true,
        isCurve: !isTencentMap.value,
    },
]

const defaultPolygonStyleList = [
    {
        id: 'polygon',
        color: 'rgba(75,152,250,0.3)',
        'borderWidth': 2, //边线宽度
        'borderColor': 'rgba(75, 152, 250, 1)',
        'borderDashArray': [10, 5],
        isConvex: true,
    },
    {
        id: 'polygon-selected',
        color: 'rgba(22,93,255,0.3)',
        'borderWidth': 2, //边线宽度
        'borderColor': '#165DFF',
        'borderDashArray': [10, 5],
        isConvex: true,
    },
]
class PhaseLaneDOMOverlay {
  constructor(properties) {
    // super(options)
    this.properties = properties
    this.dom = null

    this.createDOM()
    return this
  }
  //控制模式类名映射
  get controlModeClassMap(){
    return [
      {
        controlMode:25,
        controlName:'公交优先',
        className:'bus-breath'
      }
    ]
  }
  // 相位展示类型映射
  get phaseTypeMap(){
      return [
      {
        type:1,
        name:'相位图片展示',
        getPhaseTypeDom:properties=>{
          if(!properties.phaseIconUrl){
            return document.createElement('div');
          }
          // 创建一个新的图片元素
          var img = new Image();
          // 设置图片的src属性
          img.src = properties.phaseIconUrl;
          return img
        }
      },
      {
        type:2,
        name:'相位数字展示',
        getPhaseTypeDom:properties=>{
          var div = document.createElement('div');
          div.classList.add('phase-time');
          div.innerText = properties?.phaseTime||0;
          return div
        }
      }
    ]
  }
  // 创建运行模式类名
  createRunModeClass(controlMode,dom){
    this.controlModeClassMap.map(item=>{
      if(Number(controlMode)===item.controlMode){
        dom.classList.add(item.className)
      }
    })
  }
  // 创建自定义类名
  createCustomClass(properties,dom){
      // 创建呼吸样式
      properties?.breathStyle&&dom.classList.add('bus-breath')
      // 创建状态样式
      // 1-正常 2-故障 3-离线
      if(properties?.status){
      const statusClassMap = [
          { status: 1, className: 'online' },
          { status: 3, className: 'fault' },
          { status: 2, className: 'offline' }
      ]
      
      const statusClass = statusClassMap.find(item => item.status === properties.status)
      if(statusClass){
          dom.classList.add(statusClass.className)
      }
      }
  }
  // 创建相位dom
  createPhaseTypeDom (properties,dom){
    const type = properties.type || 1
    this.phaseTypeMap.map(item=>{
      if(Number(type)===item.type){
        dom.appendChild(item.getPhaseTypeDom(properties))
      }
    })
  }
  //以下是TMap.DOMOverlay原生方法覆盖
  // onInit(options) {
  //   Object.assign(this,options);
  // }
  createDOM(){
    const { properties } = this
    const dom = document.createElement('div');
    dom.classList.add('cross-phase-lane')
    const bgDom = document.createElement('div');
    bgDom.classList.add('cross-phase-lane-bg')
    dom.appendChild(bgDom)
    // 创建自定义类名
    this.createCustomClass(properties,dom)
    dom.id = properties.crossId;
    // 创建运行模式类名
    // this.createRunModeClass(properties.controlMode,dom)
    //添加呼吸样式
    properties?.breathStyle&&dom.classList.add('bus-breath')
    // dom.id = properties.crossId;

    // 根据类型创建相位展示
    this.createPhaseTypeDom(properties,dom)
    
    // 监听点击事件，实现zoomOnClick
    // this.onClick = this.onClick.bind(this);
    // this.onMouseEnter = this.onMouseEnter.bind(this);
    // this.onMouseLeave = this.onMouseLeave.bind(this);
    // // pc端注册click事件，移动端注册touchend事件
  //   dom.addEventListener('click', ()=>console.log('e'));
  //   dom.addEventListener('mouseenter', this.onMouseEnter);
  //   dom.addEventListener('mouseleave', this.onMouseLeave);
    this.dom = dom
    return this;
  };
  on(key, fn) {
      console.log('key',key,fn)
    this.dom.addEventListener(key, fn.bind(this));
  }
  updateDOM(){
    const { map,dom,position } = this
    if (!map) {
      return;
    }
    // 经纬度坐标转容器像素坐标
    let pixel = map.projectToContainer(position);

    // 使文本框中心点对齐经纬度坐标点
    let left = pixel.getX() - dom.clientWidth / 2 + 'px';
    let top = pixel.getY() - dom.clientHeight / 2 + 'px';
    dom.style.transform = `translate(${left}, ${top})`;
  }
  onClick() {
    this.emit('click');
  };
  onMouseEnter() {
    this.emit('mouseenter');
  };
  onMouseLeave() {
    this.emit('mouseleave');
  };
  onDestroy () {
  //   this.dom.removeEventListener('click', this.onClick);
  //   this.dom.removeEventListener('mouseenter', this.onMouseEnter);
  //   this.dom.removeEventListener('mouseleave', this.onMouseLeave);
    // this.removeAllListeners();
  };
}

/**
 * @description 地图相关hooks
 * @param {String} mapId 地图容器id
 * @returns {Object} 地图相关方法和数据
 */
export default function (mapId) {
    const map = shallowRef(null)
    // 地图加载完成
    const mapLoadCompleted = ref(false)

    //覆盖物
    //相位dom
    const phaseLaneDOMOverlay = ref([])
    const mapPolygonList = ref([])
    //地图marker列表
    const mapMarkerList = ref([])
    const mapClusterList = ref([])
    const mapLineList = ref([])

    //详情弹框ref
    const pointInfoWindowRef = ref(null)
    const stationDetailRef = ref(null)
    const crossDetailControlRef = ref(null)

    //详情弹框实例
    const pointInfoWindow = ref(null)
    const stationWindow = ref(null)
    const crossDetailControlWindow = ref(null)



    // 等待地图加载完成，已加载则直接 resolve，否则等待 load 事件
    const mapLoad = () => {
        if (mapLoadCompleted.value) return Promise.resolve()
        return new Promise(resolve => {
            map.value.on('load', resolve)
        })
    }

    /**
     * @description 初始化地图
     * @param {Object} mapInstance 地图实例
     * @returns {Promise<void>}
     */
    
    const initMap = async (mapInstance) => {
        if (!checkMapAvailability()) {
            return
        }
        await nextTick()
        if (mapInstance) {
            map.value = mapInstance
            return
        }
        map.value = new HTMap.Map(mapId)
        return new Promise(resolve => {
          map.value.on("load", () => {
            mapLoadCompleted.value  = true
            resolve()
            // initZoomEventListeners()
          })
        })
    }

    /**
     * @description 初始化缩放事件监听器
     * @returns {void}
     */
    const initZoomEventListeners = () => {
        if (!checkMapAvailability() || !map.value) {
            return
        }

        // 监听缩放变化事件
        map.value.on('zoom', () => {
            const currentZoom = map.value.getZoom()
            //判断是否需要修改自定义覆盖物的显示
        })

    }


    /**
     * @description 显示悬浮信息窗口
     * @param {Object} e 事件对象
     * @returns {void}
     */
    const hoverInfoWindow = async(e) => {
        if (!checkMapAvailability()) {
            return
        }
        if (e.type==='mouseenter') {
            pointInfoWindow.value ?.removePopup();
            pointInfoWindow.value = null
            const pointInfoUuid = guid()
            pointInfoWindowRef.value ?.update(e.geometry.properties)
            await nextTick()
            //创建点位信息窗口
            pointInfoWindow.value = new HTMap.Popup({
                map: map.value,
                enableCustom: true,
                lngLat: [e.lngLat.lng,e.lngLat.lat],
                offset: {
                    y: -80,
                    x: 0
                },
                showCloseBtn: false,
                id:pointInfoUuid,
                content: pointInfoWindowRef.value ?.$el
            });
        } else {
            pointInfoWindow.value ?.removePopup();
            pointInfoWindow.value = null
        }
    }

    /**
     * @description 创建选中标记点
     * @param {Array} crossList 路口列表
     * @param {Object} properties 自定义属性
     * @returns {Promise<void>}
     */
    const createSelectMarker = async (crossList, properties) => {
        // return
        if (!checkMapAvailability()) {
            return
        }
        // const crossListFilter = verifyLngLat(crossList)
        const crossGeometries = crossList.map(cross => ({
            lngLat: [cross.longitude,cross.latitude],
            id:cross.id,
            styleId: 'select_marker_style',

            properties: {
                ...cross,
            }
        }))
        const selectMarkers = new HTMap.Markers({
            map: map.value,
            id: "select-markers" + new Date().getTime(),
            geometries: crossGeometries,
            styles: defaultMarkerStyleList,
          });

        mapMarkerList.value.push(selectMarkers)
    }

    /**
     * @description 创建折线
     * @param {Array} polylineArr 折线点位数组
     * @param {Object} properties 自定义属性
     * @returns {Promise<void>}
     */
    const createPolyline = async (polylineArr = [], properties = {}) => {
        // return
        if (!checkMapAvailability()) {
            return
        }
        const line = new HTMap.Lines({
            map: map.value,
            id: 'param-test-lines',
            geometries: polylineArr,
            styles: defaultLineStyleList,
          })
        mapLineList.value.push(line)
    }
    /**
     * @description 创建多边形
     * @param {Array} polylineArr 折线点位数组
     * @param {Object} properties 自定义属性
     * @returns {Promise<void>}
     */
    const createPolygon = async (polygonArr = [], properties = {}) => {
        if (!checkMapAvailability()) {
            return
        }
        try {
            if (!polygonArr) {
                polygonArr = []
            }
            //更新 MultiPolyline
            if (!polygonArr.length||polygonArr.length<3) {
                console.warn('少于三个点无法绘制多边形')
                return
            }

            const crossGeometries = [{
                paths: polygonArr.map(polygon=>[polygon.longitude,polygon.latitude]),
                id:properties?.areaCode,
                styleId: 'polygon',
                properties: {
                    ...properties,
                }
            }]
            const polygons = new HTMap.Polygons({
                map: map.value,
                id:properties?.areaCode,
                geometries: crossGeometries,
                styles: defaultPolygonStyleList
            })


            mapPolygonList.value.push(polygons)
        } catch (e) {
            console.error('绘制多边形形失败:', e);
        }
    }


    /**
     * @description 创建标记点
     * @param {Array} crossList 路口列表
     * @returns {Promise<void>}
     */
    const createBusMarker = async (crossList, crossMarkerClickCb = () => {}) => {
        // if (!checkMapAvailability()) {
        //     return
        // }
        crossList = verifyLngLat(crossList)
        if (!crossList.length) {
            return
        }
        //筛选经纬度数据
        //清楚之前绘制的marker
        const crossGeometries = crossList.map(cross => ({
            lngLat: [cross.longitude,cross.latitude],
            id:cross.busCode,
            styleId: cross.driveDirection === 1?'up_bus_marker_style':'down_bus_marker_style',
            properties: {
                ...cross,
            }
        }))
        const pointMarkers = new HTMap.Markers({
            map: map.value,
            id: "bus-markers-"+new Date().getTime(),
            geometries: crossGeometries,
            styles: defaultMarkerStyleList,
          });
        mapMarkerList.value.push(pointMarkers)
        //鼠标移动到marker上时，显示信息窗口
        // pointMarkers.on('mouseenter', hoverInfoWindow);
        // pointMarkers.on('mouseleave', hoverInfoWindow);
        // pointMarkers.on('click', crossMarkerClickCb);

    }
    /**
     * @description 创建标记点
     * @param {Array} crossList 路口列表
     * @returns {Promise<void>}
     */
    const createMarker = async (crossList, crossMarkerClickCb = () => {}) => {
        // if (!checkMapAvailability()) {
        //     return
        // }
        crossList = verifyLngLat(crossList)
        if (!crossList.length) {
            return
        }
        //筛选经纬度数据
        //清楚之前绘制的marker

        crossList = crossList.filter(cross => {
            const isValidRange = cross.latitude > -90 && cross.latitude < 90 && cross.longitude > -180 && cross.longitude < 180
           return cross.longitude && cross.latitude&&isValidRange
        })
        const crossGeometries = crossList.map(cross => ({
            lngLat: [cross.longitude,cross.latitude],
            id:cross.id,
            styleId: 'point_marker_style',
            properties: {
                ...cross,
            }
        }))
        const pointMarkers = new HTMap.Markers({
            map: map.value,
            id: "point-markers",
            geometries: crossGeometries,
            styles: defaultMarkerStyleList,
          });
        mapMarkerList.value.push(pointMarkers)
        //鼠标移动到marker上时，显示信息窗口
        pointMarkers.on('mouseenter', hoverInfoWindow);
        pointMarkers.on('mouseleave', hoverInfoWindow);
        pointMarkers.on('click', crossMarkerClickCb);
        pointMarkers.on('hover', hoverInfoWindow);

    }
    /**
     * @description 创建聚合标记点
     * @param {Array} crossList 路口列表
     * @returns {Promise<void>}
     */
    const createClusters = async (crossList, crossClusterClickCb = () => {}) => {
        // if (!checkMapAvailability()) {
        //     return
        // }
        crossList = verifyLngLat(crossList)
        if (!crossList.length) {
            return
        }
        //筛选经纬度数据
        //清楚之前绘制的marker

        crossList = crossList.filter(cross => {
            const isValidRange = cross.latitude > -90 && cross.latitude < 90 && cross.longitude > -180 && cross.longitude < 180
           return cross.longitude && cross.latitude&&isValidRange
        })
        const crossGeometries = crossList.map(cross => ({
            lngLat: [cross.longitude,cross.latitude],
            id:cross.id,
            styleId: 'point_marker_style_1',
            properties: {
                ...cross,
            }
        }))
        const clusterConfig = {
            maxZoom: 17, // 超过最大层级则不再聚合
            minCount: 2, // 最小聚合个数
            radius: 60, // 聚合半径（像素）
            zoomOnClick: true // 点击之后放大层级
        }
        const pointClusters = new HTMap.Clusters({
            map: map.value,
            id: "point-clusters",
            geometries: crossGeometries,
            nonClustersStyle: defaultMarkerStyleList,
            clusterConfig
          });
        mapClusterList.value.push(pointClusters)
        //鼠标移动到marker上时，显示信息窗口
        pointClusters.on('mouseenter', hoverInfoWindow);
        pointClusters.on('mouseleave', hoverInfoWindow);
        pointClusters.on('click', crossClusterClickCb);
        pointClusters.on('hover', hoverInfoWindow);

    }
    /**
     * @description 创建线路标记点
     * @param {Array} crossList 路口列表
     * @returns {void}
     */
    const createLineMarker = (crossList, properties = {}) => {
        // return
        if (!checkMapAvailability()) {
            return
        }
        try {
            console.log('crossList',crossList)
            crossList = verifyLngLat(crossList)
            

            const pointMarkers = new HTMap.Markers({
                map: map.value,
                id: "line-start-end-markers"+new Date().getTime(),
                geometries: 
                crossList.map(cross=>{
                    const list = cross.crossList||cross.lineInfo?.nodes||cross.upCollection
                    if (list.length < 2 || !list.length) {
                        return []
                    }
                    const startNode = list.at()
                    const endNode = list.at(-1)
                    return [
                        {
                            lngLat: [startNode.longitude,startNode.latitude],
                            id:startNode.id,
                            styleId: 'start_marker_style',
                            properties: {
                                ...startNode,
                            }
                        },
                        {
                            lngLat: [endNode.longitude,endNode.latitude],
                            id:endNode.id,
                            styleId: 'end_marker_style',
                            properties: {
                                ...endNode,
                            }
                        }
                    ]
                }).flat(),
                styles: defaultMarkerStyleList,
            });
            mapMarkerList.value.push(pointMarkers)
        } catch (e) {
            console.log('e', e);
        }
    }

    /**
     * @description 验证经纬度
     * @param {Array} phaseLaneList 相位车道列表
     * @returns {Array} 过滤后的列表
     */
    const verifyLngLat = (phaseLaneList = []) => {
        return phaseLaneList
        if (!phaseLaneList || !phaseLaneList.length) {
            return []
        }
        return phaseLaneList.filter(phaseLane => {
            // 如果是TMap.LatLng实例直接返回true
            if (phaseLane instanceof TMap.LatLng) {
                return true
            }

            // 检查经纬度是否存在
            const hasLatLng = phaseLane ?.latitude && phaseLane ?.longitude
            if (!hasLatLng) {
                console.warn('经纬度信息不存在:', phaseLane)
                return false
            }

            // 检查经纬度范围是否有效
            const {
                latitude,
                longitude
            } = phaseLane
            const isValidRange = latitude > -90 && latitude < 90 && longitude > -180 && longitude < 180
            if (!isValidRange) {
                console.warn('经纬度范围无效:', phaseLane)
                return false
            }
            return true
        })
    }

    /**
     * @description 创建相位车道标记点
     * @param {Array} phaseLaneList 相位车道列表
     * @param {Function} onClickCb 点击回调
     * @param {Object} properties 自定义属性
     * @returns {Promise<void>}
     */
    const createPhaseLaneMarker = async (phaseLaneList, onClickCb = undefined, properties = {}) => {
        if (!checkMapAvailability()) {
            return
        }
        //关闭弹框
        phaseLaneList = verifyLngLat(phaseLaneList)
        // stationWindow.value.close();
        phaseLaneDOMOverlay.value = phaseLaneList.map((phaseLane, index) => {
            //判断crossId和相位图片是否相同，相同则不进行创建
            const currCrossDOMOverlay = phaseLaneDOMOverlay.value.find(
                allDOMOverlay =>
                allDOMOverlay.properties.crossId === phaseLane.crossId
            );
            //如果有当前路口的图片一致，则不重新创建
            const currPhaseIconUrl = currCrossDOMOverlay ?.properties.phaseIconUrl
            const currControlMode = currCrossDOMOverlay ?.properties.controlMode
            if (currCrossDOMOverlay && currPhaseIconUrl === phaseLane.phaseIconUrl && currControlMode === phaseLane.controlMode) {
                return currCrossDOMOverlay;
            }
            currCrossDOMOverlay?.removeMarkers()
            const newProperties = {
                ...phaseLane,
                breathStyle: phaseLane.controlMode === properties?.breathStyleControlMode&&properties?.breathStyleControlMode,
                ...properties
            }
            const DOMOverlay = new PhaseLaneDOMOverlay(newProperties)
            const options = {
                domOffset:[0,30],
                minZoom: properties ?.minZoom,
                maxZoom: properties ?.maxZoom,
                map: map.value,
                id: phaseLane.crossId,
                geometries: [{
                    lngLat: [phaseLane.longitude,phaseLane.latitude],
                    id:phaseLane.crossId,
                    styleId: 'cross-phase-lane',
                    properties: {
                        ...phaseLane,
                    }}],
                contentDom: DOMOverlay.dom,
            }
            const phaseMarker = new HTMap.Markers(options)
            phaseMarker.properties = newProperties
            // mapMarkerList.value.push(phaseMarker)
            // const phaseDom = new minemap.Marker(DOMOverlay.dom,options).setLngLat([phaseLane.longitude, phaseLane.latitude]).addTo(map.value)
            // phaseMarker.on('click',()=>console.log('click'))
            phaseMarker.on('click', () => onClickCb?onClickCb(DOMOverlay):handleCrossDetailClick(DOMOverlay))
            phaseMarker.on('mouseenter', hoverInfoWindow)
            phaseMarker.on('mouseleave', hoverInfoWindow)
            return phaseMarker
            


        }).filter(Boolean) // 过滤掉 null 值
    }

    /**
     * @description 处理路口详情点击
     * @param {Object} e 事件对象
     * @returns {void}
     */
    const handleCrossDetailClick = (e) => {
        if (!checkMapAvailability()) {
            return
        }
        stationWindow.value ?.removePopup();
        stationWindow.value = null
        const stationInfoUuid = guid()
        stationDetailRef.value ?.update(e)
        //创建点位信息窗口
        stationWindow.value = new HTMap.Popup({
            map: map.value,
            enableCustom: true,
            lngLat: [e.properties.longitude,e.properties.latitude],
            offset: {
                y: -50,
                x: 0
            },
            showCloseBtn: false,
            id:stationInfoUuid,
            content: stationDetailRef.value ?.$el
        });
        map.value.setCenter([e.properties.longitude,e.properties.latitude])
    }

    /**
     * @description 处理路口详情控制点击
     * @param {Object} e 事件对象
     * @returns {void}
     */
    const handleCrossDetailControlClick = async (e) => {

        if (!checkMapAvailability()) {
        return
        }
        crossDetailControlWindow.value ?.removePopup();
        crossDetailControlWindow.value = null
        const stationInfoUuid = guid()
        await nextTick()
        crossDetailControlRef.value ?.update(e)
        //创建点位信息窗口
        crossDetailControlWindow.value = new HTMap.Popup({
            map: map.value,
            enableCustom: true,
            lngLat: [e.properties.longitude,e.properties.latitude],
            offset: {
                y: -50,
                x: 0
            },
            showCloseBtn: false,
            id:stationInfoUuid,
            content: crossDetailControlRef.value ?.$el
        });

    }



    /**
     * @description 创建线路
     * @param {Array} crossList 路口列表
     * @param {Object} properties 自定义属性
     * @returns {Promise<Object>} 线路信息
     */
    const createLine = async (crossList, isCurve = undefined) => {
        const lineStyleList = isCurve !== undefined ? defaultLineStyleList.map(style=>{style.isCurve = isCurve;return style}) : defaultLineStyleList
        const lineInfo = await Promise.all(crossList.map(async (cross, index) => {
            if (cross.paths ?.length < 2 || !cross.paths ?.length) {
                //清楚已有绘制线
                return []
            }
                    //起点
            const start = cross.paths.at()
            //终点
            const end = cross.paths.at(-1)
            //途径点
            const waypoints = cross.paths.slice(1, cross.paths.length - 1)
            const routeData = {
                from: {
                lat: start[1],
                lng: start[0]
                }, // 起点
                to: {
                lat: end[1],
                lng: end[0]
                }, // 终点
                waypoints: waypoints.map(point => ({
                lat: point[1],
                lng: point[0]
                })), // 途径点
            }
            const route = await map.value.getRoute(routeData)
            if(!route){
                console.warn('route为空',routeData)
                return
            }
            const polylineArr = route.route.polyline || [];
            const line = new HTMap.Lines({
                map: map.value,
                id: `${cross.id||new Date().getTime()}`,
                geometries: [{
                    ...cross,
                    paths: polylineArr,
                    properties: {
                        ...cross,
                        route: route
                    }
                }],
                styles: lineStyleList,
            })
            mapLineList.value.push(line)

            return line
        }))

        return lineInfo
    }

    /**
     * @description 更新选中线路
     * @param {Array} selectLineList 选中线路列表
     * @returns {Array} 选中线路路径
     */
    const updateSelectLine = (selectLineList) => {
        // mapLineList.value.map(line=>{
        //     selectLineList.find(item=>item.id===line.properties.id)
        //     line.updateLinesGeometries(selectLineList)
        // })
        selectLineList.map(line=>{
            const lineItem = mapLineList.value.find(item=>item.id===line.id)
            if(!lineItem){return}
            // console.log('line',lineItem.geometries.map(geo=>({...geo,styleId:geo.styleId+'-highlight'})))
            
            lineItem.updateLinesGeometries(lineItem.geometries.map(geo=>({...geo,styleId:geo.styleId+'-highlight'})))
        })

    }

    const updateSelectPolygon = (selectPolygonId)=>{
        const polygon = mapPolygonList.value.find(item=>item.id===selectPolygonId)
        if(!polygon){return}
        polygon.updatePolygonsGeometries(polygon.geometries.map(geo=>({...geo,styleId:geo.styleId+'-selected'})))
    }

    const fitObjectsBounds =(options)=>{
        if(!options.coordinates.length){
            return
        }
        const coordinateList = options.coordinates.map(item=>[item.longitude,item.latitude])
        if(options.coordinates.length<2){
            // 只设置居中
            const longitude = coordinateList[0][0]
            const latitude = coordinateList[0][1]
            map.value.setCenter([longitude,latitude])
            return
        }
        map.value.fitObjectsBounds({
            ...options,
            coordinates: coordinateList,
        });
    }


    /**
     * @description 重置选中线路样式
     * @returns {void}
     */
    const resetSelectLine = () => {
        // return
        if (!checkMapAvailability()) {
            return
        }
        mapLineList.value.map(line=>{
            const geometries = line.getGeometries()
            const selectLineList = geometries.map(geo=>{
                 if (geo.styleId.includes('highlight')) {
                    geo.styleId = geo.styleId.replace('-highlight', '')
                }
                return geo
            })
            line.updateLinesGeometries(selectLineList)
        })

    }
    const resetSelectPolygon = () => {
        // return
        if (!checkMapAvailability()) {
            return
        }
        mapPolygonList.value.map(polygon=>{
            const geometries = polygon.getGeometries()
            const selectPolygonList = geometries.map(geo=>{
                if (geo.styleId.includes('selected')) {
                    geo.styleId = geo.styleId.replace('-selected', '')
                }
                return geo
            })
            polygon.updatePolygonsGeometries(selectPolygonList)
        })
    }

    /**
     * @description 根据路口ID移除起终点标记
     * @param {Array} idList 路口ID列表
     * @returns {void}
     */
    const removeStartEndMarkerByCrossId = (idList) => {
        // return
        if (!checkMapAvailability()) {
            return
        }       

        mapMarkerList.value = mapMarkerList.value.filter(marker=>{
                if(marker.id.includes('line-start-end-markers')){
                    marker.removeMarkers(idList||null)
                    return false
                }
            return true
        })  

    }

    const removeLineMarker = (crossList = [])=>{

        const startCrossId = crossList.at()?.crossId 
        const endCrossId = crossList.at(-1)?.crossId 
        mapMarkerList.value = mapMarkerList.value.filter(marker=>{
                if(marker.id.includes('line-start-end-markers')){
                    marker.removeMarkers(crossList?.length?[startCrossId,endCrossId]:null)
                    return false
                }
            return true
        }) 
    }
    const removeMarkers = ()=>{
        mapMarkerList.value.map(marker=>marker.removeMarkers()) 
        mapMarkerList.value = []
    }
    const removeClusters = ()=>{
        mapClusterList.value.map(cluster=>cluster.removeClusters()) 
        mapClusterList.value = []
    }
    const removeLines = ()=>{
        mapLineList.value.map(line=>line.removeLines()) 
        mapLineList.value = []
    }
    const removeBusMarker = ()=>{
        mapMarkerList.value = mapMarkerList.value.filter(marker=>{
                if(marker.id.includes('bus-markers')){
                    marker.removeMarkers()
                    return false
                }
            return true
        }) 
    }

    /**
     * @description 移除相位车道标记
     * @returns {void}
     */
    const removePhaseLaneMarker = () => {
        if (!checkMapAvailability()) {
            return
        }
        phaseLaneDOMOverlay.value?.map(phaseMarker=>phaseMarker.removeMarkers())
        phaseLaneDOMOverlay.value = []
    }

    /**
     * @description 移除选中标记
     * @returns {void}
     */
    const removeSelectMarker = () => {
        // return
        if (!checkMapAvailability()) {
            return
        }
        mapMarkerList.value = mapMarkerList.value.filter(marker=>{
            // const selectMarkerInstance = mapMarkerList.value.find(marker=>marker.id.includes('select-markers'))
            const hasMarker = marker.id.includes('select-markers')
            if (hasMarker) {
                marker.removeMarkers()
                return false
            }
            return true
        })
    }

    /**
     * @description 移除编辑标记
     * @returns {void}
     */
    const removeEditorMarker = () => {
        if (!checkMapAvailability()) {
            return
        }
        mapMarkerList.value = mapMarkerList.value.filter(marker=>{
            if(marker.id.includes('editor-markers')){
                marker.removeMarkers()
                return false
            }
            return true
        })
        console.info('mapMarkerList.value',mapMarkerList.value)
    }

    /**
     * @description 根据线路ID删除线路
     * @param {Array} lineIds 线路ID列表,为空时删除所有线路
     * @returns {void}
     */
    const removeLineByIds = (lineIds = []) => {
        if (!checkMapAvailability()) {
            return
        }
        mapLineList.value = mapLineList.value.filter(mapLine=>{
            if(lineIds.some(line=>mapLine.id.includes(line.id))){
                mapLine.removeLines()
                return false
            }
            return true
        })
    }


    /**
     * @description 根据标记ID删除多边形
     * @param {Array} polygonIds 多边形ID列表,为空时删除所有多边形
     * @returns {void}
     */
    const removePolygonByIds = (polygonIds) => {
        if (!checkMapAvailability()) {
            return
        }
        mapPolygonList.value = mapPolygonList.value.filter(polygon=>{
            if(!polygonIds){
                polygon.removePolygons()
                return false
            }else if(polygon.id===polygonIds){
                polygon.removePolygons()
                return false
            }
            return true
        })
    }
    const removeSelectedPolygon = () => {
        if (!checkMapAvailability()) {
            return
        }

        mapPolygonList.value = mapPolygonList.value.filter(polygon=>{
            if(polygon.geometries.some(geo=>geo.styleId.includes('selected'))){
                polygon.removePolygons()
                return false
            }
            return true
        })
    }

    /**
     * @description 移除高亮线路
     * @returns {void}
     */
    const removeHighlightLine = () => {
        if (!checkMapAvailability()) {
            return
        }
        // 找到包含highlight的线路并删除
        mapLineList.value = mapLineList.value.filter(line=>{
            if(line.geometries.some(geo=>geo.styleId.includes('highlight'))){
                line.removeLines()
                return false
            }
            return true
        })

    }

    /**
     * @description 创建编辑标记
     * @param {Array} crossList 路口列表
     * @param {Object} properties 自定义属性
     * @returns {void}
     */
    const createEditorMarker = async (crossList, dragEndCallback = ()=>{}) => {
        if (!checkMapAvailability()) {
            return
        }
        crossList = verifyLngLat(crossList)
        if (!crossList.length) {
            return
        }
        const crossGeometries = crossList.map((cross,index) => ({
            lngLat: [cross.longitude,cross.latitude],
            id:cross.id,
            styleId: index==0?'start_station_marker_style':index==crossList.length-1?'end_station_marker_style':'move_marker_style',
            properties: {
                ...cross,
            }
        }))
        const editorMarkers = new HTMap.Markers({
            map: map.value,
            id: "editor-markers",
            geometries: crossGeometries,
            styles: defaultMarkerStyleList,
            draggable:true
          });

        editorMarkers.on('dragend', dragEndCallback)
        editorMarkers.on('mouseenter', hoverInfoWindow);
        editorMarkers.on('mouseleave', hoverInfoWindow);
        mapMarkerList.value.push(editorMarkers)
        //鼠标移动到marker上时，显示信息窗口
        // editorMarkers.on('click', crossMarkerClickCb);

    }
    onBeforeUnmount(() => {
        map.value ?.destroy()
    });
    return {
        //数据
        map,
        initMap,
        mapLoad,
        mapLoadCompleted,
        mapMarkerList,
        stationDetailRef,
        crossDetailControlRef,
        crossDetailControlWindow,
        pointInfoWindowRef,
        stationWindow,
        pointInfoWindow,
        phaseLaneDOMOverlay,
        //方法
        createLine,
        createMarker,
        createClusters,
        createLineMarker,
        createBusMarker,
        createSelectMarker,
        hoverInfoWindow,
        createEditorMarker,
        createPolyline,
        createPolygon,
        createPhaseLaneMarker,
        fitObjectsBounds,
        handleCrossDetailControlClick,
        handleCrossDetailClick,
        resetSelectLine,
        resetSelectPolygon,
        updateSelectLine,
        updateSelectPolygon,
        removeStartEndMarkerByCrossId,
        removePhaseLaneMarker,
        removeSelectMarker,
        removeEditorMarker,
        removeLineByIds,
        removeLineMarker,
        removeBusMarker,
        
        removeMarkers,
        removeClusters,
        removeLines,
        removeHighlightLine,
        removeSelectedPolygon,
        removePolygonByIds
    }
}