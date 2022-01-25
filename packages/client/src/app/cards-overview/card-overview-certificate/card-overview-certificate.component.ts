import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { CovidCertificatesOverviewCard, CovidCertificateType, GdiObject } from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HistogramPreviewLinesEntry } from '../../diagrams/histogram/histogram-preview/histogram-preview-lines.component'
import {
  COLOR_CERTIFICATE_RECOVERY,
  COLOR_CERTIFICATE_TEST,
  COLOR_CERTIFICATE_VACC,
} from '../../shared/commons/colors.const'
import { KeyValueListEntries } from '../../shared/components/key-value-list/key-value-list.component'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseCardOverviewComponent, CurrentValuesOverview } from '../base-card-overview.component'

@Component({
  selector: 'bag-card-overview-certificate',
  templateUrl: './card-overview-certificate.component.html',
  styleUrls: ['./card-overview-certificate.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BaseCardOverviewComponent, useExisting: CardOverviewCertificateComponent }],
})
export class CardOverviewCertificateComponent extends BaseCardOverviewComponent<CovidCertificatesOverviewCard> {
  readonly previewLineColors = [COLOR_CERTIFICATE_TEST, COLOR_CERTIFICATE_RECOVERY, COLOR_CERTIFICATE_VACC]
  readonly gdiObject = GdiObject.VACC_DOSES
  readonly cardBaseContext = 'OverviewCardCertificate'

  histogram$: Observable<HistogramPreviewLinesEntry[] | null> = this.currentValues$.pipe(
    map(({ timelineData, timeFrame }) => {
      if (!timelineData?.length) {
        return null
      }
      // we leftPad/rightPad timeline entries with values=[] to match the timeSpan
      const [startPadEntries, endPadEntries] = this.getPadEntries(timeFrame, timelineData)
      const dataEntries = timelineData.map(({ date, vaccinated, recovered, tested }) => ({
        date: parseIsoDate(date),
        values: [tested.total, recovered.total, vaccinated.total],
      }))
      return [...startPadEntries, ...dataEntries, ...endPadEntries]
    }),
  )

  protected override initKeyValueListData({ timeFilter }: CurrentValuesOverview): KeyValueListEntries {
    const valVaccinated = this.data.dailyValues[CovidCertificateType.VACCINATED]
    const valRecovered = this.data.dailyValues[CovidCertificateType.RECOVERED]
    const valTested = this.data.dailyValues[CovidCertificateType.TESTED]

    return [
      { key: this.translator.get('OverviewCardCertificate.Table.Vaccinated.Title'), isTitle: true },
      {
        key: this.translator.get('OverviewCardCertificate.Table.Value', {
          date: formatUtcDate(new Date(valVaccinated.date)),
        }),
        value: adminFormatNum(valVaccinated.value),
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardCertificate.Table.Total'),
        value: adminFormatNum(valVaccinated.total),
        colorCode: COLOR_CERTIFICATE_VACC,
        combineAbove: true,
        combineBelow: true,
      },
      {
        info: this.translator.get('OverviewCardCertificate.Table.Vaccinated.Description'),
        combineAbove: true,
      },
      { key: this.translator.get('OverviewCardCertificate.Table.Recovered.Title'), isTitle: true },
      {
        key: this.translator.get('OverviewCardCertificate.Table.Value', {
          date: formatUtcDate(new Date(valRecovered.date)),
        }),
        value: adminFormatNum(valRecovered.value),
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardCertificate.Table.Total'),
        value: adminFormatNum(valRecovered.total),
        colorCode: COLOR_CERTIFICATE_RECOVERY,
        combineAbove: true,
        combineBelow: true,
      },
      {
        info: this.translator.get('OverviewCardCertificate.Table.Recovered.Description'),
        combineAbove: true,
      },
      { key: this.translator.get('OverviewCardCertificate.Table.Tested.Title'), isTitle: true },
      {
        key: this.translator.get('OverviewCardCertificate.Table.Value', {
          date: formatUtcDate(new Date(valTested.date)),
        }),
        value: adminFormatNum(valTested.value),
        combineAbove: true,
        combineBelow: true,
      },
      {
        key: this.translator.get('OverviewCardCertificate.Table.Total'),
        value: adminFormatNum(valTested.total),
        colorCode: COLOR_CERTIFICATE_TEST,
        combineAbove: true,
        combineBelow: true,
      },
      {
        info: this.translator.get('OverviewCardCertificate.Table.Tested.Description'),
        combineAbove: true,
      },
    ]
  }
}
