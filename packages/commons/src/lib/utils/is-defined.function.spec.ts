import { isDefined } from './is-defined.function'

describe('isDefined()', () => {
  test('returns false for undefined|null', () => {
    expect(isDefined(null)).toBe(false)
    expect(isDefined(undefined)).toBe(false)
  })
  test(`when 0|''|NaN|emptyString`, () => {
    expect(isDefined(0)).toBe(true)
    expect(isDefined(-0)).toBe(true)
    expect(isDefined('')).toBe(true)
    expect(isDefined(NaN)).toBe(true)
    expect(isDefined(1 / 0)).toBe(true)
  })
  test('when empty objects|arrays', () => {
    expect(isDefined([])).toBe(true)
    expect(isDefined({})).toBe(true)
  })
  test('when truthy values', () => {
    expect(isDefined(5)).toBe(true)
    expect(isDefined('ok')).toBe(true)
    expect(isDefined('undefined')).toBe(true)
    expect(isDefined('null')).toBe(true)
  })
})
