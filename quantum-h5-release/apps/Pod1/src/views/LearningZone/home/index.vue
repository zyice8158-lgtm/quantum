<template>
  <div class="learning-zone-container">
    <div class="scrollable-content">
      <div class="learning-zone-home_header">
        <HomeHreder :isBlank="!hasUserCreatedContent" :chat="chat" :inputValue="getInputValue" :files="files" />
      </div>
      <div class="header" v-if="hasUserCreatedContent">
        <div class="header-left">
          <TagPopover :tagList="tagList" :addTag="addTag" :updateTag="updateTag" :removeTag="removeTag"
            :currentTag="currentTag" :switchTag="switchTag" />
          <div class="nav-tabs">
            <div v-for="item in LZ_TYPE_MAP" :key="item.id" :class="['nav-tab', { active: currentType.id === item.id }]"
              @click="switchType(item)">
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="items-count" v-if="!!cards.length">{{ cards.length }} {{ $t("home.itemsCount") }}</div>
          <div class="filter-btn" @click="toggleSort" :title="getSortTooltip">
            <IconSortBy class="sort-icon" :class="{ desc: sortByDesc }" />
          </div>
        </div>
      </div>
      <div class="card-title" v-else>{{ $t("home.featuredSamples") }}</div>
      <CardList :cards="cards" :onRemoveCard="removeCard" :onMoveCard="moveCardToTag" :tags="tagList" />
    </div>
    <div class="learning-zone-home_input">
      <QuizNoteToggle :chat="chat" :files="files" :inputValue="getInputValue" @tab-change="handleTabChange" class="quiz-note-toggle" />
      <InputCom :chat="chat" :isInit="isInit" :inputStatus="chatStatus" :fileSearchList="files"
        @fileDelete="onFileDelete" @fileSelect="onFileSelect" @sendInputValue="handleSendInputValue"
        @inputValueData="handleInputValueData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import HomeHreder from "../components/Home/homeHreder.vue";
import CardList from "./CardList.vue";
import InputCom from "../components/inputCom/index.vue";
import { IconSortBy } from "@quantum/icons";
import { LZ_TYPE_MAP } from "@/constant/lz";
import TagPopover from "./TagPopover.vue";
import { useLibraryList } from "./useLibraryList";
import { isInitializing } from "@/store/lz";
import mySDK from "@/components/ChatView/sdkService";
import { ChatController, QuestionType } from "@libs/p-comps";
import { useRouter } from "vue-router";
import QuizNoteToggle from "@/views/LearningZone/Chat/QuizNoteToggle.vue";
import { useFiles } from "@libs/p-comps/hooks/useFiles";
import { useLocale } from "@/hooks/i18n";

const {
  updateTag,
  addTag,
  tagList,
  currentType,
  currentTag,
  switchType,
  getList,
  cards,
  hasUserCreatedContent,
  toggleSort,
  removeTag,
  removeCard,
  moveCardToTag,
  switchTag,
} = useLibraryList();

const { t } = useLocale();

const isBlank = ref(true);
const chat = ref<ChatController>();
const isInit = ref(false);
const router = useRouter();
const sortByDesc = ref(true);
const getInputValue = ref("");
const chatStatus = computed(() => {
  return chat.value?.getChatStatus();
});

const { files, onFileDelete, onFileSelect } = useFiles()

watch(cards, (value) => {
  console.log(value, "cards");
});
// 添加 QuizNoteToggle 状态
const activeTab = ref<string>("nul");
// 处理 QuizNoteToggle 标签切换
const handleTabChange = (tab: string) => {
  console.log("QuizNoteToggle 标签切换:", tab);
  activeTab.value = tab;
};
const handleSendInputValue = (chatId: string, value: QuestionType) => {
  console.log(value, activeTab.value, chatId,"chatId-------", JSON.parse(JSON.stringify(value)));
  if (!value.content) return;
  router.push({
    name: "LearningZoneChat",
    params: { chatId, cardType: activeTab.value },
    state: {
      queryObject: JSON.parse(JSON.stringify(value))
    },
  });
};
const handleInputValueData = (inputValue: string) => {
  getInputValue.value = inputValue;
};
// 获取排序提示文本
const getSortTooltip = computed(() => {
  return sortByDesc.value ? "Sorted by: Oldest First" : "Sorted by: Newest First";
});

watch(
  () => chat.value?.chatAction.length,
  (newChatLen, oldChatLen) => {
    // 从0变成1的时候
    if (oldChatLen === 0) {
      isInit.value = true;
    } else if (newChatLen === 0) {
      // 从多变成0的时候
      isInit.value = false;
    }
  }
);

watch([currentType, currentTag], () => {
  getList();
});

watch(isInitializing, () => {
  if (!isInitializing.value) {
    getList();
  }
});

onMounted(() => {
  getList();
  mySDK.init();
  chat.value = new ChatController(mySDK);
});
</script>

<style scoped lang="less">
.learning-zone-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding: 0 32px;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.learning-zone-home_header {
  margin-bottom: 10px;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 0px 16px;
}

.header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.card-title {
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 10px;
}

.nav-tabs {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 12px;
  margin-left: 12px;

  .nav-tab {
    padding: 0 12px 0 8px;
    color: var(--color-focus);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    display: flex;
    align-items: center;

    &.active {
      color: var(--color-primary);

      &::after {
        content: "";
        position: absolute;
        bottom: -5px;
        left: 10px;
        width: calc(100% - 24px);
        height: 4px;
        background: var(--color-primary-primary);
        border-radius: 2px;
      }
    }
  }
}

.header-right {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.items-count {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-on-surface-muted);
  margin: 0 4px 0 12px;
  cursor: default;
}

.filter-btn {
  width: 50px;
  height: 32px;
  background: var(--color-on-primary);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  position: relative;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  .sort-indicator {
    position: absolute;
    top: 2px;
    right: 6px;
    font-size: 10px;
    font-weight: bold;
    color: var(--color-primary);
  }

  &:hover .sort-indicator {
    color: var(--color-on-primary);
  }

  .sort-icon {
    transition: transform 0.3s ease;

    &.desc {
      transform: rotate(180deg);
    }
  }
}

.learning-zone-home_input {
  position: sticky;
  height: auto;
  bottom: 0;
}
</style>
