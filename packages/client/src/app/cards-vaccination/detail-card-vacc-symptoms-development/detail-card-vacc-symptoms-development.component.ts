import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { EpidemiologicVaccSymptomsDevelopmentData, GdiSubset, GeoUnit, VaccinationVaccineSymptoms } from '@c19/commons'
import { addDays, differenceInDays } from 'date-fns'
import { combineLatest, Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { HistogramAreaEntry } from '../../diagrams/histogram/histogram-area/histogram-area.component'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_VACC_MEAN_7D,
  COLOR_VACC_SYMPTOMS_ADMIN,
  COLOR_VACC_SYMPTOMS_NOT_SERIOUS,
  COLOR_VACC_SYMPTOMS_SERIOUS,
} from '../../shared/commons/colors.const'
import { Source } from '../../shared/components/detail-card/detail-card.component'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import {
  DEFAULT_VACC_SYMPTOMS_VACCINE_FILTER,
  getVaccSymptomsVaccineFilterOptions,
  VaccSymptomsVaccineFilter,
} from '../../shared/models/filters/vacc-symptoms-vaccine-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import {
  BaseDetailCardVaccinationComponent,
  CurrentValuesVaccinationBase,
} from '../base-detail-card-vaccination.component'

interface CurrentValues extends CurrentValuesVaccinationBase {
  vaccineFilter: VaccSymptomsVaccineFilter
}

interface AreaEntry extends HistogramAreaEntry {
  actualValues: (number | null)[]
  total: number | null
  admin: number | null
}

interface HistogramData {
  data: AreaEntry[]
  dataAdmin: HistogramLineEntry[] | null
  legendPairs: Array<[string, string]>
  hasNoData: boolean
  colors: string[]
  adminColors: string[]
  geoUnit: GeoUnit
}

