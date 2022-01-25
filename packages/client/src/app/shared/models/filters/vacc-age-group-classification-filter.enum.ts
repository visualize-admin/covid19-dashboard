import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccAgeGroupClassificationFilter {
  AKL_10 = 'akl10',
  VACC_STRATEGY = 'vaccStrategy',
}

export const vaccAgeGroupClassificationFilterKey: Record<VaccAgeGroupClassificationFilter, string> = {
  [VaccAgeGroupClassificationFilter.AKL_10]: 'VaccAgeGroupClassificationFilter.Akl10',
  [VaccAgeGroupClassificationFilter.VACC_STRATEGY]: 'VaccAgeGroupClassificationFilter.VaccStrategy',
}

export const DEFAULT_VACC_AGE_GROUP_CLASSIFICATION_FILTER: VaccAgeGroupClassificationFilter =
  VaccAgeGroupClassificationFilter.AKL_10

export function getVaccAgeGroupClassificationFilterOptions(
  defaultOption: VaccAgeGroupClassificationFilter,
): OptionsDef<VaccAgeGroupClassificationFilter> {
  const opts = <VaccAgeGroupClassificationFilter[]>getEnumValues(VaccAgeGroupClassificationFilter)
  return opts.map((val) => ({
    key: vaccAgeGroupClassificationFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
