interface Segment {
  id: string;
  text: string;
}

import { WebviewMessager } from "../message";
import { startSpeech, stopSpeech, } from "../fetch";
import { MessageRes } from "../type";
import { v4 as uuidv4 } from 'uuid';

class TTSPlayerService {
  private static instance: TTSPlayerService;
  private currentId: string | null = null;
  private cleanup: (() => void) | null = null;
  private queue: Segment[] = [];
  private punctuation = /([。！？!?，,；;.])/g;
  private buffer = '';
  private lastText = '';
  private playing = false;
  private stopped = false;
  private stopTimeout: number | null = null;

  private constructor() { }

  static getInstance(): TTSPlayerService {
    if (!TTSPlayerService.instance) {
      TTSPlayerService.instance = new TTSPlayerService();
    }
    return TTSPlayerService.instance;
  }

  /**
   * Play full text by splitting it into segments
   * @param fullText The complete text to be played
   * @param callback Optional callback when playback completes
   */
  play(fullText: string, callback?: () => void): void {
    if (this.stopped) return;
    fullText = this.getMarkdownPlainText(fullText);
    this.stop(); // Clear previous state
    this.buffer = fullText;

    console.log('play-收到完整文本--------', fullText);
    console.log('play-当前播放队列:--------', this.queue);

    this.processBufferIntoSegments();
    // 处理剩余的缓冲区内容
    if (this.buffer.trim()) {
      this.queue.push({
        id: uuidv4(),
        text: this.buffer.trim(),
      });
      this.buffer = '';
    }
    console.log('play-完整播放队列:--------', this.queue);


    // Start playback scheduling
    this.schedulePlayback(callback);
  }

  /**
   * Stream play text as it becomes available
   * @param fullText The accumulated text so far
   * @param isDone Whether this is the final text
   */
  streamPlay(fullText: string, isDone = false, callback?: () => void): void {
    if (this.stopped) return;
    fullText = this.getMarkdownPlainText(fullText);
    console.log('streamPlay-收到完整文本--------', fullText, isDone);
    console.log('streamPlay-上次处理的文本--------', this.lastText);
    console.log('streamPlay-当前缓冲区内容:--------', this.buffer);

    // Only process new content
    if (fullText.length <= this.lastText.length) {
      return;
    }
     // 处理回退（新内容不是以旧内容增量）
    if (!fullText.startsWith(this.lastText)) {
      this.queue = [];
      this.buffer = '';
      this.lastText = '';
    }

    const newPart = fullText.slice(this.lastText.length);
    this.lastText = fullText;
    this.buffer += newPart;

    this.processBufferIntoSegments();

    // Handle final segment when done
    if (isDone && this.buffer.trim()) {
      console.log('streamPlay-播放最终片段--------');
      this.queue.push({
        id: uuidv4(),
        text: this.buffer.trim(),
      });
      this.buffer = ''; // Clear buffer after adding final segment
    }

    this.schedulePlayback(callback);
  }

  /**
   * Process buffer content into sentence segments
   */
  private processBufferIntoSegments(): void {
    let match;
    while ((match = this.punctuation.exec(this.buffer)) !== null) {
      const cutIndex = match.index + 1;
      const sentence = this.buffer.slice(0, cutIndex).trim();
      this.buffer = this.buffer.slice(cutIndex);

      if (sentence) {
        this.queue.push({
          id: uuidv4(),
          text: sentence,
        });
      }
    }
  }

  /**
   * Schedule next segment for playback
   * @param callback Optional callback when all playback completes
   */
  private schedulePlayback(callback?: () => void): void {
    if (this.stopped) return;
    console.log('schedulePlayback-播放状态--------', this.playing);

    // Don't schedule if already playing
    if (this.playing) return;

    const next = this.queue.shift();
    console.log('schedulePlayback-播放下一个片段--------', next);

    // No more segments to play
    if (!next) return;

    this.playing = true;
    this.currentId = next.id;

    // Set up completion handler
    this.cleanup = WebviewMessager.on(next.id, (_: MessageRes<any>) => {
      console.log('schedulePlayback-播放完了某一段--------', this.queue);

      // Clean up listener
      if (this.cleanup) {
        this.cleanup();
        this.cleanup = null;
      }

      this.playing = false;

      // Check if we've finished all segments
      if (this.queue.length <= 0) {
        console.log('schedulePlayback-整体播放完了--------');
        callback?.();
        return;
      }

      // Continue with next segment
      this.schedulePlayback(callback);
    });

    console.log('schedulePlayback-播放文本是-------------', next.text);
    startSpeech({ MessageId: next.id, Data: { SpeakString: next.text } });
  }

  /**
   * Stop all playback and clear state
   */
  stop(): void {
    this.stopped = true;
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }

    stopSpeech({ Data: {} });

    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }

    // Reset all state
    this.playing = false;
    this.currentId = null;
    this.queue = [];
    this.buffer = '';
    this.lastText = '';

    this.stopTimeout = setTimeout(() => {
      this.stopped = false;
      this.stopTimeout = null;
    }, 1000);
  }

  /**
   * Check if there are segments currently playing or queued
   * @returns boolean indicating if playing
   */
  isPlaying(): boolean {
    return this.playing || this.queue.length > 0;
  }

  /**
   * Get current playing segment ID
   * @returns Current segment ID or null
   */
  getCurrentId(): string | null {
    return this.currentId;
  }
  getMarkdownPlainText(markdown: string): string {
    return markdown
      .replace(/<[^>]+>/g, '')
      .replace(/[@#$%^&*]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const useTTSPlayer = TTSPlayerService.getInstance();
