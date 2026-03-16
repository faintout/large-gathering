import { reactive, onMounted, onBeforeUnmount, toRefs, computed,ref } from 'vue'
import { deepMerge, deepClone} from '../utils/toolUtils'
import useScreen from '../hooks/useScreen'
//匹配单词
function matchRegexAndReturn(str, pattern, callback) {
    const regex = new RegExp(`^\\b(${pattern})\\b\\(([^)]+)\\)`);
    if(typeof str !== 'string'){
        return
    }
    const match = str.match(regex);

    if (match) {
        const matchedValue = match[2];
        return callback(matchedValue);
    }
}


export default function () {
    //展示的数据  可以通过App.vue 界面去隐藏
    const {screenW,screenH } = reactive(useScreen())

    //根据指定格式的字符进行替换计算后的值,替换的格式为'w(3)'或'h(3)'
    //eg replaceOptionsSize({value:'w(3)',value2:'h(3)'),
    //return {value:6,value2:6}
    const replaceOptionsSize = (options) => {
        try{
            const clonedObj = deepClone(options); // 克隆对象以避免直接修改原始对象 
            return recursiveReplace(clonedObj);
        }catch(e){
            console.error(e)
            return {series:[]}
        }

    }
    //递归替换指定格式的字符
    const recursiveReplace = (obj,isResize = true) => {
        // 使用闭包
        const replaceWithClosure = (inputObj) => {
            for (let key in inputObj) {
                if (typeof inputObj[key] === 'object') {
                    if (Array.isArray(inputObj[key])) {
                        inputObj[key].forEach((item, index) => {
                            if (typeof item === 'string') {
                                matchRegexAndReturn(item, 'w', value => {
                                    inputObj[key][index] = isResize ? screenW(value) : value;
                                });
                                matchRegexAndReturn(item, 'h', value => {
                                    inputObj[key][index] = isResize ? screenH(value) : value;
                                });
                            } else if (typeof inputObj[key] === 'object') {
                                replaceWithClosure(inputObj[key]); // 递归调用处理嵌套对象
                            }
                        });
                    } else {
                        replaceWithClosure(inputObj[key]); // 递归调用处理嵌套对象
                    }
                } else if (typeof inputObj[key] === 'string') {
                    matchRegexAndReturn(inputObj[key], 'w', value => {
                        inputObj[key] = isResize ? screenW(value) : value;
                    });
                    matchRegexAndReturn(inputObj[key], 'h', value => {
                        inputObj[key] = isResize ? screenH(value) : value;
                    });
                }
            }
            return inputObj; // 返回处理后的对象
        };
    
        return replaceWithClosure(obj); // 调用闭包函数并返回结果
    };
    //现实之后调用 挂载完毕
    onMounted(() => {
    })

    //在隐藏之前调用 卸载之前
    onBeforeUnmount(() => {
    })

    return {
        replaceOptionsSize
    }
}