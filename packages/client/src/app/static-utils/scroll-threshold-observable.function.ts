import { fromEvent } from 'rxjs'
import { filter, map, pairwise, scan } from 'rxjs/operators'

export function scrollThreshold$(doc: Document, threshold: number) {
  return fromEvent(doc, 'scroll').pipe(
    map(() => doc.documentElement.scrollTop),
    pairwise(),
    scan((acc, [val1, val2]) => acc + (val2 - val1), 0),
    map(Math.abs),
    filter((v) => v > threshold),
  )
}
