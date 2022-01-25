import { A11yModule } from '@angular/cdk/a11y'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { FooterComponent } from './footer.component'

@NgModule({
  imports: [CommonModule, CommonsModule, SvgModule, A11yModule, RouterModule],
  declarations: [FooterComponent],
  exports: [FooterComponent],
})
export class FooterModule {}
