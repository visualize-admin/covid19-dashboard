import { Pipe, PipeTransform } from '@angular/core'
import { TranslatorService } from '../../core/i18n/translator.service'

@Pipe({ name: 'i18n', pure: true })
export class I18nPipe implements PipeTransform {
  constructor(private translator: TranslatorService) {}

  transform(itemKey: string, arg?: Record<string, string | number>): string {
    return this.translator.get(itemKey, arg)
  }
}
