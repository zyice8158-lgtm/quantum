export enum ContentType {
  TEXT = 'TEXT',
  TOOL = 'TOOL',
  DOC = 'DOCUMENT',
}
export enum LocalType {
  LOCAL,
  CLOUD,
  BOTH,
}
export interface QTCoreData {
  "contentType": ContentType,
  "mimeType": ContentType,
  "value": string
}



export interface QTCoreRes {

  "stop": boolean,
  "taskDecomposition"?: Array<QTCoreData>
  "tool"?: Array<QTCoreData>
  "toolResult"?: Array<QTCoreData>
  "task"?: Array<QTCoreData>
  "taskAnswer"?: Array<QTCoreData>
  "answer"?: Array<QTCoreData>

}