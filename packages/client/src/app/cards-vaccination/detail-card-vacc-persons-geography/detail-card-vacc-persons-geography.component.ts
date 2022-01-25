import { DOCUMENT } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import {
  AgeRangeByVaccinationStrategy,
  CantonGeoUnit,
  CantonGeoUnitNumber,
  EpidemiologicVaccGeoUnitData,
  EpidemiologicVaccPersonsGeoBaseDailyData,
  EpidemiologicVaccPersonsGeoBaseData,
  EpidemiologicVaccPersonsGeoData,
  EpidemiologicVaccPersonsGeoValues,
  GdiSubset,
  isDefined,
  TopLevelGeoUnit,
  VaccinationGdiObject,
} from '@c19/commons'
import { filterIfInstanceOf, WindowRef } from '@shiftcode/ngx-core'
import { getEnumValues } from '@shiftcode/utilities'
import { scaleQuantize } from 'd3'
import { combineLatest, merge, Observable } from 'rxjs'
import { first, map, shareReplay, takeUntil, tap } from 'rxjs/operators'
import { DataService } from '../../core/data/data.service'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import {
  ChoroplethEventData,
  ChoroplethGeoFeatureCollection,
  ExtendedGeoFeatureCollection,
} from '../../diagrams/choropleth/base-choropleth.component'
import { FillFn } from '../../diagrams/choropleth/choropleth.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_CHOROPLETH_STROKE,
  COLOR_CHOROPLETH_STROKE_DARKER,
  COLOR_VACC_PERSONS_BOOSTER_TABLE,
  COLOR_VACC_PERSONS_FULL_TABLE,
  COLORS_VACC_PERS_GEO,
} from '../../shared/commons/colors.const'
import { Source } from '../../shared/components/detail-card/detail-card.component'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import {
  DEFAULT_GEO_VIEW_FILTER,
  GeoViewFilter,
  getGeoViewFilterOptions,
} from '../../shared/models/filters/geo-view-filter.enum'
import {
  DEFAULT_VACC_PERSONS_GEO_AGE_FILTER,
  getVaccPersonsGeoAgeFilterOptions,
  vaccPersonsGeoAgeFilter,
  VaccPersonsGeoAgeFilter,
} from '../../shared/models/filters/vacc-persons-geo-age-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { scrollIntoView } from '../../static-utils/scroll-into-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import {
  BaseDetailCardVaccinationComponent,
  CurrentValuesVaccinationBase,
} from '../base-detail-card-vaccination.component'
import { AdditionalInfoBoxItem } from './geo-unit-vacc-persons-data/geo-unit-vacc-persons-data.component'

interface CurrentValues extends CurrentValuesVaccinationBase {
  geoView: GeoViewFilter
  ageFilter: VaccPersonsGeoAgeFilter
  data: EpidemiologicVaccPersonsGeoBaseDailyData | EpidemiologicVaccPersonsGeoBaseData
}

interface GeoMapData {
  min: number
  max: number
  fillFn: FillFn
  selectedGeoUnit: CantonGeoUnit | TopLevelGeoUnit
  strokeColor: string
  selectedGeoUnitData: EpidemiologicVaccPersonsGeoValues
  selectedGeoUnitTitle: string
  selectedGeoUnitSubTitle: string
  additionalInfoBoxData: AdditionalInfoBoxItem[]
  featureCollection: ChoroplethGeoFeatureCollection<EpidemiologicVaccPersonsGeoValues>
  hasNullValues: boolean
  data: EpidemiologicVaccPersonsGeoBaseDailyData | EpidemiologicVaccPersonsGeoBaseData
}

interface GeoTableRowSetValues {
  rel: number | null
  abs: number | null
  barVal: number
}

interface GeoTableData {
  rows: GeoTableRow[]
  additionalInfoBoxData: AdditionalInfoBoxItem[]
}

interface GeoTableRow {
  key: string
  name: string
  isSelected: boolean
  queryParams: Record<string, string>
  set1: GeoTableRowSetValues
  set2: GeoTableRowSetValues
  set3: GeoTableRowSetValues
}

