/**
 * 四维图新MineMap样式和服务配置
 * 包含地图样式、服务域名、API密钥等配置
 */

/**
 * 四维地图默认样式配置 外网
 */
const defaultMineMapStyle = {
  // 地图样式URL
  domainUrl: 'https://minemap.minedata.cn',
  dataDomainUrl: 'https://minemap.minedata.cn',
  serverDomainUrl: 'https://sd-data.minedata.cn',
  spriteUrl: 'https://minemap.minedata.cn/minemapapi/v2.1.1/sprite/sprite',
  serviceUrl: 'https://service.minedata.cn/service',
  appKey: '6adca2e286fd44f48c9cda662078a84c',
  solution: 1024714520283086848,
  mapStyle: 'https://service.minedata.cn/map/solu/style/1024714520283086848',
}

// 张家口内网地图服务地址(视频网环境)
const internalMapStyle = {
  domainUrl: 'https://13.145.180.146:21111',
  dataDomainUrl: 'https://13.145.180.146:21111',
  serverDomainUrl: 'https://13.145.180.146:21111',
  spriteUrl: 'https://13.145.180.146:21111/minemapapi/v2.0.0/sprite/sprite',
  serviceUrl: 'https://13.145.180.146:21111/service/',
  appKey: '33b32339e9664063806ffdbb62c07ed9',
  solution: 12756,
  solutionWithTraffic: 12772,
  mapStyle: 'https://13.145.180.146:21111/service/solu/style/id/12756',
}

//张家口内网地图服务地址(公安网环境)
const internalPoliceMapStyle = {
  domainUrl: 'https://20.153.236.149:21111',
  dataDomainUrl: 'https://20.153.236.149:21111',
  serverDomainUrl: 'https://20.153.236.149:21111',
  spriteUrl: 'https://20.153.236.149:21111/minemapapi/v2.0.0/sprite/sprite',
  serviceUrl: 'https://20.153.236.149:21111/service/',
  appKey: '34600d0decd14b9baaacbce0eaf119a3',
  solution: 12701,
  solutionWithTraffic: 12772,
  mapStyle: 'https://20.153.236.149:21111/service/solu/style/id/12701',
}

/**
 * 构建完整的四维地图配置
 * @param {object} styleType - 黑白颜色
 * @param {object} environment - 环境
 * @returns {object} 完整配置
 */
export const buildMineMapConfig = (styleType = 'black') => {
  // 获取环境配置
  const mapStyle = {}
  // if (environment === 'production' || environment === 'productionPre') {
  //   // 视频网，地图带路况
  //   mapStyle.domainUrl = internalMapStyle.domainUrl;
  //   mapStyle.dataDomainUrl = internalMapStyle.dataDomainUrl;
  //   mapStyle.serverDomainUrl = internalMapStyle.serverDomainUrl;
  //   mapStyle.spriteUrl = internalMapStyle.spriteUrl;
  //   mapStyle.serviceUrl = internalMapStyle.serviceUrl;
  //   mapStyle.appKey = internalMapStyle.appKey;
  //   mapStyle.solution = styleType == 'black' ? internalMapStyle.solutionWithTraffic : '12756';
  //   mapStyle.mapStyle = styleType == 'black' ? internalMapStyle.mapStyle : 'https://13.145.180.146:21111/service/solu/style/id/12751';
  // } else if (environment === 'policeProduction') {
  //   // 公安网，地图不带路况
  //   mapStyle.domainUrl = internalPoliceMapStyle.domainUrl;
  //   mapStyle.dataDomainUrl = internalPoliceMapStyle.dataDomainUrl;
  //   mapStyle.serverDomainUrl = internalPoliceMapStyle.serverDomainUrl;
  //   mapStyle.spriteUrl = internalPoliceMapStyle.spriteUrl;
  //   mapStyle.serviceUrl = internalPoliceMapStyle.serviceUrl;
  //   mapStyle.appKey = internalPoliceMapStyle.appKey;
  //   mapStyle.solution = styleType == 'black' ? internalPoliceMapStyle.solution : '12704';
  //   mapStyle.mapStyle = styleType == 'black' ? internalPoliceMapStyle.mapStyle : '//20.153.236.149:21111/service/solu/style/id/12704';
  // } else if (environment === 'development') {
    // 外网，地图不带路况
    mapStyle.domainUrl = defaultMineMapStyle.domainUrl;
    mapStyle.dataDomainUrl = defaultMineMapStyle.dataDomainUrl;
    mapStyle.serverDomainUrl = defaultMineMapStyle.serverDomainUrl;
    mapStyle.spriteUrl = defaultMineMapStyle.spriteUrl;
    mapStyle.serviceUrl = defaultMineMapStyle.serviceUrl;
    mapStyle.key = defaultMineMapStyle.appKey;
    mapStyle.solution = styleType === 'black' ? defaultMineMapStyle.solution : '1032305393908875264';
    mapStyle.mapStyle = styleType === 'black' ? defaultMineMapStyle.mapStyle : 'https://service.minedata.cn/map/solu/style/1032305393908875264';
  // }
  
  // 合并配置
  return mapStyle
}

export default {
  buildMineMapConfig,
} 