import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { WeeklyCompareTableComponent } from './weekly-compare-table.component'

@NgModule({
  imports: [CommonModule, CommonsModule, SvgModule],
  declarations: [WeeklyCompareTableComponent],
  exports: [WeeklyCompareTableComponent],
})
export class WeeklyCompareTableModule {}
