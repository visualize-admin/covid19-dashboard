import { IntGeoUnit, isDefined, QuarantineGeoData, QuarantineGeoDataEntry } from '@c19/commons'
import { parseIsoDate } from './date-utils'

export enum QuarantineState {
  NONE,
  PAST,
  ENDING,
  ONGOING,
  FUTURE,
}

export interface ParsedQuarantineEntryBase {
  unit: IntGeoUnit
  state: QuarantineState
}

export interface ParsedQuarantineEntryNone extends ParsedQuarantineEntryBase {
  state: QuarantineState.NONE
}

export interface ParsedQuarantineEntryPast extends ParsedQuarantineEntryBase {
  state: QuarantineState.PAST
  start: Date
  end: Date
}

export interface ParsedQuarantineEntryEnding extends ParsedQuarantineEntryBase {
  state: QuarantineState.ENDING
  start: Date
  end: Date
}

export interface ParsedQuarantineEntryOngoing extends ParsedQuarantineEntryBase {
  state: QuarantineState.ONGOING
  start: Date
}

export interface ParsedQuarantineEntryFuture extends ParsedQuarantineEntryBase {
  state: QuarantineState.FUTURE
  start: Date
}

export type ParsedQuarantineEntry =
  | ParsedQuarantineEntryNone
  | ParsedQuarantineEntryPast
  | ParsedQuarantineEntryEnding
  | ParsedQuarantineEntryOngoing
  | ParsedQuarantineEntryFuture

export type ParsedQuarantineGeoData = {
  [key in IntGeoUnit]: ParsedQuarantineEntry
}

const now = new Date()
export function getQuarantineState(start: Date | null, end: Date | null): QuarantineState {
  if (!start) {
    return QuarantineState.NONE
  }

  if (!end) {
    // is the start date before now?
    return start < now ? QuarantineState.ONGOING : QuarantineState.FUTURE
  }
  // the end Date of the quarantine is exclusive      2020-12-19T00:00:00.000+01:00
  // is the end date before now?
  return end < now ? QuarantineState.PAST : QuarantineState.ENDING
}

export function parseQuarantineEntry(
  unit: IntGeoUnit,
  item: QuarantineGeoDataEntry | undefined,
): ParsedQuarantineEntry {
  const start = item && isDefined(item.quarantineStart) ? parseIsoDate(item.quarantineStart) : null
  const end = item && isDefined(item.quarantineEnd) ? parseIsoDate(item.quarantineEnd) : null
  const state = getQuarantineState(start, end)
  return <ParsedQuarantineEntry>{
    unit,
    start,
    end,
    state,
  }
}

export function parseQuarantineEntries(data: QuarantineGeoData): ParsedQuarantineGeoData {
  return (<Array<[IntGeoUnit, QuarantineGeoDataEntry | undefined]>>Object.entries(data)).reduce((u, [unit, item]) => {
    return {
      ...u,
      [unit]: parseQuarantineEntry(unit, item),
    }
  }, <ParsedQuarantineGeoData>{})
}
