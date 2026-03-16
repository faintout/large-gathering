```javascript
时间热力分布图,自动生成颜色热力
<HotBar @handleCompleteIndex="handleCompleteIndex" :hotTimeList="hotTimeList"></HotBar>
//参数 
hotTimeList Array [{time:'00:00',value:0},{time:'01:00',value:23,...}]

//事件
handleCompleteIndex 鼠标拖动/点击后返回的位置索引
```