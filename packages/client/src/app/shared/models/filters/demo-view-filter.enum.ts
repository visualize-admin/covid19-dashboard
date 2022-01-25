import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

// order matters
export enum DemoViewFilter {
  HEATMAP = 'heatmap',
  GRAPH = 'graph',
}

export const DEFAULT_DEMO_VIEW_FILTER = DemoViewFilter.HEATMAP

export const demoViewFilterKey: Record<DemoViewFilter, string> = {
  [DemoViewFilter.HEATMAP]: 'DemoViewFilter.Heatmap',
  [DemoViewFilter.GRAPH]: 'DemoViewFilter.Graph',
}

export function getDemoViewFilterOptions(
  defaultOption: DemoViewFilter = DEFAULT_DEMO_VIEW_FILTER,
): OptionsDef<DemoViewFilter> {
  const opts = <DemoViewFilter[]>getEnumValues(DemoViewFilter)
  return opts.map((val) => ({
    key: demoViewFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
