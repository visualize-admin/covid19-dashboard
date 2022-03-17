import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import {
  API_DATA_PATH,
  API_PATH,
  CantonGeoUnit,
  CovidVirusVariantsGeographyDataV2,
  CovidVirusVariantsWgsDevelopmentData,
  DailyReportData,
  EpidemiologicDemographyData,
  EpidemiologicDevelopmentData,
  EpidemiologicGeographyData,
  EpidemiologicSimpleGdi,
  EpidemiologicTestDevelopmentData,
  EpidemiologicTestGeographyData,
  EpidemiologicVaccDemographyData,
  EpidemiologicVaccDemographyDataV2,
  EpidemiologicVaccDosesDevelopmentData,
  EpidemiologicVaccDosesGeographyData,
  EpidemiologicVaccDosesLocationDevelopmentData,
  EpidemiologicVaccDosesVaccineDevelopmentData,
  EpidemiologicVaccIndicationDevelopmentData,
  EpidemiologicVaccPersonsDevelopmentData,
  EpidemiologicVaccPersonsGeoData,
  EpidemiologicVaccPersonsVaccineDevelopmentData,
  EpidemiologicVaccSymptomsDemographyData,
  EpidemiologicVaccSymptomsDevelopmentData,
  ExtraGeoUnitsData,
  GdiObject,
  HospCapacityCertAdhocDevelopmentData,
  HospCapacityDevelopmentData,
  HospCapacityGdiObjects,
  HospCapacityGeographyData,
  HospReasonAgeRangeData,
  InternationalComparisonDetailData,
  InternationalComparisonDetailGeoData,
  InternationalQuarantineData,
  IntGeoUnit,
  isDefined,
  OverviewDataV4,
  PublicDataContext,
  ReDevelopment,
  ReGeography,
  TopLevelGeoUnit,
  VaccinationSimpleGdi,
  VaccinationStatusDemographyData,
  VaccinationStatusDevelopmentData,
  VaccinationStatusVaccineDevelopmentData,
  WeeklyReportEpidemiologicDemographyCard,
  WeeklyReportEpidemiologicGeographyCard,
  WeeklyReportEpidemiologicSummaryCard,
  WeeklyReportHospCapacityDataCard,
  WeeklyReportHospCapacitySummaryCard,
  WeeklyReportListItem,
  WeeklyReportMethodsCard,
  WeeklyReportPositivityRateGeographyCard,
  WeeklyReportWeekList,
  WeeklySituationReportDevelopmentCard,
  WeeklySituationReportSummaryCard,
  WeeklySitutationReportOverviewCard,
} from '@c19/commons'
import { Logger, LoggerService } from '@shiftcode/ngx-core'
import { firstValueFrom, from, Observable, ReplaySubject } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { GeoLevelFilter } from '../../shared/models/filters/geo-level-filter.enum'
import { ClientConfigService } from '../client-config.service'
import { REQUEST_OPTIONS, RequestOptions } from '../request-options'

export interface EpidemiologicMenuData {
  [GdiObject.CASE]: EpidemiologicDevelopmentData
  [GdiObject.HOSP]: EpidemiologicDevelopmentData
  [GdiObject.DEATH]: EpidemiologicDevelopmentData
  [GdiObject.TEST]: EpidemiologicTestDevelopmentData
  [GdiObject.RE]: ReDevelopment | null
}

export interface VaccinationMenuData {
  [GdiObject.VACC_DOSES]: EpidemiologicVaccDosesDevelopmentData
  [GdiObject.VACC_PERSONS]: EpidemiologicVaccPersonsGeoData
  [GdiObject.VACC_SYMPTOMS]: EpidemiologicVaccSymptomsDevelopmentData
}

export interface CombinedEpidemiologicData<
  GEO = EpidemiologicGeographyData | EpidemiologicTestGeographyData,
  DEV = EpidemiologicDevelopmentData | EpidemiologicTestDevelopmentData,
  DEM = EpidemiologicDemographyData | EpidemiologicVaccDemographyData,
  RSN = HospReasonAgeRangeData,
