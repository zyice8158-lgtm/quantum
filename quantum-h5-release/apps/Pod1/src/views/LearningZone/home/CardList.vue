<template>
  <div class="card-list">
    <div v-for="card in cards" :key="card.chatMessageId">
      <div
        class="card-wrapper"
        :class="[
          `card-wrapper-${card.type}`,
          { 'action-active': activeCardId === card.chatMessageId },
        ]"
        @click="handleCardClick(card, $event)"
      >
        <div class="card-header">
          <div class="header-left">
            <component :is="getCardIcon(card.type)" class="header-left-icon""/>
<!-- todo -->
            <span class="title">{{ card.name || card.type }}</span>
          </div>
          <IconStar v-if="card.tagId === LZ_FEATURED_TEMPLATED.id" class="icon-star" />
          <div v-if="card.tagId !== LZ_FEATURED_TEMPLATED.id">
            <DropdownMenu
              :items="getCardDropdownItems(card)"
              :trigger="['click']"
              radiusSize="small"
              @click.stop
              @show="handleDropdownShow(card)"
              @hide="handleDropdownHide"
              isTiered
            >
              <div class="icon-action"><IconAction /></div>
            </DropdownMenu>
          </div>
        </div>
        <div class="card-content">
          <div>
            <input
              v-if="editingCardId === getCardEditId(card)"
              v-model="editingTitle"
              class="content-input"
              @blur="handleSaveRename(card)"
              @keyup.enter="handleSaveRename(card)"
              @click.stop
            />
            <span  class="content" v-else>{{ card.title }}</span>
          </div>
          <div class="description">{{ card.description }}</div>
          <p class="date">{{ formatDate(card.createdDate) }}</p>
        </div>
      </div>
    </div>
  </div>
  <ConfirmDialog>
    <template #iconSlot>
      <IconRecycleBin class="text-[24px]"/>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import {
  IconAction,
  IconStar,
  IconDocument,
  IconRecording,
  IconQuiz,
  IconMoveTo,
  IconRecycleBin,
  IconEdit2,
  IconUpload,
  IconLink,
} from "@quantum/icons";
import DropdownMenu from "@libs/p-comps/Dropdown";
import ConfirmDialog from "@libs/p-comps/volt/ConfirmDialog.vue";
import { Card, Tag } from "@/types/lz";
import dayjs from "dayjs";
import { LzBankKind } from "../../../types/lz";
import { LZ_FEATURED_TEMPLATED } from "@/constant/lz";
import { useConfirm } from "primevue/useconfirm";

const router = useRouter();
const confirm = useConfirm();

// 跟踪当前激活的卡片ID（dropdown打开时）
const activeCardId = ref<string | null>(null);

// 跟踪正在编辑的卡片ID
const editingCardId = ref<string | null>(null);
const editingTitle = ref<string>("");

const props = defineProps<{
  cards: Array<Card>;
  tags: Array<Tag>;
  onRemoveCard: (card: Card) => void; // 删除卡片的回调函数
  onMoveCard: (card: Card, tag: Tag) => void; // 移动卡片的回调函数
}>();

const cardIconMap: Record<string, any> = {
  [LzBankKind.Quiz]: IconQuiz,
  [LzBankKind.Record]: IconRecording,
  [LzBankKind.Notes]: IconDocument,
};

const getCardIcon = (type: string) => {
  return cardIconMap[type] || IconDocument;
};

// 获取卡片的唯一编辑标识符
const getCardEditId = (card: Card): string => {
  return card.quizId ? `${card.chatMessageId}_${card.quizId}` : card.chatMessageId;
};

const handleDeleteCard = (card: Card) => {
  confirm.require({
    message: "The files in this Tag will be added to All Tags.",
    header: "Delete Tag?",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: false,
    },
    acceptProps: {
      unstyled: true,
      severity: "danger",
      label: "Delete",
    },
    accept: () => {
      props.onRemoveCard?.(card);
    },
  });
};

const handleMoveToTag = (card: Card, tag: Tag) => {
  props.onMoveCard?.(card, tag);
};

