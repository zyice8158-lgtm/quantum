// BroadcastChannelAdapter.ts
import { ChannelMessageAdapter, ChannelMessage } from "./type";

export class BroadcastChannelAdapter implements ChannelMessageAdapter {
  private channel: BroadcastChannel;
  private messageCallback?: (message: ChannelMessage<unknown>) => void;
  private readonly name: string;

  constructor(channelName: string) {
    this.name = channelName;
    const isWV2 = !!(window as unknown as { chrome?: { webview?: unknown } }).chrome?.webview;
    console.log(
      `[BCA] init channel=${channelName} ua=${navigator.userAgent} isWebView2=${isWV2} origin=${location.origin}`
    );

    if (typeof BroadcastChannel === "undefined") {
      console.error("[BCA] BroadcastChannel 不可用（被策略禁用或环境不支持）");
      // 这里仍然创建一个假对象，避免调用方崩溃
      // 但要让上层的“自检”去提示宿主转发或改 profile
      // @ts-expect-error mock for fail-fast
      this.channel = { postMessage() {}, close() {} };
      return;
    }

    this.channel = new BroadcastChannel(channelName);
    this.channel.onmessage = (event: MessageEvent<ChannelMessage<unknown>>) => {
      this.messageCallback?.(event.data);
    };
  }

  send<T>(message: ChannelMessage<T>): void {
    try {
      this.channel.postMessage(message);
    } catch (e) {
      console.error(`[BCA] postMessage 失败 channel=${this.name}`, e);
    }
  }

  onMessage(callback: (message: ChannelMessage<unknown>) => void): void {
    this.messageCallback = callback;
  }

  close(): void {
    try { this.channel.close(); } catch { /* ignore */ }
  }
}
