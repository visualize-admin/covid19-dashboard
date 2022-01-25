import { RowBarChartEntries } from '../components/row-bar-chart/row-bar-chart.component'

export interface TwoWeeksDemographyData {
  age: null | {
    entries: [RowBarChartEntries, RowBarChartEntries]
    week1: [Date, Date]
    week2: [Date, Date]
  }
  gender: null | {
    entries: [RowBarChartEntries, RowBarChartEntries]
    week1: [Date, Date]
    week2: [Date, Date]
  }
  maxValueLength: number
  maxLabelLength: number
}
