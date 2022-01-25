import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { QueryParams } from '../../shared/models/query-params.enum'
import { DataService } from './data.service'

@Injectable({ providedIn: 'root' })
export class DataGuard implements CanActivate {
  constructor(private readonly router: Router, private readonly dataService: DataService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const paramIsOk = await this.dataService.init(route.queryParams[QueryParams.FORCE_DATA_STATE])
    if (!paramIsOk) {
      const tree = this.router.parseUrl(state.url)
      delete tree.queryParams[QueryParams.FORCE_DATA_STATE]
      return tree
    }
    return true
  }
}
