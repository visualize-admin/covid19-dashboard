import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { SingleSelectComponent } from './single-select.component'

@NgModule({
  imports: [CommonModule, CommonsModule, SvgModule],
  declarations: [SingleSelectComponent],
  exports: [SingleSelectComponent],
})
export class SingleSelectModule {}
