<template>
  <div class="q-toolbar">
    <slot name="left"></slot>
    <div class="q-toolbar-buttons">
      <button v-for="(btn, idx) in buttons" :key="idx" class="q-toolbar-button" :text="btn.text"
        @click="handleClick(idx,btn.text)">
        <img v-if="btn.icon" :src="btn.icon" />
        {{ btn.text }}
        <img v-if="btn.rightIcon" :src="btn.rightIcon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ToolbarButton {
  text: string;
  icon?: string;
  rightIcon?: string;
}

defineProps<{
  buttons: ToolbarButton[];
}>();
const emit = defineEmits<{
  (e: 'button-click', idx: number, text: string): void;
}>();

function handleClick(idx: number, text: string) {
  emit('button-click', idx, text);
}
</script>

<style lang="less" scoped>
.q-toolbar {
  display: flex;
  align-items: center;
  overflow: auto;
  &-buttons {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-left: 14px;
  }
}
.q-toolbar-button {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 30px;
  background: #F4F5F6;
  border: 1px solid #DDE6F0;
  padding: 11px 16px;   
  font-weight: 700;
  font-size: 14px;
  line-height: 14px;
  gap: 10px;

  img {
    width: 24px;
    height: 24px;
  }
}
</style>
