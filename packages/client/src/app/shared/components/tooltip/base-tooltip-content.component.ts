import { ChangeDetectorRef, Component, Inject, InjectionToken } from '@angular/core'
import { TranslatorService } from '../../../core/i18n/translator.service'

export const TOOLTIP_INNER_DATA = new InjectionToken('TOOLTIP_INNER_DATA')

@Component({ template: '' })
export abstract class BaseTooltipContentComponent<T> {
  get data(): T {
    return this._data
  }

  private _data: T

  constructor(
    @Inject(TOOLTIP_INNER_DATA) initData: T,
    protected readonly translator: TranslatorService,
    private cd: ChangeDetectorRef,
  ) {
    this._data = initData
  }

  update(data: T) {
    this._data = data
    this.cd.detectChanges()
  }
}
