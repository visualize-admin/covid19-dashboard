import { isPlatformBrowser } from '@angular/common'
import { Language, LANGUAGE_COOKIE_NAME, LANGUAGE_FALLBACK, LANGUAGE_MAX_AGE } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'

// HAS SIDE-EFFECT: set the language cookie

export function currentLangFactory(doc: Document, platformId: any) {
  const langOpts = getEnumValues(Language).join('|')
  const languageRegex = new RegExp(`^\/(${langOpts})\/`)

  // check for language presence inside url
  const match = languageRegex.exec(doc.location.pathname)
  if (match) {
    const lang = <Language>match[1]
    // set cookie on client side only
    if (isPlatformBrowser(platformId)) {
      doc.cookie = `${LANGUAGE_COOKIE_NAME}=${lang}; Max-Age=${LANGUAGE_MAX_AGE}; path=/`
    }
    return lang
  } else {
    // should basically not happen since the lambda function always redirects
    return LANGUAGE_FALLBACK
  }
}
