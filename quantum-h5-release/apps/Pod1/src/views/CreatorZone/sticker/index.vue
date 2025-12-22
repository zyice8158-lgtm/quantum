<template>
  <div class="sticker-page w-full h-full p-[32px] flex flex-column" ref="stickerRef">
    <!-- <GlobalBar :showHomeBtn="true" /> -->

    <div class="sticker__content">
      <div class="describe__content" v-if="!described">
        <div class="title">{{ t("creatorZone.sticker.title") }}</div>
        <div class="describe-input" v-automation="'describe_input'">
          <textarea
            class="pl-[108px] mt-[10px] text-body-m leading-body-m"
            :placeholder="t(`creatorZone.sticker.describePlaceholder`)"
            :value="content"
            :maxlength="genImageRule.localModelGenDescLength"
            rows="1"
            @input="
              (e) => {
                setContent(e, false);
              }
            "
          ></textarea>
          <div class="absolute top-[22px] left-[24px]">
            <span
              class="font-bold text-body-m leading-body-m text-transparent bg-clip-text bg-radial from-processing-gradient-stop-0 from-0% to-processing-gradient-stop-100"
              >{{ t(`creatorZone.sticker.createSticker`) }}</span
            >
          </div>
          <div class="describe-counts">
            <!-- {{ content.length }}/{{ genImageRule.localModelGenDescLength }} -->
            <div
              v-tooltip.top="
                `6 uses per day, aggregated across devices. Exceeding switches to local model.`
              "
            >
              <QButton class="mr-[8px]" color="secondary" size="small">
                <IconCloud class="-ml-[8px] -mr-[4px]" />
                <span>
                  {{ t(`creatorZone.avatar.cloudModelBtn`) }}
                </span>
                <IconFailed class="-mr-[8px] -ml-[4px]" />
              </QButton>
            </div>
          </div>
          <QIconButton
            color="gray"
            class="absolute! bottom-[14px] right-[56px]"
            v-if="content.length"
            @click="
              () => {
                content = '';
              }
            "
          >
            <IconClose />
          </QIconButton>
          <QIconButton
            color="primary"
            class="absolute! bottom-[14px] right-[16px]"
            :disabled="!content.length"
            @click="
              () => {
                handleContinue();
              }
            "
            v-automation="'sticker_send_btn'"
          >
            <IconForward />
          </QIconButton>
        </div>
        <div class="explore-ideas">
          <div class="explore-ideas__title">{{ t("creatorZone.sticker.exploreIdeasTitle") }}</div>
          <QButton
            variant="text"
            :label="t(`creatorZone.sticker.refreshBtn`)"
            @click="
              () => {
                handleRefreshexamples();
              }
            "
          >
            <template #icon>
              <IconRedo />
            </template>
          </QButton>
        </div>
        <div class="examples">
          <div
            class="example"
            v-for="item in examplesList"
            @click="
              () => {
                getExampleDes(item);
              }
            "
          >
            <img :src="item.url" alt="" />
          </div>
        </div>
      </div>
      <div class="sticker-choose__content" v-else>
        <div class="loading" v-show="loading">
          <ColorfulLoading />
          <div class="loading-text">
            <span class="loading-text-inner" v-automation="'sticker_loading_text'">{{ loadingText }}</span>
          </div>
        </div>
        <div class="sticker-choose">
          <div class="sticker__area" v-show="!loading">
            <QIconButton
              color="secondary"
              :disabled="currentStickerIndex === 0"
              @click="
                () => {
                  handlePrev();
                }
              "
            >
              <IconArrowLeft />
            </QIconButton>
            <img class="sticker-image" :src="currentSticker?.url || ''" alt="" />
            <QIconButton
              color="secondary"
              :disabled="currentStickerIndex === stickerList.length - 1"
              @click="
                () => {
                  handleNext();
                }
              "
            >
              <IconArrowRight />
            </QIconButton>
          </div>
          <div class="operation-btns" v-show="!loading">
            <div class="left-btns">
              <QButton
                class="mr-[8px]"
                color="secondary"
                :label="t(`creatorZone.sticker.redoBtn`)"
                @click="
                  () => {
                    handleRedo();
                  }
                "
              >
                <template #icon>
                  <IconRefresh />
                </template>
              </QButton>
            </div>
            <div class="right-btns">
              <QIconButton
                class="mr-[8px]"
                color="secondary"
                @click="
                  () => {
                    handleCopy();
                  }
                "
              >
                <template #icon>
                  <IconCopy2 />
                </template>
              </QIconButton>
              <QIconButton
                class="mr-[8px]"
                color="secondary"
                @click="
                  () => {
                    handleShare();
                  }
                "
              >
                <template #icon>
                  <IconShare />
                </template>
              </QIconButton>
              <QIconButton
                class="mr-[8px]"
                color="secondary"
                @click="
                  () => {
                    handleDownload();
                  }
                "
              >
                <template #icon>
                  <IconDownloadButton />
                </template>
              </QIconButton>
            </div>
          </div>
          <div :class="['thumbnails__area', loading ? 'in-loading' : '']">
            <QIconButton
              color="secondary"
              :disabled="currentStickerIndex === 0"
              v-show="!loading"
              @click="
                () => {
                  handleThumbnailsPrev();
                }
              "
            >
              <IconArrowLeft />
            </QIconButton>
            <div class="thumbnails">
              <el-scrollbar
                ref="thumbnailsRef"
                @touchmove.stop
                @scroll="
                  ({ scrollLeft }) => {
                    translateX = scrollLeft;
                  }
                "
              >
                <div class="thumbnailsInner" ref="thumbnailsInnerRef">
                  <div
                    :class="['thumbnail', currentStickerIndex === index ? 'active' : '']"
                    v-for="(item, index) in stickerList"
                    key="item.id"
                    @click="
                      () => {
                        currentStickerIndex = index;
                      }
                    "
                    v-automation="'sticker_thumbnail'"
                  >
                    <ImagePreview :src="item.url" :loading="true" />
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <QIconButton
              color="secondary"
              :disabled="currentStickerIndex === stickerList.length - 1"
              v-show="!loading"
              @click="
                () => {
                  handleThumbnailsNext();
                }
              "
            >
              <IconArrowRight />
            </QIconButton>
          </div>
          <div :class="['describe-input']" v-show="!loading" v-automation="'sticker_describe_input'">
            <textarea
              class="pl-[108px] mt-[10px] text-body-m leading-body-m"
              placeholder="escribe what's in your mind, key words..."
              :value="content"
              :maxlength="genImageRule.localModelGenDescLength"
              @input="
                (e) => {
                  setContent(e, false);
                }
              "
            ></textarea>
            <div class="absolute top-[22px] left-[24px]">
              <span
                class="font-bold text-body-m leading-body-m text-transparent bg-clip-text bg-radial from-processing-gradient-stop-0 from-0% to-processing-gradient-stop-100"
                >{{ t(`creatorZone.sticker.createSticker`) }}</span
              >
            </div>
            <div class="describe-counts">
              <!-- {{ content.length }}/{{ genImageRule.localModelGenDescLength }} -->
              <div
                v-tooltip.top="
                  `6 uses per day, aggregated across devices. Exceeding switches to local model.`
                "
              >
                <QButton class="mr-[8px]" color="secondary" size="small">
                  <IconCloud class="-ml-[8px] -mr-[4px]" />
                  <span>
                    {{ t(`creatorZone.avatar.cloudModelBtn`) }}
                  </span>
                  <IconFailed class="-mr-[8px] -ml-[4px]" />
                </QButton>
              </div>
            </div>
            <div
              class="clean-btn describe-btn"
              v-if="content.length && !loading"
              @click="
                () => {
                  content = '';
                }
              "
            >
              <img src="@/assets/img/svg/close-gray.svg" alt="" />
            </div>
            <div
              :class="['generate-btn', 'describe-btn', content.length ? '' : 'disabled']"
              v-if="!loading"
              @click="
                () => {
                  handleContinue();
                }
              "
              v-automation="'sticker_generate_btn'"
            >
              <img src="@/assets/img/svg/right-purple.svg" alt="" v-if="content.length" />
              <img src="@/assets/img/svg/right-gray.svg" alt="" v-else />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { genImageRule } from "@/constant";
