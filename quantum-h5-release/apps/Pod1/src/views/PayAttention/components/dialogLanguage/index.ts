// import DialogLanguage from "./index.vue";

// export const LANGUAGE_LIST = [
//     // { name: "English", code: "en-GB" },
//     { name: "English", code: "en-US" },
//     // { name: "English (India)", code: "en-IN" },
//     // { name: "English (South Africa)", code: "en-ZA" }, // 对应“English (African Accent)”选用常见地区
//     { name: "Spanish", code: "es-ES" },
//     // { name: "Spanish (Mexico)", code: "es-MX" },
//     { name: "Portuguese", code: "pt-BR" },
//     { name: "Chinese", code: "zh-CN" },
//     { name: "Italian", code: "it-IT" },
//     { name: "German", code: "de-DE" },
//     { name: "Arabic", code: "ar-EG" },
//     { name: "Japanese", code: "ja-JP" },
//     { name: "French", code: "fr-FR" },
//     { name: "Polish", code: "pl-PL" },
//     { name: "Romanian", code: "ro-RO" },
// ];
// export default DialogLanguage;
import DialogLanguage from "./settingPage.vue";
export { getLanguageList, LANGUAGE_CODES } from "./languageList.ts"; // 从独立文件导出
export default DialogLanguage;
