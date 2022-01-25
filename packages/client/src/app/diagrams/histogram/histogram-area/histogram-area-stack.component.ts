import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { area, Area } from 'd3'
import { isDefined } from '@c19/commons'
import { HistogramEntry, middleOfDay } from '../base-histogram.component'
import { HistogramAreaComponent } from './histogram-area.component'

export interface HistogramAreaEntry extends HistogramEntry {
  values: (number | null)[]
}

@Component({
  selector: 'bag-histogram-area-stack',
  templateUrl: './histogram-area.component.html',
  styleUrls: ['./histogram-area.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramAreaStackComponent<T extends HistogramAreaEntry> extends HistogramAreaComponent<T> {
  protected override createAreaFunctions(): Array<Area<T>> {
    return new Array(this.data.reduce((u, i) => Math.max(u, i.values.length), 0))
      .fill(0)
      .map((_, ix) => this.createArea((v) => v.values[ix], ix))
  }

  protected override createArea(valueFn: (v: T) => number | null | undefined, idx: number) {
    const preCalcY0 = (val: number | null | undefined, ix: number, arr: Array<number | null | undefined>) => {
      return arr.slice(0, ix + 1).reduce((u: number, i) => u + (i || 0), 0) - (val || 0)
    }

    const preCalcY1 = (val: number | null | undefined, ix: number, arr: Array<number | null | undefined>) => {
      return arr.slice(0, ix + 1).reduce((u: number, i) => u + (i || 0), 0)
    }

    return area<T>()
      .x(({ date }) => <number>this.scaleTimeX(middleOfDay(date)))
      .y0((entry) => {
        return <number>this.scaleLinearY(entry.values.map(preCalcY0)[idx])
      })
      .y1((entry) => {
        return <number>this.scaleLinearY(entry.values.map(preCalcY1)[idx])
      })
      .defined((entry) => isDefined(valueFn(entry)))
  }
}
