import { ChatStatus, StreamAnswerType, AnswerType } from '@libs/p-comps'


export class StreamAnswer implements StreamAnswerType {
    status: ChatStatus;
    response: string;
    content: string;
    answerData: AnswerType;

    // 可以根据需要添加构造函数或其他方法
    constructor(params: StreamAnswerType) {
        Object.assign(this, params);
    }

}