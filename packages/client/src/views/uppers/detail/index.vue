<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getUppersDetail } from '@client/api/upper';
import { getVideosList } from '@client/api/video';
import type {
  GetUppersDetailRes,
  GetUppersDetailReq,
} from '@express-vue-template/types/api/upper/types';
import type { GetVideosListRes } from '@express-vue-template/types/api/video/types';
import UpperHero from './components/UpperHero.vue';
import VideoGroupList from './components/VideoGroupList.vue';

defineOptions({
  name: 'UppersDetailPage',
});

const route = useRoute();
const upperDetail = ref<GetUppersDetailRes | null>(null);
const videos = ref<GetVideosListRes>([]);
const loading = ref(false);
let autoRefreshTimer: number | null = null;

const upperId = computed(() => Number(route.query.id));
const isValidUpperId = computed(() => Number.isFinite(upperId.value));

// 检查是否有处于处理中的视频
const hasProcessingVideo = computed(() =>
  videos.value.some((video) => video.processing)
);

// 清除定时器
const clearAutoRefreshTimer = () => {
  if (autoRefreshTimer !== null) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
};

// 启动自动刷新定时器
const startAutoRefresh = () => {
  clearAutoRefreshTimer();
  autoRefreshTimer = window.setInterval(async () => {
    if (!isValidUpperId.value) {
      clearAutoRefreshTimer();
      return;
    }
    const videosRes = await getVideosList({ upperId: upperId.value });
    videos.value = videosRes.data;

    // 如果没有处理中的视频，停止自动刷新
    if (!hasProcessingVideo.value) {
      clearAutoRefreshTimer();
    }
  }, 5000);
};

const fetchDetail = async () => {
  if (!isValidUpperId.value) {
    return;
  }

  try {
    loading.value = true;
    const [detailRes, videosRes] = await Promise.all([
      getUppersDetail({ id: upperId.value } as GetUppersDetailReq),
      getVideosList({ upperId: upperId.value }),
    ]);

    upperDetail.value = detailRes.data;
    videos.value = videosRes.data;

    // 如果有处理中的视频，启动自动刷新
    if (hasProcessingVideo.value) {
      startAutoRefresh();
    }
  } finally {
    loading.value = false;
  }
};

// 监听处理中视频的变化
watch(hasProcessingVideo, (newVal) => {
  if (newVal) {
    startAutoRefresh();
  } else {
    clearAutoRefreshTimer();
  }
});

watch(
  () => route.query.id,
  () => {
    clearAutoRefreshTimer();
    fetchDetail();
  }
);

onMounted(fetchDetail);

onUnmounted(() => {
  clearAutoRefreshTimer();
});
</script>

<template>
  <div class="uppers-detail-page">
    <upper-hero
      v-if="upperDetail"
      :detail="upperDetail"
      @request-update-video-list="fetchDetail"
    />

    <div v-else-if="loading" class="card-area">
      <div class="loading">加载中...</div>
    </div>

    <div v-else class="card-area">
      <el-empty description="未找到 UP 主信息" />
    </div>

    <video-group-list
      :videos="videos"
      :loading="loading"
      @request-update-video-list="fetchDetail"
    />
  </div>
</template>

<style lang="scss" scoped>
.uppers-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading {
  padding: 24px 0;
  text-align: center;
  color: #8a8a8a;
}
</style>
