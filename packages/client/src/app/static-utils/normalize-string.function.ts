/** normalizes a string so it can be used for search */
export function normalizeString(value: string | undefined | null): string {
  // normalize() to NFD Unicode normal form decomposes combined graphemes into the combination of simple ones. ( è => e +  ̀)
  return (
    value
      ?.normalize('NFD')
      // get rid of the diacritics (U+0300 → U+036F range)
      .replace(/[\u0300-\u036f]/g, '')

      .toLowerCase() || ''
  )
}
