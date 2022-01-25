import { A11yModule } from '@angular/cdk/a11y'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { HeaderComponent } from './header.component'
import { NavBoardComponent } from './nav-board/nav-board.component'

@NgModule({
  declarations: [HeaderComponent, NavBoardComponent],
  imports: [CommonModule, RouterModule, SvgModule, A11yModule, CommonsModule],
  exports: [HeaderComponent, NavBoardComponent],
})
export class HeaderModule {}
