import { A11yModule } from '@angular/cdk/a11y'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { OptionModule } from '../option/option.module'
import { MultiSelectComponent } from './multi-select.component'
import { MultiSelectModalComponent } from './multi-select-modal/multi-select-modal.component'

@NgModule({
  declarations: [MultiSelectComponent, MultiSelectModalComponent],
  imports: [CommonModule, A11yModule, CommonsModule, SvgModule, OptionModule],
  exports: [MultiSelectComponent],
})
export class MultiSelectModule {}
