import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { AgeRangeByVaccinationStrategy, CovidVaccinationOverviewCardV3, GdiObject, GdiSubset } from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HistogramAreaEntry } from '../../diagrams/histogram/histogram-area/histogram-area.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_VACC_PERSONS_FULL, COLOR_VACC_PERSONS_MIN_ONE } from '../../shared/commons/colors.const'
import { KeyValueListEntries } from '../../shared/components/key-value-list/key-value-list.component'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseCardOverviewComponent, CurrentValuesOverview } from '../base-card-overview.component'

@Component({
  selector: 'bag-card-overview-vaccine',
  templateUrl: './card-overview-vaccine.component.html',
  styleUrls: ['./card-overview-vaccine.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BaseCardOverviewComponent, useExisting: CardOverviewVaccineComponent }],
})
export class CardOverviewVaccineComponent extends BaseCardOverviewComponent<CovidVaccinationOverviewCardV3> {
  // TODO adjust for new overview card with boosters
  readonly previewLineColors = ['url(#patternDots)', COLOR_VACC_PERSONS_FULL, COLOR_VACC_PERSONS_MIN_ONE]
  readonly gdiObject = GdiObject.VACC_DOSES
  readonly cardBaseContext = 'OverviewCardVaccine'
  readonly moreLink = ['/', this.lang, RoutePaths.DASHBOARD_VACCINATION, RoutePaths.DASHBOARD_VACCINATION_PERSONS]

  get sourceDate() {
    return this.data.dailyValues[GdiSubset.VACC_PERSONS_FULL].sourceDate
  }

  histogram$: Observable<HistogramAreaEntry[] | null> = this.currentValues$.pipe(
    map(({ timelineData, timeFrame }) => {
      if (!timelineData?.length) {
        return null
      }
      // we leftPad/rightPad timeline entries with values=[] to match the timeSpan
      const [startPadEntries, endPadEntries] = this.getPadEntries(timeFrame, timelineData)
      const dataEntries = timelineData.map(
        ({ date, VaccPersonsFull, VaccPersonsMinOneDose, VaccPersonsFirstBooster }) => ({
          date: parseIsoDate(date),
          values: [VaccPersonsFirstBooster.inzTotal, VaccPersonsFull.inzTotal, VaccPersonsMinOneDose.inzTotal],
        }),
      )
      return [...startPadEntries, ...dataEntries, ...endPadEntries]
    }),
  )

  readonly valFmt = (val: number) => `${val}%`

  protected override initKeyValueListData({ timeFilter }: CurrentValuesOverview): KeyValueListEntries {
    const valPersonsFull = this.data.dailyValues[GdiSubset.VACC_PERSONS_FULL]
    const valPersonsPartial = this.data.dailyValues[GdiSubset.VACC_PERSONS_PARTIAL]
    const valPersonsMinOne = this.data.dailyValues[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE]
    const valPersonsBooster = this.data.dailyValues[GdiSubset.VACC_PERSONS_FIRST_BOOSTER]
    const valPersons12Plus = this.data.dailyValues12Plus[GdiSubset.VACC_PERSONS_FULL]
    const valPersons12PlusFirstBooster = this.data.dailyValues12Plus[GdiSubset.VACC_PERSONS_FIRST_BOOSTER]

    const weekly65Plus = this.data.weeklyVaccPersonsValues[AgeRangeByVaccinationStrategy.A_65_PLUS]
    const valPersonsWeekly65PlusFull = weekly65Plus[GdiSubset.VACC_PERSONS_FULL]
    const valPersonsWeekly65PlusFirstBooster = weekly65Plus[GdiSubset.VACC_PERSONS_FIRST_BOOSTER]
    return [
      {
        key: this.translator.get('OverviewCardVaccine.Population.Title'),
        isTitle: true,
      },
      {
        key: this.translator.get('OverviewCardVaccine.Table.MinOneDose'),
        value: adminFormatNum(valPersonsMinOne.inzTotal, 2, '%'),
        info: this.translator.get('IndicatorsDescription.OverviewCardVaccine.MinOneDose'),
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardVaccine.Table.VaccPersons.Partial'),
        value: adminFormatNum(valPersonsPartial.inzTotal, 2, '%'),
        info: this.translator.get('IndicatorsDescription.OverviewCardVaccine.PartiallyVaccinated'),
        colorCode: COLOR_VACC_PERSONS_MIN_ONE,
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardVaccine.Table.VaccPersons.Full'),
        value: adminFormatNum(valPersonsFull.inzTotal, 2, '%'),
        info: this.translator.get('IndicatorsDescription.OverviewCardVaccine.FullyVaccinated'),
        colorCode: COLOR_VACC_PERSONS_FULL,
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardVaccine.Table.VaccPersons.WithBooster'),
        value: adminFormatNum(valPersonsBooster.inzTotal, 2, '%'),
        info: this.translator.get('IndicatorsDescription.OverviewCardVaccine.Booster'),
        colorCode: COLOR_VACC_PERSONS_FULL,
        pattern: true,
        combineAbove: true,
      },
      {
        key: this.translator.get('OverviewCardVaccine.12Plus.Title'),
        isTitle: true,
      },
      {
        key: this.translator.get('OverviewCardVaccine.Table.VaccPersons.Full'),
        value: adminFormatNum(valPersons12Plus.inzTotal, 2, '%'),
        info: this.translator.get('IndicatorsDescription.OverviewCardVaccine.FullyVaccinated.12Plus'),
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardVaccine.Table.VaccPersons.WithBooster'),
        value: adminFormatNum(valPersons12PlusFirstBooster.inzTotal, 2, '%'),
        info: this.translator.get('IndicatorsDescription.OverviewCardVaccine.Booster.12Plus'),
        combineAbove: true,
      },
      {
        key: this.translator.get('OverviewCardVaccine.65Plus.Title'),
        isTitle: true,
        keyDescription: this.translator.get('Commons.DateStatus', { date: formatUtcDate(new Date(weekly65Plus.date)) }),
      },
      {
        key: this.translator.get('OverviewCardVaccine.Table.VaccPersons.Full'),
        value: adminFormatNum(valPersonsWeekly65PlusFull.inzTotal, 2, '%'),
        info: this.translator.get('IndicatorsDescription.OverviewCardVaccine.FullyVaccinated.65Plus'),
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardVaccine.Table.VaccPersons.WithBooster'),
        value: adminFormatNum(valPersonsWeekly65PlusFirstBooster.inzTotal, 2, '%'),
        info: this.translator.get('IndicatorsDescription.OverviewCardVaccine.Booster.65Plus'),
        combineAbove: true,
      },
    ]
  }
}
