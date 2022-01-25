import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ToggleButtonListComponent } from './toggle-button-list.component'
import { ToggleButtonComponent } from './toggle-button/toggle-button.component'

@NgModule({
  declarations: [ToggleButtonListComponent, ToggleButtonComponent],
  exports: [ToggleButtonListComponent, ToggleButtonComponent],
  imports: [CommonModule],
})
export class ToggleButtonListModule {}
