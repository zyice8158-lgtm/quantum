<template>
  <div class="custom-checkbox" @click="toggleCheckbox">
    <div class="checkbox-input" :class="{ checked: modelValue, disabled: disabled }">
      <svg v-if="modelValue" class="checkbox-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    </div>
    <input 
      type="checkbox" 
      :checked="modelValue" 
      :disabled="disabled"
      @change="toggleCheckbox"
      class="checkbox-original"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const toggleCheckbox = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
};
</script>

<style scoped>
.custom-checkbox {
  position: relative;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  border: 2px solid #787777;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-input.checked {
  background-color: #855EE1;
  border-color: #855EE1;
}

.checkbox-input:hover:not(.disabled) {
  /* border-color: #855EE1; */
}

.checkbox-input.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-icon {
  width: 16px;
  height: 16px;
  color: white;
}

.checkbox-original {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
</style>