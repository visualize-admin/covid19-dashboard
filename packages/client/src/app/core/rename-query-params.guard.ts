import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { QueryParams } from '../shared/models/query-params.enum'

const QP_TO_RENAME: Array<[string, QueryParams]> = [
  ['ovTime', QueryParams.TIME_FILTER],
  ['detGeo', QueryParams.GEO_FILTER],
  ['detTime', QueryParams.TIME_FILTER],
  ['detSum', QueryParams.CUMULATIVE_FILTER],
  ['detRel', QueryParams.REL_ABS_FILTER],
]

@Injectable({ providedIn: 'root' })
export class RenameQueryParamsGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const tree = this.router.parseUrl(state.url)

    const toRename = QP_TO_RENAME.filter(([oldName]) => oldName in tree.queryParams)

    return toRename.length
      ? toRename.reduce((u, [oldName, newName]) => {
          u.queryParams[newName] = u.queryParams[oldName]
          delete u.queryParams[oldName]
          return u
        }, tree)
      : true
  }
}
