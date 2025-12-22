<!-- src/views/components/showCode.vue -->
<template>
  <div class="code-highlight-wrapper">
    <div class="code-highlight" v-html="html"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { createHighlighter, type Highlighter } from 'shiki'

// 定义组件属性
const props = defineProps({
  code: {
    type: String,
    required: true,
    description: '需要高亮的代码字符串'
  },
  lang: {
    type: String,
    default: 'html',
    description: '代码语言（如html、js、vue）'
  },
  theme: {
    type: String,
    default: 'github-dark',
    description: 'Shiki主题（如nord、github-dark）'
  },
  formatCode: {
    type: Boolean,
    default: true,
    description: '是否自动格式化代码（主要针对HTML）'
  }
})

const html = ref('')
// 缓存Shiki高亮器实例，避免重复初始化
let highlighterInstance: Highlighter | null = null

// 【核心】自定义HTML代码格式化函数（无任何依赖）
// 功能：给HTML标签添加换行和层级缩进，解决代码不换行的问题
const formatHtmlCode = (code: string) => {
  if (!code || code.trim() === '') return code

  // 步骤1：处理标签的换行（拆分连续标签）
  let formatted = code
    // 匹配开始标签（<xxx），在前面加换行（排除已有换行的情况）
    .replace(/(?<!\n)(<[^/][^>]*>)/g, '\n$1')
    // 匹配自闭合标签（<xxx/>），在后面加换行
    .replace(/(<[^>]*\/>)/g, '$1\n')
    // 匹配结束标签（</xxx>），在前面加换行
    .replace(/(?<!\n)(<\/[^>]*>)/g, '\n$1')
    // 移除开头的多余换行
    .trim()

  // 步骤2：添加层级缩进（提升代码可读性）
  let indentLevel = 0 // 缩进层级
  const indentChar = '  ' // 2个空格作为缩进（可改为\t）
  const lines = formatted.split('\n')
  const indentedLines: string[] = []

  // 定义需要缩进的容器标签（可根据需求扩展）
  const containerTags = ['div', 'ul', 'li', 'svg', 'button', 'section', 'main', 'span', 'pre', 'code']

  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) {
      indentedLines.push('') // 保留空行
      return
    }

    // 处理结束标签：先减缩进，再添加行
    if (trimmedLine.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1)
      indentedLines.push(indentChar.repeat(indentLevel) + trimmedLine)
    } else if (trimmedLine.endsWith('/>')) {
      // 处理自闭合标签：保持当前缩进
      indentedLines.push(indentChar.repeat(indentLevel) + trimmedLine)
    } else {
      // 处理开始标签：先添加行，再加缩进
      indentedLines.push(indentChar.repeat(indentLevel) + trimmedLine)
      // 匹配标签名，判断是否为容器标签，若是则增加缩进层级
      const tagMatch = trimmedLine.match(/<([^>\/\s]+)/)
      if (tagMatch && containerTags.includes(tagMatch[1])) {
        indentLevel++
      }
    }
  })

  return indentedLines.join('\n')
}

// 通用代码格式化函数（区分语言处理）
const formatCodeStr = (code: string, lang: string) => {
  if (!props.formatCode) return code
  // 仅对HTML语言进行格式化，其他语言返回原代码（可扩展）
  return lang === 'html' ? formatHtmlCode(code) : code
}

// 初始化高亮器并生成高亮代码
const highlightCode = async () => {
  if (!props.code) {
    html.value = ''
    return
  }

  // 第一步：格式化代码（添加换行和缩进）
  const formattedCode = formatCodeStr(props.code, props.lang)

  try {
    // 第二步：初始化Shiki高亮器（仅第一次执行）
    if (!highlighterInstance) {
      highlighterInstance = await createHighlighter({
        themes: [props.theme],
        langs: [props.lang],
        defaultTheme: props.theme
      })
    }

    // 动态加载未注册的语言
    if (!highlighterInstance.getLoadedLanguages().includes(props.lang)) {
      await highlighterInstance.loadLanguage(props.lang)
    }

    // 动态加载未注册的主题
    if (!highlighterInstance.getLoadedThemes().includes(props.theme)) {
      await highlighterInstance.loadTheme(props.theme)
    }

    // 第三步：生成高亮后的HTML
    html.value = highlighterInstance.codeToHtml(formattedCode, {
      lang: props.lang,
      theme: props.theme
    })
  } catch (error) {
    console.error('代码高亮失败：', error)
    // 失败时显示格式化后的原始代码
    html.value = `<pre><code>${formattedCode}</code></pre>`
  }
}

// 组件挂载时执行高亮逻辑
onMounted(() => {
  highlightCode()
})

// 监听属性变化，重新高亮代码
watch([() => props.code, () => props.lang, () => props.theme, () => props.formatCode], () => {
  highlightCode()
})
</script>

<style scoped>
/* 外层容器：控制宽度，避免溢出 */
.code-highlight-wrapper {
  width: 100%;
  max-width: 100%;
  margin: 8px 0;
}

/* 代码容器：基础样式 */
.code-highlight {
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto; /* 兜底横向滚动 */
  background-color: #24292e;
}

/* 关键样式：强制保留换行和折行 */
.code-highlight pre,
.code-highlight code {
  white-space: pre-wrap !important; /* 保留换行 + 自动折行（核心） */
  word-wrap: break-word !important; /* 长单词折行 */
  word-break: break-all !important; /* 任意位置折行 */
  line-height: 1.6; /* 增加行高，提升可读性 */
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace; /* 代码专用字体 */
  font-size: 14px; /* 代码字体大小 */
}
</style>
