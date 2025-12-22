<template>
    <div class="files-upload-list">
        <UploadItem v-for="item in questionFiles" :file-search-item="item"></UploadItem>
    </div>
</template>
<script setup lang="ts">

import { FileSearchListType } from '../ChatBaseComponent/types';
import UploadItem from '../ChatView/pages/UploadItem.vue';

defineProps<{
    cardType: {
        type: String,
        default: 'question'
    }, // 问题或者答案
    questionFiles: Array<FileSearchListType> | undefined
}>();
</script>
<style scoped lang="less">
.files-upload-list {
    display: flex;
    flex-wrap: wrap;
    padding: 12px 0 12px 12px;
    width: fit-content;
    max-width: 100%;
    min-width: auto;
}

.files-upload-list :deep(.file-upload-item) {
    max-width: 212px;
    margin-right: 0;
    margin-left: 8px;
}
</style>
