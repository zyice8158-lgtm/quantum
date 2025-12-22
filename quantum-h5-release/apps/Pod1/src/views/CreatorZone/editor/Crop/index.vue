<template>
  <div class="crop">
    <CropBase
      ref="cropRef"
      :maxSizeRatio="maxSizeRatio"
      :imageUrl="imageUrl"
      :cropImageScaleConfig="scaleConfig"
      :cropBoxRatio="currentRatio.ratio"
      :locked="currentRatio?.id !== RATIO.FREE"
      :flipHorizontal="flipHorizontal"
      :flipVertical="flipVertical"
      :angle="angle"
    />

    <div
      class="toolbar bg-surfaces-surface-blur"
      v-helper="
        () => {
          return {
            tabIndex: -1,
            role: 'radiogroup',
          };
        }
      "
    >
      <div class="scale text-text-on-surface">
        {{ numeral(cropRef?.cropImage?.scale).format("0%") }}
      </div>

      <div class="line bg-outlines-outline-variant"></div>

      <template v-for="ratio in ratios">
        <div
          :class="[
            'ratio',
            'text-text-on-surface',
            {
              active: ratio.active,
            },
          ]"
          v-helper="
            () => {
              return {
                role: 'radio',
                ariaLabel: ratio.title,
                ariaChecked: ratio.active,
                focus: () => {},
                blur: () => {},
                click: () => {
                  ratios = ratios.map((r) => {
                    return {
                      ...r,
                      active: r.id === ratio.id,
                    };
                  });
                },
              };
            }
          "
        >
          {{ ratio.title }}
        </div>
      </template>

      <div class="line bg-outlines-outline-variant"></div>

      <div
        class="flip-horizontal"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.flipHorizontal'),
              focus: () => {},
              blur: () => {},
              click: () => {
                flipHorizontal *= -1;
              },
            };
          }
        "
      >
        <div class="icon bg-text-on-surface"></div>
      </div>
      <div
        class="flip-vertical"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.flipVertical'),
              focus: () => {},
              blur: () => {},
              click: () => {
                flipVertical *= -1;
              },
            };
          }
        "
      >
        <div class="icon bg-text-on-surface"></div>
      </div>
      <div
        class="rotate-left"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.rotateLeft'),
              focus: () => {},
              blur: () => {},
              click: () => {
                angle -= 90;
              },
            };
          }
        "
      >
        <div class="icon bg-text-on-surface"></div>
      </div>
      <div
        class="rotate-right"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.rotateRight'),
              focus: () => {},
              blur: () => {},
              click: () => {
                angle += 90;
              },
            };
          }
        "
      >
        <div class="icon bg-text-on-surface"></div>
      </div>

      <div class="line bg-outlines-outline-variant"></div>

      <div
        class="confirm bg-primary-primary"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.done'),
              focus: () => {},
              blur: () => {},
              click: () => {
                const imageUrl = cropRef.crop();

                reset();

                setImageUrl(imageUrl);
              },
            };
          }
        "
      >
        {{ $t("creatorZone.editor.done") }}
      </div>

      <div class="line bg-outlines-outline-variant"></div>

      <div
        class="close"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.editor.close'),
              focus: () => {},
              blur: () => {},
              click: () => {
                setOperateType(undefined);
              },
            };
          }
        "
      >
        <div class="icon bg-text-on-surface"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import numeral from "numeral";
import { IeditorRef, RATIO } from "@/types";
import CropBase from "@/components/CreatorZone/CropBase/index.vue";

const { t } = useI18n();

const { scaleConfig, maxSizeRatio, imageUrl, setImageUrl, setOperateType, reset } =
  inject<IeditorRef>("EDITOR_REF");

// 比例选项
const ratios = ref<
  {
    title: string;
    id: RATIO;
    ratio: { x: number; y: number };
    size?: { width: number; height: number };
    active: boolean;
  }[]
>([
  {
    title: t("creatorZone.editor.original"),
    id: RATIO.ORIGINAL,
    ratio: { x: 0, y: 0 },
    active: true,
  },
  {
    title: t("creatorZone.editor.custom"),
    id: RATIO.FREE,
    ratio: { x: 0, y: 0 },
    active: false,
  },
  {
    title: "1:1",
    id: RATIO.ONE_ONE,
    ratio: { x: 1, y: 1 },
    active: false,
  },
  {
    title: "4:3",
    id: RATIO.FOUR_THREE,
    ratio: { x: 4, y: 3 },
    active: false,
  },
  {
    title: "16:9",
    id: RATIO.SIXTEEN_NINE,
    ratio: { x: 16, y: 9 },
    active: false,
  },
  {
    title: "3:2",
    id: RATIO.THREE_TWO,
    ratio: { x: 3, y: 2 },
    active: false,
  },
  {
    title: t("creatorZone.editor.1inch"),
    id: RATIO.ONE_INCH,
    ratio: { x: 295, y: 413 },
    size: { width: 295, height: 413 },
    active: false,
  },
  {
    title: t("creatorZone.editor.2inch"),
    id: RATIO.TWO_INCHES,
    ratio: { x: 413, y: 626 },
    size: { width: 413, height: 626 },
    active: false,
  },
]);
// 当前选中比例
const currentRatio = computed(() => {
  return ratios.value.find((ratio) => ratio.active);
});

// 裁剪容器是否水平翻转
const flipHorizontal = ref(1);
// 裁剪容器是否垂直翻转
const flipVertical = ref(1);
// 裁剪容器旋转角度
const angle = ref(0);

const cropRef = ref(null);
</script>

<style lang="less" scoped>
.crop {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .toolbar {
    height: 48px;
    padding: 0 16px;
    border-radius: 999px;
    display: flex;
    align-items: center;

    > div + div {
      margin-left: 8px;
    }

    .scale,
    .ratio {
      font-family: "Rookery New";
      font-size: 12px;
      font-weight: 500;
    }

    .ratio,
    .flip-horizontal,
    .flip-vertical,
    .rotate-left,
    .rotate-right,
    .confirm,
    .close {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .ratio {
      height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      cursor: pointer;

      &.active {
        background: var(--color-primary-pressed);
        color: var(--color-primary-primary);
      }
    }

    .flip-horizontal,
    .flip-vertical,
    .rotate-left,
    .rotate-right {
      width: 24px;
      height: 24px;

      .icon {
        width: 16px;
        height: 16px;
        mask-size: 100%;
        cursor: pointer;
      }
    }

    .flip-horizontal {
      .icon {
        mask-image: url("@/assets/img/svg/flip-horizontal.svg");
      }
    }

    .flip-vertical {
      .icon {
        mask-image: url("@/assets/img/svg/flip-vertical.svg");
      }
    }

    .rotate-left {
      .icon {
        mask-image: url("@/assets/img/svg/rotate-left.svg");
      }
    }

    .rotate-right {
      .icon {
        mask-image: url("@/assets/img/svg/rotate-right.svg");
      }
    }

    .line {
      width: 1px;
      height: 16px;
    }

    .confirm {
      height: 32px;
      padding: 0 16px;
      border-radius: 999px;
      font-family: "Rookery New";
      font-weight: 500;
      font-size: 12px;
      color: var(--color-on-primary);
      cursor: pointer;
    }

    .close {
      width: 24px;
      height: 24px;

      .icon {
        width: 16px;
        height: 16px;
        mask-image: url("@/assets/img/svg/close.svg");
        mask-size: 100%;
        cursor: pointer;
      }
    }
  }

  :deep(.crop-base) {
    flex: 1;
  }
}
</style>
