import * as turf from '@turf/turf'
/**
 * 计算两点之间的距离（米）
 * @param {Object} point1 第一个点 {longitude, latitude}
 * @param {Object} point2 第二个点 {longitude, latitude}
 * @returns {number} 距离（米）
 */
export const calculateDistance = (point1, point2) => {
    const R = 6371000; // 地球半径（米）
    const lat1 = point1[1] * Math.PI / 180;
    const lat2 = point2[1] * Math.PI / 180;
    const deltaLat = (point2[1] - point1[1]) * Math.PI / 180;
    const deltaLon = (point2[0] - point1[0]) * Math.PI / 180;
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};
/**
 * 计算曲线的控制点
 * @param {Object} startPoint 起点
 * @param {Object} endPoint 终点
 * @param {number} distance 距离
 * @returns {Object} 控制点坐标
 */
export const calculateControlPoint = (startPoint, endPoint, distance) => {
    // 计算中点
    const midLng = (startPoint[0] + endPoint[0]) / 2;
    const midLat = (startPoint[1] + endPoint[1]) / 2;

    // 计算垂直偏移量（根据距离调整曲线高度）
    // const offset = Math.min(distance * 0.1, 0.001); // 最大偏移量限制
    
    // 计算垂直于线段的方向
    const dx = endPoint[0] - startPoint[0];
    const dy = endPoint[1] - startPoint[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // 固定曲率比例（偏移量为线段长度的20%，所有线的曲率都一样）
    const curvatureRatio = 0.2;
    const offset = length * curvatureRatio;
    
    // 计算垂直方向
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // 返回控制点坐标（使用负偏移使曲线从底部生成）
    return [ midLng - perpX * offset,
         midLat - perpY * offset
     ];
};
/**
 * 生成曲线的坐标点
 * @param {Object} startPoint 起点
 * @param {Object} endPoint 终点
 * @param {Object} controlPoint 控制点
 * @returns {Array} 曲线坐标点数组
 */
export const generateCurvePoints = (startPoint, endPoint, controlPoint) => {
    const points = [];
    const steps = 20; // 曲线点的数量
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // 二次贝塞尔曲线公式
        const x = Math.pow(1 - t, 2) * startPoint[0] +
                 2 * (1 - t) * t * controlPoint[0] +
                 Math.pow(t, 2) * endPoint[0];
        const y = Math.pow(1 - t, 2) * startPoint[1] +
                 2 * (1 - t) * t * controlPoint[1] +
                 Math.pow(t, 2) * endPoint[1];
        points.push([x, y]);
    }
    
    return points;
};

//生成凸多边形
export const generateConvexPolygon = (coordinates = [])=>{  
  //使用经纬度
  const lngLatPoints = coordinates.map(cross=>turf.point([cross[0],cross[1]]))
  const points = turf.featureCollection(lngLatPoints);
  // 计算点之间的平均距离作为maxEdge
  // const bbox = turf.bbox(points);
  // const bboxPolygon = turf.bboxPolygon(bbox);
  // const maxDistance = turf.length(bboxPolygon, { units: 'miles' }) / uniqueCrossList.length;
  // const options = { units: "miles",maxEdge:maxDistance*1.5};
  // const options = { units: "miles",maxEdge:Infinity};
  //创建凸多边形
  var hull = turf.convex(points)
  if(!hull){
    //弹出提示
    console.error('生成凸多边形失败,检查经纬度是否正确',coordinates);
    return {}
  }
  //平滑多边形
  var smoothed = turf.polygonSmooth(hull, { iterations: 3 });
  //缩放两倍
  const scaleHull = turf.transformScale(smoothed.features[0],1.5);
  return scaleHull.geometry.coordinates
}