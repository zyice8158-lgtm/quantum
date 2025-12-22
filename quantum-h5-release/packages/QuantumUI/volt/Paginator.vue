<template>
  <Paginator
    unstyled
    :pt="theme"
    :ptOptions="{
      mergeProps: ptViewMerge,
    }"
    @page="
      (e) => {
        changePage(e);
      }
    "
  >
    <template
      #container="{
        page,
        rows,
        pageCount,
        pageLinks,
        changePageCallback,
        totalRecords,
        firstPageCallback,
        lastPageCallback,
        prevPageCallback,
        nextPageCallback,
      }"
    >
      <div class="flex flex-wrap gap-[4px] items-center justify-center ml-[50px]"></div>
      <span class="mr-[18px]">Total {{ totalRecords }} items</span>
      <SecondaryButton text rounded @click="prevPageCallback" :disabled="page === 0">
        <template #icon>
          <AngleLeftIcon />
        </template>
      </SecondaryButton>
      <div
        class="items-center justify-center gap-[4px] hidden sm:flex"
        v-if="!(pageLinks as unknown as Array<number>).includes(1)"
      >
        <SecondaryButton
          text
          @click="firstPageCallback"
          :class="[
            'shrink-0 w-[28px] h-[28px] rounded-[8px]!',
            { 'bg-[#E5EFFF]! text-[#364CF5]!': page + 1 === 1 },
          ]"
        >
          1
        </SecondaryButton>
      </div>
      <div v-if="!(pageLinks as unknown as Array<number>).includes(1)">
        <span>...</span>
      </div>
      <div class="items-center justify-center gap-[4px] hidden sm:flex">
        <SecondaryButton
          v-for="pageLink of pageLinks"
          :key="pageLink"
          :text="page + 1 !== pageLink"
          @click="() => changePageCallback(pageLink - 1)"
          :class="[
            'shrink-0 w-[28px] h-[28px] rounded-[8px]!',
            { 'bg-[#E5EFFF]! text-[#364CF5]!': page + 1 === pageLink },
          ]"
          >{{ pageLink }}
        </SecondaryButton>
      </div>
      <div v-if="!(pageLinks as unknown as Array<number>).includes(pageCount)">
        <span>...</span>
      </div>
      <div
        class="items-center justify-center gap-[4px] hidden sm:flex"
        v-if="!(pageLinks as unknown as Array<number>).includes(pageCount)"
      >
        <SecondaryButton
          text
          @click="lastPageCallback"
          :class="[
            'shrink-0 w-[28px] h-[28px] rounded-[8px]!',
            { 'bg-[#E5EFFF]! text-[#364CF5]!': page + 1 === pageCount },
          ]"
          >{{ pageCount }}
        </SecondaryButton>
      </div>
      <div>
        <SecondaryButton text rounded @click="nextPageCallback" :disabled="page === pageCount! - 1">
          <template #icon>
            <AngleRightIcon />
          </template>
        </SecondaryButton>
        <span class="ml-[18px]">{{ rows }}/{{ t("FKB.paginatorPage") }}</span>
      </div>
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Paginator>
</template>

<script setup lang="ts">
import AngleLeftIcon from "@primevue/icons/angleleft";
import AngleRightIcon from "@primevue/icons/angleright";
import Paginator, {
  type PaginatorPassThroughOptions,
  type PaginatorProps,
  PageState,
} from "primevue/paginator";
import { ref } from "vue";
import SecondaryButton from "./SecondaryButton.vue";
import { ptViewMerge } from "./utils";
import { useI18n } from "vue-i18n";

interface Props extends /* @vue-ignore */ PaginatorProps {}
defineProps<Props>();
const { t } = useI18n();
const theme = ref<PaginatorPassThroughOptions>({
  root: `flex items-center justify-start flex-wrap py-[4px] px-[8px] rounded-md gap-[2px]
  text-surface-700 dark:text-surface-0 text-[12px] leading-[18px]`,
});
const emit = defineEmits(["page"]);
const changePage = (e: PageState) => {
  emit("page", e);
};
</script>

