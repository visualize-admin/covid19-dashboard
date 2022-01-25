import { A11yModule } from '@angular/cdk/a11y'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { DownloadLinkItemDirective } from './download-link-item.directive'
import { DownloadLinkComponent } from './download-link.component'
import { DownloadModalComponent } from './download-modal/download-modal.component'

@NgModule({
  imports: [CommonModule, SvgModule, A11yModule, CommonsModule],
  declarations: [DownloadLinkComponent, DownloadLinkItemDirective, DownloadModalComponent],
  exports: [DownloadLinkComponent, DownloadLinkItemDirective],
})
export class DownloadLinkModule {}
