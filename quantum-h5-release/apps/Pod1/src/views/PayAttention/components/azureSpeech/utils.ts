interface TranscriptionWord {
  t: string; // 词文本
  startSec: number; // 开始时间（秒）
  endSec: number; // 结束时间（秒）
}

export interface TranscriptionSegment {
  text: string;
  startSec: number;  // 段开始（秒）
  endSec: number;    // 段结束（秒）——可由 Duration 或下一段推导
  speaker?: string;
  words?: TranscriptionWord[];
}
export interface ClusteredSegment extends TranscriptionSegment {
  speakerId: number;
  clusterId: number;
}

export const EPS = 0.08;          // 60ms，抵消采样/渲染延迟

/**
 * @param text
 * @returns 是否为英文单词
 */
export const isEnglishWord = (text: string): boolean => {
  // 检查是否包含CJK字符（中文、日文、韩文等）
  // \u4e00-\u9fff 是中文
  // \u3040-\u309f 是日文平假名
  // \u30a0-\u30ff 是日文片假名
  // \uac00-\ud7af 是韩文
  const cjkRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;
  return !cjkRegex.test(text);
};

// tick → 秒
export const tickToSec = (v?: number | string): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n / 10_000_000 : 0;
};


// 由开始/结束时间判定 t 属于哪个段
export function pickIndexByTime(t: number, list: ClusteredSegment[]): number {
  if (!list.length) return -1;
  for (let i = 0; i < list.length; i++) {
    const start = Math.max(0, list[i].startSec - EPS);
    const end   = Math.max(start, (list[i].endSec ?? start) + EPS);
    if (t >= start && t < end) return i;
  }
  // 若 t 超过最后一个段，返回最后一段
  return list.length - 1;
}

// 从 summaryData 的 recordResult 转换为 TranscriptionSegment[]
// recordResult 的数据结构应该和 onTranscription 接收的数据类似
export const convertRecordResultToSegments = (recordResult: any[]): TranscriptionSegment[] => {
  if (!Array.isArray(recordResult)) return [];

  return recordResult.map((item: any) => {
    // 处理 tick 格式的时间（转换为秒）
    const startSec = item.startTime ? tickToSec(item.startTime) : 0;
    const durSec = item.duration ? tickToSec(item.duration) : 0;
    const endSec = item.endSec ?? (durSec > 0 ? startSec + durSec : startSec);

    return {
      text: item?.message ?? "",
      startSec,
      endSec,
      speaker: item.speaker || item.role || "",
      words: item.words || undefined,
    };
  });
};

/**
 * 规范化结束时间
 * @param list
 */
export function normalizeEnds(list: TranscriptionSegment[]): void {
  list.sort((a, b) => a.startSec - b.startSec);
  for (let i = 0; i < list.length; i++) {
    const cur = list[i];
    const next = list[i + 1];
    if (!(cur.endSec > cur.startSec)) {
      cur.endSec = next ? next.startSec : cur.startSec + 3; // 兜底 3s
    } else if (next && cur.endSec > next.startSec) {
      cur.endSec = Math.max(cur.startSec, next.startSec);   // 去重叠
    }
  }
}



function tokenize(text: string): string[] {
  // 有空格就按空格切；无空格（中文等）则按字符切
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (/\s/.test(trimmed)) {
    return trimmed.split(/\s+/).filter(Boolean);
  }
  return Array.from(trimmed); // 中文逐字
}

export function injectPseudoWordTimes(list: TranscriptionSegment[]): void {
  for (const seg of list) {
    if (seg.words?.length) continue;
    const tokens = tokenize(seg.text);
    if (!tokens.length) continue;

    const span = Math.max(0.3, seg.endSec - seg.startSec); // 最少 0.3s 防止 0
    const slot = span / tokens.length;

    seg.words = tokens.map((t, i) => {
      const s = seg.startSec + i * slot;
      return { t, startSec: s, endSec: s + slot * 0.98 };
    });
  }
}
