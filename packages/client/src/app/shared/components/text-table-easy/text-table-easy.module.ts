import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../commons/commons.module'
import { TextTableEasyComponent } from './text-table-easy.component'

@NgModule({
  imports: [CommonModule, CommonsModule],
  declarations: [TextTableEasyComponent],
  exports: [TextTableEasyComponent],
})
export class TextTableEasyModule {}
