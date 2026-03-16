<template>
  <div class="volume-pillar-wrap">
    <div class="box">
      <div class="canvas_area" id="canvasArea"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import VolumePillar from './volumePillar.js'
defineOptions({
  name: '音量柱状图',
})
onMounted(async () => {
  await nextTick()
  const volumePillar = new VolumePillar('canvasContent', 'canvasArea', ['rgb(0,128,0)', 'rgb(255,255,0)', 'rgb(255,0,0)'], -54, 20, 50)
  setInterval(() => {
    let val = Math.floor(Math.random() * -96 + 1)
    console.log('val', val);
    volumePillar._setVolumeVal([val])
  }, 50)
})
</script>

<style scoped>
.box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 800px;
  transform: translate(-50%, -50%);
  height: 30px;
  border: 1px solid #fff;
  padding: 20px;
}


.canvas_area {
  width: 100%;
  /* height: 40%; */
  height: 30px;
  /* background-color: #000; */
  background-image: linear-gradient(90deg, rgba(0, 128, 0, .3), rgba(255, 255, 0, .3), rgba(255, 0, 0, .3));
  position: relative;
}
</style>