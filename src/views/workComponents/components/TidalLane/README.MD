```javascript
基于JS+Canvas开发车道线+潮汐车道绘制
const tidalLane = new TidalLane($1, $2)
//$1 - 为外层画布的ID String
//$2 - 绘制道路所需的数组 Array 
{
    type: 'top', //为行进方向  top|bottom
    tidal: false,  //是否为潮汐车道 Boolean
},

// 方法
setRoadList 更新道路数据，数据同$2
```