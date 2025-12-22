
export enum LzBankKind {
  Notes = 'notes',
  Record = 'record',
  Quiz = 'quiz',
}


// 题目类型枚举
export enum QuizType {
  CHOICE = 'choice',
  BOOL = 'bool',
  SAQ = 'saq',
}


export type LzBankType = LzBankKind.Notes | LzBankKind.Record | LzBankKind.Quiz;

export interface Type {
  id: string;
  name: string;
}
// 类型定义
export interface Tag {
  id: string;
  name: string;
}

export interface Card {
  title: string;
  description: string;
  createdDate: number;
  tag?: string;
  tagId?: string;
  isNew?: boolean;
  type: LzBankType;
  chatId: string;
  chatMessageId: string;
  [key: string]: any; // 拓展字段
}

// 存储结构定义 - 直接存储 tags 和 items
export interface BankData {
  tags: Tag[];
  items: Record<string, Card[]>;
}

