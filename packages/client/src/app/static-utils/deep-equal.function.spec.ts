import { deepEqual } from './deep-equal.function'

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

interface Obj {
  a?: boolean
  b?: number
  c?: string
  n?: Obj
}

describe('deep-equal.function', () => {
  describe('works for primitives', () => {
    it('boolean', () => {
      expect(deepEqual(true, false)).toBeFalsy()
      expect(deepEqual(true, true)).toBeTruthy()
    })
    it('number', () => {
      expect(deepEqual(5, 5)).toBeTruthy()
      expect(deepEqual(5, 4)).toBeFalsy()
    })
    it('string', () => {
      expect(deepEqual('a', 'a')).toBeTruthy()
      expect(deepEqual('a', 'b')).toBeFalsy()
    })
    it('null/undefined', () => {
      expect(deepEqual(undefined, undefined)).toBeTruthy()
      expect(deepEqual(null, null)).toBeTruthy()
      expect(deepEqual(undefined, null)).toBeFalsy()
    })
  })

  it('works for objects', () => {
    const a: Obj = { a: true, b: 4, n: { a: false } }
    const b: Obj = { a: true, b: 4, n: { a: true } }
    expect(deepEqual(a, { ...a })).toBeTruthy()
    expect(deepEqual(a, clone(a))).toBeTruthy()

    expect(deepEqual(a, b)).toBeFalsy()
  })

  describe('works for primitive arrays', () => {
    it('string', () => {
      const a = ['a', 'b']
      const b = ['b', 'a']
      expect(deepEqual(a, [...a])).toBeTruthy()
      expect(deepEqual(a, b)).toBeFalsy()
    })
    it('number', () => {
      const a = [4, 5]
      const b = [5, 4]
      expect(deepEqual(a, [...a])).toBeTruthy()
      expect(deepEqual(a, b)).toBeFalsy()
    })
    it('boolean', () => {
      const a = [true, false]
      const b = [false, true]
      expect(deepEqual(a, [...a])).toBeTruthy()
      expect(deepEqual(a, b)).toBeFalsy()
    })
  })

  describe('works for object arrays', () => {
    it('simple', () => {
      const a: Obj[] = [{ a: true, b: 4 }]
      const b: Obj[] = [{ a: true, b: 5 }]
      expect(deepEqual(a, clone(a))).toBeTruthy()
      expect(deepEqual(b, clone(b))).toBeTruthy()
      expect(deepEqual(a, b)).toBeFalsy()
    })
    it('deep', () => {
      const a: Obj[] = [{ a: true, b: 4, n: { c: 'a' } }]
      const b: Obj[] = [{ a: true, b: 4, n: { c: 'b' } }]
      expect(deepEqual(a, clone(a))).toBeTruthy()
      expect(deepEqual(b, clone(b))).toBeTruthy()
      expect(deepEqual(a, b)).toBeFalsy()
    })
  })
})
