<template>
  <div class="chat-input bg-surface" ref="chatInputRef">
    <template v-if="showReferenceImage && referenceImageUrl">
      <div class="reference-image" v-automation="'reference_image'">
        <ImagePreview :src="referenceImageUrl" :loading="true" />
        <div
          v-if="showDeleteReferenceImageBtn"
          class="delete"
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel: $t('creatorZone.components.chatInput.deleteImage'),
                focus: () => {},
                blur: () => {},
                click: () => {
                  setReferenceImageUrl('');
                },
              };
            }
          "
        >
          <div class="icon"></div>
        </div>
      </div>
    </template>

    <div class="input" v-automation="'creator_zone_input'">
      <div class="tip" v-if="operateType === OPERATE_TYPE.SMART_EDITING">
        {{ $t("creatorZone.components.chatInput.tip") }}
      </div>

      <textarea
        id="id-da7e612d"
        class="text-text-on-surface"
        :placeholder="$t('creatorZone.components.chatInput.placeholder')"
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

            if (content.length > 0) {
              if (genBtnStatus === GenBtnStatus.INIT) {
                send();
              } else {
                ElMessage({
                  message: $t('creatorZone.messages.tooFrequentMessage'),
                  type: 'error',
                });
              }
            }
          }
        "
        v-helper="
          () => {
            return {
              role: 'textbox',
              attributes: {
                'aria-placeholder': $t('creatorZone.components.chatInput.placeholder'),
              },
              focus: () => {},
              blur: () => {},
              click: () => {},
            };
          }
        "
      ></textarea>
    </div>

    <div class="btns">
      <div
        v-if="showUploadReferenceImageBtn"
        class="upload-image"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.components.chatInput.uploadImage'),
              focus: () => {},
              blur: () => {},
              click: () => {
                chatInputRef.querySelector(`input[type='file']`).value = null;
                chatInputRef.querySelector(`input[type='file']`)?.click();
              },
            };
          }
        "
        v-automation="'upload_image'"
      >
        <div class="icon bg-on-secondary-container"></div>

        <input
          style="display: none"
          type="file"
          :accept="imageTypes.map((imageType) => `.${imageType}`).join(',')"
          @change="
            (e) => {
              setReferenceImageUrl(e);
              onUpload(e);
            }
          "
        />
      </div>

      <div
        v-if="showRatioSelectBtn"
        class="choose-ratio bg-secondary-container"
        :class="{
          top: placement === PLACEMENT.TOP,
          bottom: placement === PLACEMENT.BOTTOM,
          active: ratioVisible,
        }"
      >
        <div
          id="id-06027064"
          class="trigger"
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel:
                  selectedRatio?.name || $t('creatorZone.components.chatInput.chooseRatio'),
                ariaHaspopup: true,
                ariaExpanded: ratioVisible,
                elId: '#id-197ec643',
                focus: () => {},
                blur: () => {},
                click: () => {
                  ratioVisible = !ratioVisible;
                },
              };
            }
          "
        >
          <div class="icon bg-on-secondary-container"></div>

          <div class="name text-on-secondary-container">
            {{ selectedRatio?.name || $t("creatorZone.components.chatInput.chooseRatio") }}
          </div>

          <div class="icon bg-on-secondary-container"></div>
        </div>

        <div
          id="id-197ec643"
          class="content bg-surfaces-surface-bright"
          v-if="ratioVisible"
          v-helper="
            () => {
              return {
                tabIndex: -1,
                role: 'listbox',
                ariaHidden: !ratioVisible,
                ariaRestricted: ratioVisible,
                elId: '#id-06027064',
                focus: () => {},
                blur: () => {},
                click: () => {},
              };
            }
          "
        >
          <template v-for="ratio in ratios">
            <div
              class="item"
              :class="{
                selected: ratio.selected,
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
                    role: 'option',
                    ariaLabel: ratio.desc,
                    ariaSelected: ratio.selected,
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
                class="icon bg-text-on-surface"
                :class="{
                  'one-one': ratio.id === RATIO.ONE_ONE,
                  'two-two': ratio.id === RATIO.TWO_TWO,
                  'three-four': ratio.id === RATIO.THREE_FOUR,
                  'nine-sixteen': ratio.id === RATIO.NINE_SIXTEEN,
                  'four-three': ratio.id === RATIO.FOUR_THREE,
                  'sixteen-nine': ratio.id === RATIO.SIXTEEN_NINE,
                }"
              ></div>

              <div class="text-text-on-surface">{{ ratio.desc }}</div>
            </div>
          </template>
        </div>
      </div>

      <div
        v-if="showStyleSelectBtn"
        class="choose-style bg-secondary-container"
        :class="{
          top: placement === PLACEMENT.TOP,
          bottom: placement === PLACEMENT.BOTTOM,
          active: styleVisible,
        }"
      >
        <div
          id="id-37559e8d"
          class="trigger"
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel:
                  selectedStyle?.styleName || $t('creatorZone.components.chatInput.chooseStyle'),
                ariaHaspopup: true,
                ariaExpanded: styleVisible,
                elId: '#id-bdc5ef1b',
                focus: () => {},
                blur: () => {},
                click: () => {
                  styleVisible = !styleVisible;
                },
              };
            }
          "
        >
          <div class="icon bg-on-secondary-container"></div>

          <div class="name text-on-secondary-container">
            {{ selectedStyle?.styleName || $t("creatorZone.components.chatInput.chooseStyle") }}
          </div>

          <div class="icon bg-on-secondary-container"></div>
        </div>

        <div
          id="id-bdc5ef1b"
          class="content bg-surfaces-surface-bright"
          v-if="styleVisible"
          v-helper="
            () => {
              return {
                tabIndex: -1,
                role: 'listbox',
                ariaHidden: !styleVisible,
                ariaRestricted: styleVisible,
                elId: '#id-37559e8d',
                focus: () => {},
                blur: () => {},
                click: () => {},
              };
            }
          "
        >
          <el-scrollbar @touchmove.stop>
            <template v-for="style in styles">
              <div
                class="item"
                :class="{
                  selected: style.selected,
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
                      role: 'option',
                      ariaLabel: style.styleName,
                      ariaSelected: style.selected,
                      focus: () => {},
                      blur: () => {},
                      click: () => {
                        setStyles(style.styleId);
                      },
                    };
                  }
                "
              >
                <img :src="style.iconUrl" />

                <div class="text-text-on-surface">{{ style.styleName }}</div>
              </div>
            </template>
          </el-scrollbar>
        </div>
      </div>

      <div
        v-if="showModelSelectBtn"
        class="choose-model bg-secondary-container"
        :class="{
          top: placement === PLACEMENT.TOP,
          bottom: placement === PLACEMENT.BOTTOM,
          active: modelVisible,
        }"
        v-automation="'choose_model'"
      >
        <div
          id="id-2e6b59d0"
          class="trigger"
          v-helper="
            () => {
              return {
                role: 'button',
                ariaLabel:
                  selectedModel?.modelName || $t('creatorZone.components.chatInput.chooseModel'),
                ariaHaspopup: true,
                ariaExpanded: modelVisible,
                elId: '#id-3d4da1bb',
                focus: () => {},
                blur: () => {},
                click: () => {
                  modelVisible = !modelVisible;
                },
              };
            }
          "
        >
          <div class="icon bg-on-secondary-container"></div>

          <div class="name text-on-secondary-container">
            {{ selectedModel?.modelName || $t("creatorZone.components.chatInput.chooseModel") }}
          </div>

          <div class="icon bg-on-secondary-container"></div>
        </div>

        <div
          id="id-3d4da1bb"
          class="content bg-surfaces-surface-bright"
          v-if="modelVisible"
          v-helper="
            () => {
              return {
                tabIndex: -1,
                role: 'listbox',
                ariaHidden: !modelVisible,
                ariaRestricted: modelVisible,
                elId: '#id-2e6b59d0',
                focus: () => {},
                blur: () => {},
                click: () => {},
              };
            }
          "
        >
          <el-scrollbar @touchmove.stop>
            <template v-for="model in models">
              <div
                class="item"
                :class="{
                  selected: model.selected,
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
                      role: 'option',
                      ariaLabel: `${model.modelName} ${model.desc} ${model.duration}`,
                      ariaSelected: model.selected,
                      focus: () => {},
                      blur: () => {},
                      click: () => {
                        setModels(model.modelId);
                      },
                    };
                  }
                "
                v-automation="model.modelName"
              >
                <div class="name text-text-on-surface">{{ model.modelName }}</div>
                <div class="desc text-text-on-surface-variant">{{ model.desc }}</div>
                <div class="duration text-text-on-surface bg-surface-container">
                  {{ model.duration }}
                </div>
              </div>
            </template>
          </el-scrollbar>
        </div>
      </div>

      <div class="rest"></div>

      <div
        v-if="content.length > 0"
        class="reset-input bg-focus-focus-container"
        v-helper="
          () => {
            return {
              role: 'button',
              ariaLabel: $t('creatorZone.components.chatInput.clearInput'),
              elId: '#id-da7e612d',
              focus: () => {},
              blur: () => {},
              click: () => {
                content = '';
              },
            };
          }
        "
      >
        <div class="icon bg-text-on-surface"></div>
      </div>

      <template v-if="genBtnStatus === GenBtnStatus.INIT && content.length > 0">
        <div
          v-if="content.length > 0"
          class="send bg-primary-primary"
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
                ariaLabel: $t('creatorZone.components.chatInput.send'),
                elId: '#id-da7e612d',
                focus: () => {},
                blur: () => {},
                click: () => {
                  send();
                },
              };
            }
          "
          v-automation="'creator_zone_send_btn'"
        >
          <div class="icon bg-on-primary"></div>
        </div>
        <div v-else class="send">
          <div class="icon"></div>
        </div>
      </template>
      <template v-else-if="genBtnStatus === GenBtnStatus.PREPARING">
        <div class="preparing bg-primary-primary">
          <div class="icon bg-on-primary"></div>
        </div>
      </template>
      <template v-else-if="genBtnStatus === GenBtnStatus.RUNNING">
        <div
          class="running bg-primary-primary"
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
              cancel();
            }
          "
          v-automation="'creator_zone_cancel_btn'"
        >
          <div class="icon bg-on-primary"></div>
        </div>
      </template>
      <template v-else-if="genBtnStatus === GenBtnStatus.CANCELLING">
        <div class="cancelling bg-primary-primary">
          <div class="icon bg-on-primary"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onBeforeUnmount, ref, Ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import {
  GenBtnStatus,
  SESSIONID_PROMPT_MAX_LENGTH,
  getLocalBaseModelGenImageSize,
  imageTypes,
} from "@/constant";
import { Istyle, ModelType, RATIO, OPERATE_TYPE } from "@/types";
import { fileToImageBase64, urlToFile } from "@/services/CreatorZone/file";
import { getStyleList } from "@/services/CreatorZone/styles";
import ImagePreview from "@/components/CreatorZone/ImagePreview/index.vue";

