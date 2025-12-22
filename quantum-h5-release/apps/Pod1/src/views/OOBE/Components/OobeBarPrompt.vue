<template>
    <div class="oobe-bar-prompt w-[740px] max-h-[444px] rounded-[24px]" ref="oobeBarPromptRef">
        <div class="oobe-bar-prompt_content">
            <div class="oobe-bar-prompt_content_item" v-for="item in listAllOOBE" :key="item.title">
                <div class="oobe-bar-prompt_content_item-icon">
                    <component :is="item.icon" />
                </div>
                <div class="oobe-bar-prompt_content_item-title">
                    {{ item.title }}
                </div>
                <QButton :label="item.buttonName" color="primary" icon-pos="right" variant="text"
                    @click="closeOobeBarPrompt">
                    <template #icon>
                        <IconOOBEBut />
                    </template>
                </QButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { useLocale } from "@/hooks/i18n";
import { IconOOBECZone, IconOOBEBut, IconOOBECmu, IconOOBERThis, IconOOBELocalMode, IconOOBESmartConnect, IconOOBEQLive } from "@quantum/icons";
import { QButton } from "@libs/p-comps/volt/QButton";
import { closeWindow, updateWindowSize } from "@/store";
import { animate } from "animejs";

defineOptions({
    name: "OobeBarPrompt",
});

const { t } = useLocale();
const listAllOOBE = ref([
    {
        title: t("OOBE.oobe_bar_cz_title"),
        buttonName: t("OOBE.oobe_bar_cz_but_name"),
        icon: IconOOBECZone,
    },
    {
        title: t("OOBE.oobe_bar_ql_title"),
        buttonName: t("OOBE.oobe_bar_ql_but_name"),
        icon: IconOOBEQLive,
    },
    {
        title: t("OOBE.oobe_bar_cmu_title"),
        buttonName: t("OOBE.oobe_bar_cmu_but_name"),
        icon: IconOOBECmu,
    },
    {
        title: t("OOBE.oobe_bar_rt_title"),
        buttonName: t("OOBE.oobe_bar_rt_but_name"),
        icon: IconOOBERThis,
    },
    {
        title: t("OOBE.oobe_bar_lm_title"),
        buttonName: t("OOBE.oobe_bar_lm_but_name"),
        icon: IconOOBELocalMode,
    },
    {
        title: t("OOBE.oobe_bar_sc_title"),
        buttonName: t("OOBE.oobe_bar_sc_but_name"),
        icon: IconOOBESmartConnect,
    }
])

const oobeBarPromptRef = ref<HTMLDivElement>();
const ANIMATE_DURATION = 600;
onMounted(async () => {
    await nextTick();
    await resizeOobeBarPrompt();
})
const resizeOobeBarPrompt = async () => {
    const ClientRect = oobeBarPromptRef.value?.getBoundingClientRect();
    if (ClientRect) {
        await updateWindowSize({
            Width: ClientRect.width,
            Height: ClientRect.height,
        });
        await animate(oobeBarPromptRef.value, {
            width: ClientRect.width,
            height: [0, ClientRect.height],
            duration: ANIMATE_DURATION,
        })
        oobeBarPromptRef.value?.removeAttribute('style');
    }
}

const closeOobeBarPrompt = async () => {
    // await animate(oobeBarPromptRef.value, {
    //     height: [oobeBarPromptRef.value?.getBoundingClientRect().height, 0],
    //     duration: ANIMATE_DURATION,
    // })
    // oobeBarPromptRef.value?.removeAttribute('style');
    closeWindow();
}
</script>

<style scoped lang="less">
.oobe-bar-prompt {
    background: var(--color-surfaces-surface-blur);
    overflow: hidden;
    padding: 16px;
    backdrop-filter: blur(50px);
    display: flex;
    align-items: center;
    justify-content: center;

    &_content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        flex-direction: row;
        align-content: space-between;
        row-gap: 8px;
        column-gap: 8px;
    }

    &_content_item {
        width: 230px;
        height: 202px;
        border-radius: 24px;
        background: linear-gradient(180deg,
                var(--color-surfaces-surface-blur-low) 0%,
                var(--color-state-focus-on-focus-pressed) 100%);
        border: 2px solid var(--color-on-primary);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 24px 16px 16px;
        gap: 12px;
        text-align: center;

        &-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 54px;
            height: 55px;
            flex-shrink: 0;
        }

        &-title {
            font-size: 16px;
            line-height: 22px;
            font-weight: 500;
            color: var(--color-text-on-surface);
            white-space: pre-line;
        }
    }
}
</style>