> {
  geography: GEO
  development: DEV
  demography: DEM
  hospReason: RSN
}

export interface CombinedVaccinationData<
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
  IND = EpidemiologicVaccIndicationDevelopmentData,
  VAC =
    | EpidemiologicVaccDosesVaccineDevelopmentData
    | EpidemiologicVaccPersonsVaccineDevelopmentData
    | VaccinationStatusVaccineDevelopmentData,
> {
  geography: GEO
  development: DEV
  demography: DEM
  location: LOC
  indication: IND
  vaccine: VAC
}

export interface CombinedVirusVariantsData {
  geography: CovidVirusVariantsGeographyDataV2
  segmentation: CovidVirusVariantsWgsDevelopmentData
}

export interface CombinedReproductionData {
  geography: ReGeography
  development: ReDevelopment | null
}

export interface CombinedWeeklyReportData {
  geography: WeeklyReportDataPair<WeeklyReportEpidemiologicGeographyCard>
  demography: WeeklyReportDataPair<WeeklyReportEpidemiologicDemographyCard>
  summary: WeeklyReportDataPair<WeeklyReportEpidemiologicSummaryCard>
}

export interface CombinedWeeklyReportTestData extends CombinedWeeklyReportData {
  testPositivity: WeeklyReportDataPair<WeeklyReportPositivityRateGeographyCard>
}

export interface CombinedWeeklyReportSituationData {
  summary: WeeklyReportDataPair<WeeklySituationReportSummaryCard>
  overview: WeeklyReportDataPair<WeeklySitutationReportOverviewCard>
  development: WeeklySituationReportDevelopmentCard
}

export interface CombinedWeeklyReportHospCapacityIcuData {
  summary: WeeklyReportDataPair<WeeklyReportHospCapacitySummaryCard>
  data: WeeklyReportDataPair<WeeklyReportHospCapacityDataCard>
}

export interface CombinedWeeklyReportMethodData {
  text: WeeklyReportDataPair<WeeklyReportMethodsCard>
}

export interface WeeklyReportDataPair<T> {
  curr: T
  prev: T
}

@Injectable({ providedIn: 'root' })
export class DataService {
  static readonly API_DATA = `/${API_PATH}/${API_DATA_PATH}`
  readonly sourceDate$: Observable<Date>
  readonly context$: Observable<PublicDataContext>
  private readonly dataEndpoint$: Promise<string>
  private readonly _dataVersionEndpoint$: Observable<string>
  private readonly contextSubject = new ReplaySubject<PublicDataContext>(1)
  private readonly cache = new Map<string, Promise<any>>()
  private readonly logger: Logger

  private get dataVersionEndpoint(): Promise<string> {
    return firstValueFrom(this._dataVersionEndpoint$)
  }

  constructor(
    loggerService: LoggerService,
    clientConfig: ClientConfigService,
    private readonly httpClient: HttpClient,
    @Inject(REQUEST_OPTIONS) private readonly reqOpts: RequestOptions,
  ) {
    this.logger = loggerService.getInstance('DataService')

    this.dataEndpoint$ = clientConfig.config$.then((v) => v.dataEndpoint)
    this.context$ = this.contextSubject.asObservable()
    this.sourceDate$ = this.context$.pipe(map((v) => new Date(v.sourceDate)))

    this._dataVersionEndpoint$ = from(this.dataEndpoint$).pipe(
      switchMap((dataEndpoint) => this.context$.pipe(map((ctx) => [dataEndpoint, ctx] as const))),
      map(([endpoint, { dataVersion }]) => `${endpoint}${DataService.API_DATA}/${dataVersion}`),
      shareReplay(1),
    )
  }

