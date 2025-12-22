<template>
  <div class="inpaint">
    <div class="loading" v-show="loading">
      <ColorfulLoading
        :style="{
          width: `${redrawRef?.redrawImage?.width * redrawRef?.scale}px`,
          height: `${redrawRef?.redrawImage?.height * redrawRef?.scale}px`,
        }"
      />
    </div>
    <Redraw
      v-show="!loading"
      ref="redrawRef"
      :maxSizeRatio="maxSizeRatio"
      :showInputBox="true"
      :imageUrl="imageUrl"
      :brushDiameter="brushDiameter"
      :send="
        (value) => {
          genImages(value);
        }
      "
    />

    <div class="toolbar bg-surfaces-surface-blur">
      <Slider
        :step="brushDiameterConfig.step"
        :min="brushDiameterConfig.min"
        :max="brushDiameterConfig.max"
        :value="brushDiameter"
        :onChange="
          (value) => {
            brushDiameter = value;
          }
        "
      />

      <div class="line bg-outlines-outline-variant"></div>

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
                  redrawRef?.setImageSnapshots(0);
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
                  redrawRef?.setImageSnapshots(1);
                }
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>

      <div
        class="clear"
        :class="{
          disabled: !clearActive,
        }"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                if (clearActive) {
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
              ariaLabel: $t('creatorZone.editor.clear'),
              focus: () => {},
              blur: () => {},
              click: () => {
                if (clearActive) {
                  redrawRef?.clearMaskImage();
                }
              },
            };
          }
        "
      >
        {{ $t("creatorZone.editor.clear") }}
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

                  setImageUrl(redrawRef?.currentImageSnapshot?.url);
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
import { computed, inject, ref, Ref } from "vue";
import { OPERATE_TYPE, IeditorRef, RATIO } from "@/types";
import Redraw from "@/components/CreatorZone/Redraw/index.vue";
import ColorfulLoading from "@/components/CreatorZone/ColorfulLoading/index.vue";
import Slider from "@/components/CreatorZone/Slider/index.vue";
import { getImages } from "@/services/CreatorZone/getImages";
import { imageBase64ToLocalFile } from "@/cs/imageBase64ToLocalFile";

const brushDiameterConfig = {
  default: 100,
  min: 30,
  max: 100,
  step: 1,
};

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

const brushDiameter = ref(brushDiameterConfig.default);

const redrawRef = ref(null);

const prevActive = computed(() => {
  return redrawRef?.value?.currentImageSnapshot?.prevActive && !loading.value;
});

const nextActive = computed(() => {
  return redrawRef?.value?.currentImageSnapshot?.nextActive && !loading.value;
});

const clearActive = computed(() => {
  return !redrawRef?.value?.isEmpty && !loading.value;
});

const genImages = async ({ originalImageUrl, maskImageUrl, content }) => {
  setLoading(true);

  const url = await getImages({
    toolName: "cloud_image_from_inpainting",
    parameters: {
      prompt: content,
      imageUriPath: await imageBase64ToLocalFile(originalImageUrl),
      maskImageUriPath: await imageBase64ToLocalFile(maskImageUrl),
    },
  });

  if (url) {
    setImageUrl(url);
  }

  setLoading(false);
};
</script>

<style lang="less" scoped>
.inpaint {
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
    .clear,
    .back {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .prev,
    .next,
    .clear,
    .back {
      &.hovered {
        cursor: pointer;
      }
    }

    .line {
      width: 1px;
      height: 16px;
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

    .clear {
      font-family: "Rookery New";
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-on-surface);

      &.disabled {
        opacity: 0.38;
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

  :deep(.redraw) {
    flex: 1;
  }
}
</style>
