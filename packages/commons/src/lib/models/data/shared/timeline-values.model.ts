import { InlineValues } from './inline-values.model'

export type TimelineValues<T extends string> = InlineValues<T> & { date: string }

export type WeeklyTimelineValues<T extends string> = InlineValues<T> & {
  isoWeek: string
  start: string
  end: string
}
