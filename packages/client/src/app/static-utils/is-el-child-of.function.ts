export function isElChildOf(itemInQuestion: Element, parent: Element) {
  let t: Element | null = itemInQuestion
  while (t) {
    if (t === parent) {
      return false
    }
    t = t.parentElement
  }
  return true
}
