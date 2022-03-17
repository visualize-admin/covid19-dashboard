import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import {
  CovidVirusVariantsOverviewCardV4,
  GdiObject,
  GdiVariant,
  isDefined,
  VirusVariantsWgsDevelopmentEntry,
} from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HistogramPreviewLinesEntry } from '../../diagrams/histogram/histogram-preview/histogram-preview-lines.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_PER_VIRUS_VARIANTS } from '../../shared/commons/colors.const'
import { KeyValueListEntries, KeyValueListEntry } from '../../shared/components/key-value-list/key-value-list.component'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseCardOverviewComponent, CurrentValuesOverview } from '../base-card-overview.component'

export interface HistogramData {
  entries: HistogramPreviewLinesEntry[]
  colors: string[]
}

@Component({
  selector: 'bag-card-overview-virus-variants',
  templateUrl: './card-overview-virus-variants.component.html',
  styleUrls: ['./card-overview-virus-variants.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BaseCardOverviewComponent, useExisting: CardOverviewVirusVariantsComponent }],
})
export class CardOverviewVirusVariantsComponent extends BaseCardOverviewComponent<CovidVirusVariantsOverviewCardV4> {
  readonly gdiObject = GdiObject.VIRUS_VARIANTS
  readonly cardBaseContext = 'OverviewCardVirusVariant'
  readonly moreLink = [
    '/',
    this.lang,
    RoutePaths.DASHBOARD_EPIDEMIOLOGIC,
    RoutePaths.DASHBOARD_EPIDEMIOLOGIC_VIRUS_VARIANTS,
  ]

  readonly histogram$: Observable<HistogramData> = this.currentValues$.pipe(map(this.prepareHistogramData.bind(this)))

  readonly valFmt = (val: number) => `${val}%`

  protected override initKeyValueListData({
    timeFilter,
    timeFrame,
  }: CurrentValuesOverview<VirusVariantsWgsDevelopmentEntry[]>): KeyValueListEntries {
    return this.data.variantControls.default
      .map((gdiSubset): KeyValueListEntry | null => {
        const values = this.data.dailyValues[gdiSubset]
        return values
          ? {
              key: this.translator.get(`VirusVariants.${gdiSubset}.Label`),
              keyDescription:
                values.date7dMean === ''
                  ? undefined
                  : this.translator.get('Commons.Mean7dFromDate', {
                      date: formatUtcDate(parseIsoDate(values.date7dMean)),
                    }),
              info: this.translator.tryGet(`IndicatorsDescription.OverviewCardVirusVariant.${gdiSubset}`),
              value: adminFormatNum(values[GdiVariant.PERCENTAGE_ROLLMEAN_7D], 1, '%'),
              // the first n items get a color
              colorCode: COLOR_PER_VIRUS_VARIANTS[gdiSubset],
            }
          : null
      })
      .filter((v): v is KeyValueListEntry => !!v)
  }

  protected prepareHistogramData({
    timelineData,
    timeFrame,
  }: CurrentValuesOverview<VirusVariantsWgsDevelopmentEntry[]>): HistogramData {
    const emptyData: HistogramPreviewLinesEntry[] = [
      { date: parseIsoDate(timeFrame.start), values: [] },
      { date: parseIsoDate(timeFrame.end), values: [] },
    ]

    if (!timelineData?.length) {
      return { entries: emptyData, colors: [] }
    }

    // we leftPad/rightPad timeline entries with values=[] to match the timeSpan
    const [startPadEntries, endPadEntries] = this.getPadEntries(timeFrame, timelineData)

    const availableVariantsOfConcern = this.data.variantControls.default.filter((v) =>
      timelineData.some((e) => isDefined(e[v])),
    )

    const dataEntries: HistogramPreviewLinesEntry[] = timelineData.map(
      (e: VirusVariantsWgsDevelopmentEntry): HistogramPreviewLinesEntry => ({
        date: parseIsoDate(e.date),
        values: availableVariantsOfConcern.map((variant) =>
          e[variant] ? e[variant][GdiVariant.PERCENTAGE_ROLLMEAN_7D] : null,
        ),
      }),
    )

    if (dataEntries.every((e) => e.values.every((v) => v === null))) {
      return { entries: emptyData, colors: [] }
    }

    return {
      entries: [...startPadEntries, ...dataEntries, ...endPadEntries],
      colors: availableVariantsOfConcern.map((v) => COLOR_PER_VIRUS_VARIANTS[v]),
    }
  }
}
