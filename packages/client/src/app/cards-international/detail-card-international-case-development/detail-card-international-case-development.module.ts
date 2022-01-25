import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { Inz14dSumLegendModule } from '../../shared/components/inz14d-sum-legend/inz14d-sum-legend.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { DetailCardInternationalCaseDevelopmentComponent } from './detail-card-international-case-development.component'

@NgModule({
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    HistogramLineModule,
    NativeSelectModule,
    ReactiveFormsModule,
    Inz14dSumLegendModule,
    ChartLegendModule,
  ],
  declarations: [DetailCardInternationalCaseDevelopmentComponent],
  exports: [DetailCardInternationalCaseDevelopmentComponent],
})
export class DetailCardInternationalCaseDevelopmentModule {}
