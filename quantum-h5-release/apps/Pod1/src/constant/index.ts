export const imageTypes = ['png', 'jpeg', 'jpg', 'webp', 'svg']

export enum GenBtnStatus {
  INIT,
  PREPARING,
  RUNNING,
  CANCELLING,
}

// 云端任务状态
export enum CloudTaskStatus {
  // 任务创建完成
  CREATED = 0,
  // 任务即将进行
  READY = 1,
  // 任务进行中
  RUNNING = 2,
  // 任务完成
  SUCCESSFULLY = 3,
  // 任务取消中
  CANCELLING = 4,
  // 任务取消完成
  CANCELLED = 5,
  // 任务失败
  FAILED = 6,
}

export enum ReferenceDimensionType {
  CONTROLNET_TILE = 'tile',
  CONTROLNET_DEPTH = 'depth',
  CONTROLNET_CANNY = 'canny',
  CONTROLNET_POSE = 'openpose',
  CONTROLNET_SCRIBBLE = 'scribble',
  IMAGE_STRENGTH = 'strength',
}

export const CloudReferenceDimensionType = {
  [ReferenceDimensionType.CONTROLNET_DEPTH]: 'Depth',
  Depth: ReferenceDimensionType.CONTROLNET_DEPTH,
  [ReferenceDimensionType.CONTROLNET_CANNY]: 'Canny',
  Canny: ReferenceDimensionType.CONTROLNET_CANNY,
  [ReferenceDimensionType.CONTROLNET_POSE]: 'Openpose',
  Openpose: ReferenceDimensionType.CONTROLNET_POSE,
  [ReferenceDimensionType.IMAGE_STRENGTH]: '',
  '': ReferenceDimensionType.IMAGE_STRENGTH,
}

export const initReferenceDimensions = [
  {
    id: ReferenceDimensionType.CONTROLNET_TILE,
    selected: false,
    value: 0.1,
    steps: 20,
    cfgScale: 3.5,
  },
  {
    id: ReferenceDimensionType.CONTROLNET_CANNY,
    selected: false,
    value: 0.7,
    steps: 20,
    cfgScale: 3.0,
  },
  {
    id: ReferenceDimensionType.CONTROLNET_POSE,
    selected: false,
    value: 0.7,
    steps: 20,
    cfgScale: 3.5,
  },
  {
    id: ReferenceDimensionType.CONTROLNET_SCRIBBLE,
    selected: false,
    value: 0.7,
    steps: 20,
    cfgScale: 3.5,
  },
  {
    id: ReferenceDimensionType.CONTROLNET_DEPTH,
    selected: false,
    value: 0.7,
    steps: 20,
    cfgScale: 3.5,
  },
  {
    id: ReferenceDimensionType.IMAGE_STRENGTH,
    selected: true,
    value: 0.46,
    steps: 20,
    cfgScale: 3.5,
  },
]

export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
  FR_FR = 'fr-FR',
  DE_DE = 'de-DE',
  ES_ES = 'es-ES',
}

export enum MessageStatus {
  RUNTIME_LOST = -100,
  RUNTIME_UPGRADING = 1106,

