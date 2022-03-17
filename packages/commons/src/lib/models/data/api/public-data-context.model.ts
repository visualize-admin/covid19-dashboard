export interface PublicDataContext {
  sourceDate: string
  dataVersion: string

  sources: {
    comment?: string
    opendata: {
      standard: string
      catalog: string
      opendataSwissDataset: string
    }
    schema: {
      version: string
      jsonSchema: string
    }
    readme: string
    zip: {
      json: string
      csv: string
    }
    individual: {
      json: IndividualFiles
      csv: IndividualFiles
    }
  }
}

export interface IndividualFiles {
  daily: {
    cases: string
    casesVaccPersons: string
    hosp: string
    hospVaccPersons: string
    death: string
    deathVaccPersons: string
    test: string
    testPcrAntigen: string
    hospCapacity: string
    hospCapacityCertStatus: string
    re: string
    intCases: string
    virusVariantsWgs: string
    covidCertificates: string
  }
  weekly: {
    byAge: {
      cases: string
      casesVaccPersons: string
      hosp: string
      hospVaccPersons: string
      hospReason: string
      death: string
      deathVaccPersons: string
      test: string
    }
    bySex: {
      cases: string
      casesVaccPersons: string
      hosp: string
      hospVaccPersons: string
      death: string
      deathVaccPersons: string
      test: string
    }
    default: {
      cases: string
      hosp: string
      death: string
      test: string
      testPcrAntigen: string
      hospCapacity: string
    }
  }
  extraGeoUnits: {
    cases: {
      daily: string
      biweekly: string
    }
  }
  contactTracing: string
  weeklyReportText: string
  dailyReport: string
  intQua: string
  vaccDosesDelivered: string
  vaccDosesContingent: string
  vaccDosesAdministered: string
  vaccPersonsV2: string
  vaccSymptoms: string
  weeklyVacc: {
    byAge: {
      vaccDosesAdministered: string
      vaccPersonsV2: string
    }
    bySex: {
      vaccDosesAdministered: string
      vaccPersonsV2: string
    }
    byIndication: {
      vaccDosesAdministered: string
      fullyVaccPersonsV2: string
    }
    byLocation: {
      vaccDosesAdministered: string
    }
    byVaccine: {
      vaccDosesDelivered: string
      vaccDosesAdministered: string
      vaccPersons: string
    }
    byAgeAndVaccine: {
      vaccPersons: string
    }
  }
  rawData: {
    dailyEpi: string
    dailyCasesAgeRange: string
    weeklyEpiAgeRangeSex: string
    populationAgeRangeSex: string
  }
}
