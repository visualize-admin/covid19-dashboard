import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { NativeSelectComponent } from './native-select.component'

@NgModule({
  declarations: [NativeSelectComponent],
  imports: [CommonModule],
  exports: [NativeSelectComponent],
})
export class NativeSelectModule {}
