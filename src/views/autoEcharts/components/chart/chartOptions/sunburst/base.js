import { colorList } from '@/views/autoEcharts/utils/toolUtils';

export default class SunburstBase {
  constructor(data = [],config = {}) {
    this.data = data;
    return this.getChartConfig();
  }

  getSeriesData() {
    let seriesData = [];
    this.data.forEach((el, index) => {
      seriesData.push({
        name: el.name,
        itemStyle: {
          color: colorList[index],
        },
        value: Number(el.value),
        rate: el.rate,
        children: [
          ...el.subPieData.map(item => {
            return {
              name: item.name,
              value: Number(item.value),
              rate: item.rate,
            };
          }),
        ],
      });
    });
    return seriesData;
  }

  getChartConfig() {
    return {
      color: colorList,
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
      series: {
        type: 'sunburst',
        data: this.getSeriesData(),
        center: ['25%', '50%'],
        radius: ['10%', '78%'],
        itemStyle: {
          borderColor: '#13264f',
          borderWidth: 'w(2)',
        },
        sort: null,
        levels: [
          {
            label: {
              show: true,
            },
          },
          {
            r0: '60%',
            r: '35%',
            itemStyle: {
              borderWidth: 'w(2)',
              borderColor: '#13264f',
            },
            label: { rotate: 'tangential', fontSize: 'w(14)', color: '#E6EAF0', distance: '200' },
            emphasis: {
              focus: 'descendant',
              label: {
                distance: '200',
                position: 'inside',
                rotate: '0',
                color: '#E6EAF0',
                fontSize: 'w(14)',
                formatter: p => {
                  return `${p.data.name}: ${p.data.value}`;
                },
              },
            },
          },
          {
            r0: '62%',
            r: '75%',
            label: {
              show: true,
              fontSize: 'w(12)',
              color: '#E6EAF0',
            },
            emphasis: {
              focus: 'ancestor',
              label: {
                position: 'inside',
                color: '#E6EAF0',
                fontSize: 'w(14)',
                rotate: '0',
                formatter: p => {
                  return `${p.data.name}: ${p.data.value}`;
                },
              },
            },
            nodeClick: 'none',
          },
        ],
        label: {
          minAngle: 10,
        },
        nodeClick: 'rootToNode',
      },
    };
  }
}