<template>
  <!-- :style="collapseBox?'':'margin-top:316px;'" -->
  <div class="azureSpeechWrap">
    <div class="azureSpeech">
      <div v-if="collapseBox">
        <div class="azureSpeech_content" v-if="!isRecordShow">
          <div class="azureSpeech_box">
            <!-- <SvgIcon class="speech_icon" name="Icon"  /> -->
            <SvgIcon class="speech_icon" name="iconLogo" />
            press record button to start
          </div>
        </div>
        <div v-if="isRecordShow"> <SvgIcon class="azureSpeechRespons"  name="attentionIcon" /></div>
        <div class="azureSpeech_info" v-if="isRecordShow">
          <div class="segments-list" ref="transcriptRef" @scroll="handleScroll">
            <div
              v-for="(segment, index) in clusteredSegments"
              :key="index"
              class="segment"
            >
              <div class="segment-header">
                <div class="speaker-badge">
                  <SvgIcon
                    class="speakers1_icon"
                    v-if="
                      Istranscription == false
                        ? segment.speakerId == 1
                        : segment.speaker == '1'
                    "
                    name="speakers"
                  />
                  <SvgIcon
                    class="speakers1_icon"
                    v-if="
                      Istranscription == false
                        ? segment.speakerId == 2
                        : segment.speaker == '2'
                    "
                    name="speakers02"
                  />
                  <SvgIcon
                    class="speakers1_icon"
                    v-if="
                      Istranscription == false
                        ? segment.speakerId == 3
                        : segment.speaker == '3'
                    "
                    name="speakers3"
                  />
                  Speaker
                </div>
                <span class="timestamp">{{ formatTime(segment.offset) }}</span>
              </div>
              <div class="segment-content">
                {{ segment.text }}
              </div>
            </div>
            <div v-if="interimTranscript" class="interim-segment">
              [recognizing... {{ interimTranscript }}]
            </div>
          </div>
        </div>
      </div>
      <div class="speechBtn">
        <div class="drag_indicator">
          <SvgIcon class="drag_indicator_icon" name="DragHandle" />
          <SvgIcon class="close_icon" name="Close" @click="handleClose" />
          <SvgIcon class="collapse_icon" v-if="!isRecordShow" name="Expand" />
          <SvgIcon
            class="collapse_icon"
            v-if="collapseBox && isRecordShow"
            name="Collapse"
            @click="collapseConvers"
          />
          <SvgIcon
            class="collapse_icon"
            v-else-if="!collapseBox && isRecordShow"
            name="Expand"
            @click="collapseConvers"
          />
          <!-- isRecordShow -->
        </div>
        <!-- conversation -->
        <div v-if="!receiveData">
          <div v-if="summaryVal" class="summaryProcess">
            <SvgIcon class="process_icon" name="process" />
            <div class="css-gradient-loader"></div>
          </div>
          <div
            class="action_indicator"
            v-else-if="!summaryVal && !suggestionsVal"
          >
            <div class="record_time">{{ formatRecordTime(recordTime) }}</div>
            <!-- Start/Pause/Resume/Stop buttons -->
            <template v-if="!isListening && !isPaused">
              <SvgIcon class="notrecording_icon" name="Pause2" />
              <SvgIcon
                class="record_icon"
                name="Start"
                @click="startRecognition"
              />
            </template>
            <template v-else>
              <div class="button-group">
                <SvgIcon
                  class="notrecording_icon"
                  v-if="!isPaused"
                  name="Pause1"
                  @click="pauseRecognition"
                />
                <SvgIcon
                  class="notrecording_icon"
                  v-else
                  name="Start"
                  @click="resumeRecognition"
                />
                <SvgIcon
                  class="record_icon stop-icon"
                  name="stopButton1"
                  @click="stopRecognition"
                />
              </div>
            </template>
          </div>
          <div v-if="suggestionsVal">
            <SvgIcon class="new_icon" name="newBtn" @click="newAttention" />
          </div>
        </div>
        <!-- mock -->
        <div v-else>
          <div v-if="summaryMockVal" class="summaryProcess">
            <SvgIcon class="process_icon" name="process" />
            <div class="css-gradient-loader"></div>
          </div>
          <div
            class="action_indicator"
            v-else-if="!summaryMockVal && !suggestionsMockVal"
          >
            <div :class="isMockListening && !pausedMock?'record_time':'record_pausetime'">{{ formatRecordTime(recordTime) }}</div>
            <template v-if="!isMockListening && !pausedMock">
              <SvgIcon class="notrecording_icon" name="Pause2" /> 
              <SvgIcon 
                class="record_icon" 
                name="Start" 
                @click="startMockData"  
              />
            </template>
            <template v-else>
              <SvgIcon
                class="notrecording_icon"
                v-if="!pausedMock"
                name="Pause1"
                @click="pauseToggleMockMode"
              />
              <SvgIcon
                class="notrecording_icon"
                v-else
                name="Start"
                @click="resumeToggleMockMode"
              />
              <SvgIcon
                class="record_icon"
                name="stopButton1"
                @click="stopToggleMockMode"
              />
            </template>
          </div>
          <div v-if="suggestionsMockVal">
            <SvgIcon class="new_icon" name="newBtn" @click="newMockAttention" />
          </div>
        </div>
        <!-- Suggestionschip -->
      </div>
    </div>
  </div>
  <SvgIcon
    v-if="summarizeBtn || summarizeMockBtn"
    class="suggestion_icon"
    name="Suggestionschip"
    @click="handleSuggestions"
  />
  <!-- <SvgIcon v-if="suggestionsVal||suggestionsMockVal" class="suggestion_icon" name="Suggestionschip" @click="handleSuggestions" /> -->
  <!-- <button @click="changeTranscription">
      {{ Istranscription ? '流式c++' : '本地Sdk' }}
  </button> -->
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, nextTick } from "vue";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import SvgIcon from "@/components/SvgIcon";
import {
  setRecordMethod,
  //   setTranscription,
  setCloseRecord,
  setSummaryAction,
  sendSummaryRes,
  WebviewMessager,
} from "@libs/service";

