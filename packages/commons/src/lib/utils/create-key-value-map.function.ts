export function createKeyValueMap<T, K extends string>(arr: T[], keyFn: (v: T) => K): Record<K, T> {
  return arr.reduce((u, buck: T) => ({ ...u, [keyFn(buck)]: buck }), <Record<K, T>>{})
}
