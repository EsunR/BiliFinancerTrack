<template>
  <div class="calendar-page card-area">
    <!-- 月份选择器 -->
    <div class="calendar-month-picker">
      <el-date-picker
        v-model="selectedMonth"
        type="month"
        format="YYYY-MM"
        value-format="YYYY-MM"
        :clearable="false"
        placeholder="选择月份"
        @change="onMonthChange"
      />
    </div>

    <!-- 日历主体 -->
    <div class="calendar-body">
      <calendar-grid
        v-if="!loading"
        :year="year"
        :month="month"
        :data="calendarData"
        @cell-click="handleCellClick"
      />
      <el-skeleton v-else :rows="6" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDailyReportsMonth } from '@client/api/dailyReports';
import CalendarGrid from './components/CalendarGrid.vue';
import type { DailyReportMonthItem } from '@express-vue-template/types/api/dailyReports/types';

const selectedMonth = ref<string>(new Date().toISOString().slice(0, 7));
const loading = ref(false);
const calendarData = ref<DailyReportMonthItem[]>([]);
const router = useRouter();

const year = computed(() => Number(selectedMonth.value.split('-')[0]));
const month = computed(() => Number(selectedMonth.value.split('-')[1]));

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await getDailyReportsMonth({
      year: year.value,
      month: month.value,
    });
    calendarData.value = data || [];
  } finally {
    loading.value = false;
  }
}

function onMonthChange() {
  fetchData();
}

function handleCellClick(cell: { day?: number }) {
  if (!cell.day) return;
  // 跳转到日报详情页面，待实现页面可先跳转
  router.push({
    name: 'DailyReportDetail',
    query: {
      date: `${year.value}-${String(month.value).padStart(2, '0')}-${String(
        cell.day
      ).padStart(2, '0')}`,
    },
  });
}

onMounted(fetchData);
</script>

<style lang="scss" scoped>
.calendar-page {
  box-sizing: border-box;
  height: var(--full-screen-content-height);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.calendar-month-picker {
  margin-bottom: 12px;
}
.calendar-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .calendar-page {
    padding: 12px;
  }
  .calendar-month-picker {
    margin-bottom: 12px;
  }
  .calendar-body {
    border-radius: 10px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
}
</style>
