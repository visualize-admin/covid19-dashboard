import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CommonsModule } from '../../shared/commons/commons.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { WeeklyReportCardOverviewComponent } from './weekly-report-card-overview.component'

@NgModule({
  declarations: [WeeklyReportCardOverviewComponent],
  imports: [CommonModule, DetailCardModule, CommonsModule, NativeSelectModule, ReactiveFormsModule],
  exports: [WeeklyReportCardOverviewComponent],
})
export class WeeklyReportCardOverviewModule {}
