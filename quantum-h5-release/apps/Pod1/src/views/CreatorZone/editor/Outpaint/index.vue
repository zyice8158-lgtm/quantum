<template>
  <div class="outpaint">
    <div class="loading" v-show="loading">
      <ColorfulLoading
        :style="{
          width: `${expandRef?.expandBox?.width * expandRef?.scale}px`,
          height: `${expandRef?.expandBox?.height * expandRef?.scale}px`,
        }"
      />
    </div>
    <Expand
      v-show="!loading"
      ref="expandRef"
      :maxSizeRatio="maxSizeRatio"
      :imageUrl="imageUrl"
      :expandBoxRatio="selectedRatio.ratio"
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
      <template v-for="ratio in ratios">
        <div
          :class="[
            'ratio',
            {
              selected: ratio.selected,
              disabled: loading,
            },
          ]"
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
                role: 'radio',
                ariaLabel: ratio.name,
                ariaChecked: ratio.selected,
                focus: () => {},
                blur: () => {},
                click: () => {
                  if (!loading) {
                    setRatios(ratio.id);
                  }
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

          <div class="name">{{ ratio.name }}</div>
        </div>
      </template>

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
                  expandRef?.setImageSnapshots(0);
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
                  expandRef?.setImageSnapshots(1);
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
              ariaLabel: $t('creatorZone.editor.confirm'),
              focus: () => {},
              blur: () => {},
              click: () => {
                if (!loading) {
                  genImages(expandRef.getInfo());
                }
              },
            };
          }
        "
        v-automation="'outpaint_confirm'"
      >
        {{ $t("creatorZone.editor.confirm") }}
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

                  setImageUrl(expandRef?.currentImageSnapshot?.url);
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
import { useI18n } from "vue-i18n";
import { OPERATE_TYPE, IeditorRef, RATIO } from "@/types";
import Expand from "@/components/CreatorZone/Expand/index.vue";
import ColorfulLoading from "@/components/CreatorZone/ColorfulLoading/index.vue";
import { getImages } from "@/services/CreatorZone/getImages";
import { imageBase64ToLocalFile } from "@/cs/imageBase64ToLocalFile";

const { t } = useI18n();

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
    name: t("creatorZone.editor.original"),
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

const prevActive = computed(() => {
  return expandRef?.value?.currentImageSnapshot?.prevActive && !loading.value;
});

const nextActive = computed(() => {
  return expandRef?.value?.currentImageSnapshot?.nextActive && !loading.value;
});

const setRatios = (id) => {
  ratios.value = ratios.value.map((ratio) => {
    return {
      ...ratio,
      selected: ratio.id === id,
    };
  });
};

const genImages = async ({ originalImageUrl, maskImageUrl, width, height, left, top }) => {
  setLoading(true);

  const url = await getImages({
    toolName: "cloud_image_from_outpainting",
    parameters: {
      prompt: "outpaint",
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
.outpaint {
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

    .ratio,
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

    .ratio {
      height: 32px;
      padding: 0 12px;
      border-radius: 999px;

      .icon {
        width: 16px;
        height: 16px;
        mask-size: 100%;
        background-color: var(--color-text-on-surface);

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

      .name {
        margin-left: 4px;
        font-family: "Rookery New";
        font-size: 12px;
        font-weight: 500;
        color: var(--color-text-on-surface);
      }

      &.selected {
        background: var(--color-primary-pressed);

        .icon {
          background-color: var(--color-primary-primary);
        }

        .name {
          color: var(--color-primary-primary);
        }
      }

      &.disabled {
        opacity: 0.38;
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

  :deep(.expand) {
    flex: 1;
  }
}
</style>
