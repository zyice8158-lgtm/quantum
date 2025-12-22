import { MessageDirection, WebviewMessager } from "@libs/service";
import { useBroadcastChannel } from "@quantum/use";
import { withModifiers } from "vue";
import { closeQuantumAppBar, closeWindow, openQuantumAppWin, WindowStore } from "./window";
import { ChatWinChangeView, ChatWinStore } from "./chatWin";

import { IconClose, IconNewChat2, IconSettings } from "@quantum/icons";
import { BarMode, changeBarMode } from ".";

export const PopupChannel = useBroadcastChannel("popup", {
  immediate: false,
});

export const PopupMenus = {
  // CreateZone: {
  //   label: "Memory",
  //   icon: "pi pi-plus",
  //   command() {
  //     openQuantumAppWin("#/quantum/creator-zone");
  //   },
  // },
  // LearningZone: {
  //   label: "Memory",
  //   icon: "pi pi-plus",
  //   command() {
  //     openQuantumAppWin("#/quantum/learning-zone");
  //   },
  // },
  // Memory: {
  //   label: "Memory",
  //   icon: "pi pi-plus",
  //   command() {
  //     openQuantumAppWin("#/quantum/memories");
  //   },
  // },
  // Help: {
  //   label: "Help",
  //   icon: "pi pi-plus",
  //   command() {
  //     alert("PinToTaskbar");
  //   },
  // },
  // PinToTaskbar: {
  //   label: "Settings",
  //   icon: "pi pi-plus",
  //   command() {
  //     alert("PinToTaskbar");
  //   },
  // },
  Settings: {
    label: "layout.settings",
    icon: IconSettings,
    command() {
      openQuantumAppWin("#/settings");
    },
  },
  Close: {
    label: "common.close",
    icon: IconClose,
    command() {
      if (WindowStore.current.type === "Bar") {
        closeQuantumAppBar()
      } else if (WindowStore.current.type === "FullView") {
        closeWindow()
      } else {
        closeWindow()
      }
    },
  },
  NewChat: {
    label: "chat.newChat",
    icon: IconNewChat2,
    command() {
      ChatWinStore.currentChatId = "";
      if (ChatWinStore.view != "Chat") {
        ChatWinStore.view = "Chat"
      }
      if (WindowStore.current.type === "Bar") {
        ChatWinChangeView("Chat");
        changeBarMode(BarMode.IDLE);
      }
    },
  },
};

/** Get Popup Menu */
const getPopupMenu = (key: keyof typeof PopupMenus) => {
  const { label } = PopupMenus[key];
  return { key, winId: WindowStore.current.id, label };
};

export interface popupMenuCommand {
  key: string;
  winId: string;
}

PopupChannel.on("command", (opts: popupMenuCommand) => {
  const { key, winId } = opts;
  console.log('command', key, winId);
  if (winId == WindowStore.current.id) {
    const { command } = PopupMenus[key as keyof typeof PopupMenus] || {};
    closePopup();
    command?.();
  }
});

export const closePopup = () => {
  const message = {
    Direction: 0 as MessageDirection,
    MessageDestination: "",
    MessageMethod: "ClosePopup",
    Data: {},
  };
  WebviewMessager.sendPostMessage(message);
};

export const openPopup = (opts: { menus: any[], HorizontalOffset: number, VerticalOffset: number }) => {
  const { menus = [], HorizontalOffset = 0, VerticalOffset = 0 } = opts || {};
  PopupChannel.emit("menus", menus);
  const Width = 208;
  const message = {
    Direction: 0 as MessageDirection,
    MessageDestination: "",
    MessageMethod: "OpenPopup",
    Data: {
      Width,
      Height: menus.length * 60 + 4,
      HorizontalOffset: HorizontalOffset + Width - 12,
      VerticalOffset: VerticalOffset + 16,
      Url: "#/popup",
    } as {
      Width: number;
      Height: number;
      HorizontalOffset: number;
      VerticalOffset: number;
      Url: string;
    },
  };
  WebviewMessager.sendPostMessage(message);
};



export const onContextmenuPopup = withModifiers((e: PointerEvent) => {
  const menus = [
    getPopupMenu("NewChat"),
    getPopupMenu("Settings"),
    getPopupMenu("Close")
  ];

  openPopup({ menus, HorizontalOffset: e.x, VerticalOffset: e.y });
}, ["prevent"]);
