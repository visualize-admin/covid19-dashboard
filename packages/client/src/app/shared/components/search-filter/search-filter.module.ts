import { A11yModule } from '@angular/cdk/a11y'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { OptionModule } from '../option/option.module'
import { SearchFilterComponent } from './search-filter.component'
import { SearchListModalComponent } from './search-list-modal/search-list-modal.component'

@NgModule({
  imports: [CommonModule, SvgModule, A11yModule, CommonsModule, FormsModule, ReactiveFormsModule, OptionModule],
  declarations: [SearchFilterComponent, SearchListModalComponent],
  exports: [SearchFilterComponent, SearchListModalComponent],
})
export class SearchFilterModule {}
