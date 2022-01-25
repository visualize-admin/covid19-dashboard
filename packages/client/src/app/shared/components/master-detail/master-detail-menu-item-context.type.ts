import { MasterDetailMenuItem } from './master-detail-menu-item.type'

export interface MasterDetailContext<T extends MasterDetailMenuItem = MasterDetailMenuItem> {
  $implicit: T
}
