<script setup>
defineOptions({
  name: '图表组件',
})
import Line from './components/chartComponents/line.vue'
import Bar from './components/chartComponents/bar.vue'
import Pie from './components/chartComponents/pie.vue'
import Gauge from './components/chartComponents/gauge.vue'
import Radar from './components/chartComponents/radar.vue'
import Polar from './components/chartComponents/polar.vue'
import Sunburst from './components/chartComponents/sunburst.vue'
import { reactive, shallowRef, ref } from 'vue'
const chartComponentsList = reactive([
	{
		name: 'line',
		component: shallowRef(Line),
	},
	{
		name: 'bar',
		component: shallowRef(Bar),
	},
	{
		name: 'pie',
		component: shallowRef(Pie),
	},
	{
		name: 'gauge',
		component: shallowRef(Gauge),
	},
	{
		name: 'radar',
		component: shallowRef(Radar),
	},
	{
		name: 'polar',
		component: shallowRef(Polar),
	},
	{
		name: 'sunburst',
		component: shallowRef(Sunburst),
	},
])
const currComName = ref('line')
</script>

<template>
  <div class="auto-echarts-page">
    <div class="desc">
      AutoEchart - 二次封装，自适应文字大小，自定义样式配置，适用于大屏项目。
    </div>
    <div class="btn-area">
      <div
        class="components-name"
        :class="{ active: currComName === item.name }"
        v-for="item in chartComponentsList"
        :key="item.name"
        @click="currComName = item.name"
      >
        {{ item.name }}
      </div>
    </div>
    <component
      :is="chartComponentsList.find((com) => com.name === currComName)?.component"
    ></component>
  </div>
</template>

<style scoped>
.components-name {
	padding: 5px 10px;
	cursor: pointer;
	margin: 10px;
	background: lightseagreen;
	border-radius: 10px;
	display: inline-block;
}
.active {
	background: lightsalmon;
}



</style>
<style>
.chart-box{
	display: flex;
    flex-wrap: wrap;
	gap: 10px;
}
.chart {
	width: 30vw;
	height: 30vh;
  border: 1px solid lightseagreen;
	/* background: lightseagreen; */
}
#app{
	display: flex;
    flex-direction: column;
}
html,
body {
	background: #001529 !important;
  color: #eae8e8;
}
</style>
