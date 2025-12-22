<template>
  <IftaLabel
    class="iftalabel"
    :class="ifclass"
    tabindex="0"
    role="button"
    @keydown.enter="handleIfEnter"
  >
    <Select ref="selectRef" v-model="checkvalue" v-bind="$attrs" />
    <label for="dd-city">{{ label }}</label>
  </IftaLabel>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Select from "./index.vue";
import IftaLabel from "primevue/iftalabel";
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  ifclass: {
    type: String,
    default: "w-full md:w-200",
  },
});
const selectRef = ref<typeof Select>();
const checkvalue = defineModel();

const handleIfEnter = () => {
  selectRef.value?.$el.click();
};
</script>
<style scoped lang="less">
.iftalabel {
  &:focus-visible {
    outline: none;
    .p-select {
      border-color: var(--color-primary-primary, #f1f5f9) #6c43c6;
      background: var(--color-state-primary-primary-container-pressed, #f8fafc);
    }
  }
}
</style>
