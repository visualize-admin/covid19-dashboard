import { Language } from '@c19/commons'

export interface AltUrl {
  lang: Language
  altUrl: string
  canonicalUrl: string
}

export type AltUrls = Record<Language, AltUrl>
