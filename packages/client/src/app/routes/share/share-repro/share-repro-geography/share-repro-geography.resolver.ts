import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { ReGeography } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'

@Injectable()
export class ShareReproGeographyResolver implements Resolve<ReGeography> {
  constructor(private readonly dataService: DataService) {}

  resolve() {
    return this.dataService.loadReproductionGeographyData()
  }
}
