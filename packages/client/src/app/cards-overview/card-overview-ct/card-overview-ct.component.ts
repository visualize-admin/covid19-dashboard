import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { CovidCtOverviewCardV3, GdiObject, GdiVariant } from '@c19/commons'
import { KeyValueListEntries } from '../../shared/components/key-value-list/key-value-list.component'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { BaseCardOverviewComponent, CurrentValuesOverview } from '../base-card-overview.component'

@Component({
  selector: 'bag-card-overview-ct',
  templateUrl: './card-overview-ct.component.html',
  styleUrls: ['./card-overview-ct.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BaseCardOverviewComponent, useExisting: CardOverviewCtComponent }],
})
export class CardOverviewCtComponent extends BaseCardOverviewComponent<CovidCtOverviewCardV3> {
  readonly gdiObject = GdiObject.CT
  readonly cardBaseContext = 'OverviewCardCT'

  protected override initKeyValueListData({}: CurrentValuesOverview): KeyValueListEntries {
    return [
      {
        key: this.translator.get('OverviewCardCT.Table.Isolation.Label'),
        value: adminFormatNum(this.data.dailyValues[GdiVariant.VALUE_CT_ISO]),
        keyDescription: this.translator.get('OverviewCardCT.Table.Isolation.Desc'),
      },
      {
        key: this.translator.get('OverviewCardCT.Table.Quarantine.Label'),
        value: adminFormatNum(this.data.dailyValues[GdiVariant.VALUE_CT_QUA]),
        keyDescription: this.translator.get('OverviewCardCT.Table.Quarantine.Desc'),
      },
      {
        key: this.translator.get('OverviewCardCT.Table.EntryQuarantine.Label'),
        value: adminFormatNum(this.data.dailyValues[GdiVariant.VALUE_CT_ENTRY]),
        keyDescription: this.translator.get('OverviewCardCT.Table.EntryQuarantine.Desc'),
      },
    ]
  }
}