  /**
   * initialize the dataService
   * - should to be done from the route guard
   * @return whether or not the queryParams was ok on given route
   */
  async init(forceDataState?: string): Promise<boolean> {
    const endpoint = await this.dataEndpoint$
    let context: PublicDataContext | null = null
    let ok = true
    if (isDefined(forceDataState)) {
      try {
        context = await this.loadContext(endpoint, forceDataState)
      } catch (err) {
        ok = false
        this.logger.warn(`given data state ${forceDataState} seems not to be existent`)
      }
    }
    if (context === null) {
      context = await this.loadContext(endpoint)
    }
    this.contextSubject.next(context)
    return ok
  }

  async loadHospCapacityGeographyData(gdi: HospCapacityGdiObjects): Promise<HospCapacityGeographyData> {
    const fileKey = gdi === GdiObject.HOSP_CAPACITY_ICU ? 'icu' : 'tot'
    return this.loadFile<HospCapacityGeographyData>(`hospcapacity/hospcapacity-geography-${fileKey}.json`)
  }

  async loadHospCapacityDevelopmentData(
    geoUnit: CantonGeoUnit | null,
    gdi: HospCapacityGdiObjects,
  ): Promise<HospCapacityDevelopmentData> {
    const geoKey = (geoUnit || TopLevelGeoUnit.CH).toLowerCase()
    const fileKey = gdi === GdiObject.HOSP_CAPACITY_ICU ? 'icu' : 'tot'
    return this.loadFile<HospCapacityDevelopmentData>(`hospcapacity/hospcapacity-development-${fileKey}-${geoKey}.json`)
  }

  async loadHospCapacityCertAdhocDevelopmentData(
    geoUnit: CantonGeoUnit | null,
  ): Promise<HospCapacityCertAdhocDevelopmentData> {
    const geoKey = (geoUnit || TopLevelGeoUnit.CH).toLowerCase()
    return this.loadFile<HospCapacityCertAdhocDevelopmentData>(
      `hospcapacity/hospcapacity-development-icu-certadhoc-${geoKey}.json`,
    )
  }

  async loadOverviewData(): Promise<OverviewDataV4> {
    return this.loadFile<OverviewDataV4>('overview/overview-v4.json')
  }

  async loadDailyReportData(): Promise<DailyReportData> {
    const ov = await this.loadFile<OverviewDataV4>('overview/overview-v4.json')
    return ov.dailyReport
  }

  async loadEpidemiologicGeographyData(
    gdi: EpidemiologicSimpleGdi,
  ): Promise<EpidemiologicGeographyData | EpidemiologicTestGeographyData> {
    const filePath = `epidemiologic/epidemiologic-geography-${gdi}.json`
    return this.loadFile<any>(filePath)
  }

