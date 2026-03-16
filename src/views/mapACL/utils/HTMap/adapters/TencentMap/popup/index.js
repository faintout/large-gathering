/**
 * 腾讯地图 - 信息弹窗（Popup）
 */
import { generateUniqueId } from '../utils/index.js'

export default class PopupManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance
    this.map = mapInstance.map
  }

  addPopup(options) {
    if (!this.map) return null
    const pointInfoUuid = generateUniqueId()
    const closeOnClick = options.closeOnClick === true
    let mapClickHandler = null

    const popupObj = {
      id: pointInfoUuid,
      popup: null
    }

    if (options.content instanceof HTMLElement) {
      const popupOptions = {
        map: this.map,
        id: options.id,
        zIndex: options.zIndex || 1001,
        position: new TMap.LatLng(options.lngLat[1], options.lngLat[0]),
        content: `<div id="${pointInfoUuid}"></div>`,
        closeButton: options.closeButton || false,
        enableCustom: options.enableCustom || false,
        offset: options.offset || { x: 0, y: 0 }
      }
      popupObj.popup = new TMap.InfoWindow(popupOptions)
      document.getElementById(pointInfoUuid).appendChild(options.content)
      popupObj.popup?.open()
    } else {
      const popupOptions = {
        map: this.map,
        id: options.id,
        zIndex: options.zIndex || 1001,
        position: new TMap.LatLng(options.lngLat[1], options.lngLat[0]),
        content: `<div id="${pointInfoUuid}">${options.content}</div>`,
        closeButton: options.closeButton || false,
        enableCustom: options.enableCustom || false,
        offset: options.offset || { x: 0, y: 0 }
      }
      popupObj.popup = new TMap.InfoWindow(popupOptions)
      popupObj.popup?.open()
    }

    if (closeOnClick && this.map.on && this.map.off) {
      mapClickHandler = (evt) => {
        const target = (evt?.originalEvent?.target) ? evt.originalEvent.target : (evt?.target) ? evt.target : null
        const contentEl = document.getElementById(pointInfoUuid)
        const popupRoot = contentEl ? contentEl.parentElement : null
        if (popupRoot && target && popupRoot.contains(target)) return
        if (popupObj.popup) {
          popupObj.popup.close()
          popupObj.popup = null
        }
        if (this.map && mapClickHandler) this.map.off('click', mapClickHandler)
      }
      this.map.on('click', mapClickHandler)
    }

    popupObj.removePopup = () => {
      if (closeOnClick && mapClickHandler && this.map?.off) {
        this.map.off('click', mapClickHandler)
        mapClickHandler = null
      }
      if (popupObj.popup) {
        popupObj.popup.close()
        popupObj.popup = null
      }
    }
    popupObj.setLngLat = (lngLat) => {
      if (popupObj.popup) popupObj.popup.setPosition(new TMap.LatLng(lngLat[1], lngLat[0]))
    }
    popupObj.getElement = () => {
      const htmlToDOM = (htmlString) => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlString
        return Array.from(tempDiv.children)
      }
      return popupObj.popup ? htmlToDOM(popupObj.popup.content)[0] : null
    }
    popupObj.setContent = (content) => {
      const domElement = document.getElementById(popupObj.id)
      if (!domElement) return
      if (content instanceof Node) {
        domElement.innerHTML = ''
        domElement.appendChild(content)
      } else if (typeof content === 'string') {
        domElement.innerHTML = content
      }
    }
    return popupObj
  }

  removePopup(popup) {
    if (!popup) return
    if (typeof popup.removePopup === 'function') {
      popup.removePopup()
    } else if (popup.close) {
      popup.close()
    }
  }
}
