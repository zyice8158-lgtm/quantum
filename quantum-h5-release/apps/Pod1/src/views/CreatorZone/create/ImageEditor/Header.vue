<template>
  <div class="header">
    <div
      class="smart-editing"
      :class="{
        disabled: generatedImage,
      }"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              showHoverStyle(e);
            },
            cancel: (e) => {
              showHoverStyle(e, false);
            },
          };
        }
      "
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.headerName'),
            focus: () => {},
            blur: () => {},
            click: () => {
              setReferenceImageUrl(currentImage.url);
              setReferenceImageType(REFERENCEIMAGE_TYPE.MODEL);
              setOperateType(OPERATE_TYPE.SMART_EDITING);
            },
          };
        }
      "
      v-automation="'smart_editing'"
    >
      <template v-if="operateType === OPERATE_TYPE.SMART_EDITING">
        <img class="icon checked" />
      </template>
      <template v-else>
        <div class="icon"></div>
      </template>

      <div class="name">{{ $t("creatorZone.create.imageEditor.headerName") }}</div>

      <div class="tip">
        <div>{{ $t("creatorZone.create.imageEditor.headerTip") }}</div>

        <img src="@/assets/img/imageEditor/smartEdit.gif" />
      </div>
    </div>

    <div
      class="inpaint"
      :class="{
        disabled: generatedImage,
      }"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              showHoverStyle(e);
            },
            cancel: (e) => {
              showHoverStyle(e, false);
            },
          };
        }
      "
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.inpaint'),
            focus: () => {},
            blur: () => {},
            click: () => {
              setOperateType(OPERATE_TYPE.INPAINT);
            },
          };
        }
      "
      v-automation="'inpaint'"
    >
      <div class="icon"></div>
      <div class="name">{{ $t("creatorZone.create.imageEditor.inpaint") }}</div>
    </div>

    <div
      class="outpaint"
      :class="{
        disabled: generatedImage,
      }"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              showHoverStyle(e);
            },
            cancel: (e) => {
              showHoverStyle(e, false);
            },
          };
        }
      "
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.outpaint'),
            focus: () => {},
            blur: () => {},
            click: () => {
              setOperateType(OPERATE_TYPE.OUTPAINT);
            },
          };
        }
      "
      v-automation="'outpaint'"
    >
      <div class="icon"></div>
      <div class="name">{{ $t("creatorZone.create.imageEditor.outpaint") }}</div>
    </div>

    <div
      class="erase"
      :class="{
        disabled: generatedImage,
      }"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              showHoverStyle(e);
            },
            cancel: (e) => {
              showHoverStyle(e, false);
            },
          };
        }
      "
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.erase'),
            focus: () => {},
            blur: () => {},
            click: () => {
              setOperateType(OPERATE_TYPE.ERASE);
            },
          };
        }
      "
      v-automation="'erase'"
    >
      <div class="icon"></div>
      <div class="name">{{ $t("creatorZone.create.imageEditor.erase") }}</div>
    </div>

    <!-- <div
      class="upscale"
      :class="{
        disabled: generatedImage,
      }"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              showHoverStyle(e);
            },
            cancel: (e) => {
              showHoverStyle(e, false);
            },
          };
        }
      "
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.upscale'),
            focus: () => {},
            blur: () => {},
            click: () => {
              setOperateType(OPERATE_TYPE.UPSCALE);
              genImages();
            },
          };
        }
      "
    >
      <div class="icon"></div>
      <div class="name">{{ $t("creatorZone.create.imageEditor.upscale") }}</div>
    </div> -->

    <div
      class="change-background"
      :class="{
        disabled: generatedImage,
      }"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              showHoverStyle(e);
            },
            cancel: (e) => {
              showHoverStyle(e, false);
            },
          };
        }
      "
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.changeBg'),
            focus: () => {},
            blur: () => {},
            click: () => {
              setOperateType(OPERATE_TYPE.CHANGE_BACKGROUND);
            },
          };
        }
      "
      v-automation="'change_background'"
    >
      <div class="icon"></div>
      <div class="name">{{ $t("creatorZone.create.imageEditor.changeBg") }}</div>
    </div>

    <!-- <div
      class="cutout"
      :class="{
        disabled: generatedImage,
      }"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              showHoverStyle(e);
            },
            cancel: (e) => {
              showHoverStyle(e, false);
            },
          };
        }
      "
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.cutout'),
            focus: () => {},
            blur: () => {},
            click: () => {
              setOperateType(OPERATE_TYPE.CUTOUT);
            },
          };
        }
      "
    >
      <div class="icon"></div>
      <div class="name">{{ $t("creatorZone.create.imageEditor.cutout") }}</div>
    </div> -->

    <div class="rest"></div>

    <div
      class="basic-editing"
      :class="{
        disabled: generatedImage,
      }"
      v-hover.mouse="
        () => {
          return {
            start: (e) => {
              showHoverStyle(e);
            },
            cancel: (e) => {
              showHoverStyle(e, false);
            },
          };
        }
      "
      v-helper="
        () => {
          return {
            role: 'button',
            ariaLabel: $t('creatorZone.create.imageEditor.basicEditing'),
            focus: () => {},
            blur: () => {},
            click: () => {
              router.push({
                path: '/quantum/creator-zone/editor',
                query: {
                  url: currentImage.url,
                  operateType: OPERATE_TYPE.CROP,
                },
              });
            },
          };
        }
      "
      v-automation="'basic_editing'"
    >
      <div class="icon"></div>
      <div class="name">{{ $t("creatorZone.create.imageEditor.basicEditing") }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, Ref } from "vue";
