import { isPlatformBrowser } from '@angular/common'
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { InternationalComparisonDetailData, IntGeoUnit, Iso2Country, Language, NutsLevel1 } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { Subject } from 'rxjs'
import { map, switchMap, takeUntil } from 'rxjs/operators'
import { DataService } from '../../../core/data/data.service'
import { CURRENT_LANG } from '../../../core/i18n/language.token'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { HistogramMenuLineEntry } from '../../../diagrams/histogram/histogram-menu/histogram-menu-line.component'
import { MasterDetailMenuItem } from '../../../shared/components/master-detail/master-detail-menu-item.type'
import { SearchFilterOptionGroup } from '../../../shared/components/search-filter/search-filter-options.type'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { parseIsoDate } from '../../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { ParsedQuarantineEntry, parseQuarantineEntries, QuarantineState } from '../../../static-utils/quarantine-utils'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'
import { InternationalCombinedData } from './international-combined-data.type'

interface InternationalMenuItem extends MasterDetailMenuItem {
  type: 'quarantine' | 'case'
}

interface InternationalQuarantineMenuItem extends InternationalMenuItem {
  type: 'quarantine'
  hasQuarantineRegions: boolean
  info: string
}

interface InternationalCaseMenuItem extends InternationalMenuItem {
  type: 'case'
  histoData: HistogramMenuLineEntry[] | null
}

@Component({
  selector: 'bag-international',
  templateUrl: './international.component.html',
  styleUrls: ['./international.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternationalComponent implements OnInit, OnDestroy {
  readonly geoFilterGroups: SearchFilterOptionGroup[] = [
    {
      label: this.translator.get('Commons.Country'),
      options: [
        {
          value: null,
          label: this.translator.get('Commons.World'),
        },
        ...[...getEnumValues(Iso2Country), NutsLevel1.XK]
          .map((value) => ({
            value,
            label: this.translator.get(`CountryRegionFilter.${value}`),
          }))
          // remove Switzerland from list
          .filter((country) => country.value !== Iso2Country.CH)
          // sort alphabetically
          .sort((a, b) => a.label.localeCompare(b.label)),
      ],
    },
  ]
  readonly geoFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_FILTER] || null)

  readonly menuItems$ = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER),
    switchMap((geoFilter: IntGeoUnit | null) => {
      return this.dataService
        .loadInternationalDevelopmentData(geoFilter)
        .then((data) => this.prepareMenu(data, geoFilter || 'WORLD'))
    }),
  )
  readonly isBrowser: boolean

  private readonly quarantineData: ParsedQuarantineEntry[]
  private readonly onDestroy = new Subject<void>()

  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    @Inject(CURRENT_LANG) readonly lang: Language,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translator: TranslatorService,
    private readonly dataService: DataService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId)
    const originalData: InternationalCombinedData = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
    this.quarantineData = Object.values(parseQuarantineEntries(originalData.quarantine.data))
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.onDestroy), selectChanged(QueryParams.GEO_FILTER))
      .subscribe(emitValToOwnViewFn(this.geoFilterCtrl))

    this.geoFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.GEO_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  private prepareMenu(
    data: InternationalComparisonDetailData | null,
    geoUnit: IntGeoUnit,
  ): [InternationalQuarantineMenuItem, InternationalCaseMenuItem] {
    const basePath = ['/', this.lang, RoutePaths.DASHBOARD_INTERNATIONAL]
    return [this.createQuarantineMenuItem(basePath, geoUnit), this.createCaseMenuItem(basePath, data, geoUnit)]
  }

  private createCaseMenuItem(
    basePath: string[],
    data: InternationalComparisonDetailData | null,
    geoUnit: IntGeoUnit,
  ): InternationalCaseMenuItem {
    const title = this.translator.get('International.Menu.Case.Title')
    return {
      type: 'case',
      title: geoUnit === 'WORLD' ? title : `${title}, ${geoUnit}`,
      pathArgs: [...basePath, RoutePaths.DASHBOARD_INTERNATIONAL_CASE],
      histoData: data
        ? data.values.map((v) => ({
            date: parseIsoDate(v.date),
            value: v.inzRollsum14d,
          }))
        : null,
    }
  }

  private createQuarantineMenuItem(basePath: string[], geoUnit: IntGeoUnit): InternationalQuarantineMenuItem {
    const items =
      geoUnit === 'WORLD' ? this.quarantineData : this.quarantineData.filter(({ unit }) => unit.startsWith(geoUnit))
    const withQuarantine = items.filter(({ state }) => state !== QuarantineState.NONE && state !== QuarantineState.PAST)

    const onlyRegions = !withQuarantine.some(({ unit }) => unit.length === 2)
    const onlyCountries = !withQuarantine.some(({ unit }) => unit.length > 2)

    const infoKey =
      withQuarantine.length === 0
        ? 'International.Menu.Quarantine.NoQuarantine'
        : withQuarantine.length === 1
        ? 'International.Menu.Quarantine.HasQuarantine'
        : onlyRegions
        ? 'International.Menu.Quarantine.QuarantineRegions'
        : onlyCountries
        ? 'International.Menu.Quarantine.QuarantineCountries'
        : 'International.Menu.Quarantine.QuarantineCountriesOrRegions'
    const title = this.translator.get('International.Menu.Quarantine.Title')
    return {
      type: 'quarantine',
      title: geoUnit === 'WORLD' ? title : `${title}, ${geoUnit}`,
      pathArgs: [...basePath, RoutePaths.DASHBOARD_INTERNATIONAL_QUARANTINE],
      info: this.translator.get(infoKey, { count: withQuarantine.length }),
      hasQuarantineRegions: withQuarantine.length > 0,
    }
  }
}
