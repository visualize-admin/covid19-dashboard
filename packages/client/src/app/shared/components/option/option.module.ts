import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SvgModule } from '@shiftcode/ngx-components'
import { OptionComponent } from './option.component'
import { OptionGroupComponent } from './option-group.component'

@NgModule({
  imports: [CommonModule, SvgModule],
  exports: [OptionComponent, OptionGroupComponent],
  declarations: [OptionComponent, OptionGroupComponent],
})
export class OptionModule {}
