<template>
  <div class="noti-demo">
    <div class="section">
      <div class="section-title">基础 Notification</div>
      <div class="row">
        <el-button type="primary" @click="openBasic">打开</el-button>
      </div>
      <pre class="code"><code>{{ codeBasic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">不同类型（success / warning / info / error）</div>
      <div class="row">
        <el-button type="success" @click="openType('success')">Success</el-button>
        <el-button type="warning" @click="openType('warning')">Warning</el-button>
        <el-button type="info" @click="openType('info')">Info</el-button>
        <el-button type="danger" @click="openType('error')">Error</el-button>
      </div>
      <pre class="code"><code>{{ codeTypes }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">自动关闭 / 手动关闭 / 自定义时长</div>
      <div class="row">
        <el-button @click="openDuration(1500)">1.5s 自动关闭</el-button>
        <el-button @click="openDuration(0)">不自动关闭</el-button>
        <el-button type="primary" @click="closeAll">关闭全部</el-button>
      </div>
      <pre class="code"><code>{{ codeDuration }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">位置（position）</div>
      <div class="row">
        <el-button @click="openPosition('top-right')">top-right</el-button>
        <el-button @click="openPosition('top-left')">top-left</el-button>
        <el-button @click="openPosition('bottom-right')">bottom-right</el-button>
        <el-button @click="openPosition('bottom-left')">bottom-left</el-button>
      </div>
      <pre class="code"><code>{{ codePosition }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">HTML 内容（dangerouslyUseHTMLString）</div>
      <div class="row">
        <el-button type="warning" @click="openHtml">打开</el-button>
      </div>
      <pre class="code"><code>{{ codeHtml }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ElNotification } from 'element-plus'

defineOptions({
  name: 'Notification',
  description: '通知（Notification）',
})

const openBasic = () => {
  ElNotification({
    title: '提示',
    message: '这是一条基础通知',
  })
}

const openType = (type) => {
  ElNotification({
    title: '状态',
    message: `这是一条 ${type} 通知`,
    type,
  })
}

const openDuration = (duration) => {
  ElNotification({
    title: '时长',
    message: duration === 0 ? '不会自动关闭（duration=0）' : `将于 ${duration}ms 后关闭`,
    duration,
    showClose: true,
  })
}

const closeAll = () => {
  ElNotification.closeAll()
}

const openPosition = (position) => {
  ElNotification({
    title: '位置',
    message: `当前 position：${position}`,
    position,
  })
}

const openHtml = () => {
  ElNotification({
    title: 'HTML',
    dangerouslyUseHTMLString: true,
    message:
      '<div style="font-size:12px;line-height:1.6;">支持 <b>HTML</b> 内容，但要注意 XSS 风险。</div>',
    type: 'warning',
  })
}

const codeBasic = `import { ElNotification } from 'element-plus'

ElNotification({
  title: '提示',
  message: '这是一条基础通知',
})`

const codeTypes = `ElNotification({ title: '状态', message: 'success', type: 'success' })
ElNotification({ title: '状态', message: 'warning', type: 'warning' })
ElNotification({ title: '状态', message: 'info', type: 'info' })
ElNotification({ title: '状态', message: 'error', type: 'error' })`

const codeDuration = `ElNotification({
  title: '时长',
  message: '1.5s 自动关闭',
  duration: 1500,
  showClose: true,
})

ElNotification({
  title: '时长',
  message: '不自动关闭',
  duration: 0,
})`

const codePosition = `ElNotification({ title: '位置', message: 'top-right', position: 'top-right' })
ElNotification({ title: '位置', message: 'top-left', position: 'top-left' })
ElNotification({ title: '位置', message: 'bottom-right', position: 'bottom-right' })
ElNotification({ title: '位置', message: 'bottom-left', position: 'bottom-left' })`

const codeHtml = `ElNotification({
  title: 'HTML',
  dangerouslyUseHTMLString: true,
  message: '<b>HTML</b> 内容（注意 XSS）',
  type: 'warning',
})`
</script>

<style scoped lang="scss">
.noti-demo {
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

