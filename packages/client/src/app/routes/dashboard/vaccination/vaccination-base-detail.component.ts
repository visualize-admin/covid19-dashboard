import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CantonGeoUnit,
  DEFAULT_GEO_UNIT,
  EpidemiologicVaccDemographyData,
  EpidemiologicVaccDemographyDataV2,
  EpidemiologicVaccDosesAdministeredIndicationDevelopmentData,
  EpidemiologicVaccDosesDevelopmentData,
  EpidemiologicVaccDosesGeographyData,
  EpidemiologicVaccDosesLocationDevelopmentData,
  EpidemiologicVaccDosesVaccineDevelopmentData,
  EpidemiologicVaccPersonsDevelopmentData,
  EpidemiologicVaccPersonsGeoData,
  EpidemiologicVaccPersonsIndicationDevelopmentData,
  EpidemiologicVaccPersonsVaccineDevelopmentData,
  EpidemiologicVaccSymptomsDemographyData,
  EpidemiologicVaccSymptomsDevelopmentData,
  TopLevelGeoUnit,
  VaccinationSimpleGdi,
  VaccinationStatusDemographyData,
  VaccinationStatusDevelopmentData,
  VaccinationStatusVaccineDevelopmentData,
} from '@c19/commons'
import { Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'
import { CombinedVaccinationData, DataService } from '../../../core/data/data.service'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { ExtendedGeoFeatureCollection } from '../../../diagrams/choropleth/base-choropleth.component'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({ template: '' })
export abstract class VaccinationBaseDetailComponent<
  GEO = EpidemiologicVaccPersonsGeoData | EpidemiologicVaccDosesGeographyData,
  DEV =
    | EpidemiologicVaccPersonsDevelopmentData
    | EpidemiologicVaccDosesDevelopmentData
    | EpidemiologicVaccSymptomsDevelopmentData
    | VaccinationStatusDevelopmentData,
  DEM =
    | EpidemiologicVaccDemographyData
    | EpidemiologicVaccDemographyDataV2
    | EpidemiologicVaccSymptomsDemographyData
    | VaccinationStatusDemographyData,
  LOC = EpidemiologicVaccDosesLocationDevelopmentData,
  IND = EpidemiologicVaccDosesAdministeredIndicationDevelopmentData | EpidemiologicVaccPersonsIndicationDevelopmentData,
  VAC =
    | EpidemiologicVaccDosesVaccineDevelopmentData
    | EpidemiologicVaccPersonsVaccineDevelopmentData
    | VaccinationStatusVaccineDevelopmentData,
> {
  abstract readonly simpleGdi: VaccinationSimpleGdi

  // tslint:disable-next-line:no-non-null-assertion
  readonly chflGeoJson: ExtendedGeoFeatureCollection = this.route.parent!.snapshot.data[RouteDataKey.GEO_JSON]

  readonly geoFilter$: Observable<CantonGeoUnit | TopLevelGeoUnit> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
  )

  readonly data$: Observable<CombinedVaccinationData<GEO, DEV, DEM, LOC, IND, VAC>>

  constructor(
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly dataService: DataService,
    protected readonly translator: TranslatorService,
  ) {
    this.data$ = this.geoFilter$.pipe(
      switchMap((geoFilter) => <Promise<any>>this.dataService.loadCombinedVaccinationData(this.simpleGdi, geoFilter)),
      shareReplay(1),
    )
  }
}