import ColorfulLoading from "@/components/CreatorZone/ColorfulLoading/index.vue";
import ImagePreview from "@/components/CreatorZone/ImagePreview/index.vue";
import { getImages } from "@/services/CreatorZone/getImages";
import { v4 as uuidv4 } from "uuid";
import { translateImageFile, urlToFile } from "@/services/CreatorZone/file";
import { QButton, QIconButton } from "@libs/p-comps/volt/QButton/index.tsx";
import {
  IconCloud,
  IconFailed,
  IconClose,
  IconForward,
  IconRedo,
  IconArrowRight,
  IconArrowLeft,
  IconRefresh,
  IconCopy2,
  IconShare,
  IconDownloadButton,
} from "@quantum/icons";

import mockStickerImage1 from "@/assets/img/sticker/mock/sticker_1.png";
import mockStickerImage2 from "@/assets/img/sticker/mock/sticker_2.png";
import mockStickerImage3 from "@/assets/img/sticker/mock/sticker_3.png";
import mockStickerImage4 from "@/assets/img/sticker/mock/sticker_4.png";
import mockStickerImage5 from "@/assets/img/sticker/mock/sticker_5.png";

const { t } = useI18n();

const stickerRef = ref(null);

const content = ref("");

const examplesList = ref([]);

const described = ref(false);
const loading = ref(false);

