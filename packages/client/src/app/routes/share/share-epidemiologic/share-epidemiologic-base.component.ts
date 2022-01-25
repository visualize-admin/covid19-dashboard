import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { EpidemiologicSimpleGdi, GdiObjectContext } from '@c19/commons'
import { pascalCase } from 'change-case'
import { PathParams } from '../../../shared/models/path-params.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({ template: '' })
export abstract class ShareEpidemiologicBaseComponent<T extends GdiObjectContext> {
  readonly data: T = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
  readonly isExport = this.route.snapshot.queryParams[QueryParams.IS_EXPORT] === 'true'
  readonly hideInfo = this.route.snapshot.queryParams[QueryParams.HIDE_INFO] === 'true'
  readonly facet = this.isExport ? 'print' : null

  introKey: string
  introKeyEpi: string

  private readonly epiSimpleGdi: EpidemiologicSimpleGdi

  constructor(protected readonly route: ActivatedRoute) {
    // tslint:disable-next-line:no-non-null-assertion
    const parent = route.snapshot.parent!

    this.epiSimpleGdi = parent.params[PathParams.DETAIL_DATA_OBJECT_KEY] || EpidemiologicSimpleGdi.CASE
    this.introKey = `Epidemiologic.${pascalCase(this.epiSimpleGdi)}.DetailIntro`
    this.introKeyEpi = `Detail${pascalCase(this.epiSimpleGdi)}.Intro`
  }
}
