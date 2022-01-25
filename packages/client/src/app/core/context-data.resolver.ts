import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { PublicDataContext } from '@c19/commons'
import { firstValueFrom } from 'rxjs'
import { DataService } from './data/data.service'

@Injectable({ providedIn: 'root' })
export class ContextDataResolver implements Resolve<PublicDataContext> {
  constructor(private readonly dataService: DataService) {}

  resolve(): Promise<PublicDataContext> {
    return firstValueFrom(this.dataService.context$)
  }
}
