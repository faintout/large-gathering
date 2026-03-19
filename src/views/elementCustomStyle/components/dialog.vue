<template>
  <div class="dialog-demo">
    <div class="section">
      <div class="section-title">基础 Dialog</div>
      <div class="row">
        <el-button type="primary" @click="basicVisible = true">打开</el-button>
      </div>
      <pre class="code"><code>{{ codeBasic }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">自定义 Footer（确认/取消）</div>
      <div class="row">
        <el-button type="primary" @click="footerVisible = true">打开</el-button>
      </div>
      <pre class="code"><code>{{ codeFooter }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">可拖拽 / 关闭控制</div>
      <div class="row">
        <el-button @click="draggableVisible = true">可拖拽</el-button>
        <el-button @click="noCloseVisible = true">禁用遮罩/ESC 关闭</el-button>
      </div>
      <pre class="code"><code>{{ codeControl }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">before-close 拦截（模拟二次确认）</div>
      <div class="row">
        <el-button type="warning" @click="beforeCloseVisible = true">打开</el-button>
        <div class="tip">上次关闭方式：{{ lastCloseReason }}</div>
      </div>
      <pre class="code"><code>{{ codeBeforeClose }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">全屏</div>
      <div class="row">
        <el-button type="success" @click="fullscreenVisible = true">打开</el-button>
      </div>
      <pre class="code"><code>{{ codeFullscreen }}</code></pre>
    </div>

    <!-- dialogs -->
    <el-dialog v-model="basicVisible" title="基础 Dialog" width="520px">
      <div class="dialog-body">
        这是一个基础的 Dialog 示例。你可以在这里放表单、说明文字或任意内容。
      </div>
    </el-dialog>

    <el-dialog v-model="footerVisible" title="自定义 Footer" width="560px">
      <div class="dialog-body">
        Footer 区域通过 slot 自定义，适合提交/取消等操作。
      </div>
      <template #footer>
        <div class="footer">
          <el-button @click="footerVisible = false">取消</el-button>
          <el-button type="primary" @click="onConfirmFooter">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="draggableVisible" title="可拖拽 Dialog" width="560px" draggable>
      <div class="dialog-body">拖拽标题栏可移动弹窗。</div>
    </el-dialog>

    <el-dialog
      v-model="noCloseVisible"
      title="关闭控制"
      width="560px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="dialog-body">
        已禁用：点击遮罩关闭、按 ESC 关闭、右上角关闭按钮。
      </div>
      <template #footer>
        <div class="footer">
          <el-button type="primary" @click="noCloseVisible = false">我知道了</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="beforeCloseVisible"
      title="before-close 拦截"
      width="560px"
      :before-close="onBeforeClose"
    >
      <div class="dialog-body">
        这里演示 before-close：第一次点关闭会被拦截，第二次才真正关闭。
      </div>
      <template #footer>
        <div class="footer">
          <el-button @click="beforeCloseVisible = false">直接关闭</el-button>
          <el-button type="primary" @click="beforeCloseVisible = false">完成</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="fullscreenVisible" title="全屏 Dialog" fullscreen>
      <div class="dialog-body">
        <div class="fullscreen-content">
          <div class="fullscreen-title">全屏内容区域</div>
          <div class="tip">适合大表单、复杂配置、全屏预览等场景。</div>
          <el-button style="margin-top: 12px" @click="fullscreenVisible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'Dialog',
  description: '弹窗组件',
})

const basicVisible = ref(false)
const footerVisible = ref(false)
const draggableVisible = ref(false)
const noCloseVisible = ref(false)
const beforeCloseVisible = ref(false)
const fullscreenVisible = ref(false)

const onConfirmFooter = () => {
  footerVisible.value = false
}

const lastCloseReason = ref('暂无')
const closeTryCount = ref(0)
const onBeforeClose = (done) => {
  closeTryCount.value += 1
  if (closeTryCount.value < 2) {
    lastCloseReason.value = '已拦截（再次关闭才生效）'
    return
  }
  lastCloseReason.value = '已关闭'
  closeTryCount.value = 0
  done()
}

const codeBasic = `<el-button type="primary" @click="visible = true">打开</el-button>

<el-dialog v-model="visible" title="基础 Dialog" width="520px">
  <div>内容...</div>
</el-dialog>`

const codeFooter = `<el-dialog v-model="visible" title="自定义 Footer" width="560px">
  <div>内容...</div>
  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <el-button type="primary" @click="visible = false">确认</el-button>
  </template>
</el-dialog>`

const codeControl = `<el-dialog v-model="visible" title="可拖拽" draggable>
  <div>内容...</div>
</el-dialog>

<el-dialog
  v-model="visible2"
  title="关闭控制"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
  :show-close="false"
>
  <div>内容...</div>
</el-dialog>`

const codeBeforeClose = `<el-dialog
  v-model="visible"
  title="before-close"
  :before-close="(done) => { /* 校验通过后 */ done() }"
>
  <div>内容...</div>
</el-dialog>`

const codeFullscreen = `<el-dialog v-model="visible" title="全屏" fullscreen>
  <div>内容...</div>
</el-dialog>`
</script>

<style scoped lang="scss">
.dialog-demo {
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

.dialog-body {
  color: rgba(226, 232, 240, 0.92);
  line-height: 1.6;
}

.footer {
  display: inline-flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}

.fullscreen-content {
  padding: 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.fullscreen-title {
  font-weight: 600;
  margin-bottom: 6px;
}
</style>

