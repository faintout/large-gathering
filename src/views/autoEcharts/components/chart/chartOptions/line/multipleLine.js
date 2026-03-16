export default class MultipleLine {
    constructor(data = {}) {
      this.data = data;
      this.yAxisName = data.yAxisName|| '辆';
      this.dataZoomShow = data.dataZoomShow??= this.data.xaxis.length > 18;
      this.color = data.color;
      return this.getChartConfig()
    }
  
    getSeriesData() {
      const series = this.data.data
      return series.map(data => ({
        ...data,
        type: 'line',
        yAxisIndex: 0,
        symbolSize: 'w(7)',
        smooth: true,
        label: {
          show: false,
        },
        symbol: 'emptyCircle',
      }));
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
        legend: {
          show: true,
          right: '0%',
          top: '0%',
          itemWidth: 'w(12)',
          itemHeight: 'w(8)',
          itemGap: 'w(16)',
          textStyle: {
            color: '#A5ADBA',
            fontSize: 'w(12)',
            padding: [0, 0, 0, 'w(8)'],
          },
          itemStyle: {
            // borderColor: 'rgba(255,255,255,0.4800)',
            // borderWidth: 1
          },
          inactiveColor: 'rgba(165, 173, 186, .6)',
        },
        color: this.color,
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
          top: '12%',
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
        yAxis: {
          offset: 'w(4)',
          name: this.yAxisName,
          nameTextStyle: {
            color: 'rgba(224,224,224,0.5)',
            fontSize: 'w(14)',
            padding: [0, 0, 'h(5)', 'w(-37)'],
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
        },
        dataZoom: this.getDataZoom(),
        series: this.getSeriesData(),
      };
    }
  }

  