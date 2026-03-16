<template>
   <div class="chart-box">
      <div class="chart">
       <HighGeneralChart :option="polarBaserChart"></HighGeneralChart>
      </div>
   </div>
</template>

<script setup>
import { computed, reactive,ref} from 'vue'
import HighGeneralChart from '@/views/autoEcharts/components/chart/highGeneralChart.vue'
import PolarBase from '@/views/autoEcharts/components/chart/chartOptions/polar/base'
const polarBaserChart = ref(null)
polarBaserChart.value = new PolarBase([
                1,
                0,
                0,
                1,
                0,
                0,
                2,
                2,
                0,
                1,
                1,
                1,
                1,
                2,
                0,
                0,
                1,
                1,
                4,
                2,
                4,
                0,
                0,
                0
            ])
</script>
<style scoped >
</style>