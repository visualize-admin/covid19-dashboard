import { BreakpointObserver } from '@angular/cdk/layout'
import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import {
  CantonData,
  CantonGeoUnit,
  CantonGeoUnitNumber,
  EpidemiologicGeographyData,
  EpidemiologicGeoValues,
  EpidemiologicTestGeographyData,
  EpidemiologicTestGeoValues,
  GdiObject,
  GdiVariant,
  InlineValues,
  isDefined,
  Language,
  TimeSpan,
  TopLevelGeoUnit,
} from '@c19/commons'
import { filterIfInstanceOf, WindowRef } from '@shiftcode/ngx-core'
import { getEnumValues } from '@shiftcode/utilities'
import { scaleQuantize } from 'd3'
import { combineLatest, Observable } from 'rxjs'
import { first, map, mapTo, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators'
import { CURRENT_LANG } from '../../core/i18n/language.token'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import {
  ChoroplethEventData,
  ChoroplethGeoFeature,
  ChoroplethGeoFeatureCollection,
  ExtendedGeoFeatureCollection,
} from '../../diagrams/choropleth/base-choropleth.component'
import { createColorScale } from '../../diagrams/utils'
import {
  DETAIL_TEST_GDI_ANTIGEN,
  DETAIL_TEST_GDI_PCR,
} from '../../routes/dashboard/epidemiologic/detail-test/detail-test.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_NO_CASE, COLORS_CHOROPLETH_SCALE } from '../../shared/commons/colors.const'
import { D3SvgComponent } from '../../shared/components/d3-svg/d3-svg.component'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import {
  DEFAULT_GEO_VIEW_FILTER,
  GeoViewFilter,
  getGeoViewFilterOptions,
} from '../../shared/models/filters/geo-view-filter.enum'
import { TimeSlotFilter, timeSlotFilterTimeFrameKey } from '../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { Breakpoints } from '../../static-utils/breakpoints.enum'
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { scrollIntoView } from '../../static-utils/scroll-into-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseDetailEpidemiologicCardComponent, CurrentValuesBase } from '../base-detail-epidemiologic-card.component'

interface ExtChoroplethDataUnit {
  val: number | -1 | null
  absVal: number | -1 | null
  additionalValues: Array<number | undefined | null>
}

interface GeoMapData {
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  min: number
  max: number
  featureCollection: ChoroplethGeoFeatureCollection<ExtChoroplethDataUnit>
  hasNoData: boolean
  fillFn: (feature: ChoroplethGeoFeature<ExtChoroplethDataUnit>, instance: D3SvgComponent) => string
}

interface SelectedUnitData {
  title: string
  inzValue: [string, string]
  value: [string, string]
  additionalValues: [string, string][]
  noData: boolean
}

interface CurrentGeographyValues extends CurrentValuesBase {
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  geoView: GeoViewFilter
  timeFilter: TimeSlotFilter
  timeFrame: TimeSpan
  cantonData: CantonData<EpidemiologicGeoValues> | CantonData<EpidemiologicTestGeoValues>
  geoUnitData: InlineValues<EpidemiologicGeoValues> | InlineValues<EpidemiologicTestGeoValues> | null
}

export interface AdditionalValueDef {
  gdi: Record<TimeSlotFilter, EpidemiologicGeoValues | EpidemiologicTestGeoValues>
  label: string
  tooltip: string
}

interface GeoTableRowSetValues {
  rel: number | null
  abs: number | null
  barVal: number | null
  bar2Val: number | null
}

interface GeoTableRowSetTestPositivityValues {
  pcr: number | null
  antigen: number | null
}

interface GeoTableRow {
  key: string
  name: string
  isSelected: boolean
  queryParams: Record<string, string>
  set: GeoTableRowSetValues
  setTestPositivity: GeoTableRowSetTestPositivityValues | null
}

interface GeoTableData {
  rows: GeoTableRow[]
  isTest: boolean
}

@Component({
  selector: 'bag-detail-card-epidemiologic-geography',
  templateUrl: './detail-card-epidemiologic-geography.component.html',
  styleUrls: ['./detail-card-epidemiologic-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardEpidemiologicGeographyComponent
  extends BaseDetailEpidemiologicCardComponent<EpidemiologicGeographyData | EpidemiologicTestGeographyData>
  implements OnInit
{
  private static readonly keyMapping: Record<TimeSlotFilter, [EpidemiologicGeoValues, EpidemiologicGeoValues]> = {
    [TimeSlotFilter.TOTAL]: [GdiVariant.TOTAL, GdiVariant.INZ_TOTAL],
    [TimeSlotFilter.PHASE_2]: [GdiVariant.SUMP2, GdiVariant.INZ_P2],
    [TimeSlotFilter.PHASE_2B]: [GdiVariant.SUMP2B, GdiVariant.INZ_P2B],
    [TimeSlotFilter.PHASE_3]: [GdiVariant.SUMP3, GdiVariant.INZ_P3],
    [TimeSlotFilter.PHASE_4]: [GdiVariant.SUMP4, GdiVariant.INZ_P4],
    [TimeSlotFilter.PHASE_5]: [GdiVariant.SUMP5, GdiVariant.INZ_P5],
    [TimeSlotFilter.PHASE_6]: [GdiVariant.SUMP6, GdiVariant.INZ_P6],
    [TimeSlotFilter.LAST_4_WEEKS]: [GdiVariant.SUM28D, GdiVariant.INZ_28D],
    [TimeSlotFilter.LAST_2_WEEKS]: [GdiVariant.SUM14D, GdiVariant.INZ_14D],
  }
  private static instanceCounter = 1

  @Input()
  geoJson: ExtendedGeoFeatureCollection

  // additional gdi
  additional: AdditionalValueDef[] = []

  get showAdditionalGeoUnitsBox(): boolean {
    return this.isGdiCase
  }

  readonly instanceId = DetailCardEpidemiologicGeographyComponent.instanceCounter++
  readonly cardDetailPath = RoutePaths.SHARE_GEOGRAPHY
  readonly scaleColors = COLORS_CHOROPLETH_SCALE

  readonly geoViewFilterOptions = getGeoViewFilterOptions(DEFAULT_GEO_VIEW_FILTER)
  readonly geoViewFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_VIEW_FILTER] || null)
  readonly geoViewFilter$: Observable<GeoViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_VIEW_FILTER, DEFAULT_GEO_VIEW_FILTER),
    tap<GeoViewFilter>(emitValToOwnViewFn(this.geoViewFilterCtrl, DEFAULT_GEO_VIEW_FILTER)),
  )

  readonly currentValues$: Observable<CurrentGeographyValues> = combineLatest([
    this.timeFilter$,
    this.selectedGeoUnit$,
    this.geoViewFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    map(([timeFilter, geoUnit, geoView]): CurrentGeographyValues => {
      return {
        geoUnit,
        timeFilter,
        geoView,
        timeFrame: this.data.timeframes[timeSlotFilterTimeFrameKey[timeFilter]],
        geoUnitData:
          geoUnit === TopLevelGeoUnit.CHFL
            ? this.data.chFlData
            : geoUnit === TopLevelGeoUnit.CH
            ? this.data.chData
            : this.data.cantonData[geoUnit],
        cantonData: this.data.cantonData,
      }
    }),
    shareReplay(1),
  )

  readonly geoMapData$ = this.currentValues$.pipe(
    tap(() => {
      if (!this.geoJson) {
        throw new Error('GeoJson was not provided via @Input()')
      }
    }),
    map(this.prepareGeoMapData.bind(this)),
  )
  readonly geoTableData$: Observable<GeoTableData | null> = this.currentValues$.pipe(
    map(this.prepareGeoTableData.bind(this)),
  )

  readonly selectedUnitData$ = this.currentValues$.pipe(map(this.prepareSelectedUnitData.bind(this)), shareReplay(1))
  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))
  readonly geoRegionsUrl$: Observable<string[]> = this.route.queryParams.pipe(map(this.createGeoRegionsUrl.bind(this)))

  constructor(
    route: ActivatedRoute,
    router: Router,
    translator: TranslatorService,
    uriService: UriService,
    tooltipService: TooltipService,
    private readonly windowRef: WindowRef,
    private readonly breakpointObserver: BreakpointObserver,
    @Inject(DOCUMENT) private readonly doc: Document,
    @Inject(CURRENT_LANG) private readonly lang: Language,
  ) {
    super(route, router, translator, uriService, tooltipService)
  }

  ngOnInit() {
    this.geoViewFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((value) => ({ [QueryParams.GEO_VIEW_FILTER]: value })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  initCard(topic: string, gdiObject: GdiObject) {
    this.titleKey = `DetailCardGeo.Title`
    this.infoKey = `DetailCardGeo.InfoText.${topic}`

    if (gdiObject === GdiObject.TEST) {
      // additional gdi
      this.additional = [
        {
          gdi: DETAIL_TEST_GDI_PCR,
          label: `DetailTest.PositivityRate.PCR.Label`,
          tooltip: `DetailTest.PositivityRate.PCR.Abbr`,
        },
        {
          gdi: DETAIL_TEST_GDI_ANTIGEN,
          label: `DetailTest.PositivityRate.ANTIGEN.Label`,
          tooltip: `DetailTest.PositivityRate.ANTIGEN.Abbr`,
        },
      ]
    }
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

  showTooltip({ source, unit, properties }: ChoroplethEventData<ExtChoroplethDataUnit>) {
    const value: number | null = properties.val
    const valKey: string = this.tooltipInzKey

    const absValue: number | null = properties.absVal
    const absValKey: string = this.tooltipAbsKey

    const additionalEntries: TooltipListContentEntry[] = this.additional.map((addDef, ix) => {
      const val = properties.additionalValues[ix]
      return {
        label: this.translator.get(addDef.tooltip),
        value: adminFormatNum(val, undefined, '%'),
      }
    })

    const tooltipCtx: TooltipListContentData = {
      title: this.translator.get(`GeoFilter.${unit}`),
      noData: !isDefined(value),
      entries: [
        { label: this.translator.get(valKey), value: adminFormatNum(value) },
        { label: this.translator.get(absValKey), value: adminFormatNum(absValue), lighten: true },
        ...additionalEntries,
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, tooltipCtx, { position: 'above', offsetY: 10 })
  }

  readonly identifyRowItem = (index: number, item: GeoTableRow) => item.key

  private prepareGeoMapData(cv: CurrentGeographyValues): GeoMapData | null {
    if (cv.geoView !== GeoViewFilter.MAP) {
      return null
    }

    const relevantGdi = this.getRelevantGdi(cv.timeFilter, true)
    const relevantAbsGdi = this.getRelevantGdi(cv.timeFilter, false)

    const entries: Array<[string, number | null, number | null, Array<number | undefined>]> = (<Array<any>>(
      Object.entries(cv.cantonData)
    )).map(([key, val]) => {
      const value = val && isDefined(val[relevantGdi]) ? val[relevantGdi] : null
      const absValue = val && isDefined(val[relevantAbsGdi]) ? val[relevantAbsGdi] : null
      const addValue: any[] = this.additional.map((addDef) => val && val[addDef.gdi[cv.timeFilter]])
      return [key, value, absValue, addValue]
    })

    const preparedData = entries.reduce(
      (u, [k, val, absVal, additionalValues]) =>
        u.set(k, {
          val,
          absVal,
          additionalValues,
        }),
      new Map<string, ExtChoroplethDataUnit>(),
    )

    const features = this.geoJson.features
      .map((geoJsonFeature) => {
        const unit = CantonGeoUnitNumber[<number>geoJsonFeature.id]
        const properties = preparedData.get(unit)
        return <ChoroplethGeoFeature<ExtChoroplethDataUnit>>{ ...geoJsonFeature, properties, unit }
      })
      .filter((feat) => isDefined(feat.properties))

    const nonNullOrZeroValues = entries
      .map(([, v]) => v)
      .filter(isDefined)
      .filter((v) => v !== 0)

    const min = nonNullOrZeroValues.length ? Math.min(...nonNullOrZeroValues) : 0
    // add zero in case all data are null Math.max() returns Infinity
    const max = Math.max(0, ...nonNullOrZeroValues)

    const colorScale = scaleQuantize<string>().domain([min, max]).range(createColorScale(this.scaleColors, 6))

    const fillFn = ({ properties }: ChoroplethGeoFeature<ExtChoroplethDataUnit>, instance: D3SvgComponent): string => {
      switch (properties.val) {
        case 0:
          return COLOR_NO_CASE
        case null:
          return instance.noDataFill
        default:
          return <string>colorScale(properties.val)
      }
    }

    return {
      geoUnit: cv.geoUnit,
      fillFn,
      featureCollection: { ...this.geoJson, features },
      min,
      max,
      hasNoData: entries.some(([, val]) => val === null),
    }
  }

  private prepareGeoTableData(cv: CurrentGeographyValues): GeoTableData | null {
    if (cv.geoView !== GeoViewFilter.TABLE) {
      return null
    }
    const relevantInzGdi = this.getRelevantGdi(cv.timeFilter, true)
    const relevantGdi = this.getRelevantGdi(cv.timeFilter, false)
    const entries = [this.data.chFlData, this.data.chData, ...Object.values(this.data.cantonData)]

    const maxCol1Val = Math.max(
      ...entries
        .filter(isDefined)
        .map((e) => e[relevantInzGdi])
        .filter(isDefined),
    )
    const maxCol2Val = Math.max(
      ...entries
        .filter(isDefined)
        .map((e) => e[relevantGdi])
        .filter(isDefined),
    )

    const createTestPositivity = (
      set: InlineValues<EpidemiologicGeoValues> | InlineValues<EpidemiologicTestGeoValues> | null,
    ): GeoTableRowSetTestPositivityValues | null => {
      if (set === null || this.data.gdiObject !== GdiObject.TEST) {
        return null
      } else {
        return {
          pcr: (<InlineValues<EpidemiologicTestGeoValues>>set)[DETAIL_TEST_GDI_PCR[cv.timeFilter]],
          antigen: (<InlineValues<EpidemiologicTestGeoValues>>set)[DETAIL_TEST_GDI_ANTIGEN[cv.timeFilter]],
        }
      }
    }

    const createGeoTableRow = (
      geoUnit: TopLevelGeoUnit | CantonGeoUnit,
      set: InlineValues<EpidemiologicGeoValues> | InlineValues<EpidemiologicTestGeoValues> | null,
    ): GeoTableRow => ({
      key: `GeoFilter.${geoUnit}`,
      name: this.translator.get(`GeoFilter.${geoUnit}`),
      isSelected: geoUnit === cv.geoUnit,
      queryParams: { [QueryParams.GEO_FILTER]: geoUnit },
      set: {
        abs: set ? set[relevantGdi] : null,
        rel: set ? set[relevantInzGdi] : null,
        barVal: ((set ? set[relevantInzGdi] || 0 : 0) / maxCol1Val) * 100,
        bar2Val: ((set ? set[relevantGdi] || 0 : 0) / maxCol2Val) * 100,
      },
      setTestPositivity: createTestPositivity(set),
    })

    const topLevelRows = (<TopLevelGeoUnit[]>getEnumValues(TopLevelGeoUnit)).map((geoUnit) => {
      const entry =
        geoUnit === TopLevelGeoUnit.CHFL
          ? this.data.chFlData
          : geoUnit === TopLevelGeoUnit.CH
          ? this.data.chData
          : this.data.cantonData[TopLevelGeoUnit.FL]
      return createGeoTableRow(geoUnit, entry)
    })

    const cantonRows: GeoTableRow[] = (<CantonGeoUnit[]>getEnumValues(CantonGeoUnit))
      .filter((k) => k !== CantonGeoUnit.FL)
      .map((geoUnit) => {
        const entry = this.data.cantonData[geoUnit]
        return createGeoTableRow(geoUnit, entry)
      })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

    return {
      rows: [...topLevelRows, ...cantonRows],
      isTest: this.data.gdiObject === GdiObject.TEST,
    }
  }

  private prepareSelectedUnitData(cv: CurrentGeographyValues): SelectedUnitData {
    const { geoUnit, geoUnitData } = cv
    const title = [this.translator.get(`GeoFilter.${geoUnit}`)]
    if (!getEnumValues(TopLevelGeoUnit).includes(geoUnit)) {
      title.unshift(this.translator.get('Commons.Canton'))
    }

    const inzValue: number | null = geoUnitData ? geoUnitData[this.getRelevantGdi(cv.timeFilter, true)] : null
    const inzValKey: string = this.tooltipInzKey

    const value: number | null = geoUnitData ? geoUnitData[this.getRelevantGdi(cv.timeFilter, false)] : null
    const valKey: string = this.tooltipAbsKey

    // this is an ugly hack to escape the 'actually-necessary-but-from-tslint-removed-casting' bug
    const isDefinedGeoUnitData = (
      gud: InlineValues<EpidemiologicGeoValues> | InlineValues<EpidemiologicTestGeoValues> | null,
    ): gud is InlineValues<EpidemiologicTestGeoValues> => !!gud

    const additionalValues: [string, string][] = this.additional.map((addDef) => {
      const gdi = addDef.gdi[cv.timeFilter]
      const val = isDefinedGeoUnitData(geoUnitData) ? geoUnitData[gdi] : null
      return [this.translator.get(addDef.label), adminFormatNum(val, undefined, '%')]
    })

    return {
      title: title.join(' '),
      inzValue: [this.translator.get(inzValKey), adminFormatNum(inzValue)],
      value: [this.translator.get(valKey), adminFormatNum(value)],
      additionalValues,
      noData: !isDefined(inzValue),
    }
  }

  private getRelevantGdi(timeFilter: TimeSlotFilter, isInz: boolean): EpidemiologicGeoValues {
    return DetailCardEpidemiologicGeographyComponent.keyMapping[timeFilter][isInz ? 1 : 0]
  }

  private _scrollToDevCard() {
    const scrollToEl: HTMLElement | null = this.doc.querySelector(`#${DOM_ID.EPI_DEVELOPMENT_CARD}`)
    const isMobile = this.breakpointObserver.isMatched(`(max-width: ${Breakpoints.MAX_SM}px)`)
    const stickyHeaderEl: HTMLElement | null = this.doc.querySelector(`#${DOM_ID.STICKY_HEADER}`)
    let offset = stickyHeaderEl?.offsetHeight || 0
    if (!isMobile) {
      const detailFilterEl: HTMLElement | null = this.doc.querySelector(`#${DOM_ID.DETAIL_FILTER}`)
      offset += detailFilterEl?.offsetHeight || 0
    }

    if (scrollToEl && this.windowRef.nativeWindow) {
      scrollIntoView(this.windowRef.nativeWindow, scrollToEl, offset)
    }
  }

  private createGeoRegionsUrl(): string[] {
    return [
      `/${this.lang}`,
      `${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}`,
      'case',
      RoutePaths.DETAIL,
      RoutePaths.SHARE_GEO_REGIONS,
    ]
  }
}
