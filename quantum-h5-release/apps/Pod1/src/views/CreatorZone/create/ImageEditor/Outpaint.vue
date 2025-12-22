<template>
  <div class="outpaint">
    <div
      class="btns"
      v-helper="
        () => {
          return {
            tabIndex: -1,
            role: 'radiogroup',
          };
        }
      "
    >
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

      <template v-for="ratio in ratios">
        <div
          class="ratio"
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
                role: 'radio',
                ariaLabel: ratio.name,
                ariaChecked: ratio.selected,
                focus: () => {},
                blur: () => {},
                click: () => {
                  setRatios(ratio.id);
                },
              };
            }
          "
          v-automation="ratio.name"
        >
          <div
            class="icon"
            :class="{
              original: ratio.id === RATIO.ORIGINAL,
              'one-one': ratio.id === RATIO.ONE_ONE,
              'three-four': ratio.id === RATIO.THREE_FOUR,
              'nine-sixteen': ratio.id === RATIO.NINE_SIXTEEN,
              'four-three': ratio.id === RATIO.FOUR_THREE,
              'sixteen-nine': ratio.id === RATIO.SIXTEEN_NINE,
            }"
          ></div>

          <div>{{ ratio.name }}</div>
        </div>
      </template>
    </div>

    <Expand ref="expandRef" :imageUrl="currentImage.url" :expandBoxRatio="selectedRatio.ratio" />

    <div
      class="send"
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.generate'),
            focus: () => {},
            blur: () => {},
            click: () => {
              genImages(expandRef.getInfo());
            },
          };
        }
      "
      v-automation="'outpaint_send_btn'"
    >
      <div>{{ $t("creatorZone.create.imageEditor.generate") }}</div>
      <div class="icon"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch, nextTick, onUnmounted, Ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { GenBtnStatus } from "@/constant";
import { REFERENCEIMAGE_TYPE, OPERATE_TYPE, IcreateRef, ModelType, RATIO } from "@/types";
import Expand from "@/components/CreatorZone/Expand/index.vue";

const { t } = useI18n();

const {
  currentImage,
  setOperateType,
  genBtnStatus,
  genImages: _genImages,
} = inject<IcreateRef>("CREATE_REF");

const ratios = ref<
  {
    id: RATIO;
    name: string;
    ratio: { x: number; y: number };
    selected: boolean;
  }[]
>([
  {
    id: RATIO.ORIGINAL,
    name: "Original",
    ratio: { x: 0, y: 0 },
    selected: true,
  },
  {
    id: RATIO.ONE_ONE,
    name: "1:1",
    ratio: { x: 1, y: 1 },
    selected: false,
  },
  {
    id: RATIO.THREE_FOUR,
    name: "3:4",
    ratio: { x: 3, y: 4 },
    selected: false,
  },
  {
    id: RATIO.NINE_SIXTEEN,
    name: "9:16",
    ratio: { x: 9, y: 16 },
    selected: false,
  },
  {
    id: RATIO.FOUR_THREE,
    name: "4:3",
    ratio: { x: 4, y: 3 },
    selected: false,
  },
  {
    id: RATIO.SIXTEEN_NINE,
    name: "16:9",
    ratio: { x: 16, y: 9 },
    selected: false,
  },
]);
const selectedRatio = computed(() => {
  return ratios.value.find((ratio) => ratio.selected);
});

const expandRef = ref(null);

const setRatios = (id) => {
  ratios.value = ratios.value.map((ratio) => {
    return {
      ...ratio,
      selected: ratio.id === id,
    };
  });
};

const genImages = ({ originalImageUrl, maskImageUrl, width, height, left, top }) => {
  if (genBtnStatus.value !== GenBtnStatus.INIT) {
    ElMessage({
      message: t("creatorZone.messages.tooFrequentMessage"),
      type: "error",
    });

    return;
  }

  _genImages({
    width,
    height,
    left,
    top,
    maskImageUrl,
    referenceImageUrl: originalImageUrl,
    referenceImageType: REFERENCEIMAGE_TYPE.MODEL,
    modelType: ModelType.CLOUD,
    operateType: OPERATE_TYPE.OUTPAINT,
    ratioId: currentImage.value.ratioId,
  });

  setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
};
</script>

<style lang="less" scoped>
.outpaint {
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
    .ratio {
      height: 100%;
      background: var(--color-secondary-container);
      border-radius: 32px;
      display: flex;
      justify-content: center;
      align-items: center;

      &.hovered {
        cursor: pointer;
        box-shadow: 0px 2px 6px 2px #00000026;
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

    .ratio {
      padding: 0 12px;

      .icon {
        margin-right: 4px;
        width: 16px;
        height: 16px;
        mask-size: 100%;
        background-color: var(--color-on-secondary-container);

        &.original {
          mask-image: url("@/assets/img/svg/original.svg");
        }

        &.one-one {
          mask-image: url("@/assets/img/svg/1.1.svg");
        }

        &.three-four {
          mask-image: url("@/assets/img/svg/3.4.svg");
        }

        &.nine-sixteen {
          mask-image: url("@/assets/img/svg/9.16.svg");
        }

        &.four-three {
          mask-image: url("@/assets/img/svg/4.3.svg");
        }

        &.sixteen-nine {
          mask-image: url("@/assets/img/svg/16.9.svg");
        }
      }

      > div {
        font-family: "Rookery New";
        font-size: 12px;
        font-weight: 500;
        color: var(--color-on-secondary-container);
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

@media screen and (max-width: 1360px) {
  .outpaint {
    .btns {
      padding: 0 16px;

      .ratio {
        .icon {
          display: none;
        }
      }
    }
  }
}
</style>
