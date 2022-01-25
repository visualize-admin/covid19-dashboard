import { ChangeDetectionStrategy, Component, HostBinding, Input, OnDestroy, ViewEncapsulation } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { RouteFragment } from '../../../routes/route-fragment.enum'
import { getDataStatusArgs } from '../../../static-utils/date-utils'

@Component({
  selector: 'bag-overview-card',
  templateUrl: './overview-card.component.html',
  styleUrls: ['./overview-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewCardComponent implements OnDestroy {
  @Input()
  subtitle: string

  @Input()
  titleKey: string

  @Input()
  sourceDate: Date | null

  @Input()
  facet?: 'print'

  @Input()
  sourceKey: string | null = 'Commons.Source.BAG'

  @Input()
  moreLinkArgs: string[]

  @Input()
  moreLinkQueryParams?: Record<string, string> | null

  @Input()
  warnKey?: string | null

  @HostBinding('class.--print')
  get facetPrint(): boolean {
    return this.facet === 'print'
  }

  /**
   * modified from {@link OverviewCardInfoDirective}
   */
  hasToggledInfos: boolean

  /**
   * modified from {@link OverviewCardInfoDirective}
   */
  hasToggledWarnings: boolean

  readonly RouteFragment = RouteFragment

  readonly showInfo$: Observable<boolean>

  get transArg(): Record<string, string> {
    return getDataStatusArgs(this.sourceDate)
  }

  private readonly showInfoSubject = new BehaviorSubject(false)

  constructor() {
    this.showInfo$ = this.showInfoSubject.asObservable()
  }

  toggleInfo() {
    this.showInfoSubject.next(!this.showInfoSubject.value)
  }

  hideInfo() {
    if (this.showInfoSubject.value) {
      this.showInfoSubject.next(false)
    }
  }

  ngOnDestroy() {
    this.showInfoSubject.complete()
  }
}
