import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SvgModule } from '@shiftcode/ngx-components'
import { InfoTooltipComponent } from './info-tooltip.component'

@NgModule({
  declarations: [InfoTooltipComponent],
  imports: [CommonModule, SvgModule],
  exports: [InfoTooltipComponent],
})
export class InfoTooltipModule {}
