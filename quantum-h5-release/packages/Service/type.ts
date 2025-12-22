import { FetchRequestConfig } from "./fetch";

export interface ShellReq<T extends (Object | string)> {
    MessageSource?: string,
    Timestamp?: number,
    MessageId?: string,
    Data: T,
    linkPostMessage?: string | boolean,
}
export interface ShellRes<T extends Record<string, unknown> = Record<string, unknown>> {
    MessageSource: string,
    Timestamp: number,
    MessageId: string,
    ErrorCode: number,
    ErrorMessage: string,
    Data?: T,
    data?: T,
}
export type BaseRes<T> = Promise<Partial<FetchRequestConfig<T>>>

export type MessageDirection = 0 | 1;

export interface MessageReq<T extends Record<string, unknown>> extends ShellReq<T> {
    Direction: MessageDirection;
    MessageDestination: string;
    MessageMethod: string;
}
export interface MessageRes<T extends Record<string, unknown>> extends ShellRes<T> {
    Direction: MessageDirection;
    MessageDestination: string;
    MessageMethod: string;
}
