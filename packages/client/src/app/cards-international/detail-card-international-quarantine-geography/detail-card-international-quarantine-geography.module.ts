import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ChoroplethModule } from '../../diagrams/choropleth/choropleth.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { QuarantineLegendModule } from '../../shared/components/quarantine-legend/quarantine-legend.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { WarningsListModule } from '../../shared/components/warnings-list/warnings-list.module'
import { DetailCardInternationalQuarantineGeographyComponent } from './detail-card-international-quarantine-geography.component'

@NgModule({
  declarations: [DetailCardInternationalQuarantineGeographyComponent],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    WarningsListModule,
    ChoroplethModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    NativeSelectModule,
    QuarantineLegendModule,
  ],
  exports: [DetailCardInternationalQuarantineGeographyComponent],
})
export class DetailCardInternationalQuarantineGeographyModule {}
