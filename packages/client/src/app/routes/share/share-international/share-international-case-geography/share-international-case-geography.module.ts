import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardInternationalCaseGeographyModule } from '../../../../cards-international/detail-card-international-case-geography/detail-card-international-case-geography.module'
import { ShareInternationalCaseGeographyComponent } from './share-international-case-geography.component'

@NgModule({
  imports: [CommonModule, DetailCardInternationalCaseGeographyModule],
  declarations: [ShareInternationalCaseGeographyComponent],
})
export class ShareInternationalCaseGeographyModule {}
