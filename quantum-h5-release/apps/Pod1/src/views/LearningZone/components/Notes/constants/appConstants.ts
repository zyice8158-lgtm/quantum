
export const LEARNING_ZONE_ORIGIN = 'learning_zone';

export const DEFAULT_THEME = 'dark';
export const DARK_THEME = 'dark';
export const LIGHT_THEME = 'light';

export const EDITOR_LIMIT = 100001;
export const PRE_EDITOR_LIMIT = 93000;
export const OSS_LIMIT_TIME = 30 * 60 * 1000;

export const DEFAULT_AI_MODEL = 'remote';

export const CLOUD_AI_MODEL = 'remote';

export const LOCAL_AI_MODEL = 'local';

export const EDITOR_MENU_CONFIG = {
  EXPLAIN: {
    TYPE_CODE: 3,
    MENU_NAME: "EXPLAIN",
    CLASSNAME: 'showResAreaE',
    LOCAL_AI_METHODS_NAME: "AIGetWordExplain"
  },
  TRANSLATE: {
    TYPE_CODE: 4,
    MENU_NAME: "TRANSLATE",
    CLASSNAME: 'showResAreaT',
    LOCAL_AI_METHODS_NAME: "AIGetTextTranslation"
  },
  POLISH: {
    TYPE_CODE: 5,
    MENU_NAME: "POLISH",
    CLASSNAME: 'showResAreaP',
    LOCAL_AI_METHODS_NAME: "AIGetTextPolish"
  },
  CONTINUE_WRITING: {
    TYPE_CODE: 6,
    MENU_NAME: "CONTINUE_WRITING",
    CLASSNAME: '',
    LOCAL_AI_METHODS_NAME: "AIGetTextContinueWriting"
  }
};

export const AICMDLIST_CONFIG = {
  'health':'model.mgr.get.model.status', // Status check
  'createSession':'ainow.chat.createSession', // Create a session
  'stopSession':'ainow.chat.stop.run', // Stop a conversation
  'deleteSession':'ainow.chat.deleteSession', // Stop a conversation
  'session':'ainow.chat.run' // Natural language dialogue
};

export const RUN_TIME_OVERTIME = 300000;

export const BASE_GENERATION = 'BASE_GENERATION';

export const GENERAL_GENERATION = 'GENERAL_GENERATION';

export const WORK_ASSISTANT_DOCUMENT_SUMMARY = 'WORK_ASSISTANT_DOCUMENT_SUMMARY';

export const AI_USE_QUESTION = 'question';
// export const AI_TYPE_QUESTION = 'question';
// export const AI_TYPE_SUMMARY = 'summary';

export const SUMMARY_FORMAT_MD = 'md';

export const FETCH_EVENTS_OUTPUTTING_OVERTIME = 3000;
export const METHOD_LIST_STATE = {
  POLISH:'4',
  CONTINUE_WRITING:'3',
  question:'2',
  summary:'1'
};

export const LANGUAGE_LIST = ['en', 'cn'];
export const DEFAULT_LANGUAGE = 'cn';

export const QUESTION_TYPES = {
  'choice': {
    type: 'choice',
    maxNum: 3,
  },
  'bool': {
    type: 'bool',
    maxNum: 1,
  },
  'saq': {
    type: 'saq',
    maxNum: 1,
  }
}
