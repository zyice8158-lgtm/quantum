<template>
  <div class="relative code-block">
    <!-- 代码标题和复制按钮容器 -->
    <div class="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
      <div class="text-sm font-medium" v-if="title">{{ title }}</div>
      <div class="flex items-center space-x-2">
        <span v-if="language" class="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{{
          language
        }}</span>
        <button
          class="copy-btn text-gray-300 hover:text-white transition-colors"
          @click="copyCode"
          :title="copied ? '已复制!' : '复制代码'"
        >
          <svg
            v-if="!copied"
            class="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            ></path>
          </svg>
          <svg
            v-else
            class="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 代码内容容器 -->
    <div class="relative">
      <!-- 行号 -->
      <div
        v-if="showLineNumbers"
        class="absolute left-0 top-0 bottom-0 bg-gray-100 dark:bg-gray-900 text-right pr-2 py-2 hidden sm:block"
      >
        <div v-for="i in lineCount" :key="i" class="text-gray-500 text-sm h-5">
          {{ i }}
        </div>
      </div>

      <!-- 代码内容 -->
      <pre :class="['code-content', { 'pl-4': !showLineNumbers, 'pl-16': showLineNumbers }]">
        <code v-if="language" :class="`language-${language}`" v-html="highlightedCode"></code>
        <code v-else v-html="escapeHtml(code)"></code>
      </pre>
    </div>

    <!-- 复制成功提示 -->
    <div
      v-if="copied"
      class="copy-toast absolute right-4 top-12 bg-green-600 text-white text-xs px-2 py-1 rounded"
    >
      已复制到剪贴板
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

// 组件属性
const props = defineProps({
  // 代码内容
  code: {
    type: String,
    required: true,
  },
  // 代码语言
  language: {
    type: String,
    default: "",
  },
  // 代码标题
  title: {
    type: String,
    default: "",
  },
  // 是否显示行号
  showLineNumbers: {
    type: Boolean,
    default: false,
  },
});

// 状态
const copied = ref(false);

// 计算属性
const lineCount = computed(() => {
  return props.code.split("\n").length;
});

const highlightedCode = computed(() => {
  // 这里可以集成代码高亮库，比如highlight.js或prismjs
  // 对代码内容进行HTML转义，确保HTML标签显示为文本
  return escapeHtml(props.code);
});

// HTML转义函数
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

// 方法
const copyCode = async () => {
  try {
    // 复制代码到剪贴板
    await navigator.clipboard.writeText(props.code);

    // 显示复制成功状态
    copied.value = true;

    // 2秒后重置状态
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("复制失败:", err);
    // 降级方案：创建临时文本区域
    const textArea = document.createElement("textarea");
    textArea.value = props.code;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (fallbackErr) {
      console.error("降级复制也失败:", fallbackErr);
    }

    document.body.removeChild(textArea);
  }
};

// 监听代码变化，重置复制状态
watch(
  () => props.code,
  () => {
    copied.value = false;
  }
);
</script>

<style scoped>
.code-block {
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  border-radius: 0.375rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-width: 100%;
}

.code-content {
  margin: 0;
  padding: 1rem;
  background-color: #f8fafc;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.copy-toast {
  z-index: 10;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
  20%,
  80% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .code-content {
    font-size: 0.75rem;
  }
}
</style>
