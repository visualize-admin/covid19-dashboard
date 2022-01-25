import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  EpidemiologicVaccIndicationDevelopmentData,
  EpidemiologicVaccIndicationDevelopmentEntry,
  EpidemiologicVaccIndicationTimelineEntry,
  GdiObject,
  GdiSubset,
  GdiVariant,
  isDefined,
  VaccinationIndication,
  VaccinationIndicationGeneral,
  VaccinationIndicationRiskGroups,
} from '@c19/commons'
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
import { HistogramAreaEntry } from '../../diagrams/histogram/histogram-area/histogram-area.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { MatrixElementEvent, MatrixEntry } from '../../diagrams/matrix/base-matrix.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_VACC_GRP_OTHER, COLOR_VACC_GRP_RISK, COLOR_VACC_NOT_VACCINATED } from '../../shared/commons/colors.const'
import {
  TooltipTableContentComponent,
  TooltipTableContentData,
  TooltipTableContentEntry,
} from '../../shared/components/tooltip/tooltip-table-content/tooltip-table-content.component'
import { RefMatrixBucketEntry } from '../../shared/models/demo-matrix-entry.model'
import {
  DEFAULT_VACC_DEMO_CUMULATIVE_FILTER,
  getVaccCumulativeFilterOptions,
  VaccCumulativeFilter,
} from '../../shared/models/filters/vacc-cumulative-filter.enum'
import {
  DEFAULT_VACC_GROUP_RANGE_FILTER,
  getVaccGroupRangeFilterOptions,
  VaccGroupRangeFilter,
} from '../../shared/models/filters/vacc-group-range-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { deepEqual } from '../../static-utils/deep-equal.function'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import {
  BaseDetailCardVaccinationComponent,
  CurrentValuesVaccinationBase,
} from '../base-detail-card-vaccination.component'

interface CurrentValues extends CurrentValuesVaccinationBase {
  cumulativeFilter: VaccCumulativeFilter
  grpRangeFilter: VaccGroupRangeFilter
  showGrpRangeFilter: boolean
  useGrpRangePopulation: boolean
}

interface GroupRatioMatrixEntry extends MatrixEntry<Date, RefMatrixBucketEntry> {
  total: number | null
  start: Date
  end: Date
}

interface GroupRatioAreaEntry extends HistogramAreaEntry {
  relValues: (number | null)[]
  absValues: (number | null)[]
  total: number | null
  forceHideTooltip?: boolean
}

interface ChartData {
  stackEntries?: GroupRatioMatrixEntry[]
  areaEntries?: GroupRatioAreaEntry[]
  hasNullValues: boolean
  hasZeroValues: boolean
}

interface TooltipEntry {
  key: string
  col: string
  abs: number | null
  rel: number | null
}

interface TooltipCtx {
  title: string
  entries: TooltipEntry[]
  total: number | null
  withTotal: boolean
  noVacced: boolean
  hideAbs: boolean
}

type TempValueEntry = [
  EpidemiologicVaccIndicationDevelopmentEntry,
  Record<VaccinationIndication, EpidemiologicVaccIndicationTimelineEntry>,
]

