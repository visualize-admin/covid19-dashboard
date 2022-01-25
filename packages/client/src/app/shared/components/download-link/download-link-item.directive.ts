import { Directive, TemplateRef } from '@angular/core'

@Directive({ selector: '[bagDownloadLinkItem]' })
export class DownloadLinkItemDirective {
  constructor(readonly template: TemplateRef<any>) {}
}
