import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { Logger, LoggerService } from '@shiftcode/ngx-core'
import { RouteDataKey } from '../routes/route-data-key.enum'

function getActualPath(state: RouterStateSnapshot): string {
  return state.url
    .split('/')
    .map((part) => part.replace(/[?#;].+/, ''))
    .join('/')
}

@Injectable({ providedIn: 'root' })
export class RemoveQueryParamsGuard implements CanDeactivate<any> {
  private readonly logger: Logger

  constructor(loggerService: LoggerService, private readonly router: Router) {
    this.logger = loggerService.getInstance('RemoveQueryParamsGuard')
  }

  canDeactivate(
    component: any,
    route: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot,
  ): boolean | UrlTree {
    const queryParamsToRemove: string[] | null | undefined = route.data[RouteDataKey.QUERY_PARAMS_TO_REMOVE]

    if (!nextState) {
      return true
    }

    // only if path actually changes
    if (getActualPath(currentState) === getActualPath(nextState)) {
      return true
    }

    if (!queryParamsToRemove) {
      this.logger.error(
        `No RouteData found for key ${RouteDataKey.QUERY_PARAMS_TO_REMOVE} - remove guard if not needed`,
        { component: component.constructor.name },
      )
      return true
    }

    const tree = this.router.parseUrl(nextState.url)

    return queryParamsToRemove.some((p) => p in tree.queryParams)
      ? queryParamsToRemove.reduce((u, p) => {
          this.logger.debug('remove queryParam from route', { queryParam: p })
          delete u.queryParams[p]
          return u
        }, tree)
      : true
  }
}
