import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { OverviewCardHintDirective } from './overview-card-hint.directive'
import { OverviewCardInfoDirective } from './overview-card-info.directive'
import { OverviewCardWarningDirective } from './overview-card-warning.directive'
import { OverviewCardComponent } from './overview-card.component'
import { OverviewCardWarningComponent } from './overview-card-warning/overview-card-warning.component'

@NgModule({
  imports: [CommonModule, SvgModule, CommonsModule, RouterModule],
  declarations: [
    OverviewCardComponent,
    OverviewCardInfoDirective,
    OverviewCardWarningDirective,
    OverviewCardHintDirective,
    OverviewCardWarningComponent,
  ],
  exports: [
    OverviewCardComponent,
    OverviewCardInfoDirective,
    OverviewCardWarningDirective,
    OverviewCardHintDirective,
    OverviewCardWarningComponent,
  ],
})
export class OverviewCardModule {}
