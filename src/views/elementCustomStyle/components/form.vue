<template>
  <div class="form-demo">
    <div class="section">
      <div class="section-title">基础表单（input / select / radio / checkbox / date / switch / number / textarea）</div>
      <div class="row">
        <el-form
          ref="formRef"
          :model="formModel"
          :rules="rules"
          label-width="96px"
          status-icon
          class="form"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="formModel.username" placeholder="请输入用户名" clearable />
          </el-form-item>

          <el-form-item label="城市" prop="city">
            <el-select v-model="formModel.city" placeholder="请选择城市" clearable style="width: 100%">
              <el-option label="北京" value="beijing" />
              <el-option label="上海" value="shanghai" />
              <el-option label="广州" value="guangzhou" />
              <el-option label="深圳" value="shenzhen" />
            </el-select>
          </el-form-item>

          <el-form-item label="角色" prop="role">
            <el-radio-group v-model="formModel.role">
              <el-radio value="admin">管理员</el-radio>
              <el-radio value="editor">编辑</el-radio>
              <el-radio value="guest">访客</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="爱好" prop="hobbies">
            <el-checkbox-group v-model="formModel.hobbies">
              <el-checkbox value="reading">阅读</el-checkbox>
              <el-checkbox value="sports">运动</el-checkbox>
              <el-checkbox value="music">音乐</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              v-model="formModel.birthday"
              type="date"
              placeholder="请选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="启用" prop="enabled">
            <el-switch v-model="formModel.enabled" />
          </el-form-item>

          <el-form-item label="数量" prop="count">
            <el-input-number v-model="formModel.count" :min="1" :max="99" />
          </el-form-item>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formModel.remark"
              type="textarea"
              :rows="3"
              maxlength="120"
              show-word-limit
              placeholder="可选，最多 120 字"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
            <el-button @click="onReset">重置</el-button>
            <div class="tip">提交结果：{{ submitText }}</div>
          </el-form-item>
        </el-form>
      </div>
      <pre class="code"><code>{{ codeForm }}</code></pre>
    </div>

    <div class="section">
      <div class="section-title">行内表单（常用于筛选）</div>
      <div class="row">
        <el-form :model="filterModel" inline class="form">
          <el-form-item label="关键词">
            <el-input v-model="filterModel.keyword" placeholder="请输入" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterModel.status" placeholder="请选择" clearable style="width: 160px">
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button @click="onClearSearch">清空</el-button>
            <div class="tip">筛选条件：{{ filterText }}</div>
          </el-form-item>
        </el-form>
      </div>
      <pre class="code"><code>{{ codeInline }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

defineOptions({
  name: 'Form',
  description: '表单组件',
})

const formRef = ref()
const submitText = ref('暂无')

const formModel = reactive({
  username: '',
  city: '',
  role: 'guest',
  hobbies: [],
  birthday: '',
  enabled: true,
  count: 1,
  remark: '',
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 16, message: '长度 2-16 位', trigger: 'blur' },
  ],
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  hobbies: [{ type: 'array', required: true, message: '请选择至少 1 个爱好', trigger: 'change' }],
  birthday: [{ required: true, message: '请选择生日', trigger: 'change' }],
  count: [{ type: 'number', required: true, message: '请输入数量', trigger: 'change' }],
}

const onSubmit = async () => {
  const ok = await formRef.value?.validate?.().catch(() => false)
  if (!ok) {
    submitText.value = '校验失败'
    return
  }
  submitText.value = `提交成功：${formModel.username} / ${formModel.city} / ${formModel.role}`
}

const onReset = () => {
  formRef.value?.resetFields?.()
  submitText.value = '已重置'
}

const filterModel = reactive({
  keyword: '',
  status: '',
})

const filterText = computed(() => {
  const k = filterModel.keyword || '（空）'
  const s = filterModel.status || '（空）'
  return `${k} / ${s}`
})

const onSearch = () => {
  // 展示用：这里不做实际请求
}

const onClearSearch = () => {
  filterModel.keyword = ''
  filterModel.status = ''
}

const codeForm = `<el-form ref="formRef" :model="formModel" :rules="rules" label-width="96px" status-icon>
  <el-form-item label="用户名" prop="username">
    <el-input v-model="formModel.username" clearable />
  </el-form-item>

  <el-form-item label="城市" prop="city">
    <el-select v-model="formModel.city" clearable style="width: 100%">
      <el-option label="北京" value="beijing" />
      <el-option label="上海" value="shanghai" />
    </el-select>
  </el-form-item>

  <el-form-item label="角色" prop="role">
    <el-radio-group v-model="formModel.role">
      <el-radio value="admin">管理员</el-radio>
      <el-radio value="guest">访客</el-radio>
    </el-radio-group>
  </el-form-item>

  <el-form-item label="爱好" prop="hobbies">
    <el-checkbox-group v-model="formModel.hobbies">
      <el-checkbox value="reading">阅读</el-checkbox>
      <el-checkbox value="sports">运动</el-checkbox>
    </el-checkbox-group>
  </el-form-item>

  <el-form-item label="生日" prop="birthday">
    <el-date-picker v-model="formModel.birthday" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
  </el-form-item>

  <el-form-item label="启用" prop="enabled">
    <el-switch v-model="formModel.enabled" />
  </el-form-item>

  <el-form-item label="数量" prop="count">
    <el-input-number v-model="formModel.count" :min="1" :max="99" />
  </el-form-item>

  <el-form-item label="备注" prop="remark">
    <el-input v-model="formModel.remark" type="textarea" :rows="3" maxlength="120" show-word-limit />
  </el-form-item>

  <el-form-item>
    <el-button type="primary" @click="onSubmit">提交</el-button>
    <el-button @click="onReset">重置</el-button>
  </el-form-item>
</el-form>`

const codeInline = `<el-form :model="filterModel" inline>
  <el-form-item label="关键词">
    <el-input v-model="filterModel.keyword" clearable style="width: 220px" />
  </el-form-item>
  <el-form-item label="状态">
    <el-select v-model="filterModel.status" clearable style="width: 160px">
      <el-option label="启用" value="enabled" />
      <el-option label="禁用" value="disabled" />
    </el-select>
  </el-form-item>
  <el-form-item>
    <el-button type="primary">查询</el-button>
    <el-button>清空</el-button>
  </el-form-item>
</el-form>`
</script>

<style scoped lang="scss">
.form-demo {
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
}

.row + .row {
  margin-top: 10px;
}

.form {
  width: 100%;
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

