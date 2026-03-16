<template>
  <div class="chart-box">
    <div class="chart gaugeChart">
     <GeneralChart :option="gaugeChart"></GeneralChart>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive,ref} from 'vue'
import GeneralChart from '@/views/autoEcharts/components/chart/generalChart.vue'
import ImageGauge from '@/views/autoEcharts/components/chart/chartOptions/gauge/imageGauge'
const gaugeChart = ref(null)
gaugeChart.value = new ImageGauge([
        {
          value: 50,
        }
      ])
</script>
<style scoped >
.gaugeChart{
    width: calc(300 / 1920 * 100vw) !important;
    height: calc(300 / 1920 * 100vw) !important;
}
</style>