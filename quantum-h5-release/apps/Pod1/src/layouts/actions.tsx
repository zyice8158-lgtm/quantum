import {
  closeWindow,
  minWindow,
  openNewWindow,
  openQuantumBarWin,
  resetWindow,
  WindowStore,
} from "@/store/window";
import { ButtonIcon } from "@libs/p-comps/Button";
import { CrossTabCommunicator, ChannelMessageType, ChannelMessage, useTTSPlayer } from "@libs/service";
import { Icon2FullView, IconClose, IconFull, IconMini } from "@quantum/icons";
import { AiButton } from "@libs/p-comps/volt/QButton";
export const ButtonMini = () => {
  return (
    <AiButton category="actions" class="text-focus-focus" size="small" onClick={minWindow} v-automation="icon_mini">
      <IconMini />
    </AiButton>
  );
};
export const ButtonCloseMini = () => {
  const communicator = new CrossTabCommunicator(ChannelMessageType.CHATVIEW);
  const closeWindowMini = (id: string) => {
    communicator.send(ChannelMessageType.CHATVIEW, {
      type: 'chatClose'
    });
    // closeWindow(id);
  }
  return (
    <AiButton category="actions" size="small" onClick={closeWindowMini} v-automation="icon_close_mini">
      <IconMini />
    </AiButton>
  );
};

export const ButtonFull = () => {
  return (
    <AiButton category="actions" size="small" onClick={resetWindow} v-automation="icon_full">
      {WindowStore.isFull ? <IconFull /> : <Icon2FullView />}
    </AiButton>
  );
};

export const ButtonCloseQuantumApp = () => {
  const onClick = ()=>{
    useTTSPlayer.stop();
    openQuantumBarWin('#/prompt-bar')
  }
  return (
    <AiButton category="actions" size="small" onClick={onClick} v-automation="icon_close_qt">
      <IconClose />
    </AiButton>
  );
};
export const ButtonClose = () => {
  return (
    <AiButton category="actions" size="small" onClick={closeWindow}>
      <IconClose />
    </AiButton>
  );
};

export const Button2Fullview = (props: { beforeJump?: () => void }) => {
  const onClick = async () => {
    const chatId = await props.beforeJump?.();
    openNewWindow('FullView' ,`#/quantum/chat/${chatId}`);
  };
  return (
    <AiButton category="actions" size="small" onClick={onClick}>
      <Icon2FullView />
    </AiButton>
  );
};
