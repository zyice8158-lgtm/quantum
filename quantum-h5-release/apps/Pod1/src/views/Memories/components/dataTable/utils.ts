import { setPayAttentionStore, stopRecording } from "@/store/payAttention";
import { showMeetingRecord } from "@libs/service";
import { openQuantumBarWin } from "@/store/window";
import i18n from "@/i18n";

interface ConfirmOptions {
  message: string;
  header: string;
  acceptProps: {
    label: string;
    severity: string;
    outlined: boolean;
  };
  rejectProps: {
    label: string;
    severity: string;
    unstyled: boolean;
  };
  accept: () => void | Promise<void>;
  customWidth?: number;
}

export interface ConfirmServiceMethods {
  require: (options: ConfirmOptions) => void;
}

interface ToastService {
  add: (options: {
    severity: string;
    detail: string;
    life: number;
  }) => void;
}

const stopRecordingAndOpenMeeting = async (fileName: string, toast: ToastService) => {
  await setPayAttentionStore('shouldStopMockMode', true);
  await stopRecording();
  openMeetingRecord(fileName, toast);
};

const openMeetingRecord = async (fileName: string, toast: ToastService) => {
  const t = (i18n.global as any).t;
  const res = await showMeetingRecord({
    Data: fileName,
    MessageSource: "windowRecord1",
  });

  if(res.data?.ErrorCode) {
    toast.add({
      severity: "error",
      detail: t("FKB.payAttention.getInfoError"),
      life: 3000,
    });
    return;
  }
  openQuantumBarWin("#/prompt-bar");
};

/**
 * @param fileName
 * @param isRecording
 * @param confirm
 * @param toast
 */
export const handlePayAttentionRowClick = async (
  fileName: string,
  isRecording: boolean,
  confirm: ConfirmServiceMethods,
  toast: ToastService
) => {
  const t = (i18n.global as any).t;

  if (isRecording) {
    confirm.require({
      message: t("FKB.recordingStopConfirm.message"),
      header: t("FKB.recordingStopConfirm.header"),
      acceptProps: {
        label: t("FKB.recordingStopConfirm.stopRecording"),
        severity: "",
        outlined: false,
      },
      rejectProps: {
        label: t("FKB.recordingStopConfirm.cancel"),
        severity: "secondary",
        unstyled: true,
      },
      accept: async () => {
        await stopRecordingAndOpenMeeting(fileName, toast);
      },
      customWidth: 448,
    });
  } else {
    await openMeetingRecord(fileName, toast);
  }
};

