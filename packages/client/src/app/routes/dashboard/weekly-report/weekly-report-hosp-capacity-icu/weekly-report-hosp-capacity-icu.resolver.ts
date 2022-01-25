import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { CombinedWeeklyReportHospCapacityIcuData, DataService } from '../../../../core/data/data.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'

@Injectable({ providedIn: 'root' })
export class WeeklyReportHospCapacityIcuResolver implements Resolve<CombinedWeeklyReportHospCapacityIcuData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(
    { queryParams, data }: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<CombinedWeeklyReportHospCapacityIcuData> {
    const reportList = await this.dataService.loadWeeklyReportList()

    // read isoWeek from param if set -
    const isoWeek: number | null = parseInt(queryParams[QueryParams.ISO_WEEK_FILTER], 10) || null

    const item = isoWeek ? reportList.availableWeeks.find((i) => i.current.isoWeek === isoWeek) : undefined

    return this.dataService.loadCombinedWeeklyReportHospCapacityIcuData(item || reportList.latest)
  }
}
