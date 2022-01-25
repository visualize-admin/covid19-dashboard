import {
  InternationalComparisonDetailData,
  InternationalComparisonDetailGeoData,
  InternationalQuarantineData,
} from '@c19/commons'

export interface InternationalCombinedData {
  quarantine: InternationalQuarantineData
  geography: InternationalComparisonDetailGeoData
  development: InternationalComparisonDetailData | null
}
