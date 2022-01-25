import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BaseReproCardComponent } from '../../../cards-repro/base-repro-card.component'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({ template: '' })
export abstract class ShareVirusVariantsBaseComponent<T> {
  readonly data: T = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
  readonly isExport = this.route.snapshot.queryParams[QueryParams.IS_EXPORT] === 'true'
  readonly hideInfo = this.route.snapshot.queryParams[QueryParams.HIDE_INFO] === 'true'
  readonly facet: BaseReproCardComponent<any>['facet'] = this.isExport ? 'print' : null
  readonly introKey = `Epidemiologic.VirusVariants.DetailIntro`

  constructor(protected readonly route: ActivatedRoute) {}
}
