export default class ColumnBase {
    constructor(data = {}) {
      this.data = data;
      this.yAxisName = data.yAxisName|| '辆';
      this.dataZoomShow = data.dataZoomShow??= this.data.xaxis.length > 18;
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
      //长度大于18设置对应的值
      if (this.dataZoomShow) {
        dataZoom.endValue = 10;
      }
  
      return dataZoom;
    }
  
    getChartConfig() {
      return {
        color: [
          {
            colorStops: [
              { offset: 0, color: '#52B0FFFF' },
              { offset: 1, color: '#2275F0FF' },
            ],
            x: 0,
            y: 0,
            x2: 1,
            y2: 1,
            type: 'linear',
            global: false,
          },
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(130,174,255,0.2)',
          borderWidth: 0,
          className: 'tooltip-back-bar',
          textStyle: {
            color: ' #E8F3FF',
            align: 'left',
            fontSize: 'w(12)',
          },
          axisPointer: {
            type: 'shadow',
            lineStyle: {
              type: 'solid',
              color: 'rgba(54, 134, 255, 1)',
            },
            shadowStyle: {
              opacity: 0.5,
              color: {
                colorStops: [
                  { offset: 0, color: '#213B73FF' },
                  { offset: 1, color: '#213B7333' },
                ],
                x: 0,
                y: 0,
                x2: 1,
                y2: 1,
                type: 'linear',
                global: false,
              },
            },
          },
        },
        grid: {
          left: 'w(45)',
          top: '12%',
          right: '0',
          bottom: this.dataZoomShow ? '11%' : '8%',
        },
        yAxis: {
          offset: 'w(5)',
          type: 'value',
          splitLine: {
            lineStyle: {
              color: '#26427EFF',
              type: 'dashed',
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            align: 'left',
            color: '#6B85BCFF',
            fontSize: 'w(12)',
            fontFamily: 'PingFang SC-Regular',
            padding: [0, 'w(-30)'],
          },
          nameTextStyle: {
            color: 'rgba(224,224,224,0.5)',
            fontSize: 'w(14)',
            padding: [0, 0, 0, 'w(-37)'],
            align: 'left',
          },
          name: this.yAxisName ,
        },
        xAxis: {
          offset: 'w(0)',
          show: true,
          type: 'category',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#26427EFF',
              type: 'dashed',
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#6B85BCFF',
            fontSize: 'w(12)',
            fontFamily: 'PingFang SC-Regular',
          },
          data: this.data.xaxis,
        },
        dataZoom: this.getDataZoom(),
        series: [
          {
            data: this.data.data?.[0]?.data,
            name: '',
            barGap: '50%',
            itemStyle: {
              borderRadius: 0,
            },
            type: 'bar',
            barWidth: 'w(16)',
          },
        ],
      };
    }
  }