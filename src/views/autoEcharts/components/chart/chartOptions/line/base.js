export default class LineBase {
    constructor(data = {}) {
      this.data = data;
      this.yAxisName = data.yAxisName|| '辆';
      this.dataZoomShow = data.dataZoomShow??= this.data.xaxis.length > 18;
      this.defaultColor = {
        areaStyle: [
          'rgba(56, 122, 236, 1)',
          'rgba(80, 173, 251, 0)',
        ],
        itemStyleColor: '#397CED',
        lineStyle: [
          '#387AEC',
          '#50ADFB',
        ],
      };
      this.color = data.color||this.defaultColor;
      return this.getChartConfig()
    }
  
    getDataZoom() {
      const dataZoom = {
        show: this.dataZoomShow,
        handleSize: 0,
        height: 'w(8)',
        type: 'slider',
        zoomLock: true,
        brushSelect: false,
        filterMode: 'filter',
        fillerColor: 'rgba(144, 147, 153, .3)',
        backgroundColor: 'rgba(56, 68, 115, 0.6)',
        borderColor: 'rgba(56, 68, 115, 0.6)',
        realtime: true,
        left: 0,
        bottom: 0,
        width: '100%',
        showDataShadow: false,
        showDetail: false,
        startValue: 0,
        moveOnMouseWheel: false,
        moveOnMouseMove: false,
        rangeMode: ['value', 'value'],
        xAxisIndex: [0],
      };
  
      if (this.dataZoomShow) {
        dataZoom.endValue = 10;
      }
  
      return dataZoom;
    }
  
    getChartConfig() {
      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(130,174,255,0.2)',
          borderWidth: 0,
          className: 'tooltip-back-bar',
          textStyle: {
            color: ' #E8F3FF',
            fontSize: 'w(12)',
            fontFamily: 'Source Han Sans CN-Bold, Source Han Sans CN',
            fontWeight: 'bold',
          },
          axisPointer: {
            lineStyle: {
              type: 'solid',
              color: 'rgba(54, 134, 255, 1)',
            },
          },
        },
        grid: {
          left: 'w(45)',
          top: '10%',
          right: '0',
          bottom: this.dataZoomShow ? '11%' : '8%',
        },
        xAxis: {
          data: this.data?.xaxis || [],
          offset: 'w(4)',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#6B85BCFF',
            fontSize: 'w(12)',
            rotate: 0,
            fontFamily: 'PingFang SC-Regular',
          },
        },
        yAxis: [{
          offset: 'w(4)',
          name: this.yAxisName,
          nameTextStyle: {
            color: 'rgba(224,224,224,0.5)',
            fontSize: 'w(14)',
            padding: [0, 0, 0, 'w(-37)'],
            align: 'left',
          },
          axisLabel: {
            align: 'left',
            color: '#6B85BCFF',
            fontSize: 'w(12)',
            fontFamily: 'PingFang SC-Regular',
            padding: [0, 'w(-30)'],
          },
          axisLine: {
            lineStyle: {
              color: 'red ',
              opacity: 0.3,
            },
          },
          splitLine: {
            lineStyle: {
              color: '#26427EFF',
              type: 'dashed',
            },
          },
          scale: true,
        },{
          axisLine: {
              show: true,
              lineStyle: {
                  width: 'w(7)',
                  type: "solid",
                  cap: "square",
                  color: {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [{
                          offset: 0,
                          color: '#e4646d'
                      }, {
                          offset: .25,
                          color: '#e47e55'
                      }, {
                          offset: .5,
                          color: '#e3c758'
                      }, {
                          offset: .75,
                          color: '#70e5a2'
                      }, {
                          offset: 1,
                          color: '#28e3e7'
                      }],
                      global: false // 缺省为 false
                  }
              }
          },
          z: 1
      }],
        dataZoom: this.getDataZoom(),
        series: [
          {
            type: 'line',
            name: '',
            data: this.data?.data?.[0]?.data || [],
            yAxisIndex: 0,
            symbolSize: 'w(7)',
            smooth: true,
            areaStyle: {
              opacity: 0.2,
              color: {
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: this.color.areaStyle?.[0],
                  },
                  {
                    offset: 1,
                    color: this.color.areaStyle?.[1] || this.color.areaStyle?.[0],
                  },
                ],
                globalCoord: false,
              },
            },
            itemStyle: {
              show: true,
              color: this.color.itemStyleColor,
              borderWidth: 'w(1)',
              borderColor: '#223C75',
            },
            lineStyle: {
              width: 'w(2)',
              color: {
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: this.color.lineStyle?.[0],
                  },
                  {
                    offset: 1,
                    color: this.color.lineStyle?.[1] || this.color.areaStyle?.[0],
                  },
                ],
                globalCoord: false,
              },
            },
            label: {
              show: false,
            },
            symbol: 'emptyCircle',
          },
        ],
      };
    }
  }

  