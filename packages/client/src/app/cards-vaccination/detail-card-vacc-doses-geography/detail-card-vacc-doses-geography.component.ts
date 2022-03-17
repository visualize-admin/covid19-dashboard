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
  EpidemiologicVaccDosesDailyGeoValues,
  EpidemiologicVaccDosesGeographyData,
  EpidemiologicVaccGeoUnitData,
  EpidemiologicVaccGeoValues,
  GdiSubset,
  InlineValues,
  isDefined,
  TopLevelGeoUnit,
  VaccinationGdiObject,
} from '@c19/commons'
import { filterIfInstanceOf, WindowRef } from '@shiftcode/ngx-core'
import { getEnumValues } from '@shiftcode/utilities'
import { scaleQuantize } from 'd3'
import { combineLatest, Observable } from 'rxjs'
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
import { createColorScale } from '../../diagrams/utils'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_VACC_ADMINISTERED_TABLE,
  COLOR_VACC_RECEIVED_TABLE,
  COLORS_VACC_HEATMAP,
} from '../../shared/commons/colors.const'
import { Source } from '../../shared/components/detail-card/detail-card.component'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import {
  DEFAULT_GEO_VIEW_FILTER,
  GeoViewFilter,
  getGeoViewFilterOptions,
} from '../../shared/models/filters/geo-view-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { formatUtcDate } from '../../static-utils/date-utils'
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { scrollIntoView } from '../../static-utils/scroll-into-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import {
  BaseDetailCardVaccinationComponent,
  CurrentValuesVaccinationBase,
} from '../base-detail-card-vaccination.component'

interface CurrentValues extends CurrentValuesVaccinationBase {
  geoView: GeoViewFilter
}

interface GeoMapData {
  min: number
  max: number
  fillFn: FillFn
  selectedGeoUnit: CantonGeoUnit | TopLevelGeoUnit
  selectedGeoUnitData: EpidemiologicVaccDosesDailyGeoValues
  additionalData: EpidemiologicVaccDosesDailyGeoValues | null
  selectedGeoUnitTitle: string
  featureCollection: ChoroplethGeoFeatureCollection<EpidemiologicVaccDosesDailyGeoValues>
  hasNullValues: boolean
}

interface GeoTableRowSetValues {
  rel: number | null
  abs: number | null
  barVal: number
  color: string
}

interface GeoTableRow {
  key: string
  name: string
  isSelected: boolean
  queryParams: Record<string, string>
  deliveredData: GeoTableRowSetValues
  administeredData: GeoTableRowSetValues
}

interface GeoTableData {
  rows: GeoTableRow[]
  additionalData: EpidemiologicVaccDosesDailyGeoValues | null
}

interface GeoTooltipCtx {
  title: string
  gdiObject: VaccinationGdiObject
  data: EpidemiologicVaccDosesDailyGeoValues
}

