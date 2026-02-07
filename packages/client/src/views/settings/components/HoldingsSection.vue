<template>
  <div class="card-area mb-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">资产持仓</h2>
      <div class="flex gap-2">
        <el-button type="primary" :loading="saveLoading" @click="handleSave">
          保存
        </el-button>
      </div>
    </div>

    <div class="holdings-grid mb-4">
      <div
        v-for="(row, index) in holdings"
        :key="row.id ?? index"
        class="holding-card"
      >
        <div class="card-header">
          <span class="card-title">持仓 #{{ index + 1 }}</span>
          <el-button type="danger" size="small" @click="handleDelete(index)">
            删除
          </el-button>
        </div>

        <div class="card-body">
          <div class="form-item">
            <div class="label">资产名称</div>
            <el-input v-model="row.name" placeholder="请输入资产名称" />
          </div>
          <div class="form-item">
            <div class="label">代码</div>
            <el-input v-model="row.code" placeholder="请输入代码" />
          </div>
          <div class="form-item">
            <div class="label">占比(%)</div>
            <el-input-number v-model="row.percent" :min="0" :max="100" />
          </div>
          <div class="form-item">
            <div class="label">收益率(%)</div>
            <el-input-number v-model="row.profit" :step="0.01" />
          </div>
        </div>
      </div>
    </div>

    <el-button type="primary" class="w-full" @click="handleAdd">
      + 添加持仓
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getHoldingsList, postHoldingsUpdate } from '@client/api/holdings';

interface Holding {
  id?: number;
  name: string;
  code: string;
  percent: number;
  profit: number;
}

const holdings = ref<Holding[]>([]);
const saveLoading = ref(false);

onMounted(() => {
  fetchHoldings();
});

async function fetchHoldings() {
  try {
    const res = await getHoldingsList();
    holdings.value = res.data.map((item: any) => ({
      ...item,
      percent: typeof item.percent === 'number' ? item.percent * 100 : 0,
      profit: typeof item.profit === 'number' ? item.profit * 100 : 0,
    }));
  } catch (err) {
    ElMessage.error('获取持仓列表失败');
  }
}

function handleAdd() {
  holdings.value.push({
    name: '',
    code: '',
    percent: 0,
    profit: 0,
  });
}

function handleDelete(index: number) {
  holdings.value.splice(index, 1);
}

async function handleSave() {
  try {
    // 验证数据
    const hasEmpty = holdings.value.some((item) => !item.name || !item.code);
    if (hasEmpty) {
      ElMessage.warning('请完整填写所有必填字段');
      return;
    }

    saveLoading.value = true;
    const body = {
      holdings: holdings.value.map((item) => ({
        name: item.name,
        code: item.code,
        percent: Number.isFinite(item.percent) ? item.percent / 100 : 0,
        profit: Number.isFinite(item.profit) ? item.profit / 100 : 0,
      })),
    };

    await postHoldingsUpdate(body);
    ElMessage.success('持仓保存成功');
    await fetchHoldings();
  } catch (err) {
    ElMessage.error('保存持仓失败');
  } finally {
    saveLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.card-area {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.holdings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.holding-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-weight: 600;
  color: #111827;
}

.card-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item :deep(.el-input),
.form-item :deep(.el-input-number),
.form-item :deep(.el-select) {
  width: 100%;
}

.form-item :deep(.el-input__wrapper) {
  width: 100%;
}

.label {
  font-size: 12px;
  color: #6b7280;
}

@media (max-width: 640px) {
  .card-body {
    grid-template-columns: 1fr;
  }
}
</style>
