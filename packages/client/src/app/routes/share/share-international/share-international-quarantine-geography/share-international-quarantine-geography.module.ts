import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DetailCardInternationalQuarantineGeographyModule } from '../../../../cards-international/detail-card-international-quarantine-geography/detail-card-international-quarantine-geography.module'
import { ShareInternationalQuarantineGeographyComponent } from './share-international-quarantine-geography.component'

@NgModule({
  imports: [CommonModule, DetailCardInternationalQuarantineGeographyModule],
  declarations: [ShareInternationalQuarantineGeographyComponent],
})
export class ShareInternationalQuarantineGeographyModule {}
