import { OverlayModule } from '@angular/cdk/overlay'
import { DOCUMENT, registerLocaleData } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import localeDE from '@angular/common/locales/de-CH'
import localeEN from '@angular/common/locales/en-CH'
import localeFR from '@angular/common/locales/fr-CH'
import localeIT from '@angular/common/locales/it-CH'
import localeRM from '@angular/common/locales/rm'
import { LOCALE_ID, NgModule, PLATFORM_ID } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule, UrlSerializer } from '@angular/router'
import { Language } from '@c19/commons'
import { TransferHttpCacheModule } from '@nguniversal/common'
import { FlyingFocusModule } from '@shiftcode/ngx-components'
import { LOCAL_STORAGE_OPTIONS, LocalStorageOptions } from '@shiftcode/ngx-core'
import { AppComponent } from './app.component'
import CustomUrlSerializer from './core/encode-url-params-safely.intercepter'
import { currentLangFactory } from './core/i18n/current-lang-factory.function'
import { CURRENT_LANG } from './core/i18n/language.token'
import { MetaService } from './core/meta/meta.service'
import { ROUTES } from './routes/routes.const'
import { NavBoardService } from './shared/components/header/nav-board/nav-board.service'

registerLocaleData(localeDE)
registerLocaleData(localeFR)
registerLocaleData(localeIT)
registerLocaleData(localeRM)
registerLocaleData(localeEN)

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'bag' }),
    TransferHttpCacheModule,
    HttpClientModule,
    OverlayModule,
    RouterModule.forRoot(ROUTES, {
      initialNavigation: 'enabled',
      anchorScrolling: 'disabled',
      scrollPositionRestoration: 'disabled',
    }),
    FlyingFocusModule,
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: CURRENT_LANG,
      useFactory: currentLangFactory,
      deps: [DOCUMENT, PLATFORM_ID],
    },
    {
      provide: LOCALE_ID,
      useFactory: (lang: Language) => {
        return lang === Language.RM ? Language.RM : `${lang}-CH`
      },
      deps: [CURRENT_LANG],
    },
    { provide: LOCAL_STORAGE_OPTIONS, useValue: <LocalStorageOptions>{ prefix: 'ls.' } },
    NavBoardService,
    {
      provide: UrlSerializer,
      useClass: CustomUrlSerializer,
    },
  ],
})
export class AppModule {
  constructor(meta: MetaService) {
    meta.setup()
  }
}
