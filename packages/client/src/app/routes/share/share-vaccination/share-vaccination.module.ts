import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DetailCardVaccDosesDemographyModule } from '../../../cards-vaccination/detail-card-vacc-doses-demography/detail-card-vacc-doses-demography.module'
import { DetailCardVaccDosesDevelopmentModule } from '../../../cards-vaccination/detail-card-vacc-doses-development/detail-card-vacc-doses-development.module'
import { DetailCardVaccDosesGeographyModule } from '../../../cards-vaccination/detail-card-vacc-doses-geography/detail-card-vacc-doses-geography.module'
import { DetailCardVaccDosesIndicationModule } from '../../../cards-vaccination/detail-card-vacc-doses-indication/detail-card-vacc-doses-indication.module'
import { DetailCardVaccDosesLocationModule } from '../../../cards-vaccination/detail-card-vacc-doses-location/detail-card-vacc-doses-location.module'
import { DetailCardVaccDosesVaccineModule } from '../../../cards-vaccination/detail-card-vacc-doses-vaccine/detail-card-vacc-doses-vaccine.module'
import { DetailCardVaccPersonsDemographyModule } from '../../../cards-vaccination/detail-card-vacc-persons-demography/detail-card-vacc-persons-demography.module'
import { DetailCardVaccPersonsDevelopmentModule } from '../../../cards-vaccination/detail-card-vacc-persons-development/detail-card-vacc-persons-development.module'
import { DetailCardVaccPersonsGeographyModule } from '../../../cards-vaccination/detail-card-vacc-persons-geography/detail-card-vacc-persons-geography.module'
import { DetailCardVaccPersonsIndicationModule } from '../../../cards-vaccination/detail-card-vacc-persons-indication/detail-card-vacc-persons-indication.module'
import { DetailCardVaccPersonsVaccineModule } from '../../../cards-vaccination/detail-card-vacc-persons-vaccine/detail-card-vacc-persons-vaccine.module'
import { DetailCardVaccSymptomsDemographyModule } from '../../../cards-vaccination/detail-card-vacc-symptoms-demography/detail-card-vacc-symptoms-demography.module'
import { DetailCardVaccSymptomsDevelopmentModule } from '../../../cards-vaccination/detail-card-vacc-symptoms-development/detail-card-vacc-symptoms-development.module'
import { DetailCardVaccinationGroupRatioModule } from '../../../cards-vaccination/detail-card-vaccination-group-ratio/detail-card-vaccination-group-ratio.module'
import { DetailCardVaccStatusDemographyModule } from '../../../cards-vaccination/vaccination-status/detail-card-vacc-status-demography/detail-card-vacc-status-demography.module'
import { DetailCardVaccStatusDevelopmentModule } from '../../../cards-vaccination/vaccination-status/detail-card-vacc-status-development/detail-card-vacc-status-development.module'
import { DetailCardVaccStatusVaccineModule } from '../../../cards-vaccination/vaccination-status/detail-card-vacc-status-vaccine/detail-card-vacc-status-vaccine.module'
import { ChflGeoJsonResolver } from '../../../core/chfl-geo-json.resolver'
import { DataGuard } from '../../../core/data/data.guard'
import { DefaultSeoMetaResolver } from '../../../core/default-seo-meta-resolver.service'
import { TranslationsResolverService } from '../../../core/i18n/translations-resolver.service'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { ShareComponent } from '../share.component'
import { ShareModule } from '../share.module'
import { ShareVaccinationDemographyComponent } from './share-vaccination-demography/share-vaccination-demography.component'
import { ShareVaccinationDemographyResolver } from './share-vaccination-demography/share-vaccination-demography.resolver'
import { ShareVaccinationDevelopmentComponent } from './share-vaccination-development/share-vaccination-development.component'
import { ShareVaccinationDevelopmentResolver } from './share-vaccination-development/share-vaccination-development.resolver'
import { ShareVaccinationGeographyComponent } from './share-vaccination-geography/share-vaccination-geography.component'
import { ShareVaccinationGeographyResolver } from './share-vaccination-geography/share-vaccination-geography.resolver'
import { ShareVaccinationGroupRatioComponent } from './share-vaccination-group-ratio/share-vaccination-group-ratio.component'
import { ShareVaccinationIndicationComponent } from './share-vaccination-indication/share-vaccination-indication.component'
import { ShareVaccinationIndicationResolver } from './share-vaccination-indication/share-vaccination-indication.resolver'
import { ShareVaccinationLocationComponent } from './share-vaccination-location/share-vaccination-location.component'
import { ShareVaccinationLocationResolver } from './share-vaccination-location/share-vaccination-location.resolver'
import { ShareVaccinationVaccineComponent } from './share-vaccination-vaccine/share-vaccination-vaccine.component'
import { ShareVaccinationVaccineResolver } from './share-vaccination-vaccine/share-vaccination-vaccine.resolver'

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
            component: ShareVaccinationGeographyComponent,
            resolve: {
              [RouteDataKey.GEO_JSON]: ChflGeoJsonResolver,
              [RouteDataKey.DETAIL_DATA]: ShareVaccinationGeographyResolver,
            },
          },
          {
            path: RoutePaths.SHARE_DEMOGRAPHY,
            component: ShareVaccinationDemographyComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareVaccinationDemographyResolver,
            },
          },
          {
            path: RoutePaths.SHARE_DEVELOPMENT,
            component: ShareVaccinationDevelopmentComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareVaccinationDevelopmentResolver,
            },
          },
          {
            path: RoutePaths.SHARE_VACC_LOCATION,
            component: ShareVaccinationLocationComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareVaccinationLocationResolver,
            },
          },
          {
            path: RoutePaths.SHARE_VACC_INDICATION,
            component: ShareVaccinationIndicationComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareVaccinationIndicationResolver,
            },
          },
          {
            path: RoutePaths.SHARE_VACC_GRP_RATIO,
            component: ShareVaccinationGroupRatioComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareVaccinationIndicationResolver,
            },
          },
          {
            path: RoutePaths.SHARE_VACC_VACCINE,
            component: ShareVaccinationVaccineComponent,
            resolve: {
              [RouteDataKey.DETAIL_DATA]: ShareVaccinationVaccineResolver,
            },
          },
        ],
      },
    ]),
    CommonsModule,

    DetailCardVaccDosesDemographyModule,
    DetailCardVaccDosesLocationModule,
    DetailCardVaccDosesIndicationModule,
    DetailCardVaccinationGroupRatioModule,
    DetailCardVaccDosesVaccineModule,
    DetailCardVaccPersonsGeographyModule,
    DetailCardVaccPersonsDevelopmentModule,
    DetailCardVaccPersonsVaccineModule,
    DetailCardVaccPersonsDemographyModule,
    DetailCardVaccPersonsIndicationModule,
    DetailCardVaccSymptomsDevelopmentModule,
    DetailCardVaccSymptomsDemographyModule,
    DetailCardVaccDosesDevelopmentModule,
    DetailCardVaccDosesGeographyModule,
    DetailCardVaccStatusDevelopmentModule,
    DetailCardVaccStatusDemographyModule,
    DetailCardVaccStatusVaccineModule,
  ],
  declarations: [
    ShareVaccinationDemographyComponent,
    ShareVaccinationDevelopmentComponent,
    ShareVaccinationGeographyComponent,
    ShareVaccinationGroupRatioComponent,
    ShareVaccinationIndicationComponent,
    ShareVaccinationLocationComponent,
    ShareVaccinationVaccineComponent,
  ],
  providers: [
    ShareVaccinationGeographyResolver,
    ShareVaccinationDevelopmentResolver,
    ShareVaccinationDemographyResolver,
    ShareVaccinationLocationResolver,
    ShareVaccinationIndicationResolver,
    ShareVaccinationVaccineResolver,
  ],
})
export class ShareVaccinationModule {}
