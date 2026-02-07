<template>
  <div class="settings-page">
    <h1 class="text-3xl font-bold mb-6">设置</h1>
    <holdings-section />
    <prompts-section />
  </div>
</template>

<script lang="ts" setup>
import HoldingsSection from './components/HoldingsSection.vue';
import PromptsSection from './components/PromptsSection.vue';
</script>
