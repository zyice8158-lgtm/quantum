import { ref } from "vue";
import { AppFetch } from "@libs/service";

// 选项状态枚举
export enum OptionStatus {
  UNSELECTED = "unselected",
  CORRECT = "correct", 
  WRONG = "wrong"
}


// 题目类型定义
export interface Option {
  code: string;
  text: string;
}

export interface Answer {
  code: string | null;
  judge: boolean | null;
  short_answer: string | null;
}

export enum QuizType {
  CHOICE = "choice",
  BOOL = "bool",
  SAQ = "saq",
}

export interface Question {
  type: QuizType;
  question: string;
  options: Option[] | null;
  answer: Answer;
  analysis: string;
  id: string;
  userAnswer?: string | boolean;
  isAnswerCompleted?: boolean;
}

export interface QuizResponse {
  request_id: string;
  success: boolean;
  title: string;
  content: Question[];
}

let instance: ReturnType<typeof createQuizInstance> | null = null;

const createQuizInstance = () => {
  const quizList = ref<Question[]>([]);
  const loading = ref(false);
  const currentIndex = ref<number>(0);
  const addedBankIds = ref<string[]>([]);

  // 生成题目数据
  const setQuizList = async (list: Question[]) => {
    quizList.value = list;
    currentIndex.value = 0;
    addedBankIds.value = [];
  };

  const changeToNextQuestion = (isOnlyShow: boolean = false) => {
    const isAnswerCompleted = quizList.value[currentIndex.value].isAnswerCompleted;
    const hasRemainQuiz = currentIndex.value < quizList.value.length - 1
    const canSwitch  = hasRemainQuiz && isAnswerCompleted
    if (canSwitch || (isOnlyShow && hasRemainQuiz)) {
      currentIndex.value++;
    }
  }

  const changeToPrevQuestion = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--;
    }
  }

  // 提交答案
  const submitAnswer = (answer: string) => {
    quizList.value[currentIndex.value].userAnswer = answer;
    quizList.value[currentIndex.value].isAnswerCompleted = true;
  };

  // 修改解析
  const updateAnalysis = (explain: string) => {
    quizList.value[currentIndex.value].analysis = explain;
  };

  // 获取选项状态
  const getOptionStatus = (optionCode: string): OptionStatus => {
    const currentQuestion = quizList.value[currentIndex.value];
    
    if (!currentQuestion?.userAnswer) {
      return OptionStatus.UNSELECTED; // 未选择
    }

    // 根据题目类型判断对错
    switch (currentQuestion.type) {
      case QuizType.CHOICE:
        return currentQuestion.userAnswer === currentQuestion.answer.code ? OptionStatus.CORRECT : OptionStatus.WRONG;

      case QuizType.BOOL:
        const currentAnswer = currentQuestion.userAnswer === 'True' ? true : false;
        return currentAnswer === currentQuestion.answer.judge ? OptionStatus.CORRECT : OptionStatus.WRONG;

      default:
        return OptionStatus.UNSELECTED;
    }
  };

  const addToBank = (id: string) => {
    addedBankIds.value.push(id);
  }

  const removeToBank = (id: string) => {
    addedBankIds.value = addedBankIds.value.filter(i => i !== id);
  }

  const isAddedBank = (id: string) => {
    return addedBankIds.value.includes(id);
  }

  const updateBankIds = (ids: string[]) => {
    addedBankIds.value = ids
  }

  return {
    // 状态
    quizList,
    loading,
    currentIndex,
    addedBankIds,
    changeToNextQuestion,
    changeToPrevQuestion,

    // 方法
    updateBankIds,
    setQuizList,
    submitAnswer,
    getOptionStatus,
    updateAnalysis,
    addToBank,
    removeToBank,
    isAddedBank
  };
};


// 对外暴露单例
export const useQuiz = () => {
  if (!instance) {
    instance = createQuizInstance();
  }
  return instance;
};

export default useQuiz;

