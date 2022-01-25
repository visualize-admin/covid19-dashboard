import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { InternationalComparisonDetailData } from '@c19/commons'
import { QueryParams } from '../../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../../route-data-key.enum'

@Component({
  selector: 'bag-share-international-case-development',
  templateUrl: './share-international-case-development.component.html',
  styleUrls: ['./share-international-case-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareInternationalCaseDevelopmentComponent {
  readonly data: InternationalComparisonDetailData | null = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
  readonly isExport = this.route.snapshot.queryParams[QueryParams.IS_EXPORT] === 'true'
  constructor(protected readonly route: ActivatedRoute) {}
}
