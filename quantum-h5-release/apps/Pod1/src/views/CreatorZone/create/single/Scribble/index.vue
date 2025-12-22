<template>
  <div class="scribble">
    <div class="preview">
      <template v-if="referenceImageUrl">
        <div
          class="edit"
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.create.single.clickHereToDraw'),
                elId: '#id-1e379afc',
                focus: () => {},
                blur: () => {},
                click: () => {
                  visible = true;
                },
              };
            }
          "
        >
          <div class="icon"></div>
        </div>
      </template>

      <div
        class="preview__inner"
        :style="{
          'aspect-ratio': `${imageSize.width} / ${imageSize.height}`,
          ...(imageSize.width > imageSize.height ? { width: '100%' } : { height: '100%' }),
        }"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.create.single.clickHereToDraw'),
              elId: '#id-1e379afc',
              focus: () => {},
              blur: () => {},
              click: () => {
                visible = true;
              },
            };
          }
        "
      >
        <template v-if="referenceImageUrl">
          <img :src="referenceImageUrl" />
        </template>
        <template v-else>
          <div class="icon__wrapper">
            <div class="icon"></div>
          </div>

          <div class="desc">{{ $t("creatorZone.create.single.clickHereToDraw") }}</div>
        </template>
      </div>
    </div>

    <div
      id="id-1e379afc"
      class="layer"
      :style="{
        ...(visible
          ? {
              opacity: 1,
              'z-index': 1,
            }
          : {
              opacity: 0,
              'z-index': -1,
            }),
      }"
      v-helper="
        () => {
          return {
            tabIndex: -1,
            role: 'dialog',
            ariaModal: true,
            ariaHidden: !visible,
            ariaRestricted: visible,
            focus: () => {},
            blur: () => {},
            click: () => {},
          };
        }
      "
    >
      <div>
        <ScribbleBase
          ref="scribbleRef"
          :cropSize="imageSize"
          :brushDiameter="brushDiameter"
          :brushColor="brushColor"
        />
      </div>

      <div
        class="close"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.create.single.close'),
              focus: () => {},
              blur: () => {},
              click: async () => {
                if (clearActive) {
                  setReferenceImageUrl(await scribbleRef?.getInfo());
                } else {
                  setReferenceImageUrl('');
                }

                visible = false;
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>

      <div class="toolbar">
        <div
          class="pen"
          :class="{
            active: brushColor === brushColorConfig.default,
          }"
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
                ariaLabel: $t('creatorZone.create.single.pen'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  brushColor = brushColorConfig.default;
                },
              };
            }
          "
        >
          <div class="icon"></div>
        </div>

        <div
          class="eraser"
          :class="{
            active: brushColor === brushColorConfig.tranparent,
          }"
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
                ariaLabel: $t('creatorZone.create.single.eraser'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  brushColor = brushColorConfig.tranparent;
                },
              };
            }
          "
        >
          <div class="icon"></div>
        </div>

        <div class="line bg-outlines-outline-variant"></div>

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
                ariaLabel: $t('creatorZone.create.single.undo'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  if (prevActive) {
                    scribbleRef?.setImageSnapshots(0);
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
                ariaLabel: $t('creatorZone.create.single.redo'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  if (nextActive) {
                    scribbleRef?.setImageSnapshots(1);
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
                ariaLabel: $t('creatorZone.create.single.clear'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  if (clearActive) {
                    scribbleRef?.clearMaskImage();
                  }
                },
              };
            }
          "
        >
          {{ $t("creatorZone.create.single.clear") }}
        </div>

        <div class="line bg-outlines-outline-variant"></div>

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
                ariaLabel: $t('creatorZone.create.single.back'),
                focus: () => {},
                blur: () => {},
                click: async () => {
                  if (clearActive) {
                    setReferenceImageUrl(await scribbleRef?.getInfo());
                  } else {
                    setReferenceImageUrl('');
                  }

                  visible = false;
                },
              };
            }
          "
        >
          <div class="icon"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref, Ref, watch } from "vue";
import numeral from "numeral";
import { IsingleRef, OPERATE_TYPE } from "@/types";
import ScribbleBase from "@/components/CreatorZone/ScribbleBase/index.vue";
import Slider from "@/components/CreatorZone/Slider/index.vue";

const brushDiameterConfig = {
  default: 10,
  min: 10,
  max: 100,
  step: 1,
};

const brushColorConfig = {
  default: "rgba(22, 22, 22, 1)",
  tranparent: "rgba(0, 0, 0, 0)",
};

