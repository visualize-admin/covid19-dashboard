import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { CombinedWeeklyReportSituationData, DataService } from '../../../../core/data/data.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'

@Injectable({ providedIn: 'root' })
export class WeeklyReportSituationResolver implements Resolve<CombinedWeeklyReportSituationData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(
    { queryParams, data }: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<CombinedWeeklyReportSituationData> {
    const reportList = await this.dataService.loadWeeklyReportList()

    // read isoWeek from param if set -
    const isoWeek: number | null = parseInt(queryParams[QueryParams.ISO_WEEK_FILTER], 10) || null

    const item = isoWeek ? reportList.availableWeeks.find((i) => i.current.isoWeek === isoWeek) : undefined

    return this.dataService.loadCombinedWeeklyReportSituationData(item || reportList.latest)
  }
}
