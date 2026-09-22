import { EN_MESSAGES } from "./locales/en.locale";
import { PT_BR_MESSAGES } from "./locales/pt-br.locale";
import {
  type ShowcaseLocale,
  type ShowcaseMessages,
} from "./showcase-i18n.types";

export const SHOWCASE_LOCALES = ["pt-BR", "en"] as const satisfies readonly ShowcaseLocale[];

const TRANSLATIONS = {
  "pt-BR": PT_BR_MESSAGES,
  en: EN_MESSAGES,
} as const satisfies Readonly<Record<ShowcaseLocale, ShowcaseMessages>>;

export type {
  ShowcaseLocale,
  ShowcaseMessages,
} from "./showcase-i18n.types";

export const getShowcaseMessages = (locale: ShowcaseLocale): ShowcaseMessages => (
  TRANSLATIONS[locale]
);

const isShowcaseLocale = (locale: string | null | undefined): locale is ShowcaseLocale => (
  SHOWCASE_LOCALES.some((supportedLocale) => supportedLocale === locale)
);

export const resolveDefaultLocale = (
  storedLocale?: string | null,
  language?: string,
): ShowcaseLocale => {
  if (isShowcaseLocale(storedLocale)) {
    return storedLocale;
  }

  const resolvedLanguage = language
    ?? (typeof navigator === "undefined" ? "en" : navigator.language);

  return resolvedLanguage.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
};