@Component({
  selector: 'bag-detail-card-vacc-doses-geography',
  templateUrl: './detail-card-vacc-doses-geography.component.html',
  styleUrls: ['./detail-card-vacc-doses-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccDosesGeographyComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccDosesGeographyData>
  implements OnInit
{
  @Input()
  geoJson: ExtendedGeoFeatureCollection

  @ViewChild('tooltipElRef', { read: TemplateRef })
  tooltipElRef: TemplateRef<GeoTooltipCtx>

  readonly tableColors = {
    [GdiSubset.VACC_DOSES_DELIV]: COLOR_VACC_RECEIVED_TABLE,
    [GdiSubset.VACC_DOSES_ADMIN]: COLOR_VACC_ADMINISTERED_TABLE,
  }

  readonly cardDetailPath = RoutePaths.SHARE_GEOGRAPHY
  readonly scaleColors = COLORS_VACC_HEATMAP

  readonly geoViewFilterOptions = getGeoViewFilterOptions(DEFAULT_GEO_VIEW_FILTER)
  readonly geoViewFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_VIEW_FILTER] || null)
  readonly geoViewFilter$: Observable<GeoViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_VIEW_FILTER, DEFAULT_GEO_VIEW_FILTER),
    tap<GeoViewFilter>(emitValToOwnViewFn(this.geoViewFilterCtrl, DEFAULT_GEO_VIEW_FILTER)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([this.selectedGeoUnit$, this.geoViewFilter$]).pipe(
    map(([geoUnit, geoView]) => ({ geoUnit, geoView, timeSpan: this.data.timeSpan })),
    shareReplay(1),
  )

  readonly geoMapData$: Observable<GeoMapData | null> = this.currentValues$.pipe(map(this.prepareGeoMapData.bind(this)))
  readonly geoTableData$: Observable<GeoTableData | null> = this.currentValues$.pipe(
    map(this.prepareGeoTableData.bind(this)),
  )

  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  // if exists, returns dataState dependant warn key, otherwise return null
  readonly warningKey$: Observable<string | null> = this.dataService.sourceDate$.pipe(
    map((sourceDate) => `Vaccination.VaccDoses.Card.Geography.Warning.${formatUtcDate(sourceDate, 'yyyyMMdd')}`),
    map((specialWarnKey) => (this.translator.tryGet(specialWarnKey) ? specialWarnKey : null)),
  )

  keys: Record<'info' | 'legendTitle' | 'valueSet1Label' | 'valueSet2Label', string>

  get sources(): Source[] {
    return [
      {
        sourceKey: 'Commons.Source.LBA',
        descKey: 'Vaccination.Card.DosesDelivered',
        date: new Date(this.data.vaccSourceDates[GdiSubset.VACC_DOSES_DELIV]),
      },
      {
        sourceKey: 'Commons.Source.BAG',
        descKey: 'Vaccination.Card.DosesAdministered',
        date: new Date(this.data.vaccSourceDates[GdiSubset.VACC_DOSES_ADMIN]),
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
    this.geoViewFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((value) => ({ [QueryParams.GEO_VIEW_FILTER]: value })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  showTooltip({ source, unit }: ChoroplethEventData<EpidemiologicVaccDosesDailyGeoValues>) {
    const geoUnit = <CantonGeoUnit>unit
    const ctx: GeoTooltipCtx = {
      gdiObject: this.data.gdiObject,
      title: this.translator.get(`GeoFilter.${unit}`),
      data: this.data.cantonData[geoUnit],
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

  protected init() {
    this.keys = {
      info: 'Vaccination.VaccDoses.Card.Geography.InfoText',
      legendTitle: 'Vaccination.VaccDoses.Card.Geography.Legend.Title',
      valueSet1Label: 'Vaccination.Card.DosesDelivered',
      valueSet2Label: 'Vaccination.Card.DosesAdministered',
    }
  }

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
    const gdiSubKey: keyof EpidemiologicVaccDosesDailyGeoValues = GdiSubset.VACC_DOSES_ADMIN

    const values: (number | null)[] = Object.values(this.data.cantonData).map((e) => e[gdiSubKey].inzTotal)
    const nonNullValues = values.filter(isDefined)
    const [min, max] = [Math.min(...nonNullValues) || 0, Math.max(...nonNullValues) || 0]
    const colorScale = scaleQuantize<string>().domain([min, max]).range(createColorScale(this.scaleColors, 6))
    const fillFn: FillFn<EpidemiologicVaccDosesDailyGeoValues> = (feature, instance) => {
      const val = feature.properties[gdiSubKey].inzTotal
      return (isDefined(val) && colorScale(val)) || instance.noDataFill
    }
    const selectedGeoUnitData =
      cv.geoUnit === TopLevelGeoUnit.CHFL
        ? this.data.chFlData
        : cv.geoUnit === TopLevelGeoUnit.CH
        ? this.data.chData
        : this.data.cantonData[cv.geoUnit]
    const geoUnitName = this.translator.get(`GeoFilter.${cv.geoUnit}`)
    return {
      min,
      max,
      featureCollection: {
        ...this.geoJson,
        features: this.geoJson.features.map((feat) => {
          const unit: CantonGeoUnit = <any>CantonGeoUnitNumber[<number>feat.id]
          const properties = this.data.cantonData[unit]
          return { ...feat, unit, properties }
        }),
      },
      selectedGeoUnit: cv.geoUnit,
      selectedGeoUnitData,
      additionalData:
        cv.geoUnit === TopLevelGeoUnit.CHFL || cv.geoUnit === TopLevelGeoUnit.CH ? this.data.aaData : null,
      selectedGeoUnitTitle: getEnumValues(TopLevelGeoUnit).includes(cv.geoUnit)
        ? geoUnitName
        : `${this.translator.get('Commons.Canton')} ${geoUnitName}`,
      hasNullValues: values.length !== nonNullValues.length,
      fillFn,
    }
  }

  private prepareGeoTableData(cv: CurrentValues): GeoTableData | null {
    if (cv.geoView !== GeoViewFilter.TABLE) {
      return null
    }

    return {
      rows: this._prepareGeoTableData(cv, this.data),
      additionalData:
        cv.geoUnit === TopLevelGeoUnit.CHFL || cv.geoUnit === TopLevelGeoUnit.CH ? this.data.aaData : null,
    }
  }

  private _prepareGeoTableData(cv: CurrentValues, data: EpidemiologicVaccDosesGeographyData): GeoTableRow[] {
    const entries = [data.chFlData, data.chData, ...Object.values(data.cantonData)]

    const maxDeliveredValue = Math.max(...entries.map((e) => e[GdiSubset.VACC_DOSES_DELIV].inzTotal).filter(isDefined))
    const maxAdministeredValue = Math.max(
      ...entries.map((e) => e[GdiSubset.VACC_DOSES_ADMIN].inzTotal).filter(isDefined),
    )
    const createGeoTableRow = (
      geoUnit: CantonGeoUnit | TopLevelGeoUnit,
      deliveredData: InlineValues<EpidemiologicVaccGeoValues>,
      administratedData: EpidemiologicVaccGeoUnitData,
    ): GeoTableRow => ({
      key: `GeoFilter.${geoUnit}`,
      name: this.translator.get(`GeoFilter.${geoUnit}`),
      isSelected: geoUnit === cv.geoUnit,
      queryParams: { [QueryParams.GEO_FILTER]: geoUnit },
      deliveredData: {
        abs: deliveredData.total,
        rel: deliveredData.inzTotal,
        barVal: ((deliveredData.inzTotal || 0) / maxDeliveredValue) * 100,
        color: this.tableColors[GdiSubset.VACC_DOSES_DELIV],
      },
      administeredData: {
        abs: administratedData.total,
        rel: administratedData.inzTotal,
        barVal: ((administratedData.inzTotal || 0) / maxAdministeredValue) * 100,
        color: this.tableColors[GdiSubset.VACC_DOSES_ADMIN],
      },
    })

    const topLevelRows = (<TopLevelGeoUnit[]>getEnumValues(TopLevelGeoUnit)).map((geoUnit) => {
      const entry =
        geoUnit === TopLevelGeoUnit.CHFL
          ? data.chFlData
          : geoUnit === TopLevelGeoUnit.CH
          ? data.chData
          : data.cantonData[TopLevelGeoUnit.FL]
      return createGeoTableRow(geoUnit, entry[GdiSubset.VACC_DOSES_DELIV], entry[GdiSubset.VACC_DOSES_ADMIN])
    })

    const cantonRows: GeoTableRow[] = (<CantonGeoUnit[]>getEnumValues(CantonGeoUnit))
      .filter((k) => k !== CantonGeoUnit.FL)
      .map((geoUnit) => {
        const entry = data.cantonData[geoUnit]
        return createGeoTableRow(geoUnit, entry[GdiSubset.VACC_DOSES_DELIV], entry[GdiSubset.VACC_DOSES_ADMIN])
      })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

    return [...topLevelRows, ...cantonRows]
  }
}