const thumbnailsRef = ref(null);
const thumbnailsInnerRef = ref(null);

const translateX = ref(0);

const stickerList = ref([]);

const currentStickerIndex = ref(0);
const currentSticker = computed(() => {
  return stickerList.value[currentStickerIndex.value];
});

watch(
  [() => currentStickerIndex.value],
  async () => {
    await nextTick();

    setTranslateX(currentStickerIndex.value);
  },
  { immediate: true }
);

const loadingText = ref(t("creatorZone.sticker.loadingText1"));
let laodingTextTimer: number;
const turningLoadingText = (i: number) => {
  laodingTextTimer = setTimeout(() => {
    loadingText.value = t(`creatorZone.sticker.loadingText${i}`);
    if (i < 2) {
      i++;
      turningLoadingText(i);
    } else {
      turningLoadingText(1);
    }
  }, 4000);
};
watch(
  [() => loading.value],
  () => {
    if (loading.value) {
      loadingText.value = t("creatorZone.sticker.loadingText1");
      turningLoadingText(2);
    } else {
      clearTimeout(laodingTextTimer);
    }
  },
  { immediate: true }
);

const getExampleDes = (item) => {
  content.value = item.des;
};
// const handleRecording = () => {
//   ElMessage({
//     message: t("creatorZone.sticker.recordingMessage"),
//     type: "success",
//   });
// };
const setContent = (e, trimed = false) => {
  if (e.inputType === "insertLineBreak") {
    return handleContinue();
  }
  const value = (e.target as HTMLTextAreaElement).value;
  content.value = trimed ? value.trim() : value;
};

const setTranslateX = (i) => {
  if (i === undefined || !stickerRef.value.querySelector(".thumbnails")) {
    return;
  }

  const { left, right } = stickerRef.value.querySelector(".thumbnails").getBoundingClientRect();
  const { left: left2, right: right2 } = stickerRef.value
    .querySelector(`.thumbnail:nth-child(${i + 1})`)
    .getBoundingClientRect();

  if (left2 < left) {
    translateX.value -= left - left2;
  }

  if (right2 > right) {
    translateX.value += right2 - right;
  }

  thumbnailsRef.value?.setScrollLeft(translateX.value);
};
const handlePrev = () => {
  currentStickerIndex.value -= 1;
};

const handleNext = () => {
  currentStickerIndex.value += 1;
};

const handleThumbnailsPrev = () => {
  handlePrev();
};
const handleThumbnailsNext = () => {
  handleNext();
};

