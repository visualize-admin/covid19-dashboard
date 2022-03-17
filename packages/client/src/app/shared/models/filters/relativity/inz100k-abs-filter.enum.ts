import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../../option-def.type'

export enum Inz100KAbsFilter {
  // the order matters (UI)
  INZ_100K = 'inz100k',
  ABSOLUTE = 'abs',
}

const inz100KAbsFilterKey: Record<Inz100KAbsFilter, string> = {
  [Inz100KAbsFilter.INZ_100K]: 'RelativityFilter.Inz100K',
  [Inz100KAbsFilter.ABSOLUTE]: 'RelativityFilter.Absolute',
}

export const DEFAULT_RELATIVITY_FILTER = Inz100KAbsFilter.INZ_100K
export const DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER = Inz100KAbsFilter.ABSOLUTE

export function getInz100KAbsFilterOptions(defaultOption: Inz100KAbsFilter): OptionsDef<Inz100KAbsFilter> {
  const opts = <Inz100KAbsFilter[]>getEnumValues(Inz100KAbsFilter)
  return opts.map((val) => ({
    key: inz100KAbsFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
