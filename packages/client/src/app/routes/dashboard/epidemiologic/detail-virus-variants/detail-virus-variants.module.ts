import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardVirusVariantsOverviewModule } from '../../../../cards-virus-variants/detail-card-virus-variants-overview/detail-card-virus-variants-overview.module'
import { DetailCardVirusVariantsSegmentationModule } from '../../../../cards-virus-variants/detail-card-virus-variants-segmentation/detail-card-virus-variants-segmentation.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { DetailFilterModule } from '../../../../shared/components/detail-filter/detail-filter.module'
import { DetailVirusVariantsComponent } from './detail-virus-variants.component'

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    DetailCardVirusVariantsOverviewModule,
    DetailFilterModule,
    DetailCardVirusVariantsSegmentationModule,
  ],
  declarations: [DetailVirusVariantsComponent],
  exports: [DetailVirusVariantsComponent],
})
export class DetailVirusVariantsModule {}