enum PLACEMENT {
  TOP = "top",
  BOTTOM = "botttom",
}

const router = useRouter();

const { t } = useI18n();

const props = defineProps({
  placement: {
    type: String,
    default: PLACEMENT.BOTTOM,
  },
  showReferenceImage: {
    type: Boolean,
    default: true,
  },
  showDeleteReferenceImageBtn: {
    type: Boolean,
    default: true,
  },
  showUploadReferenceImageBtn: {
    type: Boolean,
    default: true,
  },
  showRatioSelectBtn: {
    type: Boolean,
    default: true,
  },
  showStyleSelectBtn: {
    type: Boolean,
    default: true,
  },
  showModelSelectBtn: {
    type: Boolean,
    default: true,
  },
  content: {
    type: String,
    default: "",
  },
  referenceImageUrl: {
    type: String,
    default: "",
  },
  ratioId: {
    type: String,
    default: "",
  },
  styleId: {
    type: Number,
    default: 0,
  },
  modelId: {
    type: String,
    default: "",
  },
  operateType: {
    type: Number,
    default: OPERATE_TYPE.TEXT_TO_IMAGE,
  },
  genBtnStatus: {
    type: Number,
    default: GenBtnStatus.INIT,
  },
  onUpload: {
    type: Function,
    default: () => {},
  },
  onReferenceImageUrlChange: {
    type: Function,
    default: () => {},
  },
  onRatioChange: {
    type: Function,
    default: () => {},
  },
  send: Function,
  cancel: Function,
});

