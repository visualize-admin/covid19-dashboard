import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { CombinedWeeklyReportMethodData, DataService } from '../../../../core/data/data.service'

@Injectable({ providedIn: 'root' })
export class WeeklyReportMethodsAndSourcesResolver implements Resolve<CombinedWeeklyReportMethodData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(
    { queryParams, data }: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<CombinedWeeklyReportMethodData> {
    const reportList = await this.dataService.loadWeeklyReportList()
    // always load newest (not depending on selected isoWeek)
    return this.dataService.loadCombinedWeeklyReportMethodsAndSourcesData(reportList.latest)
  }
}
