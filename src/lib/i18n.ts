import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ptBR from "@/locales/pt-BR.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import de from "@/locales/de.json";
import it from "@/locales/it.json";
import ja from "@/locales/ja.json";
import ko from "@/locales/ko.json";
import zhCN from "@/locales/zh-CN.json";

export const SUPPORTED_LANGUAGES = [
  "pt-BR", "en", "es", "fr", "de", "it", "ja", "ko", "zh-CN",
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "pt-BR": { translation: ptBR },
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      ja: { translation: ja },
      ko: { translation: ko },
      "zh-CN": { translation: zhCN },
    },
    fallbackLng: "pt-BR",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "evocore_lang",
    },
  });

export default i18n;
