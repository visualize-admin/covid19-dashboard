import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { WeeklyReportEpidemiologicGeographyCard } from '@c19/commons'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { BaseShareWeeklyReportResolver } from '../base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportGeographyResolver extends BaseShareWeeklyReportResolver<
  WeeklyReportDataPair<WeeklyReportEpidemiologicGeographyCard>
> {
  async resolve(route: ActivatedRouteSnapshot) {
    return this.dataService.loadWeeklyReportGeographyData(this.getSimpleGdi(route), await this.getReportItem(route))
  }
}
