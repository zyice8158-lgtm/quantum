import { defineComponent, computed } from 'vue';
import { payAttentionStore } from '@/store/payAttention';
import { extractContent } from '../../home/index';
import { useLocale } from '@/hooks/i18n';


const SummaryContent = defineComponent({
  name: 'SummaryContent',
  setup() {
    const { t } = useLocale();

    const safeSummaryText = computed(() => {
      const summaryText = payAttentionStore.payAttData.summary;
      return summaryText ? extractContent(summaryText) : t('payAttention.noSummaryAvailable');
    });

    return () => (
      <div
        class="text-body-m font-[400] mb-[16px] text-on-focus-container select-none leading-body-l"
        innerHTML={safeSummaryText.value}
      ></div>
    )
  }
})

export default SummaryContent;
