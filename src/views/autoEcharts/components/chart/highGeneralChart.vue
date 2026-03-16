<template>
    <div class="high-chart" :id="chartUuid"></div>
</template>

<script setup>
import { computed, reactive, ref, watchEffect, nextTick, onUnmounted,watch } from 'vue'
import { guid } from '@/views/autoEcharts/utils/toolUtils.js'
import useCalcChart from '@/views/autoEcharts/hooks/useCalcChart.js'
import Highcharts from 'highcharts/highstock';
const props = defineProps({
    option: {
        type: Object,
        default: {}
    }
})
const chartUuid = ref(guid())
const chartDom = ref(null)

const {
    replaceOptionsSize
} = reactive(useCalcChart())
const options = computed(() => replaceOptionsSize(props.option))

watch(()=>options.value, (newVal, oldVal) => {
    if(newVal){
        nextTick(() => {
            chartDom.value = Highcharts.chart(chartUuid.value, options.value);
        });
    }
}, {
    immediate:true,
    deep: true
})

// 清理工作
onUnmounted(() => {
    if (chartDom.value) {
        // 销毁 Highcharts 实例
        chartDom.value.destroy();
    }
});
</script>
<style scoped >
.high-chart{
    width: 100%;
    height: 100%;
}
:deep(.tooltip-back-bar){
  background-color: linear-gradient(180deg, #F3F4FE 0%, rgba(243,244,254,0) 100%) !important;
  color:rgba(39, 39, 46, 1);
  backdrop-filter: blur(5px);
}
</style>