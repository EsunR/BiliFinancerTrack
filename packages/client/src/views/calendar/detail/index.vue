<template>
  <div class="daily-report-detail-page">
    <div class="page-header">
      <el-link
        class="back-link"
        type="primary"
        :underline="false"
        @click="handleBack"
      >
        <el-icon><arrow-left /></el-icon>
        返回日历
      </el-link>
      <div class="page-title">日报详情</div>
      <div v-if="dateParam" class="date-tag">{{ dateParam }}</div>
      <el-button
        class="generate-button"
        type="primary"
        :loading="generating || hasProcessing"
        @click="handleGenerate"
      >
        生成日报
      </el-button>
    </div>

    <div class="card-area content-card">
      <div class="report-select">
        <el-select
          v-model="selectedReportId"
          class="report-select-input"
          placeholder="选择日报"
          :loading="loading"
        >
          <el-option
            v-for="report in sortedReports"
            :key="report.id"
            :label="getReportLabel(report)"
            :value="report.id"
          />
        </el-select>
      </div>

      <div class="report-videos">
        <div class="section-title">涉及视频</div>
        <video-group-list
          :videos="relatedVideos"
          :loading="videosLoading"
          :allow-all-click="true"
          :show-title="false"
        />
      </div>

      <div class="report-content">
        <markdown-renderer
          v-if="activeReport"
          :content="activeReport.content"
          :loading="loading"
        />
        <el-empty v-else description="暂无日报内容" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import {
  getDailyReportsList,
  postDailyReportsGenerate,
} from '@client/api/dailyReports';
import { getVideosList } from '@client/api/video';
import type { DailyReportAttributes } from '@express-vue-template/types/model';
import type {
  GetVideosListRes,
  VideoListItem,
} from '@express-vue-template/types/api/video/types';
import filters from '@client/utils/filters';
import MarkdownRenderer from '../../videos/detail/components/MarkdownRenderer.vue';
import VideoGroupList from '../../uppers/detail/components/VideoGroupList.vue';

defineOptions({
  name: 'DailyReportDetailPage',
});

type DailyReportItem = DailyReportAttributes & {
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const generating = ref(false);
const reports = ref<DailyReportItem[]>([]);
const selectedReportId = ref<number>();
const videosLoading = ref(false);
const videos = ref<GetVideosListRes>([]);
const hasProcessing = ref(false);
const isPolling = ref(false);

const dateParam = computed(() =>
  route.query.date ? String(route.query.date) : ''
);

const sortedReports = computed(() => {
  return [...reports.value].sort((a, b) => getReportTime(b) - getReportTime(a));
});

const activeReport = computed(() => {
  if (!selectedReportId.value) {
    return sortedReports.value[0] || null;
  }
  return (
    sortedReports.value.find((item) => item.id === selectedReportId.value) ||
    null
  );
});

const reportVideoIdSet = computed(() => {
  const ids = activeReport.value?.includeVideoIds || [];
  return new Set(
    ids
      .map((id) => (typeof id === 'string' ? Number(id) : id))
      .filter((id) => Number.isFinite(id))
  );
});

const relatedVideos = computed(() => {
  if (!reportVideoIdSet.value.size) {
    return [] as VideoListItem[];
  }
  return videos.value.filter((video) => reportVideoIdSet.value.has(video.id));
});

const getReportTime = (report: DailyReportItem) => {
  const rawTime = report.createdAt ?? report.reportDate;
  if (!rawTime) return 0;
  const date = new Date(rawTime instanceof Date ? rawTime : String(rawTime));
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
};

const getReportLabel = (report: DailyReportItem) => {
  const rawTime = report.createdAt ?? report.reportDate;
  if (!rawTime) {
    return `日报 ${report.id}`;
  }
  return filters.formatTime(
    rawTime instanceof Date ? rawTime.toISOString() : String(rawTime),
    'YYYY-MM-DD HH:mm'
  );
};

const fetchReports = async (showError = true) => {
  if (!dateParam.value) {
    if (showError) {
      ElMessage.error('缺少日期参数');
    }
    return;
  }

  loading.value = true;
  try {
    const { data } = await getDailyReportsList({ date: dateParam.value });
    reports.value = data.list;
    selectedReportId.value = sortedReports.value[0]?.id;
    hasProcessing.value = data.processing;
  } finally {
    loading.value = false;
  }
};

const fetchVideos = async () => {
  if (!dateParam.value) {
    return;
  }

  videosLoading.value = true;
  try {
    const { data } = await getVideosList({ date: dateParam.value });
    videos.value = (data || []) as GetVideosListRes;
  } finally {
    videosLoading.value = false;
  }
};

const handleBack = () => {
  router.back();
};

const handleGenerate = async () => {
  if (!dateParam.value) {
    ElMessage.error('缺少日期参数');
    return;
  }

  generating.value = true;
  try {
    await postDailyReportsGenerate({ date: dateParam.value });
    ElMessage.success('日报生成已提交，正在处理中...');

    // 轮询接口直到 processing 为 false
    await pollUntilProcessingDone();
  } finally {
    generating.value = false;
  }
};

const pollUntilProcessingDone = async () => {
  isPolling.value = true;

  try {
    while (isPolling.value) {
      try {
        await fetchReports(false); // 不显示错误提示

        if (!hasProcessing.value) {
          ElMessage.success('日报生成完成！');
          return;
        }

        // 等待2秒后继续轮询
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('轮询失败:', error);
        // 继续轮询，不中断
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  } finally {
    isPolling.value = false;
  }
};

watch(dateParam, () => {
  fetchReports();
  fetchVideos();
});

onMounted(() => {
  fetchReports();
  fetchVideos();
});

onUnmounted(() => {
  isPolling.value = false;
});
</script>

<style lang="scss" scoped>
.daily-report-detail-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.date-tag {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
  background: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.content-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-select {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-select-input {
  width: 320px;
  max-width: 100%;
}

.report-videos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.report-content {
  min-height: 320px;
  display: block;
}

.report-content :deep(.markdown-renderer) {
  overflow: visible;
  flex: none;
}

@media (max-width: 768px) {
  .daily-report-detail-page {
    padding: 12px;
  }

  .date-tag {
    margin-left: 0;
  }

  .report-select-input {
    width: 100%;
  }
}
</style>
