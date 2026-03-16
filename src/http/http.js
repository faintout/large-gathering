import axios from 'axios'
import router from '@/router'
import tipMessage from "@/utils/tipMessage"
import i18n from '@/i18n/index'
import {solarPowerSystem} from "@/common/projectAlias.js";
// 创建一个 Map 来存储每个 URL 的取消函数
const pendingRequests = new Map();
/**
 * 提示函数
 */
const tip = (msg) => {
    tipMessage(msg, 'error');
};
const { t } = i18n.global;
/**
 * 请求失败后的错误统一处理
 * @param status 请求失败的状态码,这块还没设置
 * @param msg 接口失败返回的说明
 */
const errorHandle = (status, msg) => {
    switch (status) {
        case 500:
            tip(msg || t('http.serviceError'));
            break;
        case 502:
            tip(msg || t('http.interfaceMissing'));
            break;
        case 401:
            tip(msg || t('http.loginTimeout'));
            sessionStorage.removeItem('upmSessionId');
            router.push('/login');
            break;
        case 403:
            tip(msg || t('http.noPermission'));
            break;
        case 404:
            tip(msg || t('http.interfaceNotFound'));
            break;
        case 421:
            tip(t('http.loginTimeout'));
            sessionStorage.removeItem('upmSessionId');
            router.push('/login');
            break;
        case "421":
            tip(t('http.loginTimeout'));
            sessionStorage.removeItem('upmSessionId');
            router.push('/login');
            break;
        default:
            tip(msg || t('http.unknownError'));
            break;
    }
};

/**
 * 将外部的状态码进行一个处理
 * @param msg   外部服务器错误的一个信息
 */
const dealCode = (msg) => {
    let code = null;
    if (msg.indexOf('404') > -1) code = 404;
    if (msg.indexOf('403') > -1) code = 403;
    if (msg.indexOf('401') > -1) code = 401;
    if (msg.indexOf('500') > -1) code = 500;
    if (msg.indexOf('502') > -1) code = 502;
    if (msg.indexOf('canceled') > -1) code = 'canceled';
    return code
}

/**
 * axios基础设置
 * @type {number}
 */
axios.defaults.timeout = 100000;

//创建axios实例
const instance = axios.create({});

/**
 * 请求拦截
 */
instance.interceptors.request.use(
    (config) => {
        // if (pendingRequests.has(config.url)) {
        //     pendingRequests.get(config.url).abort()
        //     pendingRequests.delete(config.url);
        // }
        // // 创建取消函数并存储到 Map 中
        // const controller = new AbortController();
        // config.signal = controller.signal;
        // pendingRequests.set(config.url, controller);
        config.headers["X-TBD-TOKEN"] = sessionStorage.sophon_sessionId || '';
        //菜单code
        
        config.headers['menuCode'] = router.currentRoute.value?.meta?.menuCode ||''
        //应用别名
        config.headers['projectAlias'] = solarPowerSystem

        //语言
        let language = localStorage.localeLang ? JSON.parse(localStorage.getItem('localeLang')).language : import.meta.env.VITE_LOCALE_LANG || 'zhCn'
        if (language === 'zhCn') language = 'zh'
        config.headers['Accept-Language'] = language
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

/**
 * 响应拦截
 */
instance.interceptors.response.use(
    (response) => {
        // 当请求完成时，从 Map 中删除对应的取消函数
        // pendingRequests.delete(response.config.url);
        //内部  请求 || 导出
        if (response.status === 200 && response.data.success || response.status === 200 && response.data.type) {
            let result = response.data; //本地文件的请求
            if (response.data.success) result = response.data.data;
            return Promise.resolve(result);
        } else {
            errorHandle(response.data.error_code, response.data.error_msg);
            return Promise.reject(response)
        }
    },
    (error) => {
        //外部
        let code = dealCode(error.message);
        errorHandle(code);
        return Promise.reject(error);
    }
)

export default instance