import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { CovidVirusVariantsGeographyDataV2 } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'

@Injectable()
export class ShareVirusVariantsOverviewResolver implements Resolve<CovidVirusVariantsGeographyDataV2> {
  constructor(private readonly dataService: DataService) {}

  resolve() {
    return this.dataService.loadVirusVariantsGeographyData()
  }
}
