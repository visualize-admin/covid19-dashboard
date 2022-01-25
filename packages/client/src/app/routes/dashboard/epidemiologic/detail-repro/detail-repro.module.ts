import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DetailCardReproDevelopmentModule } from '../../../../cards-repro/detail-card-repro-development/detail-card-repro-development.module'
import { DetailCardReproGeographyModule } from '../../../../cards-repro/detail-card-repro-geography/detail-card-repro-geography.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { DetailReproComponent } from './detail-repro.component'

@NgModule({
  imports: [CommonModule, DetailCardReproGeographyModule, DetailCardReproDevelopmentModule, CommonsModule],
  declarations: [DetailReproComponent],
  exports: [DetailReproComponent],
})
export class DetailReproModule {}
