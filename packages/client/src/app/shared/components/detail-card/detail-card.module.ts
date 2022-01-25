import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { DownloadLinkModule } from '../download-link/download-link.module'
import { ShareLinkModule } from '../share-link/share-link.module'
import { DetailCardComponent } from './detail-card.component'
import { DetailCardAddonDirective } from './detail-card-addon.directive'

@NgModule({
  declarations: [DetailCardComponent, DetailCardAddonDirective],
  imports: [CommonModule, CommonsModule, SvgModule, DownloadLinkModule, ShareLinkModule, ReactiveFormsModule],
  exports: [DetailCardComponent, DetailCardAddonDirective],
})
export class DetailCardModule {}
