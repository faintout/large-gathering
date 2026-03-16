<template>
    <div class="chart-box">
     <!-- 基础折线图 -->
     <div class="chart">
         <GeneralChart :option="baseBarChart"></GeneralChart>
     </div>
     <div class="chart">
         <GeneralChart :option="multipleBarChart"></GeneralChart>
     </div>
    </div>
 </template>
 
<script setup>
import { computed, reactive,ref} from 'vue'
import GeneralChart from '@/views/autoEcharts/components/chart/generalChart.vue'
import ColumnBase from '@/views/autoEcharts/components/chart/chartOptions/column/base'
import MultipleColumn from '@/views/autoEcharts/components/chart/chartOptions/column/multipleColumn'
 const baseBarChart = ref(null)
 const multipleBarChart = ref(null)
 baseBarChart.value = new ColumnBase({
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
multipleBarChart.value = new MultipleColumn({
    "data": [
            {
                "data": [
                    3000, 3000, 4000, 3000, 5000, 3000, 4000
                ],
                "name": "机动车违法"
            },
            {
                "data": [
                    3000, 3000, 4000, 3000, 5000, 3000, 4000
                ],
                "name": "非机动车违法"
            },
            {
                "data": [
                    3000, 3000, 4000, 3000, 5000, 3000, 4000
                ],
                "name": "行人违法"
            },
        ],
        barWidth:8,
        color:[
        ['rgba(82, 176, 255, 1)','rgba(34, 117, 240, 1)'],
        ['rgba(143, 246, 187, 1)','rgba(52, 173, 84, 1)'],
        ['rgba(255, 236, 132, 1)','rgba(240, 207, 33, 1)'],
    ],
    "xaxis": [
        '4/1', '4/2', '4/3', '4/4', '4/5', '4/6', '4/7'
    ]
})
 </script>
 <style scoped lang="scss">
 </style>