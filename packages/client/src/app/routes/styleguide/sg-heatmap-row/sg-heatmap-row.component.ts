import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormControl } from '@angular/forms'
import { addDays, differenceInDays } from 'date-fns'
import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay, startWith } from 'rxjs/operators'
import { HeatmapRowEntry } from '../../../diagrams/heatmap-row/heatmap-row.component'

interface DataEntry extends HeatmapRowEntry {
  date: Date
  value: number
}

@Component({
  selector: 'bag-sg-heatmap-row',
  templateUrl: './sg-heatmap-row.component.html',
  styleUrls: ['./sg-heatmap-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SgHeatmapRowComponent {
  readonly startDates = [
    new Date('2020-01-01'),
    new Date('2021-01-01'),
    addDays(new Date(), -28),
    addDays(new Date(), -14),
  ] as const

  readonly startDateCtrl = new FormControl(this.startDates[0])
  readonly sliderCtrl = new FormControl(5)

  sliderVal$ = this.sliderCtrl.valueChanges.pipe(startWith(<number>this.sliderCtrl.value), shareReplay(1))

  startDate$: Observable<Date> = this.startDateCtrl.valueChanges.pipe(
    startWith(<Date>this.startDateCtrl.value),
    shareReplay(1),
  )

  entries$ = this.startDate$.pipe(map(this.genEntries.bind(this)))

  data$: Observable<{
    entries: DataEntry[]
    selected: DataEntry
    selectedIx: number
    min: number
    max: number
  } | null> = combineLatest([this.entries$, this.sliderVal$]).pipe(
    map(([entries, sliderVal]) => {
      const selectedIx = entries[sliderVal] ? sliderVal : 0
      const selected = entries[selectedIx]
      return selected ? { entries, selected, selectedIx, min: 0, max: entries.length - 1 } : null
    }),
  )

  endDate = new Date()

  constructor() {}

  private readonly colorFill = (val: number): string => `hsl(180, 50%, ${val}%)`

  private genEntries(startDate: Date): DataEntry[] {
    const count = differenceInDays(new Date(), startDate) + 1
    return new Array(count).fill(0).map((_, ix): DataEntry => {
      const value = 30 + Math.round(Math.random() * 3) * 15
      return {
        date: addDays(startDate, ix),
        value,
        color: this.colorFill(value),
        // height: (value / 75) * 100,
      }
    })
  }
}
