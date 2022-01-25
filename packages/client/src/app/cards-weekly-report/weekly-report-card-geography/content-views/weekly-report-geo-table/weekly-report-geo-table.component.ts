import { ChangeDetectionStrategy, Component, forwardRef, Inject, ViewEncapsulation } from '@angular/core'
import {
  CantonGeoUnit,
  GeoUnit,
  SwissRegionGeoUnit,
  TopLevelGeoUnit,
  WeeklyReportEpidemiologicGeographyCard,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TranslatorService } from '../../../../core/i18n/translator.service'
import { TooltipService } from '../../../../shared/components/tooltip/tooltip.service'
import {
  CompareData,
  CompareEntry,
} from '../../../../shared/components/weekly-compare-table/weekly-compare-table.component'
import { RegionsFilter } from '../../../../shared/models/filters/regions-filter.enum'
import { CurrentWrGeoValues, WeeklyReportCardGeographyComponent } from '../../weekly-report-card-geography.component'

interface ComparisonTableData extends CompareData {
  prevDate: Date
  currDate: Date
}

@Component({
  selector: 'bag-weekly-report-geo-table',
  templateUrl: './weekly-report-geo-table.component.html',
  styleUrls: ['./weekly-report-geo-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportGeoTableComponent {
  readonly data$: Observable<ComparisonTableData | null> = this.parent.currentValues$.pipe(
    map(this.prepareComparisonTableData.bind(this)),
  )

  constructor(
    protected tooltipService: TooltipService,
    protected translator: TranslatorService,
    @Inject(forwardRef(() => WeeklyReportCardGeographyComponent)) readonly parent: WeeklyReportCardGeographyComponent,
  ) {}

  private prepareComparisonTableData(cv: CurrentWrGeoValues): ComparisonTableData | null {
    const tlGeoUnits = <TopLevelGeoUnit[]>getEnumValues(TopLevelGeoUnit)
    const cantons = <CantonGeoUnit[]>getEnumValues(CantonGeoUnit).filter((k) => k !== CantonGeoUnit.FL)
    const grRegions = <SwissRegionGeoUnit[]>getEnumValues(SwissRegionGeoUnit).filter((k) => k !== SwissRegionGeoUnit.FL)

    const secondEntries =
      cv.regionsFilter === RegionsFilter.CANTONS
        ? this.createTableEntries(cantons, cv.prevWeek, cv.currWeek).sort((a, b) => (a.label < b.label ? -1 : 1))
        : this.createTableEntries(grRegions, cv.prevWeek, cv.currWeek)

    return {
      entries: [...this.createTableEntries(tlGeoUnits, cv.prevWeek, cv.currWeek), ...secondEntries],
      ref1: cv.prevWeek.geoUnitData[TopLevelGeoUnit.CHFL].inzWeek,
      ref2: cv.currWeek.geoUnitData[TopLevelGeoUnit.CHFL].inzWeek,
      prevDate: cv.prevWeekStart,
      currDate: cv.currWeekStart,
    }
  }

  private createTableEntries(
    entries: GeoUnit[],
    prevWeek: WeeklyReportEpidemiologicGeographyCard,
    currWeek: WeeklyReportEpidemiologicGeographyCard,
  ): CompareEntry[] {
    return entries.map((geoUnit) => {
      return {
        label: this.translator.get(`GeoFilter.${geoUnit}`),
        set1: {
          rel: prevWeek.geoUnitData[geoUnit].inzWeek,
          abs: prevWeek.geoUnitData[geoUnit].week,
        },
        set2: {
          rel: currWeek.geoUnitData[geoUnit].inzWeek,
          abs: currWeek.geoUnitData[geoUnit].week,
        },
        diff: currWeek.geoUnitData[geoUnit].diffWeekPercentage,
      }
    })
  }
}
