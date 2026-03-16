<template>
    <div>
        <div class="hot-bar-area">
            <div class="show-time">{{ currHotTime?.time }}</div>
            <HotBar @handleCompleteIndex="handleCompleteIndex" :hotTimeList="hotTimeList"></HotBar>
        </div>
    </div>
</template>

<script setup>
import HotBar from './hot-bar.vue'
import { ref, computed } from 'vue'
const currHotTimeIndex = ref(0)
const hotTimeList = ref([
      {
         time: '00:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '01:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '02:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '03:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '04:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '05:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '06:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '07:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '08:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '09:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '10:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '11:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '12:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '13:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '14:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '15:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '16:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '17:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '18:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '19:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '20:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '21:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '22:00',
         value: parseInt(Math.random() * 100),
      },
      {
         time: '23:00',
         value: parseInt(Math.random() * 100),
      },
      ])
const currHotTime = computed(() => hotTimeList.value[currHotTimeIndex.value])
const handleCompleteIndex = (index) => {
    if (index === currHotTimeIndex.value) {
        return
    }
    currHotTimeIndex.value = index
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
        width: pxTvw(104);
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