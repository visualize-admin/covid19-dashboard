import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../commons/commons.module'
import { TooltipBoundsContentComponent } from './tooltip-bounds-content/tooltip-bounds-content.component'
import { TooltipListContentComponent } from './tooltip-list-content/tooltip-list-content.component'
import { TooltipComponent } from './tooltip/tooltip.component'
import { TooltipTableContentComponent } from './tooltip-table-content/tooltip-table-content.component'

@NgModule({
  imports: [CommonModule, CommonsModule],
  declarations: [
    TooltipComponent,
    TooltipListContentComponent,
    TooltipBoundsContentComponent,
    TooltipTableContentComponent,
  ],
})
export class TooltipModule {}
