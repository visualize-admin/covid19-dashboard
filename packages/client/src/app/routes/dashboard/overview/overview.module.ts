import { A11yModule } from '@angular/cdk/a11y'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { getEnumValues } from '@shiftcode/utilities'
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
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { QueryParamsGuard, QueryParamsMapping } from '../../../core/query-params.guard'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { NativeSelectModule } from '../../../shared/components/native-select/native-select.module'
import { OptionModule } from '../../../shared/components/option/option.module'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { TimeSlotFilter } from '../../../shared/models/filters/time-slot-filter.enum'
import { RouteDataKey } from '../../route-data-key.enum'
import { OverviewComponent } from './overview.component'
import { OverviewDataResolver } from '../../../core/overview-data-resolver.service'

@NgModule({
  declarations: [OverviewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: OverviewComponent,
        canActivate: [QueryParamsGuard],
        data: {
          [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
            [QueryParams.TIME_FILTER, getEnumValues(TimeSlotFilter)],
          ],
        },
        resolve: {
          [RouteDataKey.SEO_META]: DefaultSeoMetaResolver,
          // we're not actually relying on it directly within the component
          // but we want it to be loaded so the component request will be found in the service cache
          [RouteDataKey.OVERVIEW_DATA]: OverviewDataResolver,
        },
      },
      { path: '**', redirectTo: '' },
    ]),
    ReactiveFormsModule,

    CommonsModule,
    SvgModule,
    OptionModule,
    NativeSelectModule,

    CardOverviewCtModule,
    CardOverviewCaseModule,
    CardOverviewDeathModule,
    CardOverviewHospModule,
    CardOverviewTestModule,
    CardOverviewReproModule,
    CardOverviewVaccineModule,
    CardOverviewVirusVariantsModule,
    CardOverviewHospCapacityModule,
    CardOverviewCertificateModule,
    A11yModule,
  ],
})
export class OverviewModule {}
