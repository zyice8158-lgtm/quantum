<template>
  <div class="banner w-full h-[258px] rounded-t-16 overflow-hidden">
    <div class="w-full h-full flex justify-between">
      <template v-for="(banner, index) in banners">
        <div
          :class="[
            'relative transition-all duration-500 corsur-pointer overflow-hidden',
            activeIndex === index ? 'w-[65%]' : 'w-[16%]',
          ]"
          @click="
            () => {
              activeIndex = index;
            }
          "
          v-hover.mouse="
            () => {
              return {
                start: () => {
                  activeIndex = index;
                },
                cancel: () => {},
              };
            }
          "
        >
          <img :src="banner.url" class="w-full h-full object-cover" :alt="banner.content" />
          <div
            class="title whitespace-nowrap overflow-hidden w-full"
            v-show="activeIndex === index"
          >
            <div class="text-inverse-focus">{{ banner.title }}</div>
            <div class="text-inverse-focus">{{ banner.subTitle }}</div>
          </div>

          <div
            class="edit bg-secondary-container"
            :class="[activeIndex === index ? 'opacity-100' : 'opacity-0']"
            v-helper="
              () => {
                return {
                  role: 'button',
                  ariaLabel: $t('creatorZone.home.tryIt'),
                  focus: () => {
                    activeIndex = index;
                  },
                  blur: () => {},
                  click: () => {
                    props.click({
                      content: banner.content,
                      url: banner.url,
                    });
                  },
                };
              }
            "
          >
            <div class="icon bg-on-secondary-container"></div>

            <div class="text-on-secondary-container">
              {{ $t("creatorZone.home.tryIt") }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import banner1 from "@/assets/img/Banner/1.png";
import banner2 from "@/assets/img/Banner/2.png";
import banner3 from "@/assets/img/Banner/3.png";

const props = defineProps({
  click: {
    type: Function,
    default: () => {},
  },
});

const banners = ref(
  [
    {
      url: banner1,
      title: "Enable everyone's creativity",
      subTitle: "Explore Creator Zone",
      content: "描述词1",
    },
    {
      url: banner2,
      title: "Enable everyone's creativity",
      subTitle: "Explore Creator Zone",
      content: "描述词2",
    },
    {
      url: banner3,
      title: "Enable everyone's creativity",
      subTitle: "Explore Creator Zone",
      content: "描述词3",
    },
  ].map((image) => {
    return {
      ...image,
      url: new window.URL(image.url, import.meta.url).href,
    };
  }),
);

const activeIndex = ref(0);
</script>

<style lang="less" scoped>
.banner {
  .title {
    position: absolute;
    bottom: 22px;
    left: 22px;

    > div {
      font-family: Rookery New;
      font-weight: 500;
      color: var(--color-text-inverse-on-surface);

      &:nth-child(1) {
        font-size: 24px;
      }

      &:nth-child(2) {
        font-size: 12px;
      }
    }
  }

  .edit {
    position: absolute;
    right: 22px;
    bottom: 22px;
    padding: 8px 16px;
    border-radius: 999px;
    cursor: pointer;
    display: flex;
    align-items: center;

    .icon {
      margin-right: 4px;
      width: 16px;
      height: 16px;
      mask-image: url("@/assets/img/svg/edit2.svg");
      mask-size: 100%;
    }

    div {
      font-family: Rookery New;
      font-size: 12px;
      font-weight: 500;
    }
  }
}
</style>
