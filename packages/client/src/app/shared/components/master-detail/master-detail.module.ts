import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { MasterDetailDirective } from './master-detail.directive'
import { MasterDetailComponent } from './master-detail.component'

@NgModule({
  declarations: [MasterDetailDirective, MasterDetailComponent],
  imports: [CommonModule, RouterModule, SvgModule],
  exports: [MasterDetailDirective, MasterDetailComponent],
})
export class MasterDetailModule {}
