import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  CovidCtOverviewCardV3,
  EpidemiologicOverviewCardV3,
  EpidemiologicTestOverviewCardV3,
  GdiObject,
  GdiSubset,
  GdiVariant,
  InlineValues,
  Language,
  OverviewDataV4,
  PublicDataContext,
  TimeSpan,
} from '@c19/commons'
import { addDays } from 'date-fns'
import { CURRENT_LANG } from '../../../core/i18n/language.token'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { HistogramPreviewEntry } from '../../../diagrams/histogram/histogram-preview/histogram-preview.component'
import {
  COLOR_SUM_ANTIGEN,
  COLOR_SUM_PCR,
  COLORS_HISTOGRAM_DEFAULT,
  COLORS_HISTOGRAM_TEST,
} from '../../../shared/commons/colors.const'
import {
  KeyValueListEntries,
  KeyValueListEntry,
} from '../../../shared/components/key-value-list/key-value-list.component'
import { TimeSlotFilter, timeSlotFilterTimeFrameKey } from '../../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { postfixGdiPercent } from '../../../static-utils/daily-data-to-key-value-entries.function'
import { getTimeslotCorrespondingValues } from '../../../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../../../static-utils/date-utils'
import { timeframeGdiVariantMapping } from '../../../static-utils/timeframe-gdi-variant-mapping.const'
import { RouteDataKey } from '../../route-data-key.enum'

interface CaseAndTestDataForView {
  sourceDateTransArg: Record<string, string>
  histogramData: HistogramPreviewEntry[]
  histogramBarColors: [string, string]
  deltaDayEntry: KeyValueListEntry | null
  entries: KeyValueListEntries
}

interface DataPerTopicForView {
  topicTitleKey: string
  warnKey: string | null
  dataTotal: CaseAndTestDataForView
  dataSecondary: CaseAndTestDataForView
}

interface CtDataForView {
  sourceDateTransArg: Record<string, string>
  infoKey: string
  infoTransArg: { count: number }
  entries: KeyValueListEntries
}

interface ReportDataForView {
  addOnText: string | null
  topics: DataPerTopicForView[]
  covidCt: CtDataForView
}

