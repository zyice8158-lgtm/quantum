export enum MESSAGE_TYPE {
  EXPLAIN = 'Explain',
  ANALYSIS = 'Analysis',
  SEARCHPKB = 'SearchPKB',
  ADDKNOWLEDGE = 'AddKnowledge',
  CANCLE = 'Cancel',
  CONFIRM = 'Confirm'
}
export const BTNS = [
  { name: MESSAGE_TYPE.EXPLAIN, text: 'Explain the picture' },
  { name: MESSAGE_TYPE.ANALYSIS, text: 'Chart/Table image analysis' },
  { name: MESSAGE_TYPE.SEARCHPKB, text: 'Search image from PKB' },
  { name: MESSAGE_TYPE.ADDKNOWLEDGE, text: 'Add to knowledge base' },
  { name: MESSAGE_TYPE.CANCLE, text: '' },
  { name: 'Confirm', text: 'Confirm' }
]
export interface Props {
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
  btns: Array<{ name: string; text: string }>
  screenShotMode?: string // 'App' | 'Area'
}
