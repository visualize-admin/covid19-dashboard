import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CantonGeoUnit,
  DEFAULT_GEO_UNIT,
  EpidemiologicVaccPersonsDailyGeoValues,
  GdiObject,
  GdiSubset,
  isDefined,
  Language,
  TopLevelGeoUnit,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { addDays, differenceInDays } from 'date-fns'
import { Observable, Subject } from 'rxjs'
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators'
import { DataService, VaccinationMenuData } from '../../../core/data/data.service'
import { CURRENT_LANG } from '../../../core/i18n/language.token'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { DistributionBarEntries } from '../../../diagrams/distribution-bar/distribution-bar.component'
import { HistogramMenuLineEntry } from '../../../diagrams/histogram/histogram-menu/histogram-menu-line.component'
import {
  COLOR_LINE_PRIMARY,
  COLOR_VACC_PERSONS,
  COLOR_VACC_PERSONS_NOT_VACCINATED,
} from '../../../shared/commons/colors.const'
import { MasterDetailMenuItem } from '../../../shared/components/master-detail/master-detail-menu-item.type'
import { SearchFilterOptionGroup } from '../../../shared/components/search-filter/search-filter-options.type'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { parseIsoDate } from '../../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { RoutePaths } from '../../route-paths.enum'

interface VaccinationMenuItem extends MasterDetailMenuItem {
  textLines?: Array<{ key: string; args: Record<string, string> }>
  noData?: boolean
  histoLineData?: HistogramMenuLineEntry[] | null
  color?: string
  metaKey?: string
  noDataKey?: string
  distributionData?: DistributionBarEntries
  distributionLabel?: string
}

interface CurrentData {
  data: VaccinationMenuData
  geoFilter: CantonGeoUnit | TopLevelGeoUnit
}

