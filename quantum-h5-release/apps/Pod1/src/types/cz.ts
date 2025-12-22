import { Ref, ComputedRef } from 'vue'
import { GenBtnStatus, ReferenceDimensionType } from '@/constant'

export interface IreadFileRes {
  content: string
}

export enum ModelType {
  LOCAL = 'LOCAL',
  CLOUD = 'CLOUD',
}

export enum SESSION_RECORD_SOURCE {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  LOADING = -1,
}

export enum IMAGE_STATUS {
  LOADING = -1,
  SUCCESSFULLY = 1,
  FAILED = 0,
}

export enum REFERENCEIMAGE_TYPE {
  NULL = -1,
  LOCAL = 0,
  MODEL = 1,
}

export enum OPERATE_TYPE {
  TEXT_TO_IMAGE = 0,
  IMAGE_TO_IMAGE = 1,
  INPAINT = 2,
  OUTPAINT = 3,
  ERASE = 4,
  UPSCALE = 5,
  CHANGE_BACKGROUND = 6,
  CUTOUT = 7,
  CROP = 8,
  SMART_EDITING = 9,
}

export enum RATIO {
  ORIGINAL = 'original',
  FREE = 'free',
  ONE_ONE = '1:1',
  TWO_TWO = '2:2',
  TWO_THREE = '2:3',
  THREE_TWO = '3:2',
  THREE_FOUR = '3:4',
  FOUR_THREE = '4:3',
  NINE_SIXTEEN = '9:16',
  SIXTEEN_NINE = '16:9',
  ONE_INCH = '295:413',
  TWO_INCHES = '413:626',
}

export interface Isession {
  sessionId: string
  sessionName: string
  createTime: string
}

export interface IsessionRecord {
  sessionId?: string
  sessionType?: string
  recordId?: string
  role?: SESSION_RECORD_SOURCE
  content?: string
  negConstent?: string
  cfgScale?: number
  styles?: Array<Istyle>
  modelId?: string
  modelType?: ModelType
  steps?: number
  width?: number
  height?: number
  ratioId?: RATIO
  referenceImageUrl?: string
  referenceDimension?: string
  referenceStrength?: number
  images?: {
    resultStatus?: IMAGE_STATUS
    imageId?: string
    url?: string
    objectKey?: string
    seed?: number
  }[]
  referenceImageType?: REFERENCEIMAGE_TYPE
  operateType?: OPERATE_TYPE
  createTime?: string
}

export interface Icategory {
  id: string
  value: string
  selected?: Boolean
}

export interface Istyle {
  styleId: string
  styleName: string
  iconUrl: string
  isDefault?: Boolean
  selected?: Boolean
}

export interface Iimage {
  sessionId?: string
  sessionType?: string
  recordId?: string
  imageId?: string
  url?: string
  content?: string
  negConstent?: string
  modelId?: string
  modelType?: ModelType
  cfgScale?: number
  steps?: number
  width?: number
  height?: number
  ratioId?: RATIO
  referenceImageUrl?: string
  referenceImageType?: REFERENCEIMAGE_TYPE
  referenceDimension?: string
  referenceStrength?: number
  operateType?: OPERATE_TYPE
  styles?: Array<Istyle>
  seed?: number
  createTime?: string
  active?: boolean
  index?: number
  loading?: boolean
}

export interface IcreateRef {
  sessionRecords: Ref<Array<IsessionRecord>>
  generatedImage: ComputedRef<IsessionRecord>
  referenceImageUrl: String
  setReferenceImageUrl: (value: String) => void
  referenceImageType: REFERENCEIMAGE_TYPE
  setReferenceImageType: (value: REFERENCEIMAGE_TYPE) => void
  operateType: Ref<OPERATE_TYPE>
  setOperateType: (value: OPERATE_TYPE) => void
  genBtnStatus: Ref<GenBtnStatus>
  setGenBtnStatus: (value: GenBtnStatus) => void
  images: Ref<Array<Iimage>>
  currentImage: ComputedRef<Iimage>
  setImages: (value: Array<Iimage>) => void
  genImages: (value: {
    originalImageUrl?: string
    maskImageUrl?: string
    content?: string
    ratioId?: RATIO
    width?: number
    height?: number
    left?: number
    top?: number
    referenceImageUrl?: string
    referenceImageType?: REFERENCEIMAGE_TYPE
    modelType?: ModelType
    operateType: OPERATE_TYPE
  }) => void
}

export interface Isnapshot {
  referer?: String
  url?: string
  oldUrl?: String
  regions?: Array<ImageData>
  imageData?: ImageData
}

export interface IeditorRef {
  scaleConfig: {
    max: number
    min: number
    step: number
  }
  maxSizeRatio: number
  imageUrl: Ref<string>
  setImageUrl: (value: String) => void
  operateType: Ref<OPERATE_TYPE>
  setOperateType: (value: OPERATE_TYPE) => void
  loading: Ref<boolean>
  setLoading: (value: boolean) => void
  reset: () => void
}

export interface IsingleRef {
  imageSize: ComputedRef<{
    width: number
    height: number
  }>
  referenceImageUrl: Ref<string>
  setReferenceImageUrl: (value: Event | File | String) => void
  referenceDimension: Ref<ReferenceDimensionType>
  setReferenceDimension: (value: ReferenceDimensionType) => void
  referenceStrength: Ref<number>
  setReferenceStrength: (value: number) => void
  steps: Ref<Number>
  setSteps: (value: Number) => void
  cfgScale: Ref<Number>
  setCfgScale: (value: Number) => void
  operateType: Ref<OPERATE_TYPE>
  setOperateType: (value: OPERATE_TYPE) => void
}
