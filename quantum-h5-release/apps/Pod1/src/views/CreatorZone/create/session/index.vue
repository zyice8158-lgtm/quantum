<template>
  <div class="session" ref="sessionRef">
    <!-- <GlobalBar :showHomeBtn="true" :showNewChatBtn="true" /> -->

    <div class="session__content">
      <div class="session__content__left">
        <el-scrollbar
          ref="scrollBarRef"
          @touchmove.stop
          @scroll="
            ({ scrollTop }) => {
              translateY = scrollTop;
            }
          "
        >
          <SessionRecords />
        </el-scrollbar>

        <ChatInput
          placement="top"
          :referenceImageUrl="referenceImageUrl"
          :ratioId="route.query?.ratioId"
          :styleId="
            Number((route.query?.styles ? JSON.parse(route.query?.styles) : [])?.[0]?.styleId)
          "
          :modelId="route.query?.modelId"
          :operateType="operateType"
          :genBtnStatus="genBtnStatus"
          :onUpload="
            () => {
              setReferenceImageType(REFERENCEIMAGE_TYPE.LOCAL);

              if ([OPERATE_TYPE.TEXT_TO_IMAGE, OPERATE_TYPE.SMART_EDITING].includes(operateType)) {
                setOperateType(OPERATE_TYPE.IMAGE_TO_IMAGE);
              }
            }
          "
          :onReferenceImageUrlChange="
            (value) => {
              if (value) {
              } else {
                setReferenceImageType(REFERENCEIMAGE_TYPE.NULL);

                if (
                  [OPERATE_TYPE.IMAGE_TO_IMAGE, OPERATE_TYPE.SMART_EDITING].includes(operateType)
                ) {
                  setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
                }
              }
            }
          "
          :send="
            (value) => {
              if (value?.referenceImageUrl) {
                if (operateType !== OPERATE_TYPE.SMART_EDITING) {
                  setOperateType(OPERATE_TYPE.IMAGE_TO_IMAGE);
                }
              } else {
                setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
              }

              genImages({
                ...value,
                referenceImageType,
                operateType,
              });
            }
          "
          :cancel="
            () => {
              setGenBtnStatus(GenBtnStatus.CANCELLING);
              localBaseModel.cancel();
            }
          "
        />
      </div>

      <div class="session__content__right">
        <ImageEditor />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watch, Ref, nextTick, computed, provide, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { v4 as uuid } from "uuid";
import {
  GenBtnStatus,
  SESSIONID_NAME_MAX_LENGTH,
  SESSIONID_PROMPT_MAX_LENGTH,
  getLocalBaseModelGenImageSize,
} from "@/constant";
import {
  IreadFileRes,
  SESSION_RECORD_SOURCE,
  IMAGE_STATUS,
  REFERENCEIMAGE_TYPE,
  OPERATE_TYPE,
  RATIO,
  IsessionRecord,
  Istyle,
  Iimage,
  ModelType,
} from "@/types";
import { localBaseModel } from "@/cs/genImages";
import { imageBase64ToLocalFile } from "@/cs/imageBase64ToLocalFile";
import { fileToImageBase64, imageBase64ToFile, urlToFile } from "@/services/CreatorZone/file";
import { getImages as _getImages } from "@/services/CreatorZone/getImages";
import {
  addSession,
  editSession,
  getSessionInfo,
  addSessionRecord,
} from "@/services/CreatorZone/session";
import { getFileObjectKey } from "@/services/CreatorZone/oss";
import ChatInput from "@/components/CreatorZone/ChatInput/index.vue";
// import GlobalBar from '@/components/CreatorZone/GlobalBar/index.vue'
import SessionRecords from "./SessionRecords/index.vue";
import ImageEditor from "./../ImageEditor/index.vue";

interface Iquery extends Iimage {
  sessionId?: string;
}

const route: {
  query: Iquery;
} = useRoute();

