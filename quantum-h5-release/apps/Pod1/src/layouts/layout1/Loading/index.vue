<template>
  <div
    class="absolute top-0 left-0 w-full h-[calc(100vh-66px)] bg-transparent select-none z-9999"
    v-if="GlobalStore.gLoading"
  >
    <div class="flex absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
      <IconQuantumLogo class="qlogo text-headline-l mr-[16px]"></IconQuantumLogo>
      <span
        class="loadingText text-title-l text-transparent bg-clip-text bg-linear-to-r from-processing-gradient-stop-0 to-processing-gradient-stop-100"
      >
        Loading...
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineOptions } from "vue";
import { IconQuantumLogo } from "@quantum/icons";
import { GlobalStore } from "@/store/global";

defineOptions({
  name: "GLoading",
});
</script>
<style lang="less" scoped>
.qlogo {
  animation: spin 1.5s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(720deg);
  }
}
</style>
