import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { EpidemiologicTestOverviewCardV3, GdiObject, GdiSubset } from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HistogramPreviewEntry } from '../../diagrams/histogram/histogram-preview/histogram-preview.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_SUM_ANTIGEN, COLOR_SUM_PCR, COLORS_HISTOGRAM_TEST } from '../../shared/commons/colors.const'
import { KeyValueListEntries } from '../../shared/components/key-value-list/key-value-list.component'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { parseIsoDate } from '../../static-utils/date-utils'
import { timeframeGdiVariantMapping } from '../../static-utils/timeframe-gdi-variant-mapping.const'
import { BaseCardOverviewComponent, CurrentValuesOverview } from '../base-card-overview.component'

@Component({
  selector: 'bag-card-overview-test',
  templateUrl: './card-overview-test.component.html',
  styleUrls: ['./card-overview-test.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BaseCardOverviewComponent, useExisting: CardOverviewTestComponent }],
})
export class CardOverviewTestComponent extends BaseCardOverviewComponent<EpidemiologicTestOverviewCardV3> {
  readonly gdiObject = GdiObject.TEST
  readonly cardBaseContext = 'OverviewCardTest'
  readonly moreLink = ['/', this.lang, RoutePaths.DASHBOARD_EPIDEMIOLOGIC, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_TEST]
  readonly barColors = COLORS_HISTOGRAM_TEST

  histogram$: Observable<HistogramPreviewEntry[]> = this.currentValues$.pipe(
    map(({ timelineData }) => {
      return timelineData.map((i) => ({
        date: parseIsoDate(i.date),
        barValues: [i[GdiSubset.TEST_PCR].value, i[GdiSubset.TEST_ANTIGEN].value],
        lineValues: [i[GdiSubset.TEST_ALL].rollmean7d],
      }))
    }),
  )

  protected override initKeyValueListData({ timeFilter }: CurrentValuesOverview): KeyValueListEntries {
    const dailyValuesAll = this.data.dailyValues[GdiSubset.TEST_ALL]
    const dailyValuesPcr = this.data.dailyValues[GdiSubset.TEST_PCR]
    const dailyValuesAtg = this.data.dailyValues[GdiSubset.TEST_ANTIGEN]
    return [
      this.createDeltaDayEntry({}, dailyValuesAll),
      this.createSumEntry(timeFilter, { combineBelow: true }, dailyValuesAll),
      {
        key: this.translator.get('OverviewCardTest.Table.SumPcr.Label'),
        value: adminFormatNum(dailyValuesPcr[timeframeGdiVariantMapping[timeFilter].sum]),
        combineBelow: true,
        combineAbove: true,
        colorCode: COLOR_SUM_PCR,
      },
      {
        key: this.translator.get('OverviewCardTest.Table.SumAntigen.Label'),
        value: adminFormatNum(dailyValuesAtg[timeframeGdiVariantMapping[timeFilter].sum]),
        combineAbove: true,
        colorCode: COLOR_SUM_ANTIGEN,
      },

      this.createInzEntry(
        timeFilter,
        { keyDescription: this.translator.get('OverviewCardTest.Table.Inz.Desc') },
        dailyValuesAll,
      ),
      {
        key: this.translator.get('OverviewCardTest.Table.PosPercentPcr.Label'),
        value: adminFormatNum(dailyValuesPcr[timeframeGdiVariantMapping[timeFilter].prctPos], 1, '%'),
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardTest.Table.PosPercentAntigen.Label'),
        value: adminFormatNum(dailyValuesAtg[timeframeGdiVariantMapping[timeFilter].prctPos], 1, '%'),
        combineAbove: true,
      },
    ]
  }
}
