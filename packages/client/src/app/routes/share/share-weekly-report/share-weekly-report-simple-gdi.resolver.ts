import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot } from '@angular/router'
import { EpidemiologicSimpleGdi } from '@c19/commons'
import { BaseShareWeeklyReportResolver } from './base-share-weekly-report.resolver'

@Injectable()
export class ShareWeeklyReportSimpleGdiResolver extends BaseShareWeeklyReportResolver<EpidemiologicSimpleGdi> {
  resolve(route: ActivatedRouteSnapshot): EpidemiologicSimpleGdi {
    return this.getSimpleGdi(route)
  }
}
