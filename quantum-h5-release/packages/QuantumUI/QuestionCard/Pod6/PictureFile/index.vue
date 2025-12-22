<template>
    <div class="ques-pic">
        <div class="ques-pic-title" v-if="questionItem.questionData.content">
            <div class="ques-pic-title_text">
                {{ questionItem.questionData.content }}
            </div>
        </div>
        <div class="ques-pic-imgs">
            <div class="ques-imgs-item" v-for="item in questionItem.questionData.files">
                <img :src="item.base64"/>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Question  from '../../../ChatBaseComponent/types/Question'
const props = defineProps<{
    questionItem: Question | undefined
}>();
console.log('questionItem---------', props.questionItem);
</script>
<style lang="less" scoped>
.ques-pic {
    &-title {
        display: flex;
        margin-bottom: 13px;
        &_text { 
            margin-left: auto;
            font-size: 15px;
            background-color: rgba(255, 255, 255, 0.6);
            padding: 8px 24px;
            border-radius: 24px;
            font-size: 14px;
            font-weight: 400;
            color: rgba(95, 94, 96, 1);
        }
    }
    &-imgs {
        display: flex;
        justify-content: space-between;
    }
  
    .ques-imgs-item {
        margin-left: auto;
        img {
                width: 200px;
                height: 194px;
                border-radius: 20px;
                object-fit: cover;
            }
    }
}
</style>