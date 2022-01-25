/**
 * equality check. works with Objects, Arrays and primitives (Set/Map untested)
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) {
    return true
  }
  const areObj = isObject(a) && isObject(a)
  if (!areObj) {
    // if they are not equal AND not both are objects a|b might be null or undefined
    return false
  }

  // yes - this also works for arrays
  const keysA = <Array<keyof T>>Object.keys(a)

  if (keysA.length !== Object.keys(b).length) {
    return false
  }

  for (const key of keysA) {
    const valA = a[key]
    const valB = b[key]
    const nestedObjects = isObject(valA) && isObject(valB)

    // if objects
    if ((nestedObjects && !deepEqual(valA, valB)) || (!nestedObjects && valA !== valB)) {
      return false
    }
  }

  return true
}

function isObject(object: any): boolean {
  return object != null && typeof object === 'object'
}
