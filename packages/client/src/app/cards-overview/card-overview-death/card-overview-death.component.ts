import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { EpidemiologicOverviewCardV3, GdiObject } from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HistogramPreviewEntry } from '../../diagrams/histogram/histogram-preview/histogram-preview.component'
import { RouteFragment } from '../../routes/route-fragment.enum'
import { RoutePaths } from '../../routes/route-paths.enum'
import { IndicatorFilter } from '../../shared/models/filters/indicator-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { parseIsoDate } from '../../static-utils/date-utils'
import { BaseCardOverviewComponent } from '../base-card-overview.component'

@Component({
  selector: 'bag-card-overview-death',
  templateUrl: './card-overview-death.component.html',
  styleUrls: ['./card-overview-death.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BaseCardOverviewComponent, useExisting: CardOverviewDeathComponent }],
})
export class CardOverviewDeathComponent extends BaseCardOverviewComponent<EpidemiologicOverviewCardV3> {
  readonly gdiObject = GdiObject.DEATH
  readonly cardBaseContext = 'OverviewCardDeath'
  readonly moreLink = ['/', this.lang, RoutePaths.DASHBOARD_EPIDEMIOLOGIC, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_DEATH]
  readonly RouteFragment = RouteFragment
  readonly breakthroughLink = [
    '/',
    this.lang,
    RoutePaths.DASHBOARD_VACCINATION,
    RoutePaths.DASHBOARD_VACCINATION_STATUS,
  ]
  readonly breakthroughLinkQueryParams = { [QueryParams.INDICATOR]: IndicatorFilter.DEATH }

  histogram$: Observable<HistogramPreviewEntry[]> = this.currentValues$.pipe(
    map(({ timelineData }) => {
      return timelineData.map((i) => ({
        date: parseIsoDate(i.date),
        barValues: [i.valuePrevious, i.valueNewlyReported],
        lineValues: [i.rollmean7d],
      }))
    }),
  )
}
