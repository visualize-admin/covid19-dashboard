import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { ReproLegendModule } from '../../shared/components/repro-legend/repro-legend.module'
import { DetailCardReproDevelopmentComponent } from './detail-card-repro-development.component'

@NgModule({
  declarations: [DetailCardReproDevelopmentComponent],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    HistogramLineModule,
    ReproLegendModule,
    NativeSelectModule,
    ReactiveFormsModule,
    ChartLegendModule,
    RouterModule,
  ],
  exports: [DetailCardReproDevelopmentComponent],
})
export class DetailCardReproDevelopmentModule {}
