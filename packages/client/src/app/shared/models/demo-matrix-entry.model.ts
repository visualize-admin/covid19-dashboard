import { MatrixBucketEntry, MatrixEntry } from '../../diagrams/matrix/base-matrix.component'

export interface RefMatrixBucketEntry extends MatrixBucketEntry {
  refValue: number | null
}

export interface DemoMatrixEntry<B extends MatrixBucketEntry = MatrixBucketEntry> extends MatrixEntry<Date, B> {
  startDate: Date
  endDate: Date
}
