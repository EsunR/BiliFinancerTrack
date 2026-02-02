<script lang="ts" setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';

interface Props {
  content: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

// Markdown 渲染器
const md = new MarkdownIt();

/**
 * 渲染 Markdown 内容
 */
const renderedMarkdown = computed(() => {
  return md.render(props.content);
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div
    v-loading="loading"
    class="markdown-renderer"
    v-html="renderedMarkdown"
  />
</template>

<style lang="scss" scoped>
.markdown-renderer {
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

  :deep(h1) {
    font-size: 28px;
    margin-top: 24px;
    margin-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 12px;
  }

  :deep(h2) {
    font-size: 24px;
    margin-top: 20px;
    margin-bottom: 14px;
  }

  :deep(h3) {
    font-size: 20px;
    margin-top: 16px;
    margin-bottom: 12px;
  }

  :deep(p) {
    margin-bottom: 12px;
    line-height: 1.8;
  }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 12px;
    padding-left: 24px;

    li {
      margin-bottom: 8px;
      line-height: 1.6;
    }
  }

  :deep(code) {
    background-color: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }

  :deep(pre) {
    background-color: #f5f7fa;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 12px;

    code {
      background-color: transparent;
      padding: 0;
    }
  }

  :deep(blockquote) {
    border-left: 4px solid #409eff;
    padding-left: 16px;
    margin: 16px 0;
    color: #606266;
  }
}
</style>
