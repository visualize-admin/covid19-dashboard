import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { ChoroplethModule } from '../../diagrams/choropleth/choropleth.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ColorLegendModule } from '../../shared/components/color-legend/color-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { DetailCardVaccDosesGeographyComponent } from './detail-card-vacc-doses-geography.component'
import { GeoUnitVaccDosesDataComponent } from './geo-unit-vacc-doses-data/geo-unit-vacc-doses-data.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    DetailCardModule,
    CommonsModule,
    SvgModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    ChoroplethModule,
    ColorLegendModule,
  ],
  declarations: [DetailCardVaccDosesGeographyComponent, GeoUnitVaccDosesDataComponent],
  exports: [DetailCardVaccDosesGeographyComponent],
})
export class DetailCardVaccDosesGeographyModule {}
