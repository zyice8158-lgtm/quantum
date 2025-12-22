<template>
    <div class="files-upload-container">
        <div class="answer-header">
            <div class="answer-header-text">
                <div class="header-title">Got it, I've found {{ fileList.length }} file{{ fileList.length === 0 ? '' : 's' }} for you.</div>
                <VoiceButton class="voice-button-right" :playContent="answerItem.answerData.content" :chatAction="chatAction" :answerItem="answerItem"/>
              </div>

            <!-- <div class="answer-header-select" @click.stop="selectAllFileList">
                <div class="header-select-text">Select all</div>
                <Checkbox v-model="selectAll" binary size="large" class="mr-[4px]"/>
            </div> -->
        </div>
        <div class="files-upload-list">
            <UploadItem v-for="item in fileList"
            :fileSearchItem="item"
            :fileItemInfo="item"
            :uploadType="UploadType.checkbox"
            :selectedFilePaths="selectedFilePaths"
            @handleFileCheck="handleFileCheck"
            @contextmenu="onRightClickItem($event, item)"/>
        </div>
        <ContextMenu ref="contextMenu" :model="[fileItemInfo]">
            <template #item="{ item, props }">
                <div class="open-file-folder" @click="openFolder(item)"><IconOpenFolder/><span>Open folder</span></div>
            </template>
        </ContextMenu>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { ChatController } from '../../../QuantumUI/ChatBaseComponent';
import { FileSearchListType, UploadType } from '../../ChatBaseComponent/types';
import { openNativeFile } from '@libs/service';
import { getMockFileList, trackEvent } from '@libs/service/fetch/contextualPrompt';
import UploadItem from '../../ChatView/pages/UploadItem.vue';
import { useFileScope } from '../../hooks/useFiles';
import ContextMenu from 'primevue/contextmenu';
import { IconOpenFolder } from '@quantum/icons';
import VoiceButton from '../../VoiceBtn/index.vue';
interface FileItemI {
    previewPath: string; // 预览路径
    scope: string; // 类型
    file_name: string; // 文件名
    targetPath: string;
    fileId: string; // 后端返回的文件ID
    file_path: string; // 文件路径
    fileIcon: string; // fileIcon
    id?: string; // 后端返回的文件ID
    fileType?: string;
    fileScope?: string;
}
const props = withDefaults(defineProps<{
    fileSearchList?: FileSearchListType[];
    uploadType?: UploadType;
    chat: ChatController | undefined;
    answerItem: {
        answerData: {
            content: Array<FileItemI>
        }
    },
}>(), {
    fileSearchList: () => [],
    uploadType: UploadType.input
});
const selectAll = ref(false);
const selectedFilePath = ref('');
const fileList = ref([]);
const fileScope = 'Chat'
const {
  files,
  onFileDelete,
  onFileAdd,
  onFileclear,
  onFileSelect,
  deleteScope
} = useFileScope({ scope: fileScope });
const fileItemInfo = ref({});
const contextMenu = ref();
const onRightClickItem = (event, item) => {
    const { filePath } = item;
    selectedFilePath.value = filePath;
    fileItemInfo.value = item;
    contextMenu.value.show(event);
};
const openFolder = async (item) => {
    try {
        await openNativeFile({
            Data: item.filePath,
        })
    } catch (error) {
        console.log(error);
    }
}
const selectedFilePaths = computed(() => {
    return files.value.map(item => item.filePath);
});
const handleFileCheck = (item: FileSearchListType) => {
    if(!selectedFilePaths.value.includes(item.filePath)) {
        const copyItem = { ...item, converted: false, isFileLoading: false };
        console.log('onFileAdd----------', copyItem);
        onFileAdd([copyItem]);
         const trackFileSelect = async () => {
            const params = {
                event_category: "LOCAL_AGENT",
                event_action: "LOCAL_AGENT_FILE_SELECTED",
                param2_value: "file_selected"
            };

            const shellReq = {
                MessageSource: 'pod1',
                Timestamp: Date.now(),
                Data: JSON.stringify(params)
            };

            try {
                const result = await trackEvent(shellReq);
                console.log('file_selected trackEvent result:', result);
            } catch (error) {
                console.error('trackEvent error:', error);
            }
        };
        trackFileSelect();
    } else {
        onFileDelete(item.filePath);
          const trackFileUnselect = async () => {
            const params = {
                event_category: "LOCAL_AGENT",
                event_action: "LOCAL_AGENT_FILE_UNSELECTED",
                param2_value: "file_unselected"
            };

            const shellReq = {
                MessageSource: 'pod1',
                Timestamp: Date.now(),
                Data: JSON.stringify(params)
            };

            try {
                const result = await trackEvent(shellReq);
                console.log('file_unselected trackEvent result:', result);
            } catch (error) {
                console.error('trackEvent error:', error);
            }
        };
        trackFileUnselect();
    }
};
onMounted(() => {
    // 查询文件列表：临时方案
    // getMockFileListData();
    console.log('fileSearch--------page', props, props.answerItem.answerData.content)
    fileList.value = props.answerItem.answerData.content.map((item) => {
        item.file_type = item.fileType;
        item.fileType = '.' + item.fileType;
        item.fileScope = capitalizeFirstLetter(item.scope);
        return item;
    });
});
onUnmounted(()=>{
  deleteScope()
})
const capitalizeFirstLetter = (scope: string) => {
  return scope.charAt(0).toUpperCase() + scope.slice(1);
}

const getMockFileListData = async () => {
    const res = await getMockFileList({
        Data: {
            fileList: [{
                folderPath: "D:\\\\\\\\aaa"
            }]
        }
    });
    fileList.value = res.data.Data.fileList.map((item) => {
        return {
            fileId: item.FilePath,
            fileName: item.FileName,
            filePath: item.FilePath,
            fileBase64: item.Base64 || '',
            fileType: item.FilePath.slice(item.FilePath.lastIndexOf('.')),
        }
    });
    console.log('getMockFileListData---------', res.data.Data.fileList);
};
watch(() => props.chat?.fileSearchList.length, (len: number) => {
    selectAll.value = (len === fileList.value.length);
});
const selectAllFileList = async () => {

};
</script>
<style lang="less" scoped>
.files-upload-container {
    // height: 244px;
    top: 88px;
    left: 675px;
}
.open-file-folder {
    width: 152px;
    height: 56px;
    padding: 16px 12px 16px 16px;
    border-radius: 16px;
    background-color: #fff;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
    font-weight: 400;
    & > svg {
        width: 24px;
        height: 24px;
        margin-right: 10px;
        float: left;
    }
}

.answer-header {
    margin-bottom: 8px;
    &-icons {
        width: 20px;
        height: 20px;
        margin: 6px 8px 0 0;

        img {
            width: 20px;
            height: 20px;
            display: block;
        }
    }

    &-text {
        margin-top: 5px;
        font-weight: 500;
        font-size: 16px;
        color: #855EE1;
        display: flex;
        align-items: center;
        font-family: “Rookery New”;

        .voice-button-right {
            margin-left: auto;
        }
    }
    &-select {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-top: 25px;
        .header-select-text {
            margin-right: 8px;
            font-weight: 400;
            font-size: 14px;
            color: rgba(95, 94, 96, 1);
        }
    }
}
.files-upload-list {
    display: flex;
    flex-wrap: wrap;
    :deep(.file-upload-item) {
        margin-bottom: 8px;
    }
}

</style>
