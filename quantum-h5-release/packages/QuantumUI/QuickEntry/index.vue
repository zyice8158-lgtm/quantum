<template>
    <div class="quick-entry-wrapper">
        <div class="quick-entry-item" v-for="item in entryMenus" :key="item.title" @click="item.action">
            <component :is="item.icon"></component>
            <span>{{ item.title }}</span>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { IconLearningZone, IconFull, IconAgents } from '@quantum/icons';
import { ChatController } from '../../QuantumUI';
const props = defineProps<{
  chat: ChatController | undefined;
}>();
const entryMenus = [
    {
        icon: IconLearningZone,
        title: 'Learn about Las Vegas history',
        action: () => {
            console.log('one--------')
        },
    },
    {
        icon: IconFull,
        title: 'Create an image',
        action: () => {},
    },
    {
        icon: IconAgents,
        title: 'Explore Hotels',
        action: () => {},
    },
    {
        icon: IconLearningZone,
        title: 'Learn about Las Vegas history',
        action: () => {
            console.log('one--------')
        },
    },
    {
        icon: IconFull,
        title: 'Create an image',
        action: () => {},
    },
    {
        icon: IconAgents,
        title: 'Explore Hotels',
        action: () => {},
    },
];
</script>
<style lang="less" scoped>
.quick-entry-wrapper {
    display: flex;
    gap: 10px;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    position: relative;
    &::before {
        content: "";
        position: absolute;
        right: 0;
        bottom: 0;
        top: 0;
        width: 100px;
        background: linear-gradient(90deg, transparent, #fff);
    }
}
.quick-entry-item {
    font-weight: 700;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    border-radius: 32px;
    border: 2px solid rgba(109, 119, 138, 0.12);
}
</style>