/** 语音分段原始结构 */
interface TranscriptionSegment {
  text: string;
  offset: number; // 秒
  duration: number; // 秒
  speaker?: string; // SDK 原始 speakerId
}

/** 聚类后分段结构 */
interface ClusteredSegment extends TranscriptionSegment {
  speakerId: number;
  clusterId: number;
}

/** 带 speakerId 的 SDK 识别结果 */
interface ResultWithSpeaker extends speechsdk.SpeechRecognitionResult {
  speakerId: string;
}

/** c++ 传递的语音内容 */
// interface getMockSentence {
//   role: string;
//   msg: string;
//   speakerStartTime: number;
//   isFinal: boolean;
// }
// 电话Btn
const Istranscription = ref(true);
const receiveData = ref(true);

const summarizeMockBtn = ref(false);
const summarizeBtn = ref(false);
const suggestionsMockVal = ref(false);
const summaryMockVal = ref(false);
const pausedMock = ref(false);
const isMockListening = ref(false);
const summaryVal = ref(false);
const suggestionsVal = ref(false);
const recordBoolean = ref(false);
const isRecordShow = ref(false);
const autoScroll = ref(true);
const isListening = ref(false);
const isPaused = ref(false);
const interimTranscript = ref("");
const error = ref<string | null>(null);
const rawSegments = ref<TranscriptionSegment[]>([]);
const silenceThreshold = ref(1.5); // 静音阈值(秒)
let recordTimer: number | null = null;
const recordTime = ref(0);
const recognizer = ref<speechsdk.SpeechRecognizer | null>(null);
const transcriptRef = ref<HTMLDivElement | null>(null);
const collapseBox = ref(true);

