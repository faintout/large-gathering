//深度合并-深拷贝,参数同Objec.assign
export function deepMerge(obj1, obj2) {
    let key;
    for (key in obj2) {
      // 如果target(也就是obj1[key])存在，且是对象的话再去调用deepMerge，否则就是obj1[key]里面没这个对象，需要与obj2[key]合并
      // 如果obj2[key]没有值或者值不是对象，此时直接替换obj1[key]
      obj1[key] =
        obj1[key] &&
          obj1[key].toString() === "[object Object]" &&
          (obj2[key] && obj2[key].toString() === "[object Object]")
          ? deepMerge(obj1[key], obj2[key])
          : (obj1[key] = obj2[key]);
    }
    return deepClone(obj1)
  }
  //深拷贝
  export function deepClone(obj) {
    //判断拷贝的要进行深拷贝的是数组还是对象，是数组的话进行数组拷贝，对象的话进行对象拷贝
    var objClone = Array.isArray(obj) ? [] : {};
    //进行深拷贝的不能为空，并且是对象或者是
    if (obj && typeof obj === "object") {
      let key;
      for (key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          if (obj[key] && typeof obj[key] === "object") {
            objClone[key] = deepClone(obj[key]);
          } else {
            objClone[key] = obj[key];
          }
        }
      }
    }
    return objClone;
  }

  //获取随机uuid
export function guid() {
  function uid() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (uid() + uid() + "-" + uid() + "-" + uid() + "-" + uid() + "-" + uid() + uid() + uid());
}
export function debounce(fn, wait) {
  let timeout;
  return function() {
    let that = this;
    let arg = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function(){
      fn.apply(that,arg)//使用apply改变this指向
    }, wait);
  }
}
//车辆归属颜色列表
export const colorList = [
  "#7990EF",
  "#F98583",
  "#FFD47C",
  "#87BBFB",
  "#75DDDA",
  "#76A980",
  "#D28CFF",
  "#FFA37C",
  "#7EDF92",
  "#FF91C4",
  "#9EBED1",
  "#F7B0FF",
  "#BDF136",
  "#815B31",
  "#FFC7C7",
  "#CA9898",
  "#6695A4",
  "#9A69F3",
  "#1FB471",
  "#328EFF",
  "#C6E8E7",
  "#99B814",
  "#C4734B",
  "#983B3B",
  "#6568FF",
  "#DDB88E",
  "#C9D400",
  "#B6921D",
  "#000000",
  "#BEBEBE",
]