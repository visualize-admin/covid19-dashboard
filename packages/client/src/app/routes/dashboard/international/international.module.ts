import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { Iso2Country, NutsLevel1 } from '@c19/commons'
import { SvgModule } from '@shiftcode/ngx-components'
import { getEnumValues } from '@shiftcode/utilities'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { QueryParamsGuard } from '../../../core/query-params.guard'
import { WorldGeoJsonResolver } from '../../../core/world-geo-json.resolver'
import { HistogramMenuModule } from '../../../diagrams/histogram/histogram-menu/histogram-menu.module'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { SelectTitleModule } from '../../../shared/components/select-title/select-title.module'
import { MasterDetailModule } from '../../../shared/components/master-detail/master-detail.module'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { TimeSlotFilter } from '../../../shared/models/filters/time-slot-filter.enum'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { DetailInternationalCaseComponent } from './detail-international-case/detail-international-case.component'
import { DetailInternationalCaseModule } from './detail-international-case/detail-international-case.module'
import { DetailInternationalQuarantineComponent } from './detail-international-quarantine/detail-international-quarantine.component'
import { DetailInternationalQuarantineModule } from './detail-international-quarantine/detail-international-quarantine.module'
import { InternationalResolver } from './international-resolver.service'
import { InternationalComponent } from './international.component'

@NgModule({
  declarations: [InternationalComponent],
  imports: [
    CommonModule,
    CommonsModule,
    RouterModule.forChild([
      {
        path: '',
        component: InternationalComponent,
        canActivate: [QueryParamsGuard],
        data: {
          [RouteDataKey.QUERY_PARAMS_MAPPING]: [
            [QueryParams.GEO_FILTER, [...getEnumValues(Iso2Country), NutsLevel1.XK]],
          ],
        },
        resolve: {
          [RouteDataKey.SEO_META]: DefaultSeoMetaResolver,
          [RouteDataKey.GEO_JSON]: WorldGeoJsonResolver,
          [RouteDataKey.DETAIL_DATA]: InternationalResolver,
        },
        children: [
          {
            path: RoutePaths.DASHBOARD_INTERNATIONAL_QUARANTINE,
            component: DetailInternationalQuarantineComponent,
            canActivate: [QueryParamsGuard],
            data: {
              [RouteDataKey.QUERY_PARAMS_MAPPING]: [[QueryParams.TIME_FILTER, []]],
            },
          },
          {
            path: RoutePaths.DASHBOARD_INTERNATIONAL_CASE,
            component: DetailInternationalCaseComponent,
            canActivate: [QueryParamsGuard],
            data: {
              [RouteDataKey.QUERY_PARAMS_MAPPING]: [[QueryParams.TIME_FILTER, getEnumValues(TimeSlotFilter)]],
            },
          },
          { path: '**', redirectTo: RoutePaths.DASHBOARD_INTERNATIONAL_QUARANTINE },
        ],
      },
    ]),
    SelectTitleModule,
    MasterDetailModule,
    ReactiveFormsModule,
    SvgModule,
    DetailInternationalQuarantineModule,
    DetailInternationalCaseModule,
    HistogramMenuModule,
  ],
})
export class InternationalModule {}
