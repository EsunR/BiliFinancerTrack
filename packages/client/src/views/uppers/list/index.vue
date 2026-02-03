<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElButton } from 'element-plus';
import { getUppersList } from '@client/api/upper';
import type { GetUppersRes } from '@express-vue-template/types/api/upper/types';
import UpperListPanel from './components/UpperListPanel.vue';
import UpperCreateDialog from './components/UpperCreateDialog.vue';

defineOptions({
  name: 'UppersListPage',
});

const router = useRouter();
const uppers = ref<GetUppersRes>([]);
const loading = ref(false);

const fetchUppers = async () => {
  try {
    loading.value = true;
    const res = await getUppersList();
    uppers.value = res.data;
  } finally {
    loading.value = false;
  }
};

const onUpperClick = (upperId: number) => {
  router.push({ name: 'UppersDetail', query: { id: upperId } });
};

const goToCalendar = () => {
  router.push({ path: '/calendar' });
};

onMounted(fetchUppers);
</script>

<template>
  <div class="uppers-list-page">
    <div class="page-header">
      <div class="title">UP 主列表</div>
      <div class="header-actions">
        <div class="subtitle">共 {{ uppers.length }} 位</div>
        <el-button
          type="primary"
          plain
          style="margin-right: 8px"
          @click="goToCalendar"
        >
          日历页面
        </el-button>
        <upper-create-dialog @created="fetchUppers" />
      </div>
    </div>
    <upper-list-panel
      :uppers="uppers"
      :loading="loading"
      @select="onUpperClick"
    />
  </div>
</template>

<style lang="scss" scoped>
.uppers-list-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  .title {
    font-size: 22px;
    font-weight: 600;
  }

  .subtitle {
    font-size: 13px;
    color: #7a7a7a;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
