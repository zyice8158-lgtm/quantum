<template>
<div class="language-setting-page">
	<div class="flex w-full justify-between items-center mb-[16px] h-[24px]">
		<div class="flex items-center">
			<span class="title-s languageSet text-on-focus-container">{{ t('payAttention.languageSettings') }}</span>
		</div>
    <div
      class="cursor-pointer"
      @click="handleClose"
      @keydown="handleCloseKeyDown"
      tabindex="0"
      role="button"
      :aria-label="t('common.close')"
      v-tooltip.bottom="{ value: t('common.close'), showDelay: 100, hideDelay: 300 }"
    >
      <IconClose class="w-[24px] h-[24px] text-on-focus-container" />
    </div>
	</div>
	<div class="flex  gap-[8px] h-[64px]">
		<div class="w-full mb-[8px] justify-between items-center text-label-l">
		  <IftaLabel class="w-full" for="sourceLanguage">
        <Select
          v-model="sourceLanguage"
          :options="[{ name: t('payAttention.languages.auto'), code: 'auto' }, ...LANGUAGE_LIST]"
          optionLabel="name"
          optionValue="code"
          class="w-full h-[64px]"
          variant="filled"
        />
        <label for="dd-city">{{ t('payAttention.source') }}</label>
      </IftaLabel>
		</div>
		<div class="w-full justify-between items-center text-label-l">
      <IftaLabel class="w-full" for="sourceLanguage">
        <Select
          v-model="targetLanguage"
          :options="LANGUAGE_LIST"
          optionLabel="name"
          optionValue="code"
          class="w-full h-[64px]"
          variant="filled"
        />
        <label for="dd-city">{{ t('payAttention.target') }}</label>
      </IftaLabel>
		</div>
	</div>
	<div class="mt-[16px] flex justify-end gap-[8px]">
    <QButton  variant="text" color="actions" @click="handleCancel">{{t('payAttention.cancel')}}</QButton>
    <QButton color="primary" @click="handleApply">{{ t('payAttention.apply') }}</QButton>
	</div>
</div>
</template>

<script setup lang="ts">
import Dialog from "@libs/p-comps/volt/Dialog.vue";
// import Select from "@libs/p-comps/volt/Select.vue";
import Button from "@libs/p-comps/volt/Button.vue";
import { QIcons } from "@libs/p-comps";
import { computed, ref } from "vue";
import { getLanguageList } from "./languageList.ts";
import { setTranslationLaguage } from "@libs/service";
import { payAttentionStore, setPayAttentionStore } from "@/store/payAttention";
import { useLocale } from "@/hooks/i18n";
import {  QButton } from '@libs/p-comps/volt/QButton';
import { IconClose, IconTarget, IconTarget2 } from "@quantum/icons";
import Select from "@libs/p-comps/volt/QSelect/index.vue";
import IftaLabel from "primevue/iftalabel";
const { t } = useLocale();

const LANGUAGE_LIST = computed(() => getLanguageList(t));

// 使用 ref 存储本地值，初始值从 store 读取
const sourceLanguage = ref(payAttentionStore.sourceLanguage || 'auto');
const targetLanguage = ref(payAttentionStore.targetLanguage);

const handleCancel = (): void => {
  // 取消时恢复为 store 中的值
  sourceLanguage.value = payAttentionStore.sourceLanguage || 'auto';
  targetLanguage.value = payAttentionStore.targetLanguage;
  	emit("setClose",false);
};

const emit = defineEmits<{
  (e: 'setClose', value: boolean): void
}>()
const handleClose = (): void => {
  emit("setClose",false);
};

const handleCloseKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleClose();
  }
};

const handleApply = async (): Promise<void> => {
  try {
    await setPayAttentionStore('sourceLanguage', sourceLanguage.value);
    await setPayAttentionStore('targetLanguage', targetLanguage.value);

    await setTranslationLaguage({
      MessageSource: "window1",
      Data: { sourceLanguage: sourceLanguage.value, targetLanguage: targetLanguage.value },
    });
  	emit("setClose",false);
  } catch (error) {
    console.error("setTranslationLaguage error", error);
  	emit("setClose",false);
  }
};

</script>

<style lang="less" scoped>
.language-setting-page {
  background: var(--color-surface);
  height: 200px;
	padding: 24px 16px;
	border-radius: var(--radius-20);
	margin-bottom: 12px;
	.languageSet{
		color: var(--color-focus-focus); // to 确认
	}
}
</style>
