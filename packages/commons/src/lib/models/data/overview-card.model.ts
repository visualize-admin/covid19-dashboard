import { GdiObjectTimeFrameContext } from './shared'

export interface OverviewCardV3<
  V,
  T extends { date: string } | undefined,
  D extends number | null | undefined = undefined,
> extends GdiObjectTimeFrameContext {
  dailyValues: V
  timelineData: T extends undefined ? undefined : T[]
  deltaDay: D
}
