<template>
  <div class="dropdown-container">
    <!-- 下拉框触发器 -->
    <div class="dropdown-trigger"
         :class="{ 'dropdown-open': isOpen }"
         @click="
        (e) => {
          show(e);
        }
      ">
      <span class="selected-option">{{ props.currentTag?.name }}</span>
      <IconArrowLeft class="dropdown-arrow text-text-on-surface-muted" />
    </div>
    <Popover ref="op"
             @show="handlePopoverShow"
             @hide="handlePopoverHide">
      <div class="tags_wrapper">
        <template v-for="(item, index) in tagList"
                  :key="item.id">
          <!-- 编辑模式 -->
          <div v-if="editingTagId === item.id"
               class="tag tag_edit_input"
               :class="getTagColorClass(index)">
            <input v-model="editingTagName"
                   @blur="()=>handleBlurEdit(item)"
                   @keyup.enter="()=>handleConfirmEdit(item)"
                   @keyup.escape="handleCancelEdit"
                   @click.stop
                   ref="editTagInputRef"
                   class="tag-input"
                   placeholder="Enter tag name" />
          </div>
          <!-- 显示模式 -->
          <div v-else
               class="tag"
               :class="[getTagColorClass(index),{
              tag_selected: currentTag?.id === item.id
            }]"
               @click.stop="()=>switchTag(item)">
            {{ item.name }}
            <div class="tag-edit-icon"
                 @click.stop
                 v-if="![0,1].includes(index) ">
              <DropdownMenu :items="getDropdownItems(item)"
                            :trigger="['click']"
                            radiusSize="small"
                            isTiered
                            class="tag-dropdown-menu">
                <IconAction />
              </DropdownMenu>
            </div>
          </div>
        </template>
        <!-- 输入框模式 -->
        <div v-if="showNewInput"
             class="tag tag_new_input"
             :class="getTagColorClass(tagList.length)">
          <input v-model="newTagName"
                 @blur="handleBlur"
                 @keyup.enter="handleConfirmAdd"
                 @keyup.escape="handleCancelAdd"
                 @click.stop
                 ref="newTagInputRef"
                 class="tag-input"
                 placeholder="Enter tag name" />
        </div>
        <div v-else
             class="tag tag_new"
             @click.stop="handleShowNewInput">
          <IconAdd class="tag-add-icon" />
          New
        </div>
      </div>
    </Popover>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { IconAdd, IconArrowLeft, IconAction, IconEdit2, IconRecycleBin } from "@quantum/icons";
import Popover from "@libs/p-comps/volt/Popover.vue";
import DropdownMenu from "@libs/p-comps/Dropdown";
import { TAG_COLOR_MAP } from './constants';

const props = defineProps({
  addTag: {
    type: Function,
    default: null
  },
  updateTag: {
    type: Function,
    default: null
  },
  removeTag: {
    type: Function,
    default: null
  },
  tagList: {
    type: Array,
    default: () => []
  },
  currentTag: {
    type: Object,
  },
  switchTag: {
    type: Function,
    default: null
  }
});

const isOpen = ref(false);
const showNewInput = ref(false);
const newTagName = ref('');
const newTagInputRef = ref(null);
const editingTagId = ref(null);
const editingTagName = ref('');
const editTagInputRef = ref(null);

const op = ref(null);

const show = (e) => {
  e.stopPropagation();
  op.value.toggle(e);
  isOpen.value = !isOpen.value;
};

// 监听Popover的show和hide事件
const handlePopoverShow = () => {
  isOpen.value = true;
};

const handlePopoverHide = () => {
  isOpen.value = false;
};

// 根据标签ID获取颜色class名
const getTagColorClass = (index) => {
  const colorKeys = Object.keys(TAG_COLOR_MAP);
  const ind = index % colorKeys.length;
  return colorKeys[ind];
};

const getDropdownItems = (tag) => {
  return [
    {
      label: "Edit Tag",
      icon: IconEdit2,
      command: () => handleEditTag(tag),
    },
    {
      label: "Delete Tag",
      icon: IconRecycleBin,
      command: () => handleDeleteTag(tag),
    },
  ];
};

