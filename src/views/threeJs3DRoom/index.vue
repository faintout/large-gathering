<template>
  <div class="three-room-wrap" ref="rootRef">
    <iframe :src="iframeSrc" frameborder="0" class="three-room-iframe"></iframe>
  </div>
</template>

<script setup>
defineOptions({
  name: 'threeJs打造的3D房间',
})
const iframeSrc = new URL(`./index.html`,import.meta.url)
</script>

<style scoped>
.three-room-wrap {
  width: 100%;
  height: 100%;
}
.three-room-iframe {
  width: 100%;
  height: 100%;
}
</style>