const clusteredSegments = computed(() =>
  clusterSegments(rawSegments.value, silenceThreshold.value)
);

const downloadFliePod = async (data: ClusteredSegment[]) => {
  const content = data.map((item) => item.text).join("");
  // const title = "POD";
  console.log(content, "-----downloadFliePod content------");
  // TODO: 导出 Word 文件逻辑
};

// 获取转录类型
// const changeTranscription = async () => {
//   try {
//     const transcripRes = await setTranscription({
//       MessageSource: "window1",
//       Data: {},
//     });
//     console.log(transcripRes, "---transcripRes h5 To C#---");
//     Istranscription.value = transcripRes.checkSCWindowActive;
//     if (Istranscription.value) {
//       // 流式c++
//       receiveData.value = true;
//       resetRecordTimer();
//       collapseBox.value = true;
//       isRecordShow.value = false;
//       suggestionsMockVal.value = false;
//     } else {
//       // 本地Sdk
//       receiveData.value = false;
//     }
//   } catch (err) {
//     console.log(err, "---err transcriptionAbility---");
//   }
//   // Istranscription.value=!Istranscription.value;
// };
// 关闭
const handleClose = async () => {
  // h5 To C#
  try {
    const closeRes = await setCloseRecord({
      MessageSource: "window1",
      Data: {}, // "StartRecord"、"StopRecord"、"PauseRecord"、"ResumeRecord"
    });
    console.log(closeRes, "---closeRes Record h5 To C#---");
  } catch (err) {
    console.log(err, "---err closeRes---");
  }
};
// 总结
const handleSuggestions = async () => {
  summarizeBtn.value = false;
  summarizeMockBtn.value = false;
  const sendRes = await sendSummaryRes({
    MessageSource: "window1",
    Data: {}, // "StartRecord"、"StopRecord"、"PauseRecord"、"ResumeRecord"
  });
  console.log(sendRes, "----------sendRes suggestions---------");
};
// 收起
const collapseConvers = () => {
  collapseBox.value = !collapseBox.value;
};
// newConversation
const newAttention = () => {
  // summaryVal.value=!summaryVal.value;
  clearText();
  collapseBox.value = true;
  isRecordShow.value = !isRecordShow.value;
  suggestionsVal.value = !suggestionsVal.value;
};
const newMockAttention = () => {
  resetRecordTimer();
  clearText();
  pausedMock.value = false;
  isMockListening.value = false;
  collapseBox.value = true;
  isRecordShow.value = !isRecordShow.value;
  suggestionsMockVal.value = !suggestionsMockVal.value;
  summarizeMockBtn.value = false;
};
// 添加Mock数据相关变量
const isMockMode = ref(false);
let mockInterval: number | null = null;
// const mockSentences = ref<getMockSentence[]>([]);

