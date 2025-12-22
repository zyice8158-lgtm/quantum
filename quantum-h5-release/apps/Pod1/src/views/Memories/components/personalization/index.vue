<template>
  <!-- Personalization Bar -->
  <div
    class="campaignArea flex justify-between items-center w-full px-[16px] py-[12px] rounded-16 bg-surfaces-surface-blur-high"
    v-if="showPersonalizationBanner || showSyncBtn"
  >
    <div class="flex items-center">
      <IconCampaign class="text-[24px] mr-[16px]" />
      <span class="title text-[14px] font-bold leading-[20px] mr-[16px]">{{
        showSyncBtn ? t("FKB.syncBannerTitle") : t("FKB.unlockPermissions")
      }}</span>
      <span class="detail text-[14px] leading-[20px]">{{
        showSyncBtn ? t("FKB.syncBannerDetails") : t("FKB.unlockPermissionsDetails")
      }}</span>
    </div>
    <div class="flex items-center">
      <QButton v-if="showSyncBtn" color="primary" size="small" @click="startSync">{{
        t("FKB.syncBtn")
      }}</QButton>
      <QButton v-else color="primary" size="small" @click="permissionsChange">{{
        t("FKB.unlockPermissionsDialogAllowBtn")
      }}</QButton>
      <QButton
        variant="text"
        size="small"
        @click="
          showPersonalizationBanner = false;
          showSyncBtn = false;
        "
      >
        <template #icon>
          <IconClose class="text-[24px]" />
        </template>
      </QButton>
    </div>
  </div>
  <!-- Sync Data Bar -->
  <div
    class="w-full h-[111px] px-[12px] py-[16px] rounded-16 bg-surfaces-surface-blur-high flex justify-between items-center"
    v-if="showSyncBanner"
  >
    <div class="flex items-center w-full mr-[40px]">
      <img class="w-[60px] h-[60px] mx-[16px]" src="@/assets/img/memory/foreground.svg" alt="" />
      <div class="flex flex flex-col justify-center w-full">
        <span class="text-body-m leading-body-m text-text-on-surface mb-[16px]">{{
          t("FKB.syncDetails")
        }}</span>
        <div
          class="syncSlider-bg overflow-hidden relative w-full h-[4px] bg-surface-container-highest"
        >
          <div class="syncSlider absolute top-[0] left-[0] w-full h-[4px] bg-primary"></div>
        </div>
      </div>
    </div>
    <IconClose class="text-[24px] mr-[16px] cursor-pointer" @click="showSyncBanner = false" />
  </div>
  <!-- Sync Data Dialog -->
  <Dialog
    v-model:visible="showSyncDialog"
    :draggable="false"
    class="w-[832px] h-[416px] rounded-24 bg-surface bg-linear-to-r from-primary-container-hover from-50% to-50% to-transparent"
    modal
  >
    <template #header>
      <div></div>
    </template>
    <template #closebutton>
      <QButton variant="text" @click="showSyncDialog = false">
        <IconClose class="text-title-xl" />
      </QButton>
    </template>
    <template #default>
      <div class="w-full h-[396px] flex -mt-[54px] relative">
        <div class="w-[50%] h-full flex justify-center items-center">
          <img src="@/assets/img/memory/brain.svg" alt="" class="w-[216px]" />
        </div>
        <div class="w-[50%] p-[32px] flex flex-col justify-center items-center relative">
          <div class="flex flex-col">
            <div class="text-headline-m leading-headline-m text-text-on-surface font-bold mb-[8px]">
              <span>{{ t("FKB.syncDialogTitle") }}</span>
            </div>
            <div class="text-label-l leading-label-l text-text-on-surface">
              {{ t("FKB.syncDialogDetails") }}
            </div>
          </div>
        </div>
        <div class="absolute bottom-[16px] right-[20px] flex">
          <QButton class="mr-[8px]" variant="outlined" @click="showSyncDialog = false">{{
            t("FKB.syncDialogCancelBtn")
          }}</QButton>
          <QButton color="primary" @click="handleSync">{{ t("FKB.syncDialogStartBtn") }}</QButton>
        </div>
      </div>
    </template>
  </Dialog>
  <!-- Permission Dialog -->
  <Dialog
    v-model:visible="showUnlockDialog"
    :draggable="false"
    class="w-[832px] h-[416px] rounded-24 bg-surface bg-linear-to-r from-primary-container-hover from-50% to-50% to-transparent"
    modal
  >
    <template #header>
      <div></div>
    </template>
    <template #closebutton>
      <QButton variant="text" @click="handleMaybeLater" v-automation="'close_permission_dialog'">
        <IconClose class="text-title-xl" />
      </QButton>
    </template>
    <template #default>
      <div class="w-full h-[396px] flex -mt-[54px] relative">
        <div class="w-[50%] h-full flex justify-center items-center">
          <img src="@/assets/img/memory/brain.svg" alt="" class="w-[216px]" />
        </div>
        <div class="w-[50%] p-[32px] flex flex-col justify-center items-center relative">
          <div class="flex flex-col">
            <div class="text-headline-m leading-headline-m text-text-on-surface font-bold mb-[8px]">
              <span>{{ t("FKB.unlockPermissionsDialogTitle") }}</span>
            </div>
            <div class="text-label-l leading-label-l text-text-on-surface">
              {{ t("FKB.unlockPermissionsDialogDetails") }}
            </div>
          </div>
          <div class="absolute bottom-[16px] right-[20px] flex">
            <QButton
              class="mr-[8px]"
              variant="outlined"
              @click="handleMaybeLater"
              v-automation="'maybe_later_btn'"
              >{{ t("FKB.unlockPermissionsDialogCancelBtn") }}</QButton
            >
            <QButton
              color="primary"
              @click="handleUnlockPermissions()"
              v-automation="'allow_btn'"
              >{{ t("FKB.unlockPermissionsDialogAllowBtn") }}</QButton
            >
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { defineOptions, defineProps, ref, onMounted } from "vue";
import { QButton } from "@libs/p-comps/volt/QButton";
import Dialog from "@libs/p-comps/volt/Dialog.vue";
import { IconClose, IconCampaign } from "@quantum/icons";
import { useLocale } from "@/hooks/i18n";
import { setPreferences, getPreferences } from "@libs/service";
import "./index.less";

