export interface ChannelMessage<T = any> {
  type: string;
  data: T;
  timestamp: number;
}

export interface ChannelMessageAdapter<T = any> {
  send(message: ChannelMessage<T>): void;
  onMessage(callback: (message: ChannelMessage<T>) => void): void;
  close(): void;
}

export enum ChannelMessageType {
  MAINCHAT = 'mainChat',
  LIVE = 'live',
  RECORD = 'record',
  CHATVIEW = 'chatView'
}