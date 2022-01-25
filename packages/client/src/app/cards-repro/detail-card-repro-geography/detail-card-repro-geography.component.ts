import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import {
  CantonGeoUnit,
  CantonGeoUnitNumber,
  GdiVariant,
  isDefined,
  ReGeography,
  ReGeographyUnitData,
  TimelineValues,
  TopLevelGeoUnit,
} from '@c19/commons'
import { filterIfInstanceOf, WindowRef } from '@shiftcode/ngx-core'
import { getEnumValues } from '@shiftcode/utilities'
import { combineLatest, Observable } from 'rxjs'
import { first, map, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import {
  ChoroplethEventData,
  ChoroplethGeoFeature,
  ChoroplethGeoFeatureCollection,
  ExtendedGeoFeatureCollection,
} from '../../diagrams/choropleth/base-choropleth.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_RANGE_1,
  COLOR_RANGE_2,
  COLOR_RANGE_3,
  COLOR_REPRO_TABLE_RANGE_1,
  COLOR_REPRO_TABLE_RANGE_1_HOVER,
  COLOR_REPRO_TABLE_RANGE_2,
  COLOR_REPRO_TABLE_RANGE_2_HOVER,
  COLOR_REPRO_TABLE_RANGE_3,
  COLOR_REPRO_TABLE_RANGE_3_HOVER,
} from '../../shared/commons/colors.const'
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
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { scrollIntoView } from '../../static-utils/scroll-into-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseReproCardComponent } from '../base-repro-card.component'

interface CurrentValues {
  geoUnitFilter: CantonGeoUnit | null
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  data: ReGeography
  geoView: GeoViewFilter
}

interface ChoroData {
  featureCollection: ChoroplethGeoFeatureCollection<ReGeographyUnitData>
  selectedGeoUnit: CantonGeoUnit | null
}

interface InfoBox {
  titleKey: string
  data: {
    value: number
    date: Date
  } | null
}

interface GeoTableRowSetValues {
  date: Date | null
  val: number | null
  barVal: number | null
  backgroundColor: string
  backgroundColorHover: string
}

interface GeoTableRow {
  key: string
  name: string
  isSelected: boolean
  queryParams: Record<string, string>
  set: GeoTableRowSetValues
}

interface GeoTableData {
  rows: GeoTableRow[]
}

