<template>
  <div class="btn-demo">
    <div class="section">
      <div class="section-title">基础类型</div>
      <div class="row">
        <el-button>Default</el-button>
        <el-button type="primary">Primary</el-button>
        <el-button type="success">Success</el-button>
        <el-button type="info">Info</el-button>
        <el-button type="warning">Warning</el-button>
        <el-button type="danger">Danger</el-button>
      </div>
      <pre class="code"><code>{{ codeBasic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">朴素 / 圆角 / 圆形</div>
      <div class="row">
        <el-button plain>Plain</el-button>
        <el-button type="primary" plain>Primary</el-button>
        <el-button type="success" plain>Success</el-button>
        <el-button type="warning" plain>Warning</el-button>
        <el-button type="danger" plain>Danger</el-button>
      </div>
      <div class="row">
        <el-button round>Round</el-button>
        <el-button type="primary" round>Primary</el-button>
        <el-button type="success" round>Success</el-button>
        <el-button type="warning" round>Warning</el-button>
        <el-button type="danger" round>Danger</el-button>
      </div>
      <div class="row">
        <el-button circle>圆</el-button>
        <el-button type="primary" circle>圆</el-button>
        <el-button type="success" circle>圆</el-button>
        <el-button type="warning" circle>圆</el-button>
        <el-button type="danger" circle>圆</el-button>
      </div>
      <pre class="code"><code>{{ codeShape }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">禁用 / 加载</div>
      <div class="row">
        <el-button disabled>Disabled</el-button>
        <el-button type="primary" disabled>Primary</el-button>
        <el-button type="success" disabled>Success</el-button>
        <el-button type="warning" disabled>Warning</el-button>
        <el-button type="danger" disabled>Danger</el-button>
      </div>
      <div class="row">
        <el-button loading>Loading</el-button>
        <el-button type="primary" loading>Primary</el-button>
        <el-button type="success" loading>Success</el-button>
        <el-button type="warning" loading>Warning</el-button>
        <el-button type="danger" loading>Danger</el-button>
      </div>
      <pre class="code"><code>{{ codeState }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">尺寸</div>
      <div class="row">
        <el-button size="large" type="primary">Large</el-button>
        <el-button size="default" type="primary">Default</el-button>
        <el-button size="small" type="primary">Small</el-button>
      </div>
      <pre class="code"><code>{{ codeSize }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">文字按钮 / 链接按钮</div>
      <div class="row">
        <el-button text>Text</el-button>
        <el-button text type="primary">Text Primary</el-button>
        <el-button text type="danger">Text Danger</el-button>
      </div>
      <div class="row">
        <el-button link>Link</el-button>
        <el-button link type="primary">Link Primary</el-button>
        <el-button link type="success">Link Success</el-button>
        <el-button link type="danger">Link Danger</el-button>
      </div>
      <pre class="code"><code>{{ codeTextLink }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">点击事件（示例）</div>
      <div class="row">
        <el-button type="primary" @click="onClick">点我</el-button>
        <div class="tip">最近一次点击：{{ lastClickText }}</div>
      </div>
      <pre class="code"><code>{{ codeClick }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'Button',
  description: '按钮组件',
})

const lastClickText = ref('暂无')
const onClick = () => {
  lastClickText.value = new Date().toLocaleString()
}

const codeBasic = `<el-button>Default</el-button>
<el-button type="primary">Primary</el-button>
<el-button type="success">Success</el-button>
<el-button type="info">Info</el-button>
<el-button type="warning">Warning</el-button>
<el-button type="danger">Danger</el-button>`

const codeShape = `<el-button plain>Plain</el-button>
<el-button type="primary" plain>Primary</el-button>

<el-button round>Round</el-button>
<el-button type="primary" round>Primary</el-button>

<el-button circle>圆</el-button>
<el-button type="primary" circle>圆</el-button>`

const codeState = `<el-button disabled>Disabled</el-button>
<el-button type="primary" disabled>Primary</el-button>

<el-button loading>Loading</el-button>
<el-button type="primary" loading>Primary</el-button>`

const codeSize = `<el-button size="large" type="primary">Large</el-button>
<el-button size="default" type="primary">Default</el-button>
<el-button size="small" type="primary">Small</el-button>`

const codeTextLink = `<el-button text>Text</el-button>
<el-button text type="primary">Text Primary</el-button>

<el-button link>Link</el-button>
<el-button link type="primary">Link Primary</el-button>`

const codeClick = `<script setup lang="ts">
import { ref } from 'vue'
const lastClickText = ref('暂无')
const onClick = () => {
  lastClickText.value = new Date().toLocaleString()
}
<\/script>

<template>
  <el-button type="primary" @click="onClick">点我</el-button>
  <div>最近一次点击：{{ lastClickText }}</div>
</template>`
</script>
<style scoped lang="scss">
.btn-demo {
  height: 100%;
  box-sizing: border-box;
  padding: 12px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section {
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 12px;
  padding: 12px;
  background: rgba(2, 6, 23, 0.35);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.95);
  margin-bottom: 10px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.row + .row {
  margin-top: 10px;
}

.tip {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.95);
}

.code {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  overflow: auto;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(59, 130, 246, 0.18);
  color: rgba(226, 232, 240, 0.95);
  font-size: 12px;
  line-height: 1.55;
  white-space: pre;
}
</style>