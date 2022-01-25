import {
  AgeBucketData,
  BucketData,
  BucketEntry,
  DefaultBucketValue,
  findReverseIndex,
  GenderBucketData,
  isDefined,
  Sex,
  TimeSpan,
} from '@c19/commons'
import { TranslatorService } from '../core/i18n/translator.service'
import { MatrixBucketEntry } from '../diagrams/matrix/base-matrix.component'
import { RowBarChartEntries, RowBarChartEntry } from '../shared/components/row-bar-chart/row-bar-chart.component'
import { DemoMatrixEntry, RefMatrixBucketEntry } from '../shared/models/demo-matrix-entry.model'
import { TwoWeeksDemographyData } from '../shared/models/two-weeks-demography-data.model'
import { adminFormatNum } from './admin-format-num.function'
import { formatUtcDate, parseIsoDate } from './date-utils'

export function getTimeslotCorrespondingValues<T extends { date: string }>(values: T[], timeFrame: TimeSpan): T[] {
  if (values.length === 0) {
    return []
  }
  let startIndex = values.findIndex((i) => i.date === timeFrame.start)
  // if no entry for timeFrame.start was found and the fist entry is after start ==> start there
  startIndex = startIndex === -1 && timeFrame.start < values[0].date ? 0 : startIndex

  let endIndex = findReverseIndex(values, (i) => i.date === timeFrame.end)
  // if no entry for timeFrame.end was found and the last entry is before the end ==> end there
  endIndex = endIndex === -1 && timeFrame.end > values[values.length - 1].date ? values.length - 1 : endIndex

  return startIndex !== -1 && endIndex !== -1 ? values.slice(startIndex, endIndex + 1) : []
}

export function getTimeslotCorrespondingWeeklyValues<T extends { start: string; end: string }>(
  values: T[],
  timeFrame: TimeSpan,
): T[] {
  const startIndex = values.findIndex((i) => i.start >= timeFrame.start)
  const endIndex = findReverseIndex(values, (i) => i.end <= timeFrame.end)
  return values.slice(startIndex, endIndex + 1)
}

export interface MatrixCreationData<T extends MatrixBucketEntry> {
  min: number
  max: number
  entries: DemoMatrixEntry<T>[]
  hasNullValues: boolean
  // necessary for matrix-heatmap
  hasZeroValues: boolean
  // necessary for matrix-stacks
  hasZeroValuesWithRefValue?: boolean
  hasBucketsAllZero: boolean
}

export function createMatrixData<T extends string, B extends BucketData<DefaultBucketValue<T>, any>>(
  bucketArray: B[],
  relevantKey: T,
  refKey: T,
): MatrixCreationData<RefMatrixBucketEntry>
export function createMatrixData<T extends string, B extends BucketData<DefaultBucketValue<T>, any>>(
  bucketArray: B[],
  relevantKey: T,
): MatrixCreationData<MatrixBucketEntry>
export function createMatrixData<T extends string, B extends BucketData<DefaultBucketValue<T>, any>>(
  bucketArray: B[],
  relevantKey: T,
  refKey?: T,
): MatrixCreationData<MatrixBucketEntry> | MatrixCreationData<RefMatrixBucketEntry> {
  if (bucketArray.length === 0) {
    return { min: 0, max: 0, entries: [], hasNullValues: false, hasZeroValues: false, hasBucketsAllZero: false }
  }
  const [min, max, hasNullValues, hasZeroValues] = findMinMaxNull(bucketArray, relevantKey)

  let hasBucketsAllZero = false
  let hasZeroValuesWithRefValue = false
  const entries = bucketArray.map((buckData: BucketData<DefaultBucketValue<T>, any>, ix, arr) => {
    const startDate = parseIsoDate(buckData.start)
    const endDate = parseIsoDate(buckData.end)
    const bucketMapFn = refKey
      ? (b: BucketEntry<any, DefaultBucketValue<T>>): RefMatrixBucketEntry => ({
          bucketName: b.bucket,
          value: <number>b[relevantKey] ?? null,
          refValue: <number>b[refKey] ?? null,
        })
      : (b: BucketEntry<any, DefaultBucketValue<T>>): MatrixBucketEntry => ({
          bucketName: b.bucket,
          value: <number>b[relevantKey] ?? null,
        })
    const buckets = buckData.buckets.map(bucketMapFn)
    hasZeroValuesWithRefValue =
      (refKey && hasZeroValuesWithRefValue) ||
      (<RefMatrixBucketEntry[]>buckets).some((e) => e.value === 0 && isDefined(e.refValue) && e.refValue > 0)
    hasBucketsAllZero = hasBucketsAllZero || buckets.every((b) => b.value === 0)
    return <DemoMatrixEntry>{
      key: startDate,
      startDate,
      endDate,
      label: formatUtcDate(startDate, ix === 0 ? 'dd.MM.yyyy' : 'dd.MM'),
      labelLast: formatUtcDate(endDate, ix === arr.length - 1 ? 'dd.MM.yyyy' : 'dd.MM'),
      buckets,
      noData: buckData.buckets.every((b) => b[relevantKey] === null),
      noCase: buckData.buckets.every((b) => b[relevantKey] === 0),
    }
  })
  return { min, max, entries, hasNullValues, hasZeroValues, hasZeroValuesWithRefValue, hasBucketsAllZero }
}

/**
 * create bucket data for percentage values
 * uses relevantKey (percentage) AND refKey (abs or inz)  to determine whether noData or noCase applies
 */
