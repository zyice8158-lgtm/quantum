<template>
  <div v-if="isShow" class="create-zone-card p-4 rounded-lg">
    <h3 class="text-purple-600 font-medium mb-4">Here's your generated image:</h3>
    <Carousel
      :value="displayImages"
      :numVisible="4"
      :numScroll="1"
      :responsiveOptions="responsiveOptions"
      :showNavigators="false"
      class="mb-4"
    >
      <template #item="slotProps">
        <div class="relative m-3" :class="{'invisible': !slotProps.data.imageUrl}">
          <img
            v-if="slotProps.data.imageUrl"
            :src="slotProps.data.imageUrl"
            :alt="slotProps.data.filename"
            class="w-full h-auto rounded-lg cursor-pointer"
            @click="test(slotProps.data.imageUrl)"
          />
          <button
            v-if="slotProps.data.imageUrl"
            class="absolute bottom-4 right-4 p-2 focus:outline-none"
            @click="downloadImage(slotProps.data.imageUrl, slotProps.data.filename)"
            style="border: none; padding: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #DAE2FF; border-radius: 50%;"
          >
            <IconDownloadButton style="width: 24px; height: 24px; color: #333;" />
          </button>
          <div v-else class="w-full h-0 pb-[100%] rounded-lg"></div>
        </div>
      </template>
    </Carousel>
    <!-- 底部按钮栏 -->
    <div class="flex justify-between items-center py-2">
      <a href="#" class="flex items-center gap-3">
        <span>View in </span>
        <span class="bg-gradient-to-r from-[#457EF8] to-[#7950D3] bg-clip-text text-transparent font-medium">Creator Zone</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
      <AnswerToolBar :answerItem="answerItem" :chat-action="chat.chatAction" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Carousel from 'primevue/carousel';
import { ChatStatus, ChatController } from '../../ChatBaseComponent';
import AnswerToolBar from '../Pod6/AnswerToolBar.vue';
import Answer from '../../ChatBaseComponent/types/Answer';
import { IconDownloadButton } from '@quantum/icons';

const router = useRouter();

interface ImageItem {
  filename: string;
  imageUrl: string;
  modelType: 'local' | 'cloud';
}

const props = defineProps<{
  answerItem: Answer | undefined,
  chat: ChatController | undefined,
}>();

const isShow = computed(() => {
  return props.answerItem?.chatStatusAnswer.value === ChatStatus.DONE || props.answerItem?.chatStatusAnswer.value === ChatStatus.ONGOING;
});

const responsiveOptions = computed(() => [
  {
    breakpoint: '1024px',
    numVisible: 4,
    numScroll: 1
  },
  {
    breakpoint: '768px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '560px',
    numVisible: 2,
    numScroll: 1
  }
]);

const getImageUrl = (filename: string, modelType: 'local' | 'cloud') => {
  const defaultUrl = '';
  if (!filename) return defaultUrl;

  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }

  let fileNameOnly = filename;
  try {
    const normalizedPath = filename.replaceAll('\\', '/');
    fileNameOnly = normalizedPath.split('/').slice(-1)[0] || filename;

    fileNameOnly = fileNameOnly.trim();

    console.log('Processed filename:', fileNameOnly, 'from original:', filename);
  } catch (error) {
    console.error('Error processing filename:', error);
    fileNameOnly = filename;
  }

  const baseUrl = 'https://quantumapp.locallenovo/czimage';
  const imageUrl = `${baseUrl}/${modelType}/${fileNameOnly}`;
  console.log('Generated image URL:', imageUrl);
  return imageUrl;
};

