import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CardOverviewCaseModule } from '../../../cards-overview/card-overview-case/card-overview-case.module'
import { CardOverviewDeathModule } from '../../../cards-overview/card-overview-death/card-overview-death.module'
import { CardOverviewHospCapacityModule } from '../../../cards-overview/card-overview-hosp-capacity/card-overview-hosp-capacity.module'
import { CardOverviewHospModule } from '../../../cards-overview/card-overview-hosp/card-overview-hosp.module'
import { CardOverviewReproModule } from '../../../cards-overview/card-overview-repro/card-overview-repro.module'
import { CardOverviewTestModule } from '../../../cards-overview/card-overview-test/card-overview-test.module'
import { CardOverviewVirusVariantsModule } from '../../../cards-overview/card-overview-virus-variants/card-overview-virus-variants.module'
import { PathParams } from '../../../shared/models/path-params.enum'
import { OverviewDataResolver } from '../../../core/overview-data-resolver.service'
import { RouteDataKey } from '../../route-data-key.enum'
import { ExportTwitterImagesComponent } from './export-twitter-images.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: `:${PathParams.CARD_TYPE}`,
        component: ExportTwitterImagesComponent,
        resolve: {
          [RouteDataKey.OVERVIEW_DATA]: OverviewDataResolver,
        },
      },
    ]),
    CardOverviewTestModule,
    CardOverviewCaseModule,
    CardOverviewHospModule,
    CardOverviewDeathModule,
    CardOverviewVirusVariantsModule,
    CardOverviewReproModule,
    CardOverviewHospCapacityModule,
  ],
  declarations: [ExportTwitterImagesComponent],
})
export class ExportTwitterImagesModule {}
