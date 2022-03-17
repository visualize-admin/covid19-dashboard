import { Platform } from '@angular/cdk/platform'
import { DOCUMENT } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { WindowRef } from '@shiftcode/ngx-core'
import { Subject } from 'rxjs'
import { map, takeUntil } from 'rxjs/operators'
import { DOM_ID } from '../../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { IntersectionDirective } from '../../commons/intersection.directive'
import { DEFAULT_TIME_SLOT_FILTER_DETAIL, getTimeSlotFilterOptions } from '../../models/filters/time-slot-filter.enum'
import { QueryParams } from '../../models/query-params.enum'

@Component({
  selector: 'bag-detail-filter',
  templateUrl: './detail-filter.component.html',
  styleUrls: ['./detail-filter.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[attr.id]': `'${DOM_ID.DETAIL_FILTER}'`,
  },
})
export class DetailFilterComponent extends IntersectionDirective implements OnInit, OnDestroy {
  readonly timeSlotFilterOptions = getTimeSlotFilterOptions(DEFAULT_TIME_SLOT_FILTER_DETAIL)
  readonly timeSlotFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.TIME_FILTER] || null)

  private readonly onDestroy = new Subject<void>()

  constructor(
    winRef: WindowRef,
    elRef: ElementRef,
    platform: Platform,
    @Inject(DOCUMENT) doc: Document,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    super(winRef, doc, platform, elRef)
    this.bagIntersection = { offset: 120 }
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(selectChanged(QueryParams.TIME_FILTER), takeUntil(this.onDestroy))
      .subscribe(emitValToOwnViewFn(this.timeSlotFilterCtrl))

    this.timeSlotFilterCtrl.valueChanges
      .pipe(map((v) => ({ [QueryParams.TIME_FILTER]: v })))
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  override ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }
}
