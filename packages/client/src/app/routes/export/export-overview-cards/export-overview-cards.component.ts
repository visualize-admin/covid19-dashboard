import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { OverviewDataObjectKeys, OverviewDataV4 } from '@c19/commons'
import { PathParams } from '../../../shared/models/path-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({
  selector: 'bag-export-overview-cards',
  templateUrl: './export-overview-cards.component.html',
  styleUrls: ['./export-overview-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportOverviewCardsComponent {
  readonly data: OverviewDataV4 = this.route.snapshot.data[RouteDataKey.OVERVIEW_DATA]
  readonly cardType: OverviewDataObjectKeys = this.route.snapshot.params[PathParams.CARD_TYPE]
  constructor(private readonly route: ActivatedRoute) {}
}
