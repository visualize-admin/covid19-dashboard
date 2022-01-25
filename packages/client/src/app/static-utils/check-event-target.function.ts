export function checkEventTargetFn(element: Element, is: boolean = false) {
  return (event: UIEvent): boolean => {
    let t: Element | null = <Element>event.target
    while (t) {
      if (t === element) {
        return is
      }
      t = t.parentElement
    }
    return !is
  }
}

export function checkEventTarget(event: UIEvent, element: Element, is: boolean = false) {
  return checkEventTargetFn(element, is)(event)
}
