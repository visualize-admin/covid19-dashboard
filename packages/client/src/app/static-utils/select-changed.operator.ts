import { isDefined } from '@c19/commons'
import { OperatorFunction } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

export function selectChanged<T, K extends keyof T, D>(key: K, defaultValue: D): OperatorFunction<T, T[K] | D>
export function selectChanged<T, K extends keyof T>(key: K): OperatorFunction<T, T[K] | null>
/**
 * selects a property of emitted value and only emits when changed (map>distinctUntilChanged).
 * takes an optional defaultValue when property on the original emitted value is undefined (default null)
 */
export function selectChanged<T, K extends keyof T, D = null>(
  key: K,
  defaultValue: D | null = null,
): OperatorFunction<T, T[K] | D | null> {
  return (source) => {
    return source.pipe(
      map((v: T) => (isDefined(v[key]) ? v[key] : defaultValue)),
      distinctUntilChanged(),
    )
  }
}
