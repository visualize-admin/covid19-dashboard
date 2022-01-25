import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CantonGeoUnit, TopLevelGeoUnit, VaccinationSimpleGdi } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { QueryParamsGuard, QueryParamsMapping } from '../../../core/query-params.guard'
import { DistributionBarModule } from '../../../diagrams/distribution-bar/distribution-bar.module'
import { HistogramMenuModule } from '../../../diagrams/histogram/histogram-menu/histogram-menu.module'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { MasterDetailModule } from '../../../shared/components/master-detail/master-detail.module'
import { SelectTitleModule } from '../../../shared/components/select-title/select-title.module'
import { IndicatorFilter } from '../../../shared/models/filters/indicator-filter.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { VaccinationChildResolver } from './vaccination-child.resolver'
import { VaccinationDosesComponent } from './vaccination-doses/vaccination-doses.component'
import { VaccinationDosesModule } from './vaccination-doses/vaccination-doses.module'
import { VaccinationParentResolver } from './vaccination-parent.resolver'
import { VaccinationPersonsComponent } from './vaccination-persons/vaccination-persons.component'
import { VaccinationPersonsModule } from './vaccination-persons/vaccination-persons.module'
import { VaccinationStatusComponent } from './vaccination-status/vaccination-status.component'
import { VaccinationStatusModule } from './vaccination-status/vaccination-status.module'
import { VaccinationSymptomsComponent } from './vaccination-symptoms/vaccination-symptoms.component'
import { VaccinationSymptomsModule } from './vaccination-symptoms/vaccination-symptoms.module'
import { VaccinationComponent } from './vaccination.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: VaccinationComponent,
        canActivate: [QueryParamsGuard],
        data: {
          [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
            [QueryParams.GEO_FILTER, [...getEnumValues(TopLevelGeoUnit), ...getEnumValues(CantonGeoUnit)]],
          ],
        },
        resolve: {
          [RouteDataKey.SEO_META]: DefaultSeoMetaResolver,
          // we're not actually relying on it directly within the component
          // but we want it to be loaded so the component request will be found in the service cache
          [RouteDataKey.DETAIL_DATA]: VaccinationParentResolver,
          [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
        },
        children: [
          {
            path: RoutePaths.DASHBOARD_VACCINATION_PERSONS,
            component: VaccinationPersonsComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: VaccinationChildResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: VaccinationSimpleGdi.VACC_PERSONS,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.VACC_REL_FILTER, []],
                [QueryParams.LOCATION_VIEW_LOCATION_FILTER, []],
                [QueryParams.VARIANT_FILTER, []],
                [QueryParams.VACC_SYMPTOMS_VACCINE_FILTER, []],
                [QueryParams.VACC_SYMPTOMS_DEMO_AGE_RANGE_FILTER, []],
                [QueryParams.VACC_DOSES_CUMULATIVE_TYPE_FILTER, []],
                [QueryParams.INDICATOR, []],
                [QueryParams.VACC_STATUS_DEV_REL_FILTER, []],
                [QueryParams.VACC_STATUS_DEMO_AGE_RANGE, []],
                [QueryParams.VACC_STATUS_VACCINE, []],
                [QueryParams.VACC_STATUS_DEMO_REL_FILTER, []],
                [QueryParams.VACC_STATUS_VACCINE_DEV_CUMULATIVE_FILTER, []],
                [QueryParams.DEV_CUMULATIVE_FILTER, []],
              ],
            },
          },
          {
            path: RoutePaths.DASHBOARD_VACCINATION_DOSES,
            component: VaccinationDosesComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: VaccinationChildResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: VaccinationSimpleGdi.VACC_DOSES,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.GRP_RANGE, []],
                [QueryParams.VACC_PERSONS_REL_FILTER, []],
                [QueryParams.DEMO_AGE_FILTER, []],
                [QueryParams.DEMO_SEX_FILTER, []],
                [QueryParams.VARIANT_FILTER, []],
                [QueryParams.VACC_SYMPTOMS_VACCINE_FILTER, []],
                [QueryParams.VACC_SYMPTOMS_DEMO_AGE_RANGE_FILTER, []],
                [QueryParams.INDICATOR, []],
                [QueryParams.VACC_STATUS_DEV_REL_FILTER, []],
                [QueryParams.VACC_STATUS_DEMO_AGE_RANGE, []],
                [QueryParams.VACC_STATUS_VACCINE, []],
                [QueryParams.VACC_STATUS_DEMO_REL_FILTER, []],
                [QueryParams.VACC_STATUS_VACCINE_DEV_CUMULATIVE_FILTER, []],
                [QueryParams.VACC_PERSONS_DEV_CUMULATIVE_FILTER, []],
                [QueryParams.AGE_GROUP_CLASSIFICATION_FILTER, []],
              ],
            },
          },
          {
            path: RoutePaths.DASHBOARD_VACCINATION_SYMPTOMS,
            component: VaccinationSymptomsComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: VaccinationChildResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: VaccinationSimpleGdi.VACC_SYMPTOMS,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.DEMO_CUMULATIVE_FILTER, []],
                [QueryParams.DEV_CUMULATIVE_FILTER, []],
                [QueryParams.GEO_VIEW_FILTER, []],
                [QueryParams.VACC_REL_FILTER, []],
                [QueryParams.DEMO_VIEW_AGE_RANGE_FILTER, []],
                [QueryParams.VACC_PERSONS_REL_FILTER, []],
                [QueryParams.VACCINE_VIEW_VACCINE_FILTER, []],
                [QueryParams.LOCATION_VIEW_LOCATION_FILTER, []],
                [QueryParams.INDICATION_VIEW_INDICATION_FILTER, []],
                [QueryParams.GRP_RATIO_CUMULATIVE_FILTER, []],
                [QueryParams.DEMO_AGE_FILTER, []],
                [QueryParams.DEMO_SEX_FILTER, []],
                [QueryParams.VARIANT_FILTER, []],
                [QueryParams.VACC_DOSES_CUMULATIVE_TYPE_FILTER, []],
                [QueryParams.INDICATOR, []],
                [QueryParams.VACC_STATUS_DEV_REL_FILTER, []],
                [QueryParams.DEVELOPMENT_VIEW_FILTER, []],
                [QueryParams.DEVELOPMENT_VIEW_TOTAL_FILTER, []],
                [QueryParams.VACC_STATUS_DEMO_AGE_RANGE, []],
                [QueryParams.VACC_STATUS_VACCINE, []],
                [QueryParams.VACC_STATUS_DEMO_REL_FILTER, []],
                [QueryParams.VACC_STATUS_VACCINE_DEV_CUMULATIVE_FILTER, []],
                [QueryParams.VACC_PERSONS_DEV_CUMULATIVE_FILTER, []],
                [QueryParams.AGE_GROUP_CLASSIFICATION_FILTER, []],
              ],
            },
          },
          {
            path: RoutePaths.DASHBOARD_VACCINATION_STATUS,
            component: VaccinationStatusComponent,
            canActivate: [QueryParamsGuard],
            resolve: { [RouteDataKey.DETAIL_DATA]: VaccinationChildResolver },
            data: {
              [RouteDataKey.SIMPLE_GDI_OBJECT]: VaccinationSimpleGdi.VACC_STATUS,
              [RouteDataKey.QUERY_PARAMS_MAPPING]: <QueryParamsMapping>[
                [QueryParams.INDICATOR, getEnumValues(IndicatorFilter)],
                [QueryParams.DEMO_CUMULATIVE_FILTER, []],
                [QueryParams.GEO_VIEW_FILTER, []],
                [QueryParams.VACC_REL_FILTER, []],
                [QueryParams.DEMO_VIEW_AGE_RANGE_FILTER, []],
                [QueryParams.VACC_PERSONS_REL_FILTER, []],
                [QueryParams.VACCINE_VIEW_VACCINE_FILTER, []],
                [QueryParams.VACC_SYMPTOMS_VACCINE_FILTER, []],
                [QueryParams.LOCATION_VIEW_LOCATION_FILTER, []],
                [QueryParams.INDICATION_VIEW_INDICATION_FILTER, []],
                [QueryParams.GRP_RATIO_CUMULATIVE_FILTER, []],
                [QueryParams.DEMO_AGE_FILTER, []],
                [QueryParams.DEMO_SEX_FILTER, []],
                [QueryParams.VARIANT_FILTER, []],
                [QueryParams.VACC_DOSES_CUMULATIVE_TYPE_FILTER, []],
                [QueryParams.VACC_PERSONS_DEV_CUMULATIVE_FILTER, []],
                [QueryParams.AGE_GROUP_CLASSIFICATION_FILTER, []],
              ],
            },
          },
          { path: '**', redirectTo: RoutePaths.DASHBOARD_VACCINATION_PERSONS }, // default redirect to doses
        ],
      },
      { path: '**', redirectTo: '' },
    ]),
    CommonsModule,
    VaccinationDosesModule,
    VaccinationPersonsModule,
    VaccinationSymptomsModule,
    VaccinationStatusModule,
    SelectTitleModule,
    ReactiveFormsModule,
    MasterDetailModule,
    HistogramMenuModule,
    DistributionBarModule,
  ],
  declarations: [VaccinationComponent],
})
export class VaccinationModule {}
