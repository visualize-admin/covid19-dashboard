import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { EpidemiologicSimpleGdi } from '@c19/commons'
import { CombinedWeeklyReportData, DataService } from '../../../core/data/data.service'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

@Injectable({ providedIn: 'root' })
export class WeeklyReportChildResolver implements Resolve<CombinedWeeklyReportData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(
    { queryParams, data }: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<CombinedWeeklyReportData> {
    const reportList = await this.dataService.loadWeeklyReportList()

    // read isoWeek from param if set -
    const isoWeek: number | null = parseInt(queryParams[QueryParams.ISO_WEEK_FILTER], 10) || null

    const item = isoWeek ? reportList.availableWeeks.find((i) => i.current.isoWeek === isoWeek) : undefined

    const simpleGdi: EpidemiologicSimpleGdi = data[RouteDataKey.SIMPLE_GDI_OBJECT]
    return this.dataService.loadCombinedWeeklyReportData(simpleGdi, item || reportList.latest)
  }
}
