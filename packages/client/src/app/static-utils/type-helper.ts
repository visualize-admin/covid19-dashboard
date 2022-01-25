/**
 * make property of type nonNull and nonUndefined
 * @example
 * interface X { a?:number|null }
 * Ensured<X, 'a'> // --> { a: number }
 */
export type Ensured<T, P extends keyof T> = Omit<T, P> & { [key in P]-?: NonNullable<T[P]> }
