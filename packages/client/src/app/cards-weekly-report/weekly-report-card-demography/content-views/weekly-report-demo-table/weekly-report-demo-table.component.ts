import { ChangeDetectionStrategy, Component, forwardRef, Inject, ViewEncapsulation } from '@angular/core'
import { createKeyValueMap } from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TranslatorService } from '../../../../core/i18n/translator.service'
import { TooltipService } from '../../../../shared/components/tooltip/tooltip.service'
import {
  CompareData,
  CompareEntry,
} from '../../../../shared/components/weekly-compare-table/weekly-compare-table.component'
import { pascalCase } from 'change-case'
import { replaceHyphenWithEnDash } from '../../../../static-utils/replace-hyphen-with-en-dash.functions'
import {
  CurrentWrDemographyValues,
  WeeklyReportCardDemographyComponent,
} from '../../weekly-report-card-demography.component'

interface ComparisonTableData {
  prevDate: Date
  currDate: Date
  ageCompareData: CompareData
  genderCompareData: CompareData
}

@Component({
  selector: 'bag-weekly-report-demo-table',
  templateUrl: './weekly-report-demo-table.component.html',
  styleUrls: ['./weekly-report-demo-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportDemoTableComponent {
  readonly data$: Observable<ComparisonTableData | null> = this.parent.currentValues$.pipe(
    map(this.prepareComparisonTableData.bind(this)),
  )

  constructor(
    protected tooltipService: TooltipService,
    protected translator: TranslatorService,
    @Inject(forwardRef(() => WeeklyReportCardDemographyComponent)) readonly parent: WeeklyReportCardDemographyComponent,
  ) {}

  private prepareComparisonTableData(cv: CurrentWrDemographyValues): ComparisonTableData {
    const ageW2Map = createKeyValueMap(cv.ageData.curr, (b) => b.bucket)
    const ageCompareData: CompareData = {
      entries: cv.ageData.prev
        .reverse()
        .map((bw1) => [bw1, ageW2Map[bw1.bucket]])
        .map(
          ([bw1, bw2]): CompareEntry => ({
            label: replaceHyphenWithEnDash(bw1.bucket),
            set1: { rel: bw1.inzWeek, abs: bw1.week },
            set2: { rel: bw2.inzWeek, abs: bw2.week },
            diff: bw2.diffWeekPercentage,
          }),
        ),
    }

    const sexW2Map = createKeyValueMap(cv.genderData.curr, (b) => b.bucket)
    const genderCompareData: CompareData = {
      entries: cv.genderData.prev
        .map((bw1) => [bw1, sexW2Map[bw1.bucket]])
        .map(
          ([bw1, bw2]): CompareEntry => ({
            label: this.translator.get(`Commons.${pascalCase(bw1.bucket)}`),
            set1: { rel: bw1.percentage, abs: bw1.week },
            set2: { rel: bw2.percentage, abs: bw2.week },
            diff: bw2.diffPpPercentage,
          }),
        ),
    }

    return {
      ageCompareData,
      genderCompareData,
      prevDate: cv.prevWeekStart,
      currDate: cv.currWeekStart,
    }
  }
}