@Component({
  selector: 'bag-export-daily-report',
  templateUrl: './export-daily-report.component.html',
  styleUrls: ['./export-daily-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportDailyReportComponent {
  readonly last4weeks: boolean
  readonly timeFilter: TimeSlotFilter
  readonly overviewCardsData: OverviewDataV4
  readonly contextData: PublicDataContext

  data: ReportDataForView
  readonly introArg: Record<string, string>

  constructor(
    routeute: ActivatedRoute,
    @Inject(CURRENT_LANG) readonly lang: Language,
    @Inject(LOCALE_ID) protected readonly locale: string,
    private readonly translator: TranslatorService,
  ) {
    this.timeFilter = routeute.snapshot.queryParams[QueryParams.TIME_FILTER] || TimeSlotFilter.LAST_4_WEEKS
    this.last4weeks = this.timeFilter === TimeSlotFilter.LAST_4_WEEKS
    this.overviewCardsData = routeute.snapshot.data[RouteDataKey.OVERVIEW_DATA]
    this.contextData = routeute.snapshot.data[RouteDataKey.CONTEXT_DATA]

    this.introArg = this.sourceDateTransArg(new Date(this.overviewCardsData.dailyReport.sourceDate))
    this.initDataForView()
  }

  private initDataForView() {
    const topicKeys = ['covidCase', 'covidHosp', 'covidDeath', 'covidTest'] as const

    const topics: DataPerTopicForView[] = topicKeys.map((topic) => {
      const baseKeyContext = `OverviewCard${topic.split('covid')[1]}`
      const sourceStateIsoDate = formatUtcDate(new Date(this.contextData.sourceDate), `yyyyMMdd`)
      const stateDependantWarnKey = `${baseKeyContext}.Warning.${sourceStateIsoDate}`
      const defaultWarnKey = `${baseKeyContext}.Warning`
      const hiddenWarnKey = `${baseKeyContext}.HiddenWarning`
      const warnKey = this.translator.tryGet(stateDependantWarnKey)
        ? stateDependantWarnKey
        : this.translator.tryGet(defaultWarnKey)
        ? defaultWarnKey
        : this.translator.tryGet(hiddenWarnKey)
        ? hiddenWarnKey
        : null

      return {
        topicTitleKey: `${baseKeyContext}.Title`,
        warnKey,
        dataTotal: this.caseAndTestDataForView(this.overviewCardsData[topic], TimeSlotFilter.TOTAL),
        dataSecondary: this.caseAndTestDataForView(this.overviewCardsData[topic], this.timeFilter),
      }
    })

    this.data = {
      addOnText: this.overviewCardsData.dailyReport.optionalText[this.lang],
      topics,
      covidCt: this.ctDataForView(this.overviewCardsData.covidCt),
    }
  }

  private caseAndTestDataForView(
    data: EpidemiologicOverviewCardV3 | EpidemiologicTestOverviewCardV3,
    timeFilter: TimeSlotFilter,
  ): CaseAndTestDataForView {
    const timeSpan = data.timeframes[timeSlotFilterTimeFrameKey[timeFilter]]
    const sourceDate = new Date(data.sourceDate)
    const keyArgs = {
      date: formatUtcDate(parseIsoDate(timeSpan.start)),
      deltaDay: formatUtcDate(addDays(sourceDate, -(data.deltaDay || 1)), 'EEEE', this.locale),
    }

    // delta day entry
    const deltaDayEntry =
      data.gdiObject !== GdiObject.TEST
        ? this.createDeltaDayEntry(data.deltaDayMode, data.deltaDay, data.dailyValues, keyArgs)
        : this.createDeltaDayEntry(data.deltaDayMode, data.deltaDay, data.dailyValues[GdiSubset.TEST_ALL], keyArgs)

    const entries: KeyValueListEntry[] = []
    let histogramBarColors: [string, string] = COLORS_HISTOGRAM_DEFAULT

    // sum entry for non test
    if (data.gdiObject !== GdiObject.TEST) {
      entries.push(
        this.createKeyValueListEntry(
          data.dailyValues,
          timeframeGdiVariantMapping[timeFilter].sum,
          'OverviewCard.Table.Sum.Label',
          keyArgs,
        ),
      )
    } else {
      // special entries for TEST
      histogramBarColors = COLORS_HISTOGRAM_TEST
      entries.push(
        this.createKeyValueListEntry(
          data.dailyValues[GdiSubset.TEST_ALL],
          timeframeGdiVariantMapping[timeFilter].sum,
          'OverviewCard.Table.Sum.Label',
          keyArgs,
          {
            combineBelow: true,
          },
        ),
        this.createKeyValueListEntry(
          data.dailyValues[GdiSubset.TEST_PCR],
          timeframeGdiVariantMapping[timeFilter].sum,
          'OverviewCardTest.Table.SumPcr.Label',
          keyArgs,
          {
            colorCode: COLOR_SUM_PCR,
            combineAbove: true,
            combineBelow: true,
          },
        ),
        this.createKeyValueListEntry(
          data.dailyValues[GdiSubset.TEST_ANTIGEN],
          timeframeGdiVariantMapping[timeFilter].sum,
          'OverviewCardTest.Table.SumAntigen.Label',
          keyArgs,
          {
            colorCode: COLOR_SUM_ANTIGEN,
            combineAbove: true,
          },
        ),
      )
    }

    // inz entry
    if (data.gdiObject !== GdiObject.TEST) {
      entries.push(
        this.createKeyValueListEntry(
          data.dailyValues,
          timeframeGdiVariantMapping[timeFilter].inz,
          'OverviewCard.Table.Inz.Label',
          keyArgs,
        ),
      )
    } else {
      entries.push(
        this.createKeyValueListEntry(
          data.dailyValues[GdiSubset.TEST_ALL],
          timeframeGdiVariantMapping[timeFilter].inz,
          'OverviewCard.Table.Inz.Label',
          keyArgs,
          {
            keyDescription: this.translator.get('OverviewCardTest.Table.Inz.Desc'),
          },
        ),
      )
    }

    // special entries for TEST
    if (data.gdiObject === GdiObject.TEST) {
      // pos test entries
      entries.push(
        this.createKeyValueListEntry(
          data.dailyValues[GdiSubset.TEST_PCR],
          timeframeGdiVariantMapping[timeFilter].prctPos,
          'OverviewCardTest.Table.PosPercentPcr.Label',
          keyArgs,
          { combineBelow: true },
        ),
        this.createKeyValueListEntry(
          data.dailyValues[GdiSubset.TEST_ANTIGEN],
          timeframeGdiVariantMapping[timeFilter].prctPos,
          'OverviewCardTest.Table.PosPercentAntigen.Label',
          keyArgs,
          { combineAbove: true },
        ),
      )
    }

    return {
      sourceDateTransArg: this.sourceDateTransArg(sourceDate),
      histogramData: this.createHistogramEntries(timeSpan, data),
      histogramBarColors,
      deltaDayEntry,
      entries,
    }
  }

  private createHistogramEntries(
    timeSpan: TimeSpan,
    data: EpidemiologicOverviewCardV3 | EpidemiologicTestOverviewCardV3,
  ) {
    if (data.gdiObject === GdiObject.TEST) {
      return getTimeslotCorrespondingValues(data.timelineData, timeSpan).map((i) => ({
        date: parseIsoDate(i.date),
        barValues: [i[GdiSubset.TEST_PCR].value, i[GdiSubset.TEST_ANTIGEN].value],
        lineValues: [i[GdiSubset.TEST_ALL].rollmean7d],
      }))
    } else {
      return getTimeslotCorrespondingValues(data.timelineData, timeSpan).map((i) => ({
        date: parseIsoDate(i.date),
        barValues: [i.valuePrevious, i.valueNewlyReported],
        lineValues: [i.rollmean7d],
      }))
    }
  }

  private ctDataForView(data: CovidCtOverviewCardV3): CtDataForView {
    const sourceDate = new Date(data.sourceDate)
    const keyArgs = {
      date: formatUtcDate(parseIsoDate(data.timeframes.tfTot.end)),
    }

    const entries: Array<KeyValueListEntry | null> = [
      this.createKeyValueListEntry(
        data.dailyValues,
        GdiVariant.VALUE_CT_ISO,
        'OverviewCardCT.Table.Isolation.Label',
        keyArgs,
        { keyDescription: this.translator.get('OverviewCardCT.Table.Isolation.Desc') },
      ),
      this.createKeyValueListEntry(
        data.dailyValues,
        GdiVariant.VALUE_CT_QUA,
        'OverviewCardCT.Table.Quarantine.Label',
        keyArgs,
        { keyDescription: this.translator.get('OverviewCardCT.Table.Quarantine.Desc') },
      ),
      this.createKeyValueListEntry(
        data.dailyValues,
        GdiVariant.VALUE_CT_ENTRY,
        'OverviewCardCT.Table.EntryQuarantine.Label',
        keyArgs,
        { keyDescription: this.translator.get('OverviewCardCT.Table.EntryQuarantine.Desc') },
      ),
    ]

    return {
      sourceDateTransArg: this.sourceDateTransArg(sourceDate),
      infoKey: 'OverviewCardCT.CardHint',
      infoTransArg: { count: data.reportingCantons },
      entries: <KeyValueListEntries>entries.filter((e) => e !== null),
    }
  }

  private sourceDateTransArg(date: Date): Record<string, string> {
    return date
      ? {
          date: formatUtcDate(date),
          timeHH: formatUtcDate(date, 'HH'),
          timeMM: formatUtcDate(date, 'mm'),
        }
      : {}
  }

  private createDeltaDayEntry(
    deltaDayMode: 'full' | 'recent',
    deltaDay: number | null,
    dailyValues: InlineValues<any>,
    keyArgs?: Record<string, string | number>,
    opts?: Partial<KeyValueListEntry>,
  ) {
    let key: string
    const recent = deltaDayMode === 'recent'
    if (recent) {
      key = deltaDay === 1 ? 'OverviewCard.Table.DeltaDayRecent.Label' : 'OverviewCard.Table.DeltaDayRecentX.Label'
    } else {
      key = deltaDay === 1 ? 'OverviewCard.Table.DeltaDay.Label' : 'OverviewCard.Table.DeltaDayX.Label'
    }
    return {
      key: this.translator.get(key, keyArgs),
      value: adminFormatNum(dailyValues[GdiVariant.DELTA_DAY]),
      ...opts,
    }
  }

  private createKeyValueListEntry(
    dailyValues: InlineValues<any>,
    variant: GdiVariant,
    key: string,
    keyArgs?: Record<string, string | number>,
    opts: Partial<KeyValueListEntry> = {},
  ): KeyValueListEntry {
    return {
      key: this.translator.get(key, keyArgs),
      value: adminFormatNum(dailyValues[variant]) + postfixGdiPercent(variant),
      ...opts,
    }
  }
}
