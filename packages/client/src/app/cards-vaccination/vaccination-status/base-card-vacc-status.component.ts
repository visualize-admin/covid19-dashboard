import { Component } from '@angular/core'
import { DEFAULT_INDICATOR_FILTER, IndicatorFilter } from '../../shared/models/filters/indicator-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { selectChanged } from '../../static-utils/select-changed.operator'
import {
  BaseDetailCardVaccinationComponent,
  CurrentValuesVaccinationBase,
  VaccRestrictedGdiObjectTimespanContext,
} from '../base-detail-card-vaccination.component'

export interface CurrentValuesVaccStatusBase extends CurrentValuesVaccinationBase {
  indicator: IndicatorFilter
}

@Component({ template: '' })
export abstract class BaseCardVaccStatusComponent<
  T extends VaccRestrictedGdiObjectTimespanContext,
> extends BaseDetailCardVaccinationComponent<T> {
  readonly indicatorFilter$ = this.route.queryParams.pipe(
    selectChanged(QueryParams.INDICATOR, DEFAULT_INDICATOR_FILTER),
  )

  protected init(): void {}

  protected override prepareDescription({ geoUnit, timeSpan, indicator }: CurrentValuesVaccStatusBase): string {
    return [
      this.translator.get(`Vaccination.Status.Card.${this.indicatorKey(indicator)}.Title`),
      this.translator.get(`GeoFilter.${geoUnit}`),
      this.translator.get('Commons.DateToDate', {
        date1: formatUtcDate(parseIsoDate(timeSpan.start)),
        date2: formatUtcDate(parseIsoDate(timeSpan.end)),
      }),
    ].join(', ')
  }

  protected indicatorKey(indicator: IndicatorFilter): string {
    switch (indicator) {
      case IndicatorFilter.HOSP:
        return 'Hosp'
      case IndicatorFilter.DEATH:
        return 'Death'
    }
  }
}
