import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { EpidemiologicOverviewCardV3, GdiObject } from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HistogramPreviewEntry } from '../../diagrams/histogram/histogram-preview/histogram-preview.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { parseIsoDate } from '../../static-utils/date-utils'
import { BaseCardOverviewComponent } from '../base-card-overview.component'

@Component({
  selector: 'bag-card-overview-case',
  templateUrl: './card-overview-case.component.html',
  styleUrls: ['./card-overview-case.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BaseCardOverviewComponent, useExisting: CardOverviewCaseComponent }],
})
export class CardOverviewCaseComponent extends BaseCardOverviewComponent<EpidemiologicOverviewCardV3> {
  readonly gdiObject = GdiObject.CASE
  readonly cardBaseContext = 'OverviewCardCase'
  readonly moreLink = ['/', this.lang, RoutePaths.DASHBOARD_EPIDEMIOLOGIC, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_CASE]

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
