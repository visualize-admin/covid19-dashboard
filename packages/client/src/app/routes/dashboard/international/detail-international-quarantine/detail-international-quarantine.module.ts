import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardInternationalQuarantineGeographyModule } from '../../../../cards-international/detail-card-international-quarantine-geography/detail-card-international-quarantine-geography.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { DetailCardModule } from '../../../../shared/components/detail-card/detail-card.module'
import { DetailInternationalQuarantineComponent } from './detail-international-quarantine.component'

@NgModule({
  imports: [CommonModule, CommonsModule, DetailCardModule, DetailCardInternationalQuarantineGeographyModule],
  declarations: [DetailInternationalQuarantineComponent],
  exports: [DetailInternationalQuarantineComponent],
})
export class DetailInternationalQuarantineModule {}
