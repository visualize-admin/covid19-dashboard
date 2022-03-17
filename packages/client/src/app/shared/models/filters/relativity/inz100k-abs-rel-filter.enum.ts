import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../../option-def.type'

export enum Inz100KAbsRelFilter {
  // the order matters (UI)
  INZ_100K = 'inz100k',
  ABSOLUTE = 'abs',
  RELATIVE = 'rel',
}

const inz100KAbsRelFilterKey: Record<Inz100KAbsRelFilter, string> = {
  [Inz100KAbsRelFilter.INZ_100K]: 'RelativityFilter.Inz100K',
  [Inz100KAbsRelFilter.ABSOLUTE]: 'RelativityFilter.Absolute',
  [Inz100KAbsRelFilter.RELATIVE]: 'RelativityFilter.Relative',
}

export const DEFAULT_ABS_INZ100K_SHARE_FILTER: Inz100KAbsRelFilter = Inz100KAbsRelFilter.ABSOLUTE

export function getInz100KAbsRelFilterOptions(defaultOption: Inz100KAbsRelFilter): OptionsDef<Inz100KAbsRelFilter> {
  const opts = <Inz100KAbsRelFilter[]>getEnumValues(Inz100KAbsRelFilter)
  return opts.map((val) => ({
    key: inz100KAbsRelFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
