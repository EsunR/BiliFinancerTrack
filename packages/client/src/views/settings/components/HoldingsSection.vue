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

    <el-table :data="holdings" class="mb-4">
      <el-table-column prop="name" label="资产名称">
        <template #default="{ row }">
          <el-input v-model="row.name" placeholder="请输入资产名称" />
        </template>
      </el-table-column>
      <el-table-column prop="code" label="代码">
        <template #default="{ row }">
          <el-input v-model="row.code" placeholder="请输入代码" />
        </template>
      </el-table-column>
      <el-table-column prop="percent" label="占比(%)">
        <template #default="{ row }">
          <el-input-number v-model="row.percent" :min="0" :max="100" />
        </template>
      </el-table-column>
      <el-table-column prop="profit" label="收益">
        <template #default="{ row }">
          <el-input-number v-model="row.profit" :step="0.01" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ $index }">
          <el-button type="danger" size="small" @click="handleDelete($index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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
        percent: item.percent,
        profit: item.profit,
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
</style>
