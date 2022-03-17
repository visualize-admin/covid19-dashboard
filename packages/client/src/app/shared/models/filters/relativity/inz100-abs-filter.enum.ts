import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../../option-def.type'

export enum Inz100AbsFilter {
  // the order matters (UI)
  INZ_100 = 'inz100',
  ABSOLUTE = 'abs',
}

const inz100AbsFilterKey: Record<Inz100AbsFilter, string> = {
  [Inz100AbsFilter.INZ_100]: 'RelativityFilter.Inz100',
  [Inz100AbsFilter.ABSOLUTE]: 'RelativityFilter.Absolute',
}

export const DEFAULT_VACCINATION_RELATIVITY_FILTER: Inz100AbsFilter = Inz100AbsFilter.INZ_100

export function getInz100AbsFilterOptions(defaultOption: Inz100AbsFilter): OptionsDef<Inz100AbsFilter> {
  const opts = <Inz100AbsFilter[]>getEnumValues(Inz100AbsFilter)
  return opts.map((val) => ({
    key: inz100AbsFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