@Component({
  selector: 'bag-detail-card-vacc-symptoms-development',
  templateUrl: './detail-card-vacc-symptoms-development.component.html',
  styleUrls: ['./detail-card-vacc-symptoms-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[attr.id]': `'${DOM_ID.VACC_DEVELOPMENT_CARD}'`,
  },
})
export class DetailCardVaccSymptomsDevelopmentComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccSymptomsDevelopmentData>
  implements OnInit
{
  readonly VACC_VACCINE_SYMPTOMS_MAP: Record<VaccSymptomsVaccineFilter, VaccinationVaccineSymptoms> = {
    [VaccSymptomsVaccineFilter.ALL]: VaccinationVaccineSymptoms.ALL,
    [VaccSymptomsVaccineFilter.UNKNOWN]: VaccinationVaccineSymptoms.UNKNOWN,
    [VaccSymptomsVaccineFilter.MODERNA]: VaccinationVaccineSymptoms.MODERNA,
    [VaccSymptomsVaccineFilter.PFIZER_BIONTECH]: VaccinationVaccineSymptoms.PFIZER_BIONTECH,
    [VaccSymptomsVaccineFilter.JOHNSON_JOHNSON]: VaccinationVaccineSymptoms.JOHNSON_JOHNSON,
  }

  readonly mean7dColor = COLOR_VACC_MEAN_7D

  readonly cardDetailPath = RoutePaths.SHARE_DEVELOPMENT

  readonly vaccineFilterOptions = getVaccSymptomsVaccineFilterOptions(DEFAULT_VACC_SYMPTOMS_VACCINE_FILTER)
  readonly vaccineFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.VACC_SYMPTOMS_VACCINE_FILTER] || null,
  )
  readonly vaccineFilter$: Observable<VaccSymptomsVaccineFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_SYMPTOMS_VACCINE_FILTER, DEFAULT_VACC_SYMPTOMS_VACCINE_FILTER),
    tap<VaccSymptomsVaccineFilter>(emitValToOwnViewFn(this.vaccineFilterCtrl, DEFAULT_VACC_SYMPTOMS_VACCINE_FILTER)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([this.vaccineFilter$]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[vaccineFilter], geoUnit]) => {
      return {
        geoUnit,
        vaccineFilter,
        timeSpan: this.data.timeSpan,
      }
    }),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
  readonly cumulativeData$ = this.currentValues$.pipe(map(this.prepareCumulativeData.bind(this)))

  @Input()
  hideResetBtn: boolean

  keys: Record<'info' | 'metaSymptoms' | 'metaAdministered', string>

  readonly yLabelFmt = (val: number) => `${val}%`

  get sources(): Source[] {
    return [
      {
        sourceKey: 'Commons.Source.Swissmedic',
        descKey: 'Vaccination.VaccSymptoms.Card.Development.SourceDesc.Symptoms',
        date: new Date(this.data.vaccSourceDates[GdiSubset.VACC_SYMPTOMS_ALL]),
      },
      {
        sourceKey: 'Commons.Source.BAG',
        descKey: 'Vaccination.Card.DosesAdministered',
        date: new Date(this.data.vaccSourceDates[GdiSubset.VACC_DOSES_ADMIN]),
      },
    ]
  }

  override ngOnInit() {
    super.ngOnInit()
    this.vaccineFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.VACC_SYMPTOMS_VACCINE_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  resetToVaccineAll() {
    updateQueryParamsFn(this.router)({
      [QueryParams.VACC_SYMPTOMS_VACCINE_FILTER]: DEFAULT_VACC_SYMPTOMS_VACCINE_FILTER,
    })
  }

  showAreaTooltip({ source, data }: HistogramElFocusEvent<AreaEntry>) {
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: [
        {
          color: COLOR_VACC_SYMPTOMS_NOT_SERIOUS,
          label: this.translator.get('Vaccination.VaccSymptoms.Card.Development.Tooltip.NotSerious'),
          value: adminFormatNum(data.actualValues[0]),
        },
        {
          color: COLOR_VACC_SYMPTOMS_SERIOUS,
          label: this.translator.get('Vaccination.VaccSymptoms.Card.Development.Tooltip.Serious'),
          value: adminFormatNum(data.actualValues[1]),
          borderBelow: true,
        },
        {
          label: this.translator.get('Vaccination.VaccSymptoms.Card.Development.Tooltip.All'),
          value: adminFormatNum(data.total),
          borderBelow: true,
        },
        {
          label: this.translator.get('Vaccination.VaccSymptoms.Card.Development.Tooltip.TotalAdministered'),
          value: adminFormatNum(data.admin),
        },
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  showTooltip({ source, data }: HistogramElFocusEvent<HistogramLineEntry>) {
    const [v0] = data.values

    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: [
        {
          label: this.translator.get('Vaccination.VaccSymptoms.Card.Development.Meta.Administered'),
          value: adminFormatNum(v0),
        },
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  protected init() {
    this.keys = {
      info: 'Vaccination.VaccSymptoms.Card.Development.InfoText',
      metaSymptoms: 'Vaccination.VaccSymptoms.Card.Development.Meta.Symptoms',
      metaAdministered: 'Vaccination.VaccSymptoms.Card.Development.Meta.Administered',
    }
  }

  private prepareCumulativeData(cv: CurrentValues): HistogramData | null {
    if (this.data.values.length === 0) {
      return null
    }
    const timeSpanStart = parseIsoDate(this.data.timeSpan.start)
    const vaccine = this.VACC_VACCINE_SYMPTOMS_MAP[cv.vaccineFilter]
    const dayDiff = differenceInDays(parseIsoDate(this.data.values[0].date), timeSpanStart)
    const startPadEntries: AreaEntry[] =
      dayDiff < 1
        ? []
        : new Array(dayDiff).fill(0).map((_, ix) => ({
            date: addDays(timeSpanStart, ix),
            values: [],
            total: null,
            admin: null,
            actualValues: [],
          }))
    const dataEntries: AreaEntry[] = this.data.values.map((e) => {
      const serious = e[GdiSubset.VACC_SYMPTOMS_SERIOUS][vaccine]
      const notSerious = e[GdiSubset.VACC_SYMPTOMS_NOT_SERIOUS][vaccine]
      const all = e[GdiSubset.VACC_SYMPTOMS_ALL][vaccine]
      const admin = e[GdiSubset.VACC_DOSES_ADMIN][vaccine]
      return {
        date: parseIsoDate(e.date),
        values: [serious.total, all.total],
        actualValues: [notSerious.total, serious.total],
        total: all.total,
        admin: admin.total,
      }
    })

    const startPadAdminEntries: HistogramLineEntry[] =
      dayDiff < 1
        ? []
        : new Array(dayDiff).fill(0).map((_, ix) => ({
            date: addDays(timeSpanStart, ix),
            values: [],
          }))
    const dataAdminEntries: HistogramLineEntry[] = this.data.values.map((e) => {
      const admin = e[GdiSubset.VACC_DOSES_ADMIN][vaccine]
      return {
        date: parseIsoDate(e.date),
        values: [admin.total],
      }
    })

    return {
      data: [...startPadEntries, ...dataEntries],
      dataAdmin: vaccine === VaccinationVaccineSymptoms.UNKNOWN ? null : [...startPadAdminEntries, ...dataAdminEntries],
      colors: [COLOR_VACC_SYMPTOMS_SERIOUS, COLOR_VACC_SYMPTOMS_NOT_SERIOUS],
      legendPairs: [
        [COLOR_VACC_SYMPTOMS_SERIOUS, 'Vaccination.VaccSymptoms.Card.Development.Serious'],
        [COLOR_VACC_SYMPTOMS_NOT_SERIOUS, 'Vaccination.VaccSymptoms.Card.Development.NotSerious'],
      ],
      adminColors: [COLOR_VACC_SYMPTOMS_ADMIN],
      geoUnit: cv.geoUnit,
      hasNoData: dataEntries.some((v) => v.total === null),
    }
  }
}
