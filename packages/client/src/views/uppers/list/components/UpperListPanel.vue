<script lang="ts" setup>
import type { GetUppersRes } from '@express-vue-template/types/api/upper/types';
import UpperCard from './UpperCard.vue';

defineOptions({
  name: 'UpperListPanel',
});

defineProps<{
  uppers: GetUppersRes;
  loading: boolean;
}>();

const emit = defineEmits<{ (e: 'select', id: number): void }>();

const onSelect = (id: number) => {
  emit('select', id);
};
</script>

<template>
  <div class="upper-list-panel">
    <div v-if="loading" class="loading">加载中...</div>
    <el-empty v-else-if="!uppers.length" description="暂无 UP 主" />
    <div v-else class="upper-grid">
      <upper-card
        v-for="upper in uppers"
        :key="upper.id"
        :upper="upper"
        @select="onSelect"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading {
  padding: 24px 0;
  text-align: center;
  color: #8a8a8a;
}

.upper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
</style>
