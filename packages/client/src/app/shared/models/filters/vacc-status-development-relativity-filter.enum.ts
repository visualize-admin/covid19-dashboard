import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccStatusDevelopmentRelativityFilter {
  // the order matters (UI)
  INZ_100 = 'inz100',
  ABSOLUTE = 'abs',
  RELATIVE = 'rel',
}

export const vaccStatusDevelopmentRelativityFilterKey: Record<VaccStatusDevelopmentRelativityFilter, string> = {
  [VaccStatusDevelopmentRelativityFilter.INZ_100]: 'Vaccination.Status.Card.Development.RelativityFilter.Inz100',
  [VaccStatusDevelopmentRelativityFilter.ABSOLUTE]: 'Vaccination.Status.Card.Development.RelativityFilter.Absolute',
  [VaccStatusDevelopmentRelativityFilter.RELATIVE]: 'Vaccination.Status.Card.Development.RelativityFilter.Relative',
}

export const DEFAULT_VACC_STATUS_DEVELOPMENT_RELATIVITY_FILTER = VaccStatusDevelopmentRelativityFilter.ABSOLUTE

export function getVaccStatusDevelopmentRelativityFilterOptions(
  defaultOption: VaccStatusDevelopmentRelativityFilter,
): OptionsDef<VaccStatusDevelopmentRelativityFilter> {
  const opts = <VaccStatusDevelopmentRelativityFilter[]>getEnumValues(VaccStatusDevelopmentRelativityFilter)
  return opts.map((val) => ({
    key: vaccStatusDevelopmentRelativityFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
