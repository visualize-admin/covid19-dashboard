import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { GdiObject, GdiObjectContext, VaccinationGdiObject, VaccinationSimpleGdi } from '@c19/commons'
import { PathParams } from '../../../shared/models/path-params.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

interface VaccGdiContext extends GdiObjectContext {
  gdiObject: VaccinationGdiObject
}

@Component({ template: '' })
export abstract class ShareVaccinationBaseComponent<T extends VaccGdiContext> {
  readonly data: T = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
  readonly isExport = this.route.snapshot.queryParams[QueryParams.IS_EXPORT] === 'true'
  readonly hideInfo = this.route.snapshot.queryParams[QueryParams.HIDE_INFO] === 'true'
  readonly facet = this.isExport ? 'print' : null

  introKey: string

  // vacc-doses
  get isVaccDoses(): boolean {
    return this.simpleGdi === VaccinationSimpleGdi.VACC_DOSES
  }

  // vacc-persons
  get isVaccPersons(): boolean {
    return this.simpleGdi === VaccinationSimpleGdi.VACC_PERSONS
  }

  // vacc-symptoms
  get isVaccSymptoms(): boolean {
    return this.simpleGdi === VaccinationSimpleGdi.VACC_SYMPTOMS
  }

  get isVaccStatus(): boolean {
    return this.simpleGdi === VaccinationSimpleGdi.VACC_STATUS
  }

  private readonly simpleGdi: VaccinationSimpleGdi

  constructor(protected readonly route: ActivatedRoute) {
    // tslint:disable-next-line:no-non-null-assertion
    const parent = route.snapshot.parent!

    this.simpleGdi =
      <VaccinationSimpleGdi>`vacc-${parent.params[PathParams.DETAIL_DATA_OBJECT_KEY]}` ||
      VaccinationSimpleGdi.VACC_DOSES

    this.introKey = this.getIntroKey()
  }

  private getIntroKey(): string {
    switch (this.data.gdiObject) {
      case GdiObject.VACC_DOSES:
        return 'Vaccination.VaccDoses.DetailIntro'
      case GdiObject.VACC_PERSONS:
        return 'Vaccination.VaccPersonsFull.DetailIntroByResidence'
      case GdiObject.VACC_SYMPTOMS:
        return 'Vaccination.VaccSymptoms.DetailIntro'
      case GdiObject.VACC_BREAKTHROUGH:
        return 'Vaccination.Breakthrough.DetailIntro'
      case GdiObject.EPI_VACC_STATUS:
        return 'Vaccination.Status.DetailIntro'
    }
  }
}