  async loadEpidemiologicDevelopmentData(
    gdi: EpidemiologicSimpleGdi,
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<EpidemiologicDevelopmentData | EpidemiologicTestDevelopmentData> {
    const filePath = `epidemiologic/epidemiologic-development-${gdi}-${geoUnit.toLowerCase()}.json`
    return this.loadFile<any>(filePath)
  }

  async loadEpidemiologicDemographyData(
    gdi: EpidemiologicSimpleGdi | VaccinationSimpleGdi,
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<EpidemiologicDemographyData> {
    const filePath = `epidemiologic/epidemiologic-demography-${gdi}-${geoUnit.toLowerCase()}.json`
    return this.loadFile<any>(filePath)
  }

  async loadEpidemiologicHospReasonData(geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<HospReasonAgeRangeData> {
    const filePath = `epidemiologic/epidemiologic-agerange-hosp-reason-${geoUnit.toLowerCase()}.json`
    return this.loadFile<HospReasonAgeRangeData>(filePath)
  }

  async loadEpidemiologicMenuData(geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<EpidemiologicMenuData> {
    const data: Array<readonly [GdiObject, any]> = await Promise.all([
      this.loadEpidemiologicDevelopmentData(EpidemiologicSimpleGdi.CASE, geoUnit).then(
        (v) => [GdiObject.CASE, v] as const,
      ),
      this.loadEpidemiologicDevelopmentData(EpidemiologicSimpleGdi.HOSP, geoUnit).then(
        (v) => [GdiObject.HOSP, v] as const,
      ),
      this.loadEpidemiologicDevelopmentData(EpidemiologicSimpleGdi.DEATH, geoUnit).then(
        (v) => [GdiObject.DEATH, v] as const,
      ),
      this.loadEpidemiologicDevelopmentData(EpidemiologicSimpleGdi.TEST, geoUnit).then(
        (v) => [GdiObject.TEST, v] as const,
      ),
      this.loadReproductionDevelopmentData(geoUnit).then((v) => [GdiObject.RE, v] as const),
    ])
    return data.reduce<any>((u, [k, v]) => ({ ...u, [k]: v }), {})
  }

  async loadCombinedEpidemiologicData(
    gdi: EpidemiologicSimpleGdi,
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<CombinedEpidemiologicData> {
    if (gdi === EpidemiologicSimpleGdi.HOSP) {
      const [geography, development, demography, hospReason] = await Promise.all([
        this.loadEpidemiologicGeographyData(gdi),
        this.loadEpidemiologicDevelopmentData(gdi, geoUnit),
        this.loadEpidemiologicDemographyData(gdi, geoUnit),
        this.loadEpidemiologicHospReasonData(geoUnit),
      ])
      return <any>{ geography, development, demography, hospReason }
    } else {
      const [geography, development, demography] = await Promise.all([
        this.loadEpidemiologicGeographyData(gdi),
        this.loadEpidemiologicDevelopmentData(gdi, geoUnit),
        this.loadEpidemiologicDemographyData(gdi, geoUnit),
      ])
      return <any>{ geography, development, demography, hospReason: undefined }
    }
  }

  async loadVaccinationGeographyData(
    gdi: VaccinationSimpleGdi.VACC_DOSES | VaccinationSimpleGdi.VACC_PERSONS,
  ): Promise<EpidemiologicVaccDosesGeographyData | EpidemiologicVaccPersonsGeoData> {
    const filePath =
      gdi === VaccinationSimpleGdi.VACC_PERSONS
        ? `epidemiologic/epidemiologic-geography-new-${gdi}.json`
        : `epidemiologic/epidemiologic-geography-${gdi}.json`
    return this.loadFile<any>(filePath)
  }

  async loadVaccinationDevelopmentData(
    gdi: VaccinationSimpleGdi,
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<
    | EpidemiologicVaccSymptomsDevelopmentData
    | EpidemiologicVaccPersonsDevelopmentData
    | EpidemiologicVaccDosesDevelopmentData
    | VaccinationStatusDevelopmentData
  > {
    const filePath = `epidemiologic/epidemiologic-development-${gdi}-${geoUnit.toLowerCase()}.json`
    return this.loadFile<any>(filePath)
  }

  async loadVaccinationDosesDevelopmentLocationData(
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<EpidemiologicVaccDosesLocationDevelopmentData> {
    const filePath = `epidemiologic/epidemiologic-development-${
      VaccinationSimpleGdi.VACC_DOSES
    }-location-${geoUnit.toLowerCase()}.json`
    return this.loadFile<EpidemiologicVaccDosesLocationDevelopmentData>(filePath)
  }

  async loadVaccinationDemographyData(
    gdi: VaccinationSimpleGdi,
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<
    EpidemiologicVaccDemographyDataV2 | EpidemiologicVaccSymptomsDemographyData | VaccinationStatusDemographyData
  > {
    const filePath =
      gdi === VaccinationSimpleGdi.VACC_PERSONS
        ? `epidemiologic/epidemiologic-demography-${
            VaccinationSimpleGdi.VACC_PERSONS
          }-new-${geoUnit.toLowerCase()}.json`
        : `epidemiologic/epidemiologic-demography-${gdi}-${geoUnit.toLowerCase()}.json`
    return this.loadFile<any>(filePath)
  }

  async loadVaccinationDevelopmentIndicationData(
    gdi: VaccinationSimpleGdi.VACC_DOSES | VaccinationSimpleGdi.VACC_PERSONS,
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<EpidemiologicVaccIndicationDevelopmentData> {
    const filePath = `epidemiologic/epidemiologic-development-${gdi}-indication-${geoUnit.toLowerCase()}.json`
    return this.loadFile<EpidemiologicVaccIndicationDevelopmentData>(filePath)
  }

  async loadVaccinationDevelopmentVaccineData(
    gdi: VaccinationSimpleGdi.VACC_DOSES | VaccinationSimpleGdi.VACC_PERSONS | VaccinationSimpleGdi.VACC_STATUS,
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<
    | EpidemiologicVaccDosesVaccineDevelopmentData
    | EpidemiologicVaccPersonsVaccineDevelopmentData
    | VaccinationStatusVaccineDevelopmentData
  > {
    const filePath = `epidemiologic/epidemiologic-development-${gdi}-vaccine-${geoUnit.toLowerCase()}.json`
    return this.loadFile<
      | EpidemiologicVaccDosesVaccineDevelopmentData
      | EpidemiologicVaccPersonsVaccineDevelopmentData
      | VaccinationStatusVaccineDevelopmentData
    >(filePath)
  }

  async loadVaccinationMenuData(geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<VaccinationMenuData> {
    const data = await Promise.all([
      this.loadVaccinationDevelopmentData(VaccinationSimpleGdi.VACC_DOSES, geoUnit),
      this.loadVaccinationGeographyData(VaccinationSimpleGdi.VACC_PERSONS),
      this.loadVaccinationDevelopmentData(VaccinationSimpleGdi.VACC_SYMPTOMS, geoUnit),
    ])
    return data.reduce((u, entry) => ({ ...u, [entry.gdiObject]: entry }), <any>{})
  }

  async loadCombinedVaccinationData(
    gdi: VaccinationSimpleGdi,
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<CombinedVaccinationData> {
    if (gdi === VaccinationSimpleGdi.VACC_PERSONS) {
      const [geography, development, demography, indication, vaccine] = await Promise.all([
        this.loadVaccinationGeographyData(gdi),
        this.loadVaccinationDevelopmentData(gdi, geoUnit),
        this.loadVaccinationDemographyData(gdi, geoUnit),
        this.loadVaccinationDevelopmentIndicationData(gdi, geoUnit),
        this.loadVaccinationDevelopmentVaccineData(gdi, geoUnit),
      ])
      return <any>{ geography, development, demography, location: undefined, indication, vaccine }
    } else if (gdi === VaccinationSimpleGdi.VACC_SYMPTOMS) {
      const [development, demography] = await Promise.all([
        this.loadVaccinationDevelopmentData(gdi, geoUnit),
        this.loadVaccinationDemographyData(gdi, geoUnit),
      ])
      return <any>{
        geography: undefined,
        development,
        demography,
        location: undefined,
        indication: undefined,
        vaccine: undefined,
      }
    } else if (gdi === VaccinationSimpleGdi.VACC_DOSES) {
      const [geography, development, demography, location, indication, vaccine] = await Promise.all([
        this.loadVaccinationGeographyData(gdi),
        this.loadVaccinationDevelopmentData(gdi, geoUnit),
        this.loadVaccinationDemographyData(gdi, geoUnit),
        this.loadVaccinationDosesDevelopmentLocationData(geoUnit),
        this.loadVaccinationDevelopmentIndicationData(gdi, geoUnit),
        this.loadVaccinationDevelopmentVaccineData(gdi, geoUnit),
      ])
      return { geography, development, demography, location, indication, vaccine }
    } else if (gdi === VaccinationSimpleGdi.VACC_BREAKTHROUGH) {
      const [development, demography] = await Promise.all([
        this.loadVaccinationDevelopmentData(gdi, geoUnit),
        this.loadVaccinationDemographyData(gdi, geoUnit),
      ])
      return <any>{
        geography: undefined,
        development,
        demography,
        location: undefined,
        indication: undefined,
        vaccine: undefined,
      }
    } else if (gdi === VaccinationSimpleGdi.VACC_STATUS) {
      const [development, demography, vaccine] = await Promise.all([
        this.loadVaccinationDevelopmentData(gdi, geoUnit),
        this.loadVaccinationDemographyData(gdi, geoUnit),
        this.loadVaccinationDevelopmentVaccineData(gdi, geoUnit),
      ])
      return <any>{
        geography: undefined,
        development,
        demography,
        location: undefined,
        indication: undefined,
        vaccine,
      }
    } else {
      return <any>{
        geography: undefined,
        development: undefined,
        demography: undefined,
        location: undefined,
        indication: undefined,
        vaccine: undefined,
      }
    }
  }

  async loadVirusVariantsGeographyData(): Promise<CovidVirusVariantsGeographyDataV2> {
    const filePath = `epidemiologic/epidemiologic-geography-${EpidemiologicSimpleGdi.VIRUS_VARIANTS}-wgs.json`
    return this.loadFile<CovidVirusVariantsGeographyDataV2>(filePath)
  }

  async loadVirusVariantsDevelopmentWgsData(
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ): Promise<CovidVirusVariantsWgsDevelopmentData> {
    const filePath = `epidemiologic/epidemiologic-development-${
      EpidemiologicSimpleGdi.VIRUS_VARIANTS
    }-wgs-${geoUnit.toLowerCase()}.json`
    return this.loadFile<CovidVirusVariantsWgsDevelopmentData>(filePath)
  }

  async loadCombinedVirusVariantsData(geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<CombinedVirusVariantsData> {
    const [geography, developmentWgs] = await Promise.all([
      this.loadVirusVariantsGeographyData(),
      this.loadVirusVariantsDevelopmentWgsData(geoUnit),
    ])
    return {
      geography,
      segmentation: developmentWgs,
    }
  }

  async loadReproductionDevelopmentData(geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<ReDevelopment | null> {
    if (geoUnit === TopLevelGeoUnit.CHFL) {
      return null
    }
    return this.loadFile<ReDevelopment>(`re/re-development-${geoUnit.toLowerCase()}.json`)
  }

  async loadReproductionGeographyData(): Promise<ReGeography> {
    return this.loadFile<ReGeography>(`re/re-geography-${TopLevelGeoUnit.CHFL.toLowerCase()}.json`)
  }

  async loadCombinedReproductionData(geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<CombinedReproductionData> {
    const [geography, development] = await Promise.all([
      this.loadReproductionGeographyData(),
      this.loadReproductionDevelopmentData(geoUnit),
    ])
    return { geography, development }
  }

  /**
   * get international development data by country|world
   * @returns the data or null if no data available (204 empty response)
   */
  async loadInternationalDevelopmentData(
    geoUnit: IntGeoUnit | null,
  ): Promise<InternationalComparisonDetailData | null> {
    const intGeoUnit = geoUnit || 'WORLD'
    return this.loadFile<InternationalComparisonDetailData | null>(
      `international/international-development-${intGeoUnit.toLowerCase()}.json`,
    )
  }

  async loadInternationalGeographyData(): Promise<InternationalComparisonDetailGeoData> {
    return this.loadFile<InternationalComparisonDetailGeoData>(`international/international-geography.json`)
  }

  async loadInternationalQuarantineData(): Promise<InternationalQuarantineData> {
    return this.loadFile<InternationalQuarantineData>('international/quarantine.json')
  }

  async loadWeeklyReportList(): Promise<WeeklyReportWeekList> {
    return this.loadFile('weekly-report/weekly-report-week-list.json')
  }

  async loadWeeklyReportSummaryData(reportItem: WeeklyReportListItem) {
    const filenameFn = (isoWeek: number) => `weekly-report/weekly-report-sit-rep-summary-${isoWeek}.json`
    return this.loadWeeklyReportFiles<WeeklySituationReportSummaryCard>(filenameFn, reportItem)
  }

  async loadWeeklyReportDevelopmentData() {
    return this.loadFile<WeeklySituationReportDevelopmentCard>('weekly-report/weekly-report-development-chfl.json')
  }

  async loadWeeklyReportOverviewData(reportItem: WeeklyReportListItem) {
    const filenameFn = (isoWeek: number) => `weekly-report/weekly-report-sit-rep-overview-${isoWeek}.json`
    return this.loadWeeklyReportFiles<WeeklySitutationReportOverviewCard>(filenameFn, reportItem)
  }

  async loadWeeklyReportGeographyData(simpleObjGdi: EpidemiologicSimpleGdi, reportItem: WeeklyReportListItem) {
    const filenameFn = (isoWeek: number) => `weekly-report/weekly-report-${simpleObjGdi}-geography-${isoWeek}.json`
    return this.loadWeeklyReportFiles<WeeklyReportEpidemiologicGeographyCard>(filenameFn, reportItem)
  }

  async loadWeeklyReportDemographyData(simpleObjGdi: EpidemiologicSimpleGdi, reportItem: WeeklyReportListItem) {
    const filenameFn = (isoWeek: number) => `weekly-report/weekly-report-${simpleObjGdi}-demography-${isoWeek}.json`
    return this.loadWeeklyReportFiles<WeeklyReportEpidemiologicDemographyCard>(filenameFn, reportItem)
  }

  async loadWeeklyReportEpidemiologicSummaryData(
    simpleObjGdi: EpidemiologicSimpleGdi,
    reportItem: WeeklyReportListItem,
  ) {
    const filenameFn = (isoWeek: number) => `weekly-report/weekly-report-${simpleObjGdi}-summary-${isoWeek}.json`
    return this.loadWeeklyReportFiles<WeeklyReportEpidemiologicSummaryCard>(filenameFn, reportItem)
  }

  async loadWeeklyReportTestPositivityData(reportItem: WeeklyReportListItem) {
    const filenameFn = (isoWeek: number) => `weekly-report/weekly-report-test-positivity-geography-${isoWeek}.json`
    return this.loadWeeklyReportFiles<WeeklyReportPositivityRateGeographyCard>(filenameFn, reportItem)
  }

  async loadWeeklyReportHospCapacityIcuSummary(reportItem: WeeklyReportListItem) {
    const filenameFn = (isoWeek: number) => `weekly-report/weekly-report-hosp-capacity-icu-summary-${isoWeek}.json`
    return this.loadWeeklyReportFiles<WeeklyReportHospCapacitySummaryCard>(filenameFn, reportItem)
  }

  async loadWeeklyReportHospCapacityIcuData(reportItem: WeeklyReportListItem) {
    const filenameFn = (isoWeek: number) => `weekly-report/weekly-report-hosp-capacity-icu-data-${isoWeek}.json`
    return this.loadWeeklyReportFiles<WeeklyReportHospCapacityDataCard>(filenameFn, reportItem)
  }

  async loadWeeklyReportMethodAndSourcesData(reportItem: WeeklyReportListItem) {
    const filenameFn = (isoWeek: number) => `weekly-report/weekly-report-method-summary-${isoWeek}.json`
    return this.loadWeeklyReportFiles<WeeklyReportMethodsCard>(filenameFn, reportItem)
  }

  async loadCombinedWeeklyReportData(
    gdi: EpidemiologicSimpleGdi,
    reportItem: WeeklyReportListItem,
  ): Promise<CombinedWeeklyReportData | CombinedWeeklyReportTestData> {
    const [geography, demography, summary, testPositivity] = await Promise.all([
      this.loadWeeklyReportGeographyData(gdi, reportItem),
      this.loadWeeklyReportDemographyData(gdi, reportItem),
      this.loadWeeklyReportEpidemiologicSummaryData(gdi, reportItem),
      gdi === EpidemiologicSimpleGdi.TEST ? this.loadWeeklyReportTestPositivityData(reportItem) : undefined,
    ])
    return { geography, demography, summary, testPositivity }
  }

  async loadCombinedWeeklyReportSituationData(
    reportItem: WeeklyReportListItem,
  ): Promise<CombinedWeeklyReportSituationData> {
    const [summary, overview, development] = await Promise.all([
      this.loadWeeklyReportSummaryData(reportItem),
      this.loadWeeklyReportOverviewData(reportItem),
      this.loadWeeklyReportDevelopmentData(),
    ])
    return { summary, overview, development }
  }

  async loadCombinedWeeklyReportHospCapacityIcuData(
    reportItem: WeeklyReportListItem,
  ): Promise<CombinedWeeklyReportHospCapacityIcuData> {
    const [summary, data] = await Promise.all([
      this.loadWeeklyReportHospCapacityIcuSummary(reportItem),
      this.loadWeeklyReportHospCapacityIcuData(reportItem),
    ])
    return { summary, data }
  }

  async loadCombinedWeeklyReportMethodsAndSourcesData(
    reportItem: WeeklyReportListItem,
  ): Promise<CombinedWeeklyReportMethodData> {
    return { text: await this.loadWeeklyReportMethodAndSourcesData(reportItem) }
  }

  async loadExtraGeoUnitsData(geoLevel: GeoLevelFilter): Promise<ExtraGeoUnitsData> {
    let fileName: string
    switch (geoLevel) {
      case GeoLevelFilter.CANTONS:
        fileName = 'cases-canton.json'
        break
      case GeoLevelFilter.GREATER_REGIONS:
        fileName = 'cases-greater-region.json'
        break
      case GeoLevelFilter.AMGR:
        fileName = 'cases-greater-labor-market.json'
        break
      case GeoLevelFilter.AMRE:
        fileName = 'cases-labor-market.json'
        break
      case GeoLevelFilter.DISTRICTS:
        fileName = 'cases-district.json'
        break
      default:
        fileName = 'cases-canton.json'
        break
    }
    return this.loadFile<ExtraGeoUnitsData>(`extra-geo-units/${fileName}`)
  }

  private loadWeeklyReportFiles<T>(
    filenameFn: (isoWeek: number) => string,
    reportItem: WeeklyReportListItem,
  ): Promise<WeeklyReportDataPair<T>> {
    return Promise.all([
      this.loadFile(filenameFn(reportItem.previous.isoWeek)),
      this.loadFile(filenameFn(reportItem.current.isoWeek)),
    ]).then(([prev, curr]) => ({ prev, curr }))
  }

  private loadFile<T = any>(filePath: string): Promise<T> {
    if (this.cache.has(filePath)) {
      return <Promise<T>>this.cache.get(filePath)
    }
    const req = this.requestData<T>(filePath)
    this.cache.set(filePath, req)
    return req
  }

  private async requestData<T>(filePath: string): Promise<T> {
    const dataVersionEndpoint = await this.dataVersionEndpoint
    return firstValueFrom(this.httpClient.get<T>(`${dataVersionEndpoint}/${filePath}`, this.reqOpts))
  }

  private readonly loadContext = (endpoint: string, specificState?: string): Promise<PublicDataContext> => {
    return firstValueFrom(
      this.httpClient.get<PublicDataContext>(
        `${endpoint}${DataService.API_DATA}${specificState ? '/' + specificState : ''}/context`,
        this.reqOpts,
      ),
    )
  }
}
