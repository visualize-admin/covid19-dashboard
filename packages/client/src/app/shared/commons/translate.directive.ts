import { Directive, ElementRef, Input, OnChanges, SecurityContext, SimpleChanges } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { TextArgs, TranslatorService } from '../../core/i18n/translator.service'

// tslint:disable:directive-selector

@Directive({ selector: '[translate]' })
export class TranslateDirective implements OnChanges {
  @Input()
  translate: string

  @Input()
  translateValues?: TextArgs | null

  get key(): string {
    return this.translate
  }

  constructor(
    private readonly elementRef: ElementRef,
    private domSanitizer: DomSanitizer,
    private readonly translator: TranslatorService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.key) {
      const val = this.translator.get(this.key, this.translateValues || {})
      const valBr = val.replace(/(\r\n|\n|\r)/gm, '<br>')
      this.elementRef.nativeElement.innerHTML = this.domSanitizer.sanitize(SecurityContext.HTML, valBr)
    } else {
      this.elementRef.nativeElement.innerHTML = ''
    }
  }
}
