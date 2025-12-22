<template>
  <div class="image-editor">
    <template
      v-if="
        [
          OPERATE_TYPE.TEXT_TO_IMAGE,
          OPERATE_TYPE.IMAGE_TO_IMAGE,
          OPERATE_TYPE.SMART_EDITING,
          OPERATE_TYPE.UPSCALE,
        ].includes(operateType)
      "
    >
      <template v-if="images.length === 0">
        <div class="tip">
          <img src="@/assets/img/svg/imageLoading2.svg" />
          <div>
            {{ $t("creatorZone.create.imageEditor.tip") }}
          </div>
        </div>
      </template>

      <Header v-if="images.length > 0" />

      <Preview v-if="images.length > 0" />

      <Footer v-if="images.length > 0" />
    </template>
    <template v-else-if="operateType === OPERATE_TYPE.INPAINT">
      <Inpaint />
    </template>
    <template v-else-if="operateType === OPERATE_TYPE.OUTPAINT">
      <Outpaint />
    </template>
    <template v-else-if="operateType === OPERATE_TYPE.ERASE">
      <Erase />
    </template>
    <template v-else-if="operateType === OPERATE_TYPE.CHANGE_BACKGROUND">
      <ChangeBG />
    </template>
    <template v-else-if="operateType === OPERATE_TYPE.CUTOUT">
      <Cutout />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, Ref } from "vue";
import {
  SESSION_RECORD_SOURCE,
  IMAGE_STATUS,
  REFERENCEIMAGE_TYPE,
  OPERATE_TYPE,
  IsessionRecord,
  IcreateRef,
} from "@/types";
import Header from "./Header.vue";
import Preview from "./Preview.vue";
import Inpaint from "./Inpaint.vue";
import Outpaint from "./Outpaint.vue";
import Erase from "./Erase.vue";
import ChangeBG from "./ChangeBG.vue";
import Cutout from "./Cutout.vue";
import Footer from "./Footer.vue";

const { images, operateType } = inject<IcreateRef>("CREATE_REF");
</script>

<style lang="less" scoped>
.image-editor {
  width: 100%;
  height: 100%;
  background: var(--color-surfaces-surface-blur);
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .tip {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    > img {
      width: 174px;
      margin-bottom: 16px;
    }

    > div {
      font-family: "Rookery New";
      font-size: 14px;
      font-weight: 400;
      color: var(--color-text-on-surface-muted);
    }
  }

  :deep(.header) {
    margin-bottom: 24px;
  }

  :deep(.preview) {
    max-height: calc(100% - (32px + 46px + 24px + 24px));
  }

  :deep(.footer) {
    margin-top: 24px;
  }
}
</style>