const handleContinue = async () => {
  // const urlList = [
  //   mockStickerImage1,
  //   mockStickerImage2,
  //   mockStickerImage3,
  //   mockStickerImage4,
  //   mockStickerImage5,
  // ];
  if (content.value.length) {
    described.value = true;
  } else {
    return;
  }
  loading.value = true;
  for (let i = 0; i < 2; i++) {
    const url = await getImages({
      toolName: "cloud_image_from_text",
      parameters: {
        prompt: `${content.value},${t("creatorZone.sticker.stickerStyle")}`,
      },
    });
    stickerList.value.push({ id: uuidv4(), url: url, des: "..." });
  }
  currentStickerIndex.value = stickerList.value.length - 2;
  loading.value = false;
  await nextTick();
  setTranslateX(currentStickerIndex.value);

  // setTimeout(async () => {
  //   loading.value = false;
  //   const newStickers = [
  //     {
  //       id: Math.random(),
  //       url: urlList[Math.floor(Math.random() * 5)],
  //       des:
  //         (Math.random() * 10000).toString() +
  //         "A cartoon sticker of aboy wearingsunglasses, with bluehair and a green top.",
  //     },
  //     {
  //       id: Math.random(),
  //       url: urlList[Math.floor(Math.random() * 5)],
  //       des:
  //         (Math.random() * 10000).toString() +
  //         "A cartoon sticker of aboy wearingsunglasses, with bluehair and a green top.",
  //     },
  //   ];
  //   stickerList.value.push(...newStickers);
  //   currentStickerIndex.value = stickerList.value.findIndex(
  //     (item) => item.id === newStickers[0].id
  //   );
  //   await nextTick();
  //   setTranslateX(currentStickerIndex.value);
  // }, 5000);
};

const handleRedo = () => {
  handleContinue();
};

const handleShare = () => {
  console.log("just share it", currentSticker.value);
};
const handleCopy = async () => {
  const file = await translateImageFile(await urlToFile(currentSticker.value.url));

  window.navigator.clipboard
    .write([
      new ClipboardItem({
        [file.type]: file,
      }),
    ])
    .then(() => {
      ElMessage({
        message: t("creatorZone.sticker.copySuccessful"),
        type: "success",
      });
    })
    .catch((error) => {
      throw new Error(error.message);
    });
};
const handleDownload = async () => {
  console.log("just download it", currentSticker.value.url);
  ElMessage({
    message: t("creatorZone.sticker.downloading"),
    type: "info",
    duration: 0,
    showClose: true,
  });
  await setTimeout(() => {}, 3000);
  ElMessage.closeAll();
  ElMessage({
    message: t("creatorZone.sticker.downloadSuccessful"),
    type: "success",
  });
};
const handleRefreshexamples = () => {
  const urlList = [
    mockStickerImage1,
    mockStickerImage2,
    mockStickerImage3,
    mockStickerImage4,
    mockStickerImage5,
  ];
  examplesList.value = [
    {
      id: uuidv4(),
      url: urlList[Math.floor(Math.random() * 5)],
      des: uuidv4() + "A cartoon sticker of aboy wearingsunglasses, with bluehair and a green top.",
    },
    {
      id: uuidv4(),
      url: urlList[Math.floor(Math.random() * 5)],
      des: uuidv4() + "A cartoon sticker of aboy wearingsunglasses, with bluehair and a green top.",
    },
    {
      id: uuidv4(),
      url: urlList[Math.floor(Math.random() * 5)],
      des: uuidv4() + "A cartoon sticker of aboy wearingsunglasses, with bluehair and a green top.",
    },
    {
      id: uuidv4(),
      url: urlList[Math.floor(Math.random() * 5)],
      des: uuidv4() + "A cartoon sticker of aboy wearingsunglasses, with bluehair and a green top.",
    },
    {
      id: uuidv4(),
      url: urlList[Math.floor(Math.random() * 5)],
      des: uuidv4() + "A cartoon sticker of aboy wearingsunglasses, with bluehair and a green top.",
    },
  ];
};

