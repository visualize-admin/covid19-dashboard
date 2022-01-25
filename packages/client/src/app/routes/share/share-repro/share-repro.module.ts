import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DetailCardReproDevelopmentModule } from '../../../cards-repro/detail-card-repro-development/detail-card-repro-development.module'
import { DetailCardReproGeographyModule } from '../../../cards-repro/detail-card-repro-geography/detail-card-repro-geography.module'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { DataGuard } from '../../../core/data/data.guard'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { TranslationsResolverService } from '../../../core/i18n/translations-resolver.service'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { ShareComponent } from '../share.component'
import { ShareModule } from '../share.module'
import { ShareReproDevelopmentComponent } from './share-repro-development/share-repro-development.component'
import { ShareReproDevelopmentResolver } from './share-repro-development/share-repro-development.resolver'
import { ShareReproGeographyComponent } from './share-repro-geography/share-repro-geography.component'
import { ShareReproGeographyResolver } from './share-repro-geography/share-repro-geography.resolver'

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
            component: ShareReproGeographyComponent,
            resolve: {
              [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
              [RouteDataKey.DETAIL_DATA]: ShareReproGeographyResolver,
            },
          },
          {
            path: RoutePaths.SHARE_DEVELOPMENT,
            component: ShareReproDevelopmentComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareReproDevelopmentResolver,
            },
          },
          { path: '**', redirectTo: RoutePaths.SHARE_GEOGRAPHY },
        ],
      },
    ]),

    DetailCardReproGeographyModule,
    DetailCardReproDevelopmentModule,
  ],
  declarations: [ShareReproGeographyComponent, ShareReproDevelopmentComponent],
  providers: [ShareReproGeographyResolver, ShareReproDevelopmentResolver],
})
export class ShareReproModule {}
