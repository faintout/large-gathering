const rateBg = new URL(`@/views/autoEcharts/images/rate-bg.png`,import.meta.url)?.pathname

export default class ImageGauge {
  constructor(data = []) {
    this.data = data;
    return this.getChartConfig()
  }
  getChartConfig() {
    return {
      legend: {
        show: false,
        right: "5%",
        top: "5%",
        itemWidth: 'w(36)',
        itemHeight: 'w(36)',
        itemGap: 'w(72)',
        icon: 'rect',
        textStyle: {
          color: "#fff",
          fontSize: 'w(36)',
          padding: [0, 0, 0, 'w(9)']
        },
        itemStyle: {
            // borderColor: 'rgba(255,255,255,0.4800)',
            // borderWidth: 1
        }
      },
      graphic: {
        type: 'image',
        style: {
          image: rateBg,
          x: 0,
          y: 0,
          width: 'w(300)',
          height: 'w(300)',
          originX: 'w(249)',
          originY: 'w(249)'
        }
      },
      // dataZoom: {
      //     zoomLock: true,
      //     moveOnMouseWheel: false,
      //     moveOnMouseMove: false,
      //     start: 0, //默认为0
      //     end: 75,
      //     type: "slider",
      //     show: true,
      //     brushSelect: false,
      //     xAxisIndex: [0],
      //     handleSize: 0, //滑动条的 左右2个滑动条的大小
      //     height: 7, //组件高度
      //     left: 20, //左边的距离
      //     right: 20, //右边的距离
      //     bottom: 5, //底部的距离
      //     backgroundColor: "rgba(56, 68, 115, 0.6)",
      //     borderColor: "rgba(56, 68, 115, 0.6)",
      //     realtime: true,
      //     showDataShadow: false, //是否显示数据阴影 默认auto
      //     showDetail: false, //即拖拽时候是否显示详细数值信息 默认true
      //     filterMode: "filter",
      //     fillerColor: "#54678B",
      // },

      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(130,174,255,0.2)",
        borderWidth: 0,
        className: "tooltip-back-bar",
        textStyle: {
          color: " #E8F3FF",
          fontSize: 'w(36)',
          fontFamily: 'Source Han Sans CN-Bold, Source Han Sans CN',
          fontWeight:'bold'
        },
      },
      // tooltip: {
      //     //悬浮框
      //     trigger: "axis",
      //     backgroundColor: "rgba(43, 62, 122, 0.5)",
      //     className: "tooltip-back-bar",
      //     borderWidth: 0,
      //     textStyle: {
      //         color: "#BBEBFF",
      //         fontSize: (38 * document.body.clientWidth) / 7680,
      //     },
      // },
      grid: {
        bottom: '20%',
        left: '10%',
        top: '20%',
        right: '3%'
      },
      color: ["#3279DF", "#D57A5C"],
      xAxis: {
        data: [],
        interval: 0,
        offset: 'w(5)',
        axisLine: {
          lineStyle: {
            color: "rgba(97, 124, 219, 0.28)",
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#BBEBFF",
          fontSize: 'w(36)',
          // padding: [0, 0, 0, 0],
          rotate: 0,
        },
      },
      yAxis: {
        offset: 'w(5)',
        name: "",
        // minInterval: 1,
        nameTextStyle: {
          // padding: [0, 0],
          color: '#D1FAFF',
          fontSize: 'w(36)',
          padding: [0, 0, 0, 'w(-28)']
        },
        axisLabel: {
          // verticalAlign: "bottom",
          // padding: [0, -10],
          formatter: (value) => {
            return value;
          },
          align: "right",
          color: "#D1FAFF",
          fontSize: 'w(36)',
        },
        axisLine: {
          lineStyle: {
              color: "#D1FAFF ",
              opacity: 0.3,
          },
        },
        splitLine: {
          lineStyle: {
            color: ["rgba(126, 126, 126, 1)"],
            type: "dashed",
          },
        },
        // axisTick: {
        //     show: true,
        //     length :30,
        //     lineStyle:{
        //         color: "#465899",
        //     }
        // },
      },
      series: [{
        type: "gauge",
        // symbolSize: screenComputed(15),
        // lineStyle: {
        //   width: screenComputed(6),
        // },
        data:this.data,
        center: ['50%', '42%'],
        radius: '64%',
        // startAngle: 80,   
        // endAngle: 0,
        // clockwise: false,
        // max: 0,
        detail: {
          show:false,
        },
        title: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        pointer: {
          show: false
        },
        axisLine: {
          show:false,
          // lineStyle: {
          //   color: [[1, 'rgba(217, 217, 217, 0.3)']],
            // width: (7 * document.body.clientHeight) / 996
          // },
        },
        progress: {
          show: true,
          width: 'w(20)',
          itemStyle: {
            color: {
              x: 1,
              y: 1,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 1,
                color: '#52DBFB', // 0% 处的颜色
              },
                {
                  offset: 0.75,
                  color: '#448BFF', // 100% 处的颜色
                },
                {
                  offset: 0.5,
                  color: '#FFA88D', // 100% 处的颜色
                },
                {
                  offset: 0.25,
                  color: '#F3B20B', // 100% 处的颜色
                },
                {
                  offset: 0,
                  color: '#F3410A', // 100% 处的颜色
                },
              ],
              globalCoord: false, // 缺省为 false
            },
          }
        },
      }],
  }
  }
}