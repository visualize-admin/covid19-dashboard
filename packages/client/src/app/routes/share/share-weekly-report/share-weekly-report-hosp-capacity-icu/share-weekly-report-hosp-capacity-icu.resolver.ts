import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { WeeklyReportHospCapacityDataCard } from '@c19/commons'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { BaseShareWeeklyReportResolver } from '../base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportHospCapacityIcuResolver extends BaseShareWeeklyReportResolver<
  WeeklyReportDataPair<WeeklyReportHospCapacityDataCard>
> {
  async resolve(route: ActivatedRouteSnapshot): Promise<WeeklyReportDataPair<WeeklyReportHospCapacityDataCard>> {
    return this.dataService.loadWeeklyReportHospCapacityIcuData(await this.getReportItem(route))
  }
}
