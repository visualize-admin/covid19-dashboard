import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { WeeklyReportEpidemiologicDemographyCard } from '@c19/commons'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { BaseShareWeeklyReportResolver } from '../base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportDemographyResolver extends BaseShareWeeklyReportResolver<
  WeeklyReportDataPair<WeeklyReportEpidemiologicDemographyCard>
> {
  async resolve(route: ActivatedRouteSnapshot) {
    return this.dataService.loadWeeklyReportDemographyData(this.getSimpleGdi(route), await this.getReportItem(route))
  }
}
