import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DetailCardEpidemiologicDemographyModule } from '../../../cards-epidemiologic/detail-card-epidemiologic-demography/detail-card-epidemiologic-demography.module'
import { DetailCardEpidemiologicDevelopmentModule } from '../../../cards-epidemiologic/detail-card-epidemiologic-development/detail-card-epidemiologic-development.module'
import { DetailCardEpidemiologicGeoRegionsModule } from '../../../cards-epidemiologic/detail-card-epidemiologic-geo-regions/detail-card-epidemiologic-geo-regions.module'
import { DetailCardEpidemiologicGeographyModule } from '../../../cards-epidemiologic/detail-card-epidemiologic-geography/detail-card-epidemiologic-geography.module'
import { DetailCardEpidemiologicHospCauseModule } from '../../../cards-epidemiologic/detail-card-epidemiologic-hosp-cause/detail-card-epidemiologic-hosp-cause.module'
import { DetailCardEpidemiologicTestPositivityModule } from '../../../cards-epidemiologic/detail-card-epidemiologic-test-positivity/detail-card-epidemiologic-test-positivity.module'
import { DetailCardVirusVariantsOverviewModule } from '../../../cards-virus-variants/detail-card-virus-variants-overview/detail-card-virus-variants-overview.module'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { DataGuard } from '../../../core/data/data.guard'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { TranslationsResolverService } from '../../../core/i18n/translations-resolver.service'
import { RemoveQueryParamsGuard } from '../../../core/remove-query-params.guard'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { ShareComponent } from '../share.component'
import { ShareModule } from '../share.module'
import { ShareEpidemiologicDemographyComponent } from './share-epidemiologic-demography/share-epidemiologic-demography.component'
import { ShareEpidemiologicDemographyResolver } from './share-epidemiologic-demography/share-epidemiologic-demography.resolver'
import { ShareEpidemiologicDevelopmentComponent } from './share-epidemiologic-development/share-epidemiologic-development.component'
import { ShareEpidemiologicDevelopmentResolver } from './share-epidemiologic-development/share-epidemiologic-development.resolver'
import { ShareEpidemiologicGeoRegionsDataResolver } from './share-epidemiologic-geo-regions/share-epidemiologic-geo-regions-data.resolver'
import { ShareEpidemiologicGeoRegionsGeojsonResolver } from './share-epidemiologic-geo-regions/share-epidemiologic-geo-regions-geojson.resolver'
import { ShareEpidemiologicGeoRegionsComponent } from './share-epidemiologic-geo-regions/share-epidemiologic-geo-regions.component'
import { ShareEpidemiologicGeographyComponent } from './share-epidemiologic-geography/share-epidemiologic-geography.component'
import { ShareEpidemiologicGeographyResolver } from './share-epidemiologic-geography/share-epidemiologic-geography.resolver'
import { ShareEpidemiologicHospCauseComponent } from './share-epidemiologic-hosp-cause/share-epidemiologic-hosp-cause.component'
import { ShareEpidemiologicHospCauseResolver } from './share-epidemiologic-hosp-cause/share-epidemiologic-hosp-cause.resolver'
import { ShareEpidemiologicTestPositivityComponent } from './share-epidemiologic-test-positivity/share-epidemiologic-test-positivity.component'

@NgModule({
  imports: [
    CommonModule,
    ShareModule,

    RouterModule.forChild([
      {
        path: '',
        component: ShareComponent,
        canActivate: [DataGuard],
        resolve: {
          [RouteDataKey.TRANSLATIONS]: TranslationsResolverService,
          [RouteDataKey.SEO_META]: DefaultSeoMetaResolver,
        },
        children: [
          {
            path: RoutePaths.SHARE_GEOGRAPHY,
            component: ShareEpidemiologicGeographyComponent,
            resolve: {
              [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
              [RouteDataKey.DETAIL_DATA]: ShareEpidemiologicGeographyResolver,
            },
          },
          {
            path: RoutePaths.SHARE_DEMOGRAPHY,
            component: ShareEpidemiologicDemographyComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareEpidemiologicDemographyResolver,
            },
          },
          {
            path: RoutePaths.SHARE_DEVELOPMENT,
            component: ShareEpidemiologicDevelopmentComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareEpidemiologicDevelopmentResolver,
            },
          },

          {
            path: RoutePaths.SHARE_TEST_POSITIVITY,
            component: ShareEpidemiologicTestPositivityComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareEpidemiologicDevelopmentResolver,
            },
          },

          {
            path: RoutePaths.SHARE_HOSP_CAUSE,
            component: ShareEpidemiologicHospCauseComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareEpidemiologicHospCauseResolver,
            },
          },

          {
            path: RoutePaths.SHARE_GEO_REGIONS,
            component: ShareEpidemiologicGeoRegionsComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareEpidemiologicGeoRegionsDataResolver,
              [RouteDataKey.GEO_JSON]: ShareEpidemiologicGeoRegionsGeojsonResolver,
            },
            data: {
              [RouteDataKey.QUERY_PARAMS_TO_REMOVE]: [QueryParams.GEO_DATE],
            },
            canDeactivate: [RemoveQueryParamsGuard],
            runGuardsAndResolvers: 'paramsChange',
          },
          { path: '**', redirectTo: RoutePaths.SHARE_GEOGRAPHY },
        ],
      },
    ]),

    CommonsModule,

    DetailCardEpidemiologicGeographyModule,
    DetailCardVirusVariantsOverviewModule,
    DetailCardEpidemiologicDevelopmentModule,
    DetailCardEpidemiologicTestPositivityModule,
    DetailCardEpidemiologicDemographyModule,
    DetailCardEpidemiologicGeoRegionsModule,
    DetailCardEpidemiologicHospCauseModule,
  ],
  declarations: [
    ShareEpidemiologicGeographyComponent,
    ShareEpidemiologicDevelopmentComponent,
    ShareEpidemiologicTestPositivityComponent,
    ShareEpidemiologicDemographyComponent,
    ShareEpidemiologicGeoRegionsComponent,
    ShareEpidemiologicHospCauseComponent,
  ],
  providers: [
    ShareEpidemiologicGeographyResolver,
    ShareEpidemiologicDevelopmentResolver,
    ShareEpidemiologicDemographyResolver,
    ShareEpidemiologicGeoRegionsDataResolver,
    ShareEpidemiologicGeoRegionsGeojsonResolver,
    ShareEpidemiologicHospCauseResolver,
  ],
})
export class ShareEpidemiologicModule {}
