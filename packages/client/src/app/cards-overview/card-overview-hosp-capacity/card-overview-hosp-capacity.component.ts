import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { GdiObject, HospCapacityOverviewCardV3 } from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HistogramPreviewEntry } from '../../diagrams/histogram/histogram-preview/histogram-preview.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_HOSP_CAP_COVID,
  COLOR_HOSP_CAP_FREE,
  COLOR_HOSP_CAP_NON_COVID,
  COLORS_HOSP_CAP_BARS,
  COLORS_HOSP_CAP_LINES,
} from '../../shared/commons/colors.const'
import { KeyValueListEntries } from '../../shared/components/key-value-list/key-value-list.component'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseCardOverviewComponent, CurrentValuesOverview } from '../base-card-overview.component'

@Component({
  selector: 'bag-card-overview-hosp-capacity',
  templateUrl: './card-overview-hosp-capacity.component.html',
  styleUrls: ['./card-overview-hosp-capacity.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BaseCardOverviewComponent, useExisting: CardOverviewHospCapacityComponent }],
})
export class CardOverviewHospCapacityComponent extends BaseCardOverviewComponent<HospCapacityOverviewCardV3> {
  readonly gdiObject = GdiObject.VIRUS_VARIANTS
  readonly cardBaseContext = 'OverviewCardHospCapacity'
  readonly moreLink = ['/', this.lang, RoutePaths.DASHBOARD_CAPACITY, RoutePaths.DASHBOARD_CAPACITY_ICU]

  readonly barColors = COLORS_HOSP_CAP_BARS
  readonly lineColors = COLORS_HOSP_CAP_LINES

  readonly legendSquarePairs: Array<[string, string]> = [
    [COLOR_HOSP_CAP_COVID, 'HospCapacity.Card.BedsCovid.Label'],
    [COLOR_HOSP_CAP_NON_COVID, 'HospCapacity.Card.BedsNonCovid.Label'],
    [COLOR_HOSP_CAP_FREE, 'HospCapacity.Card.BedsFree.Label'],
  ]

  readonly histogram$: Observable<HistogramPreviewEntry[] | null> = this.currentValues$.pipe(
    map(({ timelineData }) => {
      if (!timelineData?.length) {
        return null
      }
      return timelineData.map(
        (e): HistogramPreviewEntry => ({
          date: parseIsoDate(e.date),
          barValues: [e.value_hospBedsCovid, e.value_hospBedsNonCovid, e.value_hospBedsFree],
          lineValues: [e.rollmean15d_hospBedsCovid, e.rollmean15d_hospBedsAll, e.rollmean15d_hospBedsCapacity],
        }),
      )
    }),
  )

  protected override initKeyValueListData({ timeFilter, timeFrame }: CurrentValuesOverview): KeyValueListEntries {
    const valuesTot = this.data.dailyValues[GdiObject.HOSP_CAPACITY_TOTAL]
    const valuesIcu = this.data.dailyValues[GdiObject.HOSP_CAPACITY_ICU]
    return [
      { key: this.translator.get('OverviewCardHospCapacity.Table.Icu.Title'), isTitle: true },
      {
        key: this.translator.get('OverviewCardHospCapacity.Table.Icu.Occupation.Covid19.Mean15Days.Short', {
          date: formatUtcDate(parseIsoDate(<string>valuesIcu.date15dMean)),
        }),
        keyDescription: this.translator.get('Commons.Mean15dFromDate', {
          date: formatUtcDate(parseIsoDate(<string>valuesIcu.date15dMean)),
        }),
        value: adminFormatNum(valuesIcu.rollmean15d_hospBedsCovid),
        info: this.translator.get('IndicatorsDescription.OverviewCardHospCapacity.Icu.Covid19.Mean15Days'),
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardHospCapacity.Table.Occupation.All'),
        value: `${adminFormatNum(valuesIcu.percentage_hospBedsAll, 2)}%`,
        info: this.translator.get('IndicatorsDescription.OverviewCardHospCapacity.Icu.All'),
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardHospCapacity.Table.Occupation.Covid19'),
        value: `${adminFormatNum(valuesIcu.percentage_hospBedsCovid, 2)}%`,
        info: this.translator.get('IndicatorsDescription.OverviewCardHospCapacity.Icu.Covid19'),
        combineAbove: true,
      },

      { key: this.translator.get('OverviewCardHospCapacity.Table.Total.Title'), isTitle: true },
      {
        key: this.translator.get('OverviewCardHospCapacity.Table.Occupation.All'),
        value: `${adminFormatNum(valuesTot.percentage_hospBedsAll, 2)}%`,
        info: this.translator.get('IndicatorsDescription.OverviewCardHospCapacity.Total.All'),
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardHospCapacity.Table.Occupation.Covid19'),
        value: `${adminFormatNum(valuesTot.percentage_hospBedsCovid, 2)}%`,
        info: this.translator.get('IndicatorsDescription.OverviewCardHospCapacity.Total.Covid19'),
        combineAbove: true,
      },
    ]
  }
}
