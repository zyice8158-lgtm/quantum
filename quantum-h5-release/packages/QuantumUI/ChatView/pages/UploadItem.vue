<template>
    <div class="file-upload-item" @click="openFileItem" v-automation="'file_upload_item'">
        <img class="file-upload-base-img" :src="'data:image/png;base64,' + fileSearchItem.fileBase64" v-if="fileSearchItem.fileBase64"/>
        <div v-else class="file-upload-item-img" v-automation="'file_upload_item_img'">
             <!-- v-if="fileSearchItem.isFileLoading" -->
            <div class="file-upload-loading" v-if="fileSearchItem.isFileLoading" v-automation="'file_upload_loading'">
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <circle cx="50" cy="50" r="45" fill="none" stroke-width="8" stroke-dasharray="62.8318, 188.4956"
                    transform="rotate(-90, 50, 50)"
                    stroke="#3571EA">
                    </circle>
                </svg>
            </div>
            <!-- 判断是否是图片预览 -->
            <FileIcon class="file-icon" :iconType="fileSearchItem.fileType" />
            <!-- <FileTypeIcon class="file-icon" :filename="fileSearchItem.filePath" size="15" color="var(--lz-icon-video)" /> -->
        </div>
        <div class="file-info">
            <div ref="fileNameRef" class="file-upload-name" v-tooltip="tooltipOptions" v-automation="'file_upload_name'"
                 >{{ removeFileExtension(fileSearchItem.fileName) }}</div>
            <div class="file-upload-desc" v-automation="'file_upload_desc'">
                <div>{{ getSystemDescription(fileSearchItem.fileType) }}</div>
                <svg v-if="uploadType === UploadType.checkbox" class="ml-[8px] mr-[5px]" xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                    <circle cx="3" cy="3" r="3" :fill="fileSearchItem.fileScope === 'Local' ? '#92908F' : '#3571EA'"/>
                </svg>
                <div v-if="uploadType === UploadType.checkbox">{{ fileSearchItem.fileScope }}</div>
            </div>
        </div>
        <div class="file-handle" v-automation="'file_handle'">
            <IconClear v-if="uploadType === UploadType.close " @click.stop="handleFileDelete(fileSearchItem)"/>
            <Checkbox v-else-if="uploadType === UploadType.checkbox"
            @click.stop="handleFileCheck(fileSearchItem)"
             :modelValue="selectedFilePaths.includes(fileSearchItem.filePath)"/>
            <div v-else></div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { IconClear } from '@quantum/icons';
import { openNativeFile } from '@libs/service';
import Checkbox from '../../AnswerCard/Pod1/Checkbox.vue';
import { trackEvent } from '@libs/service/fetch/contextualPrompt';
import { FileSearchListType } from '../../ChatBaseComponent/types';
import { UploadType } from '../../ChatBaseComponent/types';
import FileIcon from '../../iconDocument/FileIcon.vue';
import tooltipDirective from '../../volt/directives/tooltip';
const vTooltip = tooltipDirective;
const props = withDefaults(defineProps<{
    fileSearchItem: FileSearchListType;
    uploadType?: UploadType;
    fileItemInfo?: FileSearchListType;
    selectedFilePaths?: Array<string>
}>(), {
    uploadType: UploadType.input,
    selectedFilePaths: () => []
});
const emit = defineEmits(["handleFileCheck", "handleFileDelete"]);

const fileNameRef = ref<HTMLElement | null>(null);

const tooltipOptions = computed(() => {
  const fullFileName = props.fileSearchItem.fileName;
  const fileNameWithoutExtension = removeFileExtension(fullFileName);
  console.log('fileName-------------', fileNameWithoutExtension);

  if (!fileNameRef.value) {
    return { content: fullFileName, disabled: true };
  }

  const isTruncated = fileNameRef.value.scrollWidth > fileNameRef.value.clientWidth;
  return {
    content: fullFileName,
    disabled: !isTruncated
  };
});

