import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  VaccinationSimpleGdi,
  VaccinationStatusDemographyData,
  VaccinationStatusDevelopmentData,
  VaccinationStatusVaccineDevelopmentData,
} from '@c19/commons'
import { Observable, Subject } from 'rxjs'
import { map, takeUntil, tap } from 'rxjs/operators'
import {
  DEFAULT_INDICATOR_FILTER,
  indicatorFilterOptions,
} from '../../../../shared/models/filters/indicator-filter.enum'
import { QueryParams } from '../../../../shared/models/query-params.enum'
import { formatUtcDate } from '../../../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../../static-utils/update-query-param.function'
import { VaccinationBaseDetailComponent } from '../vaccination-base-detail.component'

@Component({
  selector: 'bag-vaccination-status',
  templateUrl: './vaccination-status.component.html',
  styleUrls: ['./vaccination-status.component.scss', '../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaccinationStatusComponent
  extends VaccinationBaseDetailComponent<
    void,
    VaccinationStatusDevelopmentData,
    VaccinationStatusDemographyData,
    void,
    void,
    VaccinationStatusVaccineDevelopmentData
  >
  implements OnInit, OnDestroy
{
  readonly simpleGdi = VaccinationSimpleGdi.VACC_STATUS

  readonly indicatorFilterOptions = indicatorFilterOptions(DEFAULT_INDICATOR_FILTER)
  readonly indicatorFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.INDICATOR] || null)
  readonly indicatorFilter$ = this.route.queryParams.pipe(
    selectChanged(QueryParams.INDICATOR, DEFAULT_INDICATOR_FILTER),
    tap(emitValToOwnViewFn(this.indicatorFilterCtrl, DEFAULT_INDICATOR_FILTER)),
  )

  // if exists, returns dataState dependant warn key, otherwise return defaultWarnKey
  readonly warningKey$: Observable<string | null> = this.dataService.sourceDate$.pipe(
    map((sourceDate) => `Vaccination.Status.Warning.${formatUtcDate(sourceDate, 'yyyyMMdd')}`),
    map((specialWarnKey) => {
      const defaultKey = `Vaccination.Status.Warning`
      if (this.translator.tryGet(specialWarnKey)) {
        return specialWarnKey
      } else if (this.translator.tryGet(defaultKey)) {
        return defaultKey
      }
      return null
    }),
  )

  protected readonly onDestroy = new Subject<void>()

  ngOnInit() {
    this.indicatorFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.INDICATOR]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }
}
