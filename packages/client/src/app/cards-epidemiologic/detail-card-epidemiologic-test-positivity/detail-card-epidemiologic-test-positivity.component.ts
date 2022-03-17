import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import {
  EpidemiologicTestDevelopmentData,
  EpidemiologicTestDevValuesDEF,
  EpidemiologicTestDevValuesOPT,
  EpiTimelineEntry,
  HistogramDataValuesTest,
  HistogramDetailCard,
  isDefined,
} from '@c19/commons'
import { Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_SUM_ANTIGEN, COLOR_SUM_PCR } from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { timeSlotFilterTimeFrameKey } from '../../shared/models/filters/time-slot-filter.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { getTimeslotCorrespondingValues } from '../../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseDetailEpidemiologicCardComponent, CurrentValuesBase } from '../base-detail-epidemiologic-card.component'

export type TestPositivityDetailCardData = HistogramDetailCard<HistogramDataValuesTest>

interface CurrentTestPositivityValues extends CurrentValuesBase {
  values: EpiTimelineEntry<EpidemiologicTestDevValuesDEF, EpidemiologicTestDevValuesOPT>[]
}

interface HistogramData {
  data: HistogramLineEntry[]
  hasNoData: boolean
}

@Component({
  selector: 'bag-detail-card-epidemiologic-test-positivity',
  templateUrl: './detail-card-epidemiologic-test-positivity.component.html',
  styleUrls: ['./detail-card-epidemiologic-test-positivity.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardEpidemiologicTestPositivityComponent extends BaseDetailEpidemiologicCardComponent<EpidemiologicTestDevelopmentData> {
  readonly cardDetailPath = RoutePaths.SHARE_TEST_POSITIVITY

  readonly currentValues$: Observable<CurrentTestPositivityValues> = this.timeFilter$.pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([timeFilter, geoUnit]): CurrentTestPositivityValues => {
      const timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeFilter]]
      return {
        geoUnit,
        timeFilter,
        timeFrame,
        values: getTimeslotCorrespondingValues(this.data.values, timeFrame),
      }
    }),
    shareReplay(1),
  )

  readonly cumulativeData$ = this.currentValues$.pipe(map(this.prepareCumulativeData.bind(this)))

  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  initCard() {
    this.titleKey = `DetailCardDevelopment.Title.DetailTest.PositivityRate`
    this.infoKey = `DetailCardTestPositivity.InfoText.Test.PositivityRate`
    this.topicKey = `DetailTest.Title.PositivityRate`
  }

  showTooltip({ source, data }: HistogramElFocusEvent<HistogramLineEntry>) {
    const [v0, v1] = data.values
    const values: TooltipListContentEntry[] = []
    if (isDefined(v0)) {
      values.push({
        label: this.translator.get('DetailTest.Development.Tooltip.PCR.Abbr'),
        value: adminFormatNum(v0, 2, '%'),
        color: COLOR_SUM_PCR,
      })
    }
    if (isDefined(v1)) {
      values.push({
        label: this.translator.get('DetailTest.Development.Tooltip.ANTIGEN.Abbr'),
        value: adminFormatNum(v1, 2, '%'),
        color: COLOR_SUM_ANTIGEN,
      })
    }
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      noData: !isDefined(v0),
      entries: values,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  readonly valFmt = (val: number) => `${val}%`

  private prepareCumulativeData({ values }: CurrentTestPositivityValues): HistogramData {
    const dataEntries = values.map((entry) => {
      return {
        date: parseIsoDate(entry.date),
        values: [entry.percentage_posTest_pcr, entry.percentage_posTest_antigen],
      }
    })
    return {
      data: dataEntries,
      hasNoData: dataEntries.some((v) => !v.values.some(isDefined)),
    }
  }

  private prepareDescription(cv: CurrentTestPositivityValues): string {
    const [date1, date2] = [cv.timeFrame.start, cv.timeFrame.end].map((d) => formatUtcDate(parseIsoDate(d)))
    const parts = [
      this.translator.get(this.topicKey),
      this.translator.get(`GeoFilter.${cv.geoUnit}`),
      this.translator.get('Commons.DateToDate', { date1, date2 }),
    ]
    return parts.map((part) => `<span>${part}</span>`).join(', ')
  }
}
