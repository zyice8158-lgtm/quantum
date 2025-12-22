<template>
  <div v-if="imageStatus === IMAGE_STATUS.INIT" ref="bbox" class="image-init">
    <div></div>
  </div>

  <div
    v-if="imageStatus === IMAGE_STATUS.LOADING"
    class="image-loading"
    :class="props?.['loading-class']"
    :style="{
      opacity: props.loading ? 1 : 0,
      ...style,
    }"
  >
    <div></div>
  </div>

  <img
    v-if="imageStatus === IMAGE_STATUS.SUCCESSFULLY"
    class="image-preview chess"
    :class="props?.['image-class']"
    :style="{
      ...style,
    }"
    :src="src"
    @load="
      (e) => {
        const ele = e.target as HTMLImageElement

        ele.style['background-position'] = getChessStyle(ele.clientWidth)?.['background-position']
        ele.style['background-size'] = getChessStyle(ele.clientWidth)?.['background-size']

        _window.URL.revokeObjectURL(src)
      }
    "
    v-automation="'image_preview_success'"
  />

  <div
    v-if="imageStatus === IMAGE_STATUS.FAILED"
    class="image-failed"
    :class="props?.['failed-class']"
    :style="{
      ...style,
    }"
    v-automation="'image_preview_failed'"
  >
    <div></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import localforage from 'localforage'
import { CACHE_IMAGE_PREFIX } from '@/constant/index'
import { getChessStyle } from '@/utils'
import { imageBase64ToFile, urlToFile } from '@/services/CreatorZone/file'

enum IMAGE_STATUS {
  INIT,
  LOADING,
  SUCCESSFULLY,
  FAILED,
}

const _window = window

const props = defineProps({
  'image-class': String,
  'loading-class': String,
  'failed-class': String,
  src: String,
  loading: Boolean,
  lazy: {
    type: Boolean,
    default: true,
  },
  style: Object,
})

const imageStatus = ref(IMAGE_STATUS.INIT)
const bbox = ref(null)
const src = ref('')


// 存储图片数据
const setImageCacheInfo = async (url, file) => {
  const key = `${CACHE_IMAGE_PREFIX.current}-${url}`

  await localforage.setItem(key, file)
}

// 读取图片数据
const getImageCacheInfo = async (url = '') => {
  const key = `${CACHE_IMAGE_PREFIX.current}-${url}`

  const file = await localforage.getItem(key)

  if (file) {
    return window.URL.createObjectURL(file as Blob)
  } else {
    return ''
  }
}

// 清除图片数据
const removeImageCacheInfo = async (url) => {
  const key = `${CACHE_IMAGE_PREFIX.current}-${url}`

  await localforage.removeItem(key)
}

onMounted(() => {
  if (props.lazy) {
    const observer = new IntersectionObserver((changes) => {
      for (let index = 0; index < changes.length; index++) {
        const changer = changes[index]

        if (changer.intersectionRatio > 0) {
          setSrc()
        }
      }
    })

    observer.observe(bbox.value)
  } else {
    setSrc()
  }
})

watch(
  [() => props.src],
  async () => {
    imageStatus.value = IMAGE_STATUS.INIT

    await nextTick()

    if (props.lazy) {
      const lazyDistance = 100

      const clientWidth = window.document.documentElement.clientWidth || window.innerWidth
      const clientHeight = window.document.documentElement.clientHeight || window.innerHeight

      const { top, right } = bbox.value.getBoundingClientRect()

      if (top - clientHeight <= lazyDistance && right <= clientWidth) {
        setSrc()
      }
    } else {
      setSrc()
    }
  },
  { immediate: false }
)

const setSrc = async () => {
  if (props.src) {
    imageStatus.value = IMAGE_STATUS.LOADING

    if (props.src.startsWith('data:image/') && props.src.includes('base64,')) {
      preLoadImage(window.URL.createObjectURL((await imageBase64ToFile(props.src)) as Blob))
    } else if (props.src.startsWith('https://') || props.src.startsWith('http://')) {
      preLoadImage(window.URL.createObjectURL((await urlToFile(props.src)) as Blob))
    } else if (props.src.startsWith('file:///') || props.src.includes('/assets/')) {
      preLoadImage(props.src)
    } else {
      const url = await getImageCacheInfo(props.src)

      if (url) {
        preLoadImage(url)
      } else {
        const { content } = (await readFileReq(props.src)) as any

        if (content === '') {
          // 清除图片数据
          await removeImageCacheInfo(props.src)

          imageStatus.value = IMAGE_STATUS.FAILED
        } else {
          // 存储图片数据
          await setImageCacheInfo(props.src, await imageBase64ToFile(content))

          const url = await getImageCacheInfo(props.src)

          preLoadImage(url)
        }
      }
    }
  }
}

const preLoadImage = (url) => {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      imageStatus.value = IMAGE_STATUS.SUCCESSFULLY
      src.value = url

      resolve('')
    }
    image.onerror = () => {
      imageStatus.value = IMAGE_STATUS.FAILED

      resolve('')
    }

    image.src = url
  })
}
</script>

<style lang="less" scoped>
.image-init,
.image-loading,
.image-failed {
  width: 100%;
  height: 100%;
  background-color: #f6f6f6;
  display: flex;
  justify-content: center;
  align-items: center;

  > div {
    max-width: 100%;
    max-height: 100%;
    width: 72px;
    height: 54px;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url('@/assets/img/svg/imageFailed.svg');
  }
}

.image-loading {
  background: linear-gradient(287.89deg, #f6f6f6 25%, #e6e8eb 37%, #f6f6f6 63%);
  background-size: 400% 100%;
  animation: image-loading 1.4s ease infinite;

  @keyframes image-loading {
    0% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0 50%;
    }
  }
}

.image-preview {
  max-width: none;
}
</style>
