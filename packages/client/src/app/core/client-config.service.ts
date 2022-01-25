import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { CLIENT_CONFIG_PATH, ClientConfig } from '@c19/commons'
import { firstValueFrom, ReplaySubject } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { REQUEST_OPTIONS, RequestOptions } from './request-options'

@Injectable({ providedIn: 'root' })
export class ClientConfigService {
  get config$(): Promise<ClientConfig> {
    return firstValueFrom(this.configSubject)
  }

  private readonly configSubject = new ReplaySubject<ClientConfig>(1)

  constructor(@Inject(REQUEST_OPTIONS) reqOpts: RequestOptions, httpClient: HttpClient) {
    httpClient
      .get<ClientConfig>(`/${CLIENT_CONFIG_PATH}`, reqOpts)
      .pipe(
        catchError((err) => {
          // ClientConfigService cannot use the logger since the logger needs ClientConfigService.
          // tslint:disable-next-line:no-console
          console.error('Could Not load ClientConfig', err)
          throw err
        }),
      )
      .subscribe(this.configSubject)
  }
}
