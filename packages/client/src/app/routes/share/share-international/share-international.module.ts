import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DataGuard } from '../../../core/data/data.guard'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { TranslationsResolverService } from '../../../core/i18n/translations-resolver.service'
import { WorldGeoJsonResolver } from '../../../core/world-geo-json.resolver'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { ShareComponent } from '../share.component'
import { ShareModule } from '../share.module'
import { ShareInternationalCaseDevelopmentComponent } from './share-international-case-development/share-international-case-development.component'
import { ShareInternationalCaseDevelopmentModule } from './share-international-case-development/share-international-case-development.module'
import { ShareInternationalCaseDevelopmentResolver } from './share-international-case-development/share-international-case-development.resolver'
import { ShareInternationalCaseGeographyComponent } from './share-international-case-geography/share-international-case-geography.component'
import { ShareInternationalCaseGeographyModule } from './share-international-case-geography/share-international-case-geography.module'
import { ShareInternationalCaseGeographyResolver } from './share-international-case-geography/share-international-case-geography.resolver'
import { ShareInternationalQuarantineGeographyComponent } from './share-international-quarantine-geography/share-international-quarantine-geography.component'
import { ShareInternationalQuarantineGeographyModule } from './share-international-quarantine-geography/share-international-quarantine-geography.module'
import { ShareInternationalQuarantineGeographyResolver } from './share-international-quarantine-geography/share-international-quarantine-geography.resolver'

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
            path: RoutePaths.SHARE_QUARANTINE_GEOGRAPHY,
            component: ShareInternationalQuarantineGeographyComponent,
            resolve: {
              [RouteDataKey.GEO_JSON]: WorldGeoJsonResolver,
              [RouteDataKey.DETAIL_DATA]: ShareInternationalQuarantineGeographyResolver,
            },
          },
          {
            path: RoutePaths.SHARE_GEOGRAPHY,
            component: ShareInternationalCaseGeographyComponent,
            resolve: {
              [RouteDataKey.GEO_JSON]: WorldGeoJsonResolver,
              [RouteDataKey.DETAIL_DATA]: ShareInternationalCaseGeographyResolver,
            },
          },
          {
            path: RoutePaths.SHARE_DEVELOPMENT,
            component: ShareInternationalCaseDevelopmentComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareInternationalCaseDevelopmentResolver,
            },
          },
          { path: '**', redirectTo: RoutePaths.SHARE_QUARANTINE_GEOGRAPHY },
        ],
      },
    ]),
    ShareInternationalQuarantineGeographyModule,
    ShareInternationalCaseGeographyModule,
    ShareInternationalCaseDevelopmentModule,
  ],
  providers: [
    ShareInternationalQuarantineGeographyResolver,
    ShareInternationalCaseGeographyResolver,
    ShareInternationalCaseDevelopmentResolver,
  ],
})
export class ShareInternationalModule {}
