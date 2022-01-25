import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DetailCardVirusVariantsOverviewModule } from '../../../cards-virus-variants/detail-card-virus-variants-overview/detail-card-virus-variants-overview.module'
import { DetailCardVirusVariantsSegmentationModule } from '../../../cards-virus-variants/detail-card-virus-variants-segmentation/detail-card-virus-variants-segmentation.module'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { DataGuard } from '../../../core/data/data.guard'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { TranslationsResolverService } from '../../../core/i18n/translations-resolver.service'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { ShareComponent } from '../share.component'
import { ShareModule } from '../share.module'
import { ShareVirusVariantsOverviewComponent } from './share-virus-variants-overview/share-virus-variants-overview.component'
import { ShareVirusVariantsOverviewResolver } from './share-virus-variants-overview/share-virus-variants.overview.resolver'
import { ShareVirusVariantsSegmentationComponent } from './share-virus-variants-segmentation/share-virus-variants-segmentation.component'
import { ShareVirusVariantsSegmentationResolver } from './share-virus-variants-segmentation/share-virus-variants-segmentation.resolver'

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
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
            path: RoutePaths.SHARE_OVERVIEW,
            component: ShareVirusVariantsOverviewComponent,
            resolve: {
              [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
              [RouteDataKey.DETAIL_DATA]: ShareVirusVariantsOverviewResolver,
            },
          },
          {
            path: RoutePaths.SHARE_SEGMENTATION,
            component: ShareVirusVariantsSegmentationComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareVirusVariantsSegmentationResolver,
            },
          },
          { path: '**', redirectTo: RoutePaths.SHARE_GEOGRAPHY },
        ],
      },
    ]),
    DetailCardVirusVariantsOverviewModule,
    DetailCardVirusVariantsSegmentationModule,
  ],
  declarations: [ShareVirusVariantsSegmentationComponent, ShareVirusVariantsOverviewComponent],
  providers: [ShareVirusVariantsOverviewResolver, ShareVirusVariantsSegmentationResolver],
})
export class ShareVirusVariantsModule {}
