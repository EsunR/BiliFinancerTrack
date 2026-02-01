<script lang="ts" setup>
import filters from '@client/utils/filters';
import { getBiliImageProxyUrl } from '@client/utils/image';
import type { GetUppersRes } from '@express-vue-template/types/api/upper/types';

defineOptions({
  name: 'UpperCard',
});

type UpperItem = GetUppersRes[number];

const props = defineProps<{ upper: UpperItem }>();
const emit = defineEmits<{ (e: 'select', id: number): void }>();

const formatDate = (time: string | number | Date) =>
  filters.formatTime(
    time instanceof Date ? time.toISOString() : time,
    'YYYY-MM-DD'
  );

const onClick = () => {
  emit('select', props.upper.id);
};
</script>

<template>
  <div class="upper-card" @click="onClick">
    <img
      class="avatar"
      :src="getBiliImageProxyUrl(upper.avatar)"
      :alt="upper.name"
    />
    <div class="info">
      <div class="name">{{ upper.name }}</div>
      <div class="meta">创建于 {{ formatDate(upper.createdAt) }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.upper-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .name {
      font-size: 16px;
      font-weight: 600;
      color: #1f1f1f;
    }

    .meta {
      font-size: 12px;
      color: #8a8a8a;
    }
  }
}
</style>
