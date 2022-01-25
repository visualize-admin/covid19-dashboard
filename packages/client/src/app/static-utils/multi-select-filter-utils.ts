import { BucketData } from '@c19/commons'
import { getEnumValues, StringEnum } from '@shiftcode/utilities'
import { MultiSelectOption } from '../shared/components/multi-select/multi-select-option.type'

export interface MultiSelectValueOption extends MultiSelectOption {
  value: string
}

export function createMultiSelectQueryParamValue(
  values: MultiSelectValueOption[],
  defaultOptions: MultiSelectValueOption[],
): string | null {
  return defaultOptions.every((o) => values.includes(o)) && defaultOptions.length === values.length
    ? null
    : values.map((v) => v.value).join(',')
}

export function readMultiSelectQueryParamValue<E extends StringEnum<E>>(
  options: MultiSelectValueOption[],
  e: E,
  value?: string | null,
  defaultOptions: MultiSelectValueOption[] = options,
): MultiSelectValueOption[] {
  if (!value) {
    return defaultOptions
  } else {
    const ranges = getEnumValues(e)
    const splitValues = value.split(',').filter((sv) => ranges.includes(sv))
    if (splitValues.length === 0) {
      return defaultOptions
    } else {
      return options.filter((o) => splitValues.includes(o.value))
    }
  }
}

export function readMultiSelectQueryParamValue2(
  options: MultiSelectValueOption[],
  ranges: string[],
  value?: string | null,
  defaultOptions: MultiSelectValueOption[] = options,
): MultiSelectValueOption[] {
  if (!value) {
    return defaultOptions
  } else {
    const splitValues = value.split(',').filter((sv) => ranges.includes(sv))
    if (splitValues.length === 0) {
      return defaultOptions
    } else {
      return options.filter((o) => splitValues.includes(o.value))
    }
  }
}

export function filterBucketData<T extends BucketData<any, any>>(data: T[], filters: string[]): T[] {
  const ageDataFiltered: T[] = []
  data.forEach((abd) => {
    ageDataFiltered.push({ ...abd, buckets: abd.buckets.filter((entry) => filters.includes(entry.bucket)) })
  })
  return ageDataFiltered
}

export function filterHistoColors<E extends StringEnum<E>>(baseColors: string[], filters: string[], e: E): string[] {
  const enumValues = getEnumValues(e)
  return baseColors.filter((_, ix) => filters.includes(enumValues[ix]))
}

export function filterHistoLegendPairs<E extends StringEnum<E>>(
  histoColors: string[],
  filters: string[],
  e: E,
): [string, string][] {
  return getEnumValues(e)
    .filter((v, ix) => filters.includes(getEnumValues(e)[ix]))
    .map((label, ix): [string, string] => [histoColors[ix], label])
    .reverse()
}
