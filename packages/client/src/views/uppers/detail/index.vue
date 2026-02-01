<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
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

const upperId = computed(() => Number(route.query.id));
const isValidUpperId = computed(() => Number.isFinite(upperId.value));

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
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.query.id,
  () => {
    fetchDetail();
  }
);

onMounted(fetchDetail);
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
