import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { MultiSelectModule } from '../../shared/components/multi-select/multi-select.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { DetailCardVaccSymptomsDemographyComponent } from './detail-card-vacc-symptoms-demography.component'

@NgModule({
  declarations: [DetailCardVaccSymptomsDemographyComponent],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    ReactiveFormsModule,
    NativeSelectModule,
    HistogramLineModule,
    MultiSelectModule,
    ChartLegendModule,
  ],
  exports: [DetailCardVaccSymptomsDemographyComponent],
})
export class DetailCardVaccSymptomsDemographyModule {}
