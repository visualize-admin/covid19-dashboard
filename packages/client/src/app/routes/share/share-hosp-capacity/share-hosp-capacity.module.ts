import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DetailCardCapacityCertifiedBedsModule } from '../../../cards-hosp-capacity/detail-card-hosp-capacity-certified-beds/detail-card-capacity-certified-beds.module'
import { DetailCardCapacityDevelopmentModule } from '../../../cards-hosp-capacity/detail-card-hosp-capacity-development/detail-card-capacity-development.module'
import { DetailCardCapacityGeographyModule } from '../../../cards-hosp-capacity/detail-card-hosp-capacity-geography/detail-card-capacity-geography.module'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { DataGuard } from '../../../core/data/data.guard'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { TranslationsResolverService } from '../../../core/i18n/translations-resolver.service'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { ShareComponent } from '../share.component'
import { ShareModule } from '../share.module'
import { ShareHospCapacityCertifiedBedsComponent } from './share-hosp-capacity-certified-beds/share-hosp-capacity-certified-beds.component'
import { ShareHospCapacityCertifiedBedsResolver } from './share-hosp-capacity-certified-beds/share-hosp-capacity-certified-beds.resolver'
import { ShareHospCapacityDevelopmentComponent } from './share-hosp-capacity-development/share-hosp-capacity-development.component'
import { ShareHospCapacityDevelopmentResolver } from './share-hosp-capacity-development/share-hosp-capacity-development.resolver'
import { ShareHospCapacityGeographyComponent } from './share-hosp-capacity-geography/share-hosp-capacity-geography.component'
import { ShareHospCapacityGeographyResolver } from './share-hosp-capacity-geography/share-hosp-capacity-geography.resolver'

@NgModule({
  imports: [
    CommonModule,
    ShareModule,
    CommonsModule,
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
            component: ShareHospCapacityGeographyComponent,
            resolve: {
              [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
              [RouteDataKey.DETAIL_DATA]: ShareHospCapacityGeographyResolver,
            },
          },
          {
            path: RoutePaths.SHARE_DEVELOPMENT,
            component: ShareHospCapacityDevelopmentComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareHospCapacityDevelopmentResolver,
            },
          },
          {
            path: RoutePaths.SHARE_CERTIFIED_BEDS,
            component: ShareHospCapacityCertifiedBedsComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareHospCapacityCertifiedBedsResolver,
            },
          },
          { path: '**', redirectTo: RoutePaths.SHARE_GEOGRAPHY },
        ],
      },
    ]),

    DetailCardCapacityGeographyModule,
    DetailCardCapacityDevelopmentModule,
    DetailCardCapacityCertifiedBedsModule,
  ],
  declarations: [
    ShareHospCapacityGeographyComponent,
    ShareHospCapacityDevelopmentComponent,
    ShareHospCapacityCertifiedBedsComponent,
  ],
  providers: [
    ShareHospCapacityDevelopmentResolver,
    ShareHospCapacityGeographyResolver,
    ShareHospCapacityCertifiedBedsResolver,
  ],
})
export class ShareHospCapacityModule {}
