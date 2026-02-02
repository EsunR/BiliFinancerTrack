<script lang="ts" setup>
import type { TimestampSegment } from '@express-vue-template/types/model';

interface Props {
  timestamps: Array<
    TimestampSegment & { absoluteStart: number; absoluteEnd: number }
  >;
}

defineProps<Props>();

/**
 * 格式化时间为 mm:ss
 */
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
</script>

<template>
  <div class="transcript-timeline">
    <div v-for="(item, index) in timestamps" :key="index" class="timeline-item">
      <div class="timeline-time">{{ formatTime(item.absoluteStart) }}</div>
      <div class="timeline-content">{{ item.content }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.transcript-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .timeline-item {
    display: flex;
    gap: 16px;
    padding: 12px;
    border-radius: 8px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }

    .timeline-time {
      flex-shrink: 0;
      width: 60px;
      color: #909399;
      font-size: 14px;
      font-weight: 500;
    }

    .timeline-content {
      flex: 1;
      color: #303133;
      font-size: 14px;
      line-height: 1.6;
    }
  }
}
</style>