// 根据真实返回的数据结构调整图片处理逻辑
const images = computed(() => {
  console.log('props.answerItem?.answerData?.content:', props.answerItem?.answerData?.content);
  if (!props.answerItem?.answerData?.content) {
    console.log('No content available');
    return [];
  }

  const content = props.answerItem.answerData.content;
  const imagesList: ImageItem[] = [];

  try {
    console.log('Raw content:', content);

    let result = content;
    let resultData = null;

    if (typeof content === 'string') {
      result = JSON.parse(content);
      console.log('Parsed content:', result);
    }
    console.log('result------------', result);
    if (result.Data && result.Data.Result) {
      resultData = JSON.parse(result.Data.Result);
      console.log('Parsed Data.Result:', resultData);
    } else if (result.Result) {
      resultData = result.Result;
      console.log('Parsed Result from top level:', resultData);
    } else if(result.Data.data.text) {
      console.log('result.Data.data---------', result.Data.data)
      const res = JSON.parse(result.Data.data.text);
      const res11 = JSON.parse(res.response);
      if(res11.content && res11.content.includes('cloud')) {
        resultData = JSON.parse(res11.content);
      } else {
        resultData = res11;
      }
      console.log('result.response-------:', resultData);
    } else {
      resultData = result;
      console.log('Using top level data:', resultData);
    }

    const modelType = resultData.modelType || 'local';
    console.log('Detected modelType:', modelType);

    if (resultData.mediaItem && !Array.isArray(resultData.mediaItem)) {
      const mediaItem = resultData.mediaItem;
      console.log('Processing single media item:', mediaItem);

      const fileName = mediaItem.fileName || mediaItem.fileName || 'image.jpg';

      imagesList.push({
        filename: fileName,
        imageUrl: getImageUrl(fileName, modelType as 'local' | 'cloud'),
        modelType: modelType as 'local' | 'cloud'
      });
    }
    else if (resultData.mediaItem && Array.isArray(resultData.mediaItem)) {
      console.log('Processing multiple media items:', resultData.mediaItem);

      resultData.mediaItem.forEach((mediaItem: any) => {
        const fileName = mediaItem.fileName || mediaItem.fileName || 'image.jpg';

        imagesList.push({
          filename: fileName,
          imageUrl: getImageUrl(fileName, modelType as 'local' | 'cloud'),
          modelType: modelType as 'local' | 'cloud'
        });
      });
    }
    else if (resultData.fileName || resultData.fileName) {
      console.log('Processing simple file name case:', resultData);

      imagesList.push({
        filename: resultData.fileName || resultData.fileName || 'image.jpg',
        imageUrl: getImageUrl(resultData.fileName || resultData.fileName || '', modelType as 'local' | 'cloud'),
        modelType: modelType as 'local' | 'cloud'
      });
    }

    console.log('Final images list:', imagesList);

  } catch (error) {
    console.error('Failed to parse image data:', error);
    console.error('Error context - content:', content);

    try {
      if (content && typeof content === 'object') {
        // 直接从content中提取modelType和mediaItem
        const modelType = content.modelType || content.modelType || 'local';
        const mediaItem = content.mediaItem || content.mediaItem;

        if (mediaItem) {
          console.log('Using direct content extraction for fallback');

          const fileName = mediaItem.fileName || mediaItem.fileName || 'image.jpg';

          imagesList.push({
            filename: fileName,
            imageUrl: getImageUrl(fileName, modelType as 'local' | 'cloud'),
            modelType: modelType as 'local' | 'cloud'
          });
        }
      }
    } catch (fallbackError) {
      console.error('Fallback parsing also failed:', fallbackError);
    }
  }

  return imagesList;
});

// 添加空占位符以确保图片大小一致
const displayImages = computed(() => {
  const imagesList = images.value;
  const totalItems = 4;

  // 如果图片数量不足4张，添加空占位符
  if (imagesList.length < totalItems) {
    const placeholder: ImageItem = {
      filename: '',
      imageUrl: '',
      modelType: 'local'
    };

    const filledImages = [...imagesList];
    while (filledImages.length < totalItems) {
      filledImages.push(placeholder);
    }

    return filledImages;
  }

  return imagesList;
});

// 图片点击事件处理函数
const test = (currentImageUrl: string) => {
  // 获取所有图片的链接数组
  const allImageUrls = images.value.map(img => img.imageUrl).filter(url => url);
  console.log('allImageUrls:', allImageUrls);
  console.log('currentImageUrl:', currentImageUrl);
  router.push({
    path: '/smartEditingPreview',
    state: {
      queryObject: JSON.parse(JSON.stringify({
        chatAction: props.chat?.chatAction,
        allImageUrls: allImageUrls,
        currentImageUrl: currentImageUrl
      }))
    }
  });
};

// 下载图片功能
const downloadImage = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
