import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { EpidemiologicSimpleGdi, isDefined, WeeklyReportListItem } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { DataService } from '../../../core/data/data.service'
import { PathParams } from '../../../shared/models/path-params.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'

@Injectable()
export abstract class BaseShareWeeklyReportResolver<T> implements Resolve<T> {
  constructor(protected readonly dataService: DataService) {}

  abstract resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): T | Promise<T>

  protected getSimpleGdi({ parent }: ActivatedRouteSnapshot): EpidemiologicSimpleGdi {
    const dataObjectKeyParam: string = parent?.params[PathParams.DETAIL_DATA_OBJECT_KEY]
    return getEnumValues(EpidemiologicSimpleGdi).includes(dataObjectKeyParam)
      ? <EpidemiologicSimpleGdi>dataObjectKeyParam
      : EpidemiologicSimpleGdi.CASE
  }

  protected async getReportItem({ parent }: ActivatedRouteSnapshot): Promise<WeeklyReportListItem> {
    const reportList = await this.dataService.loadWeeklyReportList()

    const weeklyReportQueryParam: string = parent?.queryParams[QueryParams.ISO_WEEK_FILTER]
    const isoWeek = isDefined(weeklyReportQueryParam)
      ? parseInt(weeklyReportQueryParam, 10)
      : reportList.latest.current.isoWeek
    return reportList.availableWeeks.find(({ current }) => current.isoWeek === isoWeek) || reportList.latest
  }
}
