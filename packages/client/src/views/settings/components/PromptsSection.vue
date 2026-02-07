<template>
  <div class="prompts-section">
    <div
      v-for="promptType in promptTypes"
      :key="promptType.type"
      class="card-area mb-6"
    >
      <div class="section-header">
        <h2 class="text-xl font-bold">{{ promptType.label }}</h2>
        <div class="header-actions">
          <el-select
            v-model="
              // eslint-disable-next-line vue/valid-v-model
              selectedPromptIds[promptType.type]!
            "
            class="prompt-select"
            placeholder="选择提示词"
            :loading="loading"
            :disabled="!groupedPrompts[promptType.type].length"
          >
            <el-option
              v-for="prompt in groupedPrompts[promptType.type]"
              :key="prompt.id"
              :label="prompt.note || `提示词 #${prompt.id}`"
              :value="prompt.id"
            />
          </el-select>
          <el-button type="primary" @click="openCreateDialog(promptType.type)">
            添加提示词
          </el-button>
        </div>
      </div>

      <div v-if="currentPromptByType[promptType.type]" class="prompt-body">
        <el-input
          v-model="currentPromptByType[promptType.type]!.content"
          type="textarea"
          :rows="15"
          placeholder="请输入提示词内容"
        />
        <div class="note-row">
          <div class="label">备注</div>
          <el-input
            v-model="currentPromptByType[promptType.type]!.note"
            placeholder="请输入备注信息"
            maxlength="10"
            show-word-limit
          />
        </div>
      </div>
      <el-empty v-else class="empty-state" description="暂无提示词" />

      <div v-if="currentPromptByType[promptType.type]" class="footer-actions">
        <el-button
          type="primary"
          :loading="saveLoading[promptType.type]"
          @click="handleSave(promptType.type)"
        >
          保存
        </el-button>
        <el-button
          v-if="!currentPromptByType[promptType.type]?.selected"
          :loading="selectLoading[promptType.type]"
          @click="handleSelectAsCurrent(promptType.type)"
        >
          设为当前提示词
        </el-button>
      </div>
    </div>

    <el-dialog
      v-model="createDialogVisible"
      :width="dialogWidth"
      title="添加提示词"
    >
      <div class="create-form">
        <div class="form-item">
          <div class="label">提示词内容</div>
          <el-input
            v-model="createForm.content"
            type="textarea"
            :rows="15"
            placeholder="请输入提示词内容"
          />
        </div>
        <div class="form-item">
          <div class="label">备注</div>
          <el-input
            v-model="createForm.note"
            placeholder="请输入备注信息"
            maxlength="10"
            show-word-limit
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="createLoading"
          @click="submitCreate"
        >
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getPromptsList,
  postPromptsCreate,
  postPromptsSelect,
  postPromptsUpdate,
} from '@client/api/prompts';
import type {
  PromptAttributes,
  PromptType,
} from '@express-vue-template/types/model/prompt';
import { useDialogWidth } from '@client/composition/useDialogWidth';

interface PromptItem extends PromptAttributes {
  note: string;
}

const promptTypes = [
  { type: 'analysis' as PromptType, label: '分析提示词' },
  { type: 'report' as PromptType, label: '日报提示词' },
];

const loading = ref(false);
const prompts = ref<PromptItem[]>([]);
const selectedPromptIds = reactive<Record<PromptType, number | null>>({
  analysis: null,
  report: null,
});
const saveLoading = reactive<Record<PromptType, boolean>>({
  analysis: false,
  report: false,
});
const selectLoading = reactive<Record<PromptType, boolean>>({
  analysis: false,
  report: false,
});

const createDialogVisible = ref(false);
const createLoading = ref(false);
const createForm = reactive<{
  type: PromptType | null;
  content: string;
  note: string;
}>({
  type: null,
  content: '',
  note: '',
});

const dialogWidth = useDialogWidth(800);

const groupedPrompts = computed<Record<PromptType, PromptItem[]>>(() => {
  const map: Record<PromptType, PromptItem[]> = {
    analysis: [],
    report: [],
  };
  prompts.value.forEach((item) => {
    map[item.type]?.push(item);
  });
  return map;
});

const currentPromptByType = computed<Record<PromptType, PromptItem | null>>(
  () => ({
    analysis:
      groupedPrompts.value.analysis.find(
        (item) => item.id === selectedPromptIds.analysis
      ) ?? null,
    report:
      groupedPrompts.value.report.find(
        (item) => item.id === selectedPromptIds.report
      ) ?? null,
  })
);

onMounted(() => {
  fetchPrompts();
});

async function fetchPrompts() {
  try {
    loading.value = true;
    const res = await getPromptsList();
    prompts.value = res.data.map((item) => ({
      ...item,
      note: item.note ?? '',
    }));
    ensureSelectedIds();
  } catch (err) {
    ElMessage.error('获取提示词失败');
  } finally {
    loading.value = false;
  }
}

function ensureSelectedIds() {
  promptTypes.forEach(({ type }) => {
    const list = groupedPrompts.value[type] || [];
    const selected = list.find((item) => item.selected) ?? list[0];
    selectedPromptIds[type] = selected ? selected.id : null;
  });
}

function openCreateDialog(type: PromptType) {
  createForm.type = type;
  createForm.content = '';
  createForm.note = '';
  createDialogVisible.value = true;
}

async function submitCreate() {
  if (!createForm.type) return;
  if (!createForm.content.trim()) {
    ElMessage.warning('请输入提示词内容');
    return;
  }

  try {
    createLoading.value = true;
    await postPromptsCreate({
      type: createForm.type,
      content: createForm.content.trim(),
      note: createForm.note.trim() || undefined,
    });
    ElMessage.success('提示词创建成功');
    createDialogVisible.value = false;
    await fetchPrompts();
  } finally {
    createLoading.value = false;
  }
}

async function handleSave(type: PromptType) {
  const prompt = currentPromptByType.value[type];
  if (!prompt) return;

  try {
    saveLoading[type] = true;
    await postPromptsUpdate({
      id: prompt.id,
      content: prompt.content.trim(),
      note: prompt.note.trim() || undefined,
    });
    ElMessage.success('提示词保存成功');
    await fetchPrompts();
  } finally {
    saveLoading[type] = false;
  }
}

async function handleSelectAsCurrent(type: PromptType) {
  const prompt = currentPromptByType.value[type];
  if (!prompt) return;

  try {
    selectLoading[type] = true;
    await postPromptsSelect({ id: prompt.id });
    ElMessage.success('已设为当前提示词');
    await fetchPrompts();
  } finally {
    selectLoading[type] = false;
  }
}
</script>

<style lang="scss" scoped>
.prompts-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.prompt-select {
  width: 260px;
  max-width: 100%;
}

.prompt-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.note-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  color: #6b7280;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.empty-state {
  margin: 20px 0;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
