<template>
  <div class="change-background" ref="changeBackgroundRef">
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
      :showInputBox="selectedBackgroundType.id === BACKGROUND_TYPE.CUSTOM"
      :imageUrl="imageUrl"
      :brushDiameter="brushDiameter"
      :send="
        (value) => {
          genImages(value);
        }
      "
    />

    <div class="toolbar bg-surfaces-surface-blur">
      <!-- <template v-for="backgroundType in backgroundTypes">
        <div
          class="background-type"
          :class="{
            selected: backgroundType.selected,
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
          @click="
            () => {
              if (!loading) {
                backgroundTypes = backgroundTypes.map((bType) => {
                  return {
                    ...bType,
                    selected: bType.id === backgroundType.id,
                  };
                });
              }
            }
          "
        >
          <div>{{ backgroundType.name }}</div>
        </div>
      </template> -->

      <!-- <Slider
        :step="brushDiameterConfig.step"
        :min="brushDiameterConfig.min"
        :max="brushDiameterConfig.max"
        :value="brushDiameter"
        :onChange="
          (value) => {
            brushDiameter = value;
          }
        "
      /> -->

      <!-- <div class="line"></div> -->

      <div class="input" v-automation="'change_bg_input'">
        <textarea
          :placeholder="$t('creatorZone.editor.placeholder')"
          :value="content"
          :maxlength="SESSIONID_PROMPT_MAX_LENGTH"
          @input="
            (e) => {
              setContent(e, false);
            }
          "
          @blur="
            (e) => {
              setContent(e, true);
            }
          "
          @keydown.enter="
            (e) => {
              e.preventDefault();

              if (!loading && content.length > 0) {
                genImages({
                  ...redrawRef.getInfo(),
                  content,
                });
              }
            }
          "
          v-helper="
            () => {
              return {
                role: 'textbox',
                attributes: {
                  'aria-placeholder': $t('creatorZone.editor.placeholder'),
                },
                focus: () => {},
                blur: () => {},
                click: () => {},
              };
            }
          "
        ></textarea>
      </div>

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

      <!-- <div
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
        @click="
          () => {
            if (clearActive) {
              redrawRef?.clearMaskImage();
            }
          }
        "
      >
        {{ $t("creatorZone.editor.clear") }}
      </div> -->

      <div
        class="confirm"
        :class="{
          // disabled: !clearActive || loading,
          disabled: content.length === 0 || loading,
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
                // if (!loading) {
                //   genImages(redrawRef.getInfo());
                // }

                if (!loading && content.length > 0) {
                  genImages({
                    ...redrawRef.getInfo(),
                    content,
                  });
                }
              },
            };
          }
        "
        v-automation="'change_bg_confirm_btn'"
      >
        {{ $t("creatorZone.editor.confirm") }}
      </div>

      <div class="line"></div>

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
import { computed, inject, onMounted, ref, Ref } from "vue";
import { useI18n } from "vue-i18n";
import { OPERATE_TYPE, IeditorRef, RATIO } from "@/types";
import { SESSIONID_PROMPT_MAX_LENGTH } from "@/constant";
import ColorfulLoading from "@/components/CreatorZone/ColorfulLoading/index.vue";
import Redraw from "@/components/CreatorZone/Redraw/index.vue";
// import Slider from "@/components/CreatorZone/Slider/index.vue";
import { getImages } from "@/services/CreatorZone/getImages";
import { imageBase64ToLocalFile } from "@/cs/imageBase64ToLocalFile";

enum BACKGROUND_TYPE {
  TRANSPARENT,
  CUSTOM,
}

const { t } = useI18n();

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

const changeBackgroundRef = ref(null);

const backgroundTypes = ref([
  {
    id: BACKGROUND_TYPE.TRANSPARENT,
    name: t("creatorZone.editor.removeBg"),
    selected: false,
  },
  {
    id: BACKGROUND_TYPE.CUSTOM,
    name: t("creatorZone.editor.changeBg"),
    selected: true,
  },
]);
const selectedBackgroundType = computed(() => {
  return backgroundTypes.value.find((backgroundType) => backgroundType.selected);
});

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

const content = ref("");

const setContent = (e, trimed = false) => {
  const value = (e.target as HTMLTextAreaElement).value;

  content.value = trimed ? value.trim() : value;
};

const genImages = async ({ originalImageUrl, maskImageUrl, content }) => {
  setLoading(true);

  let url = "";

  if (selectedBackgroundType.value.id === BACKGROUND_TYPE.CUSTOM) {
    url = await getImages({
      toolName: "cloud_image_from_ChangeBackground",
      parameters: {
        prompt: content,
        imageUriPath: await imageBase64ToLocalFile(originalImageUrl),
      },
    });
  }

  if (url) {
    setImageUrl(url);
  }

  setLoading(false);
};

onMounted(() => {
  (changeBackgroundRef.value.querySelector(".input textarea") as HTMLElement)?.focus();
});
</script>

<style lang="less" scoped>
.change-background {
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

    .background-type,
    .prev,
    .next,
    .clear,
    .confirm,
    .back {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .background-type,
    .prev,
    .next,
    .clear,
    .confirm,
    .back {
      &.hovered {
        cursor: pointer;
      }
    }

    .background-type {
      height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      font-family: "Rookery New";
      font-size: 12px;
      font-weight: 500;
      color: #0e131e;

      &.selected {
        background: #855ee12e;

        .icon {
          background-color: #6c43c6;
        }

        .name {
          color: #6c43c6;
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

    .input {
      width: 358px;

      textarea {
        display: block;
        width: 100%;
        height: 20px;
        background: transparent;
        border: 0;
        outline: 0;
        resize: none;
        font-family: "Rookery New";
        font-size: 14px;
        font-weight: 400;
        color: var(--color-text-on-surface);
        line-height: 20px;

        &::placeholder {
          font-family: "Rookery New";
          font-size: 14px;
          font-weight: 400;
          color: var(--color-text-on-surface-variant);
        }

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          border-radius: 10px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
      }
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

  :deep(.redraw) {
    flex: 1;
    pointer-events: none;
  }
}
</style>