const handleRenameCard = (card: Card) => {
  editingCardId.value = getCardEditId(card);
  editingTitle.value = card.title;
  // 自动聚焦输入框
  nextTick(() => {
    const input = document.querySelector('.content-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
};

const handleSaveRename = (card: Card) => {
  const cardEditId = getCardEditId(card);
  if(editingTitle.value.trim() === card.title || !editingTitle.value.trim()) {
    editingCardId.value = null;
    editingTitle.value = "";
    return;
  }
  if (editingCardId.value === cardEditId) {
    card.title = editingTitle.value.trim();
    editingCardId.value = null;
    editingTitle.value = "";
  }
};

const handleDownloadCard = (card: Card) => {
  console.log("Download card:", card);
};

const handleShareCard = (card: Card) => {
  console.log("Share card:", card);
};

watch(props.cards, (value) => {
  console.log(value, 'cards==')
})

const cardExtraMenuItemsMap: Record<string, Array<any>> = {
  [LzBankKind.Quiz]: [
    {
      label: "Rename",
      icon: IconEdit2,
      command: (card: Card) => handleRenameCard(card),
    },
    {
      label: "Download",
      icon: IconUpload,
      command: (card: Card) => handleDownloadCard(card),
    },
    {
      label: "Share",
      icon: IconLink,
      command: (card: Card) => handleShareCard(card),
    }],
};

const formatDate = (timestamp: number | string): string => {
  const date = dayjs(timestamp);

  return date.format("YYYY-MM-DD");
};

const clickCard = (card: Card) => {
  const query: Record<string, string> = {
    chatMessageId: card.chatMessageId,
    cardType: card.type
  };
  if (card.templateKey) {
    query.template = card.templateKey;
  }
  router.push({
    name: "LearningZoneChat",
    params: { chatId: card.chatId, cardType: card.type },
    query,
  });
};

// 处理卡片点击事件
const handleCardClick = (card: Card, event: Event) => {
  // 检查点击的目标是否是操作图标或下拉菜单
  const target = event.target as HTMLElement;
  if (target.closest(".icon-action") || target.closest('[data-pc-name="menu"]')) {
    return; // 如果点击的是操作图标或下拉菜单，不执行卡片点击
  }
  clickCard(card);
};

// 生成卡片操作下拉菜单项
const getCardDropdownItems = (card: any) => {
  const baseItems = [
    {
      label: "Move to",
      icon: IconMoveTo,
      items: getMoveToItems(card),
    },
    {
      label: "Delete",
      icon: IconRecycleBin,
      command: () => handleDeleteCard(card),
    },
  ];

  // 从映射中获取该类型的额外菜单项
  const extraItems = cardExtraMenuItemsMap[card.type] || [];
  
  // 将额外菜单项的command函数绑定到当前card
  const mappedExtraItems = extraItems.map(item => ({
    ...item,
    command: () => item.command(card),
  }));

  return [ ...baseItems,...mappedExtraItems];
};

// 生成移动到标签的子菜单项
const getMoveToItems = (card: any) => {
  // 使用传入的标签数据，如果没有则返回空数组
  if (!props.tags || props.tags.length === 0) {
    return [];
  }

  // 过滤掉当前标签，避免移动到同一个标签
  const currentTagId = card.tagId;
  const availableTags = props.tags.filter(
    (tag) => tag.id !== currentTagId && tag.id !== LZ_FEATURED_TEMPLATED.id
  );

  return availableTags.map((tag) => ({
    label: tag.name,
    command: () => handleMoveToTag(card, tag),
  }));
};

// 处理 dropdown 显示
const handleDropdownShow = (card: Card) => {
  activeCardId.value = card.chatMessageId;
};

// 处理 dropdown 隐藏
const handleDropdownHide = () => {
  activeCardId.value = null;
};
</script>

<style scoped lang="less">
.card-list {
  display: grid;
  flex-direction: row;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  // margin: 0 24px;
}
.card-wrapper {
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  height: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover .card-header::before {
    opacity: 0.9;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 45px;
    padding: 0px 16px;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255);
      opacity: 0.5;
      z-index: -1;
      transition: opacity 0.3s ease;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      &-icon {
        height: 24px;
        width: 24px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--color-surface);
        background: rgba(141, 129, 253, 1);
      }
    }

    .title {
      font-size: 14px;
      font-weight: 400;
      color: rgba(14, 19, 30, 1);
      line-height: 20px;
      flex: 1;
    }

    .icon-star {
      width: 21px;
      height: 21px;
      color: var(--color-ai-step-3);
    }

    .icon-action {
      width: 24px;
      height: 24px;
      cursor: pointer;

      svg {
        width: 24px;
        height: 24px;
        color: rgba(133, 133, 133, 1);
      }
    }
  }
}

.card-content {
  position: relative;
  background: var(--color-surface);
  overflow: hidden;
  flex: 1;
  padding: 8px 16px 0;

  .content {
    font-size: 16px;
    font-weight: 500;
    color: rgba(14, 19, 30, 1);
    line-height: 20px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 20px;
    margin-bottom: 8px;
  }
  .content-input {
      width: 100%;
      font-size: 16px;
      font-weight: 500;
      color: rgba(14, 19, 30, 1);
      line-height: 20px;
      border: none;
      outline: none;
      background: transparent;
      padding: 0 0 0 8px;
      margin: 0;
      border: 1px solid rgba(133, 94, 225, 1);
      border-radius: 4px;
      height: 28px;
    }
  .description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(59, 59, 59, 1);
    font-size: 12px;
  }
  .date {
    font-size: 12px;
    color: rgba(59, 59, 59, 1);
    margin: 0;
    position: absolute;
    bottom: 14px;
    left: 16px;
    z-index: 1;
  }
}
</style>
