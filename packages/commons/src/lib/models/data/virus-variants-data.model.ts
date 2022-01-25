import { CantonGeoUnit, TopLevelGeoUnit } from './details'
import { OverviewCardV3 } from './overview-card.model'
import { GdiObject, GdiObjectTimespanContext, GdiSubset, GdiVariant, InlineValues } from './shared'

export type CovidVirusVariantsValuesTotal = GdiVariant.TOTAL

export type CovidVirusVariantsValuesV4 = GdiVariant.PERCENTAGE | GdiVariant.PERCENTAGE_ROLLMEAN_7D

export type CovidVirusVariantDailyValueEntry = InlineValues<CovidVirusVariantsValuesV4> & { date7dMean: string }

export type CovidVirusVariantsOverviewDailyValuesV4 = Record<WgsVariants, CovidVirusVariantDailyValueEntry>

export type VirusVariantsDevelopmentValues =
  | GdiVariant.PERCENTAGE
  | GdiVariant.PERCENTAGE_ROLLMEAN_7D
  | GdiVariant.PERCENTAGE_CI_HIGH
  | GdiVariant.PERCENTAGE_CI_LOW

export type WgsVariants =
  | GdiSubset.VARIANT_B117
  | GdiSubset.VARIANT_B117_E484K
  | GdiSubset.VARIANT_B1351
  | GdiSubset.VARIANT_B16171
  | GdiSubset.VARIANT_B16172
  | GdiSubset.VARIANT_B1525
  | GdiSubset.VARIANT_B1526
  | GdiSubset.VARIANT_P1
  | GdiSubset.VARIANT_P2
  | GdiSubset.VARIANT_C37
  | GdiSubset.VARIANT_B11318
  | GdiSubset.VARIANT_B11529
  | GdiSubset.VARIANT_OTHER_WGS
  | GdiSubset.VARIANT_ALL_WGS

export const WGS_VARIANTS: WgsVariants[] = [
  GdiSubset.VARIANT_B117,
  GdiSubset.VARIANT_B117_E484K,
  GdiSubset.VARIANT_B1351,
  GdiSubset.VARIANT_B16171,
  GdiSubset.VARIANT_B16172,
  GdiSubset.VARIANT_B1525,
  GdiSubset.VARIANT_B1526,
  GdiSubset.VARIANT_P1,
  GdiSubset.VARIANT_P2,
  GdiSubset.VARIANT_C37,
  GdiSubset.VARIANT_B11318,
  GdiSubset.VARIANT_B11529,
  GdiSubset.VARIANT_OTHER_WGS,
  GdiSubset.VARIANT_ALL_WGS,
]

// no CHFL values because there are no cantonal records
export type VirusVariantsWgsDevelopmentTimeLineEntry = InlineValues<VirusVariantsDevelopmentValues | GdiVariant.VALUE>

export type VirusVariantsWgsDevelopmentEntry = { date: string } & Record<
  WgsVariants,
  VirusVariantsWgsDevelopmentTimeLineEntry
>

export interface CovidVirusVariantsWgsDevelopmentData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.VIRUS_VARIANTS
  values: VirusVariantsWgsDevelopmentEntry[]
  variantControls: VariantControls
}

export enum VirusVariantSource {
  MYSYS = 'msys',
  WGS = 'wgs',
}

export type CovidVirusVariantsGeoEntryValues = InlineValues<CovidVirusVariantsValuesTotal>

export type CovidVirusVariantsGeoEntry = Record<WgsVariants, CovidVirusVariantsGeoEntryValues>

export type VirusVariantsGeoUnitData = {
  [key in CantonGeoUnit | TopLevelGeoUnit]: Record<VirusVariantSource, CovidVirusVariantsGeoEntry>
}

export interface CovidVirusVariantsGeographyDataV2 extends GdiObjectTimespanContext {
  geoUnitData: VirusVariantsGeoUnitData
  variantsSourceDates: Record<VirusVariantSource, string>
  variantControls: VariantControls
}

export interface CovidVirusVariantsOverviewCardV4
  extends OverviewCardV3<CovidVirusVariantsOverviewDailyValuesV4, VirusVariantsWgsDevelopmentEntry> {
  gdiObject: GdiObject.VIRUS_VARIANTS
  variantControls: VariantControls
}

/**
 * Controls which variants are shown in the dashboard.
 */
export interface VariantControls {
  default: WgsVariants[]
  development: WgsVariants[]
  all: WgsVariants[]
}
