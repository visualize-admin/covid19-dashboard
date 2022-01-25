import { Routes } from '@angular/router'
import { LANGUAGE_FALLBACK } from '@c19/commons'
import { TranslationsResolverService } from '../core/i18n/translations-resolver.service'
import { RenameQueryParamsGuard } from '../core/rename-query-params.guard'
import { PathParams } from '../shared/models/path-params.enum'
import { RouteDataKey } from './route-data-key.enum'
import { RoutePaths } from './route-paths.enum'

export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [RenameQueryParamsGuard],
    resolve: {
      [RouteDataKey.TRANSLATIONS]: TranslationsResolverService,
    },
    children: [
      {
        path: RoutePaths.STYLEGUIDE,
        loadChildren: () => import('./styleguide/styleguide.module').then((m) => m.StyleguideModule),
      },

      // route for social-media exports
      {
        path: `:${PathParams.LANG}/${RoutePaths.SOCIAL_MEDIA_EXPORT}`,
        loadChildren: () =>
          import('./social-media-export/social-media-export.module').then((m) => m.SocialMediaExportModule),
      },

      // export route for special exports
      {
        path: `:${PathParams.LANG}/${RoutePaths.EXPORT}`,
        loadChildren: () => import('./export/export.module').then((m) => m.ExportModule),
      },

      // old vaccionation path redirects
      {
        path: `:lang/epidemiologic/vacc-doses`,
        redirectTo: `:lang/${RoutePaths.DASHBOARD_VACCINATION}/${RoutePaths.DASHBOARD_VACCINATION_DOSES}`,
      },
      {
        path: `:lang/epidemiologic/vacc-persons`,
        redirectTo: `:lang/${RoutePaths.DASHBOARD_VACCINATION}/${RoutePaths.DASHBOARD_VACCINATION_PERSONS}`,
      },
      {
        path: `:lang/epidemiologic/vacc-symptoms`,
        redirectTo: `:lang/${RoutePaths.DASHBOARD_VACCINATION}/${RoutePaths.DASHBOARD_VACCINATION_SYMPTOMS}`,
      },
      {
        path: `:lang/vaccination/breakthrough`,
        redirectTo: `:lang/${RoutePaths.DASHBOARD_VACCINATION}/${RoutePaths.DASHBOARD_VACCINATION_STATUS}`,
      },

      // old reproduction redirect
      {
        path: `:lang/reproduction/value`,
        redirectTo: `:lang/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC_REPRO}`,
      },

      // share urls ( order matters)
      {
        path: `:${PathParams.LANG}/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC_REPRO}/${RoutePaths.DETAIL}`,
        loadChildren: () => import('./share/share-repro/share-repro.module').then((m) => m.ShareReproModule),
      },
      {
        path: `:${PathParams.LANG}/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC_VIRUS_VARIANTS}/${RoutePaths.DETAIL}`,
        loadChildren: () =>
          import('./share/share-virus-variants/share-virus-variants.module').then((m) => m.ShareVirusVariantsModule),
      },
      {
        path: `:${PathParams.LANG}/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/:${PathParams.DETAIL_DATA_OBJECT_KEY}/${RoutePaths.DETAIL}`,
        loadChildren: () =>
          import('./share/share-epidemiologic/share-epidemiologic.module').then((m) => m.ShareEpidemiologicModule),
      },
      {
        path: `:${PathParams.LANG}/${RoutePaths.DASHBOARD_VACCINATION}/:${PathParams.DETAIL_DATA_OBJECT_KEY}/${RoutePaths.DETAIL}`,
        loadChildren: () =>
          import('./share/share-vaccination/share-vaccination.module').then((m) => m.ShareVaccinationModule),
      },
      {
        path: `:${PathParams.LANG}/${RoutePaths.DASHBOARD_CAPACITY}/:${PathParams.DETAIL_DATA_OBJECT_KEY}/${RoutePaths.DETAIL}`,
        loadChildren: () =>
          import('./share/share-hosp-capacity/share-hosp-capacity.module').then((m) => m.ShareHospCapacityModule),
      },
      {
        path: `:${PathParams.LANG}/${RoutePaths.DASHBOARD_INTERNATIONAL}/:${PathParams.DETAIL_DATA_OBJECT_KEY}/${RoutePaths.DETAIL}`,
        loadChildren: () =>
          import('./share/share-international/share-international.module').then((m) => m.ShareInternationalModule),
      },
      {
        path: `:${PathParams.LANG}/${RoutePaths.DASHBOARD_WEEKLY_REPORT}/:${PathParams.DETAIL_DATA_OBJECT_KEY}/${RoutePaths.DETAIL}`,
        loadChildren: () =>
          import('./share/share-weekly-report/share-weekly-report.module').then((m) => m.ShareWeeklyReportModule),
      },

      // main dashboard
      {
        path: `:${PathParams.LANG}`,
        loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },

      // root redirect
      {
        path: '',
        pathMatch: 'full',
        redirectTo: LANGUAGE_FALLBACK,
      },
    ],
  },
]