import { useRouter } from "vue-router";
import {
  SESSION_RECORD_SOURCE,
  IMAGE_STATUS,
  REFERENCEIMAGE_TYPE,
  OPERATE_TYPE,
  IsessionRecord,
  IcreateRef,
  ModelType,
} from "@/types";

const router = useRouter();

const {
  generatedImage,
  setReferenceImageUrl: _setReferenceImageUrl,
  setReferenceImageType: _setReferenceImageType,
  operateType,
  setOperateType: _setOperateType,
  currentImage,
  genImages: _genImages,
} = inject<IcreateRef>("CREATE_REF");

const setReferenceImageUrl = (value) => {
  if (generatedImage.value) {
    return;
  }

  _setReferenceImageUrl(value);
};

const setReferenceImageType = (value) => {
  if (generatedImage.value) {
    return;
  }

  _setReferenceImageType && _setReferenceImageType(value);
};

const setOperateType = (value) => {
  if (generatedImage.value) {
    return;
  }

  _setOperateType(value);
};

const genImages = () => {
  if (generatedImage.value) {
    return;
  }

  _genImages({
    referenceImageUrl: currentImage.value.url,
    referenceImageType: REFERENCEIMAGE_TYPE.MODEL,
    modelType: ModelType.CLOUD,
    operateType: OPERATE_TYPE.UPSCALE,
  });
};

const showHoverStyle = (e, expanded = true) => {
  if (generatedImage.value) {
    return;
  }

  let ele = null;

  if (e.type === "mouseenter" || e.type === "mouseleave") {
    ele = e.target;
  } else if (e.type === "touchstart" || e.type === "touchend" || e.type === "touchcancel") {
    if (e.target.classList.contains("icon") || e.target.classList.contains("name")) {
      ele = e.target.parentNode;
    } else {
      ele = e.target;
    }
  }

  if (expanded) {
    if (e.type === "mouseenter" || e.type === "touchstart") {
      ele.style.width =
        ele.querySelector(".name").getBoundingClientRect().right -
        ele.querySelector(".icon").getBoundingClientRect().left +
        "px";
      ele.classList.add("hovered");
    }
  } else {
    if (e.type === "mouseleave" || e.type === "touchend" || e.type === "touchcancel") {
      ele.style.width = null;
      ele.classList.remove("hovered");
    }
  }
};
</script>

<style lang="less" scoped>
.header {
  width: 100%;
  display: flex;

  > div {
    box-sizing: content-box;
    width: 16px;
    height: 32px;
    background: var(--color-secondary-container);
    padding: 0 8px;
    border-radius: 32px;
    overflow: hidden;
    transition: width 0.4s ease;
    display: grid;
    grid-template-columns: auto auto;
    align-items: center;

    + div {
      margin-left: 8px;
    }

    .icon {
      width: 16px;
      height: 16px;
      mask-size: 100%;
      background-color: var(--color-text-on-surface);
    }

    .name {
      margin-left: 4px;
      font-family: "Rookery New";
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-on-surface);
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &.hovered {
      box-shadow: 0px 2px 6px 2px #00000026;

      .icon,
      .name {
        cursor: pointer;
      }

      .name {
        opacity: 1;
      }
    }

    &.disabled {
      opacity: 0.38;
    }

    &.smart-editing,
    &.basic-editing {
      width: auto;
      overflow: visible;

      .name {
        opacity: 1;
      }
    }

    &.rest {
      flex: 1;
      width: 0;
      height: 0;
      margin-left: 0;
      opacity: 0;
    }
  }

  .smart-editing {
    position: relative;

    .icon {
      mask-image: url("@/assets/img/svg/SmartEditing.svg");

      &.checked {
        mask-image: url("@/assets/img/svg/checked.svg");
      }
    }

    .tip {
      display: none;
      background: var(--color-surfaces-surface-bright);
      padding: 16px;
      border-radius: 16px;
      position: absolute;
      top: 46px;
      right: 50%;
      z-index: 2;
      transform: translateX(50%);

      > div {
        margin-bottom: 16px;
        font-family: "Rookery New";
        font-size: 12px;
        font-weight: 700;
        color: var(--color-text-on-surface);
      }

      > img {
        max-width: none;
        width: 192px;
        height: 144px;
        border-radius: 8px;
      }

      &::after {
        content: "";
        display: inline-block;
        width: 16px;
        height: 16px;
        background: var(--color-surfaces-surface-bright);
        position: absolute;
        top: 0;
        right: 50%;
        transform: translate(50%, -50%) rotate(45deg);
      }
    }

    &.hovered {
      .tip {
        display: block;
      }
    }
  }

  .inpaint {
    .icon {
      mask-image: url("@/assets/img/svg/Inpaint2.svg");
    }
  }

  .outpaint {
    .icon {
      mask-image: url("@/assets/img/svg/Outpaint2.svg");
    }
  }

  .erase {
    .icon {
      mask-image: url("@/assets/img/svg/Erase2.svg");
    }
  }

  .upscale {
    .icon {
      mask-image: url("@/assets/img/svg/Upscale2.svg");
    }
  }

  .change-background {
    .icon {
      mask-image: url("@/assets/img/svg/RemoveBG2.svg");
    }
  }

  .cutout {
    .icon {
      mask-image: url("@/assets/img/svg/Cutout.svg");
    }
  }

  .basic-editing {
    .icon {
      mask-image: url("@/assets/img/svg/crop.svg");
    }
  }
}
</style>
