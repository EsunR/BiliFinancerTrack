<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import filters from '@client/utils/filters';
import { VideoStatusEnum } from '@express-vue-template/types/model/video';
import type {
  GetVideosListRes,
  VideoListItem,
} from '@express-vue-template/types/api/video/types';
import { getBiliImageProxyUrl } from '@client/utils/image';
import { postVideosAnalyze } from '@client/api/video';

defineOptions({
  name: 'VideoGroupList',
});

const props = defineProps<{
  videos: GetVideosListRes;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'request-update-video-list'): void;
}>();

const router = useRouter();
const analyzingId = ref<number | null>(null);

const formatDate = (time: string | number | Date, format = 'YYYY-MM-DD') =>
  filters.formatTime(time instanceof Date ? time.toISOString() : time, format);

const statusMeta: Record<
  VideoStatusEnum,
  { label: string; className: string }
> = {
  [VideoStatusEnum.PENDING]: { label: '待处理', className: 'status-pending' },
  [VideoStatusEnum.DOWNLOADED]: {
    label: '已下载',
    className: 'status-downloaded',
  },
  [VideoStatusEnum.AUDIO_EXTRACTED]: {
    label: '已分离音频',
    className: 'status-audio',
  },
  [VideoStatusEnum.TRANSCRIBED]: {
    label: '已转写',
    className: 'status-transcribed',
  },
};

const groupedVideos = computed(() => {
  const groups: Record<string, VideoListItem[]> = {};
  props.videos.forEach((video) => {
    const dateKey = dayjs(video.publishAt).format('YYYY-MM');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(video);
  });

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({
      date,
      items: groups[date],
    }));
});

const handleVideoClick = (video: VideoListItem) => {
  if (video.processing || video.status !== VideoStatusEnum.TRANSCRIBED) {
    return;
  }

  router.push({
    name: 'VideosDetail',
    query: { id: String(video.id), upperId: String(video.upper.id) },
  });
};

const handleTranscribe = async (video: VideoListItem) => {
  if (analyzingId.value || video.processing) {
    return;
  }

  try {
    analyzingId.value = video.id;
    await postVideosAnalyze({ id: video.id });
    emit('request-update-video-list');
  } finally {
    analyzingId.value = null;
  }
};
</script>

<template>
  <div class="video-section">
    <div class="section-title">视频列表</div>
    <div v-if="loading" class="loading">加载中...</div>
    <el-empty v-else-if="!videos.length" description="暂无视频" />
    <div v-else class="video-groups">
      <div v-for="group in groupedVideos" :key="group.date">
        <div class="group-date">{{ group.date }}</div>
        <div class="video-grid">
          <div
            v-for="video in group.items"
            :key="video.id"
            class="video-card"
            :class="{
              'is-transcribed': video.status !== VideoStatusEnum.TRANSCRIBED,
              'is-clickable':
                !video.processing &&
                video.status === VideoStatusEnum.TRANSCRIBED,
              'is-processing': video.processing,
            }"
            @click="handleVideoClick(video)"
          >
            <div class="cover">
              <span v-if="video.processing" class="processing-tag">
                <i class="processing-spinner" />
                处理中
              </span>
              <span v-if="video.statusFailed" class="failed-tag">
                处理失败
              </span>
              <img
                :src="getBiliImageProxyUrl(video.coverUrl)"
                :alt="video.title"
              />
              <div
                v-if="
                  !video.processing &&
                  video.status !== VideoStatusEnum.TRANSCRIBED
                "
                class="cover-actions"
              >
                <el-button
                  size="small"
                  type="primary"
                  :loading="analyzingId === video.id"
                  :disabled="video.processing"
                  @click.stop="handleTranscribe(video)"
                >
                  AI 分析
                </el-button>
              </div>
            </div>
            <div class="video-info">
              <div class="title">{{ video.title }}</div>
              <div class="meta">
                <span
                  class="status"
                  :class="statusMeta[video.status].className"
                >
                  {{ statusMeta[video.status].label }}
                </span>
                <span class="publish">
                  发布于 {{ formatDate(video.publishAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading {
  padding: 24px 0;
  text-align: center;
  color: #8a8a8a;
}

.video-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
}

.video-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.group-date {
  font-size: 14px;
  font-weight: 600;
  color: #4a4a4a;
  margin-bottom: 8px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.video-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  background: #fff;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
}

.video-card.is-clickable {
  cursor: pointer;
}

.video-card.is-processing {
  cursor: default;
}

.video-card.is-transcribed .cover-actions {
  pointer-events: none;
}

.video-card.is-transcribed:hover .cover-actions {
  opacity: 1;
  pointer-events: auto;
}

.cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #f5f5f5;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.failed-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(245, 108, 108, 0.9);
  color: #fff;
}

.processing-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(64, 158, 255, 0.9);
  color: #fff;
}

.processing-spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.cover-actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.video-info {
  padding: 12px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .title {
    font-size: 14px;
    font-weight: 600;
    color: #1f1f1f;
    line-height: 1.4;
    min-height: 36px;
  }

  .meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: #8a8a8a;
  }
}

.status {
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 12px;
}

.status-pending {
  background: #fdf6ec;
  color: #e6a23c;
}

.status-downloaded {
  background: #ecf5ff;
  color: #409eff;
}

.status-audio {
  background: #f0f9eb;
  color: #67c23a;
}

.status-transcribed {
  background: #f4f4ff;
  color: #6b6ef5;
}
</style>
