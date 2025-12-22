import MarkdownIt from 'markdown-it';

export enum SelectButtonStatus {
    Summary = "Summary",
    Transcript = "Translation",
    AudioRecording = "Audio Recording",
    StopRecord = "StopRecordPage",
    Record = "RecordPage",
}
export interface TranslationResult {
    role: string;
    msg: string;
    offset: number;
    duration: boolean;
}
const md = new MarkdownIt();
// 用于存储拼接的 jsonStr 内容
let concatenatedJsonStr = '';

export function extractContent(jsonStr: string): string {
    try {
        // 将新接收到的 jsonStr 拼接到已有内容
        concatenatedJsonStr += jsonStr;
        console.log('接收到的内容:', concatenatedJsonStr);
        // const obj = JSON.parse(jsonStr) as {
        //   choices?: { message?: { content?: string } }[];
        // };
    
        // const content = obj?.choices?.[0]?.message?.content ?? '';
        // 对拼接后的内容进行 markdown 渲染
        const rendered = md.render(concatenatedJsonStr);
        return rendered;
    } catch (e) {
        console.error('处理失败:', e);
        return '';
    }
}

// 可选：提供一个重置拼接内容的函数
export function resetConcatenatedContent() {
    concatenatedJsonStr = '';
}