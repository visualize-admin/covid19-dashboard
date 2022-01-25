import { adminFormatNum, MINUS_SIGN } from './admin-format-num.function'

describe('adminFormatNum', () => {
  it('should format correctly', () => {
    expect(adminFormatNum(5)).toEqual('5')
    expect(adminFormatNum(1005)).toEqual('1005')
    expect(adminFormatNum(11005)).toEqual('11 005')
    expect(adminFormatNum(112011005)).toEqual('112 011 005')
  })
  it('should format correctly with fixed decimal places', () => {
    expect(adminFormatNum(5.123, 2)).toEqual('5,12')
    expect(adminFormatNum(40000.1, 2)).toEqual('40 000,10')
    expect(adminFormatNum(34223232.9, 2)).toEqual('34 223 232,90')
  })
  it('should return `-` for non-numbers', () => {
    expect(adminFormatNum(null)).toEqual('-')
    expect(adminFormatNum(null, 1, '%')).toEqual('-')
    expect(adminFormatNum(null, undefined, '%')).toEqual('-')
    expect(adminFormatNum(undefined)).toEqual('-')
    expect(adminFormatNum(<any>'not-a-number')).toEqual('-')
  })
  it("should add the suffix if there's a number", () => {
    expect(adminFormatNum(null, undefined, '%')).toEqual('-')
    expect(adminFormatNum(undefined, undefined, '%')).toEqual('-')
    expect(adminFormatNum(5, undefined, '%')).toEqual('5%')
    expect(adminFormatNum(100, undefined, '%')).toEqual('100%')
    expect(adminFormatNum(1.22, 2, 'pp')).toEqual('1,22pp')
    expect(adminFormatNum(1.2, 2, 'pp')).toEqual('1,20pp')
  })
  it('should add + sign to numbers > 0 when requested', () => {
    expect(adminFormatNum(5, undefined, '', true)).toEqual('+5')
    expect(adminFormatNum(0, undefined, '', true)).toEqual('0')
    expect(adminFormatNum(-5, undefined, '', true)).toEqual(`${MINUS_SIGN}5`)
    expect(adminFormatNum(-5, undefined, '', false)).toEqual(`${MINUS_SIGN}5`)
  })
})