@Component({
  selector: 'bag-vaccination',
  templateUrl: './vaccination.component.html',
  styleUrls: ['./vaccination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaccinationComponent implements OnInit, OnDestroy {
  readonly geoFilterGroups: SearchFilterOptionGroup[] = [
    {
      label: this.translator.get('Commons.Country'),
      options: getEnumValues(TopLevelGeoUnit)
        // handle default with null
        .map((value) => ({
          value: value === TopLevelGeoUnit.CHFL ? null : value,
          label: this.translator.get(`GeoFilter.${value}`),
        })),
    },
    {
      label: this.translator.get('Commons.Canton'),
      // sort alphabetically
      options: getEnumValues(CantonGeoUnit)
        .filter((v) => v !== CantonGeoUnit.FL)
        .map((value) => ({ value, label: this.translator.get(`GeoFilter.${value}`) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    },
  ]

  readonly geoFilterCtrl: FormControl
  readonly detailMenuItems$: Observable<VaccinationMenuItem[]>

  readonly geoFilter$: Observable<CantonGeoUnit | TopLevelGeoUnit> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
  )

  private readonly onDestroy = new Subject<void>()

  constructor(
    @Inject(CURRENT_LANG) readonly lang: Language,
    private readonly dataService: DataService,
    private readonly router: Router,
    private readonly translator: TranslatorService,
    private readonly route: ActivatedRoute,
  ) {
    this.geoFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_FILTER] || null)

    this.detailMenuItems$ = this.geoFilter$.pipe(
      switchMap((geoFilter) => {
        return this.dataService.loadVaccinationMenuData(geoFilter).then((data) => <CurrentData>{ data, geoFilter })
      }),
      map(this.prepareDetailMenuItems),
      shareReplay(1),
    )
  }

  ngOnInit() {
    this.geoFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.GEO_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))

    // geoFilter might be changed from other controls, so we need to update this controls view
    this.geoFilter$
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => (v === DEFAULT_GEO_UNIT ? null : v)),
      )
      .subscribe(emitValToOwnViewFn(this.geoFilterCtrl))
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  private prepareDetailMenuItems = ({ data, geoFilter }: CurrentData): VaccinationMenuItem[] => {
    const basePathArgs = ['/', this.lang, RoutePaths.DASHBOARD_VACCINATION]
    const timeSpanStart = parseIsoDate(data[GdiObject.VACC_DOSES].timeSpan.start)
    const dayDiff = differenceInDays(parseIsoDate(data[GdiObject.VACC_DOSES].values[0].date), timeSpanStart)
    const vaccDosesStartPadEntries: HistogramMenuLineEntry[] =
      dayDiff < 1 ? [] : new Array(dayDiff).fill(0).map((_, ix) => ({ date: addDays(timeSpanStart, ix), value: null }))
    const vaccDosesHistoLineData: HistogramMenuLineEntry[] = data[GdiObject.VACC_DOSES].values.map((e) => ({
      date: parseIsoDate(e.date),
      value: e[GdiSubset.VACC_DOSES_ADMIN].inzTotal,
    }))

    const vaccPersonsData: EpidemiologicVaccPersonsDailyGeoValues =
      geoFilter === TopLevelGeoUnit.CHFL
        ? data[GdiObject.VACC_PERSONS].dailyData.chFlData
        : geoFilter === TopLevelGeoUnit.CH
        ? data[GdiObject.VACC_PERSONS].dailyData.chData
        : data[GdiObject.VACC_PERSONS].dailyData.cantonData[geoFilter]
    const vaccPersonsMinOneDoesPrct = vaccPersonsData[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inzTotal
    const vaccPersonsDistribution: DistributionBarEntries = [
      { ratio: vaccPersonsMinOneDoesPrct, colorCode: COLOR_VACC_PERSONS },
      { ratio: 100 - (vaccPersonsMinOneDoesPrct || 0), colorCode: COLOR_VACC_PERSONS_NOT_VACCINATED },
    ]

    const vaccSymptomsHistoLineData = data[GdiObject.VACC_SYMPTOMS].values.length
      ? data[GdiObject.VACC_SYMPTOMS].values.map(
          (e): HistogramMenuLineEntry => ({
            date: parseIsoDate(e.date),
            value: e[GdiSubset.VACC_SYMPTOMS_SERIOUS].all.total,
          }),
        )
      : null

    // const vaccBreakthroughHistoLineData: HistogramMenuLineEntry[] = data[GdiObject.VACC_BREAKTHROUGH].values[
    //   VaccineBreakthroughIndicator.CASE
    // ].map(
    //   (record): HistogramMenuLineEntry => ({
    //     date: parseIsoDate(record.date),
    //     value: record.breakthroughs.sumVaccInfo,
    //   }),
    // )

    const createTitle = (titleKey: string) => {
      const title = this.translator.get(titleKey)
      return geoFilter === DEFAULT_GEO_UNIT ? title : `${title}, ${geoFilter}`
    }

    return [
      {
        style: 'vaccine',
        title: createTitle('Vaccination.Menu.VaccPersons.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_VACCINATION_PERSONS],
        noData: !isDefined(vaccPersonsMinOneDoesPrct),
        distributionData: vaccPersonsDistribution,
        distributionLabel: this.translator.get('Vaccination.Menu.VaccPersons.MinOne.Value', {
          value: adminFormatNum(vaccPersonsMinOneDoesPrct, 2),
        }),
      },
      {
        style: 'vaccine',
        title: createTitle('Vaccination.Menu.VaccDoses.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_VACCINATION_DOSES],
        noData: false,
        histoLineData: [...vaccDosesStartPadEntries, ...vaccDosesHistoLineData],
        color: COLOR_VACC_PERSONS,
        metaKey: 'Vaccination.VaccDoses.Card.Vaccine.Legend.Rel',
      },
      {
        style: 'vaccine',
        title: createTitle('Vaccination.Menu.VaccSymptoms.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_VACCINATION_SYMPTOMS],
        noData: !vaccSymptomsHistoLineData,
        noDataKey: 'Vaccination.Menu.VaccSymptoms.NoData',
        histoLineData: vaccSymptomsHistoLineData,
        color: COLOR_VACC_PERSONS,
        metaKey: 'Vaccination.Menu.VaccSymptoms.Serious.Meta',
      },
      {
        title: createTitle('Vaccination.Menu.VaccStatus.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_VACCINATION_STATUS],
        histoLineData: null,
        facet: 'slim',
        color: COLOR_LINE_PRIMARY,
      },
    ]
  }
}
