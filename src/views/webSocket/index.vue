<template>
  <div class="ws-page">
    <section class="ws-page__intro">
      <h2 class="ws-page__title">WebSocket 工具使用说明</h2>
      <p class="ws-page__text">
        本页演示如何使用 <code>socketUtils.js</code> 封装的 <code>socketUtil</code> 类，完成 WebSocket 连接、心跳保活、消息接收与发送。
      </p>
      <ul class="ws-page__list">
        <li>自动连接指定 WebSocket 地址</li>
        <li>内置 10 秒心跳，断线自动重连</li>
        <li>支持 <code>onopen</code>、<code>onmessage</code>、<code>onerror</code>、<code>onclose</code> 四类回调</li>
        <li>提供 <code>sendSocketMsg</code> 发送 JSON 消息，<code>destroy/close</code> 手动关闭连接</li>
      </ul>
    </section>

    <section class="ws-page__demo">
      <h3 class="ws-page__subtitle">在线 Demo</h3>

      <div class="ws-page__form">
        <el-input
          v-model="wsUrl"
          placeholder="例如：ws://localhost:8080/ws 或 wss://example.com/socket"
          clearable
          class="ws-page__input"
        />
        <el-button type="primary" @click="handleConnect" :disabled="isConnected">
          {{ isConnected ? '已连接' : '连接' }}
        </el-button>
        <el-button @click="handleClose" :disabled="!isConnected">断开</el-button>
      </div>

      <div class="ws-page__form ws-page__form--send">
        <el-input
          v-model="sendText"
          placeholder='发送 JSON 消息，例如：{"type":"ping"}'
          clearable
          class="ws-page__input"
        />
        <el-button type="success" @click="handleSend" :disabled="!isConnected">
          发送
        </el-button>
      </div>

      <div class="ws-page__status">
        <span class="ws-page__status-dot" :class="{ 'is-on': isConnected }"></span>
        <span>{{ isConnected ? '已连接' : '未连接' }}</span>
      </div>

      <div class="ws-page__log">
        <div class="ws-page__log-header">
          消息日志
          <el-button text type="primary" size="small" @click="logs = []">清空</el-button>
        </div>
        <div class="ws-page__log-body">
          <div
            v-for="(item, index) in logs"
            :key="index"
            class="ws-page__log-item"
            :class="`ws-page__log-item--${item.type}`"
          >
            <span class="ws-page__log-tag">{{ item.type }}</span>
            <span class="ws-page__log-time">{{ item.time }}</span>
            <span class="ws-page__log-text">{{ item.text }}</span>
          </div>
          <div v-if="!logs.length" class="ws-page__log-empty">暂无日志</div>
        </div>
      </div>
    </section>

    <section class="ws-page__code">
      <h3 class="ws-page__subtitle">核心使用代码示例</h3>
      <pre class="ws-page__code-block">
import socketUtil from './socketUtils'

const socket = new socketUtil('ws://your-server')

socket.onopen = () => {
  console.log('socket 已连接')
}

socket.onmessage = (data) => {
  console.log('收到消息', data)
}

socket.onerror = (e) => {
  console.error('socket 出错', e)
}

socket.onclose = () => {
  console.log('socket 已关闭')
}

socket.sendSocketMsg({ type: 'ping' })

// 组件卸载前
socket.destroy()</pre>
    </section>
  </div>
</template>

<script setup>
defineOptions({
  name: 'webSocket增强插件',
})
import { ref, onBeforeUnmount } from 'vue'
import socketUtil from './socketUtils'

const wsUrl = ref('ws://139.9.106.182:8080?roomId=12580')
const sendText = ref('')
const logs = ref([])
const isConnected = ref(false)
let socket = null

const pushLog = (type, text) => {
  logs.value.unshift({
    type,
    text,
    time: new Date().toLocaleTimeString(),
  })
}

const handleConnect = () => {
  if (!wsUrl.value) {
    pushLog('error', '请输入 WebSocket 地址')
    return
  }

  if (socket) {
    socket.destroy()
    socket = null
  }

  socket = new socketUtil(wsUrl.value)

  socket.onopen = () => {
    isConnected.value = true
    pushLog('system', '连接成功')
  }

  socket.onmessage = (data) => {
    pushLog('recv', JSON.stringify(data))
  }

  socket.onerror = (e) => {
    pushLog('error', e?.message || '连接出错')
  }

  socket.onclose = () => {
    isConnected.value = false
    pushLog('system', '连接已关闭')
  }
}

const handleSend = () => {
  if (!socket || !isConnected.value) {
    pushLog('error', '尚未连接 WebSocket')
    return
  }

  if (!sendText.value) {
    pushLog('error', '发送内容不能为空')
    return
  }

  try {
    const json = JSON.parse(sendText.value)
    socket.sendSocketMsg(json)
    pushLog('send', JSON.stringify(json))
  } catch (e) {
    pushLog('error', '发送内容必须是合法的 JSON 字符串')
  }
}

const handleClose = () => {
  if (socket) {
    socket.destroy()
    socket = null
    isConnected.value = false
    pushLog('system', '已手动断开连接')
  }
}

onBeforeUnmount(() => {
  if (socket) {
    socket.destroy()
    socket = null
  }
})
</script>

<style scoped lang="scss">
.ws-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #e6edf7;
}

.ws-page__intro {
  padding: 12px 14px;
  border-radius: 10px;
  background: radial-gradient(circle at top, rgba(30, 64, 175, 0.35), rgba(15, 23, 42, 0.95));
  box-shadow: inset 0 0 0 1px rgba(55, 65, 81, 0.8);
}

.ws-page__title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
}

.ws-page__text {
  margin: 0 0 6px;
  font-size: 13px;
  color: #cbd5f5;
}

.ws-page__list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #9ca3af;
}

.ws-page__demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ws-page__subtitle {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.ws-page__form {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ws-page__form--send {
  margin-top: 4px;
}

.ws-page__input {
  flex: 1;
}

.ws-page__status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.ws-page__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4b5563;
}

.ws-page__status-dot.is-on {
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.8);
}

.ws-page__log {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.9);
  box-shadow: inset 0 0 0 1px rgba(31, 41, 55, 0.8);
  display: flex;
  flex-direction: column;
}

.ws-page__log-header {
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  border-bottom: 1px solid rgba(55, 65, 81, 0.8);
}

.ws-page__log-body {
  flex: 1;
  padding: 6px 10px;
  max-height: 260px;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 12px;
}

.ws-page__log-item {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 6px;
  align-items: center;
  padding: 4px 0;
}

.ws-page__log-item--send .ws-page__log-tag {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.ws-page__log-item--recv .ws-page__log-tag {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

.ws-page__log-item--error .ws-page__log-tag {
  background: rgba(248, 113, 113, 0.15);
  color: #f97373;
}

.ws-page__log-item--system .ws-page__log-tag {
  background: rgba(148, 163, 184, 0.15);
  color: #e5e7eb;
}

.ws-page__log-tag {
  padding: 2px 6px;
  border-radius: 999px;
}

.ws-page__log-time {
  color: #6b7280;
}

.ws-page__log-text {
  color: #e5e7eb;
  word-break: break-all;
}

.ws-page__log-empty {
  padding: 8px 0;
  text-align: center;
  color: #6b7280;
}
</style>
