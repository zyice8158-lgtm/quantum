// 语言代码和 i18n 键的映射
export const LANGUAGE_CODES = [
    { nameKey: "english", code: "en-US" },
    { nameKey: "spanish", code: "es-ES" },
    { nameKey: "portuguese", code: "pt-BR" },
    { nameKey: "chinese", code: "zh-CN" },
    { nameKey: "italian", code: "it-IT" },
    { nameKey: "german", code: "de-DE" },
    { nameKey: "arabic", code: "ar-EG" },
    { nameKey: "japanese", code: "ja-JP" },
    { nameKey: "french", code: "fr-FR" },
    { nameKey: "polish", code: "pl-PL" },
    { nameKey: "romanian", code: "ro-RO" },
] as const;

// 兼容性：保留原有的 LANGUAGE_LIST 导出，但返回使用 i18n 的函数
export const getLanguageList = (t: (key: string) => string) => {
    return LANGUAGE_CODES.map(item => ({
        name: t(`payAttention.languages.${item.nameKey}`),
        code: item.code
    }));
};
