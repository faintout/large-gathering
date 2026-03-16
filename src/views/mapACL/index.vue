<template>
  <div class="components-area">
    <div class="title">地图组件 Demo</div>
    <div class="component-name-area">
      <div
        class="btn-item"
        v-for="(item, index) in engineTabs"
        :key="item.value"
        @click="changeEngine(item, index)"
      >
        {{ item.label }}
      </div>
      <div
        class="active-bg"
        :style="{ left: btnActiveIndex * 116 + 12 * (btnActiveIndex + 1) + 'px' }"
      ></div>
    </div>
    <div class="content">
      <div class="map-acl-page">
        <div id="BaseMap" class="map-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: '地图防腐层',
})
import { onBeforeUnmount, onMounted, reactive, ref, shallowRef, toRaw } from 'vue'
import HTMap from './utils/HTMap/index.js'

const mapConfig = reactive({
  engine: 'tencent',
  // engine: 'minemap',
  // engine: 'mapbox', // tencent mapbox minemap
  center: [114.884094, 40.8119],
  zoom: 15,
  minZoom: 3, // 地图最小缩放级别，具体哪个数值生效，是否低于最小值，后面在各自的地图js 里面去设置修改
  maxZoom: 20, // 地图最大缩放级别，具体哪个数值生效，是否高于最小值，后面在各自的地图js 里面去设置修改
  pitch: 0, // 地图俯仰角度,各自地图js中判断是否超出范围，超出去的重新赋一个默认值
  rotation: 0, // 地图旋转角度
  viewMode: '2D', // 2D模式还是3D模式，要是有的地图只有2D，那么在自己的js 里面做限制吧
  styleType: 'black', // 地图样式 black  white 因为咱们项目现在只有这两种，且基本所有地图都得分，所以暂时不管厂商怎么写，公用参数设置为black white
})

const engineTabs = [
  { label: '腾讯地图', value: 'tencent' },
  { label: 'MineMap', value: 'minemap' },
  { label: 'Mapbox', value: 'mapbox' },
]

const btnActiveIndex = ref(0)

const mapInstance = shallowRef(null)

const createMap = () => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }

  // 使用 HTMap.Map 创建地图实例
  // 注意：HTMap.Map 构造函数内部会自动调用 init 并加载对应 SDK
  mapInstance.value = new HTMap.Map('BaseMap', {
    ...toRaw(mapConfig),
  })
}

const changeEngine = (item, index) => {
  btnActiveIndex.value = index
  mapConfig.engine = item.value
  createMap()
}

onMounted(() => {
  createMap()
})

onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
})
</script>

<style scoped lang="scss">
.map-acl-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.map-container {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 360px;
  border-radius: 12px;
  background-color: #020617;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.8);
}
</style>

