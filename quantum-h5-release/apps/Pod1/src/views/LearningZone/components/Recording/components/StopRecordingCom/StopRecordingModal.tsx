import { defineComponent } from "vue";
import "./StopRecordingModal.less";
import {  QButton } from '@libs/p-comps/volt/QButton';
import { useI18n } from 'vue-i18n';
export default defineComponent({
  name: "StopRecordingModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["confirm", "cancel"],
  setup(props, { emit }) {
    const handleConfirm = () => {
      emit("confirm");
    };

    const handleCancel = () => {
      emit("cancel");
    };
    const { t } = useI18n();

    return () => (
      <div class="stop-recording-modal" style={{ display: props.visible ? "block" : "none" }}>
        <div class="modal-mask"></div>
        <div class="modal-content">
          <h3 class="modal-title">{t("learningZone.stopRecordingModal.title")}</h3>
          <p class="modal-message">{t("learningZone.stopRecordingModal.message")}</p>
          <div class="modal-buttons">
            <QButton variant="outlined" onClick={handleCancel}>{t("learningZone.stopRecordingModal.cancel")}</QButton>
            <QButton color="primary" onClick={handleConfirm}>{t("learningZone.stopRecordingModal.confirm")}</QButton>
          </div>
        </div>
      </div>
    );
  },
});