onMounted(() => {
  tooltipOptions.value.disabled = !(fileNameRef.value?.scrollWidth > fileNameRef.value?.clientWidth);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  if (!fileNameRef.value) return;
  tooltipOptions.value.disabled = !(fileNameRef.value.scrollWidth > fileNameRef.value.clientWidth);
};
const trackFileAction = async (actionType: string) => {
    const params = {
        event_category: "LOCAL_AGENT",
        event_action: `LOCAL_AGENT_FILE_${actionType.toUpperCase()}`,
        param2_value: actionType
    };

    const shellReq = {
        MessageSource: 'pod1',
        Timestamp: Date.now(),
        Data: JSON.stringify(params)
    };

    try {
        const result = await trackEvent(shellReq);
        console.log(`${actionType} trackEvent result:`, result);
    } catch (error) {
        console.error('trackEvent error:', error);
    }
};

const openFileItem = async () => {
       try {
        // 添加文件打开埋点
        await trackFileAction('file_open');
        await openNativeFile({
            Data: props.fileSearchItem.filePath,
        })
    } catch (error) {
        console.log(error);
    }
};
// 处理文件删除事件并添加埋点
const handleFileDelete = async (file: FileSearchListType) => {
    try {
        await trackFileAction('file_delete');
        emit('handleFileDelete', file);
    } catch (error) {
        console.error('handleFileDelete error:', error);
        emit('handleFileDelete', file); // 即使埋点失败也执行原始操作
    }
};

// 处理文件选中事件并添加埋点
const handleFileCheck = async (file: FileSearchListType) => {
    try {
        const actionType = props.selectedFilePaths?.includes(file.filePath) ? 'file_uncheck' : 'file_check';
        await trackFileAction(actionType);
        emit('handleFileCheck', file);
    } catch (error) {
        console.error('handleFileCheck error:', error);
        emit('handleFileCheck', file); // 即使埋点失败也执行原始操作
    }
};

const windowsFileTypes = [
   {
     systemDesc: "Microsoft Word Document",
     extensions: [".doc", ".docx"]
   },
   {
     systemDesc: "Microsoft Excel Document",
     extensions: [".xls", ".xlsx"]
   },
   {
     systemDesc: "Microsoft PowerPoint Document",
     extensions: [".ppt", ".pptx"]
   },
   {
     systemDesc: "Microsoft Txt Document",
     extensions: [".txt"]
   },
   {
     systemDesc: "Microsoft Edge PDF Document",
     extensions: [".pdf"]
   },
   {
     systemDesc: "Microsoft Access Document",
     extensions: [".mdb", ".accdb"]
   },
   {
     systemDesc: "CSV Document",
     extensions: [".csv"]
   },
   {
     systemDesc: "WPS Word Document",
     extensions: [".wps"]
   },
   {
     systemDesc: "WPS Excel Document",
     extensions: [".et"]
   },
   {
     systemDesc: "WPS Presentation Document",
     extensions: [".dps"]
   },
   {
     systemDesc: "JPEG Image",
     extensions: [".jpg", ".jpeg"]
   },
   {
     systemDesc: "PNG Image",
     extensions: [".png"]
   },
   {
     systemDesc: "GIF Image",
     extensions: [".gif"]
   },
   {
     systemDesc: "BMP Image",
     extensions: [".bmp"]
   },
   {
     systemDesc: "SVG Image",
     extensions: [".svg"]
   },
   {
     systemDesc: "TIFF Image",
     extensions: [".tiff", ".tif"]
   },
   {
     systemDesc: "PSD Image",
     extensions: [".psd"]
   },
   {
     systemDesc: "WebP Image",
     extensions: [".webp"]
   },
   {
     systemDesc: "HEIC Image",
     extensions: [".heic", ".heif"]
   },
   {
     systemDesc: "ICO Image",
     extensions: [".ico"]
   },
   {
     systemDesc: "MP4 Video",
     extensions: [".mp4"]
   },
   {
     systemDesc: "AVI Video",
     extensions: [".avi"]
   },
   {
     systemDesc: "MOV Video",
     extensions: [".mov"]
   },
   {
     systemDesc: "WMV Video",
     extensions: [".wmv"]
   },
   {
     systemDesc: "FLV Video",
     extensions: [".flv"]
   },
   {
     systemDesc: "MKV Video",
     extensions: [".mkv"]
   },
   {
     systemDesc: "WebM Video",
     extensions: [".webm"]
   },
   {
     systemDesc: "M4V Video",
     extensions: [".m4v"]
   },
   {
     systemDesc: "TS Video",
     extensions: [".ts"]
   },
   {
     systemDesc: "MP3 Audio",
     extensions: [".mp3"]
   },
   {
     systemDesc: "WAV Audio",
     extensions: [".wav"]
   },
   {
     systemDesc: "FLAC Audio",
     extensions: [".flac"]
   },
   {
     systemDesc: "AAC Audio",
     extensions: [".aac"]
   },
   {
     systemDesc: "OGG Audio",
     extensions: [".ogg"]
   },
   {
     systemDesc: "M4A Audio",
     extensions: [".m4a"]
   },
   {
     systemDesc: "WMA Audio",
     extensions: [".wma"]
   },
   {
     systemDesc: "MIDI Audio",
     extensions: [".mid", ".midi"]
   },
   {
     systemDesc: "ZIP Compressed Folder",
     extensions: [".zip"]
   },
   {
     systemDesc: "RAR Compressed Folder",
     extensions: [".rar"]
   },
   {
     systemDesc: "7-Zip Compressed Folder",
     extensions: [".7z"]
   },
   {
     systemDesc: "Tar Archive",
     extensions: [".tar"]
   },
   {
     systemDesc: "GZIP Archive",
     extensions: [".gz"]
   },
   {
     systemDesc: "ISO Disk Image",
     extensions: [".iso"]
   },
   {
     systemDesc: "HTML Document",
     extensions: [".html", ".htm"]
   },
   {
     systemDesc: "JavaScript File",
     extensions: [".js"]
   },
   {
     systemDesc: "CSS File",
     extensions: [".css"]
   },
   {
     systemDesc: "JSON File",
     extensions: [".json"]
   },
   {
     systemDesc: "XML Document",
     extensions: [".xml"]
   },
   {
     systemDesc: "PHP File",
     extensions: [".php"]
   },
   {
     systemDesc: "Python File",
     extensions: [".py"]
   },
   {
     systemDesc: "Markdown File",
     extensions: [".md"]
   },
   {
     systemDesc: "INI Configuration File",
     extensions: [".ini"]
   },
   {
     systemDesc: "YAML File",
     extensions: [".yml", ".yaml"]
   },
   {
     systemDesc: "Log File",
     extensions: [".log"]
   },
   {
     systemDesc: "Batch File",
     extensions: [".bat"]
   },
   {
     systemDesc: "PowerShell Script",
     extensions: [".ps1"]
   },
   {
     systemDesc: "Registry File",
     extensions: [".reg"]
   },
   {
     systemDesc: "Symbolic Link",
     extensions: [".lnk"]
   },
   {
     systemDesc: "TrueType Font",
     extensions: [".ttf"]
   },
   {
     systemDesc: "Web Open Font Format",
     extensions: [".woff"]
   },
   {
     systemDesc: "Embedded OpenType Font",
     extensions: [".eot"]
   },
   {
     systemDesc: "Email Message",
     extensions: [".eml"]
   },
   {
     systemDesc: "EPUB Ebook",
     extensions: [".epub"]
   },
   {
     systemDesc: "VCF Contact File",
     extensions: [".vcf"]
   }
 ];
const getSystemDescription = (fileType: string): string => {
    const normalizedFileType = fileType.startsWith('.') ? fileType : `.${fileType}`;

    const matchedType = windowsFileTypes.find(type =>
        type.extensions.includes(normalizedFileType.toLowerCase())
    );

    return matchedType ? matchedType.systemDesc : normalizedFileType.slice(1).toUpperCase();
};

// 移除文件扩展名的辅助函数
const removeFileExtension = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return fileName;
    return fileName.substring(0, lastDotIndex);
};
</script>
<style lang="less" scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.file-upload-item {
        display: flex;
        align-items: center;
        padding: 8px 15px 8px 8px;
        height: 48px;
        /* 设置最大宽度为父容器files-upload-list宽度的一半 */
        max-width: 48%;
        background-color: #DAE2FF;
        border-radius: 16px;
        border: 1px solid rgba(0, 0, 0, 0.12);
        background: #DAE2FF;
        margin-right: 8px;
    .file-upload-base-img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 4px;
    }
    .file-upload-item-img {
        width: 32px;
        height: 32px;
        background-color: #fff;
        border-radius: 50%;
        padding: 8px 9px;
        margin-right: 8px;
        position: relative;
        .file-upload-loading {
            animation: spin 2s linear infinite;
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border-radius: 50%;
        }
    }
    .file-info {
        margin-right: 16px;
        overflow: hidden;
        .file-upload-name {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            color: #001846;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
        }
        .file-upload-desc {
            color: #5F5E60;
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            white-space: nowrap; /* 防止换行 */
            margin-top: -2px; /* 缩小与文件名之间的间距2px */
        }
    }
    .file-handle {
        svg {
            cursor: pointer;
            width: 11px;
            height: 11px;
            margin-right: 8px;
        }
        & > div {
            vertical-align: middle;
        }
    }
}
</style>
