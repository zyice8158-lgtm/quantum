import { defineComponent, ref, onMounted, onUnmounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { startDragWindow } from '@/store/window';
import { useLiveChat } from './useLive';
import {
    useASRPlayer,
} from "@libs/service";
import { IconQuantumLogo } from '@quantum/icons'
import { useLocale } from '@/hooks/i18n'
export const checkCameraAvailability = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        console.error('your browser does not support getUserMedia');
        return { available: false, reason: 'not_supported' };
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return { available: true };
    } catch (error: any) {
        switch (error.name) {
            case 'NotAllowedError': return { available: false, reason: 'permission_denied' };
            case 'NotFoundError': return { available: false, reason: 'no_camera' };
            case 'NotReadableError': return { available: false, reason: 'camera_occupied' };
            default: return { available: false, reason: 'unknown_error' };
        }
    }
};
export default defineComponent({
    name: 'LiveVideo',
    setup() {
        const videoRef = ref<HTMLVideoElement | null>(null);
        const canvasRef = ref<HTMLCanvasElement | null>(null);
        const isCameraActive = ref(false);
        const isLoading = ref(true);
        const availableCameras = ref<MediaDeviceInfo[]>([]);
        const selectedCamera = ref('');
        const getCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(device => device.kind === 'videoinput');
                availableCameras.value = cameras;

                console.log(cameras);

                if (cameras.length > 0) {
                    selectedCamera.value = cameras[0].deviceId;
                }
            } catch (err) {
                console.error('get cameras fail:', err);
            }
        };

        const startCamera = async () => {
            try {
                const constraints: MediaStreamConstraints = {
                    video: {
                        deviceId: selectedCamera.value ? { exact: selectedCamera.value } : undefined,
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'environment'
                    },
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                if (videoRef.value) {
                    videoRef.value.srcObject = stream;
                    videoRef.value.play().catch(err => {
                        console.error('play camera fail:', err);
                    });
                }

                isCameraActive.value = true;
                isLoading.value = false;
                useASRPlayer.start({ Data: { IsLive: true } });

            } catch (err) {
                console.error('access camera fail', err);
                isCameraActive.value = false;
                isLoading.value = false;
            } finally {
                isLoading.value = false;
            }
        };

        const stopCamera = () => {
            if (videoRef.value && videoRef.value.srcObject) {
                const stream = videoRef.value.srcObject as MediaStream;
                const tracks = stream.getTracks();

                tracks.forEach(track => track.stop());
                videoRef.value.srcObject = null;
                isCameraActive.value = false;
            }
        };

        const capturePhoto = (): string | undefined => {
            if (!videoRef.value || !canvasRef.value) return;

            const video = videoRef.value;
            const canvas = canvasRef.value;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                return canvas.toDataURL('image/jpeg', 0.8);
            }
            return undefined;
        };
        const { displayText, status, stop } = useLiveChat(capturePhoto);

        onMounted(() => {
            getCameras().then(() => {
                if (availableCameras.value.length > 0) {
                    startCamera();
                }
            });
        });
        onBeforeUnmount(() => {
            console.log('摄像头窗口卸载了---------');
            stopCamera();
            stop();
        });

        return () => {
            let statusComponent;
            if (status.value === 'init') {
                statusComponent = <DefaultView />;
            } else if (status.value === 'recognizing') {
                statusComponent = <RecognizingView displayText={displayText.value} />;
            } else if (status.value === 'thinking') {
                statusComponent = <ThinkingView />;
            } else {
                statusComponent = <ResponsingView displayText={displayText.value} />;
            }

            return (
                <div class="relative camera-container bg-white p-[10px] rounded-[24px] flex w-lvw h-lvh" style={{ boxSizing: 'border-box' }} onMousedown={startDragWindow}>
                    <div style={{
                        inset: '10px',
                        padding: '5px',
                        borderRadius: '16px',
                        position: 'absolute',
                        background: 'linear-gradient(135deg, #3571EA 0%, #855EE1 25%, #B14EB8 50%, #D95487 75%, #F56246 100%)',
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        zIndex: '1'

                    }}></div>

                    <div class="camera-preview">
                        {isLoading.value ? (
                            <div class="absolute inset-0 flex items-center justify-center bg-gray-900/70">
                                <div class="w-[32px] h-[32px] border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : null}

                        <video
                            ref={videoRef}
                            class={`w-full h-full rounded-[16px] object-cover ${isCameraActive.value ? 'opacity-100' : 'opacity-0 transition-opacity duration-500'}`}
                            autoplay
                            playsinline
                        />

                        {!isCameraActive.value && !isLoading.value && (
                            <div class="absolute inset-0 rounded-[16px] flex items-center justify-center bg-gray-900/50">
                                <p class="text-gray-400">Camera not activated</p>
                            </div>
                        )}

                        <div class="absolute flex items-center justify-center rounded-[16px] bottom-[10px] left-[10px] right-[10px] bg-gradient-to-t from-black/80 to-transparent p-[10px]">
                            {statusComponent}
                        </div>

                    </div>

                    <canvas ref={canvasRef} class="hidden" aria-hidden="true"></canvas>

                </div>
            );

        };
    },
});
const DefaultView = defineComponent({
    name: 'DefaultView',
    setup() {
        const { t } = useLocale();
        return () => {
            return <div class="text-[24px] h-[100px]"
                style={{
                    background: 'var(--Processing, radial-gradient(50% 50% at 50% 50%, var(--Colors-AI-Steps-Step-15, #5C8DFF) 0%, var(--Colors-Accents-AI-Accent, #855EE1) 100%))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    whiteSpace: 'normal',
                    textAlign: 'center',
                    fontWeight: '500',
                    lineHeight: '32px',
                }}
            >{t("live.video.default")}</div>
        }
    },
})
const ThinkingView = defineComponent({
    name: 'ThinkingView',
    setup() {
        const { t } = useLocale()
        const thinkingText = t('live.thinking')
        return () => {
            return <div class="relative flex items-center h-[100px]">
                <IconQuantumLogo class="text-[32px] animate-spin m-[15px]" />
                <div class="py-[10px]"
                    style={{
                        background: 'radial-gradient(50% 50% at 50% 50%, #457EF8 0%,#7950D3 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '500',
                        fontSize: '20px',
                        lineHeight: '26px',
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
            return <div class="px-[49px] rounded-[32px] min-h-[60px] h-[100px]">
                <div class="py-[16px] px-[28px] text-center"
                    style={{
                        fontSize: '20px',
                        lineHeight: '24px',
                        color: 'white',
                        fontWeight: '500',
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
        const textContainerRef = ref<HTMLDivElement | null>(null);
        const scrollToBottom = () => {
            if (textContainerRef.value) {
                textContainerRef.value.scrollTop = textContainerRef.value.scrollHeight;
            }
        };
        watch(() => props.displayText, () => {
            nextTick(() => {
                scrollToBottom();
            });
        });
        return () => {
            return (
                <div ref={textContainerRef} class='absolute z-200 flex-col justify-between' style={{ bottom: '0px' }}>
                    <div class="mx-[5px] my-[20px] px-[23px] text-center overflow-auto" style={{
                        fontSize: '20px',
                        fontWeight: '500',
                        lineHeight: '26px',
                        color: 'white',
                        maxHeight: '100px',
                        whiteSpace: 'normal',
                    }}>
                        {props.displayText}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '14px', marginTop: '13px', fontWeight: '400', color: 'white' }}>{t("chat.disclaimer")}</div>
                </div>
            );
        }
    },
})

