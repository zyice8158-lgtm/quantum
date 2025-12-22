<template>
<div>
  <div v-if="isBlank">
    <div class="home_title">
      <div class="home_title_text">
      <div class="home_title_text_play">
        <p class="home_title_text_title">{{ $t('home.learnDes') }}</p>
        <div class="home_title_text_play_audio">
          <QIcons name="playaudio" round size="16" class="home_title_text_play_audio_icon"></QIcons>
          <p class="home_title_text_play_audio_titles">{{ $t('home.getVideo') }}</p>
        </div>
      </div>
      <p class="home_title_text_desc">{{ $t('home.titleDescription') }}</p>
      </div>
    </div>
    <div class="home-header">
      <div
        v-for="(card, idx) in cards"
        :key="card.key"
        :class="['home-header_item', { 'is-active': activeIndex === idx }]"
        :style="{ '--bg': card.bg, '--gradient': card.gradient }"
        @mouseenter="changeActive(idx)"
        @click="handleClick(card)"
      >
        <!-- 渐变色背景层 -->
        <div class="card-background" :style="{ background: card.gradient }"></div>
        <div class="descriptive-information">
          <div class="descriptive-information_description" :title="card.desc" >
              {{ card.desc }}
          </div>
          <div class="descriptive-information_left">
            <div class="descriptive-information_left_icon-box">
              <QIcons :name="card.titleIcon" round size="22"></QIcons>
            </div>
            <div class="descriptive-information_left_text-box">
              <div class="descriptive-information_left_text-box_title">{{ card.title }}</div>
            </div>
            <div class="descriptive-information_left_right" @click="handleClick(card)">{{ card.buttonText }}</div>
          </div>
        </div>
        <div class="descriptive-text">
          <QIcons :name="card.icon" round size="33"></QIcons>
          <div class="descriptive-text_label">{{ card.title }}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="header-buttons" v-else>
    <div class="header-buttons_content">
      <p class="header-buttons_content_title">{{ $t('home.nextStep') }}</p>
      <div class="header-buttons_content_audio">
        <QIcons name="playaudio" round size="16"></QIcons>
        <p class="header-buttons_content_audio_titles">{{ $t('home.getVideo') }}</p>
      </div>
    </div>
    <div class="nav-buttons" >
      <button class="record-btn" v-for="(card) in cards" :key="card.key" @click="handleClick(card)" >
        <QIcons :name="card.icon" round size="18" class="record-btn_icon"></QIcons>
        <span v-html="card.label" class="record-btn_label"></span>
      </button>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import NotesHeardPng from "@/assets/NotesHeader.svg";
import BlankNotesHeardPng from "@/assets/BlankNotesHeardPng.svg";
import PodcastHeardPng from "@/assets/StartRecord.svg";
import QuizHeardPng from "@/assets/QuizHeardPng.svg";
import { QIcons } from "@libs/p-comps";
import { useRouter } from "vue-router";
import { ChatController, ChatStatus, QButton } from "@libs/p-comps";
import { EventBus } from "@quantum/use";


