<template>
  <IftaLabel class="iftalabel" :class="ifclass">
    <InputText
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      variant="filled"
      v-bind="$attrs"
    />
    <label>{{ label }}</label>
  </IftaLabel>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import IftaLabel from 'primevue/iftalabel';

defineProps({
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  ifclass: {
    type: String,
    default: 'w-full md:w-200'
  }
});

const inputValue = defineModel<string>();
</script>

<style scoped lang="less">
.iftalabel {
  position: relative !important;
  display: block !important;

  label {
    position: absolute !important;
    top: 0.5rem !important;
    left: 1rem !important;
    font-size: 0.75rem !important;
    color: var(--color-primary-primary) !important;
    pointer-events: none !important;
    z-index: 1 !important;
    transform: none !important;
    background: transparent !important;
  }

  :deep(.p-inputtext) {
    background-color: #F5F3F7 !important;
    border: 1.5px solid var(--color-primary-container) !important;
    border-radius: 0.75rem !important;
    color: var(--color-text-on-surface) !important;
    transition: all 0.2s ease !important;
    padding: 1.75rem 1rem 0.75rem 1rem !important;
    font-size: 1rem !important;
    width: 100% !important;
    min-height: 56px !important;

    &:hover {
      border-color: var(--color-primary-primary) !important;
    }

    &:focus {
      border-color: var(--color-primary-primary) !important;
      box-shadow: 0 0 0 2px var(--color-state-primary-primary-hover) !important;
      outline: none !important;
    }

    &::placeholder {
      color: var(--color-text-on-surface-variant) !important;
      opacity: 1 !important;
    }
  }
}
</style>
