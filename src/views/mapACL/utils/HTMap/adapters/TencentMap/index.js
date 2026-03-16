/**
 * 腾讯地图适配器 - 统一入口
 * Core + Events + Control + Popup + Lines + Polygons + Cluster + Route + Markers
 */
import TencentMapCore from './core/index.js'
import EventManager from './events/index.js'
import ControlManager from './control/index.js'
import PopupManager from './popup/index.js'
import LinesManager from './lines/index.js'
import PolygonsManager from './polygons/index.js'
import ClusterManager from './cluster/index.js'
import RouteManager from './route/index.js'
import MarkerManager from './markers/index.js'

export default class TencentMap extends TencentMapCore {
  constructor(containerId, options) {
    super(containerId, options)
    this.eventManager = new EventManager(this)
    this.controlManager = new ControlManager(this)
    this.popupManager = new PopupManager(this)
    this.linesManager = new LinesManager(this)
    this.polygonsManager = new PolygonsManager(this)
    this.clusterManager = new ClusterManager(this)
    this.routeManager = new RouteManager(this)
    this.markerManager = new MarkerManager(this)
  }

  on(event, callback) {
    return this.eventManager.on(event, callback)
  }
  off(event, callback) {
    return this.eventManager.off(event, callback)
  }
  triggerEvent(event, data) {
    return this.eventManager.triggerEvent(event, data)
  }

  setView(center, zoom) {
    return this.controlManager.setView(center, zoom)
  }
  setCenter(center, options) {
    return this.controlManager.setCenter(center, options)
  }
  setZoom(zoom, options) {
    return this.controlManager.setZoom(zoom, options)
  }
  setPitch(pitch, options) {
    return this.controlManager.setPitch(pitch, options)
  }
  setBearing(rotation, options) {
    return this.controlManager.setBearing(rotation, options)
  }
  getBearing() {
    return this.controlManager.getBearing()
  }
  getPitch() {
    return this.controlManager.getPitch()
  }
  getRotation() {
    return this.controlManager.getRotation()
  }
  getCenter() {
    return this.controlManager.getCenter()
  }
  getZoom() {
    return this.controlManager.getZoom()
  }
  getBounds() {
    return this.controlManager.getBounds()
  }
  limitBounds(bounds) {
    return this.controlManager.limitBounds(bounds)
  }
  setBounds(bounds) {
    return this.controlManager.setBounds(bounds)
  }
  easeTo(options) {
    return this.controlManager.easeTo(options)
  }
  fitBounds(options) {
    return this.controlManager.fitBounds(options)
  }

  addPopup(options) {
    return this.popupManager.addPopup(options)
  }
  removePopup(popup) {
    return this.popupManager.removePopup(popup)
  }

  addLines(options) {
    return this.linesManager.addLines(options)
  }

  addPolygons(options) {
    return this.polygonsManager.addPolygons(options)
  }

  addClusters(options) {
    return this.clusterManager.addClusters(options)
  }

  getRoute(options) {
    return this.routeManager.getRoute(options)
  }

  addDomMarker(options) {
    return this.markerManager.addDomMarker(options)
  }
  addMarkers(options) {
    return this.markerManager.addMarkers(options)
  }
  getMarkers() {
    return this.markerManager.getMarkers()
  }
  updateDOMMarkerPosition(marker, lat, lng) {
    return this.markerManager.updateDOMMarkerPosition(marker, lat, lng)
  }
  getDOMMarkerPosition(marker) {
    return this.markerManager.getDOMMarkerPosition(marker)
  }

  getNativeMap() {
    return this.map
  }
}
