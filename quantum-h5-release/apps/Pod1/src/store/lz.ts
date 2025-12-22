import { useStorage } from "@quantum/use";
import { ref, watch, type Ref } from "vue";
import { LzBankType, BankData, Tag, LzBankKind, Card } from "../types/lz";
import { LZ_DEFAULT_TAG, LZ_FEATURED_TEMPLATED, LZ_TEMPLATED_CARD } from "../constant/lz.ts";

const getBankStorage = () => {
  const scoped = `lz_store`;
  return useStorage<BankData>(scoped);
};

export const getBankData = async (): Promise<BankData> => {
  const storage = getBankStorage();
  const data = await storage.get();

  if (!data || !Array.isArray(data.tags) || !data.items) {
    return { tags: [], items: {} };
  }

  return data as BankData;
};

export const saveBankData = async (data: BankData) => {
  const storage = getBankStorage();
  await storage.set(data);
};

// 添加标签
export const addBankTag = async (name: string): Promise<Tag> => {
  const currentData = LzStore.value.data;
  if (currentData.tags.find((tag) => tag.name === name)) {
    throw new Error(`Tag "${name}" already exists`);
  }

  const id = `${Date.now()}`;
  const tag: Tag = { id, name };

  currentData.tags.push(tag);
  currentData.items[id] = [];

  return tag;
};

// 删除标签
export const removeBankTag = async (tag: Tag) => {
  const data = LzStore.value.data;
  const itemsToMove = data.items[tag.id] || [];
  
  itemsToMove.forEach(item => {
    item.tag = LZ_DEFAULT_TAG.name;
  });
  data.items[LZ_DEFAULT_TAG.id].push(...itemsToMove);
  data.tags = data.tags.filter((t) => t.id !== tag.id);
  delete data.items[tag.id];
};

// 更新标签名
export const updateBankTag = async (tagId: string, newName: string) => {
  const data = await getBankData();
  const isRepeated = data.tags.find((tag) => tag.name === newName && tag.id !== tagId)
  if (isRepeated) {
    // todo
    alert(`标签名称 "${newName}" 已存在，请使用其他名称`);
    return
  }

  const tagIndex = data.tags.findIndex((tag) => tag.id === tagId);
  if (tagIndex > -1) {
    data.tags[tagIndex] = { ...data.tags[tagIndex], name: newName };
    data.items[tagId].forEach((item) => {
      item.tag = newName;
    });
  }

  LzStore.value.data = data;
};

// 移动卡片到另一个标签
export const moveCardToBankTag = async (
  fromTagId: string,
  toTag: Tag,
  cardId: string
) => {
  const data = LzStore.value.data;
  const fromItems = Array.isArray(data.items[fromTagId]) ? data.items[fromTagId] : [];
  const cardIndex = fromItems.findIndex((item) => item.chatMessageId === cardId);
  if (cardIndex > -1) {
    const card = fromItems.splice(cardIndex, 1)[0];
    if (!data.items[toTag.id]) {
      data.items[toTag.id] = [];
    }

    data.items[toTag.id].push({...card, tag: toTag.name, tagId: toTag.id});
  }
};

// 删除卡片
export const removeCardFromBankTag = async (tagId: string, card: Card) => {
  const data = LzStore.value.data;

  const targetItems = Array.isArray(data.items[tagId]) ? data.items[tagId] : [];
  const cardIndex = targetItems.findIndex((item) => {
    // 对于Quiz类型，需要同时匹配chatMessageId和quizId
    if (item.type === LzBankKind.Quiz && card.quizId) {
      return item.chatMessageId === card.chatMessageId && item.quizId === card.quizId;
    }
    // 其他类型只匹配chatMessageId
    return item.chatMessageId === card.chatMessageId;
  });

  if (cardIndex > -1) {
    targetItems.splice(cardIndex, 1);
  } else {
    console.warn(`Card with chatMessageId: ${card.chatMessageId} not found in tag: ${tagId}`);
  }
};

