import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum IntMapZoomFilter {
  NEIGHBOURS = 'neighbours',
  EUROPE = 'europe',
  WORLD = 'world',
}

export const intMapZoomFilterKeys: Record<IntMapZoomFilter, string> = {
  [IntMapZoomFilter.NEIGHBOURS]: 'International.MapZoomFilter.Neighbours',
  [IntMapZoomFilter.EUROPE]: 'International.MapZoomFilter.Europe',
  [IntMapZoomFilter.WORLD]: 'International.MapZoomFilter.World',
}

export const DEFAULT_INT_MAP_ZOOM_FILTER = IntMapZoomFilter.EUROPE

export function getIntMapZoomFilterOptions(defaultOption?: IntMapZoomFilter): OptionsDef<IntMapZoomFilter> {
  const opts = <IntMapZoomFilter[]>getEnumValues(IntMapZoomFilter)
  return opts.map((val) => ({
    key: intMapZoomFilterKeys[val],
    val: val === defaultOption ? null : val,
  }))
}
