import { Inject, Injectable } from '@angular/core'
import { Language } from '@c19/commons'
import { CURRENT_LANG } from './language.token'
import { Translations } from './translations.type'

@Injectable({ providedIn: 'root' })
export class TranslationsLoaderService {
  readonly translations: Promise<Translations>

  constructor(@Inject(CURRENT_LANG) lang: Language) {
    this.translations = this.loadLang(lang)
  }

  private loadLang(lang: Language): Promise<Translations> {
    switch (lang) {
      case Language.EN:
        return <any>import('./en.json')
      case Language.FR:
        return <any>import('./fr.json')
      case Language.IT:
        return <any>import('./it.json')
      case Language.RM:
        return <any>import('./rm.json')
      default:
        return <any>import('./de.json')
    }
  }
}
