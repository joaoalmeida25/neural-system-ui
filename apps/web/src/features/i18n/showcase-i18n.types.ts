import type { EN_MESSAGES } from "./locales/en.locale";

export type ShowcaseLocale = "pt-BR" | "en";

type Translated<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? { readonly [Index in keyof T]: Translated<T[Index]> }
    : { readonly [Key in keyof T]: Translated<T[Key]> };

export type ShowcaseMessages = Translated<typeof EN_MESSAGES>;