export function createSexMatrixData<T extends string, B extends BucketData<DefaultBucketValue<T>, Sex>>(
  bucketArray: B[],
  relevantKey: T,
  refKey: T,
): MatrixCreationData<MatrixBucketEntry> {
  if (bucketArray.length === 0) {
    return { min: 0, max: 0, entries: [], hasNullValues: false, hasZeroValues: false, hasBucketsAllZero: false }
  }
  const [min, max, , hasZeroValues] = findMinMaxNull(bucketArray, relevantKey)

  const entries = bucketArray.map((buckData: BucketData<DefaultBucketValue<T>, any>, ix, arr) => {
    const startDate = parseIsoDate(buckData.start)
    const endDate = parseIsoDate(buckData.end)
    const buckets = buckData.buckets.map(
      (b: BucketEntry<any, DefaultBucketValue<T>>): RefMatrixBucketEntry => ({
        bucketName: b.bucket,
        value: <number>b[relevantKey] ?? null,
        refValue: <number>b[refKey] ?? null,
      }),
    )
    const maleFemaleBuckets = buckets.filter((b) => b.bucketName !== Sex.UNKNOWN)
    return <DemoMatrixEntry>{
      key: startDate,
      startDate,
      endDate,
      label: formatUtcDate(startDate, ix === 0 ? 'dd.MM.yyyy' : 'dd.MM'),
      labelLast: formatUtcDate(endDate, ix === arr.length - 1 ? 'dd.MM.yyyy' : 'dd.MM'),
      buckets,
      noData: maleFemaleBuckets.every((b) => b.value === null && b.refValue === null),
      noCase: buckets.every((b) => !isDefined(b.value)) && maleFemaleBuckets.every((b) => b.refValue === 0),
    }
  })
  return {
    min,
    max,
    entries,
    hasNullValues: entries.some((e) => e.noData),
    hasZeroValues,
    hasBucketsAllZero: entries.some((e) => e.noCase),
    hasZeroValuesWithRefValue: false,
  }
}

export function get2WeeksDemographyData(
  ageData: AgeBucketData[],
  isInz: boolean,
  genderData: GenderBucketData[],
  translator: TranslatorService,
): TwoWeeksDemographyData {
  const lbls = {
    [Sex.MALE]: 'Commons.Male.Abbr',
    [Sex.FEMALE]: 'Commons.Female.Abbr',
    [Sex.UNKNOWN]: 'Commons.Unknown.Abbr',
  }
  const [ageMaxLabelLength, ageMaxValueLength, ageEntries] = createRowBarChartData(
    ageData,
    isInz ? 'inzWeek' : 'week',
    (v) => (isDefined(v) ? adminFormatNum(v) : ''),
  )
  const [genderMaxLabelLength, genderMaxValueLength, genderEntries] = createRowBarChartData(
    genderData,
    'percentage',
    (v) => `${v}%`,
    (b) => translator.get(lbls[<Sex>b]),
  )
  return {
    age:
      ageData.length === 2
        ? {
            entries: ageEntries,
            week1: [new Date(ageData[0].start), new Date(ageData[0].end)],
            week2: [new Date(ageData[1].start), new Date(ageData[1].end)],
          }
        : null,
    gender:
      genderData.length === 2
        ? {
            entries: genderEntries,
            week1: [new Date(genderData[0].start), new Date(genderData[0].end)],
            week2: [new Date(genderData[1].start), new Date(genderData[1].end)],
          }
        : null,
    maxValueLength: Math.max(ageMaxValueLength, genderMaxValueLength),
    maxLabelLength: Math.max(ageMaxLabelLength, genderMaxLabelLength),
  }
}

export function createRowBarChartData<T extends string, B extends BucketData<DefaultBucketValue<T>, any>>(
  bucketData: B[],
  relevantKey: T,
  valueFormat: (v: number | null) => string = (v) => (v === null ? '' : v.toString()),
  labelTransform: (bucket: string) => string = (v) => v,
): [number, number, [RowBarChartEntries, RowBarChartEntries]] {
  if (bucketData.length !== 2) {
    return [0, 0, [[], []]]
  }
  const [, max] = findMinMaxNull(bucketData, relevantKey)

  const mapperFn = (entry: BucketEntry<any, DefaultBucketValue<T>>): RowBarChartEntry => {
    const val = <number | null>entry[relevantKey]
    return {
      label: labelTransform(entry.bucket),
      value: valueFormat(val),
      ratio: val !== null ? val / max : null,
    }
  }

  const week1: RowBarChartEntries = bucketData[0].buckets.map(mapperFn)
  const week2: RowBarChartEntries = bucketData[1].buckets.map(mapperFn)

  const maxLabelLength = Math.max(...[...week1, ...week2].map((e) => e.label.length))
  const maxValueLength = Math.max(...[...week1, ...week2].map((e) => e.value.length))
  return [maxLabelLength, maxValueLength, [week1, week2]]
}

export function findMinMaxNull<T extends string, B extends BucketData<DefaultBucketValue<T>, any>>(
  bucketData: B[],
  relevantKey: T,
): [number, number, boolean, boolean] {
  const values: Array<number | null> = bucketData
    .reduce((u, i) => [...u, ...i.buckets], <Array<BucketEntry<any, any>>>[])
    .map<number | null>((b: BucketEntry<any, DefaultBucketValue<T>>) => b[relevantKey])

  const nonNullOrZeroValues: number[] = values.filter(isDefined).filter((v) => v !== 0)

  return nonNullOrZeroValues.length
    ? [
        Math.min(...nonNullOrZeroValues),
        Math.max(...nonNullOrZeroValues),
        values.some((v) => v === null),
        values.some((v) => v === 0),
      ]
    : [0, 0, true, false]
}
