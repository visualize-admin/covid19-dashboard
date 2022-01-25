import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { WeeklySitutationReportOverviewCard } from '@c19/commons'
import { BaseShareWeeklyReportResolver } from '../base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportOverviewResolver extends BaseShareWeeklyReportResolver<WeeklySitutationReportOverviewCard> {
  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    return this.dataService.loadWeeklyReportOverviewData(await this.getReportItem(route))
  }
}
