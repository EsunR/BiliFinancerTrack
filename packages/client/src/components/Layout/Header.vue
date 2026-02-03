<template>
  <div
    class="bg-white h-15 flex items-center justify-between pl-5 pr-5 shadow relative z-1"
  >
    <span class="text-xl cursor-pointer" @click="onTitleClick">
      BiliFinancerTrack
    </span>
    <div class="flex items-center gap-4">
      <el-button :icon="SettingIcon" link @click="onSettingsClick" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { Setting as SettingIcon } from '@element-plus/icons-vue';

const router = useRouter();

function onTitleClick() {
  router.push({ name: 'Home' });
}

function onSettingsClick() {
  router.push({ name: 'Settings' });
}
</script>