const { t } = useI18n();

const sessionRef = ref(null);

const sessionId = ref("");

const sessionRecords = ref<IsessionRecord[]>([]);
const generatedImage = computed(() => {
  for (let i = 0; i < sessionRecords.value.length; i++) {
    const sessionRecord = sessionRecords.value[i];

    if (sessionRecord.role === SESSION_RECORD_SOURCE.SYSTEM) {
      for (let j = 0; j < sessionRecord.images.length; j++) {
        const image = sessionRecord.images[j];

        if (image.resultStatus === IMAGE_STATUS.LOADING) {
          return sessionRecord;
        }
      }
    } else if (sessionRecord.role === SESSION_RECORD_SOURCE.LOADING) {
      return sessionRecord;
    }
  }

  return undefined;
});

const images = ref<Iimage[]>([]);
const currentImage = computed(() => {
  for (let index = 0; index < images.value.length; index++) {
    const image = images.value[index];

    if (image.active) {
      return {
        ...image,
        index,
      };
    }
  }

  return undefined;
});

const referenceImageUrl = ref<string>("");
const referenceImageType = ref<REFERENCEIMAGE_TYPE>(REFERENCEIMAGE_TYPE.NULL);
const operateType = ref<OPERATE_TYPE>(OPERATE_TYPE.TEXT_TO_IMAGE);
const genBtnStatus = ref(localBaseModel.status);

const scrollBarRef = ref(null);
const translateY = ref(0);

const getImages = () => {
  const images: Iimage[] = [];

  for (let i = 0; i < sessionRecords.value.length; i++) {
    const sessionRecord = sessionRecords.value[i];

    if (sessionRecord.role === SESSION_RECORD_SOURCE.SYSTEM) {
      for (let j = 0; j < sessionRecord.images.length; j++) {
        const image = sessionRecord.images[j];

        if (image.resultStatus === IMAGE_STATUS.SUCCESSFULLY) {
          images.push({
            ...image,
            recordId: sessionRecord.recordId,
            content: sessionRecord.content,
            width: sessionRecord.width,
            height: sessionRecord.height,
            ratioId: sessionRecord.ratioId,
            active: false,
          });
        }
      }
    }
  }

  return images;
};

const setImages = (value) => {
  images.value = value;
};

const setReferenceImageUrl = (value) => {
  referenceImageUrl.value = value;
};

const setReferenceImageType = (value) => {
  referenceImageType.value = value;
};

const setOperateType = (value) => {
  operateType.value = value;
};

const setGenBtnStatus = (value) => {
  genBtnStatus.value = value;
};

const setTranslateY = (recordId) => {
  if (!recordId) {
    return;
  }

  const { top, bottom } = sessionRef.value.querySelector(".el-scrollbar").getBoundingClientRect();
  const { top: top2, bottom: bottom2 } = sessionRef.value
    .querySelector(`.el-scrollbar #record-id-${recordId}`)
    .getBoundingClientRect();

  if (top2 < top) {
    translateY.value -= top - top2;
  }

  if (bottom2 > bottom) {
    translateY.value += bottom2 - bottom;
  }

  scrollBarRef.value?.setScrollTop(translateY.value);
};

const reset = () => {
  sessionId.value = "";
  sessionRecords.value = [];
  setImages([]);
  setReferenceImageType(REFERENCEIMAGE_TYPE.NULL);
  setOperateType(OPERATE_TYPE.TEXT_TO_IMAGE);
  setGenBtnStatus(localBaseModel.status);
  translateY.value = 0;
};

