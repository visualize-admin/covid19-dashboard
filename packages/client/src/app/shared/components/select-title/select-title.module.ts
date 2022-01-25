import { A11yModule } from '@angular/cdk/a11y'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { NativeSelectModule } from '../native-select/native-select.module'
import { SearchFilterModule } from '../search-filter/search-filter.module'
import { SelectTitleComponent } from './select-title.component'

@NgModule({
  declarations: [SelectTitleComponent],
  imports: [
    CommonModule,
    CommonsModule,
    NativeSelectModule,
    ReactiveFormsModule,
    SearchFilterModule,
    SvgModule,
    A11yModule,
  ],
  exports: [SelectTitleComponent],
})
export class SelectTitleModule {}
