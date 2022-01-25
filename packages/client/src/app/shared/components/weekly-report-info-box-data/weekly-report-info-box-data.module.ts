import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../commons/commons.module'
import { WeeklyReportInfoBoxDataComponent } from './weekly-report-info-box-data.component'

@NgModule({
  declarations: [WeeklyReportInfoBoxDataComponent],
  imports: [CommonModule, CommonsModule],
  exports: [WeeklyReportInfoBoxDataComponent],
})
export class WeeklyReportInfoBoxDataModule {}
