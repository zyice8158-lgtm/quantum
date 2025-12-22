<template>
  <SvgIcon
    v-bind="$attrs"
    :name="iconName"
    :size="size"
    :color="color"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SvgIcon } from '../Icons'

type DocKind = 'video' | 'pdf' | 'word' | 'text'

defineOptions({ name: 'FileTypeIcon', inheritAttrs: false })

const DEFAULT_ICON_MAP: Record<DocKind, string> = {
  video: 'iconVideo',
  pdf:   'iconPdf',
  word:  'iconWord',
  text:  'iconText',
}

const props = withDefaults(defineProps<{
  /** 文件名（可选，用于自动推断） */
  filename?: string
  /** 扩展名（可选，优先于 filename 推断），如 "pdf" / ".docx" */
  ext?: string
  /** MIME 类型（可选，优先级最高），如 "application/pdf" */
  mimeType?: string
  /** 直接指定类型（可选），会覆盖自动推断 */
  type?: DocKind
  /** 图标尺寸 */
  size?: number | string
  /** 图标颜色 */
  color?: string
  /** 自定义图标名映射（可选），如 { pdf: 'myPdfIcon' } */
  iconMap?: Partial<Record<DocKind, string>>
  /** 未识别类型的兜底类别 */
  fallback?: DocKind
}>(), {
  size: 24,
  color: '#000',
  fallback: 'text',
})

function normExt(raw?: string): string | undefined {
  if (!raw) return undefined
  // 去掉开头的点、query、hash；统一小写
  const base = raw.trim().toLowerCase().replace(/^\./, '')
  // 进一步从可能的 name.ext?query#hash 截取尾缀
  const m = base.match(/([a-z0-9]+)(?:[#?].*)?$/)
  return m?.[1] || undefined
}

function extFromFilename(name?: string): string | undefined {
  if (!name) return undefined
  const low = name.trim().toLowerCase()
  // filename.ext?query#hash
  const m = low.match(/\.([a-z0-9]+)(?:[#?].*)?$/)
  return m?.[1]
}

function inferKind(mime?: string, ext?: string, fallback: DocKind = 'text'): DocKind {
  // MIME 优先
  if (mime) {
    const m = mime.toLowerCase()
    if (m.startsWith('video/')) return 'video'
    if (m.startsWith('audio/')) return 'video' // 音频并入视频图标
    if (m === 'application/pdf' ||
        m === 'application/x-pdf' || // 偶见
        m === 'application/acrobat') return 'pdf'

    if (
      m === 'application/msword' ||
      m === 'application/vnd.ms-word' || // 偶见
      m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      m === 'application/vnd.openxmlformats-officedocument.wordprocessingml.template'
    ) return 'word'

    if (m.startsWith('text/')) return 'text'
  }

  // 扩展名兜底
  const e = normExt(ext)
  if (e) {
    if ([
      // 视频
      'mp4','mov','m4v','avi','mkv','webm','flv','3gp','wmv',
      // 音频 -> 合并为视频图标
      'mp3','wav','m4a','aac','flac','ogg','oga','opus','wma','aiff','aif','amr','mid','midi','caf'
    ].includes(e)) return 'video'

    if (e === 'pdf') return 'pdf'

    if (['doc','docx','dot','dotx','rtf','wps'].includes(e)) return 'word'

    if (['txt','md','csv','json','yaml','yml','log','ini','tsv'].includes(e)) return 'text'
  }

  return fallback
}

const resolvedExt = computed(() => props.ext ?? extFromFilename(props.filename))
const kind = computed<DocKind>(() => props.type ?? inferKind(props.mimeType, resolvedExt.value, props.fallback))

const effectiveMap = computed(() => ({ ...DEFAULT_ICON_MAP, ...(props.iconMap || {}) }))

const iconName = computed(() => effectiveMap.value[kind.value])

const size = computed(() => props.size)
const color = computed(() => props.color)
</script>
