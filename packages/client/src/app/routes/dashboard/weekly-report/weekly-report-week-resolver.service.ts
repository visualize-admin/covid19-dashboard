import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { WeeklyReportWeekList } from '@c19/commons'
import { DataService } from '../../../core/data/data.service'

@Injectable({ providedIn: 'root' })
export class WeeklyReportWeekResolver implements Resolve<WeeklyReportWeekList> {
  constructor(private readonly dataService: DataService) {}

  resolve(): Promise<WeeklyReportWeekList> {
    return this.dataService.loadWeeklyReportList()
  }
}
