import { Directive, TemplateRef } from '@angular/core'

@Directive({ selector: '[bagDetailCardAddon]' })
export class DetailCardAddonDirective {
  constructor(readonly templateRef: TemplateRef<any>) {}
}
