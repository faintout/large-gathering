```javascript
时间热力分布图,自动生成颜色热力,时间段
<HotBar ref="hotBarRef" @handleCompleteIndex="handleCompleteIndex" :hotTimeList="hotTimeList"></HotBar>
//参数 
hotTimeList Array [{
        "potStartTime": "00:00",
        "potEndTime": "00:15",
        "arrivedFlow": 20
    },{
        "potStartTime": "00:15",
        "potEndTime": "00:30",
        "arrivedFlow": 15 
    },...]

//事件
handleCompleteIndex 鼠标拖动/点击后返回的位置索引

//内部方法
hotBarRef.updateHotBarIndex 设置热力图的位置索引
```