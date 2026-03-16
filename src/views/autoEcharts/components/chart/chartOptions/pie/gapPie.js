import {
    colorList as defaultColorList
} from '@/views/autoEcharts/utils/toolUtils';
/**
 * 图表参数配置
 *
 * @param {Array} data - 图表所需数据
 * @param {Object} [config] - 图表的配置项
 * @param {string} [config.titleName] -图表中心的文字信息
 * @param {boolean} [config.legendDetailShow] - 图例是否展示详细信息
 * @param {boolean} [config.isLegendClick] - 图例是否展可以点击
 * @param {boolean} [config.isLegendNumClick] - 图例数字是否可点击(用来判断修改颜色)
 * @param {string} [config.legendDetailUnit] - 图例数字单位
 * @param {Array<string>} [config.colorList] - 图例颜色列表
 * @returns {ChartOptions} 返回图表配置
 */
export default class GapPie {
    constructor(data = [], {
        titleName = '',
        legendDetailShow = true,
        isLegendNumClick = false,
        isLegendClick = true,
        legendDetailUnit = '',
        colorList = defaultColorList
    }) {
        this.data = data;
        this.titleName = titleName
        this.legendDetailShow = legendDetailShow
        this.isLegendNumClick = isLegendNumClick
        this.isLegendClick = isLegendClick
        this.legendDetailUnit = legendDetailUnit
        this.colorList = colorList
        this.total = this.data.reduce((total, item) => total + item.value, 0);
        return this.getChartConfig()
    }

    getSeresData(selected) {
        //设置默认selected
        const defaultSelected = {}
        this.data.map(item => defaultSelected[item.name] = true)
        selected = {
            ...defaultSelected,
            ...selected
        };
        //获取图例选中并且value有值得个数
        const dataSelect = this.data.filter(item => item.value > 0 && selected[item.name])
        const total = dataSelect.reduce((sum, item) => sum + item.value, 0);
        const newData = [];
        this.data.map((item) => {
            newData.push(item)
            //在选中的数据大于1的情况下添加空白间隔
            // 在数据大于0 的情况下
            if (selected[item.name] && dataSelect.length > 1 && item.value > 0) {
                newData.push({
                    "value": total * 0.015,
                    "name": ""
                })
            }
        })
        return newData;
    }
    //传进来的data是处理过，加了空白的数据
    getSeriesColor(data) {
        let colorIndex = 0; // 用于跟踪colorList中的颜色位置
        const resultColors = data.map(item => {
            if (item.name) {
                // 如果name不为空，使用当前颜色并增加索引
                return this.colorList[colorIndex++];
            } else {
                // 如果name为空，返回透明色
                return 'rgba(0,0,0,0)';
            }
        });
        return resultColors
    }

    getTitleName() {
        const graphic = {
            elements: [{
                    type: 'text',
                    left: this.legendDetailShow ? '11%' : '19%',
                    top: '42%',
                    style: {
                        text: this.total,
                        width: 'w(120)',
                        overflow: 'truncate',
                        fontFamily: 'DIN Alternate-Bold',
                        textAlign: 'center',
                        fill: '#E6EAF0 ',
                        fontSize: 'w(32)',
                    },
                },
                {
                    type: 'text',
                    left: this.legendDetailShow ? '11%' : '19%',
                    top: '57%',
                    style: {
                        text: this.titleName,
                        fontFamily: 'FZLanTingHeiS-DB-GB-Re',
                        width: 'w(120)',
                        overflow: 'truncate',
                        textAlign: 'center',
                        fill: '#A5ADBA ',
                        fontSize: 'w(14)',
                    },
                },
            ],
        };

        return this.titleName ? graphic : {
            elements: []
        };
    }

