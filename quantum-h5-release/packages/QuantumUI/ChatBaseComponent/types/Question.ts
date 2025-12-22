import { QuestionType } from "../types";

// Question 类，处理与问题相关的数据

export default class Question {
  questionData: QuestionType;
  id: string = ""

  constructor() {
    this.questionData = {} as QuestionType; // 初始化为空对象
  }
  static isQuestion(item: any): item is { questionData: QuestionType } {
    return "questionData" in item;
  }

  setData(data: QuestionType): void {
    this.questionData = data;
    this.id = data.id
  }

  getData(): QuestionType {
    return this.questionData;
  }
}