<template>
  <div class="cascader-demo">
    <div class="section">
      <div class="section-title">基础 Cascader</div>
      <div class="row">
        <el-cascader
          v-model="valueBasic"
          :options="options"
          clearable
          placeholder="请选择"
          style="width: 320px"
        />
        <div class="tip">value：{{ valueBasic || '（空）' }}</div>
      </div>
      <pre class="code"><code>{{ codeBasic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">可搜索（filterable）</div>
      <div class="row">
        <el-cascader
          v-model="valueFilter"
          :options="options"
          clearable
          filterable
          placeholder="输入关键字搜索"
          style="width: 320px"
        />
        <div class="tip">value：{{ valueFilter || '（空）' }}</div>
      </div>
      <pre class="code"><code>{{ codeFilterable }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">多选（multiple）/ 折叠标签</div>
      <div class="row">
        <el-cascader
          v-model="valueMultiple"
          :options="options"
          clearable
          :props="multipleProps"
          collapse-tags
          collapse-tags-tooltip
          placeholder="可多选"
          style="width: 420px"
        />
        <div class="tip">value：{{ valueMultiple.length ? JSON.stringify(valueMultiple) : '（空）' }}</div>
      </div>
      <pre class="code"><code>{{ codeMultiple }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'Cascader',
  description: '级联选择器组件',
})

const options = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖区' },
          { value: 'binjiang', label: '滨江区' },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波',
        children: [
          { value: 'haishu', label: '海曙区' },
          { value: 'jiangbei', label: '江北区' },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [
          { value: 'xuanwu', label: '玄武区' },
          { value: 'qinhuai', label: '秦淮区' },
        ],
      },
      {
        value: 'suzhou',
        label: '苏州',
        children: [
          { value: 'gusu', label: '姑苏区' },
          { value: 'wuzhong', label: '吴中区' },
        ],
      },
    ],
  },
]

const valueBasic = ref('')
const valueFilter = ref('')
const valueMultiple = ref([])

const multipleProps = {
  multiple: true,
}

const codeBasic = `<el-cascader
  v-model="value"
  :options="options"
  clearable
  placeholder="请选择"
/>`

const codeFilterable = `<el-cascader
  v-model="value"
  :options="options"
  clearable
  filterable
  placeholder="输入关键字搜索"
/>`

const codeMultiple = `<el-cascader
  v-model="value"
  :options="options"
  clearable
  :props="{ multiple: true }"
  collapse-tags
  collapse-tags-tooltip
  placeholder="可多选"
/>`
</script>

<style scoped lang="scss">
.cascader-demo {
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