defineOptions({
  name: "Personalization",
});
const { t } = useLocale();

const emit = defineEmits(["maybeLater", "handleSync", "handleInit"]);

const props = defineProps({});

const personalizedContentEnabled = ref(false);
const synchronizationEnabled = ref(false);
const showUnlockDialog = ref(false);
const showSyncDialog = ref(false);
const showPersonalizationBanner = ref(false);
const showSyncBtn = ref(false);
const showSyncBanner = ref(false);
const getPersonalizationData = async () => {
  const res = await getPreferences({ Data: {} });
  personalizedContentEnabled.value = JSON.parse(
    res.data.Data.Text as string,
  ).prefs.personalizedContentEnabled;
  synchronizationEnabled.value = JSON.parse(
    res.data.Data.Text as string,
  ).prefs.synchronizationEnabled;
};
const setPersonalizationData = async (data: boolean) => {
  const res = await setPreferences({
    Data: {
      personalizedContentEnabled: data,
    },
  });
  if (JSON.parse(res.data.Data.Text as string).result === true) {
    personalizedContentEnabled.value = data;
    showPersonalizationBanner.value = false;
    emit("handleInit");
  }
};

const setSynchronizationData = async (data: boolean) => {
  const res = await setPreferences({
    Data: {
      synchronizationEnabled: data,
    },
  });
  if (JSON.parse(res.data.Data.Text as string).result === true) {
    synchronizationEnabled.value = data;
  }
};

const handleUnlockPermissions = () => {
  setPersonalizationData(true);
  showUnlockDialog.value = false;
  showPersonalizationBanner.value = false;
};

const permissionsChange = () => {
  setPersonalizationData(true);
};

const handleSync = () => {
  showSyncDialog.value = false;
  setSynchronizationData(true);
  // showSyncBtn.value = true;
  // emit("handleSync");
};
const startSync = () => {
  showSyncBanner.value = true;
  // setTimeout(() => {
  //   showSyncBanner.value = false;
  // }, 10000);
};

const handleMaybeLater = () => {
  showUnlockDialog.value = false;
  showPersonalizationBanner.value = true;
  emit("maybeLater");
};

onMounted(async () => {
  await getPersonalizationData();
  showUnlockDialog.value = !personalizedContentEnabled.value;
  showPersonalizationBanner.value = !personalizedContentEnabled.value;
  showSyncDialog.value = !synchronizationEnabled.value;
});
</script>
