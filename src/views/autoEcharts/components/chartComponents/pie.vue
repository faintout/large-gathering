<template>
    <div class="chart-box">
        <div class="chart">
            <GeneralChart :option="pieChart"></GeneralChart>
        </div>
        <div class="chart">
            <GeneralChart :option="pieChart1"></GeneralChart>
        </div>
        <div class="chart">
            <GeneralChart :option="gapChart" @legendSelectChanged="legendSelectChanged"></GeneralChart>
        </div>
        <div class="chart">
            <GeneralChart :option="gapChartLegend" @legendSelectChanged="legendSelectChanged"></GeneralChart>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import GeneralChart from '@/views/autoEcharts/components/chart/generalChart.vue'
import MultiRingPie from '@/views/autoEcharts/components/chart/chartOptions/pie/multiRingPie'
import RingPie from '@/views/autoEcharts/components/chart/chartOptions/pie/ringPie'
import GapPie, { legendSelectChanged } from '@/views/autoEcharts/components/chart/chartOptions/pie/gapPie'
const pieChart = ref(null)
const pieChart1 = ref(null)

const gapChart = ref(null)
const gapChartLegend = ref(null)
pieChart.value = new MultiRingPie([
    { value: 1996, name: '小型车' },
    { value: 1270, name: '大型车-公交' },
    { value: 1170, name: '大型车-其他' },
    { value: 1230, name: '其它' },
    { value: 1220, name: '其它1' },
    // { value: 1210, name: '其它2' },
])
pieChart1.value = new RingPie([
    { value: 1996, name: '小型车' },
    { value: 1270, name: '大型车-公交' },
    { value: 1170, name: '大型车-其他' },
    // { value: 1230, name: '其它' },
    // { value: 1220, name: '其它1' },
    // { value: 1210, name: '其它2' },
])

gapChart.value = new GapPie([{
    "value": 1,
    "name": "小型车"
},
{
    "value": 2,
    "name": "公交车"
},
{
    "value": 3,
    "name": "渣土车"
},
{
    "value": 4,
    "name": "大型车"
},
{
    "value": 5,
    "name": "其它"
},
{
    "value": 6,
    "name": "非新能源车"
},
{
    "value": 7,
    "name": "大型车1"
},
    // {
    //     "value": 1200,
    //     "name": "其它"
    // },
    // {
    //     "value": 1996,
    //     "name": "小型车1"
    // },
    // {
    //     "value": 1270,
    //     "name": "公交车2"
    // },
    // {
    //     "value": 1170,
    //     "name": "渣土车3"
    // },
    // {
    //     "value": 1480,
    //     "name": "大型车4"
    // },
    // {
    //     "value": 1200,
    //     "name": "其它5"
    // }
], {
    titleName: '车辆总数',
    lengthDetailShow: false
})
gapChartLegend.value = new GapPie([{
    "value": 1996,
    "name": "小型车"
},
{
    "value": 1270,
    "name": "公交车"
},
{
    "value": 1170,
    "name": "渣土车"
},
{
    "value": 1480,
    "name": "大型车"
},
{
    "value": 1200,
    "name": "其它"
},
{
    "value": 1170,
    "name": "非新能源车"
},
{
    "value": 1480,
    "name": "大型车1"
},
{
    "value": 1200,
    "name": "其它1"
},
{
    "value": 1996,
    "name": "小型车1"
},
{
    "value": 1270,
    "name": "公交车2"
},
    // {
    //     "value": 1170,
    //     "name": "渣土车3"
    // },
    // {
    //     "value": 1480,
    //     "name": "大型车4"
    // },
    // {
    //     "value": 1200,
    //     "name": "其它5"
    // }
], {
    titleName: '车辆总数',
    lengthDetailShow: true,
    isLegendNumClick: true
})
</script>
<style scoped></style>