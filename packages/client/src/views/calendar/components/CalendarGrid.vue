<template>
  <div class="calendar-grid">
    <div class="calendar-header">
      <div v-for="w in weekDays" :key="w" class="calendar-header-cell">
        {{ w }}
      </div>
    </div>
    <div class="calendar-body">
      <div
        v-for="(cell, idx) in cells"
        :key="idx"
        class="calendar-cell"
        :class="{
          'is-today': cell.isToday,
          'is-other-month': cell.isOtherMonth,
        }"
        @click="cell.day && emit('cell-click', cell)"
      >
        <div class="cell-date">{{ cell.day || '' }}</div>
        <div v-if="cell.day && cell.data" class="cell-info">
          <div class="cell-videos">视频: {{ cell.data.videoCount }}</div>
          <div class="cell-reports">日报: {{ cell.data.reportCount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
import type { DailyReportMonthItem } from '@express-vue-template/types/api/dailyReports/types';

const props = defineProps<{
  year: number;
  month: number; // 1-12
  data: DailyReportMonthItem[];
}>();
const emit = defineEmits(['cell-click']);

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

const cells = computed(() => {
  const daysInMonth = new Date(props.year, props.month, 0).getDate();
  const firstDay = new Date(props.year, props.month - 1, 1).getDay();
  const today = new Date();
  const result: Array<{
    day?: number;
    data?: DailyReportMonthItem;
    isToday?: boolean;
    isOtherMonth?: boolean;
  }> = [];
  // 上月补位
  for (let i = 0; i < firstDay; i++) result.push({ isOtherMonth: true });
  // 本月
  for (let d = 1; d <= daysInMonth; d++) {
    const data = props.data.find((item) => item.day === d);
    const isToday =
      props.year === today.getFullYear() &&
      props.month === today.getMonth() + 1 &&
      d === today.getDate();
    result.push({ day: d, data, isToday });
  }
  // 补齐 6 行
  while (result.length % 7 !== 0) result.push({ isOtherMonth: true });
  return result;
});
</script>

<style lang="scss" scoped>
.calendar-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.calendar-header {
  display: flex;
  background: #f0f2f5;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}
.calendar-header-cell {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-weight: bold;
  color: #666;
}
.calendar-body {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  border-radius: 0 0 4px 4px;
  flex: 1;
}
.calendar-cell {
  width: calc(100% / 7);
  min-height: 80px;
  border: 1px solid #f0f0f0;
  box-sizing: border-box;
  padding: 6px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}
.calendar-cell.is-today {
  background: #e6f7ff;
  border-color: #91d5ff;
}
.calendar-cell.is-other-month {
  background: #fafafa;
  color: #bbb;
  cursor: default;
}
.cell-date {
  font-size: 16px;
  font-weight: 500;
}
.cell-info {
  margin-top: 6px;
  font-size: 12px;
  color: #888;
}
.cell-videos {
  color: #409eff;
}
.cell-reports {
  color: #67c23a;
}
</style>
