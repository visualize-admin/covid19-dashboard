import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { GdiObjectContext } from '@c19/commons'
import { PathParams } from '../../../shared/models/path-params.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { SimpleGdiObjectKey } from '../../../shared/models/simple-gdi-object-key.enum'
import { pascalCase } from 'change-case'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({ template: '' })
export abstract class ShareHospCapacityBaseComponent<T extends GdiObjectContext> {
  // tslint:disable-next-line:no-non-null-assertion
  readonly data: T = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
  readonly introKey: string
  readonly isExport = this.route.snapshot.queryParams[QueryParams.IS_EXPORT] === 'true'
  readonly hideInfo = this.route.snapshot.queryParams[QueryParams.HIDE_INFO] === 'true'

  constructor(protected readonly route: ActivatedRoute) {
    // tslint:disable-next-line:no-non-null-assertion
    const parentRoute = route.snapshot.parent!

    const dataObjectKeyParam: SimpleGdiObjectKey = parentRoute.params[PathParams.DETAIL_DATA_OBJECT_KEY] || 'icu'
    const topic = pascalCase(dataObjectKeyParam)
    this.introKey = `HospCapacity.${topic}.DetailIntro`
  }
}
