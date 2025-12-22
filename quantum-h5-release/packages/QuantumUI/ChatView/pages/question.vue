<template>
  <div class="query-box">
    <!-- 用发送内容区别到底是不是纯文字 -->
    <component :is="QuestionComp" :questionItem="queryItem"/>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Question from '../../ChatBaseComponent/types/Question'
import { questionMap } from '../../index';
const props = defineProps<{
  queryItem: Question | undefined
}>()
console.log('queryItem----------', props.queryItem);

const expanded = ref(false)
const maxShow = 4

const files = computed(() => props.queryItem?.questionData?.files || [])
const showToggleArrow = computed(() => files.value.length > maxShow)
const displayFiles = computed(() => {
  if (!showToggleArrow.value) return files.value
  return expanded.value ? files.value : files.value.slice(0, maxShow)
})
const QuestionComp = computed(() => {
  console.log('打印问题卡片------', props.queryItem.questionData.actionType, questionMap);
  return questionMap[props.queryItem.questionData.actionType];
})

</script>

<style scoped lang="less">
.query-box {
  // max-width: 85%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  // padding-right: 8px;
  .file-display {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px;
    background: transparent;
    border: none;
    min-width: 120px;
    border-bottom: 1px solid #f7f9ff;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    margin-bottom: 4px;
    position: relative;
    width: 100%;

    .files-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      width: v-bind('showToggleArrow ? "calc(100% - 20px)" : "100%"');
      padding: 0 6px;
      box-sizing: border-box;
      margin-right: v-bind('showToggleArrow ? "20px" : "0"');
      justify-content: flex-end;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      border-radius: 24px;
      padding: 6px 18px 6px 12px;
      border: 1px solid #e5e5e5;
      position: relative;
      min-width: 0;
      box-sizing: border-box;
      width: v-bind(
        'showToggleArrow ? "calc((100% - 30px) / 4)" : "calc((100% - 30px) / " + Math.min(4, displayFiles.length) + ")"'
      );

      .file-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .file-name {
        font-size: 15px;
        color: #333;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 4px;
        line-height: 1;
        flex: 1;
        min-width: 0;
        cursor: pointer;
      }
    }

    .toggle-arrow {
      position: absolute;
      top: 6px;
      right: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      user-select: none;
      z-index: 1;
    }
  }
}
</style>
