import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../shared/commons/commons.module'
import { KeyValueListModule } from '../../shared/components/key-value-list/key-value-list.module'
import { OverviewCardModule } from '../../shared/components/overview-card/overview-card.module'
import { CardOverviewCtComponent } from './card-overview-ct.component'

@NgModule({
  imports: [CommonModule, OverviewCardModule, KeyValueListModule, CommonsModule],
  declarations: [CardOverviewCtComponent],
  exports: [CardOverviewCtComponent],
})
export class CardOverviewCtModule {}
