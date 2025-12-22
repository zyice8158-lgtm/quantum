export interface QAItem {
    question: string;
    answer: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    name?: string;
    contentHtml: string;
    highlight?: boolean;
}

export interface CardThemeOptions {
    pageTitle: string;
    primaryColor?: string;
    baseFontSize?: number;
    contentMaxWidth?: number;
}

/* ---------- 工具 ---------- */
function safeParseJSON<T>(text: string): T | null {
    try {
        return JSON.parse(text) as T;
    } catch {
        return null;
    }
}

function extractChoicesContent(obj: unknown): string | null {
    const o = obj as { choices?: Array<{ message?: { content?: string } }> } | null;
    const c = o?.choices?.[0]?.message?.content;
    return typeof c === "string" ? c : null;
}

/** 简单 Markdown 转 HTML（适合导出 Word） */
function simpleMarkdownToHtml(md: string): string {
    let html = md.trim();
    html = html.replace(/\r\n/g, "\n");

    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/(?:^|\n)- (.+?)(?=\n(?!- )|$)/gms, (m) => {
        const items = m
            .trim()
            .split("\n")
            .map((s) => s.replace(/^- /, "").trim())
            .map((s) => `<li>${s}</li>`)
            .join("");
        return `<ul>${items}</ul>`;
    });
    html = html.replace(
        /(^|\n)(?!<h\d>|<ul>|<li>|<\/li>|<\/ul>)([^\n]+)(?=\n|$)/g,
        (_, p1, p2) => `${p1}<p>${p2}</p>`
    );
    return html;
}

/* ---------- 数据映射 ---------- */
function normalizeToMessages(input: string | QAItem[]): ChatMessage[] {
    if (typeof input === "string") {
        const parsed = safeParseJSON<unknown>(input);
        const md = parsed ? extractChoicesContent(parsed) : null;
        const content = md ?? input;
        return [
            {
                id: "1",
                role: "assistant",
                name: "AnswerCard",
                contentHtml: simpleMarkdownToHtml(content),
                highlight: true,
            },
        ];
    } else {
        const out: ChatMessage[] = [];
        input.forEach((qa, idx) => {
            const q = qa.question?.trim();
            if (q) {
                out.push({
                    id: `q-${idx}`,
                    role: "user",
                    name: "Query",
                    contentHtml: simpleMarkdownToHtml(q),
                });
            }
            const ansRaw = qa.answer?.trim();
            if (ansRaw) {
                const maybeObj = safeParseJSON<unknown>(ansRaw);
                const ansMd = maybeObj ? extractChoicesContent(maybeObj) : null;
                const finalMd = ansMd ?? ansRaw;
                out.push({
                    id: `a-${idx}`,
                    role: "assistant",
                    name: "Answer",
                    contentHtml: simpleMarkdownToHtml(finalMd),
                });
            }
        });
        return out;
    }
}

/* ---------- HTML 渲染 ---------- */
function renderMessageCard(msg: ChatMessage, primaryColor: string): string {
    const bg = msg.role === "user" ? "#eef2ff" : "#f3f4f6";
    const border = msg.highlight ? primaryColor : "#e5e7eb";
    return `
    <div style="page-break-inside:avoid;margin:12px 0;padding:12px 16px;border:1px solid ${border};
    border-radius:12px;background:${bg};box-shadow:0 1px 2px rgba(0,0,0,0.04);">
    <div style="font-weight:700;margin-bottom:6px;">${msg.name ?? msg.role}</div>
    <div style="font-size:14px;line-height:1.6;color:#111827;">${msg.contentHtml}</div>
    </div>`;
}

/* ---------- 主函数 ---------- */
export function buildChatHtml(input: string | QAItem[], theme: CardThemeOptions): string {
    const msgs = normalizeToMessages(input);
    const color = theme.primaryColor ?? "#4F46E5";
    const htmlCards = msgs.map((m) => renderMessageCard(m, color)).join("");

    return `<!DOCTYPE html>
  <html lang="zh-CN">
  <head>
  <meta charset="UTF-8" />
  <title>${theme.pageTitle}</title>
  <style>
    body { font-family: 'Microsoft YaHei', Arial, sans-serif; background:#fff; margin:20px auto; 
     max-width:${theme.contentMaxWidth ?? 820}px; font-size:${theme.baseFontSize ?? 14
        }px; color:#111827;}
    h1,h2,h3 {margin:10px 0;}
    p {margin:8px 0;}
  </style>
  </head>
  <body>
    <h2 style="text-align:center;margin-bottom:20px;">${theme.pageTitle}</h2>
    ${htmlCards}
  </body>
  </html>`;
}