@Component({
  selector: 'bag-detail-card-vaccination-group-ratio',
  templateUrl: './detail-card-vaccination-group-ratio.component.html',
  styleUrls: ['./detail-card-vaccination-group-ratio.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccinationGroupRatioComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccIndicationDevelopmentData>
  implements OnInit
{
  @ViewChild('tooltipRef', { static: true, read: TemplateRef })
  tooltipRef: TemplateRef<TooltipCtx>

  readonly cardDetailPath = RoutePaths.SHARE_VACC_GRP_RATIO
  readonly colors = {
    risk: COLOR_VACC_GRP_RISK,
    other: COLOR_VACC_GRP_OTHER,
    notVacced: COLOR_VACC_NOT_VACCINATED,
  }

  readonly cumulativeFilterOptions = getVaccCumulativeFilterOptions(DEFAULT_VACC_DEMO_CUMULATIVE_FILTER)
  readonly cumulativeFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.GRP_RATIO_CUMULATIVE_FILTER] || null,
  )
  readonly cumulativeFilter$: Observable<VaccCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GRP_RATIO_CUMULATIVE_FILTER, DEFAULT_VACC_DEMO_CUMULATIVE_FILTER),
    tap<VaccCumulativeFilter>(emitValToOwnViewFn(this.cumulativeFilterCtrl, DEFAULT_VACC_DEMO_CUMULATIVE_FILTER)),
  )

  readonly grpRangeFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GRP_RANGE] || null)
  readonly grpRangeFilterOptions = getVaccGroupRangeFilterOptions(DEFAULT_VACC_GROUP_RANGE_FILTER)
  readonly grpRangeFilter$: Observable<VaccGroupRangeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GRP_RANGE, DEFAULT_VACC_GROUP_RANGE_FILTER),
    tap<VaccGroupRangeFilter>(emitValToOwnViewFn(this.grpRangeFilterCtrl, DEFAULT_VACC_GROUP_RANGE_FILTER)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.cumulativeFilter$,
    this.grpRangeFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[cumulativeFilter, grpRangeFilter], geoUnit]) => {
      const showGrpRangeFilter =
        this.data.gdiObject === GdiObject.VACC_PERSONS && cumulativeFilter === VaccCumulativeFilter.TOTAL
      const useGrpRangePopulation = showGrpRangeFilter && grpRangeFilter === VaccGroupRangeFilter.POPULATION
      return {
        geoUnit,
        cumulativeFilter,
        grpRangeFilter,
        showGrpRangeFilter,
        useGrpRangePopulation,
        timeSpan: this.data.timeSpan,
      }
    }),
    distinctUntilChanged(deepEqual), // necessary in this case due to side effects of filters (removing param on specific opt)
    shareReplay(1),
  )

  readonly chartData$: Observable<ChartData | null> = this.currentValues$.pipe(map(this.prepareChartData.bind(this)))

  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  keys: Record<'descriptionTitle' | 'info' | 'legendZero', string>

  override ngOnInit() {
    merge(
      this.cumulativeFilterCtrl.valueChanges.pipe(map((val) => ({ [QueryParams.GRP_RATIO_CUMULATIVE_FILTER]: val }))),
      this.grpRangeFilterCtrl.valueChanges.pipe(map((val) => ({ [QueryParams.GRP_RANGE]: val }))),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))

    this.cumulativeFilter$
      .pipe(
        takeUntil(this.onDestroy),
        filter((v) => v === VaccCumulativeFilter.WEEKLY),
      )
      .subscribe(() => this.grpRangeFilterCtrl.setValue(null))
  }

  showStackTooltip({ source, data }: MatrixElementEvent<GroupRatioMatrixEntry>) {
    const bucketRisk = data.buckets.find((b) => b.bucketName === VaccinationIndicationRiskGroups.RISK_GROUPS)
    const bucketOther = data.buckets.find((b) => b.bucketName === VaccinationIndicationGeneral.OTHER)
    const ctx: TooltipTableContentData = {
      title: this.dateRangeLabel(data.start, data.end),
      col1Hidden: false,
      col2Bold: true,
      entries: data.noData
        ? []
        : [
            {
              color: this.colors.risk,
              key: 'Vaccination.Card.GroupRatio.Groups.Risk',
              col1: { value: adminFormatNum(bucketRisk?.refValue) },
              col2: { value: adminFormatNum(bucketRisk?.value, 1, '%') },
            },
            {
              color: this.colors.other,
              key: 'Vaccination.Card.GroupRatio.Groups.Other',
              col1: { value: adminFormatNum(bucketOther?.refValue) },
              col2: { value: adminFormatNum(bucketOther?.value, 1, '%') },
            },
          ],
      footer: [
        {
          key: 'Commons.Total',
          col1: { value: adminFormatNum(data.total) },
          col2: { value: '100%' },
        },
      ],
    }
    this.tooltipService.showCmp(TooltipTableContentComponent, source, ctx, { position: 'above', offsetY: 12 })
  }

  showAreaTooltip(
    { source, data }: HistogramElFocusEvent<GroupRatioAreaEntry>,
    { useGrpRangePopulation }: CurrentValues,
  ) {
    if (data.forceHideTooltip) {
      this.hideTooltip()
      return
    }
    const noData = !data.values.some(isDefined)
    const risk: TooltipTableContentEntry = {
      color: this.colors.risk,
      key: 'Vaccination.Card.GroupRatio.Groups.Risk',
      col1: { value: adminFormatNum(data.absValues[1]) },
      col2: { value: adminFormatNum(data.relValues[1], 1, '%') },
    }
    const other: TooltipTableContentEntry = {
      color: this.colors.other,
      key: 'Vaccination.Card.GroupRatio.Groups.Other',
      col1: { value: adminFormatNum(data.absValues[0]) },
      col2: { value: adminFormatNum(data.relValues[0], 1, '%') },
    }
    const notVacced: TooltipTableContentEntry = {
      color: this.colors.notVacced,
      key: 'Vaccination.Card.GroupRatio.Groups.NotVaccinated',
      col1: { value: adminFormatNum(data.absValues[2]) },
      col2: { value: adminFormatNum(data.relValues[2], 1, '%') },
    }
    const ctx: TooltipTableContentData = {
      title: data.date,
      entries: noData ? [] : useGrpRangePopulation ? [notVacced, risk, other] : [risk, other],
      col2Bold: true,
    }
    if (!useGrpRangePopulation) {
      ctx.footer = [
        {
          key: 'Commons.Total',
          col1: { value: adminFormatNum(data.total) },
          col2: { value: '100%' },
        },
      ]
    }
    this.tooltipService.showCmp(TooltipTableContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  readonly yLabelFmt = (val: number) => `${val}%`

  protected init(): void {
    switch (this.data.gdiObject) {
      case GdiObject.VACC_DOSES:
        this.keys = {
          descriptionTitle: 'Vaccination.Card.DosesAdministered',
          info: 'Vaccination.VaccDoses.Card.GroupRatio.Info',
          legendZero: 'Vaccination.VaccDoses.Card.NoAdministeredDoses',
        }
        break
      case GdiObject.VACC_PERSONS:
        this.keys = {
          descriptionTitle: 'Vaccination.Card.FullyVaccinatedPersons',
          info: 'Vaccination.VaccPersonsFull.Card.GroupRatio.Info',
          legendZero: 'Vaccination.VaccPersonsFull.Card.NoVaccinatedPersons',
        }
        break
    }
  }

  protected override prepareDescription({ geoUnit }: CurrentValues): string {
    const parts = [this.translator.get(this.keys.descriptionTitle), this.translator.get(`GeoFilter.${geoUnit}`)]
    const { start, end } = this.data.timeSpan
    if (start && end) {
      const f = (d: string) => formatUtcDate(parseIsoDate(d))
      parts.push(this.translator.get('Commons.DateToDate', { date1: f(start), date2: f(end) }))
    }
    return parts.join(', ')
  }

  protected prepareChartData({ cumulativeFilter, useGrpRangePopulation }: CurrentValues): ChartData | null {
    const values: TempValueEntry[] =
      this.data.gdiObject === GdiObject.VACC_PERSONS
        ? this.data.values.map((v) => [v, v[GdiSubset.VACC_PERSONS_FULL]])
        : this.data.values.map((v) => [v, v[GdiSubset.VACC_DOSES_ADMIN]])

    // we check for percentage since value is not set for CH/CHFL due to incomplete data (and we only show % values)
    if (!values.some(([_, e]) => isDefined(e[VaccinationIndicationRiskGroups.ALL][GdiVariant.PERCENTAGE]))) {
      return null
    }

    if (cumulativeFilter === VaccCumulativeFilter.WEEKLY) {
      const stackEntries = this.prepStackEntries(values)
      return {
        stackEntries,
        hasNullValues: stackEntries.some((e) => e.noData),
        hasZeroValues: stackEntries.some((e) => e.noCase),
      }
    } else {
      const areaEntries = this.prepAreaData(values, useGrpRangePopulation)
      const leftPadEntry: GroupRatioAreaEntry = {
        date: parseIsoDate(values[0][0].start),
        values: [],
        total: null,
        absValues: [],
        relValues: [],
        forceHideTooltip: true,
      }
      return {
        areaEntries: [leftPadEntry, ...areaEntries],
        hasZeroValues: false, // since cumulative --> never zero values
        hasNullValues: areaEntries.some((e) => !e.values.length),
      }
    }
  }

  /** prepares the weekly entries for the stack chart */
  private prepStackEntries(values: TempValueEntry[]): GroupRatioMatrixEntry[] {
    return values.map(([e, rec]) => {
      const riskGroups = rec[VaccinationIndicationRiskGroups.RISK_GROUPS]
      const other = rec[VaccinationIndicationGeneral.OTHER]
      const all = rec[VaccinationIndicationRiskGroups.ALL]

      // we should actually check `GdiVariant.VALUE` since this prop is the 'real' value.
      // but since this prop is not set for CH/CHFL (for as long not all cantons have detailedInfo) we check INZ
      const noData = [riskGroups, other, all].some((i) => !isDefined(i[GdiVariant.INZ]))
      const noCase = [riskGroups, other, all].every(
        (i) => isDefined(i[GdiVariant.INZ]) && i[GdiVariant.PERCENTAGE] === null,
      )

      const start = parseIsoDate(e.start)
      const end = parseIsoDate(e.end)
      return {
        key: start,
        start,
        end,
        total: all[GdiVariant.VALUE],
        label: formatUtcDate(start),
        labelLast: formatUtcDate(end),
        noData, // in case of `noCase=true` and `noData=true` --> noData wins
        noCase,
        buckets: [
          {
            value: riskGroups[GdiVariant.PERCENTAGE] || 0,
            refValue: riskGroups[GdiVariant.VALUE],
            bucketName: VaccinationIndicationRiskGroups.RISK_GROUPS,
          },
          {
            value: other[GdiVariant.PERCENTAGE] || 0,
            refValue: other[GdiVariant.VALUE],
            bucketName: VaccinationIndicationGeneral.OTHER,
          },
        ],
      }
    })
  }

  /** prepares the cumulative entries for the area chart */
  private prepAreaData(values: TempValueEntry[], useGrpRangePopulation: boolean): GroupRatioAreaEntry[] {
    return values.map(([e, rec]): GroupRatioAreaEntry => {
      const riskGroups = rec[VaccinationIndicationRiskGroups.RISK_GROUPS]
      const all = rec[VaccinationIndicationRiskGroups.ALL]
      const other = rec[VaccinationIndicationGeneral.OTHER]
      const notVacced = rec[VaccinationIndicationRiskGroups.NOT_VACCINATED]

      // we should actually check `GdiVariant.TOTAL` since this prop is the 'real' value.
      // but since this prop is not set for CH/CHFL (for as long not all cantons have detailedInfo) we check INZ
      const noData = [riskGroups, other, all].some((i) => !isDefined(i[GdiVariant.INZ]))
      const date = parseIsoDate(e.end)
      if (noData) {
        return { date, values: [], relValues: [], absValues: [], total: null }
      }
      const absValues = [other[GdiVariant.TOTAL], riskGroups[GdiVariant.TOTAL], notVacced[GdiVariant.TOTAL]]
      if (useGrpRangePopulation) {
        return {
          date,
          values: [other[GdiVariant.PERCENTAGE_POPULATION_TOTAL], all[GdiVariant.PERCENTAGE_POPULATION_TOTAL], 100],
          relValues: [
            other[GdiVariant.PERCENTAGE_POPULATION_TOTAL],
            riskGroups[GdiVariant.PERCENTAGE_POPULATION_TOTAL],
            notVacced[GdiVariant.PERCENTAGE_POPULATION_TOTAL],
          ],
          absValues,
          total: null,
        }
      } else {
        return {
          date,
          values: [
            other[GdiVariant.PERCENTAGE_TOTAL] || 0, // null if no one was vaccinated
            all[GdiVariant.PERCENTAGE_TOTAL] || 0, // should always be 100%; except no one was vaccinated (then null)
          ],
          relValues: [other[GdiVariant.PERCENTAGE_TOTAL], riskGroups[GdiVariant.PERCENTAGE_TOTAL]],
          absValues,
          total: all[GdiVariant.TOTAL],
        }
      }
    })
  }

  private dateRangeLabel(startDate: Date, endDate: Date): string {
    return this.translator.get('Commons.DateToDate', {
      date1: formatUtcDate(startDate),
      date2: formatUtcDate(endDate),
    })
  }
}
