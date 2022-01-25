import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { WeeklySituationReportDevelopmentCard } from '@c19/commons'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { BaseShareWeeklyReportResolver } from '../base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportDevelopmentResolver extends BaseShareWeeklyReportResolver<
  WeeklyReportDataPair<WeeklySituationReportDevelopmentCard>
> {
  async resolve(route: ActivatedRouteSnapshot): Promise<WeeklyReportDataPair<WeeklySituationReportDevelopmentCard>> {
    return this.dataService.loadWeeklyReportDevelopmentData().then((res) => {
      return {
        curr: res,
        prev: res,
      }
    })
  }
}
