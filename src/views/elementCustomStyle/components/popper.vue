<template>
  <div class="popper-demo">
    <div class="section">
      <div class="section-title">Tooltip（hover 提示）</div>
      <div class="row">
        <el-tooltip content="这是一个 Tooltip" placement="top">
          <el-button>Hover 我</el-button>
        </el-tooltip>

        <el-tooltip content="支持不同方向" placement="right">
          <el-button>Right</el-button>
        </el-tooltip>

        <el-tooltip content="可以禁用" :disabled="tooltipDisabled">
          <el-button @click="tooltipDisabled = !tooltipDisabled">
            {{ tooltipDisabled ? '已禁用提示（点我启用）' : '点我禁用提示' }}
          </el-button>
        </el-tooltip>
      </div>
      <pre class="code"><code>{{ codeTooltip }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">Popover（内容弹层：hover / click）</div>
      <div class="row">
        <el-popover trigger="hover" placement="top" title="标题" width="220" content="这是 hover 触发的 Popover">
          <template #reference>
            <el-button>Hover 弹出</el-button>
          </template>
        </el-popover>

        <el-popover trigger="click" placement="top" width="260">
          <div class="pop-content">
            <div class="pop-title">自定义内容</div>
            <div class="pop-desc">这里可以放任意 DOM、表单等。</div>
          </div>
          <template #reference>
            <el-button type="primary">Click 弹出</el-button>
          </template>
        </el-popover>
      </div>
      <pre class="code"><code>{{ codePopover }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">手动控制显示（Popover v-model:visible）</div>
      <div class="row">
        <el-popover v-model:visible="manualVisible" placement="bottom" width="260" trigger="manual">
          <div class="pop-content">
            <div class="pop-title">手动控制</div>
            <div class="pop-desc">通过按钮切换 visible，适合更复杂的交互。</div>
            <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: flex-end">
              <el-button size="small" @click="manualVisible = false">关闭</el-button>
              <el-button size="small" type="primary" @click="manualVisible = false">确定</el-button>
            </div>
          </div>
          <template #reference>
            <el-button type="success" @click="manualVisible = !manualVisible">
              {{ manualVisible ? '收起' : '展开' }}
            </el-button>
          </template>
        </el-popover>
        <div class="tip">visible：{{ manualVisible }}</div>
      </div>
      <pre class="code"><code>{{ codeManual }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">Popconfirm（确认弹层）</div>
      <div class="row">
        <el-popconfirm
          title="确定要删除吗？"
          confirm-button-text="删除"
          cancel-button-text="取消"
          @confirm="onConfirm"
          @cancel="onCancel"
        >
          <template #reference>
            <el-button type="danger">删除</el-button>
          </template>
        </el-popconfirm>
        <div class="tip">结果：{{ resultText }}</div>
      </div>
      <pre class="code"><code>{{ codePopconfirm }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'Popper',
  description: 'Popper 相关组件（Tooltip/Popover/Popconfirm）',
})

const tooltipDisabled = ref(false)
const manualVisible = ref(false)
const resultText = ref('暂无')

const onConfirm = () => {
  resultText.value = '已确认'
}
const onCancel = () => {
  resultText.value = '已取消'
}

const codeTooltip = `<el-tooltip content="这是一个 Tooltip" placement="top">
  <el-button>Hover 我</el-button>
</el-tooltip>

<el-tooltip content="可以禁用" :disabled="disabled">
  <el-button @click="disabled = !disabled">切换</el-button>
</el-tooltip>`

const codePopover = `<el-popover trigger="hover" title="标题" width="220" content="hover 触发">
  <template #reference>
    <el-button>Hover 弹出</el-button>
  </template>
</el-popover>

<el-popover trigger="click" width="260">
  <div>自定义内容...</div>
  <template #reference>
    <el-button type="primary">Click 弹出</el-button>
  </template>
</el-popover>`

const codeManual = `<el-popover v-model:visible="visible" trigger="manual" width="260">
  <div>内容...</div>
  <template #reference>
    <el-button @click="visible = !visible">{{ visible ? '收起' : '展开' }}</el-button>
  </template>
</el-popover>`

const codePopconfirm = `<el-popconfirm title="确定要删除吗？" @confirm="onConfirm" @cancel="onCancel">
  <template #reference>
    <el-button type="danger">删除</el-button>
  </template>
</el-popconfirm>`
</script>

<style scoped lang="scss">
.popper-demo {
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

.pop-content {
  color: rgba(226, 232, 240, 0.92);
}

.pop-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.pop-desc {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.95);
}
</style>

