import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardInternationalCaseDevelopmentModule } from '../../../../cards-international/detail-card-international-case-development/detail-card-international-case-development.module'
import { ShareInternationalCaseDevelopmentComponent } from './share-international-case-development.component'

@NgModule({
  imports: [CommonModule, DetailCardInternationalCaseDevelopmentModule],
  declarations: [ShareInternationalCaseDevelopmentComponent],
})
export class ShareInternationalCaseDevelopmentModule {}
