<template>
  <div class="change-background" ref="changeBackgroundRef">
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

      <!-- <div class="rest"></div>

      <template v-for="backgroundType in backgroundTypes">
        <div
          class="background-type"
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
          @click="
            () => {
              backgroundTypes = backgroundTypes.map((bType) => {
                return {
                  ...bType,
                  selected: bType.id === backgroundType.id,
                };
              });
            }
          "
        >
          <img v-if="backgroundType.selected" src="@/assets/img/svg/checked.svg" />
          <div>{{ backgroundType.name }}</div>
        </div>
      </template>

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
        @click="
          () => {
            if (redrawRef?.currentImageSnapshot?.prevActive) {
              redrawRef?.setImageSnapshots(0);
            }
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
        @click="
          () => {
            if (redrawRef?.currentImageSnapshot?.nextActive) {
              redrawRef?.setImageSnapshots(1);
            }
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
        @click="
          () => {
            redrawRef?.clearMaskImage();
          }
        "
      >
        {{ $t("creatorZone.create.imageEditor.clear") }}
      </div> -->
    </div>

    <Redraw
      ref="redrawRef"
      :showInputBox="selectedBackgroundType.id === BACKGROUND_TYPE.CUSTOM"
      :imageUrl="currentImage.url"
      :brushDiameter="brushDiameter"
      :send="
        (value) => {
          genImages(value);
        }
      "
    />

    <div
      v-if="inputBox.visible"
      class="input"
      :style="{
        left: `${inputBox.x}px`,
        top: `${inputBox.y}px`,
      }"
    >
      <textarea
        :placeholder="$t('creatorZone.create.imageEditor.placeholder')"
        :value="content"
        :maxlength="SESSIONID_PROMPT_MAX_LENGTH"
        @input="
          (e) => {
            setContent(e, false);
            setTextareaHeight(e);
          }
        "
        @blur="
          (e) => {
            setContent(e, true);
            setTextareaHeight(e);
          }
        "
        @keydown.enter="
          (e) => {
            e.preventDefault();

            if (content.length > 0) {
              genImages({
                ...redrawRef?.getInfo(),
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
                'aria-placeholder': $t('creatorZone.create.imageEditor.placeholder'),
              },
              focus: () => {},
              blur: () => {},
              click: () => {},
            };
          }
        "
      ></textarea>

      <div
        v-if="content.length > 0"
        class="send active"
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
              ariaLabel: $t('creatorZone.create.imageEditor.send'),
              focus: () => {},
              blur: () => {},
              click: () => {
                genImages({
                  ...redrawRef?.getInfo(),
                  content,
                });
              },
            };
          }
        "
      >
        <div class="icon"></div>
      </div>
      <div v-else class="send">
        <div class="icon"></div>
      </div>
    </div>

    <div
      v-if="selectedBackgroundType.id === BACKGROUND_TYPE.TRANSPARENT"
      class="send"
      :class="{
        disabled: redrawRef?.isEmpty,
      }"
      @click="
        () => {
          genImages(redrawRef.getInfo());
        }
      "
    >
      <div>{{ $t("creatorZone.create.imageEditor.removeBg") }}</div>
      <div class="icon"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { GenBtnStatus, SESSIONID_PROMPT_MAX_LENGTH } from "@/constant";
import { REFERENCEIMAGE_TYPE, OPERATE_TYPE, IcreateRef, ModelType } from "@/types";
import Redraw from "@/components/CreatorZone/Redraw/index.vue";
import Slider from "@/components/CreatorZone/Slider/index.vue";

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
  currentImage,
  setOperateType,
  genBtnStatus,
  genImages: _genImages,
} = inject<IcreateRef>("CREATE_REF");

const changeBackgroundRef = ref(null);

const backgroundTypes = ref([
  {
    id: BACKGROUND_TYPE.TRANSPARENT,
    name: t("creatorZone.create.imageEditor.removeBg"),
    selected: false,
  },
  {
    id: BACKGROUND_TYPE.CUSTOM,
    name: t("creatorZone.create.imageEditor.changeBg"),
    selected: true,
  },
]);
const selectedBackgroundType = computed(() => {
  return backgroundTypes.value.find((backgroundType) => backgroundType.selected);
});

const brushDiameter = ref(brushDiameterConfig.default);

const redrawRef = ref(null);

const content = ref("");

const inputBox = ref({
  visible: true,
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
});

const setContent = (e, trimed = false) => {
  const value = (e.target as HTMLTextAreaElement).value;

  content.value = trimed ? value.trim() : value;
};

const setTextareaHeight = (e) => {
  const ele = e.target as HTMLTextAreaElement;

  ele.style.height = 0 + "px";
  ele.style.height = Math.min(ele.scrollHeight, 60) + "px";
};

const genImages = ({ originalImageUrl, maskImageUrl, content }) => {
  if (genBtnStatus.value !== GenBtnStatus.INIT) {
    ElMessage({
      message: t("creatorZone.messages.tooFrequentMessage"),
      type: "error",
    });

    return;
  }

  _genImages({
    content: selectedBackgroundType.value.id === BACKGROUND_TYPE.CUSTOM ? content : "",
    maskImageUrl,
    referenceImageUrl: originalImageUrl,
    referenceImageType: REFERENCEIMAGE_TYPE.MODEL,
    modelType: ModelType.CLOUD,
    operateType: OPERATE_TYPE.CHANGE_BACKGROUND,
    ratioId: currentImage.value.ratioId,
    width: currentImage.value.width,
    height: currentImage.value.height,
  });

  setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
};

const Eresize = () => {
  const { left, right, top, bottom } = changeBackgroundRef.value.getBoundingClientRect();

  const { width, height } = changeBackgroundRef.value
    .querySelector(".input textarea")
    .getBoundingClientRect();

  inputBox.value = {
    ...inputBox.value,
    x: (left + right) / 2 - width / 2,
    y: (top + bottom) / 2 - height / 2,
  };
};

onMounted(() => {
  window.addEventListener("resize", Eresize);

  Eresize();

  (changeBackgroundRef.value.querySelector(".input textarea") as HTMLElement)?.focus();
});

onUnmounted(() => {
  window.removeEventListener("resize", Eresize);
});
</script>

<style lang="less" scoped>
.change-background {
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
    .background-type,
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

    .background-type {
      padding: 0 16px;
      border-radius: 32px;

      > img {
        margin-right: 4px;
        width: 16px;
        height: 16px;
      }

      > div {
        font-family: "Rookery New";
        font-size: 12px;
        font-weight: 500;
        color: #0e131e;
      }
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

  :deep(.redraw) {
    pointer-events: none;
  }

  .input {
    width: 358px;
    background: var(--color-surface);
    padding: 14px 16px;
    border-radius: 40px;
    box-shadow: 0px 2px 6px 2px #00000026;
    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    align-items: center;

    textarea {
      flex: 1;
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

    .send {
      margin-left: 8px;
      width: 32px;
      height: 32px;
      background: var(--color-surface-disabled);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        width: 16px;
        height: 16px;
        mask-image: url("@/assets/img/svg/send.svg");
        mask-size: 100%;
        background-color: var(--color-text-on-surface-disabled);
      }

      &.active {
        background: var(--color-primary-primary);

        .icon {
          background-color: var(--color-on-primary);
        }
      }

      &.hovered {
        cursor: pointer;
      }
    }
  }

  > .send {
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
