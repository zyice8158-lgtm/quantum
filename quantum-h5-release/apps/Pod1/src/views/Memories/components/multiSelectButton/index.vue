<template>
  <div
    :class="[
      'p-[2px] rounded-max my-[16px] mr-[8px] border-transparent border-[2px]',
      buttonActive ? 'border-primary!' : '',
    ]"
  >
    <button
      :class="[
        'flex justify-center items-center bg-surface text-text-on-surface px-[14px] py-[7px]  rounded-full text-[11px]/[16px] font-bold cursor-pointer',
      ]"
      @click="
        (e) => {
          show(e);
        }
      "
      v-automation=automationId
    >
      <component :is="titleIcon" class="w-[18px] h-[18px] text-primary mr-[8px]" />
      <span>{{ title }}</span>
      <IconArrorDown class="w-[18px] h-[18px] text-text-on-surface ml-[8px]" />
    </button>
  </div>
  <Popover
    ref="op"
    class="max-h-[248px] overflow-y-auto"
    @hide="
      () => {
        buttonActive = false;
      }
    "
  >
    <div
      v-for="(item, index) of localOptions"
      :key="item.value"
      v-tooltip.bottom="{value:item.tooltip,pt:{text:'bg-overlay-scrim! text-surface!'}}"
      :class="[
        'w-[176px] h-[48px] flex items-center justify-between gap-[4px] pl-[4px] pr-[8px] text-body-m leading-body-m',
        index === 0 ? '-mt-[6px]' : '',
      ]"
    >
      <label :for="item.value">{{ item.label }}</label>
      <Checkbox
        :model-value="localActiveFileType"
        :inputId="item.value"
        name="fileType"
        :value="item.value"
        @update:model-value="(checkItems:Array<string>) => updateFileType(checkItems,item.value)"
        v-automation="item.label"
      />
    </div>
  </Popover>
</template>
<script setup lang="ts">
import { ref, defineOptions, defineProps, watch } from "vue";
import Popover from "@libs/p-comps/volt/Popover.vue";
import Checkbox from "@libs/p-comps/volt/Checkbox.vue";
import { IconArrorDown } from "@quantum/icons";
import { FileTypeItem } from "./index";
import { useLocale } from "@/hooks/i18n";

defineOptions({
  name: "MultiSelectButton",
});
const op = ref(null);
const buttonActive = ref(false);

const props = defineProps({
  title: String,
  titleIcon: Object,
  options: Array<FileTypeItem>,
  modelValue: Array<String>,
  needAll: Boolean,
  automationId: String,
});
const emit = defineEmits(["update:modelValue"]);

const { t, locale } = useLocale();

const localOptions = props.needAll
  ? ref([{ label: t("FKB.CategoriesRadioAll"), value: "All" }, ...props.options])
  : ref(props.options);
const show = (e: Event) => {
  op.value.toggle(e);
  buttonActive.value = true;
};
const localActiveFileType = ref(props.modelValue);

const updateFileType = (checkItems: Array<string>, value: string) => {
  if (props.title.includes("Categories")) {
    if (value === "All") {
      emit("update:modelValue",checkItems.filter((item) => item === "All"))
    } else {
      if (value.includes("Memories")) {
        emit("update:modelValue",checkItems.filter((item) => item.includes("Memories")))
      } else {
        emit("update:modelValue",checkItems.filter((item) => item.includes("Documents")))
      }
    }
  } else {
    emit("update:modelValue", checkItems);
  }
};
watch(
  () => props.modelValue,
  (newVal) => {
    localActiveFileType.value = props.modelValue
  }
);
watch(
  () => props.options,
  (newVal) => {
    localOptions.value = newVal;
  }
);
</script>
