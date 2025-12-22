<template>
    <div class="question">
        <!-- 暴露当前问题数据 -->
        <slot name="question" :questionItem="questionItem"></slot>
    </div>
</template>

<script setup lang="ts">
import { Question } from '../../types/ChatClass';

defineProps<{
    questionItem: Question | undefined
}>()
</script>