// mock开始
// const mockIndex = ref(0); // 使用ref来跟踪当前mock数据的索引
// const lastOffset = ref(0); // 使用ref来跟踪最后的offset
const startMockData = async () => {
  console.log(Istranscription.value, "c#");
  if (!Istranscription.value) {
    return;
  }
  // h5 To C#
  try {
    const startRes = await setRecordMethod(
      {
        MessageSource: "window1",
        Data: {}, // "StartRecord"、"StopRecord"、"PauseRecord"、"ResumeRecord"
      },
      "StartRecord"
    );
    console.log(startRes, "---startRes Record h5 To C#---");
    // 初始化状态
    isMockMode.value = true;
    isRecordShow.value = true;
    autoScroll.value = true;
    isMockListening.value = true;
    pausedMock.value = false;
    startRecordTimer();
  } catch (err) {
    console.log(err, "---err startRes Record---");
  }
};
// 定义流式数据处理器
const handleStreamingTranscription = () => {
  WebviewMessager.on("client.h5.transcription", (data) => {
    console.log(data, "client.h5.transcription");

    if (!data.Data || !data.Data?.msg) return;

    // 处理中间结果（流式逐字显示）
    if (data.Data.isFinal === false) {
      interimTranscript.value = data.Data.msg as string;
      scrollToBottom();
      return;
    }

    // 处理最终结果
    interimTranscript.value = "";

    // 创建新的语音片段
    const newSegment: TranscriptionSegment = {
      text: data.Data.msg as string,
      offset: recordTime.value,
      duration: 2, // 默认持续时间，可根据实际情况调整
      speaker: (data.Data.role as string).replace("Speaker", ""), // 将 "speaker1" 转换为 "1"
    };

    // 添加到原始片段数组
    rawSegments.value.push(newSegment);
    console.log(rawSegments.value, "-----c++ rawSegments.value-------");
    // 自动滚动到底部
    scrollToBottom();

    // mockSentences.value.push({
    //   role: data.Data.role,
    //   msg: data.Data.msg,
    //   speakerStartTime: data.Data.speakerStartTime,
    //   isFinal: data.Data.isFinal
    // });
  });
};
// mock暂停
const pauseToggleMockMode = async () => {
  // h5 To C#
  try {
    const pauseRes = await setRecordMethod(
      {
        MessageSource: "window1",
        Data: {}, // "StartRecord"、"StopRecord"、"PauseRecord"、"ResumeRecord"
      },
      "PauseRecord"
    );
    pausedMock.value = true;
    stopMockData();
    console.log(pauseRes, "---pauseRes Record h5 To C#---");
  } catch (err) {
    console.log(err, "---err pause mock Record---");
  }
};
// mock继续
const resumeToggleMockMode = async () => {
  // h5 To C#
  try {
    const resumeRes = await setRecordMethod(
      {
        MessageSource: "window1",
        Data: {}, // "StartRecord"、"StopRecord"、"PauseRecord"、"ResumeRecord"
      },
      "ResumeRecord"
    );
    pausedMock.value = false;
    startMockData();
    console.log(resumeRes, "---resumeRes Record h5 To C#---");
  } catch (err) {
    console.log(err, "---err resume mock Record---");
  }
};
// mock停止
const stopToggleMockMode = async () => {
  // h5 To C#
  try {
    // 停止
    const stopRes = await setRecordMethod(
      {
        MessageSource: "window1",
        Data: {}, // "StartRecord"、"StopRecord"、"PauseRecord"、"ResumeRecord"
      },
      "StopRecord"
    );
    console.log(stopRes, "---stopRes Record h5 To C#---");
    stopMockData();
    // 总结
    summaryMockVal.value = !summaryMockVal.value;
    const result = clusterSegments(rawSegments.value, silenceThreshold.value);
    const summaryRes = await setSummaryAction({
      MessageSource: "window1",
      Data: { text: result.map((item) => item.text).join("") },
    });
    console.log(summaryRes, "---summaryRes h5 To C#---");
    if (summaryRes.data.Data.IsSuccess) {
      summaryMockVal.value = !summaryMockVal.value;
      suggestionsMockVal.value = !suggestionsMockVal.value;
      summarizeMockBtn.value = !summarizeMockBtn.value;
    } else {
      // TODO : 处理错误 除了不展示summary 按钮  其他为结束状态
      summaryMockVal.value = !summaryMockVal.value;
      suggestionsMockVal.value = !suggestionsMockVal.value;
    }
    // downloadFliePod(result);
  } catch (err) {
    console.log(err, "---err stop mock Record---");
  }
};
const stopMockData = () => {
  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
  }
  isMockMode.value = false;
  stopRecordTimer();
};
/**
 * 根据静音间隔/说话人标记进行分段聚类
 */
