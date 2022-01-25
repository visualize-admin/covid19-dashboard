import { Injectable } from '@angular/core'
import { CloudWatchErrorHandler } from '@shiftcode/ngx-aws'

@Injectable({ providedIn: 'root' })
export class CustomErrorHandlerService extends CloudWatchErrorHandler {
  override handleError(err: any) {
    if (/ChunkLoadError/.test(err.message)) {
      window.location.reload()
      return
    }
    super.handleError(err)
  }
}
