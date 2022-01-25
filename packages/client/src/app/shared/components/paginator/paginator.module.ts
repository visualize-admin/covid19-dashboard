import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { PaginatorComponent } from './paginator.component'
import { PaginatorContentDirective } from './paginator-content.directive'

@NgModule({
  declarations: [PaginatorComponent, PaginatorContentDirective],
  imports: [CommonModule, CommonsModule, ReactiveFormsModule, SvgModule],
  exports: [PaginatorComponent, PaginatorContentDirective],
})
export class PaginatorModule {}
