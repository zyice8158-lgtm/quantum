import { buildContextualContent, buildSuggestionContent, SuggestionItemType, SuggestionStore } from "@/store/suggestion";
import { IconAiScan, IconCopilot, IconRememberThis } from "@quantum/icons";
import { defineComponent, PropType } from "vue";
import { ChatController } from "@libs/p-comps";
import { openNewWindow, startDragWindow } from "@/store/window";
import { ChatViewBus, ChatWinStore } from "@/store/chatWin";
const SuggestionCardIconMap: Record<string, any> = {
  memory: IconRememberThis,
  article: IconAiScan,
  copilot: IconCopilot,
};


const setQuerySuggestion = async (item: SuggestionItemType, chat: ChatController, files: any[]) => {
  if (item.name == "add_memory") {
    openNewWindow("FullView", "#/quantum/memories");
  } else if (item.name === "add_document") {
    openNewWindow("FullView", "#/quantum/memories");
  } else {
    const itemWithFiles = {
      ...item,
      files,
    };
    ChatWinStore.view = 'Chat';
    setTimeout(() => {
      ChatViewBus.emit('setQueryObject', buildContextualContent(itemWithFiles));
    }, 1000)
  }
};
const setQuerySuggestionStatic = async (item: SuggestionItemType, chat: ChatController, files: any[]) => {
  const itemWithFiles = {
    ...item,
    files,
  };
  ChatWinStore.view = 'Chat';
  setTimeout(() => {
    ChatViewBus.emit('setQueryObject', buildSuggestionContent(itemWithFiles));
  }, 1000)
};

const SuggestionCard = defineComponent({
  name: "SuggestionCard",
  props: {
    item: {
      type: Object as PropType<SuggestionItemType>,
    },
  },
  setup(props) {
    const Icon = SuggestionCardIconMap[props.item.type];
    return () => {
      return (
        <div class="flex-none bg-white rounded-[24px] px-[16px] h-[66px] flex items-center cursor-pointer border-color-button">
          <Icon
            class={[
              "flex-none mr-[9px]",
              props.item.type == "copilot" ? "text-[48px]" : "text-[32px]",
            ]}
          />
          <div>
            {/* <div class="text-[15px] font-[600] text-[#161C27]">{props.item.name}</div> */}
            {/* <div class="text-[10px] text-[#5F5E60]">{props.item.description}</div> */}
            <div class="text-[14px] font-[600] text-[#5F5E60]">{props.item.description}</div>
          </div>
        </div>
      );
    };
  },
});

const SuggestionTag = defineComponent({
  name: "SuggestionTag",
  props: {
    item: {
      type: Object as PropType<SuggestionItemType>,
    },
  },
  setup(props) {
    return () => (
      <div class="flex-none bg-white/60 rounded-[32px] border border-white py-[8px] px-[16px] text-[12px] text-[#0E131E] cursor-pointer border-color-button">
        {props.item.name}
      </div>
    );
  },
});

export const SuggestionContainer = defineComponent({
  name: "SuggestionContainer",
  props: {
    chat: {
      type: ChatController,
    },
    files: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const CopilotItem = {
      name: "Explore with Copilot",
      // description: "Dive deeper on your favorite topics",
      description: "Explore with Copilot",
      type: "copilot",
    };
    return () => (
      <div class="suggestion-container acrylic-view px-[20px] py-[24px] rounded-[32px]" onMousedown={startDragWindow}>
        <div class="flex gap-[24px] flex-wrap" v-automation="suggestion_cards">
          {SuggestionStore.Contextual.slice(0, 3).map((item) => {
            return (
              <SuggestionCard
                item={item}
                onClick={setQuerySuggestion.bind(null, item, props.chat, props.files)}
              />
            );
          })}
        </div>
        <div class="flex gap-[12px] mt-[22px] overflow-auto empty:hidden" v-automation="suggestion_tags">
          {SuggestionStore.Suggestion.slice(0, 3).map((item) => {
            return (
              <SuggestionTag
                onClick={setQuerySuggestionStatic.bind(null, item, props.chat, props.files)}
                item={item}
              />
            );
          })}
        </div>
      </div>
    );
  },
});
