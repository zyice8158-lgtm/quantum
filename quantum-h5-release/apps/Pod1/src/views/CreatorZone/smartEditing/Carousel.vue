<template>
    <div class="carousel-container-card relative w-full">
        <AiButton :disabled="currentPage === 0" class="absolute top-[50%] translate-y-[-50%] left-[8px] z-100 w-[32px]! h-[32px]!" @click="prev">
            <IconArrowLeft />
        </AiButton>
        <AiButton :disabled="currentPage === products.length - 1" class="absolute top-[50%] translate-y-[-50%] right-[8px] z-100 w-[32px]! h-[32px]!" @click="next">
            <IconArrowRight />
        </AiButton>
        <Carousel :showNavigators="false" :page="currentPage" :value="products" :numVisible="1" :numScroll="1" :showIndicators="false">
            <template #item="slotProps">
                <div class="relative mx-auto">
                    <img @load="onImageLoad" :src="slotProps.data.image" :alt="'Image ' + slotProps.data.id" class="w-full rounded" />
                </div>
            </template>
        </Carousel>
    </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import Carousel from 'primevue/carousel';
import { AiButton } from "@libs/p-comps/volt/QButton";
import { IconArrowLeft, IconArrowRight } from "@quantum/icons";

const emit = defineEmits(['imageLoad']);
const props = defineProps({
    images: {
        type: Array,
        default: () => []
    },
    currentImageUrl: {
        type: String,
        default: ''
    }
});

const currentPage = ref(0);
const products = ref([]);

const prev = () => {
    if(currentPage.value > 0) {
        currentPage.value--;
    }
}

// 将图片URL转换为Carousel组件需要的格式
const transformImages = () => {
    return props.images.map((url, index) => ({
        id: index.toString(),
        image: url
    }));
};

// 找到当前图片在数组中的索引
const findCurrentImageIndex = () => {
    return props.images.indexOf(props.currentImageUrl);
};

// 监听图片数据变化
watch(() => props.images, (newImages) => {
    products.value = transformImages();
    currentPage.value = findCurrentImageIndex();
    console.log('Carousel图片数据更新:', products.value);
    console.log('当前图片索引:', currentPage.value);
}, { deep: true, immediate: true });

// 监听当前图片变化
watch(() => props.currentImageUrl, (newUrl) => {
    currentPage.value = findCurrentImageIndex();
    console.log('当前图片URL更新:', newUrl);
    console.log('当前图片索引:', currentPage.value);
});
const next = () => {
    if(currentPage.value < products.value.length - 1) {
        currentPage.value++;
    }
}
const loadedImages = ref(0);

const onImageLoad = (imageData) => {
  console.log('图片加载成功:', imageData.image);
  loadedImages.value++;
  // 检查是否所有图片都已加载
  if (loadedImages.value > 1) {
    return;
  }
  // 发射单个图片加载事件
  emit('imageLoad');
};


const responsiveOptions = ref([
    {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
]);

</script>
<style scoped>
.carousel-container-card {
    & > button {
        position: absolute;
    }
}
</style>
