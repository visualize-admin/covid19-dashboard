import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../../option-def.type'

export enum Inz100AbsRelFilter {
  // the order matters (UI)
  INZ_100 = 'inz100',
  ABSOLUTE = 'abs',
  RELATIVE = 'relative',
}

const inz100AbsRelFilterKey: Record<Inz100AbsRelFilter, string> = {
  [Inz100AbsRelFilter.INZ_100]: 'RelativityFilter.Inz100',
  [Inz100AbsRelFilter.ABSOLUTE]: 'RelativityFilter.Absolute',
  [Inz100AbsRelFilter.RELATIVE]: 'RelativityFilter.Relative',
}

export const DEFAULT_VACC_STATUS_DEVELOPMENT_RELATIVITY_FILTER = Inz100AbsRelFilter.ABSOLUTE

export function getInz100AbsRelFilterOptions(defaultOption: Inz100AbsRelFilter): OptionsDef<Inz100AbsRelFilter> {
  const opts = <Inz100AbsRelFilter[]>getEnumValues(Inz100AbsRelFilter)
  return opts.map((val) => ({
    key: inz100AbsRelFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
