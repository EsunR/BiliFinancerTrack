<script lang="ts" setup>
import { nextTick, ref } from 'vue';
import { postUppersCreate } from '@client/api/upper';
import type { FormInstance, FormRules } from 'element-plus';

defineOptions({
  name: 'UpperCreateDialog',
});

const emit = defineEmits<{ (e: 'created'): void }>();

const createDialogVisible = ref(false);
const creating = ref(false);
const formRef = ref<FormInstance>();
const formModel = ref({
  uid: '',
});

const rules: FormRules = {
  uid: [
    { required: true, message: '请输入 UID', trigger: 'blur' },
    {
      pattern: /^\d+$/,
      message: 'UID 只能是数字',
      trigger: ['blur', 'change'],
    },
  ],
};

const openCreateDialog = () => {
  createDialogVisible.value = true;
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

const onDialogClosed = () => {
  formRef.value?.resetFields();
};

const submitCreate = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  try {
    creating.value = true;
    await postUppersCreate({ uid: Number(formModel.value.uid) });
    createDialogVisible.value = false;
    emit('created');
  } finally {
    creating.value = false;
  }
};
</script>

<template>
  <div class="upper-create-dialog">
    <el-button type="primary" @click="openCreateDialog">添加 UP 主</el-button>
    <el-dialog
      v-model="createDialogVisible"
      title="添加 UP 主"
      width="420px"
      @closed="onDialogClosed"
    >
      <el-form ref="formRef" :model="formModel" :rules="rules">
        <el-form-item label="UID" prop="uid">
          <el-input
            v-model="formModel.uid"
            placeholder="请输入 UP 主 UID"
            inputmode="numeric"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate"
          >提交</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>
