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
.dropdown-container {
  position: relative;
  display: inline-block;
  min-width: 210px;
  height: 36px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 16px;
  height: 36px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.dropdown-trigger:hover {
  border-color: #c0c4cc;
}

.dropdown-trigger.dropdown-open {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.selected-option {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 10px;
  color: #c0c4cc;
  transition: transform 0.2s;
  margin-left: 8px;
  transform: rotate(-90deg);
}

.dropdown-trigger.dropdown-open .dropdown-arrow {
  transform: rotate(90deg);
  font-weight: 600;
  /* color: #409eff; */
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  z-index: 1000;
  width: 210px;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 8px 12px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: background-color 0.2s ease;
  /* border-bottom: 1px solid #f0f0f0; */
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
  font-weight: 600;
  /* color: #409eff; */
}

.dropdown-item.selected {
  background-color: #ecf5ff;
  font-weight: 600;
  /* color: #409eff;
    font-weight: 500;*/
}

/* 滚动条样式 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
