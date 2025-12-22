<template>
  <div class="language-switcher">
    <select 
      :value="currentLocale" 
      @change="handleLocaleChange"
      class="language-select"
      :disabled="isSwitching"
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocale } from '@/hooks/i18n'
import type { Locale } from '@/i18n'

const { locale, switchLocale } = useLocale()
const isSwitching = ref(false)

const currentLocale = computed(() => locale())

const handleLocaleChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  isSwitching.value = true
  try {
    await switchLocale(target.value as Locale)
  } finally {
    isSwitching.value = false
  }
}
</script>

<style scoped>
.language-switcher {
  display: inline-block;
}

.language-select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background-color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.language-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.language-select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>