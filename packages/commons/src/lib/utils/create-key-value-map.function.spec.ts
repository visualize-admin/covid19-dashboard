import { createKeyValueMap } from './create-key-value-map.function'

describe('createKeyValueMap', () => {
  test('works', () => {
    const values = [
      { key: 'a', value: 'a' },
      { key: 'b', value: 'b' },
    ]
    expect(createKeyValueMap(values, (v) => v.key)).toEqual({
      a: values[0],
      b: values[1],
    })
  })
})
