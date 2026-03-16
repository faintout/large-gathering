/**
 * 腾讯地图 - 路径规划
 */
// import { getDirectionDrivingApi } from '@/http/api.js'
import { coverToTMapPolylineArr } from '../utils/index.js'


export default class RouteManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance
    this.map = mapInstance.map
  }

  getRoute(options) {
    return new Promise((resolve, reject) => {
      if (!options.from || !options.to) {
        console.error('路线规划起始点和终点不能为空')
        reject(null)
        return
      }
      const fromStr = `${options.from.lat},${options.from.lng}`
      const toStr = `${options.to.lat},${options.to.lng}`
      const waypointsArr = Array.isArray(options.waypoints) ? options.waypoints : []
      const waypointsStr = waypointsArr
        .filter(p => p && p.lat != null && p.lng != null)
        .map(p => `${p.lat},${p.lng}`)
        .join(';')

      // getDirectionDrivingApi({ from: fromStr, to: toStr, waypoints: waypointsStr })
      //   .then(route => {
      //     const polyline = coverToTMapPolylineArr(route?.polyline || [])
      //     resolve({
      //       status: 0,
      //       message: 'Success',
      //       route: {
      //         distance: route.distance || 0,
      //         polyline
      //       }
      //     })
      //   })
      //   .catch(error => {
      //     console.error('路径规划失败:', error)
      //     reject(error)
      //   })
    })
  }
}
