<template>
    <Message
        unstyled
        :pt="theme"
        :ptOptions="{ mergeProps: ptViewMerge }"
        :severity="mappedSeverity"
        :closable="closable"
        @close="handleClose"
    >
        <template #closeicon>
            <IconClose />
        </template>
        <template #container="{ closeCallback }">
            <div class="q-message-content">
                <div class="q-message-inner">
                    <div class="q-message-icon-wrapper">
                        <slot name="icon">
                            <component :is="defaultIcon" />
                        </slot>
                    </div>
                    <div class="q-message-body">
                        <slot></slot>
                    </div>
                    <div v-if="$slots.action" class="q-message-action">
                        <slot name="action"></slot>
                    </div>
                </div>
                <button v-if="closable" class="q-message-close-button" @click="closeCallback">
                    <IconClose class="q-message-close-icon" />
                </button>
            </div>
        </template>
    </Message>
</template>

<script setup lang="ts">
import Message, { type MessagePassThroughOptions, type MessageProps } from 'primevue/message';
import { ref, computed } from 'vue';
import { ptViewMerge } from '../utils';
import { IconClose, IconNotifications, IconAddCircle, IconStepCheck, IconWarning, IconFailed } from '@quantum/icons';
import './index.less';

interface Props extends /* @vue-ignore */ Omit<MessageProps, 'severity'> {
    severity?: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary' | string;
    variant?: 'outlined' | 'simple' | 'filled' | 'graphic' | string;
    closable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    severity: 'info',
    variant: 'filled',
    closable: false
});

const emit = defineEmits<{
    close: []
}>();

const handleClose = () => {
    emit('close');
};

// 根据 severity 返回默认图标
const defaultIcon = computed(() => {
    const iconMap: Record<string, any> = {
        contrast: IconNotifications,
        secondary: IconNotifications,
        info: IconAddCircle,
        success: IconStepCheck,
        warn: IconWarning,
        error: IconFailed
    };
    return iconMap[props.severity] || IconAddCircle;
});

// 映射 severity 到 PrimeVue 支持的类型
const mappedSeverity = computed(() => {
    const validSeverities = ['success', 'info', 'warn', 'error', 'secondary', 'contrast'];
    return validSeverities.includes(props.severity) ? props.severity as MessageProps['severity'] : 'info';
});

// 根据 severity 和 variant 生成对应的类名
const rootClasses = computed(() => {
    return `q-message q-message-root q-message-${props.severity} q-message-${props.variant}`;
});

const theme = ref<MessagePassThroughOptions>({
    root: {
        class: rootClasses
    },
    content: {
        class: 'q-message-content'
    },
    icon: {
        class: 'q-message-icon-wrapper'
    },
    text: {
        class: 'q-message-body'
    },
    closeButton: {
        class: 'q-message-close-button'
    },
    closeIcon: {
        class: 'q-message-close-icon'
    },
    transition: {
        enterFromClass: 'opacity-0',
        enterActiveClass: 'transition-opacity duration-300',
        leaveFromClass: 'max-h-40',
        leaveActiveClass: 'overflow-hidden transition-all duration-300 ease-in',
        leaveToClass: 'max-h-0 opacity-0 !m-0'
    }
});
</script>
