import MarkdownIt from 'markdown-it';

export enum SelectButtonStatus {
    Summary = "Summary",
    Transcript = "Translation",
    AudioRecording = "Audio Recording",
    StopRecord = "StopRecordPage",
    Record = "RecordPage",
}

export enum ErrorType {
    FATAL = 'fatalError',
    TEMPORARY = 'temporaryError',
    NONE = '',
}
export interface TranslationResult {
    role: string;
    msg: string;
    offset: number;
    duration: boolean;
}
const md = new MarkdownIt();
export function extractContent(content: string): string {
    try {
      const rendered = md.render(content);
      return rendered;
    } catch (e) {
      console.error('JSON 解析失败:', e);
      return '';
    }
  }
