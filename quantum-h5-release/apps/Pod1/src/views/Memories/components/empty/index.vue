<template>
  <div class="empty w-full h-full flex flex-col items-center justify-center">
    <img src="@/assets/img/memory/empty.svg" alt="" class="w-[455px] h-[378px]" />
    <span class="text-[16px] leading-[22px] font-[500] text-text-on-surface">{{
      t("FKB.emptyMsg1")
    }}</span>
    <span class="text-[14px] leading-[20px] font-[400] text-text-on-surface-variant">{{
      t("FKB.emptyMsg2")
    }}</span>
  </div>
</template>
<script setup lang="ts">
import { useLocale } from "@/hooks/i18n";

const { t, locale } = useLocale();
</script>
