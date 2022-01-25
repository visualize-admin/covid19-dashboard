import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { isDefined, TimeSpan, TopLevelGeoUnit, WeeklyReportHospCapacityDataCard } from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap } from 'rxjs/operators'
import { WeeklyReportDataPair } from '../../core/data/data.service'
import { RoutePaths } from '../../routes/route-paths.enum'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseWeeklyReportCardComponent, CurrenWrValuesBase } from '../base-weekly-report-card.component'

export interface CurrentWrHospCapacityIcuValues extends CurrenWrValuesBase {
  timeFrame: TimeSpan
  data: WeeklyReportDataPair<WeeklyReportHospCapacityDataCard>
  noData: boolean
}

@Component({
  selector: 'bag-weekly-report-card-hosp-capacity-icu',
  templateUrl: './weekly-report-card-hosp-capacity-icu.component.html',
  styleUrls: ['./weekly-report-card-hosp-capacity-icu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportCardHospCapacityIcuComponent extends BaseWeeklyReportCardComponent<WeeklyReportHospCapacityDataCard> {
  readonly cardDetailPath = RoutePaths.SHARE_HOSP_CAPACITY_ICU

  readonly currentValues$: Observable<CurrentWrHospCapacityIcuValues> = this.isoWeekFilter$.pipe(
    switchMap((weekFilter) => this.onChanges$.pipe(mapTo(weekFilter))),
    map((isoWeek): CurrentWrHospCapacityIcuValues => {
      const { prev, curr } = this.data
      const timeFrame: TimeSpan = { start: prev.timeSpan.start, end: curr.timeSpan.end }
      const noData = (item: WeeklyReportHospCapacityDataCard): boolean =>
        !isDefined(item.geoUnitData[TopLevelGeoUnit.CH]) ||
        !isDefined(item.geoUnitData[TopLevelGeoUnit.CH].HospCapacityCovid.week) ||
        !isDefined(item.geoUnitData[TopLevelGeoUnit.CH].HospCapacityNonCovid.week) ||
        !isDefined(item.geoUnitData[TopLevelGeoUnit.CH].HospCapacityFree.week)
      return {
        isoWeek,
        prevWeekStart: parseIsoDate(prev.timeSpan.start),
        currWeekStart: parseIsoDate(curr.timeSpan.start),
        data: { prev, curr },
        noData: noData(prev) || noData(curr),
        timeFrame,
      }
    }),
    shareReplay(1),
  )

  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))

  createDescription({ currWeekStart, prevWeekStart }: CurrentWrHospCapacityIcuValues): string {
    return this.translator.get(`WeeklyReport.HospCapacityIcu.Card.Description`, {
      prevDate: formatUtcDate(prevWeekStart),
      prevWeek: getISOWeek(prevWeekStart),
      currWeek: getISOWeek(currWeekStart),
      currDate: formatUtcDate(currWeekStart),
    })
  }
}