const chatInputRef = ref(null);

const content = ref<string>("");

const referenceImageUrl = ref<string>("");
const referenceDimension = ref<string>("");
const referenceStrength = ref<number>(0);

const ratios = ref([
  {
    id: RATIO.ONE_ONE,
    name: RATIO.ONE_ONE,
    desc: t(
      "creatorZone.components.chatInput.ratios.1:1",
      getLocalBaseModelGenImageSize(RATIO.ONE_ONE, RATIO)
    ),
    selected: true,
  },
  {
    id: RATIO.TWO_TWO,
    name: RATIO.ONE_ONE,
    desc: t(
      "creatorZone.components.chatInput.ratios.1:1",
      getLocalBaseModelGenImageSize(RATIO.TWO_TWO, RATIO)
    ),
    selected: false,
  },
  {
    id: RATIO.THREE_FOUR,
    name: RATIO.THREE_FOUR,
    desc: t(
      "creatorZone.components.chatInput.ratios.3:4",
      getLocalBaseModelGenImageSize(RATIO.THREE_FOUR, RATIO)
    ),
    selected: false,
  },
  {
    id: RATIO.NINE_SIXTEEN,
    name: RATIO.NINE_SIXTEEN,
    desc: t(
      "creatorZone.components.chatInput.ratios.9:16",
      getLocalBaseModelGenImageSize(RATIO.NINE_SIXTEEN, RATIO)
    ),
    selected: false,
  },
  {
    id: RATIO.FOUR_THREE,
    name: RATIO.FOUR_THREE,
    desc: t(
      "creatorZone.components.chatInput.ratios.4:3",
      getLocalBaseModelGenImageSize(RATIO.FOUR_THREE, RATIO)
    ),
    selected: false,
  },
  {
    id: RATIO.SIXTEEN_NINE,
    name: RATIO.SIXTEEN_NINE,
    desc: t(
      "creatorZone.components.chatInput.ratios.16:9",
      getLocalBaseModelGenImageSize(RATIO.SIXTEEN_NINE, RATIO)
    ),
    selected: false,
  },
]);
const selectedRatio = computed(() => {
  return ratios.value.find((ratio) => ratio.selected);
});
const ratioVisible = ref(false);

