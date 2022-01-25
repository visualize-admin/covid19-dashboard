import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { ContextDataResolver } from '../../../core/context-data.resolver'
import { OverviewDataResolver } from '../../../core/overview-data-resolver.service'
import { HistogramPreviewModule } from '../../../diagrams/histogram/histogram-preview/histogram-preview.module'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { ChartLegendModule } from '../../../shared/components/chart-legend/chart-legend.module'
import { RouteDataKey } from '../../route-data-key.enum'
import { ExportDailyReportComponent } from './export-daily-report.component'

@NgModule({
  imports: [
    CommonModule,
    SvgModule,
    CommonsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ExportDailyReportComponent,
        resolve: {
          [RouteDataKey.OVERVIEW_DATA]: OverviewDataResolver,
          [RouteDataKey.CONTEXT_DATA]: ContextDataResolver,
        },
      },
    ]),
    HistogramPreviewModule,
    ChartLegendModule,
  ],
  declarations: [ExportDailyReportComponent],
})
export class ExportDailyReportModule {}
