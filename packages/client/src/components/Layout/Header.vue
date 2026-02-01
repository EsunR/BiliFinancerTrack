<template>
  <div class="bg-white h-15 flex items-center pl-5 pr-5 shadow relative z-1">
    <span class="text-xl cursor-pointer" @click="onTitleClick">
      BiliFinancerTrack
    </span>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function onTitleClick() {
  router.push({ name: 'Home' });
}
</script>
