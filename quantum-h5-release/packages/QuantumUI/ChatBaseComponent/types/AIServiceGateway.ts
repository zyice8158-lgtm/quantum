// AIServiceGateway.ts
import { ChatSDK, StreamAnswerType, QuestionType } from '../types';
import { useEventBus } from '@quantum/use';

let sdkInstance: ChatSDK | null = null;
export const ChatEventBus = useEventBus({
  scopeName: 'ChatEventBus'
});
/**
 * 注入外部提供的 SDK 实现，不通过文件直接引入。
 */
export function setChatSDK(sdk: ChatSDK): void {
  sdkInstance = sdk;
  // 如果 SDK 提供了设置数据回调的方法，则把中间层的 receiveStreamData 回调传进去。
  if (sdk.setDataCallback) {
    sdk.setDataCallback(receiveStreamData);
  }
}

/**
 * 中间层方法：接收流式数据
 * SDK 在持续返回数据时，会调用这个方法。中间层再通过 EventBus 将数据通知给主类。
 */
export function receiveStreamData(data: StreamAnswerType): void {
  if (!data) {
    console.error("receiveStreamData: Missing required data parameter");
    return;
  }
  // 通过 EventBus 发出 "listenMessage" 事件
  ChatEventBus.emit("listenMessage", data);
}

/**
 * 调用 SDK 发送消息。SDK 在发送消息后会自己通过回调返回流式数据。
 */
export function sendServiceMsg(question: QuestionType): void {
  if (!sdkInstance) {
    console.error("Please first call setChatSDK to inject SDK implementation");
    return;
  }
  sdkInstance.sendMessage(question);
}

/**
 * 调用 SDK 停止消息的方法
 */
export function stopServiceMsg() {
  if (!sdkInstance) {
    console.error("Please first call setChatSDK to inject SDK implementation");
    return;
  }
  try {
    sdkInstance.stopMessage();
  } catch (error) {
    console.error("stopMessageError", error);
  }
}