  SUCCESS = 0,
  PLUGIN_IMAGE_ERROR_TASK_RUNING = 1201,
  PLUGIN_IMAGE_ERROR_TASK_CANCEL = 1202,
  PLUGIN_IMAGE_ERROR_TASK_QUEUE = 1203,
  PLUGIN_IMAGE_ERROR_TASK_STOPPING = 1204,
  PLUGIN_IMAGE_ERROR_TASK_FAILED = 1205,
  PLUGIN_IMAGE_ERROR_CANNOT_CREATE = 1206,
  PLUGIN_IMAGE_ERROR_SENSITIVE_WORD = 1207,
  PLUGIN_IMAGE_ERROR_SENSITIVE_IMG = 1208,
  PLUGIN_IMAGE_ERROR_NETWORK = 1209,
  PLUGIN_IMAGE_ERROR_ALIYUN_UPLOAD = 1210,
  PLUGIN_IMAGE_ERROR_TOKEN = 1211,
  PLUGIN_IMAGE_ERROR_TENCENT_UPLOAD = 1212,
  PLUGIN_IMAGE_ERROR_LANGUAGE = 1213,
  PLUGIN_IMAGE_ERROR_RESOLUTION_LOCAL = 1214,
  PLUGIN_IMAGE_ERROR_RESOLUTION_CLOUD = 1215,
  PLUGIN_IMAGE_ERROR_ADMIN = 1216,
  PLUGIN_IMAGE_ERROR_TIME_IMG = 1217,
  PLUGIN_IMAGE_ERROR_TIME_LORA = 1218,
  PLUGIN_IMAGE_ERROR_CANNOT_TRAIN = 1219,
  PLUGIN_IMAGE_ERROR_VIOLATIONS_MIN = 1220,
  PLUGIN_IMAGE_ERROR_VIOLATIONS_MAX = 1221,
  PLUGIN_IMAGE_ERROR_ACCOUNT_BANNED = 1222,
  PLUGIN_IMAGE_ERROR_INSUFFICIENT_DISK = 1223,
  PLUGIN_IMAGE_ERROR_DUPLICATE_APPEAL = 1224,
  PLUGIN_IMAGE_ERROR_APPEAL_APPROVED = 1225,
  PLUGIN_IMAGE_ERROR_INSUFFICIENT_MEMORY = 1226,
  PLUGIN_IMAGE_ERROR_NO_APPEAL = 1227,
  PLUGIN_IMAGE_ERROR_CLOSE_IMG_RUNNING = 1228,
  PLUGIN_IMAGE_ERROR_CLOSE_LORA_RUNNING = 1229,
  PLUGIN_IMAGE_ERROR_SWITCH_ACCOUNT_IMG_RUNNING = 1230,
  PLUGIN_IMAGE_ERROR_SWITCH_ACCOUNT_LORA_RUNNING = 1231,
  PLUGIN_IMAGE_ERROR_LORA_CREATE_SUCCESS = 1232,
  PLUGIN_IMAGE_ERROR_IMG_LOAD_FAILED = 1233,
  PLUGIN_IMAGE_ERROR_LORA_IMG_LOAD_FAILED = 1234,
  PLUGIN_IMAGE_ERROR_CLOUD_IMG_RUNNING = 1235,
  PLUGIN_IMAGE_ERROR_PARAM_INVALID = 1236,
  PLUGIN_IMAGE_ERROR_LOAD_IMAGE_MODEL_FAILED = 1237,
  MODEL_NOT_INSTALLED = 1257,
  MODEL_STARTUP_FAILED = 1258,
  DISCRETE_GRAPHICS_CARD_DISABLED = 1259,
  PLUGIN_IMAGE_ERROR_EXPORTING_TRAIN_MODEL = 1260,
  PLUGIN_IMAGE_ERROR_BROKEN_IMAGE = 1262,
  PLUGIN_IMAGE_ERROR_TOO_BIG = 1263,
}

export const genImageRule = {
  localModelGenDescLength: 500,
  localModelUnGenDescLength: 500,
  localModelMaxSize: 1024,
  localModelMinSize: 512,
  step: 64,
}

// 缓存图片前缀
export const CACHE_IMAGE_PREFIX = {
  // last 不能是 current 的子集
  current: 'of381462',
  last: '62650dca',
}

export const SESSIONID_NAME_MAX_LENGTH = 30

export const SESSIONID_PROMPT_MAX_LENGTH = 1000

// 图片操作快照最大长度
export const IMAGE_SNAPSHOT_MAX_LENGTH = 20

export const getLocalBaseModelGenImageSize = (ratioId, RATIO) => {
  let width = 1024;
  let height = 1024;

  if (ratioId === RATIO.ONE_ONE) {
    width = 512;
    height = 512;
  } else if (ratioId === RATIO.TWO_TWO) {
    width = 1024;
    height = 1024;
  } else if (ratioId === RATIO.TWO_THREE) {
    width = 512;
    height = 768;
  } else if (ratioId === RATIO.THREE_TWO) {
    width = 768;
    height = 512;
  } else if (ratioId === RATIO.THREE_FOUR) {
    width = 256 * 3;
    height = 256 * 4;
  } else if (ratioId === RATIO.FOUR_THREE) {
    width = 256 * 4;
    height = 256 * 3;
  } else if (ratioId === RATIO.NINE_SIXTEEN) {
    width = 64 * 9;
    height = 64 * 16;
  } else if (ratioId === RATIO.SIXTEEN_NINE) {
    width = 64 * 16;
    height = 64 * 9;
  }

  return {
    width,
    height,
  };
};
