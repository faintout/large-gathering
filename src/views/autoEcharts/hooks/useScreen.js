import { reactive, onMounted, onBeforeUnmount, toRefs ,computed} from 'vue'
import {debounce} from '../utils/toolUtils.js'
const screenBaseWH = {
    width:1920,
    height:1080
}
export default function () {
    //展示的数据  可以通过App.vue 界面去隐藏
    const state = reactive({
        clientWidth : window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        clientHeight : window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    })
    const clientHeight = computed(()=>state.clientHeight)
    const clientWidth = computed(()=>state.clientWidth)

    const screenH = (px,screenHeight = screenBaseWH.height)=>{
        return clientHeight.value / (screenHeight / px)
    }
    const screenW = (px,screenWidth = screenBaseWH.width)=>{
        return clientWidth.value / (screenWidth / px)
    }

    const screenChange = ()=>{
        state.clientWidth =  window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        state.clientHeight =  window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    }
    //现实之后调用 挂载完毕
    onMounted(() => {
        window.addEventListener('resize',debounce(screenChange,300))
    })

    //在隐藏之前调用 卸载之前
    onBeforeUnmount(() => {
        window.removeEventListener('resize',screenChange)
    })

    return {
        ...toRefs(state),
        screenW,
        screenH,
    }
}