    getChartConfig() {
        return {
            $generalChart: this,
            $getSeresData: this.getSeresData,
            $getSeriesColor: this.getSeriesColor,
            legend: {
                selectedMode: this.isLegendClick,
                type: 'scroll',
                itemWidth: 'w(10)',
                itemHeight: 'w(10)',
                borderRadius: 'w(2)',
                icon: 'roundRect',
                y: 'center',
                left: this.legendDetailShow ? '50%' : '58%',
                height: this.data.length >= 9 ? '90%' : '100%',
                width: '100%',
                orient: 'vertical',
                align: 'auto',
                itemGap: 'h(21)',
                textStyle: {
                    fontSize: 'w(14)',
                    color: '#C3CED5',
                    fontFamily: 'Source Han Sans CN-Regular, Source Han Sans CN',
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
                            color: this.isLegendNumClick ? '#4B98FA' : '#C3CED5',
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
                pageTextStyle: {
                    color: '#C3CED5',
                },
                pageButtonItemGap: 'w(20)',
                pageButtonGap: 'w(10)',
                pageButtonPosition: 'end',
                pageIcons: {
                    vertical: [
                        'image://data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IiYjMjI4OyYjMTg2OyYjMTY0OyYjMjI4OyYjMTg3OyYjMTUyOyYjMjMyOyYjMTc1OyYjMTgwOyYjMjMwOyYjMTUyOyYjMTQyOyI+CjxnIGlkPSJpY29uLSYjMjI4OyYjMTg0OyYjMTM5OyYjMjMwOyYjMTM5OyYjMTM3OyYjMjI5OyYjMTc3OyYjMTQ5OyYjMjI5OyYjMTg4OyYjMTI4OyYjMjI5OyYjMTY0OyYjMTM1OyYjMjI4OyYjMTg3OyYjMTg5OyA1Ij4KPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTgwIDE2IDE2KSIgc3Ryb2tlPSIjMjY0MjdFIiBzdHJva2UtbWl0ZXJsaW1pdD0iMCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIvPgo8ZyBpZD0iaWNvbi0mIzIyODsmIzE4NDsmIzEzOTsmIzIzMDsmIzEzOTsmIzEzNzsmIzIyOTsmIzE3NzsmIzE0OTsmIzIyOTsmIzE4ODsmIzEyODsiPgo8cmVjdCBpZD0iJiMyMzE7JiMxNTk7JiMxNjk7JiMyMjk7JiMxODk7JiMxNjI7IiBvcGFjaXR5PSIwLjAxIiB4PSIxNiIgeT0iMTYiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdHJhbnNmb3JtPSJyb3RhdGUoLTE4MCAxNiAxNikiIGZpbGw9IiM3NTdEOEIiLz4KPHBhdGggaWQ9IiYjMjMyOyYjMTgzOyYjMTc1OyYjMjI5OyYjMTkwOyYjMTMyOyIgZD0iTTExLjA1NjcgMTAuNTI2NEw4IDcuNDY5N0w0Ljk0MzMzIDEwLjUyNjRMNCA5LjU4MzAzTDggNS41ODMwM0wxMiA5LjU4MzAzTDExLjA1NjcgMTAuNTI2NFoiIGZpbGw9IiNBNUJCRkEiLz4KPC9nPgo8L2c+CjwvZz4KPC9zdmc+Cg==',
                        'image://data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IiYjMjI4OyYjMTg2OyYjMTY0OyYjMjI4OyYjMTg3OyYjMTUyOyYjMjMyOyYjMTc1OyYjMTgwOyYjMjMwOyYjMTUyOyYjMTQyOyI+CjxnIGlkPSJpY29uLSYjMjI4OyYjMTg0OyYjMTM5OyYjMjMwOyYjMTM5OyYjMTM3OyYjMjI5OyYjMTc3OyYjMTQ5OyYjMjI5OyYjMTg4OyYjMTI4OyYjMjI5OyYjMTY0OyYjMTM1OyYjMjI4OyYjMTg3OyYjMTg5OyA0Ij4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgc3Ryb2tlPSIjMjY0MjdFIiBzdHJva2UtbWl0ZXJsaW1pdD0iMCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIvPgo8ZyBpZD0iaWNvbi0mIzIyODsmIzE4NDsmIzEzOTsmIzIzMDsmIzEzOTsmIzEzNzsmIzIyOTsmIzE3NzsmIzE0OTsmIzIyOTsmIzE4ODsmIzEyODsiPgo8cmVjdCBpZD0iJiMyMzE7JiMxNTk7JiMxNjk7JiMyMjk7JiMxODk7JiMxNjI7IiBvcGFjaXR5PSIwLjAxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiM3NTdEOEIiLz4KPHBhdGggaWQ9IiYjMjMyOyYjMTgzOyYjMTc1OyYjMjI5OyYjMTkwOyYjMTMyOyIgZD0iTTQuOTQzMzMgNS40NzM2M0w4IDguNTMwM0wxMS4wNTY3IDUuNDczNjNMMTIgNi40MTY5N0w4IDEwLjQxN0w0IDYuNDE2OTdMNC45NDMzMyA1LjQ3MzYzWiIgZmlsbD0iI0E1QkJGQSIvPgo8L2c+CjwvZz4KPC9nPgo8L3N2Zz4=',
                    ],
                },
                data: this.data.map((item) => item.name),
                formatter: (name) => {
                    const tarValue = this.getTarValue(name);
                    const p = Math.round((tarValue / this.total) * 100) || 0;
                    const detail = '{rate|      ' + p + '%' + '}' + '{value|      ' + tarValue + this.legendDetailUnit + '}';
                    return '{name| ' + name + '}' + (this.legendDetailShow ? detail : '');
                },
            },
            tooltip: {
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
            graphic: this.getTitleName(),
            series: [{
                    name: '',
                    type: 'pie',
                    center: [this.legendDetailShow ? '22%' : '30%', '50%'],
                    radius: ['w(85)', 'w(95)'],
                    tooltip: {
                        show: true,
                        formatter: (params) => {
                            if (params.name) {
                                return params.marker + params.name + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + params.value;
                            }
                        },
                    },
                    avoidLabelOverlap: true,
                    label: {
                        show: false,
                    },
                    itemStyle: {
                        color: params => {
                            const seriesColor = this.getSeriesColor(this.getSeresData())
                            return seriesColor[params.dataIndex]
                        }
                    },
                    emphasis: {
                        label: {
                            show: false,
                        },
                    },
                    labelLine: {
                        show: false,
                    },
                    data: this.getSeresData(),
                },
                {
                    name: '',
                    type: 'pie',
                    center: [this.legendDetailShow ? '22%' : '30%', '50%'],
                    radius: ['w(65)', 'w(85)'],
                    avoidLabelOverlap: true,
                    labelLayout: {
                        hideOverlap: false,
                    },
                    label: {
                        show: false,
                    },
                    tooltip: {
                        show: true,
                        formatter: (params) => {
                            if (params.name) {
                                return params.marker + params.name + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + params.value;
                            }
                        },
                    },
                    itemStyle: {
                        color: params => {
                            const seriesColor = this.getSeriesColor(this.getSeresData())
                            return seriesColor[params.dataIndex]
                        },
                        opacity: 0.1,
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
                    data: this.getSeresData(),
                },
            ],
        };
    }

    getTarValue(name) {
        for (let i = 0; i < this.data?.length; i++) {
            if (name === this.data?.[i]?.name) {
                return this.data?.[i]?.value;
            }
        }
        return 0;
    }
}
export const legendSelectChanged = (chartRef, event) => {
    const {
        $getSeresData,
        $getSeriesColor,
        $generalChart
    } = chartRef.getOption()
    // 获取新的series数据
    const newData = $getSeresData.call($generalChart, event.selected)
    // 获取新的颜色
    const seriesColor = $getSeriesColor.call($generalChart, newData)
    // 缓存颜色函数以避免重复定义
    const colorFunction = params => seriesColor[params.dataIndex];
    //更新数据
    chartRef.setOption({
        series: [{
            data: newData,
            "itemStyle": {
                color: colorFunction,
            },
        }, {
            data: newData,
            "itemStyle": {
                color: colorFunction,
            },
        }]
    });
}