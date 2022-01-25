import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { HistogramAreaModule } from '../../diagrams/histogram/histogram-area/histogram-area.module'
import { MatrixStackModule } from '../../diagrams/matrix/matrix-stack/matrix-stack.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { DetailCardVaccinationGroupRatioComponent } from './detail-card-vaccination-group-ratio.component'

@NgModule({
  declarations: [DetailCardVaccinationGroupRatioComponent],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    NativeSelectModule,
    ReactiveFormsModule,
    MatrixStackModule,
    HistogramAreaModule,
    ChartLegendModule,
  ],
  exports: [DetailCardVaccinationGroupRatioComponent],
})
export class DetailCardVaccinationGroupRatioModule {}
