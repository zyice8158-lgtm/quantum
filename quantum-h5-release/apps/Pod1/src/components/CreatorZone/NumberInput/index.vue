<template>
  <input
    type="number"
    :value="value"
    @keydown="
      (e) => {
        if (
          ![
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'ArrowLeft',
            'ArrowRight',
            'Backspace',
          ].includes(e.key)
        ) {
          e.returnValue = false;
        }
      }
    "
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

defineProps({
  value: Number,
});

onMounted(() => {
  window.addEventListener("dragstart", Edragstart);
});

onUnmounted(() => {
  window.removeEventListener("dragstart", Edragstart);
});

const Edragstart = (e) => {
  e.preventDefault();
};
</script>

<style lang="less" scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

/* IE 10+ */
input[type="number"]::-ms-expand {
  display: none;
}
</style>
