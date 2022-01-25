import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { HistogramAreaModule } from '../../diagrams/histogram/histogram-area/histogram-area.module'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { DetailCardVaccSymptomsDevelopmentComponent } from './detail-card-vacc-symptoms-development.component'

@NgModule({
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    ReactiveFormsModule,
    NativeSelectModule,
    HistogramAreaModule,
    ChartLegendModule,
    HistogramLineModule,
  ],
  declarations: [DetailCardVaccSymptomsDevelopmentComponent],
  exports: [DetailCardVaccSymptomsDevelopmentComponent],
})
export class DetailCardVaccSymptomsDevelopmentModule {}
