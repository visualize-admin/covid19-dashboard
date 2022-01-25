import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { isDefined } from '@c19/commons'
import { QueryParams } from '../shared/models/query-params.enum'
import { DataService } from './data/data.service'

@Injectable({ providedIn: 'root' })
export class WeeklyReportIsoWeekGuard implements CanActivate {
  constructor(private readonly router: Router, private readonly dataService: DataService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const isoWeekParam = route.queryParams[QueryParams.ISO_WEEK_FILTER]

    if (!isDefined(isoWeekParam)) {
      return true
    }
    const reportList = await this.dataService.loadWeeklyReportList()
    const isoWeek = parseInt(isoWeekParam, 10)
    const item = reportList.availableWeeks.find((i) => i.current.isoWeek === isoWeek)

    if (item) {
      return true
    }

    // remove queryParam and return urlTree
    const tree = this.router.parseUrl(state.url)
    delete tree.queryParams[QueryParams.ISO_WEEK_FILTER]
    return tree
  }
}
