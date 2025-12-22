import { v4 as uuidv4 } from "uuid";
import {
  AnswerActionType,
  type AnswerType,
  type QuestionType,
  ChatComponentType,
} from "@libs/p-comps";
import type { Question as QuizQuestion, QuizType } from "@libs/p-comps/ChatBaseComponent/hooks/useQuiz";
import quizResponse from "./quiz_response.json";
import noteResponse from "./note_response.json";

type ChatMessageSeed = { questionData: QuestionType } | { answerData: AnswerType };

export interface LearningZoneTemplate {
  key: string;
  chatId: string;
  messageId: string;
  cardType: string;
  chatMessages: ChatMessageSeed[];
  quizList?: QuizQuestion[];
  title: string;
}

const mapQuizResponseToQuestions = (): QuizQuestion[] => {
  return quizResponse.content.map((item) => {
    const normalizedType = item.type.toLowerCase() as QuizType;
    const baseQuestion: QuizQuestion = {
      id: item.id,
      type: normalizedType,
      question: item.question,
      options: item.options
        ? item.options.map((option) => ({
            code: option.code,
            text: option.text,
          }))
        : null,
      analysis: item.analysis,
      answer: {
        code: null,
        judge: null,
        short_answer: null,
      },
      isAnswerCompleted: false,
    };

    switch (normalizedType) {
      case "choice":
        baseQuestion.answer.code = item.answer ?? null;
        break;
      case "bool":
        baseQuestion.answer.judge =
          typeof item.answer === "string"
            ? item.answer.toLowerCase() === "true"
            : Boolean(item.answer);
        break;
      case "saq":
        baseQuestion.answer.short_answer = item.answer ?? "";
        break;
      default:
        break;
    }

    return baseQuestion;
  });
};

const buildCommercialSpaceTemplate = (): LearningZoneTemplate => {
  const baseTimestamp = Date.now() - 1000 * 60 * 5;
  const quizQuestionId = "template-quiz-1-question-collect";
  const documentFileId = "template-quiz-1-file";
  const firstQuestionId = uuidv4();
  const firstAnswerId = uuidv4();
  const secondQuestionId = uuidv4();
  const finalAnswerId = "template-quiz-msg-1";

  const chatMessages: ChatMessageSeed[] = [
    {
      questionData: {
        id: firstQuestionId,
        type: ChatComponentType.QUERY,
        timestamp: baseTimestamp,
        actionType: AnswerActionType.TEXT,
        content: "Generate quizzes from uploaded files",
        files: [
          {
            fileName: "The Next Chapter of Commercial Space.pdf",
            filePath: "/learning-zone/demo/The Next Chapter of Commercial Space.pdf",
            fileId: documentFileId,
            icon: "pdf",
          },
        ],
      },
    },
    {
      answerData: {
        id: finalAnswerId,
        questionId: secondQuestionId,
        type: ChatComponentType.ANSWER,
        timestamp: baseTimestamp + 6000,
        actionType: AnswerActionType.QUIZ,
        content:
          "好的，我已根据《The Next Chapter of Commercial Space》生成 10 道测验题，。右侧“AI Quizzes”面板展示了详细题目，可直接作答或调整解析。",
      },
    },
  ];

  return {
    key: "commercial-space-quiz",
    chatId: "template-quiz-1",
    messageId: finalAnswerId,
    cardType: "quiz",
    chatMessages,
    quizList: mapQuizResponseToQuestions(),
    title: quizResponse.title,
  };
};

const buildCommercialSpaceNotesTemplate = (): LearningZoneTemplate => {
  const baseTimestamp = Date.now() - 1000 * 60 * 8;
  const documentFileId = "template-notes-1-file";
  const questionId = uuidv4();
  const answerId = "template-notes-msg-1";

  const chatMessages: ChatMessageSeed[] = [
    {
      questionData: {
        id: questionId,
        type: ChatComponentType.QUERY,
        timestamp: baseTimestamp,
        actionType: AnswerActionType.TEXT,
        content: "请基于我上传的《The Next Chapter of Commercial Space》生成结构化学习笔记，包含章节要点、主题分析和术语表。",
        files: [
          {
            fileName: "The Next Chapter of Commercial Space.pdf",
            filePath: "/learning-zone/demo/The Next Chapter of Commercial Space.pdf",
            fileId: documentFileId,
            icon: "pdf",
          },
        ],
      },
    },
    {
      answerData: {
        id: answerId,
        questionId,
        type: ChatComponentType.ANSWER,
        timestamp: baseTimestamp + 6000,
        actionType: AnswerActionType.Note
      },
    },
  ];

  return {
    key: "commercial-space-notes",
    chatId: "template-notes-1",
    messageId: answerId,
    cardType: "notes",
    chatMessages,
    title: noteResponse.title,
  };
};

export const LEARNING_ZONE_TEMPLATES: Record<string, LearningZoneTemplate> = {
  "commercial-space-quiz": buildCommercialSpaceTemplate(),
  "commercial-space-notes": buildCommercialSpaceNotesTemplate(),
};


