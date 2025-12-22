<template>
    <div class="metting-arrange-container">
        <div class="device-metting">
            <img :src="calendarImg" class="calendar-img"/>
            <span>Change my device wallpaper</span>
        </div>
        <div class="metting-info">
            Time:  1:55PM, Jun 11, 2024
            Location：1 floor meeting room
        </div>
           
    </div>
</template>
<script lang="ts" setup>
import calendarImg from '../../assets/calendar.png';
</script>
<style scoped lang="less">
.metting-arrange-container {
    .device-metting {
        color: #5F5E60;
        .calendar-img {
            width: 24px;
            height: 24px;
            vertical-align: middle;
            display: inline-block;  
        }
        span {
            margin-left: 10px;
            vertical-align: middle;
            font-size: 16px;
            font-weight: 500;
            color: #161C27;
        }
    }
    .metting-info {
        font-size: 14px;
        font-weight: 400;
        margin-left: 36px;
    }
    .view-calendar {
        border-radius: 20px;
        border: 1px solid #5F5E60;
        margin-top: 12px;
        padding: 8px 18px 8px 14px;
    }
}
</style>