import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ChoroplethModule } from '../../diagrams/choropleth/choropleth.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ColorLegendModule } from '../../shared/components/color-legend/color-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { Inz14dSumLegendModule } from '../../shared/components/inz14d-sum-legend/inz14d-sum-legend.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { DetailCardInternationalCaseGeographyComponent } from './detail-card-international-case-geography.component'
import { GeoUnitIntCasesDataComponent } from './geo-unit-int-cases-data/geo-unit-int-cases-data.component'

@NgModule({
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    ChoroplethModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    NativeSelectModule,
    ColorLegendModule,
    Inz14dSumLegendModule,
  ],
  declarations: [DetailCardInternationalCaseGeographyComponent, GeoUnitIntCasesDataComponent],
  exports: [DetailCardInternationalCaseGeographyComponent],
})
export class DetailCardInternationalCaseGeographyModule {}
