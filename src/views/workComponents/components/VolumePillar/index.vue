<template>
    <div class="volume-pillar-wrap" ref="rootRef">
      <iframe :src="iframeSrc" frameborder="0" class="volume-pillar-iframe"></iframe>
    </div>
  </template>
  
  <script setup>
  defineOptions({
    name: '音量柱状图',
  })
  const iframeSrc = new URL(`./Demo/index.html`,import.meta.url)
  </script>
  
  <style scoped>
  .volume-pillar-wrap {
    width: 100%;
    height: 100%;
  }
  .volume-pillar-iframe {
    width: 100%;
    height: 100%;
  }
  </style>
  