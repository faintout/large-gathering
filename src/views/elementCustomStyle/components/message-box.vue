<template>
  <div class="mb-demo">
    <div class="section">
      <div class="section-title">Alert（提示）</div>
      <div class="row">
        <el-button type="primary" @click="openAlert">打开 Alert</el-button>
      </div>
      <pre class="code"><code>{{ codeAlert }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">Confirm（确认）</div>
      <div class="row">
        <el-button type="warning" @click="openConfirm">打开 Confirm</el-button>
        <div class="tip">结果：{{ lastResult }}</div>
      </div>
      <pre class="code"><code>{{ codeConfirm }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">Prompt（输入）</div>
      <div class="row">
        <el-button type="success" @click="openPrompt">打开 Prompt</el-button>
        <div class="tip">输入：{{ lastPrompt || '（无）' }}</div>
      </div>
      <pre class="code"><code>{{ codePrompt }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">自定义配置（按钮文案 / 类型 / 可拖拽）</div>
      <div class="row">
        <el-button @click="openCustom">打开自定义</el-button>
      </div>
      <pre class="code"><code>{{ codeCustom }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({
  name: 'MessageBox',
  description: '消息弹框（MessageBox）',
})

const lastResult = ref('暂无')
const lastPrompt = ref('')

const openAlert = async () => {
  await ElMessageBox.alert('这是一条提示内容', '提示', {
    confirmButtonText: '我知道了',
    type: 'info',
  })
}

const openConfirm = async () => {
  try {
    await ElMessageBox.confirm('确定要执行这个操作吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      closeOnClickModal: false,
    })
    lastResult.value = '已确认'
    ElMessage.success('已确认')
  } catch {
    lastResult.value = '已取消'
    ElMessage.info('已取消')
  }
}

const openPrompt = async () => {
  try {
    const res = await ElMessageBox.prompt('请输入一个名称', '输入', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '例如：楠哥',
      inputPattern: /^.{1,20}$/,
      inputErrorMessage: '请输入 1-20 个字符',
    })
    lastPrompt.value = res.value
    ElMessage.success(`已输入：${res.value}`)
  } catch {
    ElMessage.info('已取消输入')
  }
}

const openCustom = async () => {
  try {
    await ElMessageBox.confirm('支持自定义按钮文案、类型、以及可拖拽。', '自定义', {
      confirmButtonText: '继续',
      cancelButtonText: '返回',
      type: 'success',
      draggable: true,
      showClose: true,
    })
    ElMessage.success('继续')
  } catch {
    ElMessage.info('返回')
  }
}

const codeAlert = `import { ElMessageBox } from 'element-plus'

await ElMessageBox.alert('这是一条提示内容', '提示', {
  confirmButtonText: '我知道了',
  type: 'info',
})`

const codeConfirm = `import { ElMessage, ElMessageBox } from 'element-plus'

try {
  await ElMessageBox.confirm('确定要执行这个操作吗？', '确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    closeOnClickModal: false,
  })
  ElMessage.success('已确认')
} catch {
  ElMessage.info('已取消')
}`

const codePrompt = `import { ElMessage, ElMessageBox } from 'element-plus'

try {
  const res = await ElMessageBox.prompt('请输入一个名称', '输入', {
    inputPlaceholder: '例如：楠哥',
    inputPattern: /^.{1,20}$/,
    inputErrorMessage: '请输入 1-20 个字符',
  })
  ElMessage.success(\`已输入：\${res.value}\`)
} catch {
  ElMessage.info('已取消输入')
}`

const codeCustom = `await ElMessageBox.confirm('支持自定义按钮文案、类型、以及可拖拽。', '自定义', {
  confirmButtonText: '继续',
  cancelButtonText: '返回',
  type: 'success',
  draggable: true,
  showClose: true,
})`
</script>

<style scoped lang="scss">
.mb-demo {
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

