<template>
    <!-- 正确和错误的提示都在这里 -->
     <div class="overprompt-container">
        <IconSuccess v-if="isSucccess"/>
        <IconWrong v-else/>
        <div class="prompt-text">It has been increased by 10%.</div>
     </div>
</template>
<script setup lang="ts">
import { IconSuccess, IconWrong } from '@quantum/icons';
defineProps({
  isSucccess: {
    type: Boolean,
    default: false,
  },
  answerData: Object,
});
</script>
<style scope lang="less">
.overprompt-container {
    display: flex;
    padding: 18px;
    border-radius: 20px;
    background-color: #fff;
    .prompt-text {
        font-weight: 400;
        font-size: 16px;
        color: #161C27;
        margin-left: 10px;
    }
}
</style>