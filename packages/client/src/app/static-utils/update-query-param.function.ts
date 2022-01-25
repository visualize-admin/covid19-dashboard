import { NavigationBehaviorOptions, Router } from '@angular/router'

export function updateQueryParamsFn(router: Router, extras: NavigationBehaviorOptions = {}) {
  return (queryParams: Record<string, string | number | boolean | null>): void => {
    const tree = router.parseUrl(router.url)
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val === null) {
        delete tree.queryParams[key]
      } else {
        tree.queryParams[key] = val
      }
    })
    tree.fragment = null
    router.navigateByUrl(tree, extras)
  }
}
