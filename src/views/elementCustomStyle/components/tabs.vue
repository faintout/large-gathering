<template>
  <div class="tabs-demo">
    <div class="section">
      <div class="section-title">基础 Tabs</div>
      <div class="row">
        <el-tabs v-model="activeBase">
          <el-tab-pane label="用户管理" name="user">
            <div class="pane">这里是用户管理内容</div>
          </el-tab-pane>
          <el-tab-pane label="配置管理" name="config">
            <div class="pane">这里是配置管理内容</div>
          </el-tab-pane>
          <el-tab-pane label="角色管理" name="role">
            <div class="pane">这里是角色管理内容</div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <pre class="code"><code>{{ codeBasic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">卡片风格（type=card / border-card）</div>
      <div class="row">
        <div class="half">
          <div class="sub-title">card</div>
          <el-tabs v-model="activeCard" type="card">
            <el-tab-pane label="Tab A" name="a"><div class="pane">A</div></el-tab-pane>
            <el-tab-pane label="Tab B" name="b"><div class="pane">B</div></el-tab-pane>
            <el-tab-pane label="Tab C" name="c"><div class="pane">C</div></el-tab-pane>
          </el-tabs>
        </div>
        <div class="half">
          <div class="sub-title">border-card</div>
          <el-tabs v-model="activeBorder" type="border-card">
            <el-tab-pane label="Tab A" name="a"><div class="pane">A</div></el-tab-pane>
            <el-tab-pane label="Tab B" name="b"><div class="pane">B</div></el-tab-pane>
            <el-tab-pane label="Tab C" name="c"><div class="pane">C</div></el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <pre class="code"><code>{{ codeCard }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">动态 Tabs（可新增 / 可关闭）</div>
      <div class="row">
        <el-button size="small" type="primary" @click="addTab">新增 Tab</el-button>
        <div class="tip">当前：{{ activeDynamic }}</div>
      </div>
      <div class="row">
        <el-tabs v-model="activeDynamic" type="card" closable @tab-remove="removeTab">
          <el-tab-pane v-for="t in dynamicTabs" :key="t.name" :label="t.label" :name="t.name">
            <div class="pane">{{ t.content }}</div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <pre class="code"><code>{{ codeDynamic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">位置（tab-position）</div>
      <div class="row">
        <el-radio-group v-model="tabPosition" size="small">
          <el-radio-button value="top">top</el-radio-button>
          <el-radio-button value="right">right</el-radio-button>
          <el-radio-button value="bottom">bottom</el-radio-button>
          <el-radio-button value="left">left</el-radio-button>
        </el-radio-group>
      </div>
      <div class="row">
        <el-tabs v-model="activePos" :tab-position="tabPosition" class="pos-tabs">
          <el-tab-pane label="概览" name="o"><div class="pane">概览内容</div></el-tab-pane>
          <el-tab-pane label="指标" name="m"><div class="pane">指标内容</div></el-tab-pane>
          <el-tab-pane label="日志" name="l"><div class="pane">日志内容</div></el-tab-pane>
        </el-tabs>
      </div>
      <pre class="code"><code>{{ codePosition }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'Tabs',
  description: '标签页组件（Tabs）',
})

const activeBase = ref('user')
const activeCard = ref('a')
const activeBorder = ref('a')

const activeDynamic = ref('tab-1')
const dynamicTabs = ref([
  { name: 'tab-1', label: 'Tab 1', content: '这是 Tab 1 的内容' },
  { name: 'tab-2', label: 'Tab 2', content: '这是 Tab 2 的内容' },
  { name: 'tab-3', label: 'Tab 3', content: '这是 Tab 3 的内容' },
])
let tabSeq = 3

const addTab = () => {
  tabSeq += 1
  const name = `tab-${tabSeq}`
  dynamicTabs.value.push({ name, label: `Tab ${tabSeq}`, content: `这是 Tab ${tabSeq} 的内容` })
  activeDynamic.value = name
}

const removeTab = (name) => {
  const idx = dynamicTabs.value.findIndex((t) => t.name === name)
  const next = dynamicTabs.value[idx - 1] || dynamicTabs.value[idx + 1]
  dynamicTabs.value = dynamicTabs.value.filter((t) => t.name !== name)
  if (activeDynamic.value === name) activeDynamic.value = next?.name || ''
}

const tabPosition = ref('top')
const activePos = ref('o')

const codeBasic = `<el-tabs v-model="activeName">
  <el-tab-pane label="用户管理" name="user">...</el-tab-pane>
  <el-tab-pane label="配置管理" name="config">...</el-tab-pane>
  <el-tab-pane label="角色管理" name="role">...</el-tab-pane>
</el-tabs>`

const codeCard = `<el-tabs v-model="active" type="card">
  <el-tab-pane label="Tab A" name="a">A</el-tab-pane>
  <el-tab-pane label="Tab B" name="b">B</el-tab-pane>
</el-tabs>

<el-tabs v-model="active" type="border-card">
  <el-tab-pane label="Tab A" name="a">A</el-tab-pane>
  <el-tab-pane label="Tab B" name="b">B</el-tab-pane>
</el-tabs>`

const codeDynamic = `<el-tabs v-model="active" type="card" closable @tab-remove="removeTab">
  <el-tab-pane v-for="t in tabs" :key="t.name" :label="t.label" :name="t.name">
    {{ t.content }}
  </el-tab-pane>
</el-tabs>

<el-button @click="addTab">新增 Tab</el-button>`

const codePosition = `<el-tabs v-model="active" :tab-position="position">
  <el-tab-pane label="概览" name="o">...</el-tab-pane>
  <el-tab-pane label="指标" name="m">...</el-tab-pane>
  <el-tab-pane label="日志" name="l">...</el-tab-pane>
</el-tabs>`
</script>

<style scoped lang="scss">
.tabs-demo {
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
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

.row + .row {
  margin-top: 10px;
}

.half {
  flex: 1;
  min-width: 320px;
}

.sub-title {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.95);
  margin-bottom: 6px;
}

.pane {
  padding: 10px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: rgba(226, 232, 240, 0.92);
}

.pos-tabs {
  width: 100%;
  min-height: 220px;
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
  width: 100%;
}
</style>