const {
  imageSize,
  referenceImageUrl,
  setReferenceImageUrl: _setReferenceImageUrl,
  operateType,
  setOperateType,
} = inject<IsingleRef>("SINGLE_REF");

const visible = ref(false);

const brushDiameter = ref(brushDiameterConfig.default);
const brushColor = ref(brushColorConfig.default);

const scribbleRef = ref(null);

const prevActive = computed(() => {
  return scribbleRef?.value?.currentImageSnapshot?.prevActive;
});

const nextActive = computed(() => {
  return scribbleRef?.value?.currentImageSnapshot?.nextActive;
});

const clearActive = computed(() => {
  return !scribbleRef?.value?.isEmpty;
});

const setReferenceImageUrl = (value) => {
  _setReferenceImageUrl(value);

  if (value) {
    if ([OPERATE_TYPE.TEXT_TO_IMAGE, OPERATE_TYPE.SMART_EDITING].includes(operateType.value)) {
      setOperateType(OPERATE_TYPE.IMAGE_TO_IMAGE);
    }
  } else {
    if ([OPERATE_TYPE.IMAGE_TO_IMAGE, OPERATE_TYPE.SMART_EDITING].includes(operateType.value)) {
      setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
    }
  }
};

watch(
  [() => imageSize.value],
  async () => {
    await nextTick();

    if (clearActive.value) {
      setReferenceImageUrl(await scribbleRef?.value?.getInfo());
    }
  },
  { immediate: false }
);

defineExpose({
  getInfo: (value) => {
    return scribbleRef?.value?.getInfo(value);
  },
});
</script>

<style lang="less" scoped>
.scribble {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  .preview {
    width: 100%;
    height: 100%;
    background: var(--color-surfaces-surface);
    padding: 8px;
    border-radius: 24px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    &__inner {
      background-color: #bdc7dc1f;
      border-radius: 16px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      > img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .icon__wrapper {
        width: 48px;
        height: 48px;
        background-color: var(--color-primary-container);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .icon {
        width: 24px;
        height: 24px;
        mask-image: url("@/assets/img/svg/pen.svg");
        mask-size: 100%;
        background-color: var(--color-on-primary-container);
      }

      .desc {
        margin-top: 8px;
        font-family: "Rookery New";
        font-size: 14px;
        font-weight: 400;
        color: var(--color-text-on-surface-muted);
        line-height: 20px;
      }
    }

    .edit {
      width: 32px;
      height: 32px;
      background: var(--color-secondary-container);
      border-radius: 50%;
      cursor: pointer;
      position: absolute;
      right: 16px;
      top: 16px;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        width: 16px;
        height: 16px;
        mask-image: url("@/assets/img/svg/expand.svg");
        mask-size: 100%;
        background-color: var(--color-on-secondary-container);
      }
    }
  }

  .layer {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 8, 48, 0.27);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    > div:first-child {
      width: 586px;
      height: 586px;
      background: var(--color-surfaces-surface);
      padding: 8px;
      border-radius: 20px;

      /deep/ .scribble-base {
        border-radius: 16px;
        overflow: hidden;
      }
    }

    .close {
      position: absolute;
      top: calc((100% - 586px - 48px - 24px) / 2 + 16px);
      right: calc((100% - 586px) / 2 + 16px);
      z-index: 1;
      width: 32px;
      height: 32px;
      background-color: var(--color-secondary-container);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        width: 16px;
        height: 16px;
        mask-image: url("@/assets/img/svg/close3.svg");
        mask-size: 100%;
        background-color: var(--color-on-secondary-container);
      }
    }
  }

  .toolbar {
    margin-top: 24px;
    height: 48px;
    background-color: var(--color-surfaces-surface-blur);
    padding: 0 16px;
    border-radius: 999px;
    display: flex;
    align-items: center;

    > div + div {
      margin-left: 16px;
    }

    .pen,
    .eraser,
    .prev,
    .next,
    .clear,
    .back {
      display: flex;
      justify-content: center;
      align-items: center;

      &.hovered {
        cursor: pointer;
      }
    }

    .pen,
    .eraser {
      width: 24px;
      height: 24px;
      border-radius: 50%;

      .icon {
        width: 16px;
        height: 16px;
        mask-size: 100%;
        background-color: var(--color-text-on-surface);
      }

      &.active {
        background-color: var(--color-primary-pressed);

        .icon {
          background-color: var(--color-primary-primary);
        }
      }
    }

    .pen {
      .icon {
        mask-image: url("@/assets/img/svg/pen3.svg");
      }
    }

    .eraser {
      .icon {
        mask-image: url("@/assets/img/svg/eraser.svg");
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
    }
  }
}
</style>
