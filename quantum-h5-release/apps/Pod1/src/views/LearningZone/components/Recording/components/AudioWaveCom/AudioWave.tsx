import { defineComponent, ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import "./AudioWave.less";
import { setStopRecordingMethod, setRecordingMethod, setPauseRecord, setResumeRecord } from "@libs/service";
import StopRecordingModal from "../StopRecordingCom/StopRecordingModal";
import { QIcons } from "@libs/p-comps";
import { EventBus } from "@quantum/use";
import {  LzBankKind,Card } from "@/types/lz";
import { addToFavorites, removeToFavorites } from '@/store/lz';
import { useLocale } from "@/hooks/i18n";

export default defineComponent({
  name: "AudioWave",
  emits: ["toggleRotate"],
  setup(props, { emit }) {
    const { t } = useLocale();
    const values = ref<number[]>([]);
    const rotated = ref(false);
    const isRecording = ref(true); // 录音状态
    const isContinueRecording = ref(true); // 录音状态
    const continueRecording = ref(true);
    const showStopModal = ref(false); // 弹框显示状态
    const pendingPath = ref(""); // 待跳转路径
    const router = useRouter(); // 路由实例（用于跳转）
    const route = useRoute(); // 当前路由信息（用于获取路径）
    const originalPath = ref(route.path); // 保存原始路径
    const originalQuery = ref(route.query); // 保存原始查询参数（关键）
    const recordWaveSeconds = ref(0); // 录音秒数
    let timeWaves: number | undefined;
    let timeWaveCounter: number | undefined; // 时间计数器

    // 格式化时间为 00:00:00 格式
    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    };
    // 根据屏幕宽度获取对应的长度
    const getLengthByScreen = () => {
      return window.innerWidth < 1201 ? 40 : 60;
    };

    // 生成新的波形数组
    const generateValues = () => {
      const length = getLengthByScreen();
      values.value = Array.from({ length }, () => Math.random());
    };

    // 处理窗口尺寸变化
    const handleResize = () => {
      generateValues();
    };

    // 路由守卫：监听路由变化
    const handleRouteChange = (to: any, from: any, next: any) => {
      // 关键：isRecording为true时，阻止非法跳转
      if (isRecording.value && !to.path.includes('/quantum/learning-zone/chat')) {
        const newQuery = {
          ...from.query, // 继承原有所有查询参数
          isRecording: true // 确保isRecording参数存在且为true
        };
        router.push({
          path: from.path, // 保持在原始路径
          query: newQuery // 保留所有参数并确保isRecording存在
        });
        showStopModal.value = true;
        pendingPath.value = to.path;
        // 阻止默认导航（Vue Router守卫必须调用next，否则会卡住）
        next(false);
      } else {
        // isRecording为false时，正常放行，更新原始路径和参数
        originalPath.value = to.path;
        originalQuery.value = to.query;
        next(); // 正常跳转
      }
    };

    onMounted(() => {
      // 初始化数组长度（根据当前屏幕尺寸）
      generateValues();
      // 音频波形动画
      timeWaves = window.setInterval(() => {
        if (isRecording.value && isContinueRecording.value) { // 只有录音中才更新波形
          values.value = values.value.map(() => Math.random());
        }
      }, 400);

      // 初始化时间计数器
      timeWaveCounter = window.setInterval(() => {
        if (isRecording.value && isContinueRecording.value) {
          recordWaveSeconds.value++;
        }
      }, 1000);

      // 监听窗口尺寸变化
      window.addEventListener('resize', handleResize);
      // 监听路由变化
       router.beforeEach(handleRouteChange);
    });

    // 组件卸载时清理定时器、事件监听和路由守卫
    onUnmounted(() => {
      if (timeWaves) clearInterval(timeWaves);
      if (timeWaveCounter) clearInterval(timeWaveCounter);
      window.removeEventListener('resize', handleResize);
      // 移除路由守卫
      const removeGuard = router.beforeEach(() => true);
      removeGuard();
    });

    // 折叠按钮
    const toggleRotate = () => {
      rotated.value = !rotated.value;
      emit("toggleRotate", !rotated.value);
    };

    // 点击停止录音
    const toggleHalt = async () => {
      isRecording.value = !isRecording.value;
      try {
        const res = await setStopRecordingMethod({});
        console.log(`StopRecording success`, res.data.Data.SavePath);
        EventBus.emit('fromAudioWaveToGrandparent', res.data.Data.SavePath);
        console.log(originalQuery.value,'originalQuery-------------')
        const card: Card = {
          title:  t('learningZone.newRecording'),
          description: 'Redox-Driven Mineral and OrganicAssociations in Jezero Crater, Mars',
          createdDate: Date.now(),// mock，to delete
          type: LzBankKind.Record,
          chatId: 'chat-record-messages',
          chatMessageId: '22068ff4-e237-4b8a-af3e-799ca2699264',
        }
        addToFavorites(card);
      } catch (err) {
        console.error("StopRecording toggle error:", err);
        EventBus.emit('fromAudioWaveToGrandparent', { error: err });
      }
    };

    // 点击继续按钮
    const toggleResumeRecord = async () => {
      continueRecording.value = !continueRecording.value;
      isContinueRecording.value = !isContinueRecording.value;
      try {
        const res = await setResumeRecord({
          Data: {},
        });
        console.log(`ResumeRecord success`, res);
      } catch (err) {
        console.error("ResumeRecord toggle error:", err);
      }
    };

    // 开始录制新的录音
    const togglegoOnRecord = () => {
      isRecording.value = !isRecording.value;
      isContinueRecording.value = true;
      continueRecording.value = true;
      recordWaveSeconds.value = 0; // 重置计时
      try {
        const res = setRecordingMethod({
          Data: {},
        });
        console.log(`success`, res);
      } catch (err) {
        console.error("Record toggle error:", err);
      }
    };

    // 暂停按钮
    const togglePauseRecord = async () => {
      continueRecording.value = !continueRecording.value;
      isContinueRecording.value = !isContinueRecording.value;
      try {
        const res = await setPauseRecord({
          Data: {},
        });
        console.log(`PauseRecord success`, res);
      } catch (err) {
        console.error("PauseRecord toggle error:", err);
      }
    };

    // 处理确认离开
    const handleConfirmLeave = () => {
      toggleHalt(); // 先停止录音
      showStopModal.value = false;
      if (pendingPath.value) {
        router.push(pendingPath.value); // 跳转到目标路径
        originalPath.value = pendingPath.value; // 更新原始路径
        pendingPath.value = "";
      }
    };

    // 处理取消离开
    const handleCancelLeave = () => {
      showStopModal.value = false;
      pendingPath.value = "";
      // 确保留在原始路径
      if (route.path !== originalPath.value) {
        router.push(originalPath.value);
      }
    };

    return () => (
      <div class="audio-wave flex items-center">
        <StopRecordingModal
          visible={showStopModal.value}
          onConfirm={handleConfirmLeave}
          onCancel={handleCancelLeave}
        />
        <div class="aw-left">
          <QIcons name="recordingIcon" size={30}></QIcons>
        </div>
        <div class="aw-center">
          {values.value.map((v, i) => {
            const h = 6 + (30 - 6) * v;
            return (
              <div key={i} class="aw-bar" style={{ height: `${h}px` }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={toggleRotate}>
          <span style={{ fontSize: '12px', color: '#000' }}>{formatTime(recordWaveSeconds.value)}</span>
          {!rotated.value ? (
            <QIcons name="recordingRotateContent" size={24}></QIcons>
          ) : (
            <QIcons name="recordingRotate" size={24}></QIcons>
          )}
        </div>
        {isRecording.value ? (
          <div class="aw-right-record">
            <div class="aw-right-continue">
              {continueRecording.value ? (
                <QIcons name="recordingContinue" size={24} onClick={togglePauseRecord}></QIcons>
              ) : (
                <QIcons name="recordingPlay" size={24} onClick={toggleResumeRecord}></QIcons>
              )}
            </div>
            <div class="aw-right-halt" onClick={toggleHalt}>
              <QIcons name="recordingHalt" size={24}></QIcons>
            </div>
          </div>
        ) : (
          <div class="aw-right-stop">
            <div class="aw-icon-go-on" onClick={togglegoOnRecord}>
              <QIcons name="recordingGoOn" size={24}></QIcons>
            </div>
            <div class="aw-right-save">
              <QIcons name="recordingSave" size={24}></QIcons>
            </div>
          </div>
        )}
      </div>
    );
  },
});
