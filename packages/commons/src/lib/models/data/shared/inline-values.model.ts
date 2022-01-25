export type InlineValues<T extends string> = { [gdiVariant in T]: number | null }
export type InlineValuesOpt<T extends string> = { [gdiVariant in T]?: number | null }
