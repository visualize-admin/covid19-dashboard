import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server'
import {
  CONSOLE_LOG_TRANSPORT_CONFIG,
  ConsoleLogTransportConfig,
  LOG_TRANSPORTS,
  LogLevel,
  NodeConsoleLogTransport,
} from '@shiftcode/ngx-core'
import { ORIGIN_PROVIDER, SsrHttpInterceptor } from '@shiftcode/ngx-ssr'
import * as baseRuntimeConfig from '../base-runtime-config.json'
import { AppComponent } from './app.component'
import { AppModule } from './app.module'
import { BASE_RUNTIME_CONFIG } from './core/base-runtime-config.token'
import { SERVER_REQUEST_OPTIONS_PROVIDER } from './core/request-options'

function consoleLoggerConfigFactory(): ConsoleLogTransportConfig {
  return {
    logLevel: baseRuntimeConfig.productionFlag ? LogLevel.WARN : LogLevel.DEBUG,
  }
}

@NgModule({
  imports: [AppModule, ServerModule, ServerTransferStateModule],
  providers: [
    ORIGIN_PROVIDER,
    { provide: BASE_RUNTIME_CONFIG, useValue: baseRuntimeConfig },
    SERVER_REQUEST_OPTIONS_PROVIDER,
    { provide: CONSOLE_LOG_TRANSPORT_CONFIG, useFactory: consoleLoggerConfigFactory },
    { provide: LOG_TRANSPORTS, useClass: NodeConsoleLogTransport, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SsrHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
