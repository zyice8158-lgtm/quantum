<template>
  <div class="dropdown-container">
    <!-- 下拉框触发器 -->
    <div class="dropdown-trigger" :class="{ 'dropdown-open': isOpen }" @click="toggleDropdown">
      <span class="selected-option">{{ selectedOption }}</span>
      <span class="dropdown-arrow"><IconArrowLeft class="w-[24px] h-[24px] text-text-on-surface-muted" /></span>
    </div>

    <!-- 下拉菜单 -->
    <div v-show="isOpen" class="dropdown-menu">
      <div
        v-for="option in options"
        :key="option.value"
        class="dropdown-item"
        :class="{ selected: option.value === currentValue }"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { IconArrowLeft } from "@quantum/icons";

const props = defineProps({
  modelValue: {
    type: String,
    default: "English",
  },
  options: {
    type: Array,
    // TODO 语言列表来源链接 https://lenovonam.sharepoint.com/:x:/r/sites/IDGAIEcosystem/_layouts/15/doc2.aspx?sourcedoc=%7B7F217206-6EEC-45A3-915E-E64641EAF8B8%7D&file=Golden%20Test%20Case%20Data%20Source.xlsx&action=default&mobileredirect=true；
    default: () => [
      { label: "English (UK)", value: "en-GB" },
      { label: "English (US)", value: "en-US" },
      { label: "English (India)", value: "en-IN" },
      { label: "English (South Africa)", value: "en-ZA" }, // 对应“English (African Accent)”选用常见地区
      { label: "Spanish (Spain)", value: "es-ES" },
      { label: "Spanish (Mexico)", value: "es-MX" },
      { label: "Portuguese (Brazil)", value: "pt-BR" },
      { label: "Chinese (CN)", value: "zh-CN" },
      { label: "Italian (IT)", value: "it-IT" },
      { label: "German (DE)", value: "de-DE" },
      { label: "Arabic (Egypt)", value: "ar-EG" },
      { label: "Japanese (JP)", value: "ja-JP" },
      { label: "French (FR)", value: "fr-FR" },
      { label: "Polish (PL)", value: "pl-PL" },
      { label: "Romanian (RO)", value: "ro-RO" },
    ],
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const currentValue = ref(props.modelValue);

// 计算选中的选项标签
const selectedOption = ref("");

// 根据value获取对应的label
const getOptionLabel = (value) => {
  const option = props.options.find((opt) => opt.value === value);
  return option ? option.label : value;
};

// 切换下拉框显示/隐藏
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// 选择选项
const selectOption = (option) => {
  currentValue.value = option.value;
  selectedOption.value = option.label;
  isOpen.value = false;
  emit("update:modelValue", option.value);
  emit("change", option.value);
};

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  const dropdown = document.querySelector(".dropdown-container");
  if (dropdown && !dropdown.contains(event.target)) {
    isOpen.value = false;
  }
};

// 初始化选中项
onMounted(() => {
  selectedOption.value = getOptionLabel(currentValue.value);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
::-webkit-scrollbar{
  display: none;
}
.dropdown-container {
  position: relative;
  display: inline-block;
  /* min-width: 210px; */
  height: 36px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid var(--color-focus);
  border-radius: 16px;
  height: 36px;
  background-color: var(--color-on-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.dropdown-trigger:hover {
  border-color: var(--color-focus);
}

.dropdown-trigger.dropdown-open {
  border-color: var(--color-focus);
}

.selected-option {
  font-size: 14px;
  color: var(--color-focus);
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 10px;
  color: var(--color-focus);
  transition: transform 0.2s;
  margin-left: 8px;
  transform: rotate(-90deg);
}

.dropdown-trigger.dropdown-open .dropdown-arrow {
  transform: rotate(90deg);
  font-weight: 600;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-on-primary);
  border: 1px solid var(--color-state-focus-focus-hover);
  border-radius: 15px;
  box-shadow: 0 2px 12px 0 var(--color-state-focus-focus-pressed);
  margin-top: 4px;
  z-index: 1000;
  /* width: 210px; */
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color-focus);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: var(--color-state-focus-focus-hover);
  font-weight: 600;
}

.dropdown-item.selected {
  background-color: var(--color-secondary-container);
  font-weight: 600;
}

</style>
