import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core'
import { CovidVirusVariantsGeoEntry, WgsVariants } from '@c19/commons'
import { TranslatorService } from '../../../core/i18n/translator.service'

export interface VariantsTableEntry {
  name: string
  description: string
  msys: number | null
  wgs: number | null
}

@Component({
  selector: 'bag-variants-table',
  templateUrl: './variants-table.component.html',
  styleUrls: ['./variants-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantsTableComponent implements OnChanges {
  @Input()
  variants: WgsVariants[]

  @Input()
  msysEntry: CovidVirusVariantsGeoEntry

  @Input()
  wgsEntry: CovidVirusVariantsGeoEntry

  entries: VariantsTableEntry[]

  constructor(private readonly translator: TranslatorService) {}

  ngOnChanges(changes: SimpleChanges) {
    this.entries = this.variants
      .map((variant): VariantsTableEntry | null => {
        const msysVal = this.msysEntry[variant]
        const wgsVal = this.wgsEntry[variant]
        return msysVal && wgsVal
          ? {
              name: this.translator.get(`VirusVariants.${variant}.Label`),
              description: this.translator.get(`VirusVariants.${variant}.Description`),
              msys: msysVal.total,
              wgs: wgsVal.total,
            }
          : null
      })
      .filter((e): e is VariantsTableEntry => !!e)
  }
}
