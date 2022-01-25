import { findReverse, findReverseIndex } from './find-reverse'

describe('find-reverse', () => {
  describe('findReverse()', () => {
    test('searches reverse', () => {
      const values = [jest.fn().mockReturnValue(0), jest.fn().mockReturnValue(1), jest.fn().mockReturnValue(2)]

      findReverse(values, (v) => v() === 1)
      expect(values[2]).toBeCalled()
      expect(values[1]).toBeCalled()
      expect(values[0]).not.toBeCalled()
    })
    test('finds the last element', () => {
      const values = [
        { val: 1, ix: 0 },
        { val: 1, ix: 1 },
        { val: 1, ix: 2 },
      ]
      expect(findReverse(values, (v) => v.val === 1)).toHaveProperty('ix', 2)
    })
    test('returns null when not found', () => {
      const values = ['a', 'b']
      expect(findReverse(values, (v) => v === 'c')).toEqual(null)
    })
  })

  describe('findReverseIndex()', () => {
    test('searches reverse', () => {
      const values = [jest.fn().mockReturnValue(0), jest.fn().mockReturnValue(1), jest.fn().mockReturnValue(2)]

      findReverseIndex(values, (v) => v() === 1)
      expect(values[2]).toBeCalled()
      expect(values[1]).toBeCalled()
      expect(values[0]).not.toBeCalled()
    })
    test('finds the last element', () => {
      const values = [
        { val: 1, ix: 0 },
        { val: 1, ix: 1 },
        { val: 1, ix: 2 },
      ]
      expect(findReverseIndex(values, (v) => v.val === 1)).toEqual(2)
    })
    test('returns -1 when not found', () => {
      const values = ['a', 'b']
      expect(findReverseIndex(values, (v) => v === 'c')).toEqual(-1)
    })
  })
})
