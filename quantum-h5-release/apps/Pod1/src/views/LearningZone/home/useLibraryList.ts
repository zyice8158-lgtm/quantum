import { ref, computed } from "vue";
import { LzBankType, Tag, Card, Type } from "../../../types/lz";
import { removeBankTag, addBankTag, updateBankTag, removeCardFromBankTag, moveCardToBankTag, LzStore } from "../../../store/lz";
import { LZ_DEFAULT_TAG, LZ_DEFAULT_TAG_NAME, LZ_DEFAULT_TYPE, LZ_TYPE_MAP, LZ_FEATURED_TEMPLATED } from "../../../constant/lz.ts";
export interface LibraryState {
  currentType: LzBankType;
  currentTag: string;
  cards: Card[];
  loading: boolean;
}

// 将状态提升到模块级别，避免路由切换时被重置
const currentType = ref<Type>(LZ_TYPE_MAP?.[0]);
const currentTag = ref<Tag>(LZ_DEFAULT_TAG);
const sortByDesc = ref<boolean>(true);
const cards = ref<Card[]>([]);

export function useLibraryList() {
  // 加载状态
  const loading = ref(false);

  // 排序选项 - 只保留时间排序
  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
  ];
  // 计算当前类型的标签列表
  const tagList = computed(() => {
    const bankData = LzStore.value.data;
    const tags = bankData?.tags || [];

    return tags;
  });

  // 判断是否有用户创建的内容（除了Featured templates之外的数据）
  const hasUserCreatedContent = computed(() => {
    const bankData = LzStore.value.data;
    const items = bankData?.items || {};
    const featuredTemplateId = LZ_FEATURED_TEMPLATED.id;
    
    // 检查除Featured templates标签外的其他标签是否有数据
    for (const tagId in items) {
      if (tagId !== featuredTemplateId && Array.isArray(items[tagId]) && items[tagId].length > 0) {
        return true;
      }
    }
    
    return false;
  });

  // 切换标签
  const switchTag = (tag: Tag) => {
    currentTag.value = tag;
  };

  // 根据创建时间排序
  const sortByCreatedDate =(items: Card[], isDesc: boolean): Card[] => {
    const newList = [...items].sort((a, b) => {
      const dateA = a.createdDate as number;
      const dateB = b.createdDate as number;
      return isDesc ? dateB - dateA : dateA - dateB;
    });
    cards.value = newList;
    return newList;
  };

  const toggleSort = () => {
    const newSortByDesc = !sortByDesc.value;
    sortByDesc.value = newSortByDesc;
    sortByCreatedDate(cards.value, newSortByDesc);
  };

  // 加载卡片数据
  const getList = async () => {
    const bankData = LzStore.value.data;
    let allCards: Card[] = [];
    if (currentTag.value?.id === LZ_DEFAULT_TAG_NAME) {
      Object.values(bankData.items).forEach((tagCards) => {
        allCards.push(...tagCards);
      });
    } else {
      const tagId = currentTag.value?.id;
      if (tagId && bankData.items[tagId]) {
        allCards = [...bankData.items[tagId]];
      }
    }
    
    if (currentType.value?.id !== LZ_DEFAULT_TYPE) {
      const filterType = currentType.value?.id as LzBankType;
      allCards = allCards.filter((card) => card.type === filterType);
    }
    
    // 排序并更新
    cards.value = sortByCreatedDate(allCards, sortByDesc.value);
  };

  // 添加标签
  const addTag = async (name: string) => {
    try {
      const tag = await addBankTag(name);
      currentTag.value = tag;
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  // 删除标签
  const removeTag = async (tag: Tag) => {
     await removeBankTag(tag);
      if (currentTag.value?.id === tag.id) {
        const bankData = LzStore.value.data;
        const firstTag = bankData.tags[0] || null;
        currentTag.value = firstTag;
      }
  };

  // 更新标签名
  const updateTag = async (tag: Tag, newName: string) => {
    try {
      const trimmedName = newName.trim();

      await updateBankTag(tag.id || '', trimmedName);
      
      if (currentTag.value?.id === tag.id) {
        currentTag.value.name = newName;
      }
    } catch (error) {
      console.error("Failed to update tag:", error);
    }
  };

  // 移动卡片到另一个标签
  const moveCardToTag = async (card: Card, toTag: Tag) => {
    await moveCardToBankTag(card.tagId, toTag,card.chatMessageId);
    getList()
  };

  // 删除卡片
  const removeCard = async (card: Card) => {
    await removeCardFromBankTag(card?.tagId, card);
    getList()
  };

  // 切换类型并加载
  const switchType = (t: Type) => {
    if (currentType.value.id === t.id) return;
    currentType.value = t;
  };

  return {
    // 状态
    currentType,
    currentTag,
    cards,
    loading,
    sortByDesc,
    sortOptions,

    // 计算属性
    tagList,
    hasUserCreatedContent,

    // 方法
    switchTag,
    getList,
    addTag,
    removeTag,
    updateTag,
    moveCardToTag,
    removeCard,
    switchType,
    toggleSort,
    sortByCreatedDate,
  };
}
