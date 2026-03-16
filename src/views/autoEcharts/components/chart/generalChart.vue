<template>
    <v-echarts ref="chartRef" 
    @mouseover="mouseover"
    @mousemove="mousemove"
    @click="handClick" 
    @legendSelectChanged="handleLegendSelectChanged" 
    v-if="options" 
    :autoresize="true" 
    :option="options" 
    :update-options="{notMerge: true}"/>
</template>

<script setup>
import { computed, reactive,ref} from 'vue'
import useCalcChart from '@/views/autoEcharts/hooks/useCalcChart.js'
const chartRef = ref(null)
const props = defineProps({
    option: {
        type: Object,
        default: {}
    }
})
const { 
    replaceOptionsSize
} = reactive(useCalcChart())
const options = computed(()=>replaceOptionsSize(props.option))
const emits = defineEmits([
    'legendSelectChanged',
    'click',
    'mouseover',
    'mousemove',
])
const handleLegendSelectChanged = (params) => emits('legendSelectChanged', chartRef.value,params)

const handClick = params=>emits('click',params)

const mouseover = params=>emits('mouseover',params)
const mousemove = params=>emits('mousemove',params)
</script>
<style scoped lang="scss">
</style>