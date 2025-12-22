<template>
  <QButton
    v-for="item in buttonItems"
    :key="item.status"
    color="secondary"
    :rounded="false"
    :class="['select-btn', isSelect === item.status ? 'custom-btn' : 'no-bg-btn']"
    @click="handleSelect(item.status)"
    v-automation="item.status"
  >
    {{ t(item.label) }}
  </QButton>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { SelectButtonStatus } from "../../home/index";
import { useLocale } from "@/hooks/i18n";
import { QButton } from '@libs/p-comps/volt/QButton';

const props = defineProps<{
  isSummary: SelectButtonStatus | string;
}>();

const emit = defineEmits<{
  (e: "change", value: SelectButtonStatus): void;
}>();

const { t } = useLocale();
const isSelect = ref<SelectButtonStatus | string>(props.isSummary);

const buttonItems = computed(() => [
  { status: SelectButtonStatus.Summary, label: 'payAttention.summary' },
  { status: SelectButtonStatus.Transcript, label: 'payAttention.transcript' },
  { status: SelectButtonStatus.AudioRecording, label: 'payAttention.audioRecording' },
]);

watch(
  () => props.isSummary,
  (newVal) => {
    isSelect.value = newVal;
  },
  { immediate: true }
);

const handleSelect = (item: SelectButtonStatus): void => {
  if (isSelect.value === item) return;
  isSelect.value = item;
  emit("change", item);
};

defineExpose({ isSelect });
</script>


<style scoped lang="less">
.select-btn {
  flex: 1;

  &:not(:last-child) {
    margin-right: 8px;
  }
}

.custom-btn {
  border-radius: var(--radius-8);
  border: 1px solid var(--color-state-focus-focus-pressed, rgba(0, 0, 0, 0.12));
  background: var(--color-secondary-container);
  overflow: hidden;
  color: var(--color-on-secondary-container);
  text-align: center;
  text-overflow: ellipsis;
  font-family: "Rookery New";
  font-size: var(--text-label-m);
  font-style: normal;
  font-weight: 500;
  line-height: var(--leading-label-m);
  letter-spacing: var(--tracking-l);
}

.no-bg-btn {
  border-radius: var(--radius-8);
  border: 1px solid transparent;
  background: transparent;
  overflow: hidden;
  color: var(--color-text-on-surface-variant);
  text-align: center;
  text-overflow: ellipsis;
  font-family: "Rookery New";
  font-size: var(--text-label-m);
  font-style: normal;
  font-weight: 500;
  line-height: var(--leading-label-m);
  letter-spacing: var(--tracking-l);
}
</style>
