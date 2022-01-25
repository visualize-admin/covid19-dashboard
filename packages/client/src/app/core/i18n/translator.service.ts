import { Logger, LoggerService } from '@shiftcode/ngx-core'
import { Translations } from './translations.type'
import { interpolate, tryReplaceHyphensAndNumSpaces } from './translator-utils'

export type TextArgs = Record<string, string | number>
export type KeyGetter = (key: string, args?: TextArgs) => string
export type KeyTryGetter = (key: string, args?: TextArgs) => string | undefined
export type KeyFallbackGetter = (key: string, fallbackKey: string, args?: TextArgs) => string

export class TranslatorService {
  readonly get: KeyGetter
  readonly tryGet: KeyTryGetter
  readonly getWithFallback: KeyFallbackGetter

  private readonly logger: Logger

  constructor(loggerService: LoggerService, private readonly translations: Translations, showKeys: boolean) {
    this.logger = loggerService.getInstance('TranslatorService')
    if (showKeys) {
      this.get = this._showKey
      this.tryGet = this._showKey
      this.getWithFallback = this._showKeyWithFallback
    } else {
      this.get = this._get
      this.tryGet = this._tryGet
      this.getWithFallback = this._getWithFallback
    }
  }

  interpolate(text: string, args: TextArgs): string {
    return Object.entries(args || {}).reduce((u, [k, v]) => u.replace(`{${k}}`, <string>v), text)
  }

  private readonly _getWithFallback: KeyFallbackGetter = (key, fallbackKey, args) => {
    return this._tryGet(key, args) || this._get(fallbackKey, args)
  }

  private readonly _get: KeyGetter = (key, args) => {
    const value = this.tryGet(key, args)
    if (!value) {
      this.logger.error(`Translation key '${key}' was used but is not available`)
      return `???${key}???`
    }
    return value
  }

  private readonly _tryGet: KeyTryGetter = (key, args) => {
    const value = this.translations[key]
    if (!value) {
      return
    }
    return tryReplaceHyphensAndNumSpaces(!args ? value : interpolate(value, args))
  }

  private readonly _showKey: KeyGetter = (key, args) => {
    return args ? `${key} :: ${Object.keys(args).join(', ')}` : key
  }

  private readonly _showKeyWithFallback: KeyFallbackGetter = (key, fallbackKey, args) => {
    return this._showKey(`${key}/${fallbackKey}`, args)
  }
}
