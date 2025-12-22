<template>
  <div
    class="
      text-[var(--color-text-on-surface-variant)]
      body-m
      font-normal
      not-italic
    "
  >
    <div v-html="renderDOM"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
const props = defineProps<{
  response: string
}>()

const renderDOM = computed(() => {
  return marked.parser(marked.lexer(props.response || '')) || '';
});
</script>
