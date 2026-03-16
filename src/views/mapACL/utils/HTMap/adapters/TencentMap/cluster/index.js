/**
 * 腾讯地图 - 点聚合（Cluster）
 */
import { validateMarkerStyle } from '../utils/index.js'

export default class ClusterManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance
    this.map = mapInstance.map
  }

  /**
   * 添加聚合功能
   * @param {object} options - 聚合配置
   * @returns {object} 聚合实例
   */
  addClusters(options) {
    if (!this.map) return null
    // 验证必要参数
    if (!options.geometries || !Array.isArray(options.geometries) || options.geometries.length === 0) {
      console.error('addClusters: geometries数组不能为空')
      return null
    }
    // 构建聚合配置
    const clusterConfig = {
      id: options.id || `cluster_${Date.now()}`,
      map: this.map,
      enableDefaultStyle: false, // 关闭默认样式，使用自定义样式
      minimumClusterSize: options.clusterConfig?.minCount || 3,
      maxZoom: options.clusterConfig?.maxZoom || 20,
      zoomOnClick: options.clusterConfig?.zoomOnClick !== false, // 默认启用点击缩放
      gridSize: options.clusterConfig?.radius || 60,
      averageCenter: options.clusterConfig?.averageCenter || false,
      geometries: options.geometries.map(geo => ({
        position: new TMap.LatLng(geo.lngLat[1], geo.lngLat[0]), // 注意：LatLng(lat, lng) 顺序
        properties: {
          ...geo.properties,
          styleId: geo.styleId || null,
        },
        id: geo.id || null
      }))
    }
    // 创建点聚合实例
    const markerCluster = {
      id: clusterConfig.id,
      eventListeners: new Map(),
      cluster: null,
      clusterBubbleList: [],
      markerGeometries: [],
      marker: null,
      clusterStyle: options.clusterStyle || null,
    }
    markerCluster.cluster = new TMap.MarkerCluster(clusterConfig)

    // 创建自定义聚合气泡类
    const ClusterBubble = this._createClusterBubbleClass(options)

    // 监听聚合簇变化
    markerCluster.cluster.on('cluster_changed', (e) => {
      // 销毁旧聚合簇生成的覆盖物
      if (markerCluster.clusterBubbleList.length) {
        markerCluster.clusterBubbleList.forEach(item => {
          item.destroy()
        })
        markerCluster.clusterBubbleList = []
      }
      markerCluster.markerGeometries = []

      // 根据新的聚合簇数组生成新的覆盖物和点标记图层
      const clusters = markerCluster.cluster.getClusters()
      clusters.forEach(item => {
        if (item.geometries.length > 1) {
          // 创建聚合气泡
          const clusterBubble = new ClusterBubble({
            map: this.map,
            position: item.center,
            content: item.geometries.length,
            clusterStyle: markerCluster.clusterStyle,
            geometries: item.geometries,
            center: item.center,
            bounds: item.bounds
          })
          if (clusterConfig.zoomOnClick) {
            clusterBubble.on('click', () => {
              this.map.fitBounds(item.bounds);
            });
          }
          if (markerCluster.eventListeners.has('bubbleClick')) {
            clusterBubble.on('click', markerCluster.eventListeners.get('bubbleClick'))
          }
          markerCluster.clusterBubbleList.push(clusterBubble)
        } else {
          // 单个点标记
          markerCluster.markerGeometries.push({
            position: item.center,
            properties: item.geometries[0].properties || {},
            styleId: item.geometries[0].properties.styleId || null,
            id: item.geometries[0].id || null
          })
        }
      })

      // 更新或创建点标记图层
      if (markerCluster.marker) {
        // 已创建过点标记图层，直接更新数据
        markerCluster.marker.setGeometries(markerCluster.markerGeometries)
      } else {
        // 创建点标记图层
        const markerStyles = this._createClusterMarkerStyles(options)
        markerCluster.marker = new TMap.MultiMarker({
          map: this.map,
          styles: markerStyles,
          geometries: markerCluster.markerGeometries.map(geo => ({
            position: geo.position,
            properties: geo.properties,
            styleId: geo.properties.styleId,
            id: geo.id
          }))
        })
        if (markerCluster.eventListeners.has('markerClick')) {
          markerCluster.marker?.on('click', markerCluster.eventListeners.get('markerClick'))
        }
      }
    })
    markerCluster.cluster.destroy = () => {
      // 清理聚合气泡
      if (markerCluster.clusterBubbleList.length) {
        markerCluster.clusterBubbleList.forEach(item => {
          item.destroy()
        })
      }
      // 清理标记点
      if (markerCluster.marker) {
        markerCluster.marker.setMap(null)
      }
      // 销毁聚合实例
      markerCluster.cluster.setMap(null)
    }
    markerCluster.on = (event, callback) => {
      switch (event) {
        case 'click':
          const bubbleCallback = (e) => {
            const { bounds, geometries, center } = e;
            const bound = {
              sw: [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
              ne: [bounds.getNorthEast().lng, bounds.getNorthEast().lat]
            }
            callback({
              bounds: bound,
              geometries,
              center,
              type: 'cluster:click'
            })
          }
          const markerCallback = (e) => {
            callback({
              ...e,
              type: 'marker:click'
            })
          }
          markerCluster.eventListeners.set('bubbleClick', bubbleCallback)
          markerCluster.eventListeners.set('markerClick', markerCallback)
          markerCluster.clusterBubbleList.forEach(item => {
            item.on('click', bubbleCallback)
          })
          markerCluster.marker?.on('click', markerCallback)
          break;
        default:
          break;
      }
    }
    markerCluster.off = (event, callback) => {
      switch (event) {
        case 'click':
          markerCluster.clusterBubbleList.forEach(item => {
            item.off('click', markerCluster.eventListeners.get('bubbleClick'))
          })
          markerCluster.marker?.off('click', markerCluster.eventListeners.get('markerClick'))
          markerCluster.eventListeners.delete('bubbleClick');
          markerCluster.eventListeners.delete('markerClick');
          break;
        default:
          break;
      }
    }
    markerCluster.removeCluster = () => {
      // 清理聚合气泡
      if (markerCluster.clusterBubbleList.length) {
        markerCluster.clusterBubbleList.forEach(item => {
          item.destroy()
        })
      }
      // 清理标记点
      if (markerCluster.marker) {
        markerCluster.marker.setMap(null)
      }
      // 销毁聚合实例
      markerCluster.cluster.setMap(null)
    }
    // 将聚合实例添加到列表中
    // this.markers.set(clusterConfig.id, markerCluster)
    return markerCluster
  }

  /**
   * 创建自定义聚合气泡类
   * @param {object} options - 配置选项
   * @returns {class} 聚合气泡类
   * @private
   */
  _createClusterBubbleClass(options) {
    const self = this
    function ClusterBubble(overlayOptions) {
      TMap.DOMOverlay.call(this, overlayOptions)
    }

    ClusterBubble.prototype = new TMap.DOMOverlay()

    ClusterBubble.prototype.onInit = function (options) {
      this.content = options.content
      this.position = options.position
      this.clusterStyle = options.clusterStyle
      this.geometries = options.geometries,
        this.center = options.center,
        this.bounds = options.bounds
    }
    // 销毁时需要删除监听器
    ClusterBubble.prototype.onDestroy = function () {
      if (this.dom && this.onClick) {
        this.dom.removeEventListener('click', this.onClick)
      }
      this.removeAllListeners()
    }

    ClusterBubble.prototype.onClick = function () {
      this.emit('click', {
        geometries: this.geometries,
        center: this.center,
        bounds: this.bounds
      })
    }
    ClusterBubble.prototype.removeListeners = function (event, callback) {
      switch (event) {
        case 'click':
          if (this.dom) {
            this.dom.removeEventListener('click', callback)
          }
          break;
        default:
          break;
      }
    }
    // 创建气泡DOM元素
    ClusterBubble.prototype.createDOM = function () {
      const dom = document.createElement('div')
      dom.classList.add('clusterBubble')
      dom.innerText = this.content
      // 应用自定义样式或默认样式
      if (this.clusterStyle) {
        // 使用自定义样式
        const style = this.clusterStyle
        dom.style.cssText = [
          `width: ${style.circleRadius * 2 || (40 + parseInt(this.content) * 2)}px;`,
          `height: ${style.circleRadius * 2 || (40 + parseInt(this.content) * 2)}px;`,
          `line-height: ${style.circleRadius * 2 || (40 + parseInt(this.content) * 2)}px;`,
          `background-color: ${style.circleColor || '#4b98fa'};`,
          `color: ${style.textColor || '#ffffff'};`,
          `border-radius: ${style.borderRadius || '50%'};`,
          `text-align: center;`,
          `font-size: ${style.textSize || 14}px;`,
          `font-weight: ${style.fontWeight || 400};`,
          `border-style: ${style.strokeStyle || 'solid'};`,
          `border-color: ${style.strokeColor || '#ffffff'};`,
          `border-width: ${style.strokeWidth + 'px' || '1px'};`,
          `box-shadow: ${style.boxShadow || '0 2px 6px rgba(0,0,0,0.3)'};`,
          `cursor: pointer;`,
          `user-select: none;`
        ].join(' ')
      } else {
        // 使用默认样式
        dom.style.cssText = [
          `width: ${40 + parseInt(this.content) * 2}px;`,
          `height: ${40 + parseInt(this.content) * 2}px;`,
          `line-height: ${40 + parseInt(this.content) * 2}px;`,
          `background-color: #4b98fa;`,
          `color: #ffffff;`,
          `border-radius: 50%;`,
          `text-align: center;`,
          `font-size: 14px;`,
          `font-weight: bold;`,
          `border: 2px solid #ffffff;`,
          `box-shadow: 0 2px 6px rgba(0,0,0,0.3);`,
          `cursor: pointer;`,
          `user-select: none;`
        ].join(' ')
      }

      // 绑定点击事件
      this.onClick = this.onClick.bind(this)
      dom.addEventListener('click', this.onClick)

      return dom
    }

    ClusterBubble.prototype.updateDOM = function () {
      if (!this.map) {
        return
      }

      // 经纬度坐标转容器像素坐标
      const pixel = this.map.projectToContainer(this.position)

      // 使文本框中心点对齐经纬度坐标点
      const left = pixel.getX() - this.dom.clientWidth / 2 + 'px'
      const top = pixel.getY() - this.dom.clientHeight / 2 + 'px'
      this.dom.style.transform = `translate(${left}, ${top})`

      this.emit('dom_updated')
    }

    return ClusterBubble
  }

  /**
   * 创建聚合标记点样式
   * @param {object} options - 配置选项
   * @returns {object} 标记点样式对象
   * @private
   */
  _createClusterMarkerStyles(options) {
    if (options.nonClustersStyle) {
      // 构建样式映射
      const styleMap = {}
      options.nonClustersStyle.forEach(style => {
        if (style.id && style.src) {
          // 验证和清理样式对象
          const validatedStyle = this._validateMarkerStyle(style)
          styleMap[style.id] = new TMap.MarkerStyle(validatedStyle)
        }
      })
      return styleMap
    }
  }
  /**
   * 验证和清理标记点样式，确保类型正确
   * @param {object} style - 样式对象
   * @returns {object} 验证后的样式对象
   */
  _validateMarkerStyle(style) {
    const validated = { ...style }
    // 确保数值类型属性为数字
    const numberProperties = ['width', 'height', 'zIndex', 'opacity', 'scale']
    numberProperties.forEach(prop => {
      if (validated[prop] !== undefined) {
        validated[prop] = Number(validated[prop]) || 0
      }
    })
    // 确保布尔类型属性为布尔值
    const booleanProperties = ['draggable', 'enableRelativeScale']
    booleanProperties.forEach(prop => {
      if (validated[prop] !== undefined) {
        validated[prop] = Boolean(validated[prop])
      }
    })
    // 确保字符串类型属性为字符串
    const stringProperties = ['src', 'faceTo', 'direction']
    stringProperties.forEach(prop => {
      if (validated[prop] !== undefined) {
        validated[prop] = String(validated[prop])
      }
    })
    // 确保偏移量为对象格式 {x: number, y: number}
    if (validated.offset) {
      if (Array.isArray(validated.offset)) {
        // 数组格式转换为对象格式
        validated.anchor = {
          x: validated.width / 2 - validated.offset[0],
          y: validated.height - validated.offset[1]
        }
      } else if (typeof validated.offset === 'object') {
        // 确保对象格式正确
        validated.anchor = {
          x: validated.width / 2 - Number(validated.offset.x),
          y: validated.height - Number(validated.offset.y)
        }
      }
    }
    delete validated.offset;

    // 最终验证：确保所有必需的属性都存在且类型正确
    const finalValidation = {
      width: Number(validated.width) || 20,
      height: Number(validated.height) || 30,
      src: String(validated.src || ''),
      draggable: Boolean(validated.draggable),
    }
    if (validated.anchor) finalValidation.anchor = validated.anchor

    // 添加可选属性
    if (validated.zIndex !== undefined) finalValidation.zIndex = Number(validated.zIndex)
    if (validated.opacity !== undefined) finalValidation.opacity = Number(validated.opacity)
    if (validated.scale !== undefined) finalValidation.scale = Number(validated.scale)
    return finalValidation
  }
}
