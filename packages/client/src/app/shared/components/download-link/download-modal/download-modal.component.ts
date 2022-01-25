import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Inject, ViewEncapsulation } from '@angular/core'
import { DownloadLinkItemDirective } from '../download-link-item.directive'
import { DownloadModalRef } from '../download-modal-ref'
import { DOWNLOAD_MODAL_DATA } from './download-modal-data.token'

export interface DownloadModalData {
  fileDescription: string
  linkItems: Iterable<DownloadLinkItemDirective>
  type: 'download' | 'share' | 'dailyReport'
}

@Component({
  selector: 'bag-download-modal',
  templateUrl: './download-modal.component.html',
  styleUrls: ['./download-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadModalComponent {
  ref: DownloadModalRef

  get element() {
    return this.elementRef.nativeElement
  }

  constructor(private readonly elementRef: ElementRef, @Inject(DOWNLOAD_MODAL_DATA) readonly data: DownloadModalData) {}

  /**
   * if a link or button was clicked, close the modal
   */
  @HostListener('click', ['$event'])
  onClick(ev: MouseEvent) {
    let t: Element | null = <Element>ev.target
    while (t && t !== this.element) {
      if (t.tagName === 'A' || t.tagName === 'BUTTON') {
        this.ref.close()
        break
      }
      t = t.parentElement
    }
  }
}
