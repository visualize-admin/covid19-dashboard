import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { DetailCardEpidemiologicTestPositivityComponent } from './detail-card-epidemiologic-test-positivity.component'

@NgModule({
  imports: [CommonModule, DetailCardModule, CommonsModule, HistogramLineModule, ChartLegendModule],
  declarations: [DetailCardEpidemiologicTestPositivityComponent],
  exports: [DetailCardEpidemiologicTestPositivityComponent],
})
export class DetailCardEpidemiologicTestPositivityModule {}