const genImages = async (value) => {
  setGenBtnStatus(GenBtnStatus.PREPARING);

  // if (sessionId.value) {
  //   getSessionInfo({
  //     sessionId: sessionId.value,
  //   }).then((getSessionInfoRes) => {
  //     if (getSessionInfoRes.success) {
  //       if (!getSessionInfoRes.data.sessionName) {
  //         editSession({
  //           sessionId: sessionId.value,
  //           sessionName: value.content.slice(0, SESSIONID_NAME_MAX_LENGTH),
  //         }).then((editSessionRes) => {
  //           if (editSessionRes.success) {
  //           } else {
  //             ElMessage({
  //               message: "Editing session information failed",
  //               type: "error",
  //             });
  //           }
  //         });
  //       }
  //     } else {
  //       ElMessage({
  //         message: "Failed to retrieve session information",
  //         type: "error",
  //       });
  //     }
  //   });
  // } else {
  //   const addSessionRes = await addSession({
  //     sessionName: value.content.slice(0, SESSIONID_NAME_MAX_LENGTH),
  //   });

  //   if (addSessionRes.success) {
  //     sessionId.value = addSessionRes.data;
  //   } else {
  //     ElMessage({
  //       message: "Session creation failed",
  //       type: "error",
  //     });
  //   }
  // }

  if (true) {
    if (
      value.referenceImageUrl?.startsWith("https://") ||
      value.referenceImageUrl?.startsWith("http://")
    ) {
      const file = await urlToFile(value.referenceImageUrl);
      value.referenceImageUrl = await fileToImageBase64(file);
    }

    if (!value.referenceImageType || value.referenceImageType === REFERENCEIMAGE_TYPE.NULL) {
      value.referenceImageType = REFERENCEIMAGE_TYPE.LOCAL;
    }

    if (value.styles) {
      value.styles = JSON.parse(value.styles);
    } else {
      value.styles = [];
    }

    if (value.operateType === OPERATE_TYPE.SMART_EDITING) {
      value.modelType = ModelType.CLOUD;
    }

    let genImageCount = 0;

    if (!value.modelType || value.modelType === ModelType.CLOUD) {
      if (
        [
          OPERATE_TYPE.TEXT_TO_IMAGE,
          OPERATE_TYPE.IMAGE_TO_IMAGE,
          OPERATE_TYPE.SMART_EDITING,
        ].includes(value.operateType)
      ) {
        genImageCount = 1;
      } else {
        genImageCount = 1;
      }
    } else if (value.modelType === ModelType.LOCAL) {
      if (
        [
          OPERATE_TYPE.TEXT_TO_IMAGE,
          OPERATE_TYPE.IMAGE_TO_IMAGE,
          OPERATE_TYPE.SMART_EDITING,
        ].includes(value.operateType)
      ) {
        genImageCount = 1;
      }
    }

    const userRecordId = uuid();
    const systemRecordId = uuid();

    let userRecordContent = "";

    if (value.operateType === OPERATE_TYPE.INPAINT) {
      userRecordContent = `${t("creatorZone.create.session.generatedImageDesc.inpaint")}${
        value.content
      }`;
    } else if (value.operateType === OPERATE_TYPE.OUTPAINT) {
      userRecordContent = `${t("creatorZone.create.session.generatedImageDesc.outpaint")}`;
    } else if (value.operateType === OPERATE_TYPE.ERASE) {
      userRecordContent = `${t("creatorZone.create.session.generatedImageDesc.erase")}`;
    } else if (value.operateType === OPERATE_TYPE.UPSCALE) {
      userRecordContent = `${t("creatorZone.create.session.generatedImageDesc.upscale")}`;
    } else if (value.operateType === OPERATE_TYPE.CHANGE_BACKGROUND) {
      if (value.content) {
        userRecordContent = `${t("creatorZone.create.session.generatedImageDesc.changeBg")}${
          value.content
        }`;
      } else {
        userRecordContent = `${t("creatorZone.create.session.generatedImageDesc.removeBg")}`;
      }
    } else if (value.operateType === OPERATE_TYPE.CUTOUT) {
      userRecordContent = `${t("creatorZone.create.session.generatedImageDesc.cutout")}`;
    } else {
      if (value.styles?.[0]?.styleName && !value.styles?.[0]?.isDefault) {
        userRecordContent = `${value.content}${t(
          "creatorZone.create.session.generatedImageDesc.comma"
        )}${value.styles?.[0]?.styleName}`;
      } else {
        userRecordContent = value.content;
      }
    }

    const userRecord = {
      recordId: userRecordId,
      role: SESSION_RECORD_SOURCE.USER,
      content: userRecordContent,
      negConstent: value.negConstent || "",
      cfgScale: value.cfgScale || 0,
      styles: value.styles,
      modelId: value.modelId || "",
      modelType: value.modelType || ModelType.CLOUD,
      steps: value.steps || 0,
      width:
        value.width || getLocalBaseModelGenImageSize(value.ratioId || RATIO.ONE_ONE, RATIO).width,
      height:
        value.height || getLocalBaseModelGenImageSize(value.ratioId || RATIO.ONE_ONE, RATIO).height,
      ratioId: value.ratioId || RATIO.ONE_ONE,
      referenceImageUrl: value.referenceImageUrl || "",
      referenceDimension: value.referenceDimension || "",
      referenceStrength: value.referenceStrength || 0,
      images: [],
      referenceImageType: value.referenceImageType,
      operateType: value.operateType,
      createTime: String(new Date().getTime()),
    };
    const systemRecord = {
      ...userRecord,
      recordId: systemRecordId,
      role: SESSION_RECORD_SOURCE.LOADING,
      images: JSON.parse(
        JSON.stringify(
          new Array(genImageCount).fill({
            resultStatus: IMAGE_STATUS.LOADING,
            url: "",
            seed: 0,
          })
        )
      ),
    };

    sessionRecords.value = [
      ...sessionRecords.value,
      userRecord,
      JSON.parse(JSON.stringify(systemRecord)),
    ];

    await nextTick();

    setTranslateY(systemRecordId);

    let res = {
      predictions: [],
    };

    if (userRecord.modelType === ModelType.CLOUD) {
      if (value.operateType === OPERATE_TYPE.TEXT_TO_IMAGE) {
        const url = await _getImages({
          toolName: "cloud_image_from_text",
          parameters: {
            prompt: userRecord.content,
          },
        });

        res.predictions.push({
          prompt: "",
          url,
        });
      } else if (value.operateType === OPERATE_TYPE.IMAGE_TO_IMAGE) {
      } else if (value.operateType === OPERATE_TYPE.SMART_EDITING) {
        const url = await _getImages({
          toolName: "cloud_image_from_SmartEditing",
          parameters: {
            prompt: userRecord.content,
            imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
          },
        });

        res.predictions.push({
          prompt: "",
          url,
        });
      } else if (value.operateType === OPERATE_TYPE.INPAINT) {
        const url = await _getImages({
          toolName: "cloud_image_from_inpainting",
          parameters: {
            prompt: value.content,
            imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
            maskImageUriPath: await imageBase64ToLocalFile(value.maskImageUrl),
          },
        });

        res.predictions.push({
          prompt: "",
          url,
        });
      } else if (value.operateType === OPERATE_TYPE.OUTPAINT) {
        const url = await _getImages({
          toolName: "cloud_image_from_outpainting",
          parameters: {
            prompt: "outpaint",
            imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
            maskImageUriPath: await imageBase64ToLocalFile(value.maskImageUrl),
          },
        });

        res.predictions.push({
          prompt: "",
          url,
        });
      } else if (value.operateType === OPERATE_TYPE.ERASE) {
        const url = await _getImages({
          toolName: "cloud_image_from_erase",
          parameters: {
            prompt: "erase",
            imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
            maskImageUriPath: await imageBase64ToLocalFile(value.maskImageUrl),
          },
        });

        res.predictions.push({
          prompt: "",
          url,
        });
      } else if (value.operateType === OPERATE_TYPE.CHANGE_BACKGROUND) {
        if (value.content) {
          const url = await _getImages({
            toolName: "cloud_image_from_ChangeBackground",
            parameters: {
              prompt: value.content,
              imageUriPath: await imageBase64ToLocalFile(value.referenceImageUrl),
            },
          });

          res.predictions.push({
            prompt: "",
            url,
          });
        } else {
        }
      }
    } else if (userRecord.modelType === ModelType.LOCAL) {
      if ([OPERATE_TYPE.TEXT_TO_IMAGE, OPERATE_TYPE.IMAGE_TO_IMAGE].includes(value.operateType)) {
        const data = {
          prompt: userRecord.content,
          stylePrompt: "",
          uiNegativePrompt: "",
          negativePrompt: "None",
          strength: 0.54,
          outputWidth: userRecord.width,
          outputHeight: userRecord.height,
          cfgScale: 2.5,
          steps: 8,
          seed: 0,
          verbose: 0,
          imgNumber: 1,
          createType: 0,
          useT5TextEncoder: 0,

          controlNetImgPath: undefined,
          controlNetType: undefined,
          controlNetstrength: undefined,

          initImg: undefined,
        };

        if (value.operateType === OPERATE_TYPE.IMAGE_TO_IMAGE) {
          data.initImg = await imageBase64ToLocalFile(value.referenceImageUrl);
        }

        const url = await _getImages({
          toolName: "local_controlnet_tool",
          parameters: {
            data: JSON.stringify(data),
          },
        });

        res.predictions.push({
          prompt: "",
          url,
        });
      }

      // let _res = null;
      // const params = {
      //   taskId: new Date().getTime(),
      //   prompt: userRecord.content,
      //   stylePrompt: "",
      //   width: userRecord.width,
      //   height: userRecord.height,
      //   referenceImageUrl: "",
      //   runningCallback: async (res) => {
      //     const images = [];
      //     for (let index = 0; index < (res?.data?.imgOutputPath || []).length; index++) {
      //       const genImage = (res?.data?.imgOutputPath || [])[index];
      //       if (genImage) {
      //         images.push({
      //           resultStatus: IMAGE_STATUS.SUCCESSFULLY,
      //           url: ((await readFileReq(genImage)) as IreadFileRes).content,
      //         });
      //       }
      //     }
      //     systemRecord.role = SESSION_RECORD_SOURCE.SYSTEM;
      //     sessionRecords.value = sessionRecords.value.map((sessionRecord) => {
      //       if (sessionRecord.recordId === systemRecordId) {
      //         return {
      //           ...systemRecord,
      //           images: [...images, ...sessionRecord.images].slice(0, genImageCount),
      //         };
      //       }
      //       return sessionRecord;
      //     });
      //     await nextTick();
      //     setTranslateY(systemRecordId);
      //   },
      // };
      // if (value.referenceImageUrl) {
      //   // params.referenceImageUrl = (await imageBase64ToLocalFileReq(
      //   //   value.referenceImageUrl
      //   // )) as string;
      // }
      // if (value.operateType === OPERATE_TYPE.TEXT_TO_IMAGE) {
      //   _res = await localBaseModel.create(params);
      // } else if (value.operateType === OPERATE_TYPE.IMAGE_TO_IMAGE) {
      //   _res = await localBaseModel.create(params);
      // }
      // _res.callback();
      // setGenBtnStatus(GenBtnStatus.INIT);
      // const mimeType = "image/png";
      // const images = _res?.data?.imgOutputPath || [];
      // for (let index = 0; index < images.length; index++) {
      //   const genImage = images[index];
      //   if (genImage) {
      //     res.predictions.push({
      //       prompt: "",
      //       bytesBase64Encoded: ((await readFileReq(genImage)) as IreadFileRes).content.split(
      //         `data:${mimeType};base64,`
      //       )[1],
      //       mimeType,
      //     });
      //   }
      // }
    }

    setGenBtnStatus(GenBtnStatus.INIT);

    res = {
      predictions: [
        ...(res?.predictions || []),
        ...JSON.parse(
          JSON.stringify(
            new Array(genImageCount).fill({
              prompt: "",
              url: "",
            })
          )
        ),
      ].slice(0, genImageCount),
    };

    // const { prompt } = res?.predictions?.find((prediction) => prediction.prompt) || { prompt: '' }

    systemRecord.role = SESSION_RECORD_SOURCE.SYSTEM;
    // systemRecord.content = prompt

    // for (let index = 0; index < prompt.length; index++) {
    //   const character = prompt.slice(0, index + 1)

    //   sessionRecords.value = sessionRecords.value.map((sessionRecord) => {
    //     if (sessionRecord.recordId === systemRecordId) {
    //       return {
    //         ...JSON.parse(JSON.stringify(systemRecord)),
    //         content: character,
    //       }
    //     }

    //     return sessionRecord
    //   })

    //   await new Promise((resolve) => {
    //     window.setTimeout(
    //       () => {
    //         resolve('')
    //       },
    //       index % 100 === 0 ? Math.random() * 800 : 10
    //     )
    //   })
    // }

    // sessionRecords.value = sessionRecords.value.map((sessionRecord) => {
    //   if (sessionRecord.recordId === systemRecordId) {
    //     return JSON.parse(JSON.stringify(systemRecord))
    //   }

    //   return sessionRecord
    // })

    res.predictions = await Promise.all(
      res?.predictions.map(async (prediction) => {
        if (prediction?.url) {
          return {
            resultStatus: IMAGE_STATUS.SUCCESSFULLY,
            url: prediction?.url,
            // objectKey: await getFileObjectKey({
            //   fileType: prediction?.mimeType.split("/")[1],
            //   file: await imageBase64ToFile(url),
            // }),
          };
        }

        return {
          resultStatus: IMAGE_STATUS.FAILED,
          url: "",
          // objectKey: "",
        };
      })
    );

    for (let index = 0; index < res?.predictions?.length; index++) {
      systemRecord.images[index].resultStatus = res?.predictions[index]?.resultStatus;
      systemRecord.images[index].url = res?.predictions[index]?.url;
      // systemRecord.images[index].objectKey = res?.predictions[index]?.objectKey;

      if (res?.predictions[index]?.url && (!systemRecord.width || !systemRecord.height)) {
        await new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            systemRecord.width = image.width;
            systemRecord.height = image.height;

            resolve("");
          };

          image.src = systemRecord.images[index].url;
        });
      }
    }

    // const addSessionRecordRes = await addSessionRecord([
    //   {
    //     role: userRecord.role,
    //     sessionId: sessionId.value,
    //     generationParam: {
    //       content: userRecord.content.slice(0, SESSIONID_PROMPT_MAX_LENGTH),
    //       negContent: userRecord.negConstent,
    //       modelId: userRecord.modelId,
    //       modelType: userRecord.modelType,
    //       cfgScale: userRecord.cfgScale,
    //       width: systemRecord.width,
    //       height: systemRecord.height,
    //       ratioId: userRecord.ratioId,
    //       steps: userRecord.steps,
    //       referenceObjectKey: userRecord.referenceImageUrl
    //         ? await getFileObjectKey({
    //             fileType: userRecord.referenceImageUrl.split(";")[0].split(":")[1].split("/")[1],
    //             file: await imageBase64ToFile(userRecord.referenceImageUrl),
    //           })
    //         : "",
    //       referenceImageType: userRecord.referenceImageType,
    //       referenceDimension: userRecord.referenceDimension,
    //       referenceStrength: userRecord.referenceStrength,
    //       operateType: userRecord.operateType,
    //       styleIdList: userRecord.styles.map((style) => style.styleId),
    //     },
    //   },
    //   {
    //     role: systemRecord.role,
    //     sessionId: sessionId.value,
    //     generationParam: {
    //       content: systemRecord.content.slice(0, SESSIONID_PROMPT_MAX_LENGTH),
    //       negContent: systemRecord.negConstent,
    //       modelId: systemRecord.modelId,
    //       modelType: systemRecord.modelType,
    //       cfgScale: systemRecord.cfgScale,
    //       width: systemRecord.width,
    //       height: systemRecord.height,
    //       ratioId: systemRecord.ratioId,
    //       steps: systemRecord.steps,
    //       referenceObjectKey: systemRecord.referenceImageUrl
    //         ? await getFileObjectKey({
    //             fileType: systemRecord.referenceImageUrl.split(";")[0].split(":")[1].split("/")[1],
    //             file: await imageBase64ToFile(systemRecord.referenceImageUrl),
    //           })
    //         : "",
    //       referenceImageType: systemRecord.referenceImageType,
    //       referenceDimension: systemRecord.referenceDimension,
    //       referenceStrength: systemRecord.referenceStrength,
    //       operateType: systemRecord.operateType,
    //       styleIdList: systemRecord.styles.map((style) => style.styleId),
    //     },
    //     generationResultList: systemRecord.images.map((image) => {
    //       return {
    //         resultStatus: image.resultStatus,
    //         objectKey: image.objectKey,
    //         seed: image.seed,
    //       };
    //     }),
    //   },
    // ]);

    if (true) {
      sessionRecords.value = sessionRecords.value.map((sessionRecord) => {
        if (sessionRecord.recordId === userRecordId) {
          return {
            ...userRecord,
            // recordId: addSessionRecordRes.data[0],
          };
        }

        if (sessionRecord.recordId === systemRecordId) {
          return {
            ...systemRecord,
            // recordId: addSessionRecordRes.data[1],
          };
        }

        return sessionRecord;
      });

      await nextTick();

      const imageUrl = systemRecord?.images?.find(
        (image) => image.resultStatus === IMAGE_STATUS.SUCCESSFULLY
      )?.url;

      if (imageUrl) {
        setImages(
          getImages().map((image) => {
            return {
              ...image,
              active: image.url === imageUrl,
            };
          })
        );
      }

      // setTranslateY(addSessionRecordRes.data[1]);
      setTranslateY(systemRecordId);
    } else {
      ElMessage({
        message: "Session add record failed",
        type: "error",
      });
    }
  }
};

