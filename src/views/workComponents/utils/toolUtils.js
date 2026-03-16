// 获取百分比位置对应的颜色值
export const getColorAtPercentage = (percentage, gradientColorList) => {
    const gradientColors = gradientColorList || [
        // { color: 'rgba(30, 204, 153,1)', position: 0 },
        {
            color: 'rgba(30,204,153,1)',
            position: 0
        },
        {
            color: 'rgba(255, 179, 0, 1)',
            position: 50
        },
        {
            color: 'rgba(255, 104, 83, 1)',
            position: 100
        },
    ]
    for (let i = 0; i < gradientColors.length - 1; i++) {
        if (percentage >= gradientColors[i].position && percentage <= gradientColors[i + 1].position) {
            const lowerBound = gradientColors[i].position;
            const upperBound = gradientColors[i + 1].position;
            const lowerColor = gradientColors[i].color;
            const upperColor = gradientColors[i + 1].color;
            const ratio = (percentage - lowerBound) / (upperBound - lowerBound);
            return interpolateColors(lowerColor, upperColor, ratio);
        }
    }
    return gradientColors[0].color; // 默认返回第一个颜色
}
// 插值计算
const interpolateColors = (color1, color2, ratio)=> {
    const color1Arr = color1.match(/\d+/g).map(Number);
    const color2Arr = color2.match(/\d+/g).map(Number);
    const r = Math.round((1 - ratio) * color1Arr[0] + ratio * color2Arr[0]);
    const g = Math.round((1 - ratio) * color1Arr[1] + ratio * color2Arr[1]);
    const b = Math.round((1 - ratio) * color1Arr[2] + ratio * color2Arr[2]);
    const a = (1 - ratio) * color1Arr[3] + ratio * color2Arr[3];
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
export const debounce = (fn, delay = 1000) => {
    let timeout
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.call(this, arguments);

        }, delay);
    };
}