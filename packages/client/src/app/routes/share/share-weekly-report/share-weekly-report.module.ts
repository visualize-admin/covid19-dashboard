import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { WeeklyReportCardDemographyModule } from '../../../cards-weekly-report/weekly-report-card-demography/weekly-report-card-demography.module'
import { WeeklyReportCardDevelopmentModule } from '../../../cards-weekly-report/weekly-report-card-development/weekly-report-card-development.module'
import { WeeklyReportCardEpiSummaryModule } from '../../../cards-weekly-report/weekly-report-card-epi-summary/weekly-report-card-epi-summary.module'
import { WeeklyReportCardGeographyModule } from '../../../cards-weekly-report/weekly-report-card-geography/weekly-report-card-geography.module'
import { WeeklyReportCardHospCapacityIcuModule } from '../../../cards-weekly-report/weekly-report-card-hosp-capacity-icu/weekly-report-card-hosp-capacity-icu.module'
import { WeeklyReportCardOverviewModule } from '../../../cards-weekly-report/weekly-report-card-overview/weekly-report-card-overview.module'
import { WeeklyReportCardSummaryModule } from '../../../cards-weekly-report/weekly-report-card-summary/weekly-report-card-summary.module'
import { WeeklyReportCardTestPositivityModule } from '../../../cards-weekly-report/weekly-report-card-test-positivity/weekly-report-card-test-positivity.module'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { ChflGreaterRegionsGeoJsonResolver } from '../../../core/chfl-gr-geo-json.resolver'
import { DataGuard } from '../../../core/data/data.guard'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { TranslationsResolverService } from '../../../core/i18n/translations-resolver.service'
import { WeeklyReportIsoWeekGuard } from '../../../core/weekly-report-iso-week.guard'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { ShareComponent } from '../share.component'
import { ShareModule } from '../share.module'
import { ShareWeeklyReportDemographyComponent } from './share-weekly-report-demography/share-weekly-report-demography.component'
import { ShareWeeklyReportDemographyResolver } from './share-weekly-report-demography/share-weekly-report-demography.resolver'
import { ShareWeeklyReportDevelopmentComponent } from './share-weekly-report-development/share-weekly-report-development.component'
import { ShareWeeklyReportDevelopmentResolver } from './share-weekly-report-development/share-weekly-report-development.resolver'
import { ShareWeeklyReportEpiSummaryComponent } from './share-weekly-report-epi-summary/share-weekly-report-epi-summary.component'
import { ShareWeeklyReportEpiSummaryResolver } from './share-weekly-report-epi-summary/share-weekly-report-epi-summary.resolver'
import { ShareWeeklyReportGeographyComponent } from './share-weekly-report-geography/share-weekly-report-geography.component'
import { ShareWeeklyReportGeographyResolver } from './share-weekly-report-geography/share-weekly-report-geography.resolver'
import { ShareWeeklyReportHospCapacityIcuSummaryComponent } from './share-weekly-report-hosp-capacity-icu-summary/share-weekly-report-hosp-capacity-icu-summary.component'
import { ShareWeeklyReportHospCapacityIcuSummaryResolver } from './share-weekly-report-hosp-capacity-icu-summary/share-weekly-report-hosp-capacity-icu-summary.resolver'
import { ShareWeeklyReportHospCapacityIcuComponent } from './share-weekly-report-hosp-capacity-icu/share-weekly-report-hosp-capacity-icu.component'
import { ShareWeeklyReportHospCapacityIcuResolver } from './share-weekly-report-hosp-capacity-icu/share-weekly-report-hosp-capacity-icu.resolver'
import { ShareWeeklyReportOverviewComponent } from './share-weekly-report-overview/share-weekly-report-overview.component'
import { ShareWeeklyReportOverviewResolver } from './share-weekly-report-overview/share-weekly-report-overview.resolver'
import { ShareWeeklyReportSimpleGdiResolver } from './share-weekly-report-simple-gdi.resolver'
import { ShareWeeklyReportSummaryComponent } from './share-weekly-report-summary/share-weekly-report-summary.component'
import { ShareWeeklyReportSummaryResolver } from './share-weekly-report-summary/share-weekly-report-summary.resolver'
import { ShareWeeklyReportTestPositivityComponent } from './share-weekly-report-test-positivity/share-weekly-report-test-positivity.component'
import { ShareWeeklyReportTestPositivityResolver } from './share-weekly-report-test-positivity/share-weekly-report-test-positivity.resolver'

