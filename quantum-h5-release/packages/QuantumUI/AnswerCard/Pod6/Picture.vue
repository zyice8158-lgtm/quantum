<template>
    <div class="ans-pic">
        <div class="ans-pic-title">
            <div class="ans-pic-title_text">
                {{ answerItem.answerData.content ? answerItem.answerData.content : 'Here are similar pictures from your Quantum Folder' }}
            </div>
        </div>
        <div class="ans-pic-imgs">
            <div class="ans-pic-imgs_item" v-for="item in answerItem.fileSearchList">
                <img :src="item.filePath"/>
            </div>
        </div>
        <AnswerToolBar></AnswerToolBar>
    </div>
</template>
<script setup lang="ts">
import { ChatController } from '../../index';
import { FileSearchListType } from '../../ChatBaseComponent/types';
import AnswerToolBar from './AnswerToolBar.vue';
import { onMounted } from 'vue';
const props = defineProps<{
  answerItem: {
    fileSearchList?: FileSearchListType[],
    answerData: {
      content: string;
    }
  },
  chat: ChatController | undefined,
}>();
function base64ToBlob(base64: string): Blob {
    try {
        const [header, data] = base64.split(',');
        const mime = header.match(/:(.*?);/)![1];
        const binary = atob(data);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
        return new Blob([array], { type: mime });
    } catch (error) {
        console.error('Blob转换失败:', error);
        return new Blob();
    }
}

onMounted(() => {
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'copy';
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('Drop事件触发');
    });

    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => {
            const imgSrc = img.src;
            try {
                // 生成标准化Blob URL（关键改进）
                const blob = base64ToBlob(imgSrc);
                const blobUrl = URL.createObjectURL(blob);

                // 必须的三种格式（增强版）
                e.dataTransfer!.setData('text/html', `<img src="${imgSrc}" width="300" height="300">`);
                e.dataTransfer!.setData('text/uri-list', blobUrl);
                e.dataTransfer!.setData('text/plain', imgSrc);

                // 特殊处理（Word专属）
                e.dataTransfer!.setData('application/x-www-form-urlencoded', blobUrl);
                e.dataTransfer!.setData('application/octet-stream', blobUrl);

                // 设置拖拽视觉反馈
                e.dataTransfer!.setDragImage(img, 0, 0);
                e.dataTransfer!.effectAllowed = 'copy';

                // 调试日志
                console.log('传输数据:', {
                    html: e.dataTransfer!.getData('text/html'),
                    uri: e.dataTransfer!.getData('text/uri-list'),
                    plain: e.dataTransfer!.getData('text/plain')
                });
            } catch (error) {
                console.error('拖拽事件异常:', error);
            }
        });
    });
});
</script>
<style lang="less" scoped>
.ans-pic {
    padding: 12px;
    background: #ffffff;
    display: inline-block;
    border-radius: 20px;
   
    &-title {
        display: flex;
        padding: 5px 6px;
        margin-bottom: 6px;
        &_text { 
            font-weight: 500;
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0.25px;
            color: #5F5E60;
        }
    } 
    &-imgs {
        display: flex;
        align-items: center;
        padding: 0 8px;
        gap: 8px;

        &_item {
            width: 180px;
            height: 205px;
            border-radius: 28px;
            overflow: hidden;

            img {
                width: 180px;
                height: 205px;
                object-fit: cover;
            }

        }
    }
}
</style>