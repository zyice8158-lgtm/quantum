import { isWebView } from "@/utils";
import { WebviewMessager } from "@libs/service";
import { reactive, watch } from "vue";
import { FileSearchListType } from "@libs/p-comps";
import { EventBus, useBroadcastChannelStore, useObjStorage } from "@quantum/use";

const MockData = {
  "Summary": `The screen displays a development environment with a C# code file open and a chat application. The chat discusses 'pc quantum live integration align,' a meeting, sharing chat history, and a 'user query' related to a C# code snippet that iterates through a collection of 'Tools' from a 'qtSuggestion'.`,
  "Contextual": [
    {
      "name": "proofread my message",
      "type": "memory",
      "description": "Check the syntax of statements"
    },
    {
      "name": "set an alarm",
      "type": "article",
      "description": "Set an alarm if you have to."
    },
    {
      "name": "add_memory",
      "type": "article",
      "description": "Set an alarm if you have to."
    },
    {
      "name": "set an alarm",
      "type": "article",
      "description": "Set an alarm if you have to."
    }
  ],
  "StaticSummary": "StaticSummary",
  "Suggestion": [
    {
      "name": "translate to spanish",
      "type": null,
      "description": null
    },
    {
      "name": "send an email",
      "type": null,
      "description": null
    },
    {
      "name": "create a study plan",
      "type": null,
      "description": null
    }
  ]
}

export interface SuggestionItemType {
  name: string;
  type?: string;
  description?: string;
  content?: string;
  files?: FileSearchListType[];
}

const Storage = useObjStorage('suggestion')

const defaultData = () => ({
  Summary: '',
  Contextual: [] as SuggestionItemType[],
  StaticSummary: '',
  Suggestion: [] as SuggestionItemType[]
})

export const SuggestionStore = useBroadcastChannelStore('SuggestionStore', reactive(defaultData()), { immediate: false })

EventBus.once('SetupApp', async (isFirstStart: boolean) => {
  if (isFirstStart) {
    await Storage.reset(defaultData())
  }
  const data = await Storage.get()
  updateSuggestion(data)
})


Object.keys(SuggestionStore).forEach((key: keyof typeof SuggestionStore) => {
  watch(() => SuggestionStore[key], () => {
    Storage.set(key, SuggestionStore[key])
  })
})

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const updateSuggestion = (data: any) => {
  const { Contextual, Suggestion, Summary, StaticSummary } = data || {};
  if (Summary) SuggestionStore.Summary = Summary;
  if (Contextual?.length) SuggestionStore.Contextual = Contextual;
  if (StaticSummary) SuggestionStore.StaticSummary = StaticSummary;
  if (Suggestion?.length) SuggestionStore.Suggestion = Suggestion;
};

const onDynamicSuggestion = (payload: any) => {
  const { MessageId,Suggestion } = payload.Data || {};
  if (Suggestion?.length) {
    const randomSuggestion = shuffleArray(Suggestion);
    payload.Data.Suggestion = randomSuggestion;
  }
  updateSuggestion(payload.Data);

  WebviewMessager.sendPostMessage(
    {
      Direction: 0,
      MessageSource: "WebMain",
      MessageDestination: "HubWindow",
      MessageMethod: "MsgResponse",
      Data: {
        MessageId,
      },
    })
};

WebviewMessager.on("DynamicSuggestion", onDynamicSuggestion);

if (!isWebView) {
  onDynamicSuggestion({
    Data: MockData
  })
}


export const buildContextualContent = (item: SuggestionItemType) => {
  const { name: chosen_tool_name, description } = item;

  const template = `Please ignore all steps related to "assessing and selecting a tool." The user has explicitly decided that the next action is to call the tool: ${chosen_tool_name}.

Your SOLE task is: Extract all necessary parameters for the tool ${chosen_tool_name}, based on the relevant context and chat history.
---
Relevant Context:
${SuggestionStore.Summary}
---
Please directly generate the JSON format for calling the tool ${chosen_tool_name} with its extracted parameters.`;

  const files = item.files?.map((file) => {
    return {
      name: file.fileName,
      path: file.filePath,
      fileId: file.fileId,
      base64: '',
      convertPath: file.convertPath || '',
    };
  }) || [];
  return {
    content: description,
    files,
    payload: {
      content: template,
      type: 'next-move'
    }
  }
}

export const buildSuggestionContent = (item: SuggestionItemType) => {
  const { name } = item;
  const files = item.files?.map((file) => {
    return {
      name: file.fileName,
      path: file.filePath,
      fileId: file.fileId,
      base64: '',
      convertPath: file.convertPath || '',
    };
  }) || [];
  return {
    content: name,
    files,
  }
}
