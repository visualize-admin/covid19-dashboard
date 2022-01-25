import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CantonGeoUnit } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { QueryParamsGuard, QueryParamsMapping } from '../../../core/query-params.guard'
import { DistributionBarModule } from '../../../diagrams/distribution-bar/distribution-bar.module'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { SelectTitleModule } from '../../../shared/components/select-title/select-title.module'
import { MasterDetailModule } from '../../../shared/components/master-detail/master-detail.module'
import { NativeSelectModule } from '../../../shared/components/native-select/native-select.module'
import { HospOccupancyFilter } from '../../../shared/models/filters/hosp-occupancy-filter.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RelAbsFilter } from '../../../shared/models/filters/rel-abs-filter.enum'
import { TimeSlotFilter } from '../../../shared/models/filters/time-slot-filter.enum'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { CapacityComponent } from './capacity.component'
import { DetailIntensiveComponent } from './detail-intensive/detail-intensive.component'
import { DetailIntensiveModule } from './detail-intensive/detail-intensive.module'
import { DetailTotalComponent } from './detail-total/detail-total.component'
import { DetailTotalModule } from './detail-total/detail-total.module'
import { HospCapacityDevelopmentResolver } from './hosp-capacity-development.resolver'
import { HospCapacityGeographyResolver } from './hosp-capacity-geography-resolver.service'

@NgModule({
  declarations: [CapacityComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CapacityComponent,
        canActivate: [QueryParamsGuard],
        resolve: {
          [RouteDataKey.SEO_META]: DefaultSeoMetaResolver,
          // we're not actually relying on it directly within the component
          // but we want it to be loaded so the component request will be found in the service cache
          [RouteDataKey.DETAIL_DATA]: HospCapacityGeographyResolver,
          [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
        },
        data: {
          [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
            [QueryParams.GEO_FILTER, getEnumValues(CantonGeoUnit).filter((k) => k !== CantonGeoUnit.FL)],
            [QueryParams.TIME_FILTER, getEnumValues(TimeSlotFilter)],
            [QueryParams.OCCUPANCY_FILTER, getEnumValues(HospOccupancyFilter)],
            [QueryParams.REL_ABS_FILTER, getEnumValues(RelAbsFilter)],
            [QueryParams.SHOW_I18N_KEYS, ['true', 'false']],
          ],
        },
        children: [
          {
            path: RoutePaths.DASHBOARD_CAPACITY_ICU,
            component: DetailIntensiveComponent,
            resolve: { [RouteDataKey.DETAIL_DATA]: HospCapacityDevelopmentResolver },
          },
          {
            path: RoutePaths.DASHBOARD_CAPACITY_TOTAL,
            component: DetailTotalComponent,
            resolve: { [RouteDataKey.DETAIL_DATA]: HospCapacityDevelopmentResolver },
          },
          { path: '**', redirectTo: RoutePaths.DASHBOARD_CAPACITY_ICU },
        ],
      },
      { path: '**', redirectTo: '' },
    ]),
    ReactiveFormsModule,

    CommonsModule,
    DetailIntensiveModule,
    DetailTotalModule,
    NativeSelectModule,
    DistributionBarModule,
    SelectTitleModule,
    MasterDetailModule,
  ],
  providers: [HospCapacityGeographyResolver, HospCapacityDevelopmentResolver],
})
export class CapacityModule {}
