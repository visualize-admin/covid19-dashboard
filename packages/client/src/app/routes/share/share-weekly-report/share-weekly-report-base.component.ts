import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BaseWeeklyReportCardComponent } from '../../../cards-weekly-report/base-weekly-report-card.component'
import { WeeklyReportDataPair } from '../../../core/data/data.service'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({ template: '' })
export abstract class ShareWeeklyReportBaseComponent<T> {
  readonly data: WeeklyReportDataPair<T> = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
  readonly isExport = this.route.snapshot.queryParams[QueryParams.IS_EXPORT] === 'true'

  readonly facet: BaseWeeklyReportCardComponent<any>['facet'] = this.isExport ? 'print' : null
  readonly hideInfo = this.route.snapshot.queryParams[QueryParams.HIDE_INFO] === 'true'

  constructor(protected readonly route: ActivatedRoute) {}
}
