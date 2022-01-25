import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { WeeklyReportHospCapacitySummaryCard } from '@c19/commons'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { BaseShareWeeklyReportResolver } from '../base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportHospCapacityIcuSummaryResolver extends BaseShareWeeklyReportResolver<
  WeeklyReportDataPair<WeeklyReportHospCapacitySummaryCard>
> {
  async resolve(route: ActivatedRouteSnapshot): Promise<WeeklyReportDataPair<WeeklyReportHospCapacitySummaryCard>> {
    return this.dataService.loadWeeklyReportHospCapacityIcuSummary(await this.getReportItem(route))
  }
}