const styles = ref<Istyle[]>([]);
const selectedStyle = computed(() => {
  return styles.value.find((style) => style.selected);
});
const styleVisible = ref(false);

const models = ref([
  {
    modelId: "2",
    modelType: ModelType.CLOUD,
    modelName: "Cloud",
    desc: "Google's latest image generation model.",
    duration: "20s",
    selected: false,
  },
  {
    modelId: "1",
    modelType: ModelType.LOCAL,
    modelName: "Local",
    desc: "Advanced image generation model.",
    duration: "30s",
    selected: true,
  },
]);
const selectedModel = computed(() => {
  return models.value.find((model) => model.selected);
});
const modelVisible = ref(false);

const setContent = async (e, trimed = false) => {
  const value = (e.target as HTMLTextAreaElement).value;

  content.value = trimed ? value.trim() : value;

  await nextTick();

  changeInputStyle();
};

const setTipTop = () => {
  if (props.operateType === OPERATE_TYPE.SMART_EDITING) {
    chatInputRef.value.querySelector(".tip").style.top =
      -chatInputRef.value.querySelector(".input textarea").scrollTop + "px";
  }
};

const setTextareaHeight = () => {
  const ele = chatInputRef.value.querySelector(".input textarea");

  ele.style.height = "auto";
  ele.style.height = ele.scrollHeight + "px";
};

