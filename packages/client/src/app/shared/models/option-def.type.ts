export interface OptionDef<T> {
  key: string
  val: T | null
}

export type OptionsDef<T> = Array<OptionDef<T>>
