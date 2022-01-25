import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { KeyValueListComponent } from './key-value-list.component'

@NgModule({
  declarations: [KeyValueListComponent],
  imports: [CommonModule],
  exports: [KeyValueListComponent],
})
export class KeyValueListModule {}
