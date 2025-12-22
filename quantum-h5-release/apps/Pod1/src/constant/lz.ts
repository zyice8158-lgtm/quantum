import { LzBankKind, Card } from "@/types/lz";

export const LZ_DEFAULT_TAG_NAME = "All Tags";
export const LZ_DEFAULT_TYPE = "All Types";
export const LZ_TYPE_MAP = [
  {
    id:LZ_DEFAULT_TYPE,
    name:LZ_DEFAULT_TYPE
  },
  {
    id: LzBankKind.Notes,
    name: "Note",
  },
  {
    id: LzBankKind.Record,
    name: "Recording",
  },
  {
    id: LzBankKind.Quiz,
    name: "Quiz Bank",
  },
];

export const LZ_DEFAULT_TAG = { id: LZ_DEFAULT_TAG_NAME, name: LZ_DEFAULT_TAG_NAME };
export const LZ_FEATURED_TEMPLATED = { id: "Featured templated", name: "Featured templated" };

export const LZ_TEMPLATED_CARD: Card[] = [
  {
    title: "Multiple-choice question practice",
    description: "Practice multiple-choice questions to test your knowledge",
    createdDate: 1761926400000 ,//26-1-26 1769404800000
    tag: "Featured templated",
    tagId: "Featured templated",
    type: LzBankKind.Quiz,
    name: "Quiz",
    chatId: "template-quiz-1",
    chatMessageId: "template-quiz-msg-1",
    templateKey: "commercial-space-quiz",
  },
  // {
  //   title: "Interactive quiz assessment",
  //   description: "Take interactive quizzes to evaluate your understanding",
  //   createdDate: 1769836800000, //26-1-27
  //   tag: "Featured templated",
  //   tagId: "Featured templated",
  //   type: LzBankKind.Quiz,
  //   name: "Quiz",
  //   chatId: "template-quiz-2",
  //   chatMessageId: "template-quiz-msg-2",
  // },
  {
    title: "Learning notes and key points",
    description: "Comprehensive notes covering important concepts and summaries",
    createdDate: 1762012800000, // 25-12-27 1764096000000
    tag: "Featured templated",
    tagId: "Featured templated",
    type: LzBankKind.Notes,
    name: "Note",
    chatId: "template-notes-1",
    chatMessageId: "template-notes-msg-1",
    templateKey: "commercial-space-notes",
  },
  // {
  //   title: "Study notes compilation",
  //   description: "Organized study notes for effective learning",
  //   createdDate: Date.now() - 86400000 * 6, // 6天前
  //   tag: "Featured templated",
  //   tagId: "Featured templated",
  //   type: LzBankKind.Notes,
  //   name: "Note",
  //   chatId: "template-notes-2",
  //   chatMessageId: "template-notes-msg-2",
  // },
  // {
  //   title: "Audio recording session",
  //   description: "Record and review your learning sessions",
  //   createdDate: Date.now() - 86400000 * 4, // 4天前
  //   tag: "Featured templated",
  //   tagId: "Featured templated",
  //   type: LzBankKind.Record,
  //   name: "Recording",
  //   chatId: "template-record-1",
  //   chatMessageId: "template-record-msg-1",
  // },
 
 
  // {
  //   title: "Voice memo collection",
  //   description: "Collection of voice memos for quick review",
  //   createdDate: Date.now() - 86400000 * 7, // 7天前
  //   tag: "Featured templated",
  //   tagId: "Featured templated",
  //   type: LzBankKind.Record,
  //   name: "Recording",
  //   chatId: "template-record-2",
  //   chatMessageId: "template-record-msg-2",
  // },
];