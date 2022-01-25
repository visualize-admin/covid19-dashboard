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
  CantonGeoUnit,
  CantonGeoUnitNumber,
  GdiObject,
  GdiVariant,
  GeoUnit,
  HospCapacityGeographyData,
  HospCapacityGeoValues,
  HospCapacityGeoValuesRecord,
  isDefined,
  TopLevelGeoUnit,
} from '@c19/commons'
import { filterIfInstanceOf, WindowRef } from '@shiftcode/ngx-core'
import { getEnumValues } from '@shiftcode/utilities'
import { scaleQuantize, ScaleQuantize } from 'd3'
import { combineLatest, merge, Observable } from 'rxjs'
import { first, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import {
  ChoroplethEventData,
  ChoroplethGeoFeature,
  ChoroplethGeoFeatureCollection,
  ExtendedGeoFeatureCollection,
} from '../../diagrams/choropleth/base-choropleth.component'
import { createColorScale } from '../../diagrams/utils'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_NO_CASE, COLORS_CHOROPLETH_SCALE } from '../../shared/commons/colors.const'
import { D3SvgComponent } from '../../shared/components/d3-svg/d3-svg.component'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import {
  DEFAULT_GEO_VIEW_FILTER,
  GeoViewFilter,
  getGeoViewFilterOptions,
} from '../../shared/models/filters/geo-view-filter.enum'
import {
  DEFAULT_HOSP_OCCUPANCY_FILTER,
  getHospOccupancyFilterOptions,
  HospOccupancyFilter,
} from '../../shared/models/filters/hosp-occupancy-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { scrollIntoView } from '../../static-utils/scroll-into-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseHospCapacityCardComponent } from '../base-hosp-capacity-card.component'

interface ChoroVal {
  val: number | null | 'notExisting'
}

interface CurrentValues {
  covidOnly: boolean
  geoUnit: CantonGeoUnit | TopLevelGeoUnit.CH
  data: HospCapacityGeographyData
  geoView: GeoViewFilter
}

interface DiagramData {
  geoUnitSelection: CantonGeoUnit | null
  featureCollection: ChoroplethGeoFeatureCollection<ChoroVal>
  min: number
  max: number
  hasNoData: boolean
  isNotExisting: boolean
  covidOnly: boolean
}

interface InfoData {
  title: string
  noneHint: string | null
  dailyData: HospCapacityGeoValuesRecord
  covidOnly: boolean
}

interface GeoTableRowSetValues {
  percentage: number | null
  absolute: number | null
}

interface GeoTableRow {
  key: string
  name: string
  isSelected: boolean
  queryParams: Record<string, string>
  noneHint: string | null
  setCovid: GeoTableRowSetValues
  setNonCovid: GeoTableRowSetValues
  setFree: GeoTableRowSetValues
  setCapacity: GeoTableRowSetValues
  setAll: GeoTableRowSetValues
}

type GeoTooltipCtx = InfoData

