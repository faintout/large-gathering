<template>
  <div class="upload-demo">
    <div class="section">
      <div class="section-title">基础上传（自定义 http-request：无需后端）</div>
      <div class="row">
        <el-upload
          v-model:file-list="fileListBasic"
          :http-request="fakeUploadRequest"
          :on-success="onSuccess"
          :on-error="onError"
          :on-remove="onRemove"
        >
          <el-button type="primary">选择文件</el-button>
        </el-upload>
        <div class="tip">已选：{{ fileListBasic.length }} 个</div>
      </div>
      <pre class="code"><code>{{ codeBasic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">拖拽上传（drag）</div>
      <div class="row">
        <el-upload
          v-model:file-list="fileListDrag"
          drag
          :http-request="fakeUploadRequest"
          :on-success="onSuccess"
          :on-error="onError"
        >
          <div class="drag-area">
            <div class="drag-title">将文件拖到这里，或点击上传</div>
            <div class="drag-desc">这里只是演示：上传会在前端模拟成功</div>
          </div>
        </el-upload>
      </div>
      <pre class="code"><code>{{ codeDrag }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">限制：数量 / 类型 / 大小（before-upload）</div>
      <div class="row">
        <el-upload
          v-model:file-list="fileListLimit"
          :limit="3"
          :on-exceed="onExceed"
          :before-upload="beforeUpload"
          :http-request="fakeUploadRequest"
          :on-success="onSuccess"
          :on-error="onError"
        >
          <el-button>选择文件（最多 3 个）</el-button>
        </el-upload>
        <div class="tip">仅允许：png/jpg/pdf，且单个 ≤ 2MB</div>
      </div>
      <pre class="code"><code>{{ codeLimit }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">手动上传（auto-upload=false + submit）</div>
      <div class="row">
        <el-upload
          ref="manualRef"
          v-model:file-list="fileListManual"
          :auto-upload="false"
          :http-request="fakeUploadRequest"
          :on-success="onSuccess"
          :on-error="onError"
        >
          <el-button type="primary">选择文件</el-button>
          <template #tip>
            <div class="tip">先选文件，再点击“开始上传”</div>
          </template>
        </el-upload>
      </div>
      <div class="row">
        <el-button type="success" @click="submitManual">开始上传</el-button>
        <el-button @click="clearManual">清空</el-button>
        <div class="tip">已选：{{ fileListManual.length }} 个</div>
      </div>
      <pre class="code"><code>{{ codeManual }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'Upload',
  description: '上传组件（Upload）',
})

const fileListBasic = ref([])
const fileListDrag = ref([])
const fileListLimit = ref([])
const fileListManual = ref([])

const onSuccess = (_res, file) => {
  ElMessage.success(`上传成功：${file?.name || ''}`)
}
const onError = () => {
  ElMessage.error('上传失败')
}
const onRemove = (file) => {
  ElMessage.info(`已移除：${file?.name || ''}`)
}

const onExceed = () => {
  ElMessage.warning('超出数量限制：最多 3 个文件')
}

const beforeUpload = (rawFile) => {
  const allowTypes = ['image/png', 'image/jpeg', 'application/pdf']
  const isAllowed = allowTypes.includes(rawFile.type)
  if (!isAllowed) {
    ElMessage.error('文件类型不支持：仅 png/jpg/pdf')
    return false
  }
  const isLt2M = rawFile.size / 1024 / 1024 <= 2
  if (!isLt2M) {
    ElMessage.error('文件过大：单个文件需 ≤ 2MB')
    return false
  }
  return true
}

// 关键点：用 http-request 模拟上传，避免依赖后端接口
const fakeUploadRequest = (options) => {
  const { file, onProgress, onSuccess: success, onError: error } = options
  let aborted = false
  let percent = 0

  const progressTimer = setInterval(() => {
    if (aborted) return
    percent = Math.min(100, percent + 20)
    onProgress?.({ percent })
    if (percent >= 100) clearInterval(progressTimer)
  }, 120)

  const doneTimer = setTimeout(() => {
    if (aborted) return
    clearInterval(progressTimer)
    success?.({ ok: true, name: file?.name }, file)
  }, 750)

  return {
    abort() {
      aborted = true
      clearInterval(progressTimer)
      clearTimeout(doneTimer)
      error?.(new Error('aborted'))
    },
  }
}

const manualRef = ref()
const submitManual = () => {
  manualRef.value?.submit?.()
}
const clearManual = () => {
  manualRef.value?.clearFiles?.()
  fileListManual.value = []
}

const codeBasic = `<el-upload
  v-model:file-list="fileList"
  :http-request="fakeUploadRequest"
  :on-success="onSuccess"
>
  <el-button type="primary">选择文件</el-button>
</el-upload>`

const codeDrag = `<el-upload
  v-model:file-list="fileList"
  drag
  :http-request="fakeUploadRequest"
>
  <div>将文件拖到这里，或点击上传</div>
</el-upload>`

const codeLimit = `<el-upload
  v-model:file-list="fileList"
  :limit="3"
  :on-exceed="onExceed"
  :before-upload="beforeUpload"
  :http-request="fakeUploadRequest"
>
  <el-button>选择文件（最多 3 个）</el-button>
</el-upload>`

const codeManual = `<el-upload
  ref="uploadRef"
  v-model:file-list="fileList"
  :auto-upload="false"
  :http-request="fakeUploadRequest"
>
  <el-button type="primary">选择文件</el-button>
</el-upload>

<el-button type="success" @click="uploadRef.submit()">开始上传</el-button>`
</script>

<style scoped lang="scss">
.upload-demo {
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

.drag-area {
  padding: 18px 10px;
  color: rgba(226, 232, 240, 0.95);
}

.drag-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.drag-desc {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.95);
}
</style>

