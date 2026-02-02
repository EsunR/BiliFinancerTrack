<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type {
  TimestampSegment,
  TranscriptAttributes,
} from '@express-vue-template/types/model';
import {
  getVideosAnalysisVersions,
  getVideosAnalysis,
  getVideosTranscripts,
} from '@client/api/video';
import type { AnalysisVersionItem } from '@express-vue-template/types/api/video/types';
import MarkdownRenderer from './components/MarkdownRenderer.vue';
import TranscriptTimeline from './components/TranscriptTimeline.vue';

defineOptions({
  name: 'VideoDetailPage',
});

const route = useRoute();
const router = useRouter();
const videoId = computed(() => Number(route.query.id));
const upperId = computed(() => Number(route.query.upperId));
const hasUpperId = computed(() => Number.isFinite(upperId.value));

// 分析相关
const analysisVersions = ref<AnalysisVersionItem[]>([]);
const selectedAnalysisId = ref<number>();
const analysisContent = ref<string>('');
const analysisLoading = ref(false);

// 转写相关
const transcripts = ref<TranscriptAttributes[]>([]);
const mergedTimestamps = ref<
  Array<TimestampSegment & { absoluteStart: number; absoluteEnd: number }>
>([]);

/**
 * 获取分析版本列表
 */
const fetchAnalysisVersions = async () => {
  try {
    const { data } = await getVideosAnalysisVersions({ id: videoId.value });
    analysisVersions.value = data.versions;
    if (data.versions.length > 0) {
      selectedAnalysisId.value = data.versions[0].id;
      await fetchAnalysisContent();
    }
  } catch (error) {
    console.error('获取分析版本失败:', error);
  }
};

/**
 * 获取分析内容
 */
const fetchAnalysisContent = async () => {
  if (!selectedAnalysisId.value) return;

  analysisLoading.value = true;
  try {
    const { data } = await getVideosAnalysis({
      id: videoId.value,
      analysisId: selectedAnalysisId.value,
    });
    analysisContent.value = data.content;
  } catch (error) {
    console.error('获取分析内容失败:', error);
  } finally {
    analysisLoading.value = false;
  }
};

/**
 * 获取转写内容
 */
const fetchTranscripts = async () => {
  try {
    const { data } = await getVideosTranscripts({ id: videoId.value });
    transcripts.value = data;
    mergeTimestamps(data);
  } catch (error) {
    console.error('获取转写内容失败:', error);
  }
};

/**
 * 合并所有段落的时间戳
 */
const mergeTimestamps = (data: TranscriptAttributes[]) => {
  const result: Array<
    TimestampSegment & { absoluteStart: number; absoluteEnd: number }
  > = [];

  data.forEach((transcript) => {
    const partStartAt = transcript.partStartAt;
    transcript.timestamps.forEach((timestamp) => {
      result.push({
        ...timestamp,
        absoluteStart: partStartAt + timestamp.start,
        absoluteEnd: partStartAt + timestamp.end,
      });
    });
  });

  // 按照时间排序
  result.sort((a, b) => a.absoluteStart - b.absoluteStart);
  mergedTimestamps.value = result;
};

/**
 * 分析版本改变时
 */
const handleAnalysisChange = () => {
  fetchAnalysisContent();
};

/**
 * 返回视频列表页
 */
const handleBack = () => {
  if (hasUpperId.value) {
    router.push({
      name: 'UppersDetail',
      query: { id: String(upperId.value) },
    });
    return;
  }

  router.back();
};

onMounted(() => {
  fetchAnalysisVersions();
  fetchTranscripts();
});
</script>

<template>
  <div class="video-detail-page">
    <!-- 左侧：AI 分析内容 -->
    <section class="section-card analysis-section">
      <div class="analysis-header">
        <el-button @click="handleBack">返回</el-button>
        <el-select
          v-model="selectedAnalysisId"
          placeholder="选择分析版本"
          class="version-select"
          @change="handleAnalysisChange"
        >
          <el-option
            v-for="version in analysisVersions"
            :key="version.id"
            :label="version.promptVersion"
            :value="version.id"
          />
        </el-select>
      </div>

      <markdown-renderer
        :content="analysisContent"
        :loading="analysisLoading"
      />
    </section>

    <!-- 右侧：视频和文本时间轴 -->
    <section class="section-card transcript-section">
      <!-- 视频展示区域（暂不实现） -->
      <div class="video-placeholder">视频展示区域（暂未实现）</div>

      <!-- 文本时间轴 -->
      <div class="timeline-wrapper">
        <h3 class="timeline-title">文本时间轴</h3>
        <transcript-timeline :timestamps="mergedTimestamps" />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.video-detail-page {
  display: flex;
  gap: 24px;
  height: calc(100vh - var(--header-height) - var(--page-bottom-gap));
  box-sizing: border-box;

  .section-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  // 左侧 AI 分析区域
  .analysis-section {
    flex: 1;
    min-width: 0;

    .analysis-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .version-select {
      flex: 1;
    }
  }

  // 右侧视频和时间轴区域
  .transcript-section {
    flex: 1;
    min-width: 0;

    .video-placeholder {
      height: 280px;
      background: #f5f7fa;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      font-size: 16px;
      margin-bottom: 20px;
    }

    .timeline-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .timeline-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #303133;
      }

      :deep(.transcript-timeline) {
        flex: 1;
        overflow-y: auto;
        padding-right: 8px;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-thumb {
          background-color: #dcdfe6;
          border-radius: 3px;

          &:hover {
            background-color: #c0c4cc;
          }
        }
      }
    }
  }
}
</style>
