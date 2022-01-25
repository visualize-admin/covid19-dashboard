import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DataGuard } from '../../core/data/data.guard'
import { RoutePaths } from '../route-paths.enum'
import { ExportComponent } from './export.component'

@NgModule({
  declarations: [ExportComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ExportComponent,
        canActivate: [DataGuard],
        children: [
          // report
          {
            path: RoutePaths.EXPORT_REPORT,
            loadChildren: () =>
              import('./export-daily-report/export-daily-report.module').then((m) => m.ExportDailyReportModule),
          },

          // overview cards
          {
            path: RoutePaths.EXPORT_OVERVIEW,
            loadChildren: () =>
              import('./export-overview-cards/export-overview-cards.module').then((m) => m.ExportOverviewCardsModule),
          },
          // twitter images
          {
            path: RoutePaths.EXPORT_TWITTER_IMAGES,
            loadChildren: () =>
              import('./export-twitter-images/export-twitter-images.module').then((m) => m.ExportTwitterImagesModule),
          },
        ],
      },
    ]),
  ],
})
export class ExportModule {}
