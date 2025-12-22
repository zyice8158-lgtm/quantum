
import CMUAnswer from './Pod6/CMUAnswer/index.vue';
import Thinking from './Pod1/Thinking.vue';
import FileUpload from './Pod1/FileUpload.vue';
import Picture from './Pod6/Picture.vue';
import AnswerTextCard from './Pod6/AnswerTextCard.vue';
import AnswerTextCardPod1 from './Pod1/AnswerTextCard.vue';
import SwitchTheme from './DeviceSettings/SwitchTheme.vue'; // 设备控制开关暗黑模式
import OverPrompt from './DeviceSettings/OverPrompt.vue'; // 提示
import MettingArrange from './DeviceSettings/MettingArrange.vue'; // 会议纪要
import QuizCard from './QuizCard/index.vue';
import QuizSimpleCard from './QuizCard/QuizSimpleCard.vue';
import NoteCard from './NoteCard/index.vue';
import EventTime from './Pod1/EventTime.vue';
import Transcription from './payattention/transcript.vue';
import ContactSelect from './Pod1/ContactSelect.vue';
import RecordingCard from './RecordingCard/Insertnote.vue';
import ThirdPartyAgent from './ThirdPartyAgent/index.vue';
import FollowUp from './ThirdPartyAgent/FollowUp.vue';
import CreateZone from './CreateZone/index.vue'; // Creator Zone 生成图片回复
import Perplexity from './ThirdPartyAgent/Perplexity.vue';
// console.log('AnswerActionType------', AnswerActionType)
const answerMap = {
    cmu: CMUAnswer,
    think: Thinking,
    uploadFile: FileUpload,
    picture: Picture,
    text: AnswerTextCard,
    textPod1: AnswerTextCardPod1,
    switchTheme: SwitchTheme,
    overPrompt: OverPrompt,
    mettingArrange: MettingArrange,
    quiz: QuizCard,
    simpleQuiz: QuizSimpleCard,
    note: NoteCard,
    recording: RecordingCard,
    eventTime: EventTime,
    transcription:Transcription,
    contactSelect: ContactSelect,
    thirdPartyAgent: ThirdPartyAgent,
    followUp: FollowUp,
    createZone: CreateZone,
    perplexity: Perplexity
}
export default answerMap;
