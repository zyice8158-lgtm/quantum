import { defineComponent } from 'vue';
import { payAttentionStore } from '@/store/payAttention';
import { useLocale } from '@/hooks/i18n';
import './index.less';

const TranscriptContent = defineComponent({
  name: 'TranscriptContent',
  setup() {
    const { t } = useLocale();

    return () => {
      const transcript = payAttentionStore.payAttData.transcription?.trim();
      if (!transcript) {
        return <div class="transcript-content">{t('payAttention.noTranscriptAvailable')}</div>;
      }
      return <div class="transcript-content">{payAttentionStore.payAttData.transcription}</div>;
    };
  }
})

export default TranscriptContent;
