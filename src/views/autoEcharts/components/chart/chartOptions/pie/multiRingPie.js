

export default class MultiRingPie{
  constructor(data){
    this.data = data
    this.total = data.reduce((total, item) => {
          return total + item.value
      }, 0)
    this.lengthDetailShow = data.lengthDetailShow
    this.isLegendNumClick = data.isLegendNumClick
    return this.getChartConfig()
  }
  getChartConfig(){
    return {
      "legend": {
        // selectedMode:false,
        type: 'scroll',
        itemWidth: 'w(10)',
        itemHeight: 'w(10)',
        borderRadius: 'w(2)',
        icon: 'roundRect',
        y: 'center', // 图例垂直居上
        left: this.lengthDetailShow?'50%':'58%',
        height: this.data.length>=9?'90%':'100%',
        width: '100%',
        orient: 'vertical',
        align: 'auto',
        itemGap: 'h(21)',
        textStyle: {
          fontSize: 'w(14)',
          color: '#C3CED5',
          fontFamily:
            'font-family: Source Han Sans CN-Regular, Source Han Sans CN',
          rich: {
            name: {
              verticalAlign: 'right',
              align: 'left',
              width: 'w(80)',
              height: 'h(20)',
              fontSize: 'w(14)',
              color: '#C3CED5',
            },
            value: {
              align: 'left',
              color: this.isLegendNumClick?'#4B98FA':'#C3CED5',
              fontSize: 'w(14)',
            },
            rate: {
              align: 'left',
              width: 'w(50)',
              fontSize: 'w(14)',
              color: '#C3CED5',
            },
          },
        },
        pageTextStyle:{
            color:'#C3CED5'
        },
        pageButtonItemGap: 'w(20)',
        pageButtonGap:'w(10)',
        pageButtonPosition: 'end', // 按钮在图例的末尾位置，即底部
        pageIcons: {
            vertical: [
                'image://data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IiYjMjI4OyYjMTg2OyYjMTY0OyYjMjI4OyYjMTg3OyYjMTUyOyYjMjMyOyYjMTc1OyYjMTgwOyYjMjMwOyYjMTUyOyYjMTQyOyI+CjxnIGlkPSJpY29uLSYjMjI4OyYjMTg0OyYjMTM5OyYjMjMwOyYjMTM5OyYjMTM3OyYjMjI5OyYjMTc3OyYjMTQ5OyYjMjI5OyYjMTg4OyYjMTI4OyYjMjI5OyYjMTY0OyYjMTM1OyYjMjI4OyYjMTg3OyYjMTg5OyA1Ij4KPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTgwIDE2IDE2KSIgc3Ryb2tlPSIjMjY0MjdFIiBzdHJva2UtbWl0ZXJsaW1pdD0iMCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIvPgo8ZyBpZD0iaWNvbi0mIzIyODsmIzE4NDsmIzEzOTsmIzIzMDsmIzEzOTsmIzEzNzsmIzIyOTsmIzE3NzsmIzE0OTsmIzIyOTsmIzE4ODsmIzEyODsiPgo8cmVjdCBpZD0iJiMyMzE7JiMxNTk7JiMxNjk7JiMyMjk7JiMxODk7JiMxNjI7IiBvcGFjaXR5PSIwLjAxIiB4PSIxNiIgeT0iMTYiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdHJhbnNmb3JtPSJyb3RhdGUoLTE4MCAxNiAxNikiIGZpbGw9IiM3NTdEOEIiLz4KPHBhdGggaWQ9IiYjMjMyOyYjMTgzOyYjMTc1OyYjMjI5OyYjMTkwOyYjMTMyOyIgZD0iTTExLjA1NjcgMTAuNTI2NEw4IDcuNDY5N0w0Ljk0MzMzIDEwLjUyNjRMNCA5LjU4MzAzTDggNS41ODMwM0wxMiA5LjU4MzAzTDExLjA1NjcgMTAuNTI2NFoiIGZpbGw9IiNBNUJCRkEiLz4KPC9nPgo8L2c+CjwvZz4KPC9zdmc+Cg==',
                'image://data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IiYjMjI4OyYjMTg2OyYjMTY0OyYjMjI4OyYjMTg3OyYjMTUyOyYjMjMyOyYjMTc1OyYjMTgwOyYjMjMwOyYjMTUyOyYjMTQyOyI+CjxnIGlkPSJpY29uLSYjMjI4OyYjMTg0OyYjMTM5OyYjMjMwOyYjMTM5OyYjMTM3OyYjMjI5OyYjMTc3OyYjMTQ5OyYjMjI5OyYjMTg4OyYjMTI4OyYjMjI5OyYjMTY0OyYjMTM1OyYjMjI4OyYjMTg3OyYjMTg5OyA0Ij4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgc3Ryb2tlPSIjMjY0MjdFIiBzdHJva2UtbWl0ZXJsaW1pdD0iMCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIvPgo8ZyBpZD0iaWNvbi0mIzIyODsmIzE4NDsmIzEzOTsmIzIzMDsmIzEzOTsmIzEzNzsmIzIyOTsmIzE3NzsmIzE0OTsmIzIyOTsmIzE4ODsmIzEyODsiPgo8cmVjdCBpZD0iJiMyMzE7JiMxNTk7JiMxNjk7JiMyMjk7JiMxODk7JiMxNjI7IiBvcGFjaXR5PSIwLjAxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiM3NTdEOEIiLz4KPHBhdGggaWQ9IiYjMjMyOyYjMTgzOyYjMTc1OyYjMjI5OyYjMTkwOyYjMTMyOyIgZD0iTTQuOTQzMzMgNS40NzM2M0w4IDguNTMwM0wxMS4wNTY3IDUuNDczNjNMMTIgNi40MTY5N0w4IDEwLjQxN0w0IDYuNDE2OTdMNC45NDMzMyA1LjQ3MzYzWiIgZmlsbD0iI0E1QkJGQSIvPgo8L2c+CjwvZz4KPC9nPgo8L3N2Zz4=',
            ]
        },
  
        data: this.data.map((item) => item.name),
        formatter:  (name)=> {
          let tarValue
          for (var i = 0; i < this.data?.length; i++) {
            if (name === this.data?.[i]?.name) {
              tarValue = this.data?.[i]?.value
            }
          }
  
          let p = Math.round((tarValue / this.total) * 100)
          const detail = '{rate|      ' + p+'%' + '}' + '{value|      ' + tarValue + '}'
          return '{name| ' + name + '}' + (this.lengthDetailShow?detail:'')
        },
      },
    tooltip: {
        // trigger: "axis",
        backgroundColor: 'rgba(130,174,255,0.2)',
        borderWidth: 0,
        className: 'tooltip-back-bar',
        textStyle: {
            color: ' #E8F3FF',
            fontSize: 'w(11)',
            fontFamily: 'Source Han Sans CN-Bold, Source Han Sans CN',
            fontWeight: 'bold',
        },
        formatter: function (params) {
            if (params.seriesName == 1 || params.seriesName == 2) {
                return params.marker + params.name + '：' + params.value
            }
        },
    },
    title: {
        show: false,
        text: '75.53%',
        left: 'center',
        top: '32%',
        textStyle: {
            textAlign: 'center',
            color: '#ffffff',
            fontSize: 'w(14)',
            fontWeight: 600,
        },
    },
    
        series: [
          {
            name: '1',
            type: 'pie',
            center: ['32%', '50%'],
            radius: ['h(106)', 'h(124)'],
            avoidLabelOverlap: true,
            // color:['rgba(254, 225, 134, 1)','rgba(95, 213, 236, 1)','rgba(189, 219, 255, 1)','rgba(83, 240, 146, 1)','rgba(54, 134, 255, 1)'],
            label: {
              show: false,
            },
            itemStyle: {
              color: (params) => {
                let colorList = [
                  '#FEE186',
                  '#5FD5EC',
                  '#BDDBFF',
                  '#3686FF',
                  '#5FECB9',
                  '#DEBDFF',
                ]
                return colorList[params.dataIndex]
              },
              // borderRadius: 0,
              // borderColor: '#fff',
              // borderWidth: 5
            },
            emphasis: {
              label: {
                show: false,
              },
            },
            labelLine: {
              show: false,
            },
            data: this.data,
          },
          {
            // tooltip:{
            //   show:false
            // },
            name: '2',
            type: 'pie',
            center: ['32%', '50%'],
            radius: ['h(84)', 'h(106)'],
            avoidLabelOverlap: true,
            labelLayout: {
              hideOverlap: false,
            },
            label: {
              show: false,
            },
            itemStyle: {
              color: (params) => {
                let colorList = [
                  'RGBA(66, 75, 90, 1)',
                  'RGBA(34, 73, 110, 1)',
                  'RGBA(53, 74, 114, 1)',
                  'RGBA(53, 74, 114, 1)',
                  'RGBA(26, 57, 114, 1)',
                  'RGBA(53, 74, 114, 1)',
                ]
                return colorList[params.dataIndex]
              },
            },
            emphasis: {
              disabled: true,
              label: {
                show: false,
              },
            },
            labelLine: {
              show: false,
            },
            data: this.data,
          },
          {
            name: '3',
            type: 'pie',
            center: ['32%', '50%'],
            radius: ['h(32)', 'h(42)'],
            avoidLabelOverlap: true,
            labelLayout: {
              hideOverlap: false,
            },
            label: {
              show: true,
              position: 'inside',
              formatter: function (d) {
                return parseFloat(d.percent).toFixed(0) + '%'
              },
              color: '#C3CED5',
              fontSize: 'w(14)',
            },
            itemStyle: {
              color: 'rgba(19, 38, 79, 0)',
            },
            emphasis: {
              disabled: true,
              label: {
                show: false,
              },
            },
            labelLine: {
              show: false,
            },
            data: this.data,
          },
        ],
      }
  }
}