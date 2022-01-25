import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormControl } from '@angular/forms'
import { CantonGeoUnit } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { CompareData } from '../../../shared/components/weekly-compare-table/weekly-compare-table.component'

// tslint:disable-next-line:no-bitwise
const toFixed = (val: number, fixed: number = 2) => ~~(Math.pow(10, fixed) * val) / Math.pow(10, fixed)

@Component({
  selector: 'bag-sg-components',
  templateUrl: './sg-components.component.html',
  styleUrls: ['./sg-components.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SgComponentsComponent {
  compareData: CompareData = {
    entries: [
      {
        label: 'Schweiz und Liechtenstein',
        set1: { rel: 300, abs: 500 },
        set2: { rel: 300, abs: 500 },
        diff: 6.6,
      },
      ...getEnumValues(CantonGeoUnit).map((geoUnit) => {
        const value0 = toFixed(100 + Math.random() * 300)
        const value1 = toFixed(value0 + ((Math.random() - 0.5) * value0) / 10)
        return {
          label: `Kanton ${geoUnit}`,
          set1: { abs: Math.ceil(value0 * 2), rel: value0 },
          set2: { abs: Math.ceil(value1 * 2), rel: value1 },
          diff: toFixed((value1 / value0) * 100 - 100),
        }
      }),
    ],
    ref1: 300,
    ref2: 320,
  }

  multiSelectCtrl = new FormControl()

  constructor() {}
}