@NgModule({
  imports: [
    CommonModule,

    ShareModule,
    CommonsModule,

    RouterModule.forChild([
      {
        path: '',
        component: ShareComponent,
        canActivate: [DataGuard, WeeklyReportIsoWeekGuard],
        resolve: {
          [RouteDataKey.TRANSLATIONS]: TranslationsResolverService,
          [RouteDataKey.SEO_META]: DefaultSeoMetaResolver,
        },
        children: [
          {
            path: RoutePaths.SHARE_SUMMARY,
            component: ShareWeeklyReportSummaryComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareWeeklyReportSummaryResolver,
            },
          },

          {
            path: RoutePaths.SHARE_OVERVIEW,
            component: ShareWeeklyReportOverviewComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareWeeklyReportOverviewResolver,
            },
          },

          {
            path: RoutePaths.SHARE_GEOGRAPHY,
            component: ShareWeeklyReportGeographyComponent,
            resolve: {
              [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
              [RouteDataKey.GEO_JSON_2]: ChflGreaterRegionsGeoJsonResolver,
              [RouteDataKey.DETAIL_DATA]: ShareWeeklyReportGeographyResolver,
              [RouteDataKey.SIMPLE_GDI_OBJECT]: ShareWeeklyReportSimpleGdiResolver,
            },
          },

          {
            path: RoutePaths.SHARE_DEMOGRAPHY,
            component: ShareWeeklyReportDemographyComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareWeeklyReportDemographyResolver,
              [RouteDataKey.SIMPLE_GDI_OBJECT]: ShareWeeklyReportSimpleGdiResolver,
            },
          },

          {
            path: RoutePaths.SHARE_TEST_POSITIVITY,
            component: ShareWeeklyReportTestPositivityComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareWeeklyReportTestPositivityResolver,
              [RouteDataKey.SIMPLE_GDI_OBJECT]: ShareWeeklyReportSimpleGdiResolver,
            },
          },

          {
            path: RoutePaths.SHARE_EPI_SUMMARY,
            component: ShareWeeklyReportEpiSummaryComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareWeeklyReportEpiSummaryResolver,
              [RouteDataKey.SIMPLE_GDI_OBJECT]: ShareWeeklyReportSimpleGdiResolver,
            },
          },
          {
            path: RoutePaths.SHARE_DEVELOPMENT,
            component: ShareWeeklyReportDevelopmentComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareWeeklyReportDevelopmentResolver,
              [RouteDataKey.SIMPLE_GDI_OBJECT]: ShareWeeklyReportSimpleGdiResolver,
            },
          },
          {
            path: RoutePaths.SHARE_HOSP_CAPACITY_ICU_SUMMARY,
            component: ShareWeeklyReportHospCapacityIcuSummaryComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareWeeklyReportHospCapacityIcuSummaryResolver,
            },
          },
          {
            path: RoutePaths.SHARE_HOSP_CAPACITY_ICU,
            component: ShareWeeklyReportHospCapacityIcuComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareWeeklyReportHospCapacityIcuResolver,
            },
          },

          { path: '**', redirectTo: RoutePaths.SHARE_SUMMARY },
        ],
      },
    ]),

    WeeklyReportCardSummaryModule,
    WeeklyReportCardOverviewModule,
    WeeklyReportCardGeographyModule,
    WeeklyReportCardDemographyModule,
    WeeklyReportCardTestPositivityModule,
    WeeklyReportCardEpiSummaryModule,
    WeeklyReportCardDevelopmentModule,
    WeeklyReportCardHospCapacityIcuModule,
  ],
  declarations: [
    ShareWeeklyReportSummaryComponent,
    ShareWeeklyReportOverviewComponent,
    ShareWeeklyReportGeographyComponent,
    ShareWeeklyReportDemographyComponent,
    ShareWeeklyReportTestPositivityComponent,
    ShareWeeklyReportEpiSummaryComponent,
    ShareWeeklyReportDevelopmentComponent,
    ShareWeeklyReportHospCapacityIcuSummaryComponent,
    ShareWeeklyReportHospCapacityIcuComponent,
  ],
  providers: [
    ShareWeeklyReportSummaryResolver,
    ShareWeeklyReportOverviewResolver,
    ShareWeeklyReportGeographyResolver,
    ShareWeeklyReportDemographyResolver,
    ShareWeeklyReportTestPositivityResolver,
    ShareWeeklyReportEpiSummaryResolver,
    ShareWeeklyReportSimpleGdiResolver,
    ShareWeeklyReportDevelopmentResolver,
    ShareWeeklyReportHospCapacityIcuSummaryResolver,
    ShareWeeklyReportHospCapacityIcuResolver,
  ],
})
export class ShareWeeklyReportModule {}
