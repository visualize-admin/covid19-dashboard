import { ChangeDetectionStrategy, Component, forwardRef, Inject, ViewEncapsulation } from '@angular/core'
import {
  CantonGeoUnit,
  GdiSubset,
  GeoUnit,
  isDefined,
  SwissRegionGeoUnit,
  TopLevelGeoUnit,
  WeeklyReportPositivityRateGeographyCard,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TranslatorService } from '../../../../core/i18n/translator.service'
import { COLORS_COMPARE } from '../../../../shared/commons/colors.const'
import { RegionsFilter } from '../../../../shared/models/filters/regions-filter.enum'
import {
  CurrentWrTestPosValues,
  WeeklyReportCardTestPositivityComponent,
} from '../../weekly-report-card-test-positivity.component'

interface TableRowEntry {
  val1: number | null
  val2: number | null
  diff: number | null
  diffIcon: null | 'incr' | 'same' | 'decr'
  w1: number
  w2: number
}

interface TableEntry {
  label: string
  row1: TableRowEntry
  row2: TableRowEntry
}

interface TableData {
  prevWeekDate: Date
  currWeekDate: Date
  entries: TableEntry[]
  maxVal: number
}

@Component({
  selector: 'bag-weekly-report-testpos-table',
  templateUrl: './weekly-report-testpos-table.component.html',
  styleUrls: ['./weekly-report-testpos-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportTestposTableComponent {
  readonly colors = COLORS_COMPARE
  readonly tableData$: Observable<TableData> = this.parent.currentValues$.pipe(map(this.prepareTable.bind(this)))

  constructor(
    private translator: TranslatorService,
    @Inject(forwardRef(() => WeeklyReportCardTestPositivityComponent))
    readonly parent: WeeklyReportCardTestPositivityComponent,
  ) {}

  prepareTable(cv: CurrentWrTestPosValues): TableData {
    const forCantons = cv.regionsFilter === RegionsFilter.CANTONS

    const tlGeoUnits = <TopLevelGeoUnit[]>getEnumValues(TopLevelGeoUnit)
    const regions = forCantons
      ? <CantonGeoUnit[]>getEnumValues(CantonGeoUnit).filter((k) => k !== CantonGeoUnit.FL)
      : <SwissRegionGeoUnit[]>getEnumValues(SwissRegionGeoUnit).filter((k) => k !== SwissRegionGeoUnit.FL)

    const maxVal = Math.max(
      ...this.getDefinedValues([...tlGeoUnits, ...regions], cv.prevWeek),
      ...this.getDefinedValues([...tlGeoUnits, ...regions], cv.currWeek),
    )

    const secondEntries = this.createTableEntries(regions, cv.prevWeek, cv.currWeek, maxVal)

    const entries = [
      ...this.createTableEntries(tlGeoUnits, cv.prevWeek, cv.currWeek, maxVal),
      ...(forCantons ? secondEntries.sort((a, b) => (a.label < b.label ? -1 : 1)) : secondEntries),
    ]

    return {
      prevWeekDate: cv.prevWeekStart,
      currWeekDate: cv.currWeekStart,
      entries,
      maxVal,
    }
  }

  private createTableEntries(
    entries: GeoUnit[],
    prevWeek: WeeklyReportPositivityRateGeographyCard,
    currWeek: WeeklyReportPositivityRateGeographyCard,
    maxVal: number,
  ): TableEntry[] {
    const ratio = (v: number | null) => ((v || 0) / maxVal) * 100

    const row = (geoUnit: GeoUnit, gdiSub: GdiSubset.TEST_PCR | GdiSubset.TEST_ANTIGEN): TableRowEntry => {
      const prev = prevWeek.geoUnitData[geoUnit][gdiSub]
      const curr = currWeek.geoUnitData[geoUnit][gdiSub]
      return {
        val1: prev.percentageWeek_posTest,
        val2: curr.percentageWeek_posTest,
        diff: curr.diffPpPercentageWeek_posTest,
        diffIcon: isDefined(curr.diffPpPercentageWeek_posTest)
          ? curr.diffPpPercentageWeek_posTest > 1
            ? 'incr'
            : curr.diffPpPercentageWeek_posTest < -1
            ? 'decr'
            : 'same'
          : null,
        w1: ratio(prev.percentageWeek_posTest),
        w2: ratio(curr.percentageWeek_posTest),
      }
    }

    return entries.map((geoUnit) => {
      return {
        label: this.translator.get(`GeoFilter.${geoUnit}`),
        row1: row(geoUnit, GdiSubset.TEST_PCR),
        row2: row(geoUnit, GdiSubset.TEST_ANTIGEN),
      }
    })
  }

  private getDefinedValues(entries: GeoUnit[], data: WeeklyReportPositivityRateGeographyCard): number[] {
    return entries
      .reduce<(number | null)[]>(
        (u, geoUnit) => [
          ...u,
          data.geoUnitData[geoUnit][GdiSubset.TEST_PCR].percentageWeek_posTest,
          data.geoUnitData[geoUnit][GdiSubset.TEST_ANTIGEN].percentageWeek_posTest,
        ],
        [],
      )
      .filter(isDefined)
  }
}
