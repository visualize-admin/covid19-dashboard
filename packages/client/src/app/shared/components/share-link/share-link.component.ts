import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { WindowRef } from '@shiftcode/ngx-core'

@Component({
  selector: 'bag-share-link',
  templateUrl: './share-link.component.html',
  styleUrls: ['./share-link.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareLinkComponent {
  private static INSTANCE_COUNTER = 0

  @Input()
  set shareUrl(shareUrl: string | null) {
    if (shareUrl) {
      this.urlToShare = shareUrl
      this.linkCtrl.setValue(this.urlToShare)
    }
  }

  @Input()
  text: string

  @Input()
  title: string

  urlToShare: string

  readonly linkInputId: string
  readonly ariaDescriptionId: string

  readonly supportsSharing: boolean

  readonly linkCtrl = new FormControl({ value: this.shareUrl })

  private readonly instanceNum = ++ShareLinkComponent.INSTANCE_COUNTER

  constructor(private readonly windowRef: WindowRef) {
    this.linkInputId = `bag-share-link-input-${this.instanceNum}`
    this.ariaDescriptionId = `bag-share-link-input-label-${this.instanceNum}`
    this.supportsSharing = !!(<Window | undefined>windowRef.nativeWindow)?.navigator?.share
  }

  share() {
    this.windowRef.nativeWindow?.navigator.share({
      url: this.urlToShare,
      title: this.title,
      text: this.text,
    })
  }
}