const router = useRouter();
import {
  setRecordingMethod,
} from "@libs/service";
const props = defineProps<{
   isBlank: {
    type: Boolean,
    default: true,
  },
  inputValue: {
    type: String,
    default: '',
  },
  inputStatus?: ChatStatus; // 控制输入状态，按钮显示隐藏
  chat: ChatController | undefined;
  isInit: boolean;
  pod?: string;
  customEnterSend?: (inputVal: string) => void;
  files?: any[];
}>();
interface CardItem {
  key: string;
  icon: string;
  titleIcon: string;
  title: string;
  label: string;
  desc: string;
  bg: string;
  gradient: string;
  buttonText: string;
}
const cards = ref<CardItem[]>([
  {
    key: "notes",
    icon: "NotesSvg",
    titleIcon: "SummarizeNoteIcon",
    title: "Summarize Note",
    label: `Summarize<br>Note`,
    desc: "Upload files to turn lengthy documents into well-formatted notes highlighting key points",
    bg: `url(${NotesHeardPng})`,
    gradient: "linear-gradient(135deg, rgba(232, 107, 69, 0.8), rgba(255, 185, 77, 0.8))",
    buttonText: "Try it",
  },
  {
    key: "blankNotes",
    icon: "BlankNotes",
    titleIcon: "BlankNoteIcon",
    title: "Blank Note",
    label: "Blank<br>Note",
    desc: "Create a new note to capture important ideas and information",
    bg: `url(${BlankNotesHeardPng})`,
    gradient: "linear-gradient(135deg, rgba(146, 98, 185, 0.8), rgba(243, 138, 187, 0.8))",
    buttonText: "Try it",
  },
  {
    key: "podcast",
    icon: "recordSvg",
    titleIcon: "StartRecordIcon",
    title: "Start Recording",
    label: "Start<br>Record",
    desc: "Record a class/lecture with live transcript,notes summary and translation",
    bg: `url(${PodcastHeardPng})`,
    gradient: "linear-gradient(135deg, rgba(228, 71, 139, 0.8), rgba(252, 118, 63, 0.8))",
    buttonText: "Try it",
  },
  {
    key: "quiz",
    icon: "QuizSvg",
    titleIcon: "TakeQuizIcon",
    title: "Take Quiz",
    label: "Take<br>Quiz",
    desc: "Get questions for self test upon files or asubject",
    bg: `url(${QuizHeardPng})`,
    gradient: "linear-gradient(135deg, rgba(104, 142, 255, 0.8), rgba(109, 209, 255, 0.8))",
    buttonText: "Try it",
  },
]);

const activeIndex = ref(0);
const changeActive = (idx: number) => {
  activeIndex.value = idx;
};
const handleClick = (card: any) => {
 if(card.title === 'Start Recording'){
  router.push({ name: "LearningZoneChat", params: { chatId:'template-notes-recording', cardType: 'notes'},query : {isRecording: true} });
  try {
    const res =setRecordingMethod({
      Data: {}
    });
    console.log(`Start Recording success`, res);
  } catch (err) {
    console.error("Record toggle error:", err);
  }
 }else if(card.title === 'Blank Note'){
  router.push({ name: "LearningZoneChat", params: { chatId:'template-blanknote', cardType: 'notes'},query : {isBlankNote: true,} });
 }else if(card.title === 'Summarize Note'){
  EventBus.emit('fileNoteSelect', true);
  // if(props.files?.length > 0||props.inputValue){
  //   router.push({ name: "LearningZoneChat", params: { chatId:'template-summarize', cardType: 'string'},state: {
  //     queryObject: JSON.parse(JSON.stringify({content: props.inputValue || 'Generate a notes from the content',files: props.files}))
  //   }});
  // }
 }else if(card.title === 'Take Quiz'){
  EventBus.emit('fileQuizSelect', true);
  // if(props.files?.length > 0||props.inputValue){
  //   router.push({ name: "LearningZoneChat", params: { chatId:'template-quiz', cardType: 'string'},state: {
  //     queryObject: JSON.parse(JSON.stringify({content: props.inputValue||'Generate a quiz from the content',files: props.files }))
  //   },});
  // }
 }
}
</script>

<style scoped lang="less">
// 缩小比例 (0.85倍)
@scale: 0.85;

