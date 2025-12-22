<template>
    <Dialog
        unstyled
        :pt="theme"
        :ptOptions="{
            mergeProps: ptViewMerge
        }"
    >
        <template #closebutton="{ closeCallback }">
            <SecondaryButton variant="text" rounded @click="closeCallback" autofocus>
                <template #icon>
                    <TimesIcon />
                </template>
            </SecondaryButton>
        </template>
        <template #maximizebutton="{ maximized, maximizeCallback }">
            <SecondaryButton variant="text" rounded @click="maximizeCallback" autofocus>
                <template #icon>
                    <WindowMinimizeIcon v-if="maximized" />
                    <WindowMaximizeIcon v-else />
                </template>
            </SecondaryButton>
        </template>
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import TimesIcon from '@primevue/icons/times';
import WindowMaximizeIcon from '@primevue/icons/windowmaximize';
import WindowMinimizeIcon from '@primevue/icons/windowminimize';
import Dialog, { type DialogPassThroughOptions, type DialogProps } from 'primevue/dialog';
import { ref } from 'vue';
import SecondaryButton from './SecondaryButton.vue';
import { ptViewMerge } from './utils';

interface Props extends /* @vue-ignore */ DialogProps {}
defineProps<Props>();

const theme = ref<DialogPassThroughOptions>({
    root: `max-h-[90%] max-w-screen rounded-3xl
        border border-surface-200 dark:border-surface-700
        bg-surface-0 dark:bg-surface-900
        text-surface-700 dark:text-surface-0 shadow-lg
        p-maximized:w-screen p-maximized:h-screen p-maximized:top-[0px] p-maximized:start-0p-maximized: max-h-full p-maximized:rounded-none`,
    header: `flex items-center justify-between shrink-0 p-[10px]`,
    title: `font-semibold text-xl`,
    headerActions: `flex items-center gap-[4px]`,
    content: `overflow-y-auto pt-[0px] px-[10px] pb-[10px] p-maximized:grow`,
    footer: `shrink-0 pt-[0px] px-[10px] pb-[10px] flex justify-end gap-[4px]`,
    mask: `p-modal:bg-black/50 p-modal:fixed p-modal:top-[0px] p-modal:start-0 p-modal:w-full p-modal:h-full rounded-32`,
    transition: {
        enterFromClass: 'opacity-0 scale-75',
        enterActiveClass: 'transition-all duration-150 ease-[cubic-bezier(0,0,0.2,1)]',
        leaveActiveClass: 'transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
        leaveToClass: 'opacity-0 scale-75'
    }
});
</script>

