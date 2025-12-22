import {
    checkASRExists,
    checkTTSExists,
    changeASRLocale,
    changeTTSLocale,
    WebviewMessager,
    generateMessageId,
} from '@libs/service';
import { useObjStorage } from "@quantum/use";

export interface ModelValidationResult {
    asrSuccess: boolean;
    ttsSuccess: boolean;
    needsDownload: boolean;
}

export interface DownloadProgress {
    asrProgress: number;
    ttsProgress: number;
}

// Check if model exists
export async function checkModelExists(modelType: 'asr' | 'tts', locale: string): Promise<boolean> {
    try {
        if (modelType === 'asr') {
            const { data: { Data: { IsExists } } } = await checkASRExists({ Data: { Locale: locale } });
            return IsExists;
        } else {
            const { data: { Data: { IsExists } } } = await checkTTSExists({ Data: { Locale: locale } });
            return IsExists;
        }
    } catch (error) {
        console.error(`Error checking ${modelType} model existence:`, error);
        return false;
    }
}

// Change model locale
export async function changeModelLocale(modelType: 'asr' | 'tts', locale: string): Promise<boolean> {
    try {
        if (modelType === 'asr') {
            const { data: { Data: { IsSuccess } } } = await changeASRLocale({ Data: { Locale: locale } });
            return IsSuccess;
        } else {
            const { data: { Data: { IsSuccess } } } = await changeTTSLocale({ Data: { Locale: locale } });
            return IsSuccess;
        }
    } catch (error) {
        console.error(`Error changing ${modelType} locale:`, error);
        return false;
    }
}

// Download model
export function downloadModel(
    modelType: 'asr' | 'tts',
    locale: string,
    handlers: {
        onProgress: (modelType: 'asr' | 'tts', progress: number) => void,
        onDone: (modelType: 'asr' | 'tts') => void,
        onError: (modelType: 'asr' | 'tts', error: Error) => void
    },
) {
    const messageId = generateMessageId();
    const storage = useObjStorage(`settingsDownload${modelType.toUpperCase()}MessageId`);
    storage.set(`MessageId`, messageId);
    let lastProgress = 0;

    WebviewMessager.sendStreamMessage(
        {
            Direction: 0,
            MessageId: messageId,
            MessageSource: '',
            MessageDestination: '',
            MessageMethod: modelType === 'asr' ? 'DownloadSTT' : 'DownloadTTS',
            Data: { locale },
        },
        {
            onData: (data) => {
                try {
                    const res = JSON.parse(data as string);
                    if (res.status === 'update_progress') {
                        const text = JSON.parse(res.data.text);
                        if (text.progress >= lastProgress) {
                            lastProgress = text.progress;
                            handlers.onProgress(modelType, text.progress);
                        }
                    } else if (res.status === 'complete') {
                        handlers.onDone(modelType);
                    } else if (res.status === 'failed') {
                        handlers.onError(modelType, new Error(`${modelType.toUpperCase()} download failed`));
                    }
                } catch (parseError) {
                    console.error("Error parsing download response:", parseError);
                    handlers.onError(modelType, parseError);
                }
            },
            onDone: () => handlers.onDone(modelType),
            onError: (err: Error) => {
                console.error(`${modelType.toUpperCase()} download error:`, err);
                handlers.onError(modelType, err);
            }
        }
    );
}

// Setup download listener
function setupDownloadListener(
    modelType: 'asr' | 'tts',
    messageId: string,
    onProgress: (modelType: 'asr' | 'tts', progress: number) => void,
    onDone: (modelType: 'asr' | 'tts') => void,
    onError: (modelType: 'asr' | 'tts', error: Error) => void
): void {
    let lastProgress = 0;
    WebviewMessager.on(messageId, (result) => {
        const { ErrorCode, Data, data } = result;
        if (ErrorCode && ErrorCode !== 0) {
            onDone(modelType);
            return;
        }

        const { Chunk, IsDone } = Data || data || {};
        const res = JSON.parse(Chunk as string);

        if (res.status === 'update_progress') {
            const text = JSON.parse(res.data.text);
            if (text.progress >= lastProgress) {
                lastProgress = text.progress;
                onProgress(modelType, text.progress);
            }
        } else if (res.status === 'complete') {
            onDone(modelType);
        } else if (res.status === 'failed') {
            onError(modelType, new Error(`${modelType.toUpperCase()} download failed`));
        }
    });
}

// Initialize download listeners
export async function initializeDownloadListeners(
    handlers: {
        onProgress: (modelType: 'asr' | 'tts', progress: number) => void,
        onDone: (modelType: 'asr' | 'tts') => void,
        onError: (modelType: 'asr' | 'tts', error: Error) => void
    }

) {
    try {
        // Initialize ASR download listener
        const asrStorage = useObjStorage('settingsDownloadASRMessageId');
        const asrMessageId = await asrStorage.get('MessageId');
        if (asrMessageId) {
            setupDownloadListener('asr', asrMessageId as string, handlers.onProgress, handlers.onDone, handlers.onError);
        }

        // Initialize TTS download listener
        const ttsStorage = useObjStorage('settingsDownloadTTSMessageId');
        const ttsMessageId = await ttsStorage.get('MessageId');
        if (ttsMessageId) {
            setupDownloadListener('tts', ttsMessageId as string, handlers.onProgress, handlers.onDone, handlers.onError);
        }
    } catch (error) {
        console.error("Error initializing download listeners:", error);
    }
}