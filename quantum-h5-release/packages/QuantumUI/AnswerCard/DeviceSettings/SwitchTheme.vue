
<template>
    <div class="theme-setting">
        <div class="theme-setting-title">
            You are connecting a headset. Listening at high volume may damage your hearing. Do you want to continue adjusting?
        </div>
        <div class="confirm-btn">
            Confirm
        </div>
        <div class="switch-mode-contain">
            <div class="mode-text">darkmode</div>
            <ToggleSwitch v-model="isDarkMode" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import ToggleSwitch from '../../volt/ToggleSwitch.vue';
const isDarkMode = ref(false);
</script>
<style scoped lang="less">
.theme-setting {
    font-size: 14px;
    background-color: #fff;
    border-radius: 24px;
    padding: 12px;
    > div {
        margin-top: 8px;
    }
    .confirm-btn {
        width: 83px;
        height: 32px;
        line-height: 32px;
        border-radius: 16px;
        border: 1px solid rgba(95, 94, 96, 1);
        cursor: pointer;
        text-align: center;
        font-weight: 700;
        color: rgba(95, 94, 96, 1);
    }
    .switch-mode-contain {
        display: flex;
        align-items: center;
        border-radius: 20px;
        background-color: rgba(251, 249, 247, 1);
        padding: 0 24px;
        justify-content: space-between;
        height: 48px;
        .mode-text {
            color: rgba(24, 24, 27, 1);        
            font-weight: 500;
        }
    }
}
</style>