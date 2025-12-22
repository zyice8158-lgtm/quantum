// import './index.module.less'
import Button from './Button'
import Input from './Input'
import ComingSoon from './ComingSoon'
import searchInput from './searchInput/index.vue'
import Select from './Select'
import { OptionItem } from 'Select/type'
import ToolBar from './ToolBar'
import answerMap from './AnswerCard';
import questionMap from './QuestionCard';
import Picture from './AnswerCard/Pod6/Picture.vue'
import FileUpload from './AnswerCard/Pod1/FileUpload.vue';
import PictureFile from './QuestionCard/Pod6/PictureFile/index.vue';
import AnswerTextCard from './AnswerCard/Pod6/AnswerTextCard.vue';
import QuickEntry from './QuickEntry/index.vue';
import QuizCard from './AnswerCard/QuizCard/index.vue'
import QuizSimpleCard from './AnswerCard/QuizCard/QuizSimpleCard.vue'
import { THEME, ThemeData } from './type';
import { SvgIcon } from './Icons';
import { CommonTheme, DarkTheme } from './themeData';
import { PayAttentionChatBase, ChatBase, ChatController, type WelcomeType, type QuestionType, type AnswerType, type InputType, type StreamAnswerType, type ChatMessageType, ChatStatus, ChatComponentType, type SDKResponse, type ChatSDK, AnswerActionType, QServiceReq, FileSearchListType } from './ChatBaseComponent';
import { FileTypeIcon } from './iconDocument'
import ContextMenu from 'primevue/contextmenu';
export * from './type'
export * from './ChatView/index'
import  "./volt/QTooltip/index.less"
import "./volt/QIftalabel/index.less"
import "./volt/QButton/commonButton.less"



export {
    QuickEntry,
    Button as QButton,
    Input as QInput,
    Select as QSelect,
    SvgIcon as QIcons,
    ToolBar as QToolBar,
    Picture,
    PictureFile,
    AnswerTextCard,
    answerMap,
    questionMap,
    AnswerActionType,
    FileUpload,
    PayAttentionChatBase,
    ChatBase, ChatController, type WelcomeType, type QuestionType, type AnswerType, type InputType, type StreamAnswerType, type ChatMessageType, ChatStatus, ChatComponentType, type SDKResponse, type ChatSDK, type QServiceReq, type FileSearchListType, type OptionItem,
    FileTypeIcon as QFileTypeIcon,
    searchInput as QSearchInput,
    QuizCard,
    QuizSimpleCard,
    ContextMenu
}


export const themeHooks = (customThemeData?: Record<string, ThemeData>) => {
    // const CustomTheme = Object.keys(customThemeData || {})
    const getThemeData = (theme: string | THEME = THEME.COMMON) => {
        if (theme === THEME.DARK) {
            return DarkTheme
        } else if (customThemeData && customThemeData[theme]) {
            return customThemeData[theme]
        }
        return CommonTheme


    }

    const setTheme = (theme: string | THEME = THEME.COMMON, el?: HTMLElement) => {
        const rootStyles = el?.style || document.documentElement.style

        const themeData = getThemeData(theme)
        for (const key in themeData) {
            rootStyles.setProperty(key, themeData[key as keyof typeof themeData])
        }
    }
    const getCurrentVars = (el: HTMLElement = document.documentElement) => {

        const rootStyles = el.style

        const variables = {} as Record<string, string>;

        // console.log(rootStyles);
        for (const prop of rootStyles) {

            if (prop.startsWith('--')) {
                console.log(prop);
                variables[prop] = rootStyles.getPropertyValue(prop).trim()

            }
        }
        console.log(variables);

        return variables;


    }
    return {
        setTheme, getThemeData, getCurrentVars
    }
}
const { setTheme } = themeHooks()
setTheme(THEME.COMMON)
