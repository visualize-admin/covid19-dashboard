import { RoutePaths } from '../routes/route-paths.enum'

export interface NavLink {
  path: string
  labelKey: string
}

export interface NavLinkParent extends NavLink {
  children?: NavLink[]
}

export const navLinks: NavLinkParent[] = [
  { path: RoutePaths.DASHBOARD_OVERVIEW, labelKey: 'MainNav.Overview' },
  {
    path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC,
    labelKey: 'MainNav.Epidemiologic',
    children: [
      { labelKey: 'Epidemiologic.Menu.Case.Title', path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_CASE },
      { labelKey: 'Epidemiologic.Menu.Hosp.Title', path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_HOSP },
      { labelKey: 'Epidemiologic.Menu.Death.Title', path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_DEATH },
      { labelKey: 'Epidemiologic.Menu.Test.Title', path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_TEST },
      { labelKey: 'Epidemiologic.Menu.Reproduction.Title', path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_REPRO },
      { labelKey: 'Epidemiologic.Menu.VirusVariants.Title', path: RoutePaths.DASHBOARD_EPIDEMIOLOGIC_VIRUS_VARIANTS },
    ],
  },
  {
    path: RoutePaths.DASHBOARD_VACCINATION,
    labelKey: 'MainNav.Vaccination',
    children: [
      { labelKey: 'Vaccination.Menu.VaccPersons.Title', path: RoutePaths.DASHBOARD_VACCINATION_PERSONS },
      { labelKey: 'Vaccination.Menu.VaccDoses.Title', path: RoutePaths.DASHBOARD_VACCINATION_DOSES },
      { labelKey: 'Vaccination.Menu.VaccSymptoms.Title', path: RoutePaths.DASHBOARD_VACCINATION_SYMPTOMS },
      { labelKey: 'Vaccination.Menu.VaccStatus.Title', path: RoutePaths.DASHBOARD_VACCINATION_STATUS },
    ],
  },
  {
    path: RoutePaths.DASHBOARD_CAPACITY,
    labelKey: 'MainNav.Capacity',
    children: [
      { labelKey: 'HospCapacity.Menu.IntensiveCareUnits.Title', path: RoutePaths.DASHBOARD_CAPACITY_ICU },
      { labelKey: 'HospCapacity.Menu.TotalCapacity.Title', path: RoutePaths.DASHBOARD_CAPACITY_TOTAL },
    ],
  },
  {
    path: RoutePaths.DASHBOARD_INTERNATIONAL,
    labelKey: 'MainNav.International',
    children: [
      { labelKey: 'International.Menu.Quarantine.Title', path: RoutePaths.DASHBOARD_INTERNATIONAL_QUARANTINE },
      { labelKey: 'International.Menu.Case.Title', path: RoutePaths.DASHBOARD_INTERNATIONAL_CASE },
    ],
  },
  {
    path: RoutePaths.DASHBOARD_WEEKLY_REPORT,
    labelKey: 'MainNav.WeeklyReport',
    children: [
      { labelKey: 'WeeklyReport.Menu.Situation.Title', path: RoutePaths.DASHBOARD_WEEKLY_REPORT_SITUATION },
      { labelKey: 'WeeklyReport.Menu.Case.Title', path: RoutePaths.DASHBOARD_WEEKLY_REPORT_CASE },
      { labelKey: 'WeeklyReport.Menu.Hosp.Title', path: RoutePaths.DASHBOARD_WEEKLY_REPORT_HOSP },
      { labelKey: 'WeeklyReport.Menu.Death.Title', path: RoutePaths.DASHBOARD_WEEKLY_REPORT_DEATH },
      { labelKey: 'WeeklyReport.Menu.Test.Title', path: RoutePaths.DASHBOARD_WEEKLY_REPORT_TEST },
      {
        labelKey: 'WeeklyReport.Menu.HospCapacityIcu.Title',
        path: RoutePaths.DASHBOARD_WEEKLY_REPORT_HOSP_CAPACITY_ICU,
      },
      {
        labelKey: 'WeeklyReport.Menu.MethodsAndSources.Title',
        path: RoutePaths.DASHBOARD_WEEKLY_REPORT_METHODS_AND_SOURCES,
      },
    ],
  },
]
