export function findReverse<T>(array: T[], predicate: (t: T) => boolean): T | null {
  for (let index = array.length - 1; index >= 0; index--) {
    if (predicate(array[index])) {
      return array[index]
    }
  }
  return null
}

export function findReverseIndex<T>(array: T[], predicate: (t: T) => boolean): number {
  for (let index = array.length - 1; index >= 0; index--) {
    if (predicate(array[index])) {
      return index
    }
  }
  return -1
}
