export default class PolarBase {
    constructor(data = []) {
      this.data = data;
      return this.getChartConfig()
    }
  
    getDataMax() {
      const max = this.data.reduce((acc, curr) => Math.max(acc, curr), 1);
      const percentage = 0.85; // 85% expressed as a decimal
      return max / percentage;
    }
  
    getChartConfig() {
      return {
        chart: {
          polar: true,
          backgroundColor: 'rgba(0,0,0,0)',
        },
        accessibility: {
          enabled: false,
        },
        title: {
          text: '',
        },
        credits: 'disable',
        pane: {
          startAngle: 0,
          endAngle: 360,
          size: '100%',
          background: [
            {
              backgroundColor: '#14376b',
              borderWidth: 0,
              innerRadius: '0%',
              outerRadius: '85%',
            },
            {
              backgroundColor: '#19468f',
              borderWidth: 0,
              innerRadius: '85%',
              outerRadius: '100%',
            },
          ],
        },
        legend: {
          enabled: false,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(130,174,255,0.2)',
          borderWidth: 0,
          borderRadius: 'w(8)',
          shadow: false,
          useHTML: true,
          shared: true,
          className: 'tooltip-back-bar',
          style: {
            color: '#E8F3FF',
            fontSize: 'w(14)',
          },
          formatter: function () {
            let s = '<b>' + this.x + '</b>';
            this.points.forEach(function (point) {
              const seriesTotal = point.series.data.reduce(function (sum, point) {
                return sum + point.y;
              }, 0);
  
              const percentage = ((point.y / seriesTotal) * 100).toFixed(2);
              s +=
                '<br/><span style="color:' +
                point.series.color +
                '">\u25CF</span> ' +
                point.series.name +
                ': <b>' +
                point.y +
                ' (' +
                percentage +
                '%)</b>';
            });
  
            return s;
          },
        },
        xAxis: {
          tickInterval: 1,
          gridLineColor: 'rgba(182, 200, 209, 0.30)',
          backgroundColor: 'rgba(2,20,30,1)',
          lineColor: 'rgba(182, 200, 209, 0.30)',
          labels: {
            align: 'center',
            distance: 'w(-12)',
            style: {
              color: '#C3CED5',
              fontFamily: 'Roboto-Regular',
              fontSize: 'w(12)',
            },
          },
          tickColor: '#C3CED5',
          tickLength: 'w(3)',
          tickPosition: 'inside',
          tickWidth: 'w(1)',
        },
        yAxis: {
          min: 0,
          max: this.getDataMax(),
          gridLineWidth: '0',
          lineColor: '',
          labels: {
            enabled: false,
          },
        },
        plotOptions: {
          series: {
            pointStart: 0,
            pointInterval: 1,
            negativeColor: 'rgba(95, 213, 236, 1)',
            states: {
              hover: {
                color: '#6edb84',
              },
            },
            enableMouseTracking: true,
          },
          column: {
            pointPadding: 0,
            groupPadding: 0,
          },
        },
        series: [
          {
            type: 'column',
            name: '流量',
            cursor: 'pointer',
            data: this.data,
            dataLabels: {
              enabled: false,
              color: 'red',
              inside: true,
              verticalAlign: 'center',
            },
            pointPlacement: 'between',
            color: '#3dc3cc',
          },
        ],
      };
    }
  }
  
//   export default (data) => {
//     const polarChartConfig = new PolarChartConfig(data);
//     return polarChartConfig.generateConfig();
//   };
  