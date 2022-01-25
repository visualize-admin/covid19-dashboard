import { A11yModule } from '@angular/cdk/a11y'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { TabListComponent } from './tab-list.component'
import { TabItemDirective } from './tab-item.directive'

@NgModule({
  declarations: [TabListComponent, TabItemDirective],
  imports: [A11yModule, CommonModule, RouterModule, SvgModule],
  exports: [TabListComponent, TabItemDirective],
})
export class TabListModule {}