const setTextareaTextIndent = () => {
  if (props.operateType === OPERATE_TYPE.SMART_EDITING) {
    chatInputRef.value.querySelector(".input textarea").style.textIndent =
      chatInputRef.value.querySelector(".tip").getBoundingClientRect().width + 6 + "px";
  } else {
    chatInputRef.value.querySelector(".input textarea").style.textIndent = null;
  }
};

const setReferenceImageUrl = async (value) => {
  if (value instanceof Event) {
    referenceImageUrl.value = (await fileToImageBase64(
      (value.target as HTMLInputElement).files[0]
    )) as string;
  } else if (value instanceof File) {
    referenceImageUrl.value = (await fileToImageBase64(value)) as string;
  } else if (value.startsWith("https://") || value.startsWith("http://")) {
    const file = await urlToFile(value);

    referenceImageUrl.value = (await fileToImageBase64(file)) as string;
  } else if (value.startsWith("data:image/") && value.includes("base64,")) {
    referenceImageUrl.value = value;
  } else if (value === "") {
    referenceImageUrl.value = value;
  }

  props.onReferenceImageUrlChange(value);
};

const setRatios = (id) => {
  ratios.value = ratios.value.map((ratio) => {
    return {
      ...ratio,
      selected: ratio.id === id,
    };
  });

  props.onRatioChange(selectedRatio.value.id);
};

const setStyles = (id) => {
  styles.value = styles.value.map((style) => {
    return {
      ...style,
      selected: style.styleId === id,
    };
  });
};

const setModels = (modelId) => {
  models.value = models.value.map((model) => {
    return {
      ...model,
      selected: model.modelId === modelId,
    };
  });
};

const send = async () => {
  const { width, height } = getLocalBaseModelGenImageSize(selectedRatio.value.id, RATIO);

  props.send({
    content: content.value,
    modelId: selectedModel.value.modelId,
    modelType: selectedModel.value.modelType,
    referenceImageUrl: referenceImageUrl.value,
    referenceDimension: referenceDimension.value,
    referenceStrength: referenceStrength.value,
    ratioId: selectedRatio.value.id,
    width,
    height,
    styles: selectedStyle.value
      ? JSON.stringify([
          {
            styleId: selectedStyle.value.styleId,
            styleName: selectedStyle.value.styleName,
            isDefault: selectedStyle.value.isDefault,
          },
        ])
      : JSON.stringify([]),
  });

  content.value = "";

  setReferenceImageUrl("");
  referenceDimension.value = "";
  referenceStrength.value = 0;

  // setRatios(RATIO.ONE_ONE);
  // setStyles(undefined);

  await nextTick();

  changeInputStyle();
};

const changeInputStyle = () => {
  setTextareaHeight();
  setTextareaTextIndent();
  setTipTop();
};

const Eresize = () => {
  changeInputStyle();
};

const Eclick = (e) => {
  if (!chatInputRef.value.querySelector(".choose-ratio .trigger")?.contains(e.target)) {
    ratioVisible.value = false;
  }

  if (!chatInputRef.value.querySelector(".choose-style .trigger")?.contains(e.target)) {
    styleVisible.value = false;
  }

  if (!chatInputRef.value.querySelector(".choose-model .trigger")?.contains(e.target)) {
    modelVisible.value = false;
  }
};

const Eenter = (e) => {
  if (e.key === "Enter") {
    Eclick(e);
  }
};

const onScroll = () => {
  changeInputStyle();
};

