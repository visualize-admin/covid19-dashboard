import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { OverviewDataV4 } from '@c19/commons'
import { DataService } from './data/data.service'

@Injectable({ providedIn: 'root' })
export class OverviewDataResolver implements Resolve<OverviewDataV4> {
  constructor(private readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<OverviewDataV4> {
    return this.dataService.loadOverviewData()
  }
}