onMounted(() => {
  handleRefreshexamples();
});
</script>
<style lang="less" scoped>
.sticker-page {
  width: 100%;
  height: 100%;
  padding: 24px;
  padding-bottom: 64px;
  display: flex;
  flex-direction: column;
  .sticker__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .describe__content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .title {
        width: 100%;
        font-size: 32px;
        font-weight: 700;
        color: var(--color-text-on-surface);
        line-height: 40px;
        text-align: center;
      }
      .describe-input {
        margin-top: 48px;
        margin-bottom: 80px;
      }
      .explore-ideas {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        .explore-ideas__title {
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text-on-surface);
          line-height: 22px;
        }
      }
      .examples {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .example {
          width: 140px;
          height: 140px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          img {
            width: 100%;
            height: 100%;
            border-radius: 20px;
          }
          &:hover {
            box-shadow: 0 1px 3px 0 #0000004d, 0 4px 8px 3px #00000026;
            transform: translateY(-3px);
          }
        }
      }
    }
  }
  .sticker-choose__content {
    .loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .colorful-loading {
        width: 300px;
        height: 300px;
        margin-bottom: 32px;
      }
      .loading-text {
        position: relative;
        .loading-text-inner {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-on-surface);
          line-height: 26px;
          white-space: nowrap;
          animation: loadingOpacityShow 4s linear infinite;
          position: absolute;
          top: 0;
          left: 0;
          transform: translateX(-50%);
        }
      }
    }
    .sticker-choose {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .sticker__area {
        display: flex;
        justify-content: center;
        align-items: center;
        .sticker-image {
          width: 300px;
          height: 300px;
          border-radius: 24px;
          margin: 30px 10px;
        }
      }
    }
    .operation-btns {
      width: 300px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      .left-btns {
        display: flex;
      }
      .right-btns {
        display: flex;
      }
    }
    .thumbnails__area {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;

      &.in-loading {
        pointer-events: none;
        margin-top: 70px;
        .thumbnail {
          opacity: 0.3 !important;
        }
      }
      .inner-turning-btn {
        position: absolute;
        top: 0;
        width: 24px;
        height: 24px;
        background-color: var(---background-color3);
        border-radius: 50%;
        cursor: pointer;
        z-index: 1;
        &.prev-btn {
          left: 0;
          transform: translate(-50%, 50%);
        }
        &.next-btn {
          right: 0;
          transform: translate(50%, 50%);
        }
        &.disabled {
          opacity: 0.3;
          pointer-events: none;
        }
        img {
          width: 100%;
          height: 100%;
        }
      }
      .thumbnails {
        width: 100vw * (2 / 3);
        :deep(.el-scrollbar .is-vertical) {
          display: none !important;
        }
        .thumbnailsInner {
          margin: 0 auto;
          width: fit-content;
          display: flex;
          justify-content: center;
          align-items: center;

          .thumbnail {
            width: 45px;
            height: 45px;
            flex-shrink: 0;
            cursor: pointer;
            margin: 4px;
            opacity: 0.3;
            &.active {
              opacity: 1;
            }
            :deep(img) {
              width: 100%;
              height: 100%;
              border-radius: 10px;
            }
          }
        }
      }
    }
    .describe-input {
      margin-top: 42px;
      &.in-loading {
        pointer-events: none;
        background-color: var(--color-surface-container-highest);
        padding-bottom: 16px;
        textarea {
          background-color: var(--color-surface-container-highest);
        }
      }
    }
  }
  .btn-inner {
    margin: 0 8px 0 0;
    background-color: rgba(255, 255, 255, 0.4);
    padding: 7px 16px;
    border-radius: 16px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;

    &.btn-without-text {
      padding: 7px;
      margin: 0 0 0 8px;
    }
    img {
      width: 18px;
      height: 18px;
    }
    .btn-text {
      margin-left: 4px;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text-on-surface);
      line-height: 16px;
    }
  }
  .describe-input {
    width: 764px;
    height: 118px;
    background-color: var(--color-surface);
    padding: 14px 16px 54px;
    border-radius: 24px;
    overflow: hidden;
    position: relative;

    textarea {
      width: 100%;
      border: none;
      resize: none;
      color: var(--color-text-on-surface);

      &:focus {
        outline: none;
      }
    }
    .describe-counts {
      position: absolute;
      left: 16px;
      bottom: 22px;
    }
    .describe-btn {
      &.clean-btn {
        position: absolute;
        bottom: 14px;
        right: 56px;
      }
      &.recording-btn {
        position: absolute;
        bottom: 14px;
        right: 56px;
      }

      &.generate-btn {
        position: absolute;
        bottom: 14px;
        right: 16px;

        &.disabled {
          pointer-events: none;
        }
      }
    }
  }
}
@keyframes loadingOpacityShow {
  0% {
    opacity: 0;
  }
  5% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  95% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
</style>
