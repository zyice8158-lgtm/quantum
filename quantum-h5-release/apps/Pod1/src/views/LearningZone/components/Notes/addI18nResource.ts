import {i18nAddResources} from '@wangeditor/editor';
import i18n from '@/i18n'

const languages = i18n.global.availableLocales;
const messages = i18n.global.messages.value;
languages.forEach(lang => {
  const {
    LZ_Editor_Header_Text,
    LZ_Editor_Font_Family_Default,
    LZ_Editor_Font_Size_Default,
    LZ_Editor_Color_Default,
    LZ_Editor_Color_Clear,
    LZ_Editor_Text_Style_Underline,
    LZ_Editor_Indent_Increase,
    LZ_Editor_Indent_Decrease,
    LZ_Editor_Justify_Left,
    LZ_Editor_Justify_Right,
    LZ_Editor_Justify_Center,
    LZ_Editor_Justify_Justify,
    LZ_Editor_BlockQuote_Title,
    LZ_Editor_Todo_Todo,
    LZ_Editor_Common_Center,
    LZ_Editor_TableModule_Header,
    LZ_Editor_TableModule_Width_Auto,
    LZ_Editor_TableModule_Insert_Row,
    LZ_Editor_TableModule_Delete_Row,
    LZ_Editor_TableModule_Insert_Col,
    LZ_Editor_TableModule_Delete_Col,
    LZ_Editor_TableModule_Delete_Table,
    LZ_Editor_Undo_Undo,
    LZ_Editor_Undo_Redo
  } = messages[lang]

  const l = lang.split('-')
  const langCode = l.length >= 2 ? `${l[0]}-${l[1].toUpperCase()}` : lang;
  i18nAddResources(langCode, {
    header: {
      text: LZ_Editor_Header_Text
    },
    fontFamily: {
      default: LZ_Editor_Font_Family_Default
    },
    fontSize: {
      default: LZ_Editor_Font_Size_Default
    },
    color: {
      default: LZ_Editor_Color_Default,
      clear: LZ_Editor_Color_Clear
    },
    textStyle: {
      underline: LZ_Editor_Text_Style_Underline
    },
    indent: {
      increase: LZ_Editor_Indent_Increase,
      decrease: LZ_Editor_Indent_Decrease
    },
    justify: {
      left: LZ_Editor_Justify_Left,
      right: LZ_Editor_Justify_Right,
      center: LZ_Editor_Justify_Center,
      justify:LZ_Editor_Justify_Justify
    },
    blockQuote: {
      title: LZ_Editor_BlockQuote_Title
    },
    todo: {
      todo: LZ_Editor_Todo_Todo
    },
    common: {
      enter: LZ_Editor_Common_Center
    },
    tableModule: {
      header: LZ_Editor_TableModule_Header,
      widthAuto: LZ_Editor_TableModule_Width_Auto,
      insertRow: LZ_Editor_TableModule_Insert_Row,
      deleteRow: LZ_Editor_TableModule_Delete_Row,
      insertCol: LZ_Editor_TableModule_Insert_Col,
      deleteCol: LZ_Editor_TableModule_Delete_Col,
      deleteTable: LZ_Editor_TableModule_Delete_Table,
    },
    undo: {
      undo: LZ_Editor_Undo_Undo,
      redo: LZ_Editor_Undo_Redo
    }
  });
})
