<template>
   <div>
      <div class="hot-bar-area">
         <div class="show-time">
            <el-select v-model="currHotTimeIndex" popper-class="custom-query-select" placeholder="请选择"
               @change="selectTimeChange">
               <el-option :label="item.potStartTime + ' - ' + item.potEndTime" :value="index"
                  v-for="(item, index) in hotTimeList" :key="item.potStartTime" />
            </el-select>
         </div>
         <HotBar ref="hotBarRef" @handleCompleteIndex="handleCompleteIndex" :hotTimeList="hotTimeList"></HotBar>
      </div>
   </div>
</template>

<script setup>
import HotBar from './hot-bar.vue'
import { ref, computed } from 'vue'
const currHotTimeIndex = ref(0)
const hotBarRef = ref(null)
const hotTimeList = ref([
    {
        "potStartTime": "00:00",
        "potEndTime": "00:15",
        "arrivedFlow": 20
    },
    {
        "potStartTime": "00:15",
        "potEndTime": "00:30",
        "arrivedFlow": 20
    },
    {
        "potStartTime": "00:30",
        "potEndTime": "00:45",
        "arrivedFlow": 20
    },
    {
        "potStartTime": "00:45",
        "potEndTime": "01:00",
        "arrivedFlow": 16
    },
    {
        "potStartTime": "01:00",
        "potEndTime": "01:15",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "01:15",
        "potEndTime": "01:30",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "01:30",
        "potEndTime": "01:45",
        "arrivedFlow": 8
    },
    {
        "potStartTime": "01:45",
        "potEndTime": "02:00",
        "arrivedFlow": 4
    },
    {
        "potStartTime": "02:00",
        "potEndTime": "02:15",
        "arrivedFlow": 4
    },
    {
        "potStartTime": "02:15",
        "potEndTime": "02:30",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "02:30",
        "potEndTime": "02:45",
        "arrivedFlow": 4
    },
    {
        "potStartTime": "02:45",
        "potEndTime": "03:00",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "03:00",
        "potEndTime": "03:15",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "03:15",
        "potEndTime": "03:30",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "03:30",
        "potEndTime": "03:45",
        "arrivedFlow": 8
    },
    {
        "potStartTime": "03:45",
        "potEndTime": "04:00",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "04:00",
        "potEndTime": "04:15",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "04:15",
        "potEndTime": "04:30",
        "arrivedFlow": 4
    },
    {
        "potStartTime": "04:30",
        "potEndTime": "04:45",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "04:45",
        "potEndTime": "05:00",
        "arrivedFlow": 4
    },
    {
        "potStartTime": "05:00",
        "potEndTime": "05:15",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "05:15",
        "potEndTime": "05:30",
        "arrivedFlow": 0
    },
    {
        "potStartTime": "05:30",
        "potEndTime": "05:45",
        "arrivedFlow": 4
    },
    {
        "potStartTime": "05:45",
        "potEndTime": "06:00",
        "arrivedFlow": 4
    },
    {
        "potStartTime": "06:00",
        "potEndTime": "06:15",
        "arrivedFlow": 8
    },
    {
        "potStartTime": "06:15",
        "potEndTime": "06:30",
        "arrivedFlow": 4
    },
    {
        "potStartTime": "06:30",
        "potEndTime": "06:45",
        "arrivedFlow": 4
    },
    {
        "potStartTime": "06:45",
        "potEndTime": "07:00",
        "arrivedFlow": 36
    },
    {
        "potStartTime": "07:00",
        "potEndTime": "07:15",
        "arrivedFlow": 40
    },
    {
        "potStartTime": "07:15",
        "potEndTime": "07:30",
        "arrivedFlow": 48
    },
    {
        "potStartTime": "07:30",
        "potEndTime": "07:45",
        "arrivedFlow": 60
    },
    {
        "potStartTime": "07:45",
        "potEndTime": "08:00",
        "arrivedFlow": 104
    },
    {
        "potStartTime": "08:00",
        "potEndTime": "08:15",
        "arrivedFlow": 136
    },
    {
        "potStartTime": "08:15",
        "potEndTime": "08:30",
        "arrivedFlow": 104
    },
    {
        "potStartTime": "08:30",
        "potEndTime": "08:45",
        "arrivedFlow": 120
    },
    {
        "potStartTime": "08:45",
        "potEndTime": "09:00",
        "arrivedFlow": 200
    },
    {
        "potStartTime": "09:00",
        "potEndTime": "09:15",
        "arrivedFlow": 116
    },
    {
        "potStartTime": "09:15",
        "potEndTime": "09:30",
        "arrivedFlow": 152
    },
    {
        "potStartTime": "09:30",
        "potEndTime": "09:45",
        "arrivedFlow": 128
    },
    {
        "potStartTime": "09:45",
        "potEndTime": "10:00",
        "arrivedFlow": 136
    },
    {
        "potStartTime": "10:00",
        "potEndTime": "10:15",
        "arrivedFlow": 120
    },
    {
        "potStartTime": "10:15",
        "potEndTime": "10:30",
        "arrivedFlow": 64
    },
    {
        "potStartTime": "10:30",
        "potEndTime": "10:45",
        "arrivedFlow": 60
    },
    {
        "potStartTime": "10:45",
        "potEndTime": "11:00",
        "arrivedFlow": 40
    },
    {
        "potStartTime": "11:00",
        "potEndTime": "11:15",
        "arrivedFlow": 88
    },
    {
        "potStartTime": "11:15",
        "potEndTime": "11:30",
        "arrivedFlow": 36
    },
    {
        "potStartTime": "11:30",
        "potEndTime": "11:45",
        "arrivedFlow": 92
    },
    {
        "potStartTime": "11:45",
        "potEndTime": "12:00",
        "arrivedFlow": 108
    },
    {
        "potStartTime": "12:00",
        "potEndTime": "12:15",
        "arrivedFlow": 76
    },
    {
        "potStartTime": "12:15",
        "potEndTime": "12:30",
        "arrivedFlow": 116
    },
    {
        "potStartTime": "12:30",
        "potEndTime": "12:45",
        "arrivedFlow": 124
    },
    {
        "potStartTime": "12:45",
        "potEndTime": "13:00",
        "arrivedFlow": 68
    },
    {
        "potStartTime": "13:00",
        "potEndTime": "13:15",
        "arrivedFlow": 80
    },
    {
        "potStartTime": "13:15",
        "potEndTime": "13:30",
        "arrivedFlow": 84
    },
    {
        "potStartTime": "13:30",
        "potEndTime": "13:45",
        "arrivedFlow": 64
    },
    {
        "potStartTime": "13:45",
        "potEndTime": "14:00",
        "arrivedFlow": 116
    },
    {
        "potStartTime": "14:00",
        "potEndTime": "14:15",
        "arrivedFlow": 140
    },
    {
        "potStartTime": "14:15",
        "potEndTime": "14:30",
        "arrivedFlow": 104
    },
    {
        "potStartTime": "14:30",
        "potEndTime": "14:45",
        "arrivedFlow": 156
    },
    {
        "potStartTime": "14:45",
        "potEndTime": "15:00",
        "arrivedFlow": 116
    },
    {
        "potStartTime": "15:00",
        "potEndTime": "15:15",
        "arrivedFlow": 100
    },
    {
        "potStartTime": "15:15",
        "potEndTime": "15:30",
        "arrivedFlow": 136
    },
    {
        "potStartTime": "15:30",
        "potEndTime": "15:45",
        "arrivedFlow": 92
    },
    {
        "potStartTime": "15:45",
        "potEndTime": "16:00",
        "arrivedFlow": 124
    },
    {
        "potStartTime": "16:00",
        "potEndTime": "16:15",
        "arrivedFlow": 84
    },
    {
        "potStartTime": "16:15",
        "potEndTime": "16:30",
        "arrivedFlow": 104
    },
    {
        "potStartTime": "16:30",
        "potEndTime": "16:45",
        "arrivedFlow": 80
    },
    {
        "potStartTime": "16:45",
        "potEndTime": "17:00",
        "arrivedFlow": 76
    },
    {
        "potStartTime": "17:00",
        "potEndTime": "17:15",
        "arrivedFlow": 132
    },
    {
        "potStartTime": "17:15",
        "potEndTime": "17:30",
        "arrivedFlow": 80
    },
    {
        "potStartTime": "17:30",
        "potEndTime": "17:45",
        "arrivedFlow": 120
    },
    {
        "potStartTime": "17:45",
        "potEndTime": "18:00",
        "arrivedFlow": 96
    },
    {
        "potStartTime": "18:00",
        "potEndTime": "18:15",
        "arrivedFlow": 116
    },
    {
        "potStartTime": "18:15",
        "potEndTime": "18:30",
        "arrivedFlow": 44
    },
    {
        "potStartTime": "18:30",
        "potEndTime": "18:45",
        "arrivedFlow": 96
    },
    {
        "potStartTime": "18:45",
        "potEndTime": "19:00",
        "arrivedFlow": 48
    },
    {
        "potStartTime": "19:00",
        "potEndTime": "19:15",
        "arrivedFlow": 76
    },
    {
        "potStartTime": "19:15",
        "potEndTime": "19:30",
        "arrivedFlow": 64
    },
    {
        "potStartTime": "19:30",
        "potEndTime": "19:45",
        "arrivedFlow": 56
    },
    {
        "potStartTime": "19:45",
        "potEndTime": "20:00",
        "arrivedFlow": 36
    },
    {
        "potStartTime": "20:00",
        "potEndTime": "20:15",
        "arrivedFlow": 44
    },
    {
        "potStartTime": "20:15",
        "potEndTime": "20:30",
        "arrivedFlow": 36
    },
    {
        "potStartTime": "20:30",
        "potEndTime": "20:45",
        "arrivedFlow": 40
    },
    {
        "potStartTime": "20:45",
        "potEndTime": "21:00",
        "arrivedFlow": 28
    },
    {
        "potStartTime": "21:00",
        "potEndTime": "21:15",
        "arrivedFlow": 24
    },
    {
        "potStartTime": "21:15",
        "potEndTime": "21:30",
        "arrivedFlow": 44
    },
    {
        "potStartTime": "21:30",
        "potEndTime": "21:45",
        "arrivedFlow": 36
    },
    {
        "potStartTime": "21:45",
        "potEndTime": "22:00",
        "arrivedFlow": 12
    },
    {
        "potStartTime": "22:00",
        "potEndTime": "22:15",
        "arrivedFlow": 32
    },
    {
        "potStartTime": "22:15",
        "potEndTime": "22:30",
        "arrivedFlow": 36
    },
    {
        "potStartTime": "22:30",
        "potEndTime": "22:45",
        "arrivedFlow": 24
    },
    {
        "potStartTime": "22:45",
        "potEndTime": "23:00",
        "arrivedFlow": 52
    },
    {
        "potStartTime": "23:00",
        "potEndTime": "23:15",
        "arrivedFlow": 24
    },
    {
        "potStartTime": "23:15",
        "potEndTime": "23:30",
        "arrivedFlow": 32
    },
    {
        "potStartTime": "23:30",
        "potEndTime": "23:45",
        "arrivedFlow": 12
    },
    {
        "potStartTime": "23:45",
        "potEndTime": "24:00",
        "arrivedFlow": 0
    }
])
const handleCompleteIndex = (index) => {
   if (index === currHotTimeIndex.value) {
      return
   }
   currHotTimeIndex.value = index
}
const selectTimeChange = ()=>{
    hotBarRef.value.updateHotBarIndex(currHotTimeIndex.value)
    //更新地图热力
}
</script>
<style scoped lang="scss">
.hot-bar-area {
   width: 100%;
   height: pxTvh(77);
   display: flex;
   gap: pxTvw(16);
   justify-content: space-between;
   align-items: flex-end;

   &>.show-time {
      width: pxTvw(134);
      height: pxTvh(38);
      background-color: #1e4384;
      border-radius: pxTvw(4);
      display: flex;
      justify-content: center;
      align-items: center;
      color: #CFDBFC;
   }

}
</style>