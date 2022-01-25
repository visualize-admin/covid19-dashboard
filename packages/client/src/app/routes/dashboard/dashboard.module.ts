import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DataGuard } from '../../core/data/data.guard'
import { CommonsModule } from '../../shared/commons/commons.module'
import { FooterModule } from '../../shared/components/footer/footer.module'
import { HeaderModule } from '../../shared/components/header/header.module'
import { PageNotificationModule } from '../../shared/components/page-notification/page-notification.module'
import { TabListModule } from '../../shared/components/tab-list/tab-list.module'
import { RoutePaths } from '../route-paths.enum'
import { DashboardComponent } from './dashboard.component'

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
        canActivate: [DataGuard],
        children: [
          {
            path: RoutePaths.DASHBOARD_OVERVIEW,
            loadChildren: () => import('./overview/overview.module').then((m) => m.OverviewModule),
          },
          {
            path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC,
            loadChildren: () => import('./epidemiologic/epidemiologic.module').then((m) => m.EpidemiologicModule),
          },
          {
            path: RoutePaths.DASHBOARD_VACCINATION,
            loadChildren: () => import('./vaccination/vaccination.module').then((m) => m.VaccinationModule),
          },
          {
            path: RoutePaths.DASHBOARD_CAPACITY,
            loadChildren: () => import('./capacity/capacity.module').then((m) => m.CapacityModule),
          },
          {
            path: RoutePaths.DASHBOARD_INTERNATIONAL,
            loadChildren: () => import('./international/international.module').then((m) => m.InternationalModule),
          },
          {
            path: RoutePaths.DASHBOARD_WEEKLY_REPORT,
            loadChildren: () => import('./weekly-report/weekly-report.module').then((m) => m.WeeklyReportModule),
          },
          { path: '**', redirectTo: RoutePaths.DASHBOARD_OVERVIEW },
        ],
      },
    ]),
    HeaderModule,
    RouterModule,
    FooterModule,
    TabListModule,
    CommonsModule,
    PageNotificationModule,
  ],
})
export class DashboardModule {}
