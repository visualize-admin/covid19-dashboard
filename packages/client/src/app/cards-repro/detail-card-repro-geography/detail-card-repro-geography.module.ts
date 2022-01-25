import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { ChoroplethModule } from '../../diagrams/choropleth/choropleth.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { ReproLegendModule } from '../../shared/components/repro-legend/repro-legend.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { DetailCardReproGeographyComponent } from './detail-card-repro-geography.component'

@NgModule({
  declarations: [DetailCardReproGeographyComponent],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    ReproLegendModule,
    ChoroplethModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  exports: [DetailCardReproGeographyComponent],
})
export class DetailCardReproGeographyModule {}
