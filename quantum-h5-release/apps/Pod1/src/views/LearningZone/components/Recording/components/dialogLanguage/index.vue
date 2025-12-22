<template>
  <Dialog
    v-model:visible="showDialog"
    :draggable="true"
    class="w-[375px] mr-[40px] mb-[40px]"
    modal
  >
    <template #header>
      <div class="flex w-full justify-between items-center">
        <div class="flex items-center">
          <span class="text-[16px] font-bold">{{ t('learningZone.languageSettings') }}</span>
        </div>
      </div>
    </template>
    <template #default>
      <div class="flex w-full mb-[8px] justify-between items-center text-[14px]">
        <span>{{ t('learningZone.source') }}</span>
        <QIcons name="sourceLanguage" />
        <Select
          v-model="sourceLanguage"
          :options="[{ name: t('learningZone.auto'), code: 'auto' }, ...LANGUAGE_LIST]"
          optionLabel="name"
          class="w-[250px]"
          optionValue="code"
        />
      </div>
      <div class="flex w-full justify-between items-center text-[14px]">
        <span>{{ t('learningZone.target') }}</span>
        <QIcons name="target" />
        <Select
          v-model="targetLanguage"
          optionLabel="name"
          :options="LANGUAGE_LIST"
          @change="handleTargetLanguageChange"
          class="w-[250px]"
          optionValue="code"
        />
      </div>
      <div class="mt-[16px] mb-[12px] flex justify-end gap-[10px]">
        <Button
          class="w-[88px] h-[40px] text-[14px]"
          :label="t('common.cancel')"
          severity="help"
          variant="outlined"
          @click="handleCancel"
        />
        <Button
          class="w-[88px] h-[40px] text-[14px]"
          :label="t('learningZone.apply')"
          severity="help"
          rounded
          @click="handleApply"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "@libs/p-comps/volt/Dialog.vue";
import Select from "@libs/p-comps/volt/Select.vue";
import Button from "@libs/p-comps/volt/Button.vue";
import { QIcons } from "@libs/p-comps";
import { ref } from "vue";
import { LANGUAGE_LIST } from "./index.ts";
import { setTranslationLaguage } from "@libs/service";
import { useLocale } from "@/hooks/i18n";

defineOptions({
  name: "DialogLanguage",
});
const { t } = useLocale();
const showDialog = ref(false); // 是否显示弹窗
const sourceLanguage = ref("zh-CN"); // 源语言
const targetLanguage = ref("en-US"); // 目标语言

const handleTargetLanguageChange = (value: string): void => {
  console.log("targetLanguage", value);
};

const handleCancel = (): void => {
  showDialog.value = false;
};

const handleApply = async (): Promise<void> => {
  try {
    await setTranslationLaguage({
      MessageSource: "window1",
      Data: { sourceLanguage: sourceLanguage.value, targetLanguage: targetLanguage.value },
    });
    showDialog.value = false;
  } catch (error) {
    console.error("setTranslationLaguage error", error);
    showDialog.value = false;
  }
};

const show = (): void => {
  showDialog.value = true;
};

defineExpose({
  show
});

</script>

<style scoped></style>
