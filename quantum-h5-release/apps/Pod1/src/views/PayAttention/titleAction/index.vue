<template>
  <div class="title-action-container" @mousedown="startDragWindow">
    <div class="title-action-container_left">
      <!-- Record and Summarize -->
    </div>
    <div class="title-action-container_right mr-[8px] cursor-pointer" @click.stop="handleCloseWindow" @mousedown.stop v-automation="'close_pay_attention'">
      <IconMini />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconMini } from "@quantum/icons";
import { setCloseWindow, CrossTabCommunicator, ChannelMessageType } from "@libs/service";
import { startDragWindow } from "@/store/window";
import { setPayAttentionStore, RecordingButtonStatus, payAttentionStore, RecordingDisplayStatus } from "@/store/payAttention";

const recordBus = new CrossTabCommunicator(ChannelMessageType.RECORD);

const handleCloseWindow = async () => {
  try {
    const displayStatus = payAttentionStore.recordingDisplayStatus;
    if ([RecordingDisplayStatus.Summarizing,RecordingDisplayStatus.SummaryCompleted]?.includes(displayStatus)) {
      setPayAttentionStore('recordingButtonStatus', RecordingButtonStatus.Default);
      recordBus.send("record:close", { active: false });
    }
    // 关闭窗口
    await setCloseWindow({
      MessageSource: "window1",
      Data: {},
    });
  } catch (error) {
    console.error("setCloseWindow error", error);
  }
};
</script>

<style scoped lang="less">
.title-action-container {
  height: 48px;
  color: var(--color-focus);
  font-size: var(--text-label-m);
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
