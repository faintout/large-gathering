<template>
   <div class="chart-box">
      <div class="chart">
         <GeneralChart :option="sunburstChart" @click="chartClick" @mouseover="chartMouseover"
            @mouseout="highLightLegendName = null"></GeneralChart>
         <div class="chart-legend">
            <ElScrollbar height="100%" ref="legendListRef">
               <div class="list">
                  <div v-for="(legend, index) in sunburstLegendList" :key="legend.name" class="legend-item"
                     :class="{ 'high-light-row': legend.name === highLightLegendName }">
                     <div class="icon" v-show="!/[a-zA-Z]/.test(legend.name)"
                        :style="{ 'backgroundColor': colorList[index] }"></div>
                     <div class="name" :style="{ 'width': /[a-zA-Z]/.test(legend.name) ? 90 : 40 + 'px' }">{{ legend.name
                     }}</div>
                     <div class="rate">{{ legend.rate }}</div>
                     <div class="value">{{ legend.value }}辆</div>
                  </div>
               </div>

            </ElScrollbar>
         </div>
      </div>
   </div>
</template>

<script setup>
import { colorList } from '@/views/autoEcharts/utils/toolUtils';
import { computed, reactive, ref } from 'vue'
import { ElScrollbar } from 'element-plus';
import GeneralChart from '@/views/autoEcharts/components/chart/generalChart.vue'
import SunburstBase from '@/views/autoEcharts/components/chart/chartOptions/sunburst/base'
const sunburstChart = ref(null)
const legendListRef = ref(null)
//图表数据
const sunburstData = [
   {
      "name": "粤",
      "value": "1601",
      "rate": "90.50%",
      "subPieData": [
         {
            "name": "粤A(广州)",
            "value": "926",
            "rate": "57.84%",
            "subPieData": null
         },
         {
            "name": "粤L(惠州)",
            "value": "107",
            "rate": "6.68%",
            "subPieData": null
         },
         {
            "name": "粤E(佛山)",
            "value": "93",
            "rate": "5.81%",
            "subPieData": null
         },
         {
            "name": "粤B(深圳)",
            "value": "67",
            "rate": "4.18%",
            "subPieData": null
         },
         {
            "name": "粤D(汕头)",
            "value": "51",
            "rate": "3.19%",
            "subPieData": null
         },
         {
            "name": "粤T(中山)",
            "value": "49",
            "rate": "3.06%",
            "subPieData": null
         },
         {
            "name": "粤G(湛江)",
            "value": "34",
            "rate": "2.12%",
            "subPieData": null
         },
         {
            "name": "粤S(东莞)",
            "value": "33",
            "rate": "2.06%",
            "subPieData": null
         },
         {
            "name": "粤R(清远)",
            "value": "29",
            "rate": "1.81%",
            "subPieData": null
         },
         {
            "name": "粤J(江门)",
            "value": "29",
            "rate": "1.81%",
            "subPieData": null
         },
         {
            "name": "粤F(韶关)",
            "value": "28",
            "rate": "1.75%",
            "subPieData": null
         },
         {
            "name": "粤H(肇庆)",
            "value": "20",
            "rate": "1.25%",
            "subPieData": null
         },
         {
            "name": "粤M(梅州)",
            "value": "19",
            "rate": "1.19%",
            "subPieData": null
         },
         {
            "name": "粤Q(阳江)",
            "value": "18",
            "rate": "1.12%",
            "subPieData": null
         },
         {
            "name": "粤P(河源)",
            "value": "17",
            "rate": "1.06%",
            "subPieData": null
         },
         {
            "name": "粤W(云浮)",
            "value": "15",
            "rate": "0.94%",
            "subPieData": null
         },
         {
            "name": "粤C(珠海)",
            "value": "14",
            "rate": "0.87%",
            "subPieData": null
         },
         {
            "name": "粤N(汕尾)",
            "value": "14",
            "rate": "0.87%",
            "subPieData": null
         },
         {
            "name": "粤K(茂名)",
            "value": "13",
            "rate": "0.81%",
            "subPieData": null
         },
         {
            "name": "粤V(揭阳)",
            "value": "7",
            "rate": "0.44%",
            "subPieData": null
         },
         {
            "name": "粤Y",
            "value": "6",
            "rate": "0.37%",
            "subPieData": null
         },
         {
            "name": "粤U(潮州)",
            "value": "5",
            "rate": "0.31%",
            "subPieData": null
         },
         {
            "name": "粤X",
            "value": "4",
            "rate": "0.25%",
            "subPieData": null
         },
         {
            "name": "粤Z(广东)",
            "value": "3",
            "rate": "0.19%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "湘",
      "value": "30",
      "rate": "1.70%",
      "subPieData": [
         {
            "name": "湘A(长沙)",
            "value": "6",
            "rate": "20.00%",
            "subPieData": null
         },
         {
            "name": "湘J(常德)",
            "value": "5",
            "rate": "16.67%",
            "subPieData": null
         },
         {
            "name": "湘F(岳阳)",
            "value": "4",
            "rate": "13.33%",
            "subPieData": null
         },
         {
            "name": "湘M(永州)",
            "value": "4",
            "rate": "13.33%",
            "subPieData": null
         },
         {
            "name": "湘K(娄底)",
            "value": "3",
            "rate": "10.00%",
            "subPieData": null
         },
         {
            "name": "湘D(衡阳)",
            "value": "3",
            "rate": "10.00%",
            "subPieData": null
         },
         {
            "name": "湘L(郴州)",
            "value": "2",
            "rate": "6.67%",
            "subPieData": null
         },
         {
            "name": "湘H(益阳)",
            "value": "1",
            "rate": "3.33%",
            "subPieData": null
         },
         {
            "name": "湘C(湘潭)",
            "value": "1",
            "rate": "3.33%",
            "subPieData": null
         },
         {
            "name": "湘B(株洲)",
            "value": "1",
            "rate": "3.33%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "鲁",
      "value": "26",
      "rate": "1.47%",
      "subPieData": [
         {
            "name": "鲁A(济南)",
            "value": "17",
            "rate": "65.38%",
            "subPieData": null
         },
         {
            "name": "鲁U",
            "value": "3",
            "rate": "11.54%",
            "subPieData": null
         },
         {
            "name": "鲁R(菏泽)",
            "value": "2",
            "rate": "7.69%",
            "subPieData": null
         },
         {
            "name": "鲁G(潍坊)",
            "value": "1",
            "rate": "3.85%",
            "subPieData": null
         },
         {
            "name": "鲁H(济宁)",
            "value": "1",
            "rate": "3.85%",
            "subPieData": null
         },
         {
            "name": "鲁J(泰安)",
            "value": "1",
            "rate": "3.85%",
            "subPieData": null
         },
         {
            "name": "鲁L(日照)",
            "value": "1",
            "rate": "3.85%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "赣",
      "value": "18",
      "rate": "1.02%",
      "subPieData": [
         {
            "name": "赣A(南昌)",
            "value": "7",
            "rate": "38.89%",
            "subPieData": null
         },
         {
            "name": "赣B(赣州)",
            "value": "4",
            "rate": "22.22%",
            "subPieData": null
         },
         {
            "name": "赣G(九江)",
            "value": "3",
            "rate": "16.67%",
            "subPieData": null
         },
         {
            "name": "赣E(上饶)",
            "value": "2",
            "rate": "11.11%",
            "subPieData": null
         },
         {
            "name": "赣K(新余)",
            "value": "1",
            "rate": "5.56%",
            "subPieData": null
         },
         {
            "name": "赣H(景德镇)",
            "value": "1",
            "rate": "5.56%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "鄂",
      "value": "16",
      "rate": "0.90%",
      "subPieData": [
         {
            "name": "鄂A(武汉)",
            "value": "8",
            "rate": "50.00%",
            "subPieData": null
         },
         {
            "name": "鄂B(黄石)",
            "value": "2",
            "rate": "12.50%",
            "subPieData": null
         },
         {
            "name": "鄂D(荆州)",
            "value": "1",
            "rate": "6.25%",
            "subPieData": null
         },
         {
            "name": "鄂L(咸宁)",
            "value": "1",
            "rate": "6.25%",
            "subPieData": null
         },
         {
            "name": "鄂C(十堰)",
            "value": "1",
            "rate": "6.25%",
            "subPieData": null
         },
         {
            "name": "鄂J(黄冈)",
            "value": "1",
            "rate": "6.25%",
            "subPieData": null
         },
         {
            "name": "鄂F(襄阳)",
            "value": "1",
            "rate": "6.25%",
            "subPieData": null
         },
         {
            "name": "鄂E(宜昌)",
            "value": "1",
            "rate": "6.25%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "桂",
      "value": "16",
      "rate": "0.90%",
      "subPieData": [
         {
            "name": "桂K(玉林)",
            "value": "4",
            "rate": "25.00%",
            "subPieData": null
         },
         {
            "name": "桂A(南宁)",
            "value": "3",
            "rate": "18.75%",
            "subPieData": null
         },
         {
            "name": "桂B(柳州)",
            "value": "2",
            "rate": "12.50%",
            "subPieData": null
         },
         {
            "name": "桂C(桂林)",
            "value": "2",
            "rate": "12.50%",
            "subPieData": null
         },
         {
            "name": "桂J(贺州)",
            "value": "2",
            "rate": "12.50%",
            "subPieData": null
         },
         {
            "name": "桂R(贵港)",
            "value": "2",
            "rate": "12.50%",
            "subPieData": null
         },
         {
            "name": "桂D(梧州)",
            "value": "1",
            "rate": "6.25%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "闽",
      "value": "12",
      "rate": "0.68%",
      "subPieData": [
         {
            "name": "闽A(福州)",
            "value": "3",
            "rate": "25.00%",
            "subPieData": null
         },
         {
            "name": "闽F(龙岩)",
            "value": "3",
            "rate": "25.00%",
            "subPieData": null
         },
         {
            "name": "闽D(厦门)",
            "value": "2",
            "rate": "16.67%",
            "subPieData": null
         },
         {
            "name": "闽C(泉州)",
            "value": "2",
            "rate": "16.67%",
            "subPieData": null
         },
         {
            "name": "闽J(宁德)",
            "value": "1",
            "rate": "8.33%",
            "subPieData": null
         },
         {
            "name": "闽G(三明)",
            "value": "1",
            "rate": "8.33%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "豫",
      "value": "9",
      "rate": "0.51%",
      "subPieData": [
         {
            "name": "豫P(周口)",
            "value": "2",
            "rate": "22.22%",
            "subPieData": null
         },
         {
            "name": "豫R(南阳)",
            "value": "1",
            "rate": "11.11%",
            "subPieData": null
         },
         {
            "name": "豫Q(驻马店)",
            "value": "1",
            "rate": "11.11%",
            "subPieData": null
         },
         {
            "name": "豫L(漯河)",
            "value": "1",
            "rate": "11.11%",
            "subPieData": null
         },
         {
            "name": "豫J(濮阳)",
            "value": "1",
            "rate": "11.11%",
            "subPieData": null
         },
         {
            "name": "豫D(平顶山)",
            "value": "1",
            "rate": "11.11%",
            "subPieData": null
         },
         {
            "name": "豫C(洛阳)",
            "value": "1",
            "rate": "11.11%",
            "subPieData": null
         },
         {
            "name": "豫B(开封)",
            "value": "1",
            "rate": "11.11%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "苏",
      "value": "7",
      "rate": "0.40%",
      "subPieData": [
         {
            "name": "苏F(南通)",
            "value": "3",
            "rate": "42.86%",
            "subPieData": null
         },
         {
            "name": "苏A(南京)",
            "value": "2",
            "rate": "28.57%",
            "subPieData": null
         },
         {
            "name": "苏E(苏州)",
            "value": "2",
            "rate": "28.57%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "浙",
      "value": "6",
      "rate": "0.34%",
      "subPieData": [
         {
            "name": "浙B(宁波)",
            "value": "2",
            "rate": "33.33%",
            "subPieData": null
         },
         {
            "name": "浙A(杭州)",
            "value": "2",
            "rate": "33.33%",
            "subPieData": null
         },
         {
            "name": "浙G(金华)",
            "value": "1",
            "rate": "16.67%",
            "subPieData": null
         },
         {
            "name": "浙D(绍兴)",
            "value": "1",
            "rate": "16.67%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "皖",
      "value": "5",
      "rate": "0.28%",
      "subPieData": [
         {
            "name": "皖A(合肥)",
            "value": "4",
            "rate": "80.00%",
            "subPieData": null
         },
         {
            "name": "皖K(阜阳)",
            "value": "1",
            "rate": "20.00%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "沪",
      "value": "5",
      "rate": "0.28%",
      "subPieData": [
         {
            "name": "沪C",
            "value": "2",
            "rate": "40.00%",
            "subPieData": null
         },
         {
            "name": "沪A(上海)",
            "value": "1",
            "rate": "20.00%",
            "subPieData": null
         },
         {
            "name": "沪D",
            "value": "1",
            "rate": "20.00%",
            "subPieData": null
         },
         {
            "name": "沪L",
            "value": "1",
            "rate": "20.00%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "川",
      "value": "5",
      "rate": "0.28%",
      "subPieData": [
         {
            "name": "川M(资阳)",
            "value": "1",
            "rate": "20.00%",
            "subPieData": null
         },
         {
            "name": "川S(达州)",
            "value": "1",
            "rate": "20.00%",
            "subPieData": null
         },
         {
            "name": "川C(自贡)",
            "value": "1",
            "rate": "20.00%",
            "subPieData": null
         },
         {
            "name": "川J(遂宁)",
            "value": "1",
            "rate": "20.00%",
            "subPieData": null
         },
         {
            "name": "川R(南充)",
            "value": "1",
            "rate": "20.00%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "贵",
      "value": "4",
      "rate": "0.23%",
      "subPieData": [
         {
            "name": "贵F(毕节)",
            "value": "2",
            "rate": "50.00%",
            "subPieData": null
         },
         {
            "name": "贵C(遵义)",
            "value": "1",
            "rate": "25.00%",
            "subPieData": null
         },
         {
            "name": "贵B(六盘水)",
            "value": "1",
            "rate": "25.00%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "渝",
      "value": "3",
      "rate": "0.17%",
      "subPieData": [
         {
            "name": "渝A(重庆)",
            "value": "2",
            "rate": "66.67%",
            "subPieData": null
         },
         {
            "name": "渝B",
            "value": "1",
            "rate": "33.33%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "陕",
      "value": "2",
      "rate": "0.11%",
      "subPieData": [
         {
            "name": "陕A(西安)",
            "value": "1",
            "rate": "50.00%",
            "subPieData": null
         },
         {
            "name": "陕G(安康)",
            "value": "1",
            "rate": "50.00%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "琼",
      "value": "1",
      "rate": "0.06%",
      "subPieData": [
         {
            "name": "琼A(海口)",
            "value": "1",
            "rate": "100.00%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "津",
      "value": "1",
      "rate": "0.06%",
      "subPieData": [
         {
            "name": "津A(天津)",
            "value": "1",
            "rate": "100.00%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "晋",
      "value": "1",
      "rate": "0.06%",
      "subPieData": [
         {
            "name": "晋L(临汾)",
            "value": "1",
            "rate": "100.00%",
            "subPieData": null
         }
      ]
   },
   {
      "name": "京",
      "value": "1",
      "rate": "0.06%",
      "subPieData": [
         {
            "name": "京A(北京)",
            "value": "1",
            "rate": "100.00%",
            "subPieData": null
         }
      ]
   }
]
//图例高亮颜色
const highLightLegendName = ref(null)
const sunburstLegendList = ref(sunburstData)
sunburstChart.value = new SunburstBase(sunburstData)

const chartMouseover = (params) => {
   highLightLegendName.value = params.name
   let index = sunburstLegendList.value.findIndex(item => item.name === params.name)
   if (index !== -1) {
      legendListRef.value.wrapRef.scrollTo({ top: index * 36, behavior: 'smooth' })
   }
}

const chartClick = params => {
   const { data: { children } } = params
   if (!children?.length) { return }
   sunburstLegendList.value = children
}
</script>
<style scoped >
.chart {
   position: relative;
}

.chart-legend {
   width: 45%;
   height: 80%;
   position: absolute;
   top: 50%;
   left: 53%;
   transform: translate(0, -50%);
}

.chart-legend .list {
   display: flex;
   flex-direction: column;
   gap: 16px;
}

.chart-legend .list .high-light-row>div {
   color: #f8f8f8 !important;
}

.chart-legend .list .legend-item {
   display: flex;
   align-items: center;
   height: 20px;
}

.chart-legend .list .legend-item .icon {
   width: 10px;
   height: 10px;
   background: #3686FF;
   border-radius: 2px 2px 2px 2px;
   opacity: 1;
   margin-right: 8px;
}

.chart-legend .list .legend-item .name {
   font-size: 14px;
   font-family: PingFang SC, PingFang SC;
   font-weight: 400;
   color: #C3CED5;
}

.chart-legend .list .legend-item .rate {
   font-size: 14px;
   font-family: PingFang SC, PingFang SC;
   font-weight: 400;
   color: #C3CED5;
   width: 70px;
}

.chart-legend .list .legend-item .value {
   font-size: 14px;
   font-family: PingFang SC, PingFang SC;
   font-weight: 400;
   color: #C3CED5;
}
</style>