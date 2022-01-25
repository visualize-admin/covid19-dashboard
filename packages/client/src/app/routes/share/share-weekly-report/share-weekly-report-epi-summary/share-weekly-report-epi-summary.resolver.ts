import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { WeeklyReportEpidemiologicSummaryCard } from '@c19/commons'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { BaseShareWeeklyReportResolver } from '../base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportEpiSummaryResolver extends BaseShareWeeklyReportResolver<
  WeeklyReportDataPair<WeeklyReportEpidemiologicSummaryCard>
> {
  async resolve(route: ActivatedRouteSnapshot): Promise<WeeklyReportDataPair<WeeklyReportEpidemiologicSummaryCard>> {
    return this.dataService.loadWeeklyReportEpidemiologicSummaryData(
      this.getSimpleGdi(route),
      await this.getReportItem(route),
    )
  }
}