onMounted(async () => {
  window.addEventListener("resize", Eresize);

  window.addEventListener("click", Eclick);

  window.addEventListener("keydown", Eenter);

  chatInputRef.value.querySelector(".input textarea").addEventListener("scroll", onScroll);

  props.onRatioChange(selectedRatio.value.id);

  const getStyleListRes = await getStyleList();

  if (getStyleListRes.success) {
    styles.value = getStyleListRes.data.map((style, index) => {
      return {
        ...style,
        selected: index === 0,
      };
    });

    if (props.styleId) {
      setStyles(props.styleId);
    }
  } else {
    ElMessage({
      message: t("creatorZone.messages.failedToRetrieve"),
      type: "error",
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", Eresize);

  window.removeEventListener("click", Eclick);

  window.removeEventListener("keydown", Eenter);

  chatInputRef.value.querySelector(".input textarea").removeEventListener("scroll", onScroll);
});

watch(
  [() => props.content],
  () => {
    content.value = props.content || "";

    changeInputStyle();
  },
  { immediate: true }
);

watch(
  [() => props.referenceImageUrl],
  () => {
    setReferenceImageUrl(props.referenceImageUrl || "");
  },
  { immediate: true }
);

watch(
  [() => props.ratioId],
  () => {
    if (props.ratioId) {
      setRatios(props.ratioId);
    }
  },
  { immediate: true }
);

watch(
  [() => props.styleId],
  () => {
    if (props.styleId) {
      setStyles(props.styleId);
    }
  },
  { immediate: true }
);

watch(
  [() => props.modelId],
  () => {
    if (props.modelId) {
      setModels(props.modelId);
    }
  },
  { immediate: true }
);

watch(
  [() => props.operateType],
  async () => {
    await nextTick();

    changeInputStyle();
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.chat-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;

  .reference-image {
    margin-bottom: 14px;
    width: 100%;
    position: relative;

    :deep(.image-init),
    :deep(.image-loading),
    :deep(.image-preview),
    :deep(.image-failed) {
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }

    :deep(.image-preview) {
      object-fit: cover;
    }

    :deep(.image-loading),
    :deep(.image-failed) {
      > div {
        width: 24px;
        height: 18px;
      }
    }

    .delete {
      width: 24px;
      height: 24px;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      cursor: pointer;
      position: absolute;
      top: 4px;
      left: 20px;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        width: 16px;
        height: 16px;
        mask-image: url("@/assets/img/svg/delete.svg");
        mask-size: 100%;
        background-color: #ffffff;
      }
    }
  }

  .input {
    overflow: hidden;
    position: relative;

    .tip {
      font-family: "Rookery New";
      font-size: 14px;
      font-weight: 700;
      line-height: 20px;
      background: radial-gradient(50% 50% at 50% 50%, #5c8dff 0%, #855ee1 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      position: absolute;
      top: 0;
      left: 0;
    }

    textarea {
      display: block;
      max-height: 70 * 3px;
      min-height: 70px;
      width: 100%;
      background: transparent;
      border: 0;
      outline: 0;
      resize: none;
      font-family: "Rookery New";
      font-size: 14px;
      font-weight: 400;
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

  .btns {
    margin-top: 18px;
    display: flex;
    align-items: center;

    .upload-image {
      margin-right: 12px;
      cursor: pointer;

      .icon {
        width: 18px;
        height: 18px;
        mask-image: url("@/assets/img/svg/upload-image3.svg");
        mask-size: 100%;
      }
    }

    .choose-ratio,
    .choose-style,
    .choose-model {
      margin-right: 8px;
      border-radius: 999px;
      position: relative;

      .trigger {
        height: 32px;
        padding: 0 8px;
        cursor: pointer;
        display: flex;
        align-items: center;

        .icon:first-child {
          width: 16px;
          height: 16px;
          mask-size: 100%;
        }

        .name {
          margin-left: 4px;
          font-family: "Rookery New";
          font-size: 12px;
          font-weight: 600;
        }

        .icon:last-child {
          margin-left: 4px;
          width: 16px;
          height: 16px;
          mask-image: url("@/assets/img/svg/arrow-down.svg");
          mask-size: 100%;
        }

        > div.name,
        .icon:last-child {
          display: none;
        }
      }

      .content {
        position: absolute;
        left: 0;
        z-index: 1;
        min-width: 270px;
        padding: 4px;
        box-shadow: 0px 2px 6px 2px #00000026;
        border-radius: 16px;

        .item {
          width: 100%;
          cursor: pointer;
          display: flex;
          align-items: center;

          &.hovered,
          &.selected {
            background: var(--color-on-primary-hover);
            border-radius: 16px;
          }

          .icon,
          img {
            margin-right: 12px;
          }

          div {
            font-family: "Rookery New";
            font-size: 12px;
            font-weight: 400;
          }

          + .item {
            margin-top: 4px;
          }
        }
      }

      &.top {
        .content {
          top: -8px;
          transform: translateY(-100%);
        }
      }

      &.bottom {
        .content {
          top: calc(100% + 8px);
        }
      }

      &.active {
        position: relative;

        .trigger {
          .icon:last-child {
            rotate: 180deg;
          }

          &::after {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            background-color: var(--color-on-primary-container-hover);
            border-radius: 999px;
            position: absolute;
            top: 0;
            right: 0;
          }
        }
      }
    }

    .choose-ratio {
      .icon:first-child {
        mask-image: url("@/assets/img/svg/choose-ratio.svg");
      }

      .item {
        padding: 12px;

        .icon {
          width: 18px;
          height: 18px;
          mask-size: 100%;

          &.one-one {
            mask-image: url("@/assets/img/svg/1.1.svg");
          }

          &.two-two {
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
      }
    }

    .choose-style {
      .icon:first-child {
        mask-image: url("@/assets/img/svg/choose-style.svg");
      }

      .content {
        height: 224px;

        .item {
          padding: 4px;

          img {
            width: 40px;
            height: 40px;
            border-radius: 8px;
          }
        }
      }
    }

    .choose-model {
      .icon:first-child {
        mask-image: url("@/assets/img/svg/choose-model.svg");
      }

      .content {
        height: 224px;

        .item {
          padding: 12px;
          position: relative;
          flex-direction: column;
          align-items: flex-start;

          .name {
            font-family: "Rookery New";
            font-size: 14px;
            font-weight: 700;
            line-height: 20px;
          }

          .desc {
            font-family: "Rookery New";
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;
          }

          .duration {
            height: 20px;
            padding: 0 8px;
            border-radius: 999px;
            font-family: "Rookery New";
            font-size: 12px;
            font-weight: 400;
            position: absolute;
            right: 16px;
            top: 10px;
            display: flex;
            align-items: center;
          }

          &.selected {
            .name {
              color: var(--color-text-accents-primary);
            }
          }
        }
      }
    }

    .rest {
      flex: 1;
    }

    .reset-input {
      margin-right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        width: 18px;
        height: 18px;
        mask-image: url("@/assets/img/svg/close2.svg");
        mask-size: 100%;
      }
    }

    .send,
    .preparing,
    .running,
    .cancelling {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        width: 18px;
        height: 18px;
        mask-size: 100%;
      }
    }

    .send,
    .running {
      &.hovered {
        box-shadow: 0px 2px 6px 2px #00000026;
        cursor: pointer;
      }
    }

    .send {
      .icon {
        mask-image: url("@/assets/img/svg/send.svg");
      }
    }

    .preparing,
    .running,
    .cancelling {
      .icon {
        mask-image: url("@/assets/img/svg/stop.svg");
      }
    }

    .preparing,
    .cancelling {
      opacity: 0.38;
    }
  }
}

@media screen and (min-width: 1201px) {
  .chat-input .btns .trigger {
    div.name,
    .icon:last-child {
      display: block !important;
    }
  }
}
</style>
