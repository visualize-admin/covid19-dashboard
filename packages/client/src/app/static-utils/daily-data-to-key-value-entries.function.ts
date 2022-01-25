import { GdiVariant, InlineValues } from '@c19/commons'

export function gdiVariantFromInlineValues(variants: GdiVariant[], values: InlineValues<any>): GdiVariant | null {
  let variant: GdiVariant | null = null
  variants.some((v) => {
    if (values.hasOwnProperty(v)) {
      variant = v
      return true
    } else {
      return false
    }
  })
  return variant
}

export function postfixGdiPercent(gdi: string): string {
  return gdi.toLocaleLowerCase().includes('percentage') ? '%' : ''
}
