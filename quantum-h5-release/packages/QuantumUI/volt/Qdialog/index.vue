<template>
    <Dialog
        unstyled
        v-bind="dialogProps"
        :pt="theme"
        :ptOptions="{ mergeProps: ptViewMerge }"
        :header="header"
        :closable="false"
        @hide="handleHide"
        @show="handleShow"
        @update:visible="(val) => $emit('update:visible', val)"
    >
        <template #header>
            <div
                class="qdialog-header-main"
                :class="{ 'qdialog-header-main-collapsed': isCollapsed }"
            >
                <slot name="header">
                    <span v-if="header" class="qdialog-title">{{ header }}</span>
                </slot>
            </div>
            <div class="qdialog-header-actions">
                <slot
                    name="icons"
                    :isCollapsed="isCollapsed"
                    :isMaximized="isMaximized"
                    :toggleCollapse="toggleCollapse"
                    :toggleMaximize="toggleMaximize"
                    :close="handleClose"
                >
                    <button v-if="collapsible" class="qdialog-icon-btn" @click="toggleCollapse">
                        <IconMini v-if="!isCollapsed" />
                        <IconAdd v-else />
                    </button>
                    <button v-if="maximizable" class="qdialog-icon-btn" @click="toggleMaximize">
                        <Icon2FullView v-if="isMaximized" />
                        <IconFull v-else />
                    </button>
                    <button v-if="closable" class="qdialog-close-button" @click="handleClose">
                        <IconClose class="qdialog-close-icon" />
                    </button>
                </slot>
            </div>
        </template>
        <template #default>
            <div class="qdialog-content-wrapper" :class="{ 'qdialog-content-collapsed': isCollapsed }">
                <slot />
            </div>
        </template>
        <template #footer>
            <div v-if="!isCollapsed">
                <slot name="footer" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog, { type DialogPassThroughOptions, type DialogProps } from 'primevue/dialog';
import { ref, computed } from 'vue';
import { ptViewMerge } from '../utils';
import { IconClose, IconFull, Icon2FullView, IconAdd, IconMini } from '@quantum/icons';
import './index.less';

interface Props extends /* @vue-ignore */ Omit<DialogProps, 'pt'> {
    size?: 'small' | 'medium' | 'large' | string;
    variant?: 'default' | 'simple' | string;
    closable?: boolean;
    header?: string;
    maximizable?: boolean;
    collapsible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'medium',
    variant: 'default',
    closable: true,
    header: '',
    maximizable: false,
    collapsible: false
});

const emit = defineEmits<{
    hide: [];
    show: [];
    maximize: [];
    unmaximize: [];
    collapse: [];
    expand: [];
    'update:visible': [value: boolean];
}>();

const isMaximized = ref(false);
const isCollapsed = ref(false);

// 过滤掉自定义 props，将剩余的 props 透传给 PrimeVue Dialog
const dialogProps = computed(() => {
    const { size, variant, maximizable, collapsible, closable, header, ...rest } = props;
    return rest;
});

const handleHide = () => {
    emit('hide');
    isMaximized.value = false;
    isCollapsed.value = false;
};

const handleShow = () => {
    emit('show');
};

const handleClose = () => {
    emit('update:visible', false);
};

const toggleMaximize = () => {
    isMaximized.value = !isMaximized.value;
    if (isMaximized.value) {
        emit('maximize');
    } else {
        emit('unmaximize');
    }
};

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
    if (isCollapsed.value) {
        emit('collapse');
    } else {
        emit('expand');
    }
};

// 根据 size、variant 和 maximized 状态生成对应的类名
const rootClasses = computed(() => {
    const classes = [`qdialog`, `qdialog-root`, `qdialog-${props.size}`, `qdialog-${props.variant}`];
    if (isMaximized.value) {
        classes.push('qdialog-maximized');
    }
    return classes.join(' ');
});

const theme = ref<DialogPassThroughOptions>({
    root: {
        class: rootClasses
    },
    header: {
        class: 'qdialog-header'
    },
    title: {
        class: 'qdialog-title'
    },
    headerActions: {
        class: 'qdialog-header-actions'
    },
    content: {
        class: 'qdialog-content'
    },
    footer: {
        class: 'qdialog-footer'
    },
    mask: {
        class: 'qdialog-mask'
    },
    transition: {
        enterFromClass: 'opacity-0 scale-75',
        enterActiveClass: 'transition-all duration-150 ease-[cubic-bezier(0,0,0.2,1)]',
        leaveActiveClass: 'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
        leaveToClass: 'opacity-0 scale-75'
    }
});
</script>
