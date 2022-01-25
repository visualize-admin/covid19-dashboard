import { Pipe, PipeTransform } from '@angular/core'
import { TranslatorService } from '../../core/i18n/translator.service'

@Pipe({ name: 'i18nCheckKey', pure: true })
export class I18nCheckKeyPipe implements PipeTransform {
  constructor(private translator: TranslatorService) {}

  transform(itemKey: string | undefined | null, arg?: Record<string, string | number>): itemKey is string {
    return !!itemKey && !!this.translator.tryGet(itemKey, arg)
  }
}
