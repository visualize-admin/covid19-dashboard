import { A11yModule } from '@angular/cdk/a11y'
import { ClipboardModule } from '@angular/cdk/clipboard'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { ShareLinkComponent } from './share-link.component'

@NgModule({
  declarations: [ShareLinkComponent],
  imports: [A11yModule, ClipboardModule, CommonModule, SvgModule, CommonsModule, FormsModule, ReactiveFormsModule],
  exports: [ShareLinkComponent],
})
export class ShareLinkModule {}
