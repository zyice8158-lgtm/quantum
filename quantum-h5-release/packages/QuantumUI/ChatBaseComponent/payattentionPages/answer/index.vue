<template>
    <div class="answer">
        <!-- 暴露当前回答数据 -->
        <slot name="answer" :answerData="answerItem"></slot>
    </div>
</template>

<script setup lang="ts">
import Answer from "../../types/Answer"

defineProps<{
    answerItem: Answer | undefined
}>()
</script>
<style lang="less" scoped>
.answer {
    width: 100%;
}
</style>