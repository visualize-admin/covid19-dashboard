import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

export interface TextTableEasyRow {
  titleKey: string
  content: string
}

@Component({
  selector: 'bag-text-table-easy',
  templateUrl: './text-table-easy.component.html',
  styleUrls: ['./text-table-easy.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextTableEasyComponent {
  @Input()
  set data(rows: TextTableEasyRow[]) {
    this._data = rows
  }

  get data() {
    return this._data
  }

  private _data: TextTableEasyRow[]
}
