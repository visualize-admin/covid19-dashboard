import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SvgModule } from '@shiftcode/ngx-components'
import { WarningsListComponent } from './warnings-list.component'

@NgModule({
  declarations: [WarningsListComponent],
  imports: [CommonModule, SvgModule],
  exports: [WarningsListComponent],
})
export class WarningsListModule {}
