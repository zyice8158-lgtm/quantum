import { defineComponent } from "vue";
import "../style.less";
import { IconFileArea } from "@quantum/icons";
import { useI18n } from "vue-i18n";

export const FileArea = defineComponent({
  name: "FileArea",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t } = useI18n();
    return () => {
      if (!props.visible) return null;

      return (
        <div class="file-area-overlay inset-0 flex items-center justify-center overflow-hidden">
          <div class="file-area-card relative flex h-[450px] w-[450px] items-center justify-center rounded-[32px] border-2 border-dashed">
            <div class="relative flex h-full w-full flex-col items-center justify-center gap-[16px]">
              <IconFileArea />

              <div class="text-center text-(length:--text-headline-l) font-[700] text-[color:var(--color-on-primary)]">
                {t('fileArea.dragDropFiles')}
              </div>

              <div class="text-center text-(length:--text-title-l) text-[color:var(--color-on-primary)]">
                {t('fileArea.toSaveIntoLenovoQira')}
              </div>
            </div>
          </div>
        </div>
      );
    };
  },
});

