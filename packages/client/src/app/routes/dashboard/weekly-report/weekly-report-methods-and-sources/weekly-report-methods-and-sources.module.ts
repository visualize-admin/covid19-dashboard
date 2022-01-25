import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { WeeklyReportMethodsAndSourcesComponent } from './weekly-report-methods-and-sources.component'

@NgModule({
  declarations: [WeeklyReportMethodsAndSourcesComponent],
  imports: [CommonModule, CommonsModule],
})
export class WeeklyReportMethodsAndSourcesModule {}