const handleEditTag = (tag) => {
  editingTagId.value = tag.id;
  editingTagName.value = tag.name;
  setTimeout(() => {
    editTagInputRef.value?.focus();
    editTagInputRef.value?.select();
  }, 0);
};

const handleConfirmEdit = (tag) => {
  if (editingTagName.value.trim() && editingTagId.value) {
    props.updateTag?.(tag, editingTagName.value.trim());
  }
  editingTagId.value = null;
  editingTagName.value = '';
};

const handleCancelEdit = () => {
  editingTagId.value = null;
  editingTagName.value = '';
};

// 处理失焦编辑
const handleBlurEdit = (tag) => {
  if (editingTagName.value.trim()) {
    handleConfirmEdit(tag);
  } else {
    handleCancelEdit();
  }
};

const handleDeleteTag = (tag) => {
  props.removeTag?.(tag);
};

// 显示输入框
const handleShowNewInput = () => {
  showNewInput.value = true;
  newTagName.value = '';
  setTimeout(() => {
    newTagInputRef.value?.focus();
  }, 0);
};

const handleConfirmAdd = () => {
  if (newTagName.value.trim()) {
    props.addTag?.(newTagName.value.trim());
    newTagName.value = '';
  }
  showNewInput.value = false;
};

const handleCancelAdd = () => {
  newTagName.value = '';
  showNewInput.value = false;
};

const handleBlur = () => {
  if (newTagName.value.trim()) {
    handleConfirmAdd();
  } else {
    showNewInput.value = false;
  }
};
</script>

<style lang="less" scoped>
.dropdown-container {
  position: relative;
  display: inline-block;

  .dropdown-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-radius: 16px;
    height: 32px;
    cursor: pointer;
    user-select: none;
  }

  .selected-option {
    font-size: 14px;
    color: var(--color-inverse-surface);
    line-height: 20px;
    font-weight: 700;
  }

  .dropdown-arrow {
    font-size: 18px;
    color: var(--color-inverse-surface);
    transition: transform 0.2s ease;
    margin-left: 8px;
    transform: rotate(90deg);
  }
  .dropdown-open {
    .dropdown-arrow {
      transform: rotate(270deg);
    }
  }
}

.tags_wrapper {
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  gap: 12px;
  .tag {
    height: 36px;
    padding: 8px 16px;
    border-radius: 18px;
    border: 1px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    .tag-edit-icon {
      margin-left: 8px;
    }

    &.tag_selected {
      background: rgba(92, 141, 255, 1) !important;
      color: #fff !important;
    }

    /* 颜色1 - 蓝色系 */
    &.color1 {
      background-color: rgba(213, 227, 255, 1);
      border-color: rgba(92, 141, 255, 1);
      color: rgba(92, 141, 255, 1);
    }

    /* 颜色2 - 紫色系 */
    &.color2 {
      background-color: rgba(141, 129, 253, 0.1);
      border-color: rgba(141, 129, 253, 1);
      color: rgba(141, 129, 253, 1);
    }

    /* 颜色3 - 紫粉色系 */
    &.color3 {
      background-color: rgba(179, 115, 245, 0.2);
      border-color: rgba(179, 115, 245, 1);
      color: rgba(179, 115, 245, 1);
    }

    /* 颜色4 - 粉紫色系 */
    &.color4 {
      background-color: rgba(208, 106, 214, 0.1);
      border-color: rgba(208, 106, 214, 1);
      color: rgba(208, 106, 214, 1);
    }
    &.tag_new {
      background: rgba(133, 94, 225, 1);
      color: #fff;
      border-color: rgba(133, 94, 225, 1);
    }

    &.tag_new_input,
    &.tag_edit_input {
      padding: 0;

      .tag-input {
        width: 150px;
        height: 100%;
        padding: 8px 16px;
        border: none;
        border-radius: 18px;
        outline: none;
        background: transparent;
        font-size: 14px;
        font-weight: 500;

        &::placeholder {
          opacity: 0.6;
        }

        caret-color: inherit;
      }
    }

    .tag-add-icon {
      margin-right: 6px;
    }
  }
}
</style>
