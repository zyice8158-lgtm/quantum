import ChatBase from "./pages/index.vue";
import PayAttentionChatBase from "./payattentionPages/index.vue";
import { AnswerType, InputType, QuestionType, WelcomeType, StreamAnswerType, ChatMessageType, ChatStatus, ChatComponentType, SDKResponse, ChatSDK, AnswerActionType, FileSearchListType } from "./types";
import { ChatController } from "./types/ChatClass";
import { useQuiz, OptionStatus } from "./hooks/useQuiz";
import Answer from "./types/Answer";
import Question from "./types/Question";
export { ChatBase, PayAttentionChatBase, ChatController, type WelcomeType, type QuestionType, type AnswerType, type InputType, type StreamAnswerType, type ChatMessageType, ChatStatus, ChatComponentType, type SDKResponse, type ChatSDK, AnswerActionType, type FileSearchListType, useQuiz, OptionStatus, Answer, Question };