const localBaseModelStatusChangeCallback = (value) => {
  setGenBtnStatus(value);
};
const localBaseModelReadyCallback = () => {
  setGenBtnStatus(GenBtnStatus.RUNNING);
};

onMounted(() => {
  localBaseModel.init({
    statusChangeCallback: localBaseModelStatusChangeCallback,
    readyCallback: localBaseModelReadyCallback,
  });
});

onUnmounted(() => {
  localBaseModel.uninit({
    statusChangeCallback: localBaseModelStatusChangeCallback,
    readyCallback: localBaseModelReadyCallback,
  });
});

watch(
  [() => route.query],
  async () => {
    if (route.query?.sessionId) {
      sessionId.value = route.query?.sessionId;

      const getSessionInfoRes = await getSessionInfo({
        sessionId: sessionId.value,
      });

      if (getSessionInfoRes.success) {
        let sessionRecordId = "";
        let imageUrl = "";
        let locked = false;

        sessionRecords.value = (getSessionInfoRes?.data?.generationRecordVOList || []).map(
          (sessionRecord) => {
            const generationParamVO = sessionRecord.generationParamVO ||
              (sessionRecord.generationResultVOList || []).find(
                (image) => image?.imageVO?.generationParamVO
              )?.imageVO?.generationParamVO || {
                content: "",
                ratioId: RATIO.ONE_ONE,
              };

            sessionRecordId = sessionRecord.recordId;
            locked = false;

            return {
              ...generationParamVO,
              recordId: sessionRecord.recordId,
              role: sessionRecord.role,
              images: (sessionRecord.generationResultVOList || []).map((image) => {
                if (image.resultStatus === IMAGE_STATUS.SUCCESSFULLY && !locked) {
                  imageUrl = image.imageVO?.url;
                  locked = true;
                }

                return {
                  resultStatus: image.resultStatus,
                  imageId: image.imageVO?.imageId,
                  url: image.imageVO?.url,
                  seed: image.imageVO?.seed,
                };
              }),
            };
          }
        );

        await nextTick();

        if (route.query?.recordId && route.query?.imageId) {
          setImages(
            getImages().map((image) => {
              return {
                ...image,
                active: image.imageId === route.query?.imageId,
              };
            })
          );

          setTranslateY(route.query?.recordId);
        } else {
          setImages(
            getImages().map((image) => {
              return {
                ...image,
                active: image.url === imageUrl,
              };
            })
          );

          setTranslateY(sessionRecordId);
        }
      } else {
        ElMessage({
          message: "Failed to retrieve session information",
          type: "error",
        });
      }
    } else {
      reset();

      if (route.query?.content) {
        // const addSessionRes = await addSession({
        //   sessionName: route.query?.content.slice(0, SESSIONID_NAME_MAX_LENGTH),
        // });

        // if (addSessionRes.success) {
        //   sessionId.value = addSessionRes.data;
        // } else {
        //   ElMessage({
        //     message: "Session creation failed",
        //     type: "error",
        //   });
        // }

        if (route.query?.referenceImageUrl) {
          setOperateType(Number(route.query?.operateType) || OPERATE_TYPE.IMAGE_TO_IMAGE);
        }

        genImages({
          content: route.query?.content,
          modelId: route.query?.modelId,
          modelType: route.query?.modelType,
          referenceImageUrl: route.query?.referenceImageUrl,
          referenceImageType: Number(route.query?.referenceImageType),
          referenceDimension: route.query?.referenceDimension,
          referenceStrength: Number(route.query?.referenceStrength),
          width: Number(route.query?.width),
          height: Number(route.query?.height),
          ratioId: route.query?.ratioId,
          styles: route.query?.styles,
          operateType: operateType.value,
        });
      } else {
        if (route.query?.referenceImageUrl) {
          setReferenceImageUrl(route.query?.referenceImageUrl);
          setOperateType(Number(route.query?.operateType) || OPERATE_TYPE.IMAGE_TO_IMAGE);
        }
      }
    }
  },
  { immediate: true }
);

provide("CREATE_REF", {
  sessionId,
  sessionRecords,
  generatedImage,
  images,
  currentImage,
  setImages: (value) => {
    setImages(value);

    setTranslateY(currentImage.value?.recordId);
  },
  referenceImageUrl,
  setReferenceImageUrl,
  referenceImageType,
  setReferenceImageType,
  operateType,
  setOperateType,
  genBtnStatus,
  setGenBtnStatus,
  scrollBarRef,
  reset,
  genImages,
});
</script>

<style lang="less" scoped>
.session {
  width: 100%;
  height: 100%;
  padding: 24px;

  // :deep(.global-bar) {
  //   margin-bottom: 24px;
  // }

  .session__content {
    // height: calc(100% - (32 + 24)px);
    height: 100%;
    display: flex;

    &__left {
      margin-right: 24px;
      width: 408px;
      display: flex;
      flex-direction: column;

      > :deep(.el-scrollbar) {
        > .el-scrollbar__wrap {
          width: calc(100% - 10px);
        }

        .el-scrollbar__bar.is-vertical {
          right: 0;
        }
      }

      :deep(.chat-input) {
        margin-top: 48px;
      }
    }

    &__right {
      width: calc(100% - 408px - 24px);
    }
  }
}
</style>