.home_title{
  // padding: 0 16px * @scale;
  margin-bottom: 12px * @scale;
  &_text{
    // padding: 0 10px * @scale;
    &_play{
      display: flex;
      cursor: pointer;
      &_audio{
        padding: 0 12px * @scale;
        &_icon{
          width: 18px * @scale;
          height: 18px * @scale;
          margin: 6px * @scale;
        }
        &_titles{
          font-weight: 700;
          font-size: 12px * @scale;
          line-height: 31px * @scale;
          background: linear-gradient(to right, #648BFF, #B273EF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        width: 184px * @scale;
        height: 32px * @scale;
        background: linear-gradient(135deg, rgba(251, 249, 247, 0.3), rgba(251, 249, 247, 0.3));
        border-radius: 16px * @scale;
        display: flex;
      }
    }
    &_title{
      flex: 1;
      font-size: 24px * @scale;
      font-weight: 700;
      line-height: 32px * @scale;
      background: linear-gradient(to right, #648BFF, #B273EF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
    }
    &_desc{
      font-size: 14px * @scale;
      font-weight: 400;
      line-height: 30px * @scale;
      margin-top: 10px * @scale;
      color: var(--color-text-on-surface-variant);
    }
  }
}
.home-header {
  width: 100%;
  min-width: 320px;
  height: 305px * @scale; /* 高度按比例缩小 */
  display: flex;
  border-radius: 16px * @scale;
  overflow: hidden;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  // padding: 0 26px * @scale;
  gap: 8px * @scale;

  @radius: 16px * @scale;
  @expanded: 60%;
  @collapsed: calc((100% - 60% - 30px * @scale) / 3);

  > div {
    position: relative;
    flex: 0 0 var(--width, @collapsed);
    height: 100%;
    cursor: pointer;
    transition: all 1s cubic-bezier(0.2, 0.7, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    margin: 0;
    overflow: hidden;

    /* 卡片基础背景 - 透明 */
    background: transparent;

    /* 渐变色背景层 - 所有卡片都显示 */
    .card-background {
      position: absolute;
      inset: 0;
      opacity: 1;
      transition: opacity 0.5s ease;
      z-index: 0;
      border-radius: inherit;
    }

    /* 整个卡片的渐变遮罩 - 只在激活时显示 */
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(160, 121, 255, 0.6) 0%, rgba(182, 152, 255, 0.7) 30%, transparent 85%);
      opacity: 0;
      transition: opacity 0.5s ease;
      pointer-events: none;
      z-index: 1;
      border-radius: inherit;
    }

    /* 背景图片 - 只在激活时显示 */
    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background-image: var(--bg);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0;
      transition: opacity 1s ease;
      pointer-events: none;
      z-index: 0;
    }

    &.is-active {
      --width: @expanded;

      &::before {
        opacity: 1;
      }

      &::after {
        opacity: 1;
      }

      .card-background {
        opacity: 0; /* 只有激活卡片的渐变色背景变透明 */
      }
    }

    /* 非激活卡片保持渐变色背景 */
    &:not(.is-active) .card-background {
      opacity: 1;
    }

    .descriptive-information {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      justify-content: space-between;
      padding: 0 12px * @scale;
      align-items: flex-start;
      color: var(--color-inverse-focus);
      font-size: 14px * @scale;
      opacity: 0;
      transform: translateY(8px * @scale);
      transition: all 0.5s ease;
      pointer-events: none;
      z-index: 2;

      &_description {
        font-size: 18px * @scale;
        font-weight: 500;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.95);
        /* 自动换行并限制3行显示省略号 */
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        margin-bottom: 8px * @scale;
        word-break: break-word;
      }
      &_left {
        display: flex;
        flex: 1;
        min-width: 0;
        height: 50px * @scale;

        &_icon-box {
          width: 45px * @scale;
          height: 32px * @scale;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;

          svg {
            color: var(--color-inverse-focus);
            width: 28px * @scale;
            height: 28px * @scale;
          }
        }
        &_text-box {
          flex: 1;
          min-width: 0;
          max-width: 80%;

          &_title {
            line-height: 30px * @scale;
            font-size: 16px * @scale;
            font-weight: 700;
            color: var(--color-inverse-focus);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
        }
        &_right {
          min-width: 76px * @scale;
          height: 40px * @scale;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px * @scale;
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 0 0 auto;
          color: var(--color-inverse-focus);
          background: var(--color-processing-gradient-stop-100);
          backdrop-filter: blur(4px);
        }
      }

    }

    .descriptive-text {
      font-weight: 500;
      font-size: 14px * @scale;
      text-align: center;
      color: var(--color-inverse-focus);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2;
      transition: all 0.5s ease;
      width: 100%;
      height: 100%;
      position: relative;

      svg {
        margin-bottom: 50px * @scale;
        color: var(--color-inverse-focus);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        flex-shrink: 0;
        // width: 38px * @scale;
        // height: 38px * @scale;
      }

      .descriptive-text_label {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 20px * @scale;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        font-weight: 400;
        padding: 0 8px * @scale;
        text-align: center;
        font-size: 14px * @scale;
      }
    }

    /* 激活状态下的样式 */
    &.is-active {
      .descriptive-information {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .descriptive-text {
        opacity: 0;
        transform: translateY(-20px * @scale);
      }
    }

    /* 非激活状态下的样式 */
    &:not(.is-active) {
      .descriptive-text {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  > div:first-child {
    border-top-left-radius: @radius;
    border-bottom-left-radius: @radius;
  }
  > div:last-child {
    border-top-right-radius: @radius;
    border-bottom-right-radius: @radius;
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    @expanded: 70%;
    @collapsed: calc((100% - 70% - 16px * @scale) / 3);
    gap: 8px * @scale;
    padding: 0 8px * @scale;

    > div .descriptive-text {
      svg {
        margin-bottom: 40px * @scale;
      }

      .descriptive-text_label {
        bottom: 15px * @scale;
        font-size: 13px * @scale;
      }
    }
  }

  @media (max-width: 480px) {
    @expanded: 80%;
    @collapsed: calc((100% - 80% - 16px * @scale) / 3);
    height: 250px * @scale; /* 小屏高度按比例缩小 */
    gap: 8px * @scale;
    padding: 0 8px * @scale;

    > div .descriptive-text {
      svg {
        margin-bottom: 35px * @scale;
        width: 30px * @scale;
        height: 30px * @scale;
      }

      .descriptive-text_label {
        bottom: 12px * @scale;
        font-size: 12px * @scale;
      }
    }
  }
}
.header-buttons{
  &_content{
    display: flex;
    // padding: 0 25px * @scale;
  }
  &_content_title{
    flex: 1;
    font-size: 24px * @scale;
    font-weight: 700;
    line-height: 32px * @scale;
    background: linear-gradient(to right, #648BFF, #B273EF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
  }
  &_content_audio{
    display: flex;
    cursor: pointer;
    width: 184px * @scale;
    height: 32px * @scale;
    background: linear-gradient(135deg, rgba(251, 249, 247, 0.3), rgba(251, 249, 247, 0.3));
    border-radius: 16px * @scale;
    display: flex;
    padding: 0 12px * @scale;
    svg{
      width: 18px * @scale;
      height: 18px * @scale;
      margin: 6px * @scale;
    }
    &_titles{
      font-weight: 700;
      font-size: 12px * @scale;
      line-height: 31px * @scale;
      background: linear-gradient(to right, #648BFF, #B273EF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
    }
  }

}

.nav-buttons {
  display: flex;
  gap: 12px * @scale;
  padding: 16px * @scale 0px * @scale;
  width: 100%; /* 占满父容器宽度 */
  box-sizing: border-box;
}
.record-btn {
  display: flex;
  // align-items: center;
  // justify-content: center;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var( --color-inverse-focus); /* 边框色 */
  border-radius: 24px;
  padding: 24px * @scale 24px * @scale;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px * @scale;
  font-weight: 400;
  color: var(--color-on-focus-container); /* 文字颜色 */
  font-weight: 500;
  flex: 1; /* 每个按钮平分可用宽度 */
  min-width: 0; /* 移除最小宽度限制，确保自适应 */
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 文字溢出显示省略号 */

  &_icon {
    width: 18px * @scale;
    height: 18px * @scale;
    margin-right: 8px * @scale;
    margin-top: 10px * @scale;
    color: var(--color-primary-primary);
    display: inline-block;
    overflow: visible; // 避免图标被裁剪
    flex-shrink: 0; // 防止flex容器压缩图标
  }
  &_label {
    text-align: left;
    margin-left: 10px;
  }
}
.record-icon {
  width: 32px * @scale;
  height: 48px * @scale;
  border-radius: 8px * @scale;
  background-color: #FF6B6B; /* 红色图标背景 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px * @scale;
}
.record-icon svg {
  width: 16px * @scale;
  height: 16px * @scale;
  fill: var(--color-on-primary); /* 声波图标白色 */
}
</style>
