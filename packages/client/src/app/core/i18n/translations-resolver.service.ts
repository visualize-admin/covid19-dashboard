import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { TranslationsLoaderService } from './translations-loader.service'
import { Translations } from './translations.type'

@Injectable({ providedIn: 'root' })
export class TranslationsResolverService implements Resolve<Translations> {
  constructor(private readonly translationsLoader: TranslationsLoaderService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Translations> {
    return this.translationsLoader.translations
  }
}
