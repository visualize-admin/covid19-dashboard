import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { CovidReOverviewCardV3, GdiObject, isDefined, TopLevelGeoUnit } from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TextArgs } from '../../core/i18n/translator.service'
import { HistogramPreviewReEntry } from '../../diagrams/histogram/histogram-preview/histogram-preview-re.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { KeyValueListEntries } from '../../shared/components/key-value-list/key-value-list.component'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseCardOverviewComponent, CurrentValuesOverview } from '../base-card-overview.component'

@Component({
  selector: 'bag-card-overview-repro',
  templateUrl: './card-overview-repro.component.html',
  styleUrls: ['./card-overview-repro.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BaseCardOverviewComponent, useExisting: CardOverviewReproComponent }],
})
export class CardOverviewReproComponent extends BaseCardOverviewComponent<CovidReOverviewCardV3> {
  readonly gdiObject = GdiObject.RE
  readonly cardBaseContext = 'OverviewCardRepro'
  readonly moreLink = ['/', this.lang, RoutePaths.DASHBOARD_EPIDEMIOLOGIC, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_REPRO]
  readonly moreLinkQueryParams = { [QueryParams.GEO_FILTER]: TopLevelGeoUnit.CH }

  readonly histogram$: Observable<HistogramPreviewReEntry[] | null> = this.currentValues$.pipe(
    map(({ timelineData }) => {
      return timelineData.map(({ date, median_r_mean, median_r_high, median_r_low }) => ({
        date: parseIsoDate(date),
        value: median_r_mean,
        band:
          isDefined(median_r_high) && isDefined(median_r_low) ? { upper: median_r_high, lower: median_r_low } : null,
      }))
    }),
  )

  protected override initKeyValueListData({ timeFilter, timeFrame }: CurrentValuesOverview): KeyValueListEntries {
    const val = this.data.dailyValues.median_r_mean
    const valRollmean = this.data.dailyValues.median_r_mean_rollmean7d
    const args: TextArgs = { date: formatUtcDate(new Date(this.data.dailyValues.date)) }

    return [
      isDefined(val)
        ? {
            key: this.translator.get('OverviewCardRepro.Table.Value.Label', args),
            value: adminFormatNum(val, 2),
            info: this.translator.get('IndicatorsDescription.OverviewCardRepro.Value'),
          }
        : null,
      isDefined(valRollmean)
        ? {
            key: this.translator.get('OverviewCardRepro.Table.Rollmean.Label', args),
            value: adminFormatNum(valRollmean, 2),
            info: this.translator.get('IndicatorsDescription.OverviewCardRepro.Rollmean'),
          }
        : null,
    ].filter(isDefined)
  }
}
