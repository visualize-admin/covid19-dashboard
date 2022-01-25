import { FormControl } from '@angular/forms'

/**
 * returns a function which takes a value and sets this to the provided ctrl
 */
export function emitValToOwnViewFn<T>(ctrl: FormControl, emitNullIfVal: any = null): (val: T) => void {
  const emitOpts = { onlySelf: true, emitEvent: false, emitModelToViewChange: true }

  // sync a value to all controllers html elements
  return emitNullIfVal !== null
    ? (val: T) => ctrl.setValue(val === emitNullIfVal ? null : val, emitOpts)
    : (val: T) => ctrl.setValue(val, emitOpts)
}
