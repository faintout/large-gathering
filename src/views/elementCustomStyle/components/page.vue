<template>
  <div class="page-demo">
    <div class="section">
      <div class="section-title">基础分页</div>
      <div class="row">
        <el-pagination
          v-model:current-page="basicCurrentPage"
          :page-size="10"
          :total="basicTotal"
          layout="prev, pager, next"
        />
        <div class="tip">currentPage：{{ basicCurrentPage }}</div>
      </div>
      <pre class="code"><code>{{ codeBasic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">带总数 / 背景 / 禁用</div>
      <div class="row">
        <el-pagination
          v-model:current-page="bgCurrentPage"
          background
          :page-size="10"
          :total="bgTotal"
          layout="total, prev, pager, next"
        />
      </div>
      <div class="row">
        <el-pagination
          v-model:current-page="disabledCurrentPage"
          disabled
          :page-size="10"
          :total="disabledTotal"
          layout="total, prev, pager, next"
        />
      </div>
      <pre class="code"><code>{{ codeBgDisabled }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">sizes（切换每页条数）</div>
      <div class="row">
        <el-pagination
          v-model:current-page="sizesCurrentPage"
          v-model:page-size="sizesPageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="sizesTotal"
          layout="total, sizes, prev, pager, next"
        />
        <div class="tip">pageSize：{{ sizesPageSize }}，currentPage：{{ sizesCurrentPage }}</div>
      </div>
      <pre class="code"><code>{{ codeSizes }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">jumper（快速跳页）</div>
      <div class="row">
        <el-pagination
          v-model:current-page="jumpCurrentPage"
          :page-size="10"
          :total="jumpTotal"
          layout="total, prev, pager, next, jumper"
        />
        <div class="tip">currentPage：{{ jumpCurrentPage }}</div>
      </div>
      <pre class="code"><code>{{ codeJumper }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">完整示例（常用 layout）</div>
      <div class="row">
        <el-pagination
          v-model:current-page="fullCurrentPage"
          v-model:page-size="fullPageSize"
          background
          :page-sizes="[10, 20, 50, 100]"
          :total="fullTotal"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
      <pre class="code"><code>{{ codeFull }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'Page',
  description: '分页组件',
})

const basicCurrentPage = ref(1)
const basicTotal = ref(126)

const bgCurrentPage = ref(1)
const bgTotal = ref(240)

const disabledCurrentPage = ref(1)
const disabledTotal = ref(180)

const sizesCurrentPage = ref(1)
const sizesPageSize = ref(10)
const sizesTotal = ref(320)

const jumpCurrentPage = ref(1)
const jumpTotal = ref(540)

const fullCurrentPage = ref(1)
const fullPageSize = ref(20)
const fullTotal = ref(1000)

const codeBasic = `<el-pagination
  v-model:current-page="currentPage"
  :page-size="10"
  :total="126"
  layout="prev, pager, next"
/>`

const codeBgDisabled = `<el-pagination
  v-model:current-page="currentPage"
  background
  :page-size="10"
  :total="240"
  layout="total, prev, pager, next"
/>

<el-pagination
  v-model:current-page="currentPage"
  disabled
  :page-size="10"
  :total="180"
  layout="total, prev, pager, next"
/>`

const codeSizes = `<el-pagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :page-sizes="[10, 20, 50, 100]"
  :total="320"
  layout="total, sizes, prev, pager, next"
/>`

const codeJumper = `<el-pagination
  v-model:current-page="currentPage"
  :page-size="10"
  :total="540"
  layout="total, prev, pager, next, jumper"
/>`

const codeFull = `<el-pagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  background
  :page-sizes="[10, 20, 50, 100]"
  :total="1000"
  layout="total, sizes, prev, pager, next, jumper"
/>`
</script>

<style scoped lang="scss">
.page-demo {
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
