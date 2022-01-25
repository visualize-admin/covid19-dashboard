import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { CommonsModule } from '../../commons/commons.module'
import { NativeSelectModule } from '../native-select/native-select.module'
import { SingleSelectModule } from '../single-select/single-select.module'
import { ToggleButtonListModule } from '../toggle-button-list/toggle-button-list.module'
import { DetailFilterComponent } from './detail-filter.component'

@NgModule({
  declarations: [DetailFilterComponent],
  imports: [
    CommonModule,
    ToggleButtonListModule,
    CommonsModule,
    ReactiveFormsModule,
    NativeSelectModule,
    SingleSelectModule,
  ],
  exports: [DetailFilterComponent],
})
export class DetailFilterModule {}
