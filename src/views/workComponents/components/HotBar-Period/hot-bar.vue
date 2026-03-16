<template>
    <div class="hot-bar">
        <div class="time-gap-area">
            <div class="time-gap-item" v-for="(item, index) in hotTimeList.filter((item,index)=>index%4===0)" :key="item.potStartTime">
                <div class="time">{{ item.potStartTime }}</div>
                <div class="gap"></div>
            </div>
            <div class="time-gap-item">
                <div class="time">{{ hotTimeList[hotTimeList.length - 1].potEndTime }}</div>
                <div class="gap"></div>
            </div>
        </div>
        <div class="color-box">
            <div class="color-line" :style="{ background: generateGradient() }" ref="colorLineRef"
                @mousedown="handleMousedown">
                <el-tooltip ref="toolTipRef" manual :visible="toolTipVisible" :stop-popper-mouse-event="false"
                :content="hotTimeList[positionIndex]?.potStartTime + ' - ' + hotTimeList[positionIndex]?.potEndTime"
                >
                    <div @mouseenter="!mouseMove && displayTooltip()" @mouseleave="!mouseMove && hideTooltip()"
                        :style="{ left: positionIndex * step + '%', width: step + '%'}" class="handle-bar-icon" >
                        <div class="left"></div>
                        <div class="center"></div>
                        <div class="right"></div>
                    </div>
                </el-tooltip>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { debounce, getColorAtPercentage } from '../../utils/toolUtils'
const emits = defineEmits(['handleCompleteIndex'])
const props = defineProps({
    hotTimeList: {
        type: Array,
        default: () => []
    }
})
//提示ref
const toolTipRef = ref(null)
//颜色条ref
const colorLineRef = ref(null)
// 当前的索引
const positionIndex = ref(0)
// 提示是否显示
const toolTipVisible = ref(false)
// 设置移动的步数
const step = computed(() => 100 / (props.hotTimeList.length))
// 鼠标是否按下
const mouseDown = ref(false)
// 鼠标是否移动
const mouseMove = ref(false)
//鼠标落下事件
const handleMousedown = (e) => {
    mouseDown.value = true
    window.addEventListener('mousemove', onDragging)
    window.addEventListener('mouseup', onMouseUp)
    setPosition(e)
}
//鼠标移动事件
const onDragging = (e) => {
    // 拖动中的数据
    if (!mouseDown.value) {
        return
    }
    mouseMove.value = true
    setPosition(e)
}
const generateGradient = () => {
    const maxValue = Math.max(...props.hotTimeList.map(hotTime => hotTime.arrivedFlow));
    const colors = props.hotTimeList.map((hotTime, i) => {
        // 计算当前的百分比
        const percentage = (hotTime.arrivedFlow / maxValue) * 100;
        // 根据百分比计算颜色
        const color = getColorAtPercentage(percentage);
        // 计算当前的进度
        const progress = i / (props.hotTimeList.length - 1) * 100
        return `${color} ${progress}%`;
    });
    return `linear-gradient(to right, ${colors.join(', ')})`;
}
//设置当前的位置
const setPosition = async (event) => {
    const { clientX } = event
    const { left, width } = colorLineRef.value.getBoundingClientRect()
    let positionValue = (clientX - left) / width * 100
    positionValue = Math.max(0, Math.min(positionValue, 99))
    //计算当前的步数索引
    const stepIndex = Math.round(positionValue / step.value)
    positionIndex.value = stepIndex
    await nextTick()
    displayTooltip()
    toolTipRef.value?.updatePopper()
}
const updateHotBarIndex = (index)=>{
    positionIndex.value = index
}
const displayTooltip = debounce(() => {
    toolTipVisible.value = true
}, 50)

const hideTooltip = debounce(() => {
    toolTipVisible.value = false
}, 50)
// 鼠标抬起事件
const onMouseUp = (e) => {
    mouseDown.value = false
    mouseMove.value = false
    hideTooltip()
    emits('handleCompleteIndex', positionIndex.value)
    window.removeEventListener('mousemove', onDragging)
    window.removeEventListener('mouseup', onMouseUp)
}
defineExpose({
    updateHotBarIndex
})
</script>
<style scoped lang="scss">
.hot-bar {
    flex: 1;

    &>.time-gap-area {
        height: pxTvh(32);
        display: flex;
        justify-content: space-between;
        margin-bottom: pxTvh(2);

        &>.time-gap-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;

            &>.time {
                // height: pxTvh(26);
                margin-top: pxTvh(6);
                @include computed_font(14);
                font-family: PingFang SC, PingFang SC;
                font-weight: 400;
                color: #6B85BC;
                @include textHeight(20);
            }

            &>.gap {
                width: pxTvw(1);
                height: pxTvh(5);
                background: rgba(187, 198, 227, 0.5);
            }
        }
    }


    &>.color-box {
        width: 100%;
        height: pxTvh(40);
        background-color: #1d356a;
        display: flex;
        justify-content: center;
        align-items: center;

        &>.color-line {
            width: calc(100% - #{pxTvw(36)});
            height: pxTvh(24);
            border-radius: pxTvw(4);
            position: relative;
            // background: linear-gradient(270deg, rgba(30, 204, 153, 0.9) 0%, rgba(255, 179, 0, 0.94) 7%, #FF6853 16%, rgba(255, 179, 0, 0.94) 24%, rgba(30, 204, 153, 0.9) 35%, rgba(255, 179, 0, 0.94) 43%, rgba(30, 204, 153, 0.9) 51%, #FF6853 56%, rgba(255, 179, 0, 0.94) 64%, rgba(30, 204, 153, 0.9) 74%, rgba(255, 179, 0, 0.94) 83%, #FF6853 89%, rgba(255, 179, 0, 0.94) 95%, rgba(30, 204, 153, 0.9) 100%);
            cursor: pointer;
            display: flex;
            animation: gradientAnimation 3s ease infinite;
            @keyframes gradientAnimation {
                0% {
                    background-position: 0% 50%;
                }
                50% {
                    background-position: 100% 50%;
                }
                100% {
                    background-position: 0% 50%;
                }
            }

            &>.handle-bar-icon {
                // background: url('@/assets/img/other/icon/handle-bar-icon.png') no-repeat;
                background-size: 100%;
                // width: pxTvw(5);
                height: pxTvh(48);
                transform: translate(pxTvw(-2.5), -50%);
                position: absolute;
                top: 35%;
                cursor: pointer;
                user-select: none;
                &>.left{
                    width: pxTvw(5);
                    height: pxTvh(48);
                    background: url('./assets/handle-bar-icon.png') no-repeat;
                    background-size: 100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                    z-index: 1;
                }
                &>.center{
                    width: 100%;
                    height: pxTvh(40);
                    background: #4B98FA;
                    opacity: 0.5;
                    background-size: 100%;
                    position: absolute;
                    left: calc(50% - #{pxTvw(-2.5)});
                    bottom: 0;
                    transform: translateX(-50%);
                }
                &>.right{
                    width: pxTvw(5);
                    height: pxTvh(48);
                    background: url('./assets/handle-bar-icon.png') no-repeat;
                    background-size: 100%;
                    position: absolute;
                    right: pxTvw(-5);
                    top: 0;
                    z-index: 1;
                }
            }
        }
    }
}
</style>