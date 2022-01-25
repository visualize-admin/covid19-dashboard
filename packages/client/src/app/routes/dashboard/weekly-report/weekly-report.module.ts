import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { ChflGreaterRegionsGeoJsonResolver } from '../../../core/chfl-gr-geo-json.resolver'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { QueryParamsGuard, QueryParamsMapping } from '../../../core/query-params.guard'
import { WeeklyReportIsoWeekGuard } from '../../../core/weekly-report-iso-week.guard'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { MasterDetailModule } from '../../../shared/components/master-detail/master-detail.module'
import { PageNotificationModule } from '../../../shared/components/page-notification/page-notification.module'
import { SelectTitleModule } from '../../../shared/components/select-title/select-title.module'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { SimpleGdiObjectKey } from '../../../shared/models/simple-gdi-object-key.enum'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { WeeklyReportCaseComponent } from './weekly-report-case/weekly-report-case.component'
import { WeeklyReportCaseModule } from './weekly-report-case/weekly-report-case.module'
import { WeeklyReportChildResolver } from './weekly-report-child.resolver'
import { WeeklyReportDeathComponent } from './weekly-report-death/weekly-report-death.component'
import { WeeklyReportDeathModule } from './weekly-report-death/weekly-report-death.module'
import { WeeklyReportHospCapacityIcuComponent } from './weekly-report-hosp-capacity-icu/weekly-report-hosp-capacity-icu.component'
import { WeeklyReportHospCapacityIcuModule } from './weekly-report-hosp-capacity-icu/weekly-report-hosp-capacity-icu.module'
import { WeeklyReportHospCapacityIcuResolver } from './weekly-report-hosp-capacity-icu/weekly-report-hosp-capacity-icu.resolver'
import { WeeklyReportHospComponent } from './weekly-report-hosp/weekly-report-hosp.component'
import { WeeklyReportHospModule } from './weekly-report-hosp/weekly-report-hosp.module'
import { WeeklyReportMethodsAndSourcesComponent } from './weekly-report-methods-and-sources/weekly-report-methods-and-sources.component'
import { WeeklyReportMethodsAndSourcesModule } from './weekly-report-methods-and-sources/weekly-report-methods-and-sources.module'
import { WeeklyReportMethodsAndSourcesResolver } from './weekly-report-methods-and-sources/weekly-report-methods-and-sources.resolver'
import { WeeklyReportSituationComponent } from './weekly-report-situation/weekly-report-situation.component'
import { WeeklyReportSituationModule } from './weekly-report-situation/weekly-report-situation.module'
import { WeeklyReportSituationResolver } from './weekly-report-situation/weekly-report-situation.resolver'
import { WeeklyReportTestComponent } from './weekly-report-test/weekly-report-test.component'
import { WeeklyReportTestModule } from './weekly-report-test/weekly-report-test.module'
import { WeeklyReportWeekResolver } from './weekly-report-week-resolver.service'
import { WeeklyReportComponent } from './weekly-report.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: WeeklyReportComponent,
        resolve: {
          [RouteDataKey.SEO_META]: DefaultSeoMetaResolver,
          [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
          [RouteDataKey.GEO_JSON_2]: ChflGreaterRegionsGeoJsonResolver,
          [RouteDataKey.WEEKLY_REPORT_LIST]: WeeklyReportWeekResolver,
        },
        canActivate: [WeeklyReportIsoWeekGuard],
        children: [
          {
            path: RoutePaths.DASHBOARD_WEEKLY_REPORT_SITUATION,
            component: WeeklyReportSituationComponent,
            canActivate: [QueryParamsGuard],
            data: {
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.REGIONS_FILTER, []],
                [QueryParams.GEO_VIEW_FILTER, []],
                [QueryParams.DEMO_VIEW_FILTER, []],
                [QueryParams.TEST_POS_VIEW_FILTER, []],
              ],
            },
            resolve: {
              [RouteDataKey.DETAIL_DATA]: WeeklyReportSituationResolver,
            },
          },
          {
            path: RoutePaths.DASHBOARD_WEEKLY_REPORT_CASE,
            component: WeeklyReportCaseComponent,
            canActivate: [QueryParamsGuard],
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: SimpleGdiObjectKey.CASE,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.REL_ABS_FILTER, []],
                [QueryParams.TEST_POS_VIEW_FILTER, []],
              ],
            },
            resolve: {
              [RouteDataKey.DETAIL_DATA]: WeeklyReportChildResolver,
            },
          },
          {
            path: RoutePaths.DASHBOARD_WEEKLY_REPORT_HOSP,
            component: WeeklyReportHospComponent,
            canActivate: [QueryParamsGuard],
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: SimpleGdiObjectKey.HOSP,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.REL_ABS_FILTER, []],
                [QueryParams.TEST_POS_VIEW_FILTER, []],
              ],
            },
            resolve: {
              [RouteDataKey.DETAIL_DATA]: WeeklyReportChildResolver,
            },
          },
          {
            path: RoutePaths.DASHBOARD_WEEKLY_REPORT_DEATH,
            component: WeeklyReportDeathComponent,
            canActivate: [QueryParamsGuard],
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: SimpleGdiObjectKey.DEATH,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.REL_ABS_FILTER, []],
                [QueryParams.TEST_POS_VIEW_FILTER, []],
              ],
            },
            resolve: {
              [RouteDataKey.DETAIL_DATA]: WeeklyReportChildResolver,
            },
          },
          {
            path: RoutePaths.DASHBOARD_WEEKLY_REPORT_TEST,
            component: WeeklyReportTestComponent,
            canActivate: [QueryParamsGuard],
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: SimpleGdiObjectKey.TEST,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[[QueryParams.REL_ABS_FILTER, []]],
            },
            resolve: {
              [RouteDataKey.DETAIL_DATA]: WeeklyReportChildResolver,
            },
          },
          {
            path: RoutePaths.DASHBOARD_WEEKLY_REPORT_HOSP_CAPACITY_ICU,
            component: WeeklyReportHospCapacityIcuComponent,
            canActivate: [QueryParamsGuard],
            resolve: {
              [RouteDataKey.DETAIL_DATA]: WeeklyReportHospCapacityIcuResolver,
            },
          },
          {
            path: RoutePaths.DASHBOARD_WEEKLY_REPORT_METHODS_AND_SOURCES,
            component: WeeklyReportMethodsAndSourcesComponent,
            canActivate: [QueryParamsGuard],
            resolve: {
              [RouteDataKey.DETAIL_DATA]: WeeklyReportMethodsAndSourcesResolver,
            },
          },
          { path: '**', redirectTo: RoutePaths.DASHBOARD_WEEKLY_REPORT_SITUATION },
        ],
      },
    ]),
    CommonsModule,
    MasterDetailModule,
    SelectTitleModule,
    ReactiveFormsModule,
    SvgModule,
    WeeklyReportSituationModule,
    WeeklyReportCaseModule,
    WeeklyReportHospModule,
    WeeklyReportDeathModule,
    WeeklyReportTestModule,
    WeeklyReportHospCapacityIcuModule,
    WeeklyReportMethodsAndSourcesModule,
    PageNotificationModule,
  ],
  declarations: [WeeklyReportComponent],
})
export class WeeklyReportModule {}
