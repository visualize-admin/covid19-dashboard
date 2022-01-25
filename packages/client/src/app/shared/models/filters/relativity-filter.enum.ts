import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum RelativityFilter {
  // the order matters (UI)
  INZ_100K = 'inz100k',
  ABSOLUTE = 'abs',
}

export const relativityFilterKey: Record<RelativityFilter, string> = {
  [RelativityFilter.INZ_100K]: 'RelativityFilter.Inz100K',
  [RelativityFilter.ABSOLUTE]: 'RelativityFilter.Absolute',
}

export const DEFAULT_RELATIVITY_FILTER = RelativityFilter.INZ_100K
export const DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER = RelativityFilter.ABSOLUTE

export function getRelativityFilterOptions(defaultOption: RelativityFilter): OptionsDef<RelativityFilter> {
  const opts = <RelativityFilter[]>getEnumValues(RelativityFilter)
  return opts.map((val) => ({
    key: relativityFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
