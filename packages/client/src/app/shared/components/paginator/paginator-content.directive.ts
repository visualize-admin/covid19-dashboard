import { Directive, TemplateRef } from '@angular/core'

export interface PaginatorContentContext {
  $implicit: number
}

@Directive({ selector: '[bagPaginatorContent]' })
export class PaginatorContentDirective {
  static ngTemplateContextGuard(dir: PaginatorContentDirective, ctx: any): ctx is PaginatorContentContext {
    return true
  }

  constructor(readonly templateRef: TemplateRef<PaginatorContentContext>) {}
}
