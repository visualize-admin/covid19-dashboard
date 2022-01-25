import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { RangeSliderComponent } from './range-slider.component'

@NgModule({
  declarations: [RangeSliderComponent],
  imports: [CommonModule, CommonsModule, ReactiveFormsModule, SvgModule],
  exports: [RangeSliderComponent],
})
export class RangeSliderModule {}
