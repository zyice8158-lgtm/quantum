import { ChannelMessageAdapter, ChannelMessage, ChannelMessageType } from "./type";
import { BroadcastChannelAdapter } from "./BroadcastChannelAdapter";

export class CrossTabCommunicator {
  private adapter: ChannelMessageAdapter;
  private messageCallback?: (message: ChannelMessage) => void;

  constructor(channelName: ChannelMessageType) {
    this.adapter = new BroadcastChannelAdapter(channelName);
    this.adapter.onMessage((message) => {
      if (this.messageCallback) {
        this.messageCallback(message);
      }
    });
  }

  send<T = any>(type: string, data: T): void {
    const message: ChannelMessage<T> = {
      type,
      data,
      timestamp: Date.now()
    };
    this.adapter.send(message);
  }

  onMessage(callback: (message: ChannelMessage) => void): void {
    this.messageCallback = callback;
  }

  close(): void {
    this.adapter.close();
  }
}