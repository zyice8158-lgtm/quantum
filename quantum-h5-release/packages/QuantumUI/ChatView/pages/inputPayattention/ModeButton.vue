<template>
  <div :class="modeButtonClass" @click="switchModeSuggestion">
    <QIcons class="icon-but" name="listen" />
  </div>
  <div :class="modeSummaryClass" @click="switchRecordSummary">
    <QIcons class="icon-but" name="recodePay" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch, onMounted, onUnmounted } from "vue";
import { QIcons } from "../../../index";
import { setModeStatus, WebviewMessager } from "../../../../Service";

const modeStatus = reactive({
  record: false,
  suggestion: false,
});
const emit = defineEmits<{
  (e: "closeLiveBut"): void;
  (e: "closeGeminiValue"): void;
}>();

// 控制建议模式样式
const modeButtonClass = computed(() => ({
  "mode-button": !modeStatus.suggestion,
  "mode-button-question": modeStatus.suggestion,
}));

// 控制转录总结模式样式
const modeSummaryClass = computed(() => ({
  "mode-summary": !modeStatus.record,
  "mode-button-question": modeStatus.record,
}));

// 切换转录总结模式
const switchRecordSummary = async () => {
  try {
    modeStatus.record = !modeStatus.record;
    modeStatus.suggestion = false; // 切换转录模式时关闭建议模式
    await toActionCSharp();
  } catch (error) {
    console.error("切换转录总结模式失败", error);
  }
};

// 切换建议模式
const switchModeSuggestion = async () => {
  try {
    modeStatus.suggestion = !modeStatus.suggestion;
    modeStatus.record = false; // 切换建议模式时关闭转录总结模式
    await toActionCSharp();
  } catch (error) {
    console.error("切换建议模式失败", error);
  }
};

// 执行设置模式状态的操作发送给C#
const toActionCSharp = async () => {
  try {
    emit("closeLiveBut"); // 触发huipan的关闭Live按钮事件
    const res = await setModeStatus({
      Data: modeStatus,
    });
    // 如果返回的错误码是3001，抛出异常  30001 代表 pod3===30000。定制的错误码是第一个所以是30001
    if (res.data?.ErrorCode === 3001) throw new Error(res.data?.ErrorMessage);
    console.log("设置模式状态成功", res);
    const { record, suggestion } = res.data?.Data;
    modeStatus.record = record;
    modeStatus.suggestion = suggestion;
  } catch (error) {
    console.error("设置模式状态失败", error);
    throw error;
  }
};

// 发送关闭所有状态 退出payattention
const closePayattention = async () => {
  try {
    modeStatus.record = false;
    modeStatus.suggestion = false;
    const res = await setModeStatus({
      Data: modeStatus,
    });
    console.log("发送关闭payattention所有状态成功", res);
  } catch (error) {
    console.error("发送关闭payattention所有状态失败", error);
    throw error;
  }
};

/**
 * 监听模式状态变化，控制关闭Live按钮的触发时机 只执行一次
 */
watch(
  () => [modeStatus.record, modeStatus.suggestion],
  ([record, suggestion]) => {
    if (!record && !suggestion) {
      emit("closeGeminiValue"); // 触发关闭Gemini值的事件
    }
  }
);

onMounted(() => {
  // 监听来自C#的关闭payattention 转录事件
  WebviewMessager.on("client.h5.modeMgr.resetTranscpript", () => {
    emit("closeGeminiValue"); // 触发关闭Gemini值的事件
    modeStatus.record = false;
  });
});

onUnmounted(() => {
  // 取消监听关闭payattention事件
  WebviewMessager.off("client.h5.modeMgr.resetTranscpript", () => {});
});

defineExpose({
  closePayattention,
});
</script>

<style scoped lang="less">
.mode-button,
.mode-button-question {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  .icon-but {
    color: rgba(133, 94, 225, 1);
  }
}

.mode-button-question {
  background: rgba(133, 94, 225, 1);
  .icon-but {
    color: white;
  }
}

.mode-summary {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  .icon-but {
    color: rgba(133, 94, 225, 1);
  }
}
</style>
