import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CardOverviewCaseModule } from '../../../cards-overview/card-overview-case/card-overview-case.module'
import { CardOverviewCertificateModule } from '../../../cards-overview/card-overview-certificate/card-overview-certificate.module'
import { CardOverviewCtModule } from '../../../cards-overview/card-overview-ct/card-overview-ct.module'
import { CardOverviewDeathModule } from '../../../cards-overview/card-overview-death/card-overview-death.module'
import { CardOverviewHospCapacityModule } from '../../../cards-overview/card-overview-hosp-capacity/card-overview-hosp-capacity.module'
import { CardOverviewHospModule } from '../../../cards-overview/card-overview-hosp/card-overview-hosp.module'
import { CardOverviewReproModule } from '../../../cards-overview/card-overview-repro/card-overview-repro.module'
import { CardOverviewTestModule } from '../../../cards-overview/card-overview-test/card-overview-test.module'
import { CardOverviewVaccineModule } from '../../../cards-overview/card-overview-vaccine/card-overview-vaccine.module'
import { CardOverviewVirusVariantsModule } from '../../../cards-overview/card-overview-virus-variants/card-overview-virus-variants.module'
import { PathParams } from '../../../shared/models/path-params.enum'
import { OverviewDataResolver } from '../../../core/overview-data-resolver.service'
import { RouteDataKey } from '../../route-data-key.enum'
import { ExportOverviewCardsComponent } from './export-overview-cards.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ExportOverviewCardsComponent,
      },
      {
        path: `:${PathParams.CARD_TYPE}`,
        component: ExportOverviewCardsComponent,
        resolve: {
          [RouteDataKey.OVERVIEW_DATA]: OverviewDataResolver,
        },
      },
    ]),
    CardOverviewCaseModule,
    CardOverviewHospModule,
    CardOverviewDeathModule,
    CardOverviewTestModule,
    CardOverviewCtModule,
    CardOverviewReproModule,
    CardOverviewVaccineModule,
    CardOverviewVirusVariantsModule,
    CardOverviewHospCapacityModule,
    CardOverviewCertificateModule,
  ],
  declarations: [ExportOverviewCardsComponent],
})
export class ExportOverviewCardsModule {}
