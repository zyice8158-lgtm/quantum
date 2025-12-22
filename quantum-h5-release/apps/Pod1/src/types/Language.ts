import { useLocale } from "@/hooks/i18n";
export interface LanguageItem {
    name: string;
    key: string;
}
export function useLanguageList() {
    const { t } = useLocale();
  
    const LanguageList: LanguageItem[] = [
      { name: t("Language.language_en_us"), key: "en-US" },
      { name: t("Language.language_en_uk"), key: "en-GB" },
      { name: t("Language.language_en_in"), key: "en-IN" },
      { name: t("Language.language_es_la"), key: "es-ES" },
      { name: t("Language.language_es_sp"), key: "es" },
      { name: t("Language.language_br"), key: "pt-BR" },
      { name: t("Language.language_it"), key: "it-IT" },
      { name: t("Language.language_fr"), key: "fr-FR" },
      { name: t("Language.language_de"), key: "de" },
    ];
    return LanguageList;
  }