const clusterSegments = (
  segments: TranscriptionSegment[],
  threshold: number
): ClusteredSegment[] => {
  if (!segments.length) return [];
  let currentSpeaker = 1;
  const clustered: ClusteredSegment[] = [];
  let last: ClusteredSegment | null = null;

  segments.forEach((seg) => {
    if (!last) {
      const first: ClusteredSegment = {
        ...seg,
        speakerId: currentSpeaker,
        clusterId: currentSpeaker,
      };
      clustered.push(first);
      last = first;
      return;
    }

    const gap = seg.offset - (last.offset + last.duration);
    if (gap > threshold || seg.speaker !== last.speaker) {
      currentSpeaker = currentSpeaker === 1 ? 2 : currentSpeaker === 2 ? 3 : 1;
    }

    const clusteredSeg: ClusteredSegment = {
      ...seg,
      speakerId: currentSpeaker,
      clusterId: currentSpeaker,
    };
    clustered.push(clusteredSeg);
    last = clusteredSeg;
  });
  console.log(clustered, "-----------spaker clustered---------");

  return clustered;
};

// ------------------------ 计时器 ------------------------ //
const startRecordTimer = () => {
  // recordTime.value = 0;
  // recordTimer = window.setInterval(() => recordTime.value++, 1000);
  // 移除 recordTime.value = 0; 这行，不重置时间
  if (!recordTimer) {
    recordTimer = window.setInterval(() => recordTime.value++, 1000);
  }
};
const pauseRecordTimer = () => {
  if (recordTimer) {
    clearInterval(recordTimer);
    recordTimer = null;
  }
};
const stopRecordTimer = () => {
  if (recordTimer) {
    clearInterval(recordTimer);
    recordTimer = null;
  }
};
const resetRecordTimer = () => {
  stopRecordTimer();
  recordTime.value = 0;
};

