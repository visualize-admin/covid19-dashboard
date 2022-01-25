import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  BucketData,
  DefaultBucketValue,
  EpidemiologicVaccDosesAdminLocationTimelineValues,
  EpidemiologicVaccDosesLocationDevelopmentData,
  EpidemiologicVaccDosesLocationDevelopmentEntry,
  GdiSubset,
  GdiVariant,
  GeoUnit,
  isDefined,
  VaccinationLocation,
} from '@c19/commons'
import { getEnumKeyFromValue, getEnumKeys, getEnumValues } from '@shiftcode/utilities'
import { scaleQuantize } from 'd3'
import { combineLatest, merge, Observable } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { MatrixBucketEntry, MatrixElementEvent, MatrixEntry } from '../../diagrams/matrix/base-matrix.component'
import { DefinedEntry, HeatmapFillFn } from '../../diagrams/matrix/matrix-heatmap/matrix-heatmap.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_NO_CASE, COLORS_LOCATIONS, COLORS_VACC_HEATMAP } from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import {
  DEFAULT_VACC_LOCATION_CUMULATIVE_FILTER,
  getVaccCumulativeFilterOptions,
  VaccCumulativeFilter,
} from '../../shared/models/filters/vacc-cumulative-filter.enum'
import { VaccinationRelativityFilter } from '../../shared/models/filters/vaccination-relativity-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { createMatrixData, MatrixCreationData } from '../../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { deepEqual } from '../../static-utils/deep-equal.function'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import {
  createMultiSelectQueryParamValue,
  filterHistoColors,
  filterHistoLegendPairs,
  MultiSelectValueOption,
  readMultiSelectQueryParamValue,
} from '../../static-utils/multi-select-filter-utils'
import { replaceHyphenWithEnDash } from '../../static-utils/replace-hyphen-with-en-dash.functions'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import {
  BaseDetailCardVaccinationComponent,
  CurrentValuesVaccinationBase,
} from '../base-detail-card-vaccination.component'

interface CurrentValues extends CurrentValuesVaccinationBase {
  relativityFilter: VaccinationRelativityFilter
  cumulativeFilter: VaccCumulativeFilter
  isRel: boolean
  locations: VaccinationLocation[]
}

interface LocationMatrixCreationData extends MatrixCreationData<MatrixBucketEntry> {
  bucketName: string
}

interface DemoMatrixEntry<B extends MatrixBucketEntry> extends MatrixEntry<Date, B> {
  startDate: Date
  endDate: Date
}

interface MatrixData {
  matrixData: {
    location: MatrixCreationData<MatrixBucketEntry>
    locationDataPerBucket: LocationMatrixCreationData[]
    locationFillFn: HeatmapFillFn<MatrixBucketEntry>
  }
  histogramData: CumulativeChartData
  isRel: boolean

  showCumulative: boolean
  showWeeklyValues: boolean
}

interface CumulativeChartEntry extends HistogramLineEntry {
  forceHideTooltip?: boolean
}

interface CumulativeChartData {
  data: CumulativeChartEntry[]
  hasNullValues: boolean
  histoColors: string[]
  histoLegendPairs: [string, string][]
}

type LocationBucketData = BucketData<DefaultBucketValue<EpidemiologicVaccDosesAdminLocationTimelineValues>, any>

