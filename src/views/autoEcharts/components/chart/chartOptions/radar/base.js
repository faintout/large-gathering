export default class RadarBase {
    constructor(data) {
      this.data = data;
      return  this.getChartConfig()
    }
  
    getChartConfig() {
      return {
        color: [
          'rgba(54, 134, 255, 1)',
          'rgba(83, 240, 146, 1)',
          'rgba(238, 111, 124, 1)',
          'rgba(95, 213, 236, 1)',
        ],
        title: {
          text: '',
        },
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
        legend: {
          selectedMode: true,
          type: 'scroll',
          itemWidth: 'w(10)',
          itemHeight: 'w(10)',
          borderRadius: 'w(2)',
          icon: 'roundRect',
          y: 'center',
          left: '70%',
          height: this.data?.length >= 9 ? '90%' : '100%',
          width: '100%',
          orient: 'vertical',
          align: 'auto',
          itemGap: 'h(21)',
          textStyle: {
            fontSize: 'w(19)',
            color: '#C3CED5',
            fontFamily: 'font-family: Source Han Sans CN-Regular, Source Han Sans CN',
            rich: {
              name: {
                verticalAlign: 'right',
                align: 'left',
                width: 'w(80)',
                height: 'h(20)',
                fontSize: 'w(14)',
                color: '#C3CED5',
              },
            },
          },
          pageTextStyle: {
            color: '#C3CED5',
          },
          pageButtonItemGap: 'w(20)',
          pageButtonGap: 'w(10)',
          pageButtonPosition: 'end',
          pageIcons: {
            vertical: [
              'image://data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IiYjMjI4OyYjMTg0OyYjMTM5OyYjMjMwOyYjMTM5OyYjMTM3OyYjMjI5OyYjMTc3OyYjMTQ5OyYjMjI5OyYjMTg4OyYjMTI4OyYjMjI5OyYjMTY0OyYjMTM1OyYjMjI4OyYjMTg3OyYjMTg5OyA1Ij4KPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTgwIDE2IDE2KSIgc3Ryb2tlPSIjMjY0MjdFIiBzdHJva2UtbWl0ZXJsaW1pdD0iMCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIvPgo8ZyBpZD0iaWNvbi0mIzIyODsmIzE4NDsmIzEzOTsmIzIzMDsmIzEzOTsmIzEzNzsmIzIyOTsmIzE3NzsmIzE0OTsmIzIyOTsmIzE4ODsmIzEyODsiPgo8cmVjdCBpZD0iJiMyMzE7JiMxNTk7JiMxNjk7JiMyMjk7JiMxODk7JiMxNjI7IiBvcGFjaXR5PSIwLjAxIiB4PSIxNiIgeT0iMTYiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdHJhbnNmb3JtPSJyb3RhdGUoLTE4MCAxNiAxNikiIGZpbGw9IiM3NTdEOEIiLz4KPHBhdGggaWQ9IiYjMjMyOyYjMTgzOyYjMTc1OyYjMjI5OyYjMTkwOyYjMTMyOyIgZD0iTTExLjA1NjcgMTAuNTI2NEw4IDcuNDY5N0w0Ljk0MzMzIDEwLjUyNjRMNCA5LjU4MzAzTDggNS41ODMwM0wxMiA5LjU4MzAzTDExLjA1NjcgMTAuNTI2NFoiIGZpbGw9IiNBNUJCRkEiLz4KPC9nPgo8L2c+CjwvZz4KPC9nPgo8L3N2Zz4=',
              'image://data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IiYjMjI4OyYjMTg2OyYjMTY0OyYjMjI4OyYjMTg3OyYjMTUyOyYjMjMyOyYjMTc1OyYjMTgwOyYjMjMwOyYjMTUyOyYjMTQyOyI+CjxnIGlkPSJpY29uLSYjMjI4OyYjMTg0OyYjMTM5OyYjMjMwOyYjMTM5OyYjMTM3OyYjMjI5OyYjMTc3OyYjMTQ5OyYjMjI5OyYjMTg4OyYjMTI4OyYjMjI5OyYjMTY0OyYjMTM1OyYjMjI4OyYjMTg3OyYjMTg5OyA0Ij4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgc3Ryb2tlPSIjMjY0MjdFIiBzdHJva2UtbWl0ZXJsaW1pdD0iMCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIvPgo8ZyBpZD0iaWNvbi0mIzIyODsmIzE4NDsmIzEzOTsmIzIzMDsmIzEzOTsmIzEzNzsmIzIyOTsmIzE3NzsmIzE0OTsmIzIyOTsmIzE4ODsmIzEyODsiPgo8cmVjdCBpZD0iJiMyMzE7JiMxNTk7JiMxNjk7JiMyMjk7JiMxODk7JiMxNjI7IiBvcGFjaXR5PSIwLjAxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiM3NTdEOEIiLz4KPHBhdGggaWQ9IiYjMjMyOyYjMTgzOyYjMTc1OyYjMjI5OyYjMTkwOyYjMTMyOyIgZD0iTTQuOTQzMzMgNS40NzM2M0w4IDguNTMwM0wxMS4wNTY3IDUuNDczNjNMMTIgNi40MTY5N0w4IDEwLjQxN0w0IDYuNDE2OTdMNC45NDMzMyA1LjQ3MzYzWiIgZmlsbD0iI0E1QkJGQSIvPgo8L2c+CjwvZz4KPC9nPgo8L3N2Zz4=',
            ],
          },
          formatter: function (name) {
            return '{name| ' + name + '}';
          },
        },
        radar: [
          {
            indicator: [
              { text: '20-24' },
              { text: '16-20' },
              { text: '12-16' },
              { text: '8-12' },
              { text: '4-8' },
              { text: '0-4' },
            ],
            center: ['30%', '50%'],
            radius: 'w(100)',
            splitNumber: '4',
            axisName: {
              formatter: '{value}',
              fontFamily:'PingFang SC-Regular',
              color: 'rgba(255,255,255,0.85)',
              fontSize:'w(14)',
              // height: 'h(10)',
              // padding: [0, 0, 'w(-9)', 0],
            },
            splitArea: {
              areaStyle: {
                color: [
                  'RGBA(31, 49, 88, .4)',
                  'RGBA(31, 49, 88, .6)',
                  'RGBA(42, 59, 96, .7)',
                  'RGBA(31, 49, 88, .8)',
                ],
                shadowColor: 'rgba(0, 0, 0, 0.2)',
                shadowBlur: 'w(10)',
              },
            },
            axisLine: {
              lineStyle: {
                color: 'RGBA(43, 61, 97, 1)',
              },
            },
            splitLine: {
              lineStyle: {
                color: 'RGBA(43, 61, 97, 1)',
              },
            },
          },
        ],
        series: [
          {
            type: 'radar',
            emphasis: {
              lineStyle: {
                width: 'w(4)',
              },
            },
            symbolSize: 0,
            data: [
              {
                value: [200, 210, 110, 240, 120, 210],
                name: '小型车',
                areaStyle: {
                  color: 'rgba(54, 134, 255, .2)',
                },
              },
              {
                value: [60, null, 80, 100, 150, 120, 190],
                name: '公交车',
                areaStyle: {
                  color: 'rgba(83, 240, 146, .2)',
                },
              },
              {
                value: [20, 35, 50, 100, 60, 80],
                name: '渣土车',
                areaStyle: {
                  color: 'rgba(238, 111, 124, .2)',
                },
              },
              {
                value: [140, 75, 10, 100, 150, 200],
                name: '大型车-其他',
                areaStyle: {
                  color: 'rgba(95, 213, 236, .2)',
                },
              },
            ],
            tooltip: {
              trigger: 'item',
            },
          },
        ],
      };
    }
  }
  