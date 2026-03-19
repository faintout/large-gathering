<template>
    <div class="components-area">
      <div class="title">组件记录</div>
      <div class="component-name-area" ref="tabContainerRef">
        <div class="btn-item" :class="{ active: btnActiveIndex === index }" @click="changeBtnValue(btn, index)" v-for="(btn, index) in componentsList" :key="btn.moduleName" :ref="(el) => setBtnRef(el, index)">
          {{ btn.moduleName }}</div>
        <div class="active-bg" :style="{ 'left': (btnActiveIndex) * 116 + 12 * (btnActiveIndex +1) + 'px' }"></div>
      </div>
      <div class="content">
        <component :is="activeComponent"></component>
      </div>
    </div>
  </template>
  <script setup>
  defineOptions({
    name: 'Element Custom Style',
    description:'饿了么组件库样式修改'
  })
  import { ref, computed, nextTick, watch, onMounted } from 'vue'
  import { componentsList } from './components/index.js'
  const btnActiveIndex = ref(0)
  const tabContainerRef = ref(null)
  const btnRefList = ref([])
  
  const activeComponent = computed(
    () => componentsList[btnActiveIndex.value]?.moduleConfig
  )
  
  const changeBtnValue = (btn, index) => {
    btnActiveIndex.value = index
  }

  const setBtnRef = (el, index) => {
    if (!el) return
    btnRefList.value[index] = el
  }

  const syncTabScrollToActive = () => {
    const container = tabContainerRef.value
    const activeBtn = btnRefList.value[btnActiveIndex.value]
    if (!container || !activeBtn) return

    const visibleLeft = container.scrollLeft
    const visibleWidth = container.clientWidth
    const visibleRight = visibleLeft + visibleWidth
    const itemLeft = activeBtn.offsetLeft
    const itemRight = itemLeft + activeBtn.offsetWidth

    // 提前触发：当按钮进入可视区左/右 1/3 阈值，就自动跟随滚动
    const leftTrigger = visibleLeft + visibleWidth / 3
    const rightTrigger = visibleRight - visibleWidth / 3
    const needScrollLeft = itemLeft < leftTrigger
    const needScrollRight = itemRight > rightTrigger
    if (!needScrollLeft && !needScrollRight) return

    let target = visibleLeft
    if (needScrollRight) {
      target = itemRight - (visibleWidth * 2) / 3
    } else if (needScrollLeft) {
      target = itemLeft - visibleWidth / 3
    }
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth)
    container.scrollTo({
      left: Math.min(Math.max(target, 0), maxScroll),
      behavior: 'smooth',
    })
  }

  watch(btnActiveIndex, async () => {
    await nextTick()
    syncTabScrollToActive()
  })

  onMounted(async () => {
    await nextTick()
    syncTabScrollToActive()
  })
  </script>
  
  <style lang="scss">
  body:has(.components-area) {
    overflow: hidden;
  }
  
  .components-area {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    // min-height: 100vh;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: radial-gradient(circle at top left, #122b57 0%, #050816 55%, #020308 100%);
    border-radius: 16px;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
    border: 1px solid rgba(117, 160, 255, 0.25);
    overflow: hidden;
  }
  
  .components-area>.title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #f5f7ff;
  }
  
  .components-area>.title::before {
    content: "";
    width: 4px;
    height: 18px;
    border-radius: 999px;
    background: linear-gradient(180deg, #3b82ff 0%, #4adeff 100%);
  }
  
  .components-area>.component-name-area {
    width: 100%;
    display: inline-flex;
    align-items: center;
    position: relative;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.35);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .components-area>.component-name-area::-webkit-scrollbar {
    display: none;
  }
  
  .components-area .btn-item {
    overflow: hidden;
    box-sizing: border-box;
    flex-shrink: 0;
    width: 128px;
    height: 32px;
    // padding: 0 12px;
    padding-left: 12px;
    padding-right: 12px;
    position: relative;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 30px;
    font-size: 13px;
    color: #9ca9c8;
    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      transform 0.12s ease;
    user-select: none;
  }
  
  .components-area .btn-item:hover {
    color: #e5edff;
    background-color: rgba(37, 99, 235, 0.12);
  }
  
  .components-area .active-bg {
    position: absolute;
    bottom: 0;
    width: 104px;
    height: 2px;
    border-radius: 30px;
    background: linear-gradient(90deg, #60a5fa 0%, #a855f7 100%);
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.25);
    z-index: 2;
    transition: all 200ms ease;
  }
  
  .components-area .active {
    color: #f9fbff;
    font-weight: 500;
    background-color: rgba(37, 99, 235, 0.18);
  }
  
  .components-area>.content {
    flex: 1;
    margin-top: 8px;
    border-radius: 16px;
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 1) 40%, rgba(15, 23, 42, 1) 100%);
    box-shadow: inset 0 0 0 1px rgba(30, 64, 175, 0.75);
    padding: 16px;
    overflow: hidden;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }
  
  .components-area>.content>* {
    box-sizing: border-box;
    flex: 1;
    width: 100%;
    height: 100%;
  }
  </style>