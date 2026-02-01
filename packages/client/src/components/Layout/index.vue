<template>
  <div class="layout flex flex-col min-h-[100vh] bg-gray-100">
    <layout-header class="mb-4" />
    <div class="layout-content px-4 pb-4 max-w-[1600px] w-full mx-auto">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LayoutHeader from './Header.vue';

export default defineComponent({
  name: 'Layout',
  components: {
    LayoutHeader,
  },
  setup() {
    return {};
  },
});
</script>
