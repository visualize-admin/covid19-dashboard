import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { isDefined } from '@c19/commons'
import { RouteDataKey } from '../routes/route-data-key.enum'
import { QueryParams } from '../shared/models/query-params.enum'

export type QueryParamsMapping = Array<[QueryParams, string[]]>

@Injectable({ providedIn: 'root' })
export class QueryParamsGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const queryParamEnumMapping: QueryParamsMapping = route.data[RouteDataKey.QUERY_PARAMS_MAPPING]

    const paramsToRemove: string[] = (queryParamEnumMapping || [])
      .filter(([qpName, allowedValues]) => {
        const qpVal = route.queryParams[qpName]
        return isDefined(qpVal) && !allowedValues.includes(qpVal)
      })
      .map(([qpName]) => qpName)

    if (paramsToRemove.length) {
      const tree = this.router.parseUrl(state.url)
      paramsToRemove.forEach((p) => delete tree.queryParams[p])
      return tree
    }

    return true
  }
}
