import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { ChoroplethModule } from '../../diagrams/choropleth/choropleth.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ColorLegendModule } from '../../shared/components/color-legend/color-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { KeyValueListModule } from '../../shared/components/key-value-list/key-value-list.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { TooltipModule } from '../../shared/components/tooltip/tooltip.module'
import { DetailCardEpidemiologicGeographyComponent } from './detail-card-epidemiologic-geography.component'

@NgModule({
  declarations: [DetailCardEpidemiologicGeographyComponent],
  imports: [
    CommonModule,
    TooltipModule,
    DetailCardModule,
    ChoroplethModule,
    CommonsModule,
    ColorLegendModule,
    KeyValueListModule,
    SvgModule,
    RouterModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
  ],
  exports: [DetailCardEpidemiologicGeographyComponent],
})
export class DetailCardEpidemiologicGeographyModule {}
