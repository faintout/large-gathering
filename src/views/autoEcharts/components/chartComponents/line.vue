<template>
   <div class="chart-box">
	<!-- 基础折线图 -->
	<div class="chart">
		<GeneralChart :option="baseLineChart"></GeneralChart>
	</div>
	<div class="chart">
		<GeneralChart :option="multipleLineChart"></GeneralChart>
	</div>
   </div>
</template>

<script setup>
import { computed, reactive,ref} from 'vue'
import GeneralChart from '@/views/autoEcharts/components/chart/generalChart.vue'
import LineBase from '@/views/autoEcharts/components/chart/chartOptions/line/base'
import MultipleLine from '@/views/autoEcharts/components/chart/chartOptions/line/multipleLine'
const baseLineChart = ref(null)
const multipleLineChart = ref(null)
baseLineChart.value = new LineBase({
    color: {
        areaStyle: [
            'rgba(104, 223, 250, 1)',
            'rgba(80, 173, 251, 0)'
        ],
        //圆点边框颜色
        itemStyleColor: 'rgba(14, 156, 255, 1)',
        lineStyle: [
            'rgba(104, 223, 250, 1)',
            'rgba(75, 210, 239, 1)'
        ]
    },
    "data": [
        {
            "data": [
                3000, 3000, 4000, 3000, 5000, 3000, 4000
            ],
            "name": ""
        }
    ],
    "xaxis": [
        '4/1', '4/2', '4/3', '4/4', '4/5', '4/6', '4/7'
    ]
})

multipleLineChart.value = new MultipleLine({
    color: [
        '#4073FF',
        '#7EFFA2',
        '#EFBA69',
        '#72CAFF',
    ],
    "data": [
        {
            "data": [
                1000, 3000, 4000, 2000, 5000, 3000, 4000
            ],
            "name": "东进口"
        },
        {
            "data": [
                3000, 2000, 4000, 3000, 3000, 3000, 4000
            ],
            "name": "北进口"
        },
        {
            "data": [
                3000, 3000, 3000, 3000, 5000, 3000, 4000
            ],
            "name": "南进口"
        },
        {
            "data": [
                3000, 3000, 4000, 4000, 5000, 3000, 5000
            ],
            "name": "西进口"
        },
    ],
    "xaxis": [
        '4/1', '4/2', '4/3', '4/4', '4/5', '4/6', '4/7'
    ]
})
</script>
<style scoped lang="scss">
</style>