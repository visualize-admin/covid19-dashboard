import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../shared/commons/commons.module'
import { FooterModule } from '../../shared/components/footer/footer.module'
import { HeaderModule } from '../../shared/components/header/header.module'
import { PageNotificationModule } from '../../shared/components/page-notification/page-notification.module'
import { ShareComponent } from './share.component'

@NgModule({
  declarations: [ShareComponent],
  imports: [CommonModule, RouterModule, CommonsModule, HeaderModule, FooterModule, SvgModule, PageNotificationModule],
})
export class ShareModule {}
