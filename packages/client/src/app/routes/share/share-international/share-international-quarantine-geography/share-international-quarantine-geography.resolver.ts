import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { InternationalQuarantineData } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'

@Injectable()
export class ShareInternationalQuarantineGeographyResolver implements Resolve<InternationalQuarantineData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<InternationalQuarantineData> {
    return this.dataService.loadInternationalQuarantineData()
  }
}
