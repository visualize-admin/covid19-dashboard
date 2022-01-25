import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { WeeklySituationReportSummaryCard } from '@c19/commons'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { BaseShareWeeklyReportResolver } from '../base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportSummaryResolver extends BaseShareWeeklyReportResolver<
  WeeklyReportDataPair<WeeklySituationReportSummaryCard>
> {
  async resolve(route: ActivatedRouteSnapshot): Promise<WeeklyReportDataPair<WeeklySituationReportSummaryCard>> {
    return this.dataService.loadWeeklyReportSummaryData(await this.getReportItem(route))
  }
}