@Component({
  selector: 'bag-detail-card-repro-geography',
  templateUrl: './detail-card-repro-geography.component.html',
  styleUrls: ['./detail-card-repro-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardReproGeographyComponent extends BaseReproCardComponent<ReGeography> implements OnInit {
  @Input()
  geoJson: ExtendedGeoFeatureCollection

  readonly cardType = RoutePaths.SHARE_GEOGRAPHY

  readonly geoViewFilterOptions = getGeoViewFilterOptions(DEFAULT_GEO_VIEW_FILTER)
  readonly geoViewFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_VIEW_FILTER] || null)
  readonly geoViewFilter$: Observable<GeoViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_VIEW_FILTER, DEFAULT_GEO_VIEW_FILTER),
    tap<GeoViewFilter>(emitValToOwnViewFn(this.geoViewFilterCtrl, DEFAULT_GEO_VIEW_FILTER)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([this.geoViewFilter$, this.geoUnitFilter$]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    map(([geoView, geoUnitFilter]) => ({
      geoUnitFilter,
      geoView,
      data: this.data,
      geoUnit: geoUnitFilter || TopLevelGeoUnit.CH,
    })),
  )
  readonly geoMapData$: Observable<ChoroData | null> = this.currentValues$.pipe(map(this.prepareGeoMapData.bind(this)))
  readonly geoTableData$: Observable<GeoTableData | null> = this.currentValues$.pipe(
    map(this.prepareGeoTableData.bind(this)),
  )
  readonly infoBox$: Observable<InfoBox> = this.currentValues$.pipe(map(this.prepareInfoBox.bind(this)))
  readonly description$: Observable<string> = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  constructor(
    route: ActivatedRoute,
    router: Router,
    tooltipService: TooltipService,
    translator: TranslatorService,
    uriService: UriService,
    private readonly windowRef: WindowRef,
    @Inject(DOCUMENT) private readonly doc: Document,
  ) {
    super(route, router, tooltipService, translator, uriService)
  }

  ngOnInit() {
    this.geoViewFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((value) => ({ [QueryParams.GEO_VIEW_FILTER]: value })),
      )
      .subscribe(updateQueryParamsFn(this.router))
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

  showTooltip({ source, unit, properties }: ChoroplethEventData<ReGeographyUnitData>) {
    const ctx: TooltipListContentData = {
      title: this.translator.get(`GeoFilter.${unit}`),
      entries: [properties.currentEntry, ...properties.previousEntries].map(
        (e, ix): TooltipListContentEntry => ({
          label: formatUtcDate(parseIsoDate(e.date)),
          value: adminFormatNum(e.median_r_mean, 2),
          borderBelow: ix === 0,
        }),
      ),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, { position: 'above', offsetY: 10 })
  }

  readonly identifyRowItem = (index: number, item: GeoTableRow) => item.key

  readonly choroplethFillFn = (
    feature: ChoroplethGeoFeature<ReGeographyUnitData>,
    instance: D3SvgComponent,
  ): string => {
    const val = feature.properties.currentEntry.median_r_mean
    if (val === null) {
      return instance.noDataFill
    }
    if (val < 0.8) {
      return COLOR_RANGE_1
    } else if (val < 1) {
      return COLOR_RANGE_2
    } else {
      return COLOR_RANGE_3
    }
  }

  private _scrollToDevCard() {
    const scrollToEl: HTMLElement | null = this.doc.querySelector(`#${DOM_ID.RE_DEVELOPMENT_CARD}`)
    const stickyHeaderEl: HTMLElement | null = this.doc.querySelector(`#${DOM_ID.STICKY_HEADER}`)
    if (scrollToEl && this.windowRef.nativeWindow) {
      scrollIntoView(this.windowRef.nativeWindow, scrollToEl, stickyHeaderEl?.offsetHeight)
    }
  }

  private prepareInfoBox({ geoUnit, data }: CurrentValues): InfoBox {
    if (geoUnit === TopLevelGeoUnit.CHFL) {
      return {
        titleKey: `GeoFilter.CHFL`,
        data: null,
      }
    }
    const currentEntry: TimelineValues<GdiVariant.MEDIAN_R_MEAN> | undefined = data.data[geoUnit]?.currentEntry
    return {
      titleKey: `GeoFilter.${geoUnit}`,
      data: isDefined(currentEntry?.median_r_mean)
        ? { value: currentEntry.median_r_mean, date: parseIsoDate(currentEntry.date) }
        : null,
    }
  }

  private prepareGeoMapData({ data: { data }, geoUnitFilter, geoView }: CurrentValues): ChoroData | null {
    if (geoView !== GeoViewFilter.MAP) {
      return null
    }
    return {
      selectedGeoUnit: geoUnitFilter,
      featureCollection: {
        ...this.geoJson,
        features: this.geoJson.features.map((geoJsonFeature) => {
          const unit = <CantonGeoUnit | TopLevelGeoUnit.CH>CantonGeoUnitNumber[<number>geoJsonFeature.id]
          const properties = data[unit]
          return <ChoroplethGeoFeature<ReGeographyUnitData>>{ ...geoJsonFeature, properties, unit }
        }),
      },
    }
  }

  private prepareGeoTableData(cv: CurrentValues): GeoTableData | null {
    if (cv.geoView !== GeoViewFilter.TABLE) {
      return null
    }

    const maxVal = Math.max(
      ...Object.values(cv.data.data)
        .filter(isDefined)
        .map((e) => e.currentEntry.median_r_mean)
        .filter(isDefined),
    )

    const topLevelRows = (<Array<TopLevelGeoUnit.CH | CantonGeoUnit.FL>>[TopLevelGeoUnit.CH, CantonGeoUnit.FL]).map(
      (geoUnit) => {
        const currentEntry: TimelineValues<GdiVariant.MEDIAN_R_MEAN> | undefined = cv.data.data[geoUnit]?.currentEntry
        return this.createGeoTableRow(cv, maxVal, geoUnit, currentEntry)
      },
    )

    const cantonRows: GeoTableRow[] = (<CantonGeoUnit[]>getEnumValues(CantonGeoUnit))
      .filter((k) => k !== CantonGeoUnit.FL)
      .map((geoUnit) => {
        const currentEntry: TimelineValues<GdiVariant.MEDIAN_R_MEAN> | undefined = cv.data.data[geoUnit]?.currentEntry
        return this.createGeoTableRow(cv, maxVal, geoUnit, currentEntry)
      })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

    return {
      rows: [...topLevelRows, ...cantonRows],
    }
  }

  private prepareDescription({ geoUnit, data: { data } }: CurrentValues): string {
    const currentEntry: TimelineValues<GdiVariant.MEDIAN_R_MEAN> | undefined =
      geoUnit === TopLevelGeoUnit.CHFL ? data[TopLevelGeoUnit.CH]?.currentEntry : data[geoUnit]?.currentEntry
    const date = currentEntry ? formatUtcDate(parseIsoDate(currentEntry.date)) : null
    return [
      this.translator.get('Reproduction.DetailTitle'),
      this.translator.get(`GeoFilter.${geoUnit}`),
      date
        ? this.translator.get('Reproduction.Card.Geography.DataStatus', { date })
        : this.translator.get('Commons.NoData'),
    ].join(', ')
  }

  private createGeoTableRow(
    cv: CurrentValues,
    maxVal: number,
    geoUnit: TopLevelGeoUnit | CantonGeoUnit,
    currentEntry: TimelineValues<GdiVariant.MEDIAN_R_MEAN> | undefined,
  ): GeoTableRow {
    return {
      key: `GeoFilter.${geoUnit}`,
      name: this.translator.get(`GeoFilter.${geoUnit}`),
      isSelected: geoUnit === cv.geoUnit,
      queryParams: { [QueryParams.GEO_FILTER]: geoUnit },
      set: {
        val: currentEntry ? currentEntry.median_r_mean : null,
        barVal:
          currentEntry && isDefined(currentEntry.median_r_mean) ? (currentEntry.median_r_mean / maxVal) * 100 : null,
        date: currentEntry ? parseIsoDate(currentEntry.date) : null,
        backgroundColor: currentEntry
          ? this.backgroundColorFn(currentEntry.median_r_mean)
          : this.backgroundColorFn(null),
        backgroundColorHover: currentEntry
          ? this.backgroundColorFn(currentEntry.median_r_mean, true)
          : this.backgroundColorFn(null),
      },
    }
  }

  private backgroundColorFn(val: number | null, hover = false): string {
    if (val === null) {
      return 'transparent'
    }
    if (val < 0.8) {
      return hover ? COLOR_REPRO_TABLE_RANGE_1_HOVER : COLOR_REPRO_TABLE_RANGE_1
    } else if (val < 1) {
      return hover ? COLOR_REPRO_TABLE_RANGE_2_HOVER : COLOR_REPRO_TABLE_RANGE_2
    } else {
      return hover ? COLOR_REPRO_TABLE_RANGE_3_HOVER : COLOR_REPRO_TABLE_RANGE_3
    }
  }
}
