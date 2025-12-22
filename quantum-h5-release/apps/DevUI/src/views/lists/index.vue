<template>
  <div class="card flex justify-center">
    <div class="w-200 flex flex-col items-center bg-gray-100 p-[4px] rounded-[16px]">
      <template v-for="item in items" :key="item">
        <Divider class="p-divider p-component p-divider-horizontal p-divider-solid p-divider-left" v-if="item.type === 'divider'"></Divider>
        <button
          v-else
          class="q_menu_category w-full flex items-center justify-start pl-[20px] text-[var(--color-text-on-surface)] text-[16px] hover:bg-[var(--color-focus-focus)] rounded-[12px] hover:bg-[var(--color-focus-on-focus)] py-[12px] gap-[12px] line-height-[24px]"
          @click="clickItem(item)"
        >
          <component :is="item.icon" />
          {{ item.label }}
        </button>
      </template>
    </div>

    <Qmenu :model="items" @clickItem="clickItem" />




  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import * as Icon from "@quantum/icons";
import Divider from '@libs/p-comps/volt/Divider.vue';
import Qmenu from '@libs/p-comps/volt/Qmenu/index.vue';
const emit = defineEmits(['clickItem']);
const router = useRouter();
const IconAdd = Icon['IconAdd'];
const items = ref([
  {
    label: "Router Link",
    icon: IconAdd,
    route: "/theming/unstyled",
  },
  {
    label: "Programmatic",
    icon: IconAdd,
    command: () => {
      router.push("/introduction");
    },
  },
  {
    type: "divider",
    label: "External",
    icon: IconAdd,
    // url: "https://vuejs.org/",
  },
  {
    type: "divider",
    label: "four",
    icon: IconAdd,
    // url: "https://vuejs.org/",
  },
]);

function clickItem(item) {
  if (item.command) {
    item.command();
  } else if (item.route) {
    router.push(item.route);
  } else if (item.url) {
    window.open(item.url, "_blank");
  }
  emit('clickItem', item);
}
</script>
<style scoped lang="less">
.q_menu_category {
  &:focus-visible{
    outline: none;
    background-color: var(--color-focus-on-focus);
  }
}
</style>
