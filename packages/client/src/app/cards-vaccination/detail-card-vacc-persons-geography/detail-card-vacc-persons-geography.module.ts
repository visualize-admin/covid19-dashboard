import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { ChoroplethModule } from '../../diagrams/choropleth/choropleth.module'
import { DistributionBarModule } from '../../diagrams/distribution-bar/distribution-bar.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ColorLegendModule } from '../../shared/components/color-legend/color-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { DetailCardVaccPersonsGeographyComponent } from './detail-card-vacc-persons-geography.component'
import { GeoUnitVaccPersonsDataComponent } from './geo-unit-vacc-persons-data/geo-unit-vacc-persons-data.component'

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
    DistributionBarModule,
    NativeSelectModule,
  ],
  declarations: [DetailCardVaccPersonsGeographyComponent, GeoUnitVaccPersonsDataComponent],
  exports: [DetailCardVaccPersonsGeographyComponent],
})
export class DetailCardVaccPersonsGeographyModule {}
