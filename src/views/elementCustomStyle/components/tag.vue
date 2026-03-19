<template>
  <div class="tag-demo">
    <div class="section">
      <div class="section-title">基础类型</div>
      <div class="row">
        <el-tag>Default</el-tag>
        <el-tag type="success">Success</el-tag>
        <el-tag type="info">Info</el-tag>
        <el-tag type="warning">Warning</el-tag>
        <el-tag type="danger">Danger</el-tag>
      </div>
      <pre class="code"><code>{{ codeBasic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">effect（主题/朴素/暗色）</div>
      <div class="row">
        <el-tag effect="dark" type="primary">dark</el-tag>
        <el-tag effect="plain" type="primary">plain</el-tag>
        <el-tag effect="light" type="primary">light</el-tag>
      </div>
      <pre class="code"><code>{{ codeEffect }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">可关闭（closable）</div>
      <div class="row">
        <el-tag closable @close="onCloseOnce">可关闭</el-tag>
        <div class="tip">关闭次数：{{ closeCount }}</div>
      </div>
      <pre class="code"><code>{{ codeClosable }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">尺寸（size）</div>
      <div class="row">
        <el-tag size="large" type="success">Large</el-tag>
        <el-tag size="default" type="success">Default</el-tag>
        <el-tag size="small" type="success">Small</el-tag>
      </div>
      <pre class="code"><code>{{ codeSize }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">动态标签（新增/删除）</div>
      <div class="row">
        <el-tag
          v-for="tag in dynamicTags"
          :key="tag"
          closable
          type="info"
          @close="removeTag(tag)"
        >
          {{ tag }}
        </el-tag>

        <el-input
          v-if="inputVisible"
          ref="inputRef"
          v-model="inputValue"
          size="small"
          placeholder="输入后回车"
          class="tag-input"
          @keyup.enter="confirmInput"
          @blur="confirmInput"
        />
        <el-button v-else size="small" @click="showInput">+ New Tag</el-button>
      </div>
      <pre class="code"><code>{{ codeDynamic }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'

defineOptions({
  name: 'Tag',
  description: '标签组件',
})

const closeCount = ref(0)
const onCloseOnce = () => {
  closeCount.value += 1
}

const dynamicTags = ref(['Vue', 'ElementPlus', 'Vite'])
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

const removeTag = (tag) => {
  dynamicTags.value = dynamicTags.value.filter((t) => t !== tag)
}

const showInput = async () => {
  inputVisible.value = true
  await nextTick()
  inputRef.value?.focus?.()
}

const confirmInput = () => {
  const v = inputValue.value.trim()
  if (v && !dynamicTags.value.includes(v)) dynamicTags.value.push(v)
  inputVisible.value = false
  inputValue.value = ''
}

const codeBasic = `<el-tag>Default</el-tag>
<el-tag type="success">Success</el-tag>
<el-tag type="info">Info</el-tag>
<el-tag type="warning">Warning</el-tag>
<el-tag type="danger">Danger</el-tag>`

const codeEffect = `<el-tag effect="dark" type="primary">dark</el-tag>
<el-tag effect="plain" type="primary">plain</el-tag>
<el-tag effect="light" type="primary">light</el-tag>`

const codeClosable = `<el-tag closable @close="onClose">可关闭</el-tag>`

const codeSize = `<el-tag size="large" type="success">Large</el-tag>
<el-tag size="default" type="success">Default</el-tag>
<el-tag size="small" type="success">Small</el-tag>`

const codeDynamic = `<el-tag v-for="tag in tags" :key="tag" closable @close="remove(tag)">
  {{ tag }}
</el-tag>

<el-input
  v-if="inputVisible"
  v-model="inputValue"
  size="small"
  @keyup.enter="confirmInput"
  @blur="confirmInput"
/>
<el-button v-else size="small" @click="showInput">+ New Tag</el-button>`
</script>

<style scoped lang="scss">
.tag-demo {
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

.tag-input {
  width: 160px;
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

