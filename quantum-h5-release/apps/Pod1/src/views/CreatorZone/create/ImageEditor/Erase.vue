<template>
  <div class="erase">
    <div class="btns">
      <div
        class="back"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                e.target.classList.add('hovered');
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
              ariaLabel: $t('creatorZone.create.imageEditor.back'),
              focus: () => {},
              blur: () => {},
              click: () => {
                setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>

      <div class="rest"></div>

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

      <div
        class="prev"
        :class="{
          disabled: !redrawRef?.currentImageSnapshot?.prevActive,
        }"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                if (redrawRef?.currentImageSnapshot?.prevActive) {
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
              ariaLabel: $t('creatorZone.create.imageEditor.undo'),
              focus: () => {},
              blur: () => {},
              click: () => {
                if (redrawRef?.currentImageSnapshot?.prevActive) {
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
          disabled: !redrawRef?.currentImageSnapshot?.nextActive,
        }"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                if (redrawRef?.currentImageSnapshot?.nextActive) {
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
              ariaLabel: $t('creatorZone.create.imageEditor.redo'),
              focus: () => {},
              blur: () => {},
              click: () => {
                if (redrawRef?.currentImageSnapshot?.nextActive) {
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
          disabled: redrawRef?.isEmpty,
        }"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                if (!redrawRef?.isEmpty) {
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
              ariaLabel: $t('creatorZone.create.imageEditor.clear'),
              focus: () => {},
              blur: () => {},
              click: () => {
                redrawRef?.clearMaskImage();
              },
            };
          }
        "
      >
        {{ $t("creatorZone.create.imageEditor.clear") }}
      </div>
    </div>

    <Redraw ref="redrawRef" :imageUrl="currentImage.url" :brushDiameter="brushDiameter" />

    <div
      class="send"
      :class="{
        disabled: redrawRef?.isEmpty,
      }"
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.remove'),
            focus: () => {},
            blur: () => {},
            click: () => {
              genImages(redrawRef.getInfo());
            },
          };
        }
      "
    >
      <div>{{ $t("creatorZone.create.imageEditor.remove") }}</div>
      <div class="icon"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, Ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { GenBtnStatus } from "@/constant";
import { REFERENCEIMAGE_TYPE, OPERATE_TYPE, IcreateRef, ModelType } from "@/types";
import Redraw from "@/components/CreatorZone/Redraw/index.vue";
import Slider from "@/components/CreatorZone/Slider/index.vue";

const { t } = useI18n();

const brushDiameterConfig = {
  default: 100,
  min: 30,
  max: 100,
  step: 1,
};

const {
  currentImage,
  setOperateType,
  genBtnStatus,
  genImages: _genImages,
} = inject<IcreateRef>("CREATE_REF");

const brushDiameter = ref(brushDiameterConfig.default);

const redrawRef = ref(null);

const genImages = ({ originalImageUrl, maskImageUrl, content }) => {
  if (genBtnStatus.value !== GenBtnStatus.INIT) {
    ElMessage({
      message: t("creatorZone.messages.tooFrequentMessage"),
      type: "error",
    });

    return;
  }

  _genImages({
    content,
    maskImageUrl,
    referenceImageUrl: originalImageUrl,
    referenceImageType: REFERENCEIMAGE_TYPE.MODEL,
    modelType: ModelType.CLOUD,
    operateType: OPERATE_TYPE.ERASE,
    ratioId: currentImage.value.ratioId,
    width: currentImage.value.width,
    height: currentImage.value.height,
  });

  setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
};
</script>

<style lang="less" scoped>
.erase {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .btns {
    width: 100%;
    height: 32px;
    display: flex;
    margin-bottom: 24px;

    > div + div {
      margin-left: 8px;
    }

    .back,
    .slider,
    .prev,
    .next,
    .clear {
      height: 100%;
      background: var(--color-secondary-container);
      display: flex;
      justify-content: center;
      align-items: center;

      &.hovered {
        box-shadow: 0px 2px 6px 2px #00000026;
      }
    }

    .back,
    .prev,
    .next,
    .clear {
      &.hovered {
        cursor: pointer;
      }
    }

    .back,
    .prev,
    .next {
      width: 32px;
      border-radius: 50%;

      img {
        width: 16px;
        height: 16px;
      }
    }

    .back {
      width: 32px;
      height: 32px;
      background-color: var(--color-surface-blur-high);
      rotate: 180deg;

      .icon {
        width: 16px;
        height: 16px;
        mask-image: url("@/assets/img/svg/right-arrow.svg");
        mask-size: 100%;
        background-color: var(--color-inverse-on-focus);
      }
    }

    .rest {
      flex: 1;
    }

    .slider {
      padding: 0 8px;
      border-radius: 32px;
    }

    .prev,
    .next {
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
      padding: 0 16px;
      border-radius: 32px;
      font-family: "Rookery New";
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-on-surface);

      &.disabled {
        opacity: 0.38;
      }
    }
  }

  .send {
    margin-top: 24px;
    height: 40px;
    background: var(--color-primary-primary);
    padding: 0 20px;
    border-radius: 999px;
    cursor: pointer;
    display: flex;
    align-items: center;

    > div {
      font-family: "Rookery New";
      font-size: 14px;
      font-weight: 500;
      color: var(--color-on-primary);
    }

    .icon {
      margin-left: 8px;
      width: 18px;
      height: 18px;
      mask-image: url("@/assets/img/svg/right-arrow.svg");
      mask-size: 100%;
      background-color: var(--color-on-primary);
    }
  }
}
</style>