// 更新卡片字段
export const updateCardField = async (
  card: Card,
  field: keyof Card,
  value: any
) => {
  const data = LzStore.value.data;

  // 遍历所有标签寻找该卡片
  for (const tagId in data.items) {
    const items = data.items[tagId];
    const cardIndex = items.findIndex((item) => {
      // 对于Quiz类型，需要同时匹配chatMessageId和quizId
      if (item.type === LzBankKind.Quiz && card.quizId) {
        return item.chatMessageId === card.chatMessageId && item.quizId === card.quizId;
      }
      // 其他类型只匹配chatMessageId
      return item.chatMessageId === card.chatMessageId;
    });

    if (cardIndex > -1) {
      // 更新字段
      items[cardIndex] = { ...items[cardIndex], [field]: value };
      break;
    }
  }
};

// 加入收藏
export const addToFavorites = async (card: Card, tagId?: string | undefined) => {
  const currentData = LzStore.value.data;
  const targetTagId = tagId || LZ_DEFAULT_TAG.id;
  if (!currentData.items[targetTagId]) currentData.items[targetTagId] = [];
  currentData.items[targetTagId].push({ ...card, tag: targetTagId, tagId: targetTagId });
};

export const batchAddToFavorites = async (cards: Card[], tagId?: string | undefined) => {
  const currentData = LzStore.value.data;
  const targetTagId = tagId || LZ_DEFAULT_TAG.id;
  
  if (!currentData.items[targetTagId]) {
    currentData.items[targetTagId] = [];
  }
  
  const cardsWithTag = cards.map(card => ({ ...card, tag: targetTagId, tagId: targetTagId }));
  currentData.items[targetTagId].push(...cardsWithTag);
  
  return cards.length;
}

type RemoveToFavoritesParams = 
  | { type:LzBankKind.Quiz; messageId: Ref<string>; quizId: string }
  | { type: Exclude<LzBankType, LzBankKind.Quiz>; messageId: Ref<string> };

export const removeToFavorites = async(params: RemoveToFavoritesParams) => {
  const currentData = LzStore.value.data;
  
  if (params.type === LzBankKind.Quiz) {
    for (const tagId in currentData.items) {
      const items = currentData.items[tagId];
      const filteredItems = items.filter(
        (card: Card) => {
          return !(card.chatMessageId === params.messageId.value && card.quizId === params.quizId)
        }
      );
      if (filteredItems.length !== items.length) {
        currentData.items[tagId] = filteredItems;
        
        break;
      }
    }
  } else {
    for (const tagId in currentData.items) {
      const items = currentData.items[tagId];
      const filteredItems = items.filter(
        (card: Card) => card.chatMessageId !== params.messageId.value
      );
      
      if (filteredItems.length !== items.length) {
        currentData.items[tagId] = filteredItems;
      }
    }
  }
}

// 获取某个messageId下所有加入收藏的题目id，出题特有
export const getFavoritesQuiz = (messageId: string) => {
  return Object.values(LzStore.value.data?.items || {})
    .flat()
    .filter((card: Card) => card.chatMessageId === messageId)
    .map((card: Card) => card.quizId)
    .filter(Boolean)
}

// 响应式 store
export const LzStore = ref({
  data:  {
    tags: [LZ_DEFAULT_TAG, LZ_FEATURED_TEMPLATED],
    items: { [LZ_DEFAULT_TAG.id]: [], [LZ_FEATURED_TEMPLATED.id]: LZ_TEMPLATED_CARD },
  } as BankData,
});

// 初始化标志，防止初始化时触发 watch
export const isInitializing = ref(true);

watch(
  () => LzStore.value.data,
  async (newData) => {
    // 初始化期间不触发存储同步
    if (isInitializing.value) return;
    await saveBankData(newData);
  },
  { deep: true }
);

// 初始化 store
const init = async () => {
  const data = await getBankData();
  if (data.tags.length > 0 || Object.keys(data.items).length > 0) {
    LzStore.value.data = data;
  }
  isInitializing.value = false;
};

init();
