<template>
  <div class="quick-entrance">
    <div class="top">
      <div
        class="quick-entrance__item"
        v-helper="
          () => {
            return {
              role: 'link',
              ariaLabel: $t('creatorZone.components.quickEntrances.editImage'),
              focus: () => {},
              blur: () => {},
              click: () => {
                router.push({
                  path: '/quantum/creator-zone/editor',
                  query: {},
                });
              },
            };
          }
        "
        v-automation="'edit_image_entrance'"
      >
        <div class="icon bg-text-inverse-on-surface"></div>

        <div class="name text-text-inverse-on-surface">
          {{ $t("creatorZone.components.quickEntrances.editImage") }}
        </div>
      </div>

      <div
        class="quick-entrance__item"
        v-helper="
          () => {
            return {
              role: 'link',
              ariaLabel: $t('creatorZone.components.quickEntrances.customImage'),
              focus: () => {},
              blur: () => {},
              click: () => {
                router.push({
                  path: '/quantum/creator-zone/create/custom',
                  query: {},
                });
              },
            };
          }
        "
        v-automation="'custom_image_entrance'"
      >
        <div class="icon bg-text-inverse-on-surface"></div>

        <div class="name text-text-inverse-on-surface">
          {{ $t("creatorZone.components.quickEntrances.customImage") }}
        </div>
      </div>

      <div
        class="quick-entrance__item"
        v-helper="
          () => {
            return {
              role: 'link',
              ariaLabel: $t('creatorZone.components.quickEntrances.createAvatar'),
              focus: () => {},
              blur: () => {},
              click: () => {
                router.push({
                  path: '/quantum/creator-zone/avatar',
                  query: {},
                });
              },
            };
          }
        "
        v-automation="'create_avatar_entrance'"
      >
        <div class="icon bg-text-inverse-on-surface"></div>

        <div class="name text-text-inverse-on-surface">
          {{ $t("creatorZone.components.quickEntrances.createAvatar") }}
        </div>
      </div>

      <div
        class="quick-entrance__item"
        v-helper="
          () => {
            return {
              role: 'link',
              ariaLabel: $t('creatorZone.components.quickEntrances.createSticker'),
              focus: () => {},
              blur: () => {},
              click: () => {
                router.push({
                  path: '/quantum/creator-zone/sticker',
                  query: {},
                });
              },
            };
          }
        "
        v-automation="'create_sticker_entrance'"
      >
        <div class="icon bg-text-inverse-on-surface"></div>

        <div class="name text-text-inverse-on-surface">
          {{ $t("creatorZone.components.quickEntrances.createSticker") }}
        </div>
      </div>

      <div
        class="quick-entrance__item"
        v-helper="
          () => {
            return {
              role: 'link',
              ariaLabel: $t('creatorZone.components.quickEntrances.scribble'),
              focus: () => {},
              blur: () => {},
              click: () => {
                router.push({
                  path: '/quantum/creator-zone/create/scribble',
                  query: {},
                });
              },
            };
          }
        "
        v-automation="'scribble_entrance'"
      >
        <div class="icon bg-text-inverse-on-surface"></div>

        <div class="name text-text-inverse-on-surface">
          {{ $t("creatorZone.components.quickEntrances.scribble") }}
        </div>
      </div>

      <div
        class="quick-entrance__item"
        v-helper="
          () => {
            return {
              role: 'link',
              ariaLabel: $t('creatorZone.components.quickEntrances.gallery'),
              focus: () => {},
              blur: () => {},
              click: () => {
                router.push({
                  path: '/quantum/creator-zone/gallery',
                  query: {},
                });
              },
            };
          }
        "
        v-automation="'gallery_entrance'"
      >
        <div class="icon bg-text-inverse-on-surface"></div>

        <div class="name text-text-inverse-on-surface">
          {{ $t("creatorZone.components.quickEntrances.gallery") }}
        </div>
      </div>
    </div>

    <div class="bottom">
      <template
        v-for="quickEntrance in [
          {
            id: OPERATE_TYPE.CHANGE_BACKGROUND,
          },
          {
            id: OPERATE_TYPE.ERASE,
          },
          {
            id: OPERATE_TYPE.INPAINT,
          },
          {
            id: OPERATE_TYPE.OUTPAINT,
          },
          // {
          //   id: OPERATE_TYPE.UPSCALE,
          // },
        ]"
      >
        <div
          class="quick-entrance__item bg-surfaces-surface-blur"
          v-automation="getTitle(quickEntrance.id)"
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
                role: 'link',
                ariaLabel: getTitle(quickEntrance.id),
                focus: () => {},
                blur: () => {},
                click: () => {
                  router.push({
                    path: '/quantum/creator-zone/editor',
                    query: {
                      operateType: quickEntrance.id,
                    },
                  });
                },
              };
            }
          "
        >
          <img
            v-if="quickEntrance.id === OPERATE_TYPE.CHANGE_BACKGROUND"
            src="@/assets/img/svg/removebg.svg"
          />
          <img v-if="quickEntrance.id === OPERATE_TYPE.ERASE" src="@/assets/img/svg/Erase.svg" />
          <img
            v-if="quickEntrance.id === OPERATE_TYPE.INPAINT"
            src="@/assets/img/svg/inpaint.svg"
          />
          <img
            v-if="quickEntrance.id === OPERATE_TYPE.OUTPAINT"
            src="@/assets/img/svg/outpaint.svg"
          />
          <img
            v-if="quickEntrance.id === OPERATE_TYPE.UPSCALE"
            src="@/assets/img/svg/Upscale.svg"
          />

          <div
            v-if="quickEntrance.id === OPERATE_TYPE.CHANGE_BACKGROUND"
            class="text-text-on-surface"
          ></div>
          <div class="text-text-on-surface">
            {{ getTitle(quickEntrance.id) }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { OPERATE_TYPE } from "@/types";

const router = useRouter();

const { t } = useI18n();

const getTitle = (id: OPERATE_TYPE) => {
  if (id === OPERATE_TYPE.CHANGE_BACKGROUND) {
    return t("creatorZone.components.quickEntrances.removeBackground");
  } else if (id === OPERATE_TYPE.ERASE) {
    return t("creatorZone.components.quickEntrances.erase");
  } else if (id === OPERATE_TYPE.INPAINT) {
    return t("creatorZone.components.quickEntrances.inpaint");
  } else if (id === OPERATE_TYPE.OUTPAINT) {
    return t("creatorZone.components.quickEntrances.outpaint");
  } else if (id === OPERATE_TYPE.UPSCALE) {
    return t("creatorZone.components.quickEntrances.upscale");
  }
};
</script>

<style lang="less" scoped>
.quick-entrance {
  width: 100%;

  .top,
  .bottom {
    display: flex;
    justify-content: space-between;

    .quick-entrance__item {
      flex: 1;
      cursor: pointer;

      + .quick-entrance__item {
        margin-left: 16px;
      }
    }
  }

  .top {
    border-radius: 0 0 20px 20px;
    overflow: hidden;

    .quick-entrance__item {
      aspect-ratio: 1 / 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .icon {
        width: 48px;
        height: 48px;
        mask-size: 100%;
      }

      .name {
        margin-top: 16px;
        font-family: Rookery New;
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
      }

      &:nth-child(1) {
        background: linear-gradient(135deg, #9262b9 0%, #f38abb 100%);

        .icon {
          mask-image: url("@/assets/img/svg/editImage.svg");
        }
      }

      &:nth-child(2) {
        background: linear-gradient(135deg, #ff8b68 0%, #e89c00 100%);

        .icon {
          mask-image: url("@/assets/img/svg/customImage.svg");
        }
      }

      &:nth-child(3) {
        background: linear-gradient(135deg, #ac8e11 0%, #709d46 100%);

        .icon {
          mask-image: url("@/assets/img/svg/avatar.svg");
        }
      }

      &:nth-child(4) {
        background: linear-gradient(135deg, #e4478b 0%, #fc763f 100%);

        .icon {
          mask-image: url("@/assets/img/svg/sticker.svg");
        }
      }

      &:nth-child(5) {
        background: linear-gradient(135deg, #006590 0%, #7787fb 100%);

        .icon {
          mask-image: url("@/assets/img/svg/scribble2.svg");
        }
      }

      &:nth-child(6) {
        background: linear-gradient(135deg, #55b4ed 0%, #99a5ff 100%);

        .icon {
          mask-image: url("@/assets/img/svg/gallery2.svg");
        }
      }
    }
  }

  .bottom {
    margin-top: 20px;

    .quick-entrance__item {
      min-width: fit-content;
      padding: 12px 20px;
      border-radius: 20px;
      display: flex;
      align-items: center;

      img {
        width: 54px;
        height: 54px;
        border-radius: 50%;
      }

      > div {
        margin-left: 16px;
        font-family: Rookery New;
        font-size: 16px;
        font-weight: 700;
      }

      &:first-child {
        min-width: 210px;
      }

      &.hovered {
      }
    }
  }
}
</style>
