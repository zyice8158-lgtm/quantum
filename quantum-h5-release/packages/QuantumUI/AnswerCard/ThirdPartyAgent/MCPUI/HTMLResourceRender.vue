<template>
  <ui-resource-renderer
    ref="iframeRefContainer"
    :resource="resource"
    :html-props="JSON.stringify(htmlPropsR)"
  />
</template>

<script setup lang="tsx">
import {
  ref,
  onMounted,
  watch,
  type CSSProperties,
  type Ref,
  type HTMLAttributes,
  computed,
} from 'vue'
import type { UIActionResult } from './types'
import './ui-resource-renderer.wc.js';
import { Resource } from './type';

interface HTMLResourceRendererProps {
  onUIAction?: (result: UIActionResult) => Promise<unknown>
  style?: CSSProperties
  proxy?: string
  iframeRenderData?: Record<string, unknown>
  autoResizeIframe?: boolean | { width?: boolean; height?: boolean }
  sandboxPermissions?: string
  iframeProps?: Omit<HTMLAttributes, 'src' | 'srcDoc' | 'style'> & {
    ref?: Ref<HTMLIFrameElement | null>
  }
}

const ALL_RESOURCE_CONTENT_TYPES = ['rawHtml', 'externalUrl', 'remoteDom'] as const;
type ResourceContentType = (typeof ALL_RESOURCE_CONTENT_TYPES)[number];

const props = defineProps<{
  resource: Resource;
  onUIAction?: (result: UIActionResult) => Promise<unknown>;
  supportedContentTypes?: ResourceContentType[];
  htmlProps?: HTMLResourceRendererProps;
  remoteDomProps?: Object;
}>()

const htmlPropsR = computed(() => {
  const { iframeProps, ...p } = props.htmlProps

  return p
})

const iframeRefContainer = ref<HTMLIFrameElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)

const InternalMessageType = {
  UI_MESSAGE_RECEIVED: 'ui-message-received',
  UI_MESSAGE_RESPONSE: 'ui-message-response',
  UI_SIZE_CHANGE: 'ui-size-change',
  UI_LIFECYCLE_IFRAME_READY: 'ui-lifecycle-iframe-ready',
  UI_LIFECYCLE_IFRAME_RENDER_DATA: 'ui-lifecycle-iframe-render-data',
} as const


watch(() => props.htmlProps.iframeProps.ref, (n, o) => {
  if (!n) {
    iframeRefContainer.value.removeEventListener('onUIAction', onUIAction)
  }
})

function onUIAction(e: CustomEvent) {
  props.onUIAction(e.detail || {})
}

onMounted(() => {
  if (iframeRefContainer.value) {
    iframeRefContainer.value.addEventListener('onUIAction', onUIAction)
    setTimeout(() => {
      iframeRef.value = iframeRefContainer.value.querySelector('iframe')

      props.htmlProps.iframeProps.ref = iframeRef
    }, 0)
  }
})
</script>
<style lang="less">
ui-resource-renderer {
  width: 100%;
  margin: 0;
  box-shadow: none;
  border: none;
  overflow: hidden;
  display: block;
  iframe {
    width: 100%;
    height: 100%;
    box-shadow: none;
    border: none;
  }
}
</style>
