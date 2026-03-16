import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

import './style/global.scss'
import './style/elplus.scss'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)

// Highcharts
// import Highcharts from 'highcharts/highstock';
// import HighchartsMore from 'highcharts/highcharts-more';
// console.log('HighchartsMore',HighchartsMore)
// HighchartsMore(Highcharts)
import Highcharts from 'highcharts/highstock'
import 'highcharts/highcharts-more'   // 只需要这样“引入一次”

/**
 * echarts
 */
import echarts from 'vue-echarts'
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { BarChart, PieChart, PictorialBarChart, LineChart,GaugeChart ,RadarChart,SunburstChart} from 'echarts/charts'
import {GridComponent, TooltipComponent, TitleComponent, LegendComponent, DataZoomComponent, ToolboxComponent,GraphicComponent } from 'echarts/components'
use([
    SunburstChart,
    CanvasRenderer,
    BarChart,
    RadarChart,
    PieChart,
    PictorialBarChart,
    LineChart,
    GaugeChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    DataZoomComponent,
    ToolboxComponent,
    GraphicComponent
])

app.component('v-echarts', echarts);
app.mount('#app')
