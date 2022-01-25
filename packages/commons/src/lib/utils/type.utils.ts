export type FilterFlags<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never
}

export type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base]

export type Nullable<Base> = {
  [Key in keyof Base]: Base[Key] | null
}
