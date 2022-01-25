import { ViewportScroller } from '@angular/common'
import { ErrorHandler, NgModule } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router, Scroll } from '@angular/router'
import { Credentials } from '@aws-sdk/types'
import { ClientConfig, createClientLogGroupName } from '@c19/commons'
import {
  CLOUD_WATCH_LOG_TRANSPORT_CONFIG,
  CloudWatchLogTransport,
  CloudWatchLogTransportConfig,
} from '@shiftcode/ngx-aws'
import {
  CONSOLE_LOG_TRANSPORT_CONFIG,
  ConsoleLogTransport,
  ConsoleLogTransportConfig,
  filterIfInstanceOf,
  LOG_TRANSPORTS,
  LogLevel,
  LogRequestInfoProvider,
  OriginModule,
  WindowRef,
} from '@shiftcode/ngx-core'
import { from } from 'rxjs'
import { map, pairwise, shareReplay } from 'rxjs/operators'
import baseRuntimeConfig from '../base-runtime-config.json'
import { AppComponent } from './app.component'
import { AppModule } from './app.module'
import { API_AUTH_BROWSER_PROVIDER } from './core/api-auth'
import { BagLogRequestInfoProviderService } from './core/bag-log-request-info-provider.service'
import { BASE_RUNTIME_CONFIG } from './core/base-runtime-config.token'
import { ClientConfigService } from './core/client-config.service'
import { CustomErrorHandlerService } from './core/custom-error-handler.service'
import { DPR, dprFactory } from './core/dpr.token'
import { BROWSER_REQUEST_OPTIONS_PROVIDER } from './core/request-options'

function getConsoleLoggerConfig(): ConsoleLogTransportConfig {
  return {
    logLevel: baseRuntimeConfig.productionFlag ? LogLevel.OFF : LogLevel.DEBUG,
  }
}

function createCredentials(config: ClientConfig): Credentials {
  return {
    accessKeyId: config.iamAccessKeyId,
    secretAccessKey: config.iamSecretAccessKey,
  }
}

function getCloudWatchLogConfig(clientConfig: ClientConfigService, windowRef: WindowRef): CloudWatchLogTransportConfig {
  const runsLocally = windowRef.nativeWindow?.location.host.includes('localhost') || false
  return {
    awsRegion: baseRuntimeConfig.region,
    logLevel: baseRuntimeConfig.productionFlag ? LogLevel.WARN : runsLocally ? LogLevel.OFF : LogLevel.DEBUG,
    logGroupName: createClientLogGroupName(baseRuntimeConfig.stage),
    flushInterval: 3000,
    awsCredentials$: from(clientConfig.config$).pipe(map(createCredentials), shareReplay(1)),
  }
}

@NgModule({
  imports: [AppModule, OriginModule, BrowserAnimationsModule],
  providers: [
    { provide: BASE_RUNTIME_CONFIG, useValue: baseRuntimeConfig },
    API_AUTH_BROWSER_PROVIDER,
    BROWSER_REQUEST_OPTIONS_PROVIDER,
    { provide: LogRequestInfoProvider, useClass: BagLogRequestInfoProviderService },
    { provide: CONSOLE_LOG_TRANSPORT_CONFIG, useFactory: getConsoleLoggerConfig },
    {
      provide: CLOUD_WATCH_LOG_TRANSPORT_CONFIG,
      useFactory: getCloudWatchLogConfig,
      deps: [ClientConfigService, WindowRef],
    },
    { provide: LOG_TRANSPORTS, useClass: ConsoleLogTransport, multi: true },
    { provide: LOG_TRANSPORTS, useClass: CloudWatchLogTransport, multi: true },
    { provide: ErrorHandler, useClass: CustomErrorHandlerService },
    { provide: DPR, useFactory: dprFactory, deps: [WindowRef] },
  ],
  bootstrap: [AppComponent],
})
export class AppBrowserModule {
  constructor(router: Router, viewportScroller: ViewportScroller) {
    // Scrolling after Navigation:
    // we only scroll to top when the main route is changed (eg. /de/overview -> /de/hosp-capacity)
    // but not when changing within (since we have custom scroll behavior on route change within those pages)
    router.events
      .pipe(
        filterIfInstanceOf(Scroll),
        map(
          (event) =>
            [
              event,
              event.routerEvent.urlAfterRedirects
                .replace(/\?.+$/, '') // remove QueryParams
                .replace(/;[^/]+/g, '') // remove MatrixParams
                .split('/')
                .slice(0, 3)
                .join('/'), // only the main route (/de/xyz)
            ] as const,
        ),
        pairwise(),
      )
      .subscribe(([[, prevPath], [{ position, anchor }, newPath]]) => {
        if (position) {
          // backward navigation
          setTimeout(() => viewportScroller.scrollToPosition(position))
        } else if (anchor) {
          // anchor navigation
          setTimeout(() => viewportScroller.scrollToAnchor(anchor))
        } else {
          // forward navigation
          if (prevPath !== newPath) {
            // only if path changed
            setTimeout(() => viewportScroller.scrollToPosition([0, 0]))
          }
        }
      })
  }
}
