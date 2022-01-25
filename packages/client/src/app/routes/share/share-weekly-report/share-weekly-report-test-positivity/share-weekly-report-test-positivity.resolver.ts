import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { WeeklyReportPositivityRateGeographyCard } from '@c19/commons'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { BaseShareWeeklyReportResolver } from '../base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportTestPositivityResolver extends BaseShareWeeklyReportResolver<
  WeeklyReportDataPair<WeeklyReportPositivityRateGeographyCard>
> {
  async resolve(route: ActivatedRouteSnapshot) {
    return this.dataService.loadWeeklyReportTestPositivityData(await this.getReportItem(route))
  }
}
