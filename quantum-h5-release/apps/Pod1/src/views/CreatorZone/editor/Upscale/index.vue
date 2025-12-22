<template>
  <div class="upscale" ref="upscaleRef">
    <div class="loading" v-show="loading">
      <ColorfulLoading
        :style="{
          width: `${imageSize?.width * scale}px`,
          height: `${imageSize?.height * scale}px`,
        }"
      />
    </div>
    <div v-show="!loading" class="upscale-wrap">
      <img
        class="chess"
        :src="currentImageSnapshot?.url"
        :style="{
          ...getChessStyle(imageSize.width),
          left: `${translate.x}px`,
          top: `${translate.y}px`,
          transform: `scale(${scale})`,
        }"
      />
    </div>

    <div class="toolbar bg-surfaces-surface-blur">
      <div
        class="prev"
        :class="{
          disabled: !prevActive,
        }"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                if (prevActive) {
                  e.target.classList.add('hovered');
                }
              },
              cancel: (e) => {
                e.target.classList.remove('hovered');
              },
            };
          }
        "
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.undo'),
              focus: () => {},
              blur: () => {},
              click: () => {
                if (prevActive) {
                  setImageSnapshots(0);
                }
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>

      <div
        class="next"
        :class="{
          disabled: !nextActive,
        }"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                if (nextActive) {
                  e.target.classList.add('hovered');
                }
              },
              cancel: (e) => {
                e.target.classList.remove('hovered');
              },
            };
          }
        "
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.redo'),
              focus: () => {},
              blur: () => {},
              click: () => {
                if (nextActive) {
                  setImageSnapshots(1);
                }
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>

      <div
        class="confirm"
        :class="{
          disabled: loading,
        }"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                if (!loading) {
                  e.target.classList.add('hovered');
                }
              },
              cancel: (e) => {
                e.target.classList.remove('hovered');
              },
            };
          }
        "
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.generate'),
              focus: () => {},
              blur: () => {},
              click: () => {
                if (!loading) {
                  genImages();
                }
              },
            };
          }
        "
      >
        {{ $t("creatorZone.editor.generate") }}
      </div>

      <div class="line bg-outlines-outline-variant"></div>

      <div
        class="back"
        :class="{
          disabled: loading,
        }"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                if (!loading) {
                  e.target.classList.add('hovered');
                }
              },
              cancel: (e) => {
                e.target.classList.remove('hovered');
              },
            };
          }
        "
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.back'),
              focus: () => {},
              blur: () => {},
              click: () => {
                if (!loading) {
                  reset();

                  setImageUrl(currentImageSnapshot?.url);
                }
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, Ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { IMAGE_SNAPSHOT_MAX_LENGTH } from "@/constant";
import { getChessStyle } from "@/utils";
import { useSnapshots } from "@/hooks/snapshots";
import { IeditorRef, RATIO } from "@/types";
import ColorfulLoading from "@/components/CreatorZone/ColorfulLoading/index.vue";

const { currentSnapshot: currentImageSnapshot, setSnapshots: setImageSnapshots } =
  useSnapshots(IMAGE_SNAPSHOT_MAX_LENGTH);

const {
  scaleConfig,
  maxSizeRatio,
  imageUrl,
  setImageUrl,
  setOperateType,
  loading,
  setLoading,
  reset,
} = inject<IeditorRef>("EDITOR_REF");

const upscaleRef = ref(null);

const prevActive = computed(() => {
  return currentImageSnapshot?.value?.prevActive && !loading.value;
});

const nextActive = computed(() => {
  return currentImageSnapshot?.value?.nextActive && !loading.value;
});

const imageSize = ref({
  width: 0,
  height: 0,
});

// 图片偏移距离
const translate = ref({
  x: 0,
  y: 0,
});
// 图片缩放比例
const scale = ref(1);

// 设置图片偏移距离
const setTransform = async () => {
  await nextTick();

  if (currentImageSnapshot.value) {
    const originalImage: HTMLImageElement = await new Promise((resolve) => {
      const image = new Image();

      image.onload = () => {
        resolve(image);
      };

      image.src = currentImageSnapshot.value?.url;
    });

    const upscaleWrap = upscaleRef.value.querySelector(".upscale-wrap");

    let styleScale = 1;

    if (
      ((upscaleWrap.clientWidth * maxSizeRatio) / originalImage.width) * originalImage.height <=
      upscaleWrap.clientHeight * maxSizeRatio
    ) {
      styleScale = (upscaleWrap.clientWidth * maxSizeRatio) / originalImage.width;
    } else {
      styleScale = (upscaleWrap.clientHeight * maxSizeRatio) / originalImage.height;
    }

    imageSize.value = {
      width: originalImage.width,
      height: originalImage.height,
    };

    scale.value = styleScale;

    translate.value = {
      x: (upscaleWrap.clientWidth - originalImage.width) / 2,
      y: (upscaleWrap.clientHeight - originalImage.height) / 2,
    };
  }
};

const genImages = () => {
  setLoading(true);

  window.setTimeout(() => {
    setImageUrl("");
    setLoading(false);
  }, 6000);
};

// 视口大小变化事件
const Eresize = () => {
  setTransform();
};

onMounted(async () => {
  // 监听视口大小变化事件
  window.addEventListener("resize", Eresize);
});

onUnmounted(() => {
  // 取消监听视口大小变化事件
  window.removeEventListener("resize", Eresize);
});

watch(
  [() => imageUrl.value],
  () => {
    setImageSnapshots({
      url: imageUrl.value,
    });
  },
  { immediate: true }
);

watch(
  [() => currentImageSnapshot.value],
  () => {
    setTransform();
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.upscale {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .loading {
    flex: 1;
    width: 100%;
    position: relative;

    :deep(.colorful-loading) {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .toolbar {
    height: 48px;
    padding: 0 16px;
    border-radius: 999px;
    display: flex;
    align-items: center;

    > div + div {
      margin-left: 16px;
    }

    .prev,
    .next,
    .confirm,
    .back {
      display: flex;
      justify-content: center;
      align-items: center;

      &.hovered {
        cursor: pointer;
      }
    }

    .line {
      width: 1px;
      height: 16px;
      background: #ded9d4;
    }

    .prev,
    .next {
      width: 24px;
      height: 24px;

      .icon {
        width: 16px;
        height: 16px;
        mask-size: 100%;
        background-color: var(--color-text-on-surface);
      }

      &.disabled {
        opacity: 0.38;
      }
    }

    .prev {
      .icon {
        mask-image: url("@/assets/img/svg/left2.svg");
      }
    }

    .next {
      .icon {
        mask-image: url("@/assets/img/svg/right2.svg");
      }
    }

    .confirm {
      height: 32px;
      background: var(--color-primary-primary);
      padding: 0 16px;
      border-radius: 999px;
      font-family: "Rookery New";
      font-weight: 500;
      font-size: 12px;
      color: var(--color-on-primary);

      &.disabled {
        opacity: 0.38;
        background-color: var(--color-state-focus-focus-hover);
        color: var(--color-focus-focus);
      }
    }

    .back {
      width: 24px;
      height: 24px;

      .icon {
        width: 16px;
        height: 16px;
        mask-image: url("@/assets/img/svg/checked.svg");
        mask-size: 100%;
        background-color: var(--color-text-on-surface);
      }

      &.disabled {
        opacity: 0.38;
      }
    }
  }

  .upscale-wrap {
    flex: 1;
    width: 100%;
    position: relative;

    img {
      max-width: none;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}
</style>
