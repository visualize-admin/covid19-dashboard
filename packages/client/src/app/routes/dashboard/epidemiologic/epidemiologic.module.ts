import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CantonGeoUnit, EpidemiologicSimpleGdi, TopLevelGeoUnit } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { QueryParamsGuard, QueryParamsMapping } from '../../../core/query-params.guard'
import { HistogramMenuModule } from '../../../diagrams/histogram/histogram-menu/histogram-menu.module'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { MasterDetailModule } from '../../../shared/components/master-detail/master-detail.module'
import { SelectTitleModule } from '../../../shared/components/select-title/select-title.module'
import { CumulativeFilter } from '../../../shared/models/filters/cumulative-filter.enum'
import { TimeSlotFilter } from '../../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { DetailCaseComponent } from './detail-case/detail-case.component'
import { DetailCaseModule } from './detail-case/detail-case.module'
import { DetailDeathComponent } from './detail-death/detail-death.component'
import { DetailDeathModule } from './detail-death/detail-death.module'
import { DetailHospComponent } from './detail-hosp/detail-hosp.component'
import { DetailHospModule } from './detail-hosp/detail-hosp.module'
import { DetailReproComponent } from './detail-repro/detail-repro.component'
import { DetailReproModule } from './detail-repro/detail-repro.module'
import { DetailReproResolver } from './detail-repro/detail-repro.resolver'
import { DetailTestComponent } from './detail-test/detail-test.component'
import { DetailTestModule } from './detail-test/detail-test.module'
import { DetailVirusVariantsComponent } from './detail-virus-variants/detail-virus-variants.component'
import { DetailVirusVariantsModule } from './detail-virus-variants/detail-virus-variants.module'
import { DetailVirusVariantsResolver } from './detail-virus-variants/detail-virus-variants.resolver'
import { EpidemiologicChildResolver } from './epidemiologic-child.resolver'
import { EpidemiologicParentResolver } from './epidemiologic-parent.resolver'
import { EpidemiologicComponent } from './epidemiologic.component'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: EpidemiologicComponent,
        canActivate: [QueryParamsGuard],
        data: {
          [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
            [QueryParams.TIME_FILTER, getEnumValues(TimeSlotFilter)],
            [QueryParams.GEO_FILTER, [...getEnumValues(TopLevelGeoUnit), ...getEnumValues(CantonGeoUnit)]],
          ],
        },
        resolve: {
          [RouteDataKey.SEO_META]: DefaultSeoMetaResolver,
          // we're not actually relying on it directly within the component
          // but we want it to be loaded so the component request will be found in the service cache
          [RouteDataKey.DETAIL_DATA]: EpidemiologicParentResolver,
          [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
        },
        children: [
          {
            path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_CASE,
            component: DetailCaseComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: EpidemiologicChildResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: EpidemiologicSimpleGdi.CASE,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: [
                [QueryParams.CUMULATIVE_FILTER, [CumulativeFilter.CUMULATIVE, CumulativeFilter.TWO_WEEK_SUM]],
                [QueryParams.DEMO_CUMULATIVE_FILTER, []],
                [QueryParams.DEV_CUMULATIVE_FILTER, []],
                [QueryParams.VARIANT_FILTER, []],
              ],
            },
          },
          {
            path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_HOSP,
            component: DetailHospComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: EpidemiologicChildResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: EpidemiologicSimpleGdi.HOSP,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: [
                [QueryParams.CUMULATIVE_FILTER, [CumulativeFilter.CUMULATIVE]],
                [QueryParams.DEMO_CUMULATIVE_FILTER, []],
                [QueryParams.DEV_CUMULATIVE_FILTER, []],
                [QueryParams.VARIANT_FILTER, []],
              ],
            },
          },
          {
            path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_DEATH,
            component: DetailDeathComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: EpidemiologicChildResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: EpidemiologicSimpleGdi.DEATH,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: [
                [QueryParams.CUMULATIVE_FILTER, [CumulativeFilter.CUMULATIVE]],
                [QueryParams.DEMO_CUMULATIVE_FILTER, []],
                [QueryParams.DEV_CUMULATIVE_FILTER, []],
                [QueryParams.VARIANT_FILTER, []],
              ],
            },
          },
          {
            path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_TEST,
            component: DetailTestComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: EpidemiologicChildResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: EpidemiologicSimpleGdi.TEST,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: [
                [QueryParams.CUMULATIVE_FILTER, [CumulativeFilter.CUMULATIVE]],
                [QueryParams.DEMO_CUMULATIVE_FILTER, []],
                [QueryParams.DEV_CUMULATIVE_FILTER, []],
                [QueryParams.VARIANT_FILTER, []],
              ],
            },
          },
          {
            path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_VIRUS_VARIANTS,
            component: DetailVirusVariantsComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: DetailVirusVariantsResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: EpidemiologicSimpleGdi.VIRUS_VARIANTS,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.REL_ABS_FILTER, []],
                [QueryParams.CUMULATIVE_FILTER, []],
                [QueryParams.DEMO_CUMULATIVE_FILTER, []],
                [QueryParams.DEV_CUMULATIVE_FILTER, []],
                [QueryParams.GEO_VIEW_FILTER, []],
                [QueryParams.DEMO_VIEW_AGE_RANGE_FILTER, []],
              ],
            },
          },
          {
            path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_REPRO,
            component: DetailReproComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: DetailReproResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: EpidemiologicSimpleGdi.REPRO,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.REL_ABS_FILTER, []],
                [QueryParams.CUMULATIVE_FILTER, []],
                [QueryParams.DEMO_CUMULATIVE_FILTER, []],
                [QueryParams.DEV_CUMULATIVE_FILTER, []],
                [QueryParams.GEO_VIEW_FILTER, []],
                [QueryParams.DEMO_VIEW_AGE_RANGE_FILTER, []],
                [QueryParams.VARIANT_FILTER, []],
              ],
            },
          },
          { path: '**', redirectTo: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_CASE }, // default redirect to case
        ],
      },
      { path: '**', redirectTo: '' },
    ]),

    CommonsModule,
    HistogramMenuModule,
    SelectTitleModule,
    MasterDetailModule,

    DetailCaseModule,
    DetailHospModule,
    DetailDeathModule,
    DetailTestModule,
    DetailVirusVariantsModule,
    DetailReproModule,
  ],
  declarations: [EpidemiologicComponent],
})
export class EpidemiologicModule {}
