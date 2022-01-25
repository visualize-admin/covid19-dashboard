import { OverviewCardV3 } from './overview-card.model'
import { GdiObject, GdiVariant, InlineValues } from './shared'

export enum CovidCertificateType {
  VACCINATED = 'vaccinated',
  RECOVERED = 'recovered',
  TESTED = 'tested',
  ALL = 'all',
}

export type CovidCertificatesOverviewEntryValues = GdiVariant.VALUE | GdiVariant.TOTAL

export type CovidCertificatesOverviewDailyEntry = Record<
  CovidCertificateType,
  InlineValues<CovidCertificatesOverviewEntryValues> & { date: string }
>
export type CovidCertificatesOverviewDevelopmentEntry = { date: string } & Record<
  CovidCertificateType,
  InlineValues<CovidCertificatesOverviewEntryValues>
>

export interface CovidCertificatesOverviewCard
  extends OverviewCardV3<CovidCertificatesOverviewDailyEntry, CovidCertificatesOverviewDevelopmentEntry> {
  gdiObject: GdiObject.CERTIFICATES
}
