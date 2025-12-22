<template>
  <div
    class="gallery-category"
    v-helper="
      () => {
        return {
          tabIndex: -1,
          role: 'radiogroup',
        };
      }
    "
  >
    <template v-for="category in categories">
      <div
        class="category text-outlines-outline"
        :class="{
          selected: category.selected,
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
              role: 'radio',
              ariaLabel: category.value,
              ariaChecked: category.selected,
              focus: () => {},
              blur: () => {},
              click: () => {
                setCategories(category.id);
              },
            };
          }
        "
      >
        {{ category.value }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Icategory } from "@/types";

const props = defineProps({
  categories: {
    type: Array<Icategory>,
    default: [],
  },
  setCategories: {
    type: Function,
    default: () => {},
  },
});
</script>

<style lang="less" scoped>
.gallery-category {
  width: 100%;
  height: 48px;
  display: flex;
  // justify-content: center;

  .category {
    height: 100%;
    border-bottom: 2px solid transparent;
    font-family: Rookery New;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;

    &.hovered,
    &.selected {
      border-bottom-color: var(--color-focus);
      color: var(--color-focus);
    }

    + .category {
      margin-left: 16px;
    }
  }
}
</style>
