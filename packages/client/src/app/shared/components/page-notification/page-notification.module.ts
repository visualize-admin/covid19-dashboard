import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SvgModule } from '@shiftcode/ngx-components'
import { PageNotificationComponent } from './page-notification.component'

@NgModule({
  declarations: [PageNotificationComponent],
  imports: [CommonModule, SvgModule],
  exports: [PageNotificationComponent],
})
export class PageNotificationModule {}