// ------------------------ 时间格式化 ------------------------ //
const formatRecordTime = (sec: number): string =>
  `${Math.floor(sec / 60)
    .toString()
    .padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
const formatTime = (sec: number): string => {
  const d = new Date(0);
  d.setSeconds(sec);
  return d.toISOString().substr(11, 8);
};

const startRecognition = async () => {
  console.log(Istranscription.value, "sdk");
  if (Istranscription.value) {
    return;
  }
  recordBoolean.value = true;
  isRecordShow.value = true;
  autoScroll.value = true;
  isListening.value = true;
  isPaused.value = false;
  startRecordTimer();
  try {
    error.value = null;
    interimTranscript.value = "";
    rawSegments.value = [];
    initRecognizer();
    recognizer.value!.startContinuousRecognitionAsync(
      () => console.log("识别已开始"),
      (err: string) => {
        error.value = `启动识别失败: ${err}`;
        stopRecord();
      }
    );
  } catch (err) {
    error.value = `初始化错误: ${err instanceof Error ? err.message : String(err)}`;
    isListening.value = false;
    resetRecordTimer();
  }
};

const pauseRecognition = () => {
  if (!recognizer.value || !isListening.value) return;
  recognizer.value.stopContinuousRecognitionAsync(
    () => {
      isPaused.value = true;
      isListening.value = false;
      //   stopRecordTimer();
      pauseRecordTimer(); //改为暂停
    },
    (err: string) => (error.value = `暂停识别失败: ${err}`)
  );
};

const resumeRecognition = () => {
  if (!recognizer.value) {
    initRecognizer();
  }
  isPaused.value = false;
  isListening.value = true;
  recognizer.value!.startContinuousRecognitionAsync(
    () => {
      console.log("识别已恢复");
      startRecordTimer();
    },
    (err: string) => {
      error.value = `继续识别失败: ${err}`;
      initRecognizer();
      startRecognition();
    }
  );
};

const stopRecord = () => {
  if (!recognizer.value) {
    isListening.value = false;
    isPaused.value = false;
    recordBoolean.value = false;
    stopRecordTimer(); // 改为停止而不是重置
    // resetRecordTimer();
    return;
  }
  recognizer.value.stopContinuousRecognitionAsync(
    () => {
      recognizer.value?.close();
      recognizer.value = null;
      isListening.value = false;
      isPaused.value = false;
      recordBoolean.value = false;
      stopRecordTimer(); // 改为停止而不是重置
      // resetRecordTimer();
    },
    (err: string) => (error.value = `停止识别失败: ${err}`)
  );
};

const stopRecognition = () => {
  summaryVal.value = !summaryVal.value;
  setTimeout(() => {
    summaryVal.value = !summaryVal.value;
    suggestionsVal.value = !suggestionsVal.value;
    summarizeBtn.value = !summarizeBtn.value;
  }, 2000);
  if (isMockMode.value) {
    stopMockData();
    return;
  }
  if (!recognizer.value) {
    finalizeRecognition();
    return;
  }
  recognizer.value.stopContinuousRecognitionAsync(
    () => {
      recognizer.value?.close();
      recognizer.value = null;
      finalizeRecognition();
    },
    (err: string) => (error.value = `停止识别失败: ${err}`)
  );
};

const finalizeRecognition = async () => {
  isListening.value = false;
  isPaused.value = false;
  recordBoolean.value = false;
  resetRecordTimer();
  //  stopRecordTimer(); // 改为停止而不是重置
  const result = clusterSegments(rawSegments.value, silenceThreshold.value);
  console.log("停止识别", result);
  downloadFliePod(result);
};

const clearText = () => {
  rawSegments.value = [];
  interimTranscript.value = "";
};

const scrollToBottom = () => {
  if (!autoScroll.value || !transcriptRef.value) return;
  nextTick(() => {
    if (transcriptRef.value) {
      transcriptRef.value.scrollTop = transcriptRef.value.scrollHeight;
    }
  });
};

const handleScroll = () => {
  if (!transcriptRef.value) return;
  const c = transcriptRef.value;
  autoScroll.value = c.scrollHeight - c.scrollTop - c.clientHeight <= 50;
};

const initRecognizer = () => {
//   navigator.mediaDevices.getUserMedia({ audio: true }).catch((err: unknown) => {
//     console.error("麦克风权限申请失败", err);
//   });
  const speechConfig = speechsdk.SpeechConfig.fromSubscription(
    "2ko02rirRqjnQNCsn0Q4Dt4R7sQIVYytaijPmrdRd9SEg0KVcND7JQQJ99ALACYeBjFXJ3w3AAAYACOGOLbG",
    "eastus"
  );
  speechConfig.speechRecognitionLanguage = "zh-CN";
  speechConfig.requestWordLevelTimestamps();
  const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
  recognizer.value = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

  recognizer.value.recognizing = (_s, e) => {
    interimTranscript.value = e.result.text;
    scrollToBottom();
  };

  recognizer.value.recognized = (_s, e) => {
    if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
      const res = e.result as unknown as ResultWithSpeaker;
      const offset = res.offset / 1e7;
      const duration = res.duration / 1e7;
      console.log(res.text, "res.text");
      if (res.text) {
        rawSegments.value.push({
          text: res.text,
          offset,
          duration,
          speaker: res.speakerId?.toString(),
        });
      }
      interimTranscript.value = "";
      scrollToBottom();
    }
  };

  recognizer.value.canceled = (_s, e) => {
    if (e.reason === speechsdk.CancellationReason.Error) {
      error.value = `识别错误: ${e.errorDetails}`;
    }
    stopRecord();
  };

  recognizer.value.sessionStopped = stopRecord;
};
onMounted(() => {
  window.addEventListener("resize", scrollToBottom);
  // initRecognizer();
  // changeTranscription();
  startMockData();
  // 初始化流式数据监听
  handleStreamingTranscription();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", scrollToBottom);
  WebviewMessager.off("client.h5.transcription", () => {});
  stopRecord();
});
</script>

<style src="./style.less" lang="less" scoped></style>
