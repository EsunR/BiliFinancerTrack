<script lang="ts" setup>
import { postUppersSync } from '@client/api/upper';
import filters from '@client/utils/filters';
import { getBiliImageProxyUrl } from '@client/utils/image';
import type { GetUppersDetailRes } from '@express-vue-template/types/api/upper/types';
import { ElMessage } from 'element-plus';

defineOptions({
  name: 'UpperHero',
});

const props = defineProps<{ detail: GetUppersDetailRes }>();
const emit = defineEmits<{
  (e: 'requestUpdateVideoList'): void;
}>();

const syncing = ref(false);

const formatDate = (time: string | number | Date) =>
  filters.formatTime(
    time instanceof Date ? time.toISOString() : time,
    'YYYY-MM-DD'
  );

const handleSync = async () => {
  try {
    syncing.value = true;
    await postUppersSync({
      id: props.detail.id,
    });
    ElMessage.success('已同步 UP 主的最新视频');
    emit('requestUpdateVideoList');
  } finally {
    syncing.value = false;
  }
};
</script>

<template>
  <div class="hero card-area">
    <div
      class="hero-bg"
      :style="{
        backgroundImage: `url(${getBiliImageProxyUrl(detail.avatar)})`,
      }"
    ></div>
    <div class="hero-content">
      <div class="hero-content-left">
        <img class="hero-avatar" :src="getBiliImageProxyUrl(detail.avatar)" />
        <div class="hero-info">
          <div class="hero-name">{{ detail.name }}</div>
          <div class="hero-meta">
            <span>创建时间：{{ formatDate(detail.createdAt) }}</span>
            <span>视频数量：{{ detail.videoCount }}</span>
          </div>
        </div>
      </div>
      <div class="hero-content-right">
        <el-button type="primary" :loading="syncing" @click="handleSync"
          >同步</el-button
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 0;
  height: 160px;
  border-radius: 16px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(14px);
  transform: scale(1.08);
}

.hero-content {
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  height: 100%;
  justify-content: space-between;
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: relative;

  &-left {
    display: flex;
    gap: 20px;
    align-items: center;
  }
}

.hero-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.7);
  object-fit: cover;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-name {
  font-size: 28px;
  font-weight: 700;
}

.hero-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  opacity: 0.9;
}
</style>
