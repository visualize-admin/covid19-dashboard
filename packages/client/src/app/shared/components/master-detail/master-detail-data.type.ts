import { TemplateRef } from '@angular/core'
import { Observable } from 'rxjs'
import { MasterDetailContext } from './master-detail-menu-item-context.type'
import { MasterDetailMenuItem } from './master-detail-menu-item.type'

export interface MasterDetailData<T extends MasterDetailMenuItem = MasterDetailMenuItem> {
  items$: Observable<T[]>
  templateRef: TemplateRef<MasterDetailContext<T>>
  stickyHeaderEl: HTMLElement | null
  facet: 'slim' | 'default'
}
