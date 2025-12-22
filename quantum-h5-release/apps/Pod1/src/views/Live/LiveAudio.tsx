import { defineComponent, ref, onMounted, onUnmounted, Transition } from 'vue';
import { useLiveChat } from './useLive';
import {
    useASRPlayer,
} from "@libs/service";
import { IconQuantumLogo } from '@quantum/icons'
import { ElementSize } from '@/utils/Motion';
import { animate, cubicBezier } from "animejs";
import { useLocale } from '@/hooks/i18n'
import { BarStore } from '@/store/bar';
import { updateWindowSize } from '@/store/window';

export default defineComponent({
    name: 'LiveAudio',
    setup() {
        const { t } = useLocale()
        const { displayText, status, stop } = useLiveChat();
        onMounted(() => {
            console.log('AudioLiveView mounted---------------');
            useASRPlayer.start({ Data: { IsLive: true } });

        });
        onUnmounted(() => {
            stop();
            console.log('AudioLiveView unmounted---------------');

        });
        const lastMorphSize = ref<ElementSize | null>(); // 上一次大小保存

        const handleViewEnter = async (el: HTMLElement, done: () => void) => {
            const rect = el.getBoundingClientRect();
            BarStore.isAanimateChange = true;
            console.log('AudioLiveView mounted---------------', rect.height);
            updateWindowSize({
                Width: window.innerWidth,
                Height: rect.height + 20,
            });
            animate(el, {
                duration: 500,
                easing: cubicBezier(0.25, 0.1, 0.25, 1.0),
                width: [lastMorphSize.value?.width ?? 0, rect.width],
                height: [lastMorphSize.value?.height ?? 0, rect.height],
            }).then(() => {
                el.style.width = "";
                el.style.height = "";
                BarStore.isAanimateChange = false;
                done();
            });

        };
        const handleViewLeave = async (el: Element, done: () => void) => {
            const rect = el.getBoundingClientRect();
            lastMorphSize.value = {
                width: rect.width,
                height: rect.height,
            };
            setTimeout(() => {
                done();
            }, 200);
        };

        return () => {
            return (
                <div>
                    <Transition
                        mode="out-in"
                        onEnter={handleViewEnter}
                        onLeave={handleViewLeave}
                        appear
                    >
                        {status.value === 'init' && <DefaultView displayText={t('live.audio.default')} />}
                        {status.value === 'recognizing' && <RecognizingView displayText={displayText.value} />}
                        {status.value === 'thinking' && <ThinkingView />}
                        {status.value === 'responsing' && <ResponsingView displayText={displayText.value} />}
                    </Transition>
                </div>
            );
        }

    }
})
export const DefaultView = defineComponent({
    name: 'DefaultView',
    props: {
        displayText: String,
    },
    setup(props) {
        return () => {
            return <div class="text-[12px] p-[12px] m-[10px] whitespace-nowrap"
                style={{
                    background: 'radial-gradient(50% 50% at 50% 50%, var(--gradients-processing-stop-0) 0%,var(--gradients-processing-stop-100) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '500',
                    lineHeight: '16px',
                }}
            >{props.displayText}</div>
        }
    },
})
const ThinkingView = defineComponent({
    name: 'ThinkingView',
    setup() {
        const { t } = useLocale()
        const thinkingText = t('live.thinking')
        return () => {
            return <div class="relative flex items-center w-[161px] rounded-[32px] z-100">
                <div
                    style={{
                        inset: '0px',
                        borderRadius: '32px',
                        background: 'linear-gradient(135deg, #3571EA 0%, #855EE1 25%, #B14EB8 50%, #D95487 75%, #F56246 100%)',
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        padding: '2px',
                        zIndex: -1,
                        position: 'absolute',
                    }}
                >
                </div>
                <IconQuantumLogo class="text-[20px] animate-spin m-[15px]" />
                <div class="py-[10px] text-[16px]"
                    style={{
                        background: 'radial-gradient(50% 50% at 50% 50%, var(--gradients-processing-stop-0) 0%,var(--gradients-processing-stop-100) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {thinkingText}
                </div>
            </div>
        }
    },
})
const RecognizingView = defineComponent({
    name: 'RecognizingView',
    props: {
        displayText: String,
    },
    setup(props) {
        return () => {
            return <div class="px-[49px] rounded-[32px] w-[384px] min-h-[60px]">
                <div class="py-[16px] px-[28px] text-[16px] text-center"
                    style={{
                        lineHeight: '24px',
                        color: 'var(--color-text-on-surface)',
                        fontWeight: '400',
                    }}
                >
                    {props.displayText}
                </div>
            </div>
        }
    },
})
const ResponsingView = defineComponent({
    name: 'ResponsingView',
    props: {
        displayText: String,
    },
    setup(props) {
        const { t } = useLocale()
        return () => {
            return (
                <div class='relative flex-col items-center bg-transparent w-[677px] overflow-hidden z-100'>
                    <div
                        style={{
                            borderRadius: '32px',
                            background: 'linear-gradient(135deg, #3571EA 0%, #855EE1 25%, #B14EB8 50%, #D95487 75%, #F56246 100%)',
                            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                            padding: '4px',
                            zIndex: -1,
                            position: 'absolute',
                            inset: '0',
                        }}
                    >
                    </div>
                    <div class="mx-[5px] my-[20px] px-[23px] text-[24px] text-center max-h-[500px] overflow-auto rounded-[32px]"
                        style={{ color: 'var(--color-text-on-surface)' }}>
                        {props.displayText}
                    </div>
                    <div style={{
                        textAlign: 'center',
                        fontSize: '12px',
                        marginBottom: '28px',
                        fontWeight: '400',
                        color: 'var(--color-text-on-surface)'
                    }}>
                        {t("chat.disclaimer")}
                    </div>
                </div>
            );
        }
    },
})