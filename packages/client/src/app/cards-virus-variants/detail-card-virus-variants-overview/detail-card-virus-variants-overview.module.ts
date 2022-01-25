import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../shared/commons/commons.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { InfoTooltipModule } from '../../shared/components/info-tooltip/info-tooltip.module'
import { DetailCardVirusVariantsOverviewComponent } from './detail-card-virus-variants-overview.component'
import { VariantsTableComponent } from './variants-table/variants-table.component'

@NgModule({
  imports: [CommonModule, CommonsModule, DetailCardModule, InfoTooltipModule],
  declarations: [DetailCardVirusVariantsOverviewComponent, VariantsTableComponent],
  exports: [DetailCardVirusVariantsOverviewComponent],
})
export class DetailCardVirusVariantsOverviewModule {}
