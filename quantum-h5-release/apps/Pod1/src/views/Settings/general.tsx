import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useLocale } from '@/hooks/i18n'
import SearchHeader from './comps/SearchHeader'
import Card from './comps/Card';
import { IconAccount, IconDevices, IconEarth, IconMic, IconRecord } from '@quantum/icons';
import SettingItem from './comps/SettingItem';
import RadioButton from '@libs/p-comps/volt/RadioButton.vue';

import Select from '@libs/p-comps/volt/Select.vue';
import { SettingStore } from '@/store/settings';
import ProgressBar from "@libs/p-comps/volt/ProgressBar.vue";
import { useToast } from 'primevue/usetoast';
import { useLanguageList } from "@/types/Language";
import { checkModelExists, changeModelLocale, downloadModel, initializeDownloadListeners } from './languageModelService';
import { initASR, initTTS } from '@libs/service';

export default defineComponent({
    name: 'General',
    setup() {
        const { t, locale } = useLocale()
        const languageOptions = computed(() => {
            return useLanguageList().map(item => ({
                name: item.name,
                code: item.key
            }));
        });

        const displayData = computed(() => {
            return {
                language: {
                    title: t('settings.general.language'),
                    subTitle: t('settings.general.languageSubTitle'),

                },
                Recordings: {
                    title: t('settings.general.recordings'),
                    subTitle: t('settings.general.recordingsSubTitle'),
                    saveAllRecordingsToNotes: t('settings.general.saveAllRecordingsToNotes'),
                },
                launchOptions: {
                    title: t('settings.general.launchOptions'),
                    subTitle: t('settings.general.recordingsSubTitle'),
                    floatingBubble: t('settings.general.floatingBubble'),
                    gloatingBubbleSubTitle: t('settings.general.gloatingBubbleSubTitle'),
                    AIKey: t('settings.general.AIKey'),
                    AIKeySubTitle: t('settings.general.AIKeySubTitle'),
                    wakeWord: t('settings.general.wakeWord'),
                    wakeWordSubTitle: t('settings.general.wakeWordSubTitle'),
                },
                voiceOptions: {
                    title: t('settings.general.voiceOptions'),
                    subTitle: t('settings.general.VoiceOptionsSubTitle'),
                    voiceOptions: t('settings.general.voiceOptions'),
                    voiceTone: t('settings.general.voiceTone'),
                    voiceToneFemale: t('settings.general.voiceToneFemale'),
                    voiceToneMale: t('settings.general.voiceToneMale'),
                    interactionMode: t('settings.general.interactionMode'),
                    interactionModeSubTitle: t('settings.general.saveAllRecordingsToNotes'),
                    interactionModeReadout: t('settings.general.interactionModeReadout'),
                    interactionModeNoReadout: t('settings.general.interactionModeNoReadout'),
                    interactionModeReadoutSubTitle: t('settings.general.interactionModeReadoutSubTitle'),
                    interactionModeNoReadoutSubtile: t('settings.general.interactionModeNoReadoutSubtile'),
                },
            }
        })

        const hClass = 'text-[16px] font-bold'
        const subHClass = 'text-[12px] text-text-sub '
        console.log('displayData--------------------:', SettingStore.generalData.interactionMode)
        const tempSelectedLanguage = ref(SettingStore.generalData.language);
        const toast = useToast();
        const downloadState = reactive({
            asr: {
                progress: 0,
                isDownloading: false,
                message: ''
            },
            tts: {
                progress: 0,
                isDownloading: false,
                message: ''
            }
        });
        const showSuccessToast = (msg: string) => {
            toast.add({  detail: msg, life: 3000 });
        };

        const showInfoToast = (msg: string) => {
            toast.add({  detail: msg, life: 3000 });
        };
        const showErrorToast = (msg: string) => {
            toast.add({  detail: msg, life: 3000 });
        };

        const isAnyDownloading = computed(() => {
            return downloadState.asr.isDownloading || downloadState.tts.isDownloading;
        });
        const resetDownloadState = () => {
            downloadState.asr.isDownloading = false;
            downloadState.tts.isDownloading = false;
            downloadState.asr.progress = 0;
            downloadState.tts.progress = 0;
        };
         const handlers = {
            onProgress: (modelType: 'asr' | 'tts', progress: number) => {
                if (modelType === 'asr') {
                    downloadState.asr.isDownloading = true;
                    downloadState.asr.progress = progress;
                } else if (modelType === 'tts') {
                    downloadState.tts.isDownloading = true;
                    downloadState.tts.progress = progress;
                }
            },
            onDone: (modelType: 'asr' | 'tts') => {
                if (modelType === 'asr') {
                    downloadState.asr.isDownloading = false;
                }

                if (modelType === 'tts') {
                    downloadState.tts.isDownloading = false;
                }
            },
            onError: (modelType: 'asr' | 'tts', error: Error) => {
                if (modelType === 'asr') {
                    showErrorToast("Failed to download ASR model, please try again later");
                    downloadState.asr.isDownloading = false;
                }
                if (modelType === 'tts') {
                    showErrorToast("Failed to download TTS model, please try again later");
                    downloadState.tts.isDownloading = false;
                }
            }
        };
        const handleLanguageChange = async (val: string) => {
            console.log("handleLanguageChange", val);

            if (isAnyDownloading.value) {
                showErrorToast("Please wait for the current download to complete before changing language");
                return;
            }

            const previousValue = tempSelectedLanguage.value;
            tempSelectedLanguage.value = val;

            try {
                // Set initial downloading states
                resetDownloadState();

                const [asrExists, ttsExists] = await Promise.all([
                    checkModelExists('asr', val),
                    checkModelExists('tts', val)
                ]);

                // If both models exist, change locales directly
                if (asrExists && ttsExists) {
                    const [asrSuccess, ttsSuccess] = await Promise.all([
                        changeModelLocale('asr', val),
                        changeModelLocale('tts', val)
                    ]);

                    if (asrSuccess && ttsSuccess) {
                        SettingStore.generalData.language = val;
                        showSuccessToast("Language changed successfully");
                        initASR();
                        initTTS();
                    } else {
                        showErrorToast("Failed to change language");
                        tempSelectedLanguage.value = previousValue;
                    }
                } else {
                    showInfoToast("Models need to be downloaded. Please try changing language again.");
                    tempSelectedLanguage.value = previousValue;

                    // Alternative approach - truly sequential with better error handling
                    if (!asrExists) {
                        downloadState.asr.isDownloading = true;
                        downloadModel('asr', val, {
                            ...handlers,
                            onDone: (modelType) => {
                                handlers.onDone(modelType);
                                // After ASR download completes, start TTS download if needed
                                if (!ttsExists && modelType === 'asr') {
                                    downloadModel('tts', val, handlers);
                                }
                            },
                            onError: (modelType, error) => {
                                handlers.onError(modelType, error);
                                // Even if ASR fails, try TTS if needed
                                if (!ttsExists && modelType === 'asr') {
                                    downloadModel('tts', val, handlers);
                                }
                            }
                        });
                    } else if (!ttsExists) {
                        downloadState.tts.isDownloading = true;
                        downloadModel('tts', val, handlers);
                    }
                }

            } catch (error) {
                // Reset downloading states on error
                resetDownloadState();
                tempSelectedLanguage.value = previousValue;
                console.error("Language change error:", error);
                showErrorToast("Failed to change language");
            }
        };
       
        onMounted(() => {
            initializeDownloadListeners(handlers)
        });

        return () => (
            <div class='overflow-auto' >
                <Card id='language' title={displayData.value.language.title} subTitle={displayData.value.language.subTitle} class='mb-[24px]' icon={IconEarth}>
                    <Select class='w-[50%]' modelValue={tempSelectedLanguage.value} options={languageOptions.value} optionLabel="name" optionValue="code" disabled={isAnyDownloading.value} onUpdate:modelValue={handleLanguageChange}> </Select>
                    {downloadState.asr.isDownloading && (
                        <div class='flex items-center  w-[100%] mt-[10px]' key={`asr-progress-${downloadState.asr.progress}`}>
                            <div class="text-[14px] w-[180px]">Downloading ASR Models:</div>
                            <div class="flex-grow ml-[10px]">
                                <ProgressBar value={downloadState.asr.progress} showValue={false} key={`asr-progress-${downloadState.asr.progress}`} />
                            </div>
                        </div>
                    )}
                    {downloadState.tts.isDownloading && (
                        <div class='flex items-center justify-between w-[100%] mt-[10px]'>
                            <div class="text-[14px] w-[180px]">Downloading TTS Models:</div>
                            <div class="flex-grow ml-[10px]">
                                <ProgressBar value={downloadState.tts.progress} showValue={false} />
                            </div>
                        </div>
                    )}

                </Card>


                {/* <Card id='recordings' title={displayData.value.Recordings.title} subTitle={displayData.value.Recordings.subTitle} icon={IconRecord} class='mb-[24px]'>

                    <SettingItem title={displayData.value.Recordings.saveAllRecordingsToNotes}   v-model:val={SettingStore.generalData.saveAllRecordingsToNotes} />
               </Card> */}
                {/* <Card id='launchOptions'  title={displayData.value.launchOptions.title} subTitle={displayData.value.launchOptions.subTitle} icon={IconRecord} class='mb-[24px]'>

                    <SettingItem title={displayData.value.launchOptions.floatingBubble} subTitle={displayData.value.launchOptions.gloatingBubbleSubTitle}   v-model:val={SettingStore.generalData.floatingBubble} />
                    <SettingItem title={displayData.value.launchOptions.AIKey} subTitle={displayData.value.launchOptions.AIKeySubTitle}   v-model:val={SettingStore.generalData.AIKey} />
                    <SettingItem title={displayData.value.launchOptions.wakeWord} subTitle={displayData.value.launchOptions.wakeWordSubTitle}   v-model:val={SettingStore.generalData.wakeWord} />
               </Card> */}
                <Card id='voiceOptions' title={displayData.value.voiceOptions.title} icon={IconMic} class='mb-[24px]'>

                    {/* <SettingItem title={displayData.value.voiceOptions.voiceOptions} isColumn={true} >

                        <div>
                            <div class="flex items-center h-[48px] p-[24px]">
                                <RadioButton v-model={SettingStore.generalData.voiceTone} value="Quinn" class='mr-[24px]' />
                                <div class="font-bold">
                                    {displayData.value.voiceOptions.voiceToneFemale}
                                </div>
                            </div>
                            <div class="flex items-center h-[48px] p-[24px]">
                                <RadioButton v-model={SettingStore.generalData.voiceTone} value="Charlie" class='mr-[24px]' />
                                <div class="font-bold">
                                    {displayData.value.voiceOptions.voiceToneMale}
                                </div>
                            </div>

                        </div>
                    </SettingItem> */}
                    <SettingItem title={displayData.value.voiceOptions.interactionMode} subTitle={displayData.value.voiceOptions.interactionModeSubTitle} isColumn={true} >
                        <div>
                            <div class="flex items-center h-[48px] p-[24px]">
                                <RadioButton aria-label={displayData.value.voiceOptions.interactionModeReadout} v-model={SettingStore.generalData.interactionMode} value={true} class='mr-[24px]' />
                                <div>

                                    <div class={hClass}>
                                        {displayData.value.voiceOptions.interactionModeReadout}
                                    </div>
                                    <div class={subHClass}>
                                        {displayData.value.voiceOptions.interactionModeReadoutSubTitle}
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center h-[48px] p-[24px]">
                                <RadioButton aria-label={displayData.value.voiceOptions.interactionModeNoReadout} v-model={SettingStore.generalData.interactionMode} value={false} class='mr-[24px]' />
                                <div>

                                    <div class={hClass}>
                                        {displayData.value.voiceOptions.interactionModeNoReadout}
                                    </div>
                                    <div class={subHClass}>
                                        {displayData.value.voiceOptions.interactionModeNoReadoutSubtile}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SettingItem>
                </Card>
            </div>
        );
    }
});