@Component({
  selector: 'bag-detail-card-capacity-geography',
  templateUrl: './detail-card-hosp-capacity-geography.component.html',
  styleUrls: ['./detail-card-hosp-capacity-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardHospCapacityGeographyComponent
  extends BaseHospCapacityCardComponent<HospCapacityGeographyData>
  implements OnInit
{
  @Input()
  geoJson: ExtendedGeoFeatureCollection

  readonly scaleColors = COLORS_CHOROPLETH_SCALE
  readonly HospOccupancyFilter = HospOccupancyFilter

  readonly cardDetailPath = RoutePaths.SHARE_GEOGRAPHY

  @ViewChild('tooltip', { static: true, read: TemplateRef })
  tooltipElRef: TemplateRef<GeoTooltipCtx>

  readonly hospOccupancyFilterOptions = getHospOccupancyFilterOptions(DEFAULT_HOSP_OCCUPANCY_FILTER)
  readonly hospOccupancyFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.OCCUPANCY_FILTER] || null,
  )
  readonly hospOccupancyFilter$: Observable<HospOccupancyFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.OCCUPANCY_FILTER, DEFAULT_HOSP_OCCUPANCY_FILTER),
    tap<HospOccupancyFilter>(emitValToOwnViewFn(this.hospOccupancyFilterCtrl, DEFAULT_HOSP_OCCUPANCY_FILTER)),
  )

  readonly geoViewFilterOptions = getGeoViewFilterOptions(DEFAULT_GEO_VIEW_FILTER)
  readonly geoViewFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_VIEW_FILTER] || null)
  readonly geoViewFilter$: Observable<GeoViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_VIEW_FILTER, DEFAULT_GEO_VIEW_FILTER),
    tap<GeoViewFilter>(emitValToOwnViewFn(this.geoViewFilterCtrl, DEFAULT_GEO_VIEW_FILTER)),
  )

  readonly currentValues$ = combineLatest([this.geoUnitFilter$, this.hospOccupancyFilter$, this.geoViewFilter$]).pipe(
    switchMap(([geoUnit, occupancy, geoView]) => {
      return this.onChanges$.pipe(
        map(() => ({
          geoUnit,
          covidOnly: occupancy === HospOccupancyFilter.COVID,
          data: this.data,
          geoView,
        })),
      )
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
    shareReplay(1),
  )

  readonly geoTableData$: Observable<GeoTableRow[] | null> = this.currentValues$.pipe(
    map(this.prepareGeoTableData.bind(this)),
  )

  readonly infoData$ = this.currentValues$.pipe(map(this.createInfoData.bind(this)))
  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))
  readonly detailUrl$ = this.currentValues$.pipe(map(this.createShareUrl.bind(this)))
  readonly downloadUrls$ = this.currentValues$.pipe(switchMap(this.createImageDownloadUrls.bind(this)))

  private readonly colorScaleQuantize: ScaleQuantize<string> = scaleQuantize<string>()
    .domain([0, 100])
    .range(createColorScale(this.scaleColors, 6))

  constructor(
    router: Router,
    route: ActivatedRoute,
    uriService: UriService,
    tooltipService: TooltipService,
    translator: TranslatorService,
    private readonly windowRef: WindowRef,
    @Inject(DOCUMENT) private readonly doc: Document,
  ) {
    super(router, route, uriService, tooltipService, translator)
  }

  ngOnInit() {
    merge(
      this.hospOccupancyFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.OCCUPANCY_FILTER]: v }))),
      this.geoViewFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.GEO_VIEW_FILTER]: v }))),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  showTooltip({ source, unit }: ChoroplethEventData, data: DiagramData) {
    const dailyData: HospCapacityGeoValuesRecord = <any>this.data.cantonData[<CantonGeoUnit>unit]
    const ctx: GeoTooltipCtx = {
      title: this.translator.get(`GeoFilter.${unit}`),
      noneHint: this.getNoneHint(dailyData),
      dailyData,
      covidOnly: data.covidOnly,
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

  readonly getFill = ({ properties }: ChoroplethGeoFeature<ChoroVal>, instance: D3SvgComponent): string => {
    switch (properties.val) {
      case 'notExisting':
        return COLOR_NO_CASE
      case null:
        return instance.noDataFill
      default:
        return <string>this.colorScaleQuantize(properties.val)
    }
  }

  protected initCard({ gdiObject }: HospCapacityGeographyData) {
    switch (gdiObject) {
      case GdiObject.HOSP_CAPACITY_ICU:
        this.infoKey = 'HospCapacity.Icu.Card.Geography.InfoText'
        break
      case GdiObject.HOSP_CAPACITY_TOTAL:
        this.infoKey = 'HospCapacity.Total.Card.Geography.InfoText'
        break
    }
  }

  private getNoneHint(dailyData: HospCapacityGeoValuesRecord | null): string | null {
    return dailyData?.exists === false
      ? this.translator.get(this.noneKey)
      : !dailyData || !isDefined(dailyData.value_hospBedsCapacity)
      ? this.translator.get('Commons.NoData')
      : null
  }

  private createInfoData({ geoUnit, covidOnly, data }: CurrentValues) {
    const dailyData: HospCapacityGeoValuesRecord =
      geoUnit === TopLevelGeoUnit.CH ? data.chData : <any>data.cantonData[geoUnit]
    return {
      title: [this.translator.get(this.topicKey), this.translator.get(`GeoFilter.${geoUnit}`)].join(', '),
      noneHint: this.getNoneHint(dailyData),
      dailyData,
      covidOnly,
    }
  }

  private prepareGeoMapData({ data, covidOnly, geoUnit, geoView }: CurrentValues): DiagramData | null {
    if (geoView !== GeoViewFilter.MAP) {
      return null
    }
    const valueProp: HospCapacityGeoValues = covidOnly
      ? GdiVariant.PERCENTAGE_HOSP_BEDS_COVID
      : GdiVariant.PERCENTAGE_HOSP_BEDS_ALL

    const isEntryDefined = <X extends HospCapacityGeoValuesRecord>(
      args: [string, X | null],
    ): args is [CantonGeoUnit, X] => isDefined(args[1])

    const entries = Object.entries(data.cantonData)
      .filter(isEntryDefined)
      .reduce(
        (u, [key, val]) =>
          u.set(key, {
            val: !val.exists ? 'notExisting' : isDefined(val[valueProp]) ? val[valueProp] : null,
          }),
        new Map<string, ChoroVal>(),
      )

    const values = Array.from(entries.values()).map((v) => v.val)

    const augmentedData = this.geoJson.features
      .map((geoJsonFeature) => {
        const unit = CantonGeoUnitNumber[<number>geoJsonFeature.id]
        const properties = entries.get(unit)
        return <ChoroplethGeoFeature<ChoroVal>>{ ...geoJsonFeature, properties, unit }
      })
      .filter((feat) => isDefined(feat.properties))

    return {
      geoUnitSelection: geoUnit === TopLevelGeoUnit.CH ? null : geoUnit,
      featureCollection: { ...this.geoJson, features: augmentedData },
      min: 0,
      max: 100,
      isNotExisting: values.some((v) => v === 'notExisting'),
      hasNoData: values.some((v) => v === null),
      covidOnly,
    }
  }

  private prepareGeoTableData(cv: CurrentValues): GeoTableRow[] | null {
    if (cv.geoView !== GeoViewFilter.TABLE) {
      return null
    }

    const chRow: GeoTableRow = this.createGeoTableRow(cv, TopLevelGeoUnit.CH, cv.data.chData)
    const cantonRows: GeoTableRow[] = (<CantonGeoUnit[]>getEnumValues(CantonGeoUnit))
      .filter((k) => k !== CantonGeoUnit.FL)
      .map((geoUnit) => {
        const entry = cv.data.cantonData[geoUnit]
        return this.createGeoTableRow(cv, geoUnit, entry)
      })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

    return [chRow, ...cantonRows]
  }

  private createDescription({ geoUnit, data }: CurrentValues): string {
    const statusDate = parseIsoDate(data.timeSpan.start)
    return [
      this.translator.get(this.topicKey),
      this.translator.get(`GeoFilter.${geoUnit}`),
      this.translator.get(`HospCapacity.Card.Geography.DataStatus`, { date: formatUtcDate(statusDate) }),
    ].join(', ')
  }

  private _scrollToDevCard() {
    const scrollToEl: HTMLElement | null = this.doc.querySelector(`#${DOM_ID.HOSP_DEVELOPMENT_CARD}`)
    const stickyHeaderEl: HTMLElement | null = this.doc.querySelector(`#${DOM_ID.STICKY_HEADER}`)
    if (scrollToEl && this.windowRef.nativeWindow) {
      scrollIntoView(this.windowRef.nativeWindow, scrollToEl, stickyHeaderEl?.offsetHeight)
    }
  }

  private createGeoTableRow(
    cv: CurrentValues,
    geoUnit: GeoUnit,
    entry: HospCapacityGeoValuesRecord | null,
  ): GeoTableRow {
    return {
      key: `GeoFilter.${geoUnit}`,
      name: this.translator.get(`GeoFilter.${geoUnit}`),
      isSelected: cv.geoUnit === geoUnit,
      queryParams: { [QueryParams.GEO_FILTER]: geoUnit },
      setCovid: {
        percentage: entry ? entry.percentage_hospBedsCovid : null,
        absolute: entry ? entry.value_hospBedsCovid : null,
      },
      setNonCovid: {
        percentage: entry ? entry.percentage_hospBedsNonCovid : null,
        absolute: entry ? entry.value_hospBedsNonCovid : null,
      },
      setFree: {
        percentage: entry ? entry.percentage_hospBedsFree : null,
        absolute: entry ? entry.value_hospBedsFree : null,
      },
      setAll: {
        percentage: entry ? entry.percentage_hospBedsAll : null,
        absolute: entry ? entry.value_hospBedsAll : null,
      },
      setCapacity: {
        percentage: 100,
        absolute: entry ? entry.value_hospBedsCapacity : null,
      },
      noneHint: this.getNoneHint(entry),
    }
  }
}
