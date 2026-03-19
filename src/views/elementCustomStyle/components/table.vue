<template>
  <div class="table-demo">
    <div class="section">
      <div class="section-title">基础表格</div>
      <div class="row">
        <el-table :data="tableData" height="260">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="address" label="地址" min-width="260" />
        </el-table>
      </div>
      <pre class="code"><code>{{ codeBasic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">边框 / 斑马纹 / 高亮当前行</div>
      <div class="row">
        <el-table
          :data="tableData"
          height="260"
          border
          stripe
          highlight-current-row
          @current-change="onCurrentChange"
        >
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="address" label="地址" min-width="260" />
        </el-table>
        <div class="tip">当前行：{{ currentRowText }}</div>
      </div>
      <pre class="code"><code>{{ codeStyle }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">选择列 / 索引列 / 排序</div>
      <div class="row">
        <el-table
          ref="selectTableRef"
          :data="tableData"
          height="300"
          border
          @selection-change="onSelectionChange"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column type="index" label="#" width="56" />
          <el-table-column prop="date" label="日期" width="120" sortable />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="address" label="地址" min-width="260" />
        </el-table>
      </div>
      <div class="row">
        <el-button size="small" @click="clearSelection">清空选择</el-button>
        <div class="tip">已选：{{ selectedNames.join('、') || '无' }}</div>
      </div>
      <pre class="code"><code>{{ codeSelection }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">固定列（左/右）</div>
      <div class="row">
        <el-table :data="wideTableData" height="300" border>
          <el-table-column fixed prop="date" label="日期" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="province" label="省份" width="120" />
          <el-table-column prop="city" label="城市" width="120" />
          <el-table-column prop="zip" label="邮编" width="120" />
          <el-table-column prop="address" label="地址" width="260" />
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" @click="viewRow(scope.row)">查看</el-button>
              <el-button link type="danger" @click="removeRow(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <pre class="code"><code>{{ codeFixed }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

defineOptions({
  name: 'Table',
  description: '表格组件',
})

const tableData = ref([
  { date: '2026-03-01', name: '张三', address: '北京市朝阳区 XX 路 1 号' },
  { date: '2026-03-02', name: '李四', address: '上海市浦东新区 XX 路 2 号' },
  { date: '2026-03-03', name: '王五', address: '广州市天河区 XX 路 3 号' },
  { date: '2026-03-04', name: '赵六', address: '深圳市南山区 XX 路 4 号' },
  { date: '2026-03-05', name: '孙七', address: '杭州市西湖区 XX 路 5 号' },
])

const currentRow = ref(null)
const onCurrentChange = (row) => {
  currentRow.value = row
}
const currentRowText = computed(() => currentRow.value?.name || '无')

const selectedRows = ref([])
const onSelectionChange = (rows) => {
  selectedRows.value = rows
}
const selectedNames = computed(() => selectedRows.value.map((r) => r.name))

const selectTableRef = ref()
const clearSelection = () => {
  selectTableRef.value?.clearSelection?.()
}

const wideTableData = ref([
  {
    date: '2026-03-01',
    name: '张三',
    province: '北京',
    city: '北京',
    zip: '100000',
    address: '北京市朝阳区 XX 路 1 号',
  },
  {
    date: '2026-03-02',
    name: '李四',
    province: '上海',
    city: '上海',
    zip: '200000',
    address: '上海市浦东新区 XX 路 2 号',
  },
  {
    date: '2026-03-03',
    name: '王五',
    province: '广东',
    city: '广州',
    zip: '510000',
    address: '广州市天河区 XX 路 3 号',
  },
])

const viewRow = (row) => {
  // 这里仅做演示，不弹 Message，避免引入额外依赖/样式干扰
  currentRow.value = row
}

const removeRow = (index) => {
  wideTableData.value.splice(index, 1)
}

const codeBasic = `<el-table :data="tableData" height="260">
  <el-table-column prop="date" label="日期" width="120" />
  <el-table-column prop="name" label="姓名" width="120" />
  <el-table-column prop="address" label="地址" min-width="260" />
</el-table>`

const codeStyle = `<el-table
  :data="tableData"
  height="260"
  border
  stripe
  highlight-current-row
  @current-change="onCurrentChange"
>
  <el-table-column prop="date" label="日期" width="120" />
  <el-table-column prop="name" label="姓名" width="120" />
  <el-table-column prop="address" label="地址" min-width="260" />
</el-table>`

const codeSelection = `<el-table
  ref="tableRef"
  :data="tableData"
  height="300"
  border
  @selection-change="onSelectionChange"
>
  <el-table-column type="selection" width="48" />
  <el-table-column type="index" label="#" width="56" />
  <el-table-column prop="date" label="日期" width="120" sortable />
  <el-table-column prop="name" label="姓名" width="120" />
  <el-table-column prop="address" label="地址" min-width="260" />
</el-table>

<el-button size="small" @click="tableRef?.clearSelection?.()">清空选择</el-button>`

const codeFixed = `<el-table :data="wideTableData" height="300" border>
  <el-table-column fixed prop="date" label="日期" width="120" />
  <el-table-column prop="name" label="姓名" width="120" />
  <el-table-column prop="province" label="省份" width="120" />
  <el-table-column prop="city" label="城市" width="120" />
  <el-table-column prop="zip" label="邮编" width="120" />
  <el-table-column prop="address" label="地址" width="260" />
  <el-table-column fixed="right" label="操作" width="120">
    <template #default="scope">
      <el-button link type="primary" @click="viewRow(scope.row)">查看</el-button>
      <el-button link type="danger" @click="removeRow(scope.$index)">删除</el-button>
    </template>
  </el-table-column>
</el-table>`
</script>

<style scoped lang="scss">
.table-demo {
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