interface GeoTooltipCtx {
  title: string
  subTitle: string
  gdiObject: VaccinationGdiObject
  data: EpidemiologicVaccPersonsGeoValues
}

@Component({
  selector: 'bag-detail-card-vacc-persons-geography',
  templateUrl: './detail-card-vacc-persons-geography.component.html',
  styleUrls: ['./detail-card-vacc-persons-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccPersonsGeographyComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccPersonsGeoData>
  implements OnInit
{
  @Input()
  geoJson: ExtendedGeoFeatureCollection

  @ViewChild('tooltipElRef', { read: TemplateRef })
  tooltipElRef: TemplateRef<GeoTooltipCtx>

  readonly cardDetailPath = RoutePaths.SHARE_GEOGRAPHY
  readonly scaleColors = COLORS_VACC_PERS_GEO

  readonly tableColors = {
    [GdiSubset.VACC_PERSONS_FULL]: COLOR_VACC_PERSONS_FULL_TABLE,
    [GdiSubset.VACC_PERSONS_FIRST_BOOSTER]: COLOR_VACC_PERSONS_BOOSTER_TABLE,
  }

  readonly geoViewFilterOptions = getGeoViewFilterOptions(DEFAULT_GEO_VIEW_FILTER)
  readonly geoViewFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_VIEW_FILTER] || null)
  readonly geoViewFilter$: Observable<GeoViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_VIEW_FILTER, DEFAULT_GEO_VIEW_FILTER),
    tap<GeoViewFilter>(emitValToOwnViewFn(this.geoViewFilterCtrl, DEFAULT_GEO_VIEW_FILTER)),
  )
  readonly vaccPersonsAgeFilterOptions = getVaccPersonsGeoAgeFilterOptions(DEFAULT_VACC_PERSONS_GEO_AGE_FILTER)
  readonly vaccPersonsAgeFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_AGE_FILTER])
  readonly vaccPersonsAgeFilter$: Observable<VaccPersonsGeoAgeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_AGE_FILTER, DEFAULT_VACC_PERSONS_GEO_AGE_FILTER),
    tap<VaccPersonsGeoAgeFilter>(
      emitValToOwnViewFn(this.vaccPersonsAgeFilterCtrl, DEFAULT_VACC_PERSONS_GEO_AGE_FILTER),
    ),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.selectedGeoUnit$,
    this.geoViewFilter$,
    this.vaccPersonsAgeFilter$,
  ]).pipe(
    map(([geoUnit, geoView, ageFilter]) => {
      const data = this.ageFilterCorrespondingData(ageFilter)
      const timeSpan = data.timeSpan
      return { geoUnit, geoView, ageFilter, data, timeSpan, descriptionSingleDate: true }
    }),
    shareReplay(1),
  )

  readonly geoMapData$: Observable<GeoMapData | null> = this.currentValues$.pipe(map(this.prepareGeoMapData.bind(this)))
  readonly geoTableData$: Observable<GeoTableData | null> = this.currentValues$.pipe(
    map(this.prepareGeoTableData.bind(this)),
  )

  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  // if exists, returns dataState dependant warn key, otherwise return null
  readonly warningKey$: Observable<string | null> = this.dataService.sourceDate$.pipe(
    map((sourceDate) => `Vaccination.VaccPersons.Card.Geography.Warning.${formatUtcDate(sourceDate, 'yyyyMMdd')}`),
    map((specialWarnKey) => (this.translator.tryGet(specialWarnKey) ? specialWarnKey : null)),
  )

  get sources(): Source[] {
    return [
      {
        sourceKey: 'Commons.Source.BAG',
        descKey: 'Vaccination.Card.VaccPersons',
        date: new Date(this.data.sourceDate),
      },
    ]
  }

  constructor(
    route: ActivatedRoute,
    router: Router,
    translator: TranslatorService,
    uriService: UriService,
    tooltipService: TooltipService,
    protected readonly dataService: DataService,
    private readonly windowRef: WindowRef,
    @Inject(DOCUMENT) private readonly doc: Document,
  ) {
    super(route, router, translator, uriService, tooltipService)
  }

  override ngOnInit() {
    merge(
      this.geoViewFilterCtrl.valueChanges.pipe(map((value) => ({ [QueryParams.GEO_VIEW_FILTER]: value }))),
      this.vaccPersonsAgeFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.GEO_AGE_FILTER]: v }))),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  showTooltip(
    { source, unit }: ChoroplethEventData<EpidemiologicVaccPersonsGeoValues>,
    data: EpidemiologicVaccPersonsGeoBaseDailyData | EpidemiologicVaccPersonsGeoBaseData,
    subTitle: string,
  ) {
    const geoUnit = <CantonGeoUnit>unit
    const ctx: GeoTooltipCtx = {
      gdiObject: this.data.gdiObject,
      title: this.translator.get(`GeoFilter.${unit}`),
      subTitle,
      data: data.cantonData[geoUnit],
    }
    this.tooltipService.showTpl(source, this.tooltipElRef, ctx, { position: 'above', offsetY: 10 })
  }

  scrollToDevelopmentCard(isAlreadySelected: boolean) {
    if (isAlreadySelected) {
      // scroll instantly
      this._scrollToDevCard()
    } else {
      // await route navigation then scroll
      this.router.events.pipe(filterIfInstanceOf(NavigationEnd), first()).subscribe(this._scrollToDevCard.bind(this))
    }
  }

  readonly identifyRowItem = (index: number, item: GeoTableRow) => item.key

  protected init() {}

  private _scrollToDevCard() {
    const scrollToEl: HTMLElement | null = this.doc.querySelector(`#${DOM_ID.VACC_DEVELOPMENT_CARD}`)
    const stickyHeaderEl: HTMLElement | null = this.doc.querySelector(`#${DOM_ID.STICKY_HEADER}`)
    if (scrollToEl && this.windowRef.nativeWindow) {
      scrollIntoView(this.windowRef.nativeWindow, scrollToEl, stickyHeaderEl?.offsetHeight)
    }
  }

  private prepareGeoMapData(cv: CurrentValues): GeoMapData | null {
    if (cv.geoView !== GeoViewFilter.MAP) {
      return null
    }
    const gdiSubKey: keyof EpidemiologicVaccPersonsGeoValues = GdiSubset.VACC_PERSONS_MIN_ONE_DOSE

    const values: (number | null)[] = [
      ...Object.values(this.data.dailyData.cantonData).map((e) => e[gdiSubKey].inzTotal),
      ...Object.values(this.data.weeklyData[AgeRangeByVaccinationStrategy.A_12_15].cantonData).map(
        (e) => e[gdiSubKey].inzTotal,
      ),
      ...Object.values(this.data.weeklyData[AgeRangeByVaccinationStrategy.A_16_64].cantonData).map(
        (e) => e[gdiSubKey].inzTotal,
      ),
      ...Object.values(this.data.weeklyData[AgeRangeByVaccinationStrategy.A_65_PLUS].cantonData).map(
        (e) => e[gdiSubKey].inzTotal,
      ),
    ]
    const nonNullValues = values.filter(isDefined)

    const [min, max] = [0, 100]

    const colorScale = scaleQuantize<string>().domain([min, max]).range(this.scaleColors)

    const fillFn: FillFn<EpidemiologicVaccPersonsGeoValues> = (feature, instance) => {
      const val = feature.properties[gdiSubKey].inzTotal
      return (isDefined(val) && colorScale(val)) || instance.noDataFill
    }
    const selectedGeoUnitData =
      cv.geoUnit === TopLevelGeoUnit.CHFL
        ? cv.data.chFlData
        : cv.geoUnit === TopLevelGeoUnit.CH
        ? cv.data.chData
        : cv.data.cantonData[cv.geoUnit]
    const geoUnitName = this.translator.get(`GeoFilter.${cv.geoUnit}`)

    const endDate = formatUtcDate(parseIsoDate(cv.timeSpan.end))

    // darker stroke for max value < 50
    const currNonNullValues: number[] = Object.values(cv.data.cantonData)
      .map((e) => e[gdiSubKey].inzTotal)
      .filter(isDefined)
    const currMax = Math.max(...currNonNullValues) || 0
    const strokeColor: string = currMax < 50 ? COLOR_CHOROPLETH_STROKE_DARKER : COLOR_CHOROPLETH_STROKE

    return {
      strokeColor,
      min,
      max,
      featureCollection: {
        ...this.geoJson,
        features: this.geoJson.features.map((feat) => {
          const unit: CantonGeoUnit = <any>CantonGeoUnitNumber[<number>feat.id]
          const properties = cv.data.cantonData[unit]
          return { ...feat, unit, properties }
        }),
      },
      selectedGeoUnit: cv.geoUnit,
      selectedGeoUnitData,
      additionalInfoBoxData: this.prepareAdditionalData(cv),
      selectedGeoUnitTitle: getEnumValues(TopLevelGeoUnit).includes(cv.geoUnit)
        ? geoUnitName
        : `${this.translator.get('Commons.Canton')} ${geoUnitName}`,
      selectedGeoUnitSubTitle: `${this.translator.get(vaccPersonsGeoAgeFilter[cv.ageFilter])}, ${this.translator.get(
        'Commons.DateStatus',
        { date: endDate },
      )}`,
      hasNullValues: values.length !== nonNullValues.length,
      fillFn,
      data: cv.data,
    }
  }

  private prepareGeoTableData(cv: CurrentValues): GeoTableData | null {
    if (cv.geoView !== GeoViewFilter.TABLE) {
      return null
    }

    return { rows: this._prepareGeoTableData(cv), additionalInfoBoxData: this.prepareAdditionalData(cv) }
  }

  private _prepareGeoTableData(cv: CurrentValues): GeoTableRow[] {
    const entries = [cv.data.chFlData, cv.data.chData, ...Object.values(cv.data.cantonData)]

    const maxCol1Val = Math.max(
      ...entries.map((e) => e[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inzTotal).filter(isDefined),
    )
    const maxCol2Val = Math.max(...entries.map((e) => e[GdiSubset.VACC_PERSONS_FULL].inzTotal).filter(isDefined))

    const createGeoTableRow = (
      geoUnit: CantonGeoUnit | TopLevelGeoUnit,
      set1: EpidemiologicVaccGeoUnitData,
      set2: EpidemiologicVaccGeoUnitData,
      set3: EpidemiologicVaccGeoUnitData,
    ): GeoTableRow => ({
      key: `GeoFilter.${geoUnit}`,
      name: this.translator.get(`GeoFilter.${geoUnit}`),
      isSelected: geoUnit === cv.geoUnit,
      queryParams: { [QueryParams.GEO_FILTER]: geoUnit },
      set1: {
        abs: set1.total,
        rel: set1.inzTotal,
        barVal: ((set1.inzTotal || 0) / maxCol1Val) * 100,
      },
      set2: {
        abs: set2.total,
        rel: set2.inzTotal,
        barVal: ((set2.inzTotal || 0) / maxCol2Val) * 100,
      },
      set3: {
        abs: set3.total,
        rel: set3.inzTotal,
        barVal: ((set3.inzTotal || 0) / maxCol2Val) * 100,
      },
    })

    const topLevelRows = (<TopLevelGeoUnit[]>getEnumValues(TopLevelGeoUnit)).map((geoUnit) => {
      const entry =
        geoUnit === TopLevelGeoUnit.CHFL
          ? cv.data.chFlData
          : geoUnit === TopLevelGeoUnit.CH
          ? cv.data.chData
          : cv.data.cantonData[TopLevelGeoUnit.FL]
      return createGeoTableRow(
        geoUnit,
        entry[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE],
        entry[GdiSubset.VACC_PERSONS_FULL],
        entry[GdiSubset.VACC_PERSONS_FIRST_BOOSTER],
      )
    })

    const cantonRows: GeoTableRow[] = (<CantonGeoUnit[]>getEnumValues(CantonGeoUnit))
      .filter((k) => k !== CantonGeoUnit.FL)
      .map((geoUnit) => {
        const entry = cv.data.cantonData[geoUnit]
        return createGeoTableRow(
          geoUnit,
          entry[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE],
          entry[GdiSubset.VACC_PERSONS_FULL],
          entry[GdiSubset.VACC_PERSONS_FIRST_BOOSTER],
        )
      })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

    return [...topLevelRows, ...cantonRows]
  }

  private prepareAdditionalData(cv: CurrentValues): AdditionalInfoBoxItem[] {
    const additionalInfoBoxData: AdditionalInfoBoxItem[] = []
    if (
      cv.geoUnit === TopLevelGeoUnit.CHFL &&
      cv.ageFilter === VaccPersonsGeoAgeFilter.ALL &&
      this.data.dailyData.neighboringChFlData
    ) {
      additionalInfoBoxData.push({
        title: this.translator.get('Vaccination.VaccPersons.Card.Geography.Residence.NeighboringChFl'),
        full: {
          inzTotal: this.data.dailyData.neighboringChFlData[GdiSubset.VACC_PERSONS_FULL].inzTotal,
          total: this.data.dailyData.neighboringChFlData[GdiSubset.VACC_PERSONS_FULL].total,
        },
        partial: {
          inzTotal: this.data.dailyData.neighboringChFlData[GdiSubset.VACC_PERSONS_PARTIAL].inzTotal,
          total: this.data.dailyData.neighboringChFlData[GdiSubset.VACC_PERSONS_PARTIAL].total,
        },
        minOne: {
          inzTotal: this.data.dailyData.neighboringChFlData[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inzTotal,
          total: this.data.dailyData.neighboringChFlData[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].total,
        },
        booster: {
          inzTotal: this.data.dailyData.neighboringChFlData[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].inzTotal,
          total: this.data.dailyData.neighboringChFlData[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].total,
        },
      })
    }
    if (
      cv.geoUnit === TopLevelGeoUnit.CHFL &&
      cv.ageFilter === VaccPersonsGeoAgeFilter.ALL &&
      this.data.dailyData.unknownData
    ) {
      additionalInfoBoxData.push({
        title: this.translator.get('Vaccination.VaccPersons.Card.Geography.Residence.Unknown'),
        full: {
          inzTotal: this.data.dailyData.unknownData[GdiSubset.VACC_PERSONS_FULL].inzTotal,
          total: this.data.dailyData.unknownData[GdiSubset.VACC_PERSONS_FULL].total,
        },
        partial: {
          inzTotal: this.data.dailyData.unknownData[GdiSubset.VACC_PERSONS_PARTIAL].inzTotal,
          total: this.data.dailyData.unknownData[GdiSubset.VACC_PERSONS_PARTIAL].total,
        },
        minOne: {
          inzTotal: this.data.dailyData.unknownData[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inzTotal,
          total: this.data.dailyData.unknownData[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].total,
        },
        booster: {
          inzTotal: this.data.dailyData.unknownData[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].inzTotal,
          total: this.data.dailyData.unknownData[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].total,
        },
      })
    }
    return additionalInfoBoxData
  }

  private ageFilterCorrespondingData(
    ageFilter: VaccPersonsGeoAgeFilter,
  ): EpidemiologicVaccPersonsGeoBaseDailyData | EpidemiologicVaccPersonsGeoBaseData {
    switch (ageFilter) {
      case VaccPersonsGeoAgeFilter.ALL:
        return this.data.dailyData
      case VaccPersonsGeoAgeFilter.A_5_11:
        return this.data.weeklyData[AgeRangeByVaccinationStrategy.A_5_11]
      case VaccPersonsGeoAgeFilter.A_12_PLUS:
        return this.data.dailyData12Plus
      case VaccPersonsGeoAgeFilter.A_12_15:
        return this.data.weeklyData[AgeRangeByVaccinationStrategy.A_12_15]
      case VaccPersonsGeoAgeFilter.A_16_64:
        return this.data.weeklyData[AgeRangeByVaccinationStrategy.A_16_64]
      case VaccPersonsGeoAgeFilter.A_65_PLUS:
        return this.data.weeklyData[AgeRangeByVaccinationStrategy.A_65_PLUS]
      default:
        return this.data.dailyData
    }
  }
}