@Component({
  selector: 'bag-detail-card-vacc-doses-location',
  templateUrl: './detail-card-vacc-doses-location.component.html',
  styleUrls: ['./detail-card-vacc-doses-location.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccDosesLocationComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccDosesLocationDevelopmentData>
  implements OnInit
{
  readonly cardDetailPath = RoutePaths.SHARE_VACC_LOCATION
  readonly heatmapScaleColors = COLORS_VACC_HEATMAP

  readonly cumulativeCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.LOCATION_CUMULATIVE_FILTER])
  readonly cumulativeFilterOptions = getVaccCumulativeFilterOptions(DEFAULT_VACC_LOCATION_CUMULATIVE_FILTER)
  readonly cumulativeFilter$: Observable<VaccCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.LOCATION_CUMULATIVE_FILTER, DEFAULT_VACC_LOCATION_CUMULATIVE_FILTER),
    tap<VaccCumulativeFilter>(emitValToOwnViewFn(this.cumulativeCtrl, DEFAULT_VACC_LOCATION_CUMULATIVE_FILTER)),
  )

  readonly locationFilterOptions: MultiSelectValueOption[] = getEnumValues(VaccinationLocation).map(
    (location): MultiSelectValueOption => ({
      value: location,
      label: this.translator.get(`VaccLocation.${getEnumKeyFromValue(VaccinationLocation, location)}`),
    }),
  )
  readonly locationFilterCtrl = new FormControl(
    readMultiSelectQueryParamValue(
      [...this.locationFilterOptions],
      VaccinationLocation,
      this.route.snapshot.queryParams[QueryParams.LOCATION_VIEW_LOCATION_FILTER],
    ),
  )
  readonly locationFilter$: Observable<MultiSelectValueOption[]> = this.route.queryParams.pipe(
    selectChanged(QueryParams.LOCATION_VIEW_LOCATION_FILTER, null),
    map((v) => readMultiSelectQueryParamValue([...this.locationFilterOptions], VaccinationLocation, v)),
    tap<MultiSelectValueOption[]>(emitValToOwnViewFn(this.locationFilterCtrl)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.vaccDosesRelativityFilter$,
    this.cumulativeFilter$,
    this.locationFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[relativityFilter, cumulativeFilter, locationFilter], geoUnit]) => {
      const isRel = relativityFilter === VaccinationRelativityFilter.INZ_100
      return {
        geoUnit,
        relativityFilter,
        isRel,
        cumulativeFilter,
        locations: <VaccinationLocation[]>locationFilter.map((v) => v.value),
        timeSpan: this.data.timeSpan,
      }
    }),
    distinctUntilChanged(deepEqual),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  readonly locationData$ = this.currentValues$.pipe(map(this.prepareMatrixData.bind(this)))

  keys: Record<
    'info' | 'descriptionTitle' | 'sourceDesc' | 'metaRel' | 'metaAbs' | 'tooltipRel' | 'tooltipAbs' | 'legendZero',
    string
  >

  override ngOnInit() {
    super.ngOnInit()
    merge(
      this.cumulativeCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.LOCATION_CUMULATIVE_FILTER]: v }))),
      this.locationFilterCtrl.valueChanges.pipe(
        map((v: MultiSelectValueOption[]) => createMultiSelectQueryParamValue(v, this.locationFilterOptions)),
        map((v) => ({ [QueryParams.LOCATION_VIEW_LOCATION_FILTER]: v })),
      ),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))

    this.cumulativeFilter$
      .pipe(
        takeUntil(this.onDestroy),
        filter((v) => v === VaccCumulativeFilter.WEEKLY),
      )
      .subscribe(() => this.locationFilterCtrl.setValue([...this.locationFilterOptions]))
  }

  demoViewMultiSelectFilterLabelFn: (value: MultiSelectValueOption[]) => string = (value: MultiSelectValueOption[]) => {
    return value.length === this.locationFilterOptions.length
      ? this.translator.get('VaccLocationFilter.AllSelected')
      : this.translator.get('VaccLocationFilter.CountSelected', { count: value.length })
  }

  showMatrixTooltip(
    { source, data }: MatrixElementEvent<DefinedEntry<DemoMatrixEntry<MatrixBucketEntry>, Date, MatrixBucketEntry>>,
    isRel: boolean,
  ) {
    const valKey: string = isRel ? this.keys.tooltipRel : this.keys.tooltipAbs
    const noData = !isDefined(data.bucketEntry.value)
    const ctx: TooltipListContentData = {
      title: this.translator.get(
        `VaccLocation.${getEnumKeyFromValue(VaccinationLocation, data.bucketEntry.bucketName)}`,
      ),
      date: this.dateRangeLabel(data.entry.startDate, data.entry.endDate),
      entries: [
        {
          label: this.translator.get(valKey),
          value: adminFormatNum(data.bucketEntry.value, isRel ? 2 : undefined),
        },
      ],
      noData,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: 'above',
      offsetY: 12,
    })
  }

  showCumulTooltip(
    { source, data }: HistogramElFocusEvent<CumulativeChartEntry>,
    isRel: boolean,
    histoLegendPairs: [string, string][],
  ) {
    if (data.forceHideTooltip) {
      this.hideTooltip()
      return
    }
    const noData = !data.values.some(isDefined)
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: data.values
        .map((v, ix) => [histoLegendPairs[ix][0], histoLegendPairs[ix][1], v] as const)
        .sort((a, b) => (b[2] || 0) - (a[2] || 0))
        .map((entry) => {
          return {
            label: replaceHyphenWithEnDash(entry[1]),
            value: adminFormatNum(entry[2], isRel ? 2 : undefined),
            color: entry[0],
          }
        }),
      noData,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  protected init() {
    this.keys = {
      info: 'Vaccination.Card.Location.Info',
      descriptionTitle: 'Vaccination.Card.DosesAdministered',
      sourceDesc: 'Vaccination.Card.DosesAdministered',
      metaRel: 'Vaccination.Card.Location.Weekly.Legend.Rel',
      metaAbs: 'Vaccination.Card.Location.Weekly.Legend.Abs',
      tooltipRel: 'Vaccination.Card.Location.Weekly.Tooltip.Rel',
      tooltipAbs: 'Vaccination.Card.Location.Weekly.Tooltip.Abs',
      legendZero: 'Vaccination.Card.Location.Weekly.Legend.Zero',
    }
  }

  protected override prepareDescription({ geoUnit }: { geoUnit: GeoUnit }): string {
    const parts = [this.translator.get(this.keys.descriptionTitle), this.translator.get(`GeoFilter.${geoUnit}`)]
    const { start, end } = this.data.timeSpan
    if (start && end) {
      const f = (d: string) => formatUtcDate(parseIsoDate(d))
      parts.push(this.translator.get('Commons.DateToDate', { date1: f(start), date2: f(end) }))
    }
    return parts.join(', ')
  }

  private dateRangeLabel(startDate: Date, endDate: Date): string {
    return this.translator.get('Commons.DateToDate', {
      date1: formatUtcDate(startDate),
      date2: formatUtcDate(endDate),
    })
  }

  private prepareMatrixData(cv: CurrentValues): MatrixData | null {
    const transformedBucketData: LocationBucketData[] = this.data.values.map((v) => {
      return {
        start: v.start,
        end: v.end,
        isoWeek: v.isoWeek,
        buckets: getEnumKeys(VaccinationLocation).map((location) => {
          return {
            bucket: VaccinationLocation[location],
            [GdiVariant.VALUE]: v[GdiSubset.VACC_DOSES_ADMIN][VaccinationLocation[location]].value,
            [GdiVariant.INZ]: v[GdiSubset.VACC_DOSES_ADMIN][VaccinationLocation[location]].inz,
            [GdiVariant.TOTAL]: v[GdiSubset.VACC_DOSES_ADMIN][VaccinationLocation[location]].total,
            [GdiVariant.INZ_TOTAL]: v[GdiSubset.VACC_DOSES_ADMIN][VaccinationLocation[location]].inzTotal,
          }
        }),
      }
    })

    const locationMatrixData = createMatrixData(transformedBucketData, cv.isRel ? GdiVariant.INZ : GdiVariant.VALUE)
    if (locationMatrixData.entries.length === 0) {
      return null
    }

    const locationDataPerBucket: LocationMatrixCreationData[] = []

    getEnumValues(VaccinationLocation).forEach((bucketName) => {
      const bucketData: LocationMatrixCreationData = {
        ...locationMatrixData,
        bucketName: this.translator.get(`VaccLocation.${getEnumKeyFromValue(VaccinationLocation, bucketName)}`),
      }
      bucketData.entries = bucketData.entries.map((entry) => {
        return { ...entry, buckets: entry.buckets.filter((b) => b.bucketName === bucketName) }
      })
      locationDataPerBucket.push(bucketData)
    })

    const scaleQuantizeZ = scaleQuantize<string>()
      .domain([locationMatrixData.min, locationMatrixData.max])
      .range(COLORS_VACC_HEATMAP)

    const locationFillFn: HeatmapFillFn<MatrixBucketEntry> = (e, svg) => {
      return !isDefined(e.value) ? svg.noDataFill : e.value > 0 ? <string>scaleQuantizeZ(e.value) : COLOR_NO_CASE
    }

    return {
      isRel: cv.isRel,
      matrixData: {
        location: locationMatrixData,
        locationDataPerBucket,
        locationFillFn,
      },
      histogramData: this.transformToCumulativeData(this.data.values, cv),
      showCumulative: cv.cumulativeFilter === VaccCumulativeFilter.TOTAL,
      showWeeklyValues: cv.cumulativeFilter === VaccCumulativeFilter.WEEKLY,
    }
  }

  private transformToCumulativeData(
    values: EpidemiologicVaccDosesLocationDevelopmentEntry[],
    cv: CurrentValues,
  ): CumulativeChartData {
    const relevantGdi = cv.isRel ? GdiVariant.INZ_TOTAL : GdiVariant.TOTAL
    const locationKeys = cv.locations.length ? cv.locations : <VaccinationLocation[]>getEnumValues(VaccinationLocation)

    const entries: CumulativeChartEntry[] = values.map((e) => ({
      date: parseIsoDate(e.end),
      values: locationKeys.map((indication) => e[GdiSubset.VACC_DOSES_ADMIN][indication][relevantGdi]),
    }))

    const histoColors = filterHistoColors(COLORS_LOCATIONS, cv.locations, VaccinationLocation)
    const histoLegendPairs = filterHistoLegendPairs(histoColors, cv.locations, VaccinationLocation)
      .reverse()
      .map((pair) => {
        pair[1] = this.translator.get(`VaccLocation.${getEnumKeyFromValue(VaccinationLocation, pair[1])}`)
        return pair
      })

    // add empty entry with the weeks start
    const leftPadEntries: CumulativeChartEntry[] = entries
      ? [
          {
            date: parseIsoDate(values[0].start),
            values: [],
            forceHideTooltip: true,
          },
        ]
      : []

    return {
      data: [...leftPadEntries, ...entries],
      hasNullValues: entries.some((e) => !e.values.some(isDefined)),
      histoColors,
      histoLegendPairs,
    }